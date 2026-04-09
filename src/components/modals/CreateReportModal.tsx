"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Student } from "@/components/types";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onCreateReport: (studentId: string, title: string, content: string) => Promise<void>;
  isLoading: boolean;
}

export function CreateReportModal({
  isOpen,
  onClose,
  students,
  onCreateReport,
  isLoading,
}: CreateReportModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedStudentId) {
      setError("Please select a student");
      return;
    }

    if (!reportTitle.trim()) {
      setError("Please enter a report title");
      return;
    }

    if (!reportContent.trim()) {
      setError("Please enter report content");
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateReport(selectedStudentId, reportTitle, reportContent);
      
      setSuccess(true);
      setReportTitle("");
      setReportContent("");
      setSelectedStudentId("");
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportTitle("");
    setReportContent("");
    setSelectedStudentId("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-gray-900">Create Student Report</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">✅ Report created successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">❌ {error}</p>
              </div>
            )}

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isSubmitting}
              >
                <option value="">-- Choose a student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name || student.email} ({student.email})
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold">UID:</span> {selectedStudent.id}
                </p>
              )}
            </div>

            {/* Report Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Report Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Performance Report - Q1 2026"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Report Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Report Content *
              </label>
              <textarea
                placeholder={`Write the report here. Example format:

What Went Well:
- Strong problem-solving skills
- Good collaboration with peers

Gaps:
- Time management needs improvement

Next Steps:
- Focus on deadline management
- Take on challenging projects

Projections:
- On track for promotion next quarter`}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-48 resize-none"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-600">
                {reportContent.length} characters
              </p>
            </div>

            {/* Character count info */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <span className="font-semibold">Tip:</span> Use clear sections (What Went Well, Gaps, Next Steps, Projections) for better readability.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
