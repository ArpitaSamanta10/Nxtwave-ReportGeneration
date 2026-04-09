"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchFilterSort } from "@/components/student/SearchFilterSort";
import { StudentList } from "@/components/student/StudentList";
import { BatchModal } from "@/components/modals/BatchModal";
import { StudentModal } from "@/components/modals/StudentModal";
import { ImportModal } from "@/components/modals/ImportModal";
import { RemarksModal } from "@/components/modals/RemarksModal";
import { ReportModal } from "@/components/modals/ReportModal";
import { CreateReportModal } from "@/components/modals/CreateReportModal";
import type { Batch, Student, RemarksCategory } from "@/components/types";
import type { GeneratedReport } from "@/lib/reportGenerator";
import {
  createBatch,
  fetchBatches,
  deleteBatch,
  createStudent,
  createBulkStudents,
  fetchStudents,
  deleteStudent,
  saveCompleteEvaluation,
  fetchStudentsWithEvaluations,
  createBulkEvaluations,
} from "@/lib/database";
import { withAdminGuard } from "@/lib/roleGuard";

function AdminDashboard() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tools State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<RemarksCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"name" | "performance" | "lastUpdated">("name");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Modals State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchName, setBatchName] = useState("");

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({
    id: "",
    name: "",
    email: "",
    category: "" as RemarksCategory,
    batchId: "",
  });

  const [showImportModal, setShowImportModal] = useState(false);
  const [importBatchId, setImportBatchId] = useState("");

  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [remarksCategory, setRemarksCategory] = useState<RemarksCategory>("");
  const [remarksForm, setRemarksForm] = useState<any>({});

  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSending, setReportSending] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);
  const [isGeneratingAllReports, setIsGeneratingAllReports] = useState(false);

  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Supabase Data Loading ===
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        console.log("📥 Loading batches and students from Supabase...");
        
        // Fetch batches from Supabase
        let fetchedBatches = [];
        try {
          fetchedBatches = await fetchBatches();
          console.log("✅ Batches loaded:", fetchedBatches.length);
        } catch (batchError) {
          console.error("❌ Error fetching batches:", batchError);
          throw batchError;
        }

        const formattedBatches: Batch[] = fetchedBatches.map((b: any) => ({
          id: b.id,
          name: b.batch_name,
          createdAt: b.created_at,
        }));
        setBatches(formattedBatches);

        // Fetch students with their evaluations from Supabase
        let fetchedStudents = [];
        try {
          fetchedStudents = await fetchStudentsWithEvaluations();
          console.log("✅ Students loaded:", fetchedStudents.length);
        } catch (studentError) {
          console.error("❌ Error fetching students:", studentError);
          throw studentError;
        }

        setStudents(fetchedStudents as Student[]);
      } catch (error) {
        console.error("❌ Error loading data from Supabase:", error);
        // Fall back to localStorage if Supabase fails
        const savedBatches = localStorage.getItem("student_portal_batches");
        const savedStudents = localStorage.getItem("student_portal_students");
        if (savedBatches) {
          console.log("📦 Using cached batches from localStorage");
          setBatches(JSON.parse(savedBatches));
        }
        if (savedStudents) {
          console.log("📦 Using cached students from localStorage");
          setStudents(JSON.parse(savedStudents));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Run only once on mount

  // Save batches to localStorage as backup
  useEffect(() => {
    localStorage.setItem("student_portal_batches", JSON.stringify(batches));
  }, [batches]);

  // Save students to localStorage as backup
  useEffect(() => {
    localStorage.setItem("student_portal_students", JSON.stringify(students));
  }, [students]);

  // --- Handlers: Batches ---
  const handleCreateBatch = async () => {
    if (!batchName.trim()) return;
    try {
      const newBatchData = await createBatch(batchName);
      const newBatch: Batch = {
        id: newBatchData.id,
        name: newBatchData.batch_name,
        createdAt: newBatchData.created_at,
      };
      setBatches([...batches, newBatch]);
      setBatchName("");
      setShowBatchModal(false);
    } catch (error) {
      console.error("Error creating batch:", error);
      alert("Failed to create batch. Please try again.");
    }
  };

  const handleDeleteBatch = async (id: string) => {
    try {
      await deleteBatch(id);
      setBatches(batches.filter((b) => b.id !== id));
      setStudents(students.filter((s) => s.batchId !== id));
      if (activeBatch?.id === id) {
        setActiveBatch(null);
        setSelectedStudentIds(new Set());
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("Failed to delete batch. Please try again.");
    }
  };

  // --- Handlers: Students ---
  const handleAddStudentManual = async () => {
    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.batchId) {
      alert("Please fill in all required fields, including selecting a batch.");
      return;
    }
    try {
      const newStudent: Student = {
        id: studentForm.id.trim() || uuidv4(),
        name: studentForm.name,
        email: studentForm.email,
        batchId: studentForm.batchId,
        category: studentForm.category,
        remarksDetails: null,
        updatedAt: new Date().toISOString(),
      };
      
      // Save to Supabase
      await createStudent(newStudent);
      
      // If student has a category, create an evaluation for them
      if (studentForm.category && ["Good", "Above Average", "Average", "Poor"].includes(studentForm.category)) {
        await createBulkEvaluations([newStudent]);
      }
      
      // Reload students to get updated category/evaluation data
      const updatedStudents = await fetchStudentsWithEvaluations(studentForm.batchId);
      setStudents((prev) => {
        // Combine with existing students from other batches
        const otherBatchStudents = prev.filter((s) => s.batchId !== studentForm.batchId);
        return [...otherBatchStudents, ...updatedStudents];
      });

      setStudentForm({
        id: "",
        name: "",
        email: "",
        category: "" as RemarksCategory,
        batchId: "",
      });
      setShowStudentModal(false);
      alert("Student added successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error adding student:", errorMessage);
      alert(`Failed to add student: ${errorMessage}`);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent(id);
      setStudents(students.filter((s) => s.id !== id));
      const newSelected = new Set(selectedStudentIds);
      newSelected.delete(id);
      setSelectedStudentIds(newSelected);
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  const handleBulkDelete = () => {
    if (selectedStudentIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedStudentIds.size} student(s)?`)) {
      setStudents(students.filter((s) => !selectedStudentIds.has(s.id)));
      setSelectedStudentIds(new Set());
    }
  };

  // --- Handlers: Checkboxes ---
  const toggleStudentSelection = (id: string) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudentIds(newSelected);
  };

  const toggleSelectAll = (filteredActiveStudents: Student[]) => {
    if (selectedStudentIds.size === filteredActiveStudents.length && filteredActiveStudents.length > 0) {
      setSelectedStudentIds(new Set());
    } else {
      const newSelected = new Set(filteredActiveStudents.map((s) => s.id));
      setSelectedStudentIds(newSelected);
    }
  };

  // --- Handlers: File Import ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!importBatchId) {
      alert("Please select a batch first!");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data: any[] = XLSX.utils.sheet_to_json(ws);

          const importedStudents: Student[] = data.map((row) => {
            // Handle various column name formats
            const id =
              row["Student ID"] ||
              row.id ||
              row.ID ||
              row.Id ||
              uuidv4();
            const name =
              row["Full Name"] ||
              row.name ||
              row.Name ||
              "Unknown";
            const email =
              row.Email ||
              row.email ||
              row.gmail ||
              row.Gmail ||
              "";
            const category =
              row.Category || row.category || "";

            return {
              id: String(id),
              name: String(name),
              email: String(email),
              batchId: importBatchId,
              category: ["Good", "Above Average", "Average", "Poor"].includes(category)
                ? category
                : "",
              remarksDetails: null,
              updatedAt: new Date().toISOString(),
            };
          });

          // Save to Supabase
          const result = await createBulkStudents(importedStudents);

          // Create evaluations for students that have categories
          const evalResult = await createBulkEvaluations(importedStudents);
          console.log("Evaluations created:", evalResult.created);

          // Reload students from database to get updated categories/evaluations
          const updatedStudents = await fetchStudentsWithEvaluations(importBatchId);
          setStudents((prev) => {
            // Combine with existing students from other batches
            const otherBatchStudents = prev.filter((s) => s.batchId !== importBatchId);
            return [...otherBatchStudents, ...updatedStudents];
          });

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setShowImportModal(false);

          // Show detailed results
          let message = `Import completed:\n`;
          message += `✅ Successfully imported: ${result.results.successful}\n`;
          if (evalResult.created > 0)
            message += `✅ Categories assigned: ${evalResult.created}\n`;
          if (result.results.duplicates > 0)
            message += `⚠️ Duplicates skipped: ${result.results.duplicates}\n`;
          if (result.results.failed > 0)
            message += `❌ Failed: ${result.results.failed}`;

          alert(message);
        } catch (error) {
          console.error("Error importing students:", error);
          alert(
            `Failed to import students: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Only CSV or Excel files supported currently.");
    }
  };

  // --- Handlers: Remarks ---
  const handleOpenRemarks = (student: Student) => {
    console.log("Opening remarks for student:", student);
    setSelectedStudent(student);
    setRemarksCategory(student.category || "Good");

    let initialRemarks = student.remarksDetails || {};

    // If remarks details already exist from database, use them as-is
    if (student.remarksDetails && Object.keys(student.remarksDetails).length > 0) {
      console.log("Loading existing remarks:", initialRemarks);
      setRemarksForm(initialRemarks);
      setShowRemarksModal(true);
      return;
    }

    // Otherwise, initialize empty form based on category
    const category = student.category || "Good";
    console.log("Initializing empty form for category:", category);

    if (category === "Good" || !category) {
      initialRemarks = {
        mockScores: [],
        calculatedAverage: 0,
        interviewOutcome: "",
        mentorNote: "",
        changesRequired: false,
        projectRemarks: "",
        actionItems: [""],
        roleProjection: "",
        customRole: "",
        tierProjection: "",
        customTier: "",
        projectionJustification: "",
      };
    } else if (category === "Above Average") {
      initialRemarks = {
        mockScores: [],
        calculatedAverage: 0,
        scoreTrends: [],
        attendanceLog: [],
        mentorObservations: [],
        gapAnalysis: [],
        placementTimeline: [],
      };
    } else if (category === "Average") {
      initialRemarks = {
        checkpointScores: [0, 0, 0, 0],
        dailyPractice: 0,
        workshopAttendance: 0,
        readiness: "",
      };
    } else if (category === "Poor") {
      initialRemarks = {
        progress: 0,
        submissionStats: "",
        buddyNotes: "",
        remedialScores: [0, 0, 0],
      };
    }

    setRemarksForm(initialRemarks);
    setShowRemarksModal(true);
  };

  const handleUpdateGoodMockScore = (index: number, val: string) => {
    const newScores = [...(remarksForm.mockScores || [])];
    newScores[index] = val;
    const validScores = newScores.map((s) => parseFloat(s)).filter((s) => !isNaN(s));
    let avg = 0;
    if (validScores.length > 0) {
      avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    }
    setRemarksForm({
      ...remarksForm,
      mockScores: newScores,
      calculatedAverage: avg.toFixed(2),
    });
  };

  const handleAddActionItem = () => {
    setRemarksForm({
      ...remarksForm,
      actionItems: [...(remarksForm.actionItems || []), ""],
    });
  };

  const handleUpdateActionItem = (index: number, val: string) => {
    const newItems = [...(remarksForm.actionItems || [])];
    newItems[index] = val;
    setRemarksForm({ ...remarksForm, actionItems: newItems });
  };

  // === Above Average Category Handlers ===

  const handleUpdateAboveAvgMockScore = (index: number, val: string) => {
    const newScores = [...(remarksForm.mockScores || [])];
    newScores[index] = Math.min(100, Math.max(0, Number(val) || 0)).toString();
    const validScores = newScores.map((s) => parseFloat(s)).filter((s) => !isNaN(s));
    const avg =
      validScores.length > 0
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
        : 0;
    setRemarksForm({ ...remarksForm, mockScores: newScores, calculatedAverage: avg });
  };

  const handleAddAboveAvgMockScore = () => {
    setRemarksForm({
      ...remarksForm,
      mockScores: [...(remarksForm.mockScores || []), ""],
    });
  };

  const handleAddScoreTrend = () => {
    setRemarksForm({
      ...remarksForm,
      scoreTrends: [
        ...(remarksForm.scoreTrends || []),
        { topic: "", current: 0, previous: 0, change: 0 },
      ],
    });
  };

  const handleUpdateScoreTrend = (index: number, field: string, val: any) => {
    const newTrends = [...(remarksForm.scoreTrends || [])];
    newTrends[index] = { ...newTrends[index], [field]: val };
    if (field === "current" || field === "previous") {
      newTrends[index].change = newTrends[index].current - newTrends[index].previous;
    }
    setRemarksForm({ ...remarksForm, scoreTrends: newTrends });
  };

  const handleCheckInAttendance = () => {
    const today = new Date().toISOString().split("T")[0];
    const newLog = [
      ...(remarksForm.attendanceLog || []),
      { date: today, status: "completed", confidenceLevel: 3, note: "" },
    ];
    setRemarksForm({ ...remarksForm, attendanceLog: newLog });
  };

  const handleUpdateAttendanceLog = (index: number, field: string, val: any) => {
    const newLog = [...(remarksForm.attendanceLog || [])];
    newLog[index] = { ...newLog[index], [field]: val };
    setRemarksForm({ ...remarksForm, attendanceLog: newLog });
  };

  const handleAddMentorObservation = () => {
    const today = new Date().toISOString().split("T")[0];
    setRemarksForm({
      ...remarksForm,
      mentorObservations: [
        ...(remarksForm.mentorObservations || []),
        { date: today, status: "On Track", feedback: "", nextSteps: [] },
      ],
    });
  };

  const handleUpdateMentorObservation = (index: number, field: string, val: any) => {
    const newObs = [...(remarksForm.mentorObservations || [])];
    newObs[index] = { ...newObs[index], [field]: val };
    setRemarksForm({ ...remarksForm, mentorObservations: newObs });
  };

  const handleAddGapAnalysis = () => {
    setRemarksForm({
      ...remarksForm,
      gapAnalysis: [
        ...(remarksForm.gapAnalysis || []),
        { topic: "", difficulty: "Medium", gapType: "Concept Gap", customGapType: "" },
      ],
    });
  };

  const handleUpdateGapAnalysis = (index: number, field: string, val: string) => {
    const newGaps = [...(remarksForm.gapAnalysis || [])];
    newGaps[index] = { ...newGaps[index], [field]: val };
    setRemarksForm({ ...remarksForm, gapAnalysis: newGaps });
  };

  const handleRemoveGapAnalysis = (index: number) => {
    const newGaps = remarksForm.gapAnalysis.filter((_: any, idx: number) => idx !== index);
    setRemarksForm({ ...remarksForm, gapAnalysis: newGaps });
  };

  const handleAddPlacementWeek = () => {
    const weeks = remarksForm.placementTimeline || [];
    const lastWeek = weeks.length > 0 ? Math.max(...weeks.map((w: any) => w.week || 0)) : 0;
    setRemarksForm({
      ...remarksForm,
      placementTimeline: [...weeks, { week: lastWeek + 1, status: "Improving", remarks: "" }],
    });
  };

  const handleUpdatePlacementWeek = (index: number, field: string, val: any) => {
    if (field === "_delete") {
      setRemarksForm({ ...remarksForm, placementTimeline: val });
      return;
    }
    const newTimeline = [...(remarksForm.placementTimeline || [])];
    newTimeline[index] = { ...newTimeline[index], [field]: val };
    setRemarksForm({ ...remarksForm, placementTimeline: newTimeline });
  };

  const handleSaveRemarks = async () => {
    if (!selectedStudent) return;
    try {
      console.log("Saving remarks for student:", selectedStudent.id, "Category:", remarksCategory, "Data:", remarksForm);
      
      // Save to Supabase
      await saveCompleteEvaluation(
        selectedStudent.id,
        remarksCategory,
        remarksForm
      );

      // Update local state
      const updatedStudents = students.map((s) => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            category: remarksCategory,
            remarksDetails: remarksForm,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      });
      setStudents(updatedStudents);
      setShowRemarksModal(false);
      alert("Remarks saved successfully!");
    } catch (error) {
      const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error saving remarks:", errorDetail);
      alert(`Failed to save remarks: ${errorDetail}`);
    }
  };

  // --- Report Generation Handlers ---
  const handleViewReport = async (student: Student) => {
    try {
      console.log("Generating report for:", student.name);
      setReportLoading(true);
      setCurrentReport(null);
      setShowReportModal(true);

      if (!student.id || !student.name || !student.email) {
        throw new Error("Student data incomplete: missing id, name, or email");
      }

      // Send COMPLETE remarks data, not just category
      const payload = {
        studentId: student.id,
        remarksCategory: student.category || "Good",
        remarksDetails: student.remarksDetails || {}, // Send all remarks data!
        studentName: student.name,
        studentEmail: student.email,
      };

      console.log("Sending to API:", payload);

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("API Response Status:", response.status);

      const responseText = await response.text();
      console.log("Raw Response:", responseText);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = { 
            rawResponse: responseText,
            parseError: parseError instanceof Error ? parseError.message : String(parseError)
          };
        }

        const errorMessage = errorData?.error || errorData?.details || errorData?.message || responseText || `API error: ${response.status}`;
        
        console.error("API ERROR Details:", {
          status: response.status,
          error: errorData,
          errorMessage,
          responseText,
        });

        throw new Error(errorMessage);
      }

      const report = JSON.parse(responseText);
      console.log("Report generated successfully:", report);
      setCurrentReport(report);
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert("Failed to generate report: " + errorMsg);
      setShowReportModal(false);
    } finally {
      setReportLoading(false);
    }
  };

  const handleSaveReport = async (report: GeneratedReport) => {
    try {
      setReportSaving(true);
      setReportSaved(false);

      // Combine report sections into a single string
      const fullReport = `
## What Went Well
${report.whatWentWell}

## Gaps
${report.gaps}

## Next Steps
${report.nextSteps}

## Projections
${report.projections}
`.trim();

      const response = await fetch("/api/save-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: report.studentId,
          reportContent: fullReport,
        }),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("Failed to parse save-report error response:", parseError);
          const responseText = await response.text();
          errorData = { rawResponse: responseText };
        }
        const errorMessage = errorData?.error || errorData?.details || errorData?.message || "Failed to save report";
        console.error("Save report API error:", { status: response.status, error: errorData });
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Report saved successfully:", result);
      setReportSaved(true);

      // Keep the saved status for 2 seconds
      setTimeout(() => {
        setReportSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving report:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert("Failed to save report: " + errorMsg);
    } finally {
      setReportSaving(false);
    }
  };

  // --- Filter and Sort Logic ---
  const categoryRank: Record<string, number> = {
    Good: 4,
    "Above Average": 3,
    Average: 2,
    Poor: 1,
    "": 0,
  };

  const activeStudents = useMemo(() => {
    return activeBatch ? students.filter((s) => s.batchId === activeBatch.id) : students;
  }, [students, activeBatch]);

  const filteredAndSortedStudents = useMemo(() => {
    let result = activeStudents.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchesCategory =
        filterCategory === "All" ? true : s.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "performance") {
        return (categoryRank[b.category || ""] || 0) - (categoryRank[a.category || ""] || 0);
      } else if (sortBy === "lastUpdated") {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      return 0;
    });

    return result;
  }, [activeStudents, searchQuery, filterCategory, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredAndSortedStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1);
    callback();
  };

  // --- Handler: Create Report ---
  const handleCreateReport = async (
    studentId: string,
    title: string,
    content: string
  ) => {
    try {
      setIsCreatingReport(true);

      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.from("reports").insert({
        student_id: studentId,
        title,
        content,
        generated_by: "admin@nxtwave.co.in",
      });

      if (error) {
        console.error("❌ Error creating report:", error);
        throw new Error(error.message || "Failed to create report");
      }

      console.log("✅ Report created successfully:", data);

      // Show success toast (if you have a toast system)
      alert("✅ Report created successfully!");

      // Close modal
      setShowCreateReportModal(false);
    } catch (error) {
      console.error("❌ Error creating report:", error);
      throw error;
    } finally {
      setIsCreatingReport(false);
    }
  };

  // --- Handler: Generate All Reports ---
  const handleGenerateAllReports = async () => {
    if (filteredAndSortedStudents.length === 0) {
      alert("❌ No students to generate reports for");
      return;
    }

    if (!confirm(`Generate and send reports for ${filteredAndSortedStudents.length} student(s)?`)) {
      return;
    }

    try {
      console.log("📄 Generating reports for", filteredAndSortedStudents.length, "students");
      setIsGeneratingAllReports(true);
      
      const response = await fetch("/api/generate-reports-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: filteredAndSortedStudents }),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("Failed to parse batch error response:", parseError);
          const responseText = await response.text();
          errorData = { rawResponse: responseText };
        }
        const errorMessage = errorData?.error || errorData?.details || errorData?.message || `API error: ${response.status}`;
        console.error("❌ Batch API error:", { status: response.status, error: errorData, errorMessage });
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Batch generation successful:", result);
      alert(
        `✅ Generated ${result.reportsGenerated} report(s)\n\nReports have been sent to recipients. Check your email notifications.`
      );
    } catch (error) {
      console.error("❌ Error generating all reports:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`❌ Failed to generate reports: ${errorMsg}`);
    } finally {
      setIsGeneratingAllReports(false);
    }
  };

  // --- Handler: Send Report Email ---
  const handleSendReportEmail = async (report: GeneratedReport) => {
    try {
      // Check if webhook URL is configured
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        console.warn("⚠️ N8N_WEBHOOK_URL not configured - email will not be sent");
        alert("⚠️ Email webhook not configured. Report generated but email not sent. Contact admin.");
        return;
      }

      setReportSending(true);

      console.log("📧 Sending report to:", webhookUrl);
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: report.studentEmail,
          studentName: report.studentName,
          tier: report.tier,
          report: {
            whatWentWell: report.whatWentWell,
            gaps: report.gaps,
          },
          generatedAt: report.generatedAt,
        }),
      });

      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error("Failed to parse webhook error response:", parseError);
        const responseText = await response.text();
        errorData = { rawResponse: responseText };
      }

      if (!response.ok) {
        const errorMessage = errorData?.error || errorData?.details || errorData?.message || response.statusText || "Webhook failed";
        console.error("❌ Webhook response error:", { status: response.status, statusText: response.statusText, error: errorData });
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      console.log("✅ Report sent successfully to", report.studentEmail);
      alert(`✅ Report sent to ${report.studentEmail}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`❌ Failed to send email: ${errorMsg}`);
    } finally {
      setReportSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          batches={batches}
          activeBatch={activeBatch}
          onBatchSelect={setActiveBatch}
          onBatchCreate={() => setShowBatchModal(true)}
          onBatchDelete={handleDeleteBatch}
          onAddStudentClick={() => setShowStudentModal(true)}
          onImportClick={() => setShowImportModal(true)}
          onCreateReportClick={() => setShowCreateReportModal(true)}
        />

        <main className="w-3/4 p-8 overflow-y-auto bg-slate-50/50">
          <div className="flex flex-col h-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {activeBatch ? activeBatch.name : "All Students"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredAndSortedStudents.length} student(s) found
                  {selectedStudentIds.size > 0
                    ? ` • ${selectedStudentIds.size} selected`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateAllReports}
                  disabled={isGeneratingAllReports}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAllReports ? "Generating..." : "📄 Generate Reports for All"}
                </button>
                {selectedStudentIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Delete ({selectedStudentIds.size})
                  </button>
                )}
              </div>
            </div>

            <SearchFilterSort
              searchQuery={searchQuery}
              onSearchChange={(query) => handleFilterChange(() => setSearchQuery(query))}
              filterCategory={filterCategory}
              onFilterChange={(category) => handleFilterChange(() => setFilterCategory(category))}
              sortBy={sortBy}
              onSortChange={(sort) => handleFilterChange(() => setSortBy(sort))}
            />

            <StudentList
              students={paginatedStudents}
              totalStudents={filteredAndSortedStudents.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedStudentIds={selectedStudentIds}
              onSelectAll={() => toggleSelectAll(paginatedStudents)}
              onToggleSelect={toggleStudentSelection}
              onOpenRemarks={handleOpenRemarks}
              onViewReport={handleViewReport}
              onDelete={handleDeleteStudent}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <BatchModal
        isOpen={showBatchModal}
        batchName={batchName}
        onBatchNameChange={setBatchName}
        onCreate={handleCreateBatch}
        onClose={() => setShowBatchModal(false)}
      />

      <StudentModal
        isOpen={showStudentModal}
        batches={batches}
        studentForm={studentForm}
        onFormChange={setStudentForm}
        onAdd={handleAddStudentManual}
        onClose={() => setShowStudentModal(false)}
      />

      <ImportModal
        isOpen={showImportModal}
        batches={batches}
        importBatchId={importBatchId}
        onBatchChange={setImportBatchId}
        onFileSelect={() => fileInputRef.current?.click()}
        onClose={() => setShowImportModal(false)}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".csv, .xlsx"
      />

      <RemarksModal
        isOpen={showRemarksModal}
        selectedStudent={selectedStudent}
        remarksCategory={remarksCategory}
        remarksForm={remarksForm}
        batches={batches}
        onCategoryChange={setRemarksCategory}
        onFormUpdate={(field, val) => setRemarksForm({ ...remarksForm, [field]: val })}
        onAddMockScore={handleAddAboveAvgMockScore}
        onUpdateMockScore={handleUpdateGoodMockScore}
        onAddActionItem={handleAddActionItem}
        onUpdateActionItem={handleUpdateActionItem}
        onAddAboveAvgMockScore={handleAddAboveAvgMockScore}
        onUpdateAboveAvgMockScore={handleUpdateAboveAvgMockScore}
        onAddScoreTrend={handleAddScoreTrend}
        onUpdateScoreTrend={handleUpdateScoreTrend}
        onCheckInAttendance={handleCheckInAttendance}
        onUpdateAttendanceLog={handleUpdateAttendanceLog}
        onAddMentorObservation={handleAddMentorObservation}
        onUpdateMentorObservation={handleUpdateMentorObservation}
        onAddGapAnalysis={handleAddGapAnalysis}
        onUpdateGapAnalysis={handleUpdateGapAnalysis}
        onRemoveGapAnalysis={handleRemoveGapAnalysis}
        onAddPlacementWeek={handleAddPlacementWeek}
        onUpdatePlacementWeek={handleUpdatePlacementWeek}
        onSave={handleSaveRemarks}
        onClose={() => setShowRemarksModal(false)}
      />

      <ReportModal
        isOpen={showReportModal}
        report={currentReport}
        isLoading={reportLoading}
        isSending={reportSending}
        isSaving={reportSaving}
        isSaved={reportSaved}
        onClose={() => {
          setShowReportModal(false);
          setReportSaved(false);
        }}
        onSendEmail={handleSendReportEmail}
        onSave={handleSaveReport}
      />

      <CreateReportModal
        isOpen={showCreateReportModal}
        onClose={() => setShowCreateReportModal(false)}
        students={students}
        onCreateReport={handleCreateReport}
        isLoading={isCreatingReport}
      />
    </div>
  );
}

export default withAdminGuard(AdminDashboard);
