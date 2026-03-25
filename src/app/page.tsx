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
import type { Batch, Student, RemarksCategory } from "@/components/types";
import {
  createBatch,
  fetchBatches,
  deleteBatch,
  createStudent,
  createBulkStudents,
  fetchStudents,
  deleteStudent,
  saveCompleteEvaluation,
} from "@/lib/database";

export default function App() {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Supabase Data Loading ===
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch batches from Supabase
        const fetchedBatches = await fetchBatches();
        const formattedBatches: Batch[] = fetchedBatches.map((b: any) => ({
          id: b.id,
          name: b.batch_name,
          createdAt: b.created_at,
        }));
        setBatches(formattedBatches);

        // Fetch students from Supabase
        const fetchedStudents = await fetchStudents();
        const formattedStudents: Student[] = fetchedStudents.map((s: any) => ({
          id: s.id,
          name: s.full_name,
          email: s.email,
          batchId: s.batch_id,
          category: "" as RemarksCategory,
          remarksDetails: null,
          updatedAt: s.created_at,
        }));
        setStudents(formattedStudents);
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
        // Fall back to localStorage if Supabase fails
        const savedBatches = localStorage.getItem("student_portal_batches");
        const savedStudents = localStorage.getItem("student_portal_students");
        if (savedBatches) setBatches(JSON.parse(savedBatches));
        if (savedStudents) setStudents(JSON.parse(savedStudents));
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
      
      setStudents([...students, newStudent]);
      setStudentForm({
        id: "",
        name: "",
        email: "",
        category: "" as RemarksCategory,
        batchId: "",
      });
      setShowStudentModal(false);
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please try again.");
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
          await createBulkStudents(importedStudents);

          setStudents((prev) => [...prev, ...importedStudents]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setShowImportModal(false);
          alert(`Successfully imported ${importedStudents.length} students!`);
        } catch (error) {
          console.error("Error importing students:", error);
          alert("Failed to import students. Please try again.");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Only CSV or Excel files supported currently.");
    }
  };

  // --- Handlers: Remarks ---
  const handleOpenRemarks = (student: Student) => {
    setSelectedStudent(student);
    setRemarksCategory(student.category || "Good");

    let initialRemarks = student.remarksDetails || {};
    if ((student.category === "Good" || !student.category) && Object.keys(initialRemarks).length === 0) {
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
    }

    if (student.category === "Above Average" && Object.keys(initialRemarks).length === 0) {
      initialRemarks = {
        mockScores: [],
        calculatedAverage: 0,
        scoreTrends: [],
        attendanceLog: [],
        mentorObservations: [],
        gapAnalysis: [],
        placementTimeline: [],
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
      console.error("Error saving remarks:", error);
      alert("Failed to save remarks. Please try again.");
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
    </div>
  );
}
