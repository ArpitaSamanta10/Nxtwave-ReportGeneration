"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSession, getUserRole, logoutUser } from "@/lib/auth";
import { withStudentGuard } from "@/lib/roleGuard";

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  batch_id: string;
  remarks?: string;
  report?: string;
  lastGeneratedAt?: string;
  category?: "Good" | "Above Average" | "Average" | "Poor" | null;
  remarksDetails?: any;
}

interface Report {
  id: string;
  title: string;
  content: string;
  generated_by: string;
  created_at: string;
  updated_at: string;
}

function StudentDashboard() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Load student data when component mounts
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check if user is authenticated and has student role
        const session = await getSession();
        if (!session) {
          // Not logged in - redirect to student login
          router.push("/student/login");
          return;
        }

        const role = await getUserRole();
        if (role !== "student") {
          // Not student - redirect to admin dashboard
          router.push("/admin/dashboard");
          return;
        }

        // Get current user ID and email
        const user = session.user;
        if (!user?.id || !user?.email) {
          router.push("/student/login");
          return;
        }

        // Save user ID for display
        setUserId(user.id);

        // Load student profile and reports
        await loadStudentProfile(user.email);
        await loadStudentReports(user.id);
      } catch (error) {
        console.error("Initialization error:", error);
        router.push("/student/login");
      }
    };

    initializePage();
  }, []);

  // Fetch student profile by email WITH evaluations
  const loadStudentProfile = async (email: string) => {
    try {
      console.log("📥 Loading student profile for email:", email);

      // Step 1: Fetch student basic info
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .single();

      if (studentError || !studentData) {
        console.error("❌ Student not found:", studentError);
        throw new Error("Student profile not found");
      }

      console.log("✅ Student data loaded:", studentData);

      // Step 2: Fetch evaluations for this student
      let category = null;
      let remarksText = "";
      let remarksDetails = {};

      try {
        const { data: evaluations, error: evalError } = await supabase
          .from("evaluations")
          .select("*")
          .eq("student_id", studentData.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (evalError) {
          console.warn("⚠️ Error loading evaluations:", evalError);
        } else if (evaluations && evaluations.length > 0) {
          const latestEval = evaluations[0];
          console.log("✅ Evaluation loaded:", latestEval);

          category = latestEval.category;
          remarksText = latestEval.remarks || "";
          remarksDetails = latestEval.remarks_details || {};

          console.log("✅ Remarks and category loaded:", {
            category,
            remarks: remarksText.substring(0, 50) + "...",
          });
        }
      } catch (evalError) {
        console.warn("⚠️ Error fetching evaluations (non-critical):", evalError);
      }

      // Step 3: Map all data to StudentProfile
      const profileData: StudentProfile = {
        id: studentData.id,
        full_name: studentData.full_name || studentData.name || "N/A",
        email: studentData.email,
        batch_id: studentData.batch_id,
        remarks: remarksText,
        report: studentData.report,
        lastGeneratedAt: studentData.updated_at,
        category: category,
        remarksDetails: remarksDetails,
      };

      console.log("✅ Complete student profile loaded:", profileData);
      setStudent(profileData);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("❌ Error loading profile:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student reports using auth.uid() via RLS
  const loadStudentReports = async (userId: string) => {
    try {
      setReportsLoading(true);
      console.log("📥 Loading reports for user:", userId);

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error loading reports:", {
          code: error.code,
          message: error.message,
        });
        throw new Error(`Failed to load reports: ${error.message}`);
      }

      console.log("✅ Reports loaded:", data);
      setReports(data || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("❌ Error loading reports:", errorMsg);
    } finally {
      setReportsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/student/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );

  if (!student)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Student profile not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Information Overview Table */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900">Your Information</h2>
            <p className="text-sm text-gray-600 mt-1">Complete overview of your profile and status</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {/* ID Row */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 w-32">Student ID</td>
                  <td className="px-6 py-4 text-gray-900">
                    <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">{student.id}</code>
                  </td>
                </tr>

                {/* Name Row */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700">Full Name</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{student.full_name}</td>
                </tr>

                {/* Email Row */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700">Email</td>
                  <td className="px-6 py-4 text-gray-900">{student.email}</td>
                </tr>

                {/* Batch Row */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700">Batch</td>
                  <td className="px-6 py-4 text-gray-900">{student.batch_id || "N/A"}</td>
                </tr>

                {/* Category Row */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700">Performance Category</td>
                  <td className="px-6 py-4">
                    {student.category ? (
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        student.category === "Good" ? "bg-green-100 text-green-800" :
                        student.category === "Above Average" ? "bg-blue-100 text-blue-800" :
                        student.category === "Average" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {student.category}
                      </span>
                    ) : (
                      <span className="text-gray-600">Not assigned yet</span>
                    )}
                  </td>
                </tr>

                {/* Remarks Summary Row */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700">Remarks Status</td>
                  <td className="px-6 py-4">
                    {student.remarks ? (
                      <span className="inline-flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-gray-900">Remarks updated</span>
                        <span className="text-xs text-gray-600 ml-2">
                          ({new Date(student.lastGeneratedAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })})
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-gray-900">Pending</span>
                      </span>
                    )}
                  </td>
                </tr>

                {/* Reports Row */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700">Reports Generated</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {reports.length} Report{reports.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold">Name:</span> {student.full_name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {student.email}
              </p>
              <p>
                <span className="font-semibold">UID (User ID):</span> 
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm font-mono">{userId}</code>
              </p>
            </div>

            {/* Right Column */}
            <div className="space-y-3 text-gray-700">
              {student.batch_id && (
                <p>
                  <span className="font-semibold">Batch:</span> {student.batch_id}
                </p>
              )}
              {student.category && (
                <p>
                  <span className="font-semibold">Performance Category:</span> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    student.category === "Good" ? "bg-green-100 text-green-800" :
                    student.category === "Above Average" ? "bg-blue-100 text-blue-800" :
                    student.category === "Average" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {student.category}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Remarks Card (Read-only) */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Remarks & Feedback</h2>

          {student.remarks ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-800 whitespace-pre-wrap">{student.remarks}</p>
              {student.lastGeneratedAt && (
                <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-blue-200">
                  Last updated: {new Date(student.lastGeneratedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-semibold">No remarks yet</p>
              <p className="text-yellow-700 text-sm mt-1">Your mentor will add feedback here soon. Check back later!</p>
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Reports</h2>
            {reports.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {reports.length} Mock{reports.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {reportsLoading ? (
            <div className="p-4 text-center text-gray-600">Loading reports...</div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div 
                  key={report.id} 
                  className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition"
                >
                  {/* Header with Mock Attempt Number */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {reports.length - index}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">Mock Attempt #{reports.length - index}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 font-medium">
                      {new Date(report.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Report Content */}
                  <div className="ml-11 p-4 bg-white rounded border border-gray-200 mb-3">
                    <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                      {report.content}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="ml-11 flex justify-between items-center text-xs text-gray-600">
                    <span>Generated by: <span className="font-semibold">{report.generated_by}</span></span>
                    <span>Report ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{report.id.slice(0, 8)}...</code></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
              <p className="text-yellow-800 font-semibold mb-1">No reports yet</p>
              <p className="text-yellow-700 text-sm">Your reports will appear here once the admin creates them</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withStudentGuard(StudentDashboard);
