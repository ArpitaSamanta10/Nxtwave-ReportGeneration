"use client";

import { X, Download, Send, Save } from "lucide-react";
import type { GeneratedReport } from "@/lib/reportGenerator";

interface ReportModalProps {
  isOpen: boolean;
  report: GeneratedReport | null;
  isLoading: boolean;
  onClose: () => void;
  onSendEmail: (report: GeneratedReport) => void;
  onSave: (report: GeneratedReport) => void;
  isSending: boolean;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function ReportModal({
  isOpen,
  report,
  isLoading,
  onClose,
  onSendEmail,
  onSave,
  isSending,
  isSaving = false,
  isSaved = false,
}: ReportModalProps) {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    if (!report) return;

    const content = `
STUDENT DEVELOPMENT REPORT
==========================

Student: ${report.studentName}
Email: ${report.studentEmail}
Tier: ${report.tier}
Generated: ${new Date(report.generatedAt).toLocaleString()}

---

WHAT WENT WELL
${report.whatWentWell}

---

GAPS
${report.gaps}

---

NEXT STEPS
${report.nextSteps}

---

PROJECTIONS
${report.projections}
    `;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", `Report-${report.studentName}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report?.studentName}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tier: <span className="font-semibold">{report?.tier}</span> • Email:{" "}
              <span className="font-mono text-xs">{report?.studentEmail}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Generating report...</p>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-8">
              {/* What Went Well */}
              <section>
                <h3 className="text-xl font-bold text-green-700 mb-3 pb-2 border-b-2 border-green-200">
                  ✓ What Went Well
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.whatWentWell}
                </p>
              </section>

              {/* Gaps */}
              <section>
                <h3 className="text-xl font-bold text-orange-700 mb-3 pb-2 border-b-2 border-orange-200">
                  ⚠ Gaps
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.gaps}
                </p>
              </section>

              {/* Next Steps */}
              <section>
                <h3 className="text-xl font-bold text-blue-700 mb-3 pb-2 border-b-2 border-blue-200">
                  → Next Steps
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.nextSteps}
                </p>
              </section>

              {/* Projections */}
              <section>
                <h3 className="text-xl font-bold text-purple-700 mb-3 pb-2 border-b-2 border-purple-200">
                  🎯 Projections
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.projections}
                </p>
              </section>

              <div className="text-xs text-gray-500 mt-8 pt-4 border-t">
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No report available</div>
          )}
        </div>

        {/* Footer */}
        {report && (
          <div className="border-t bg-gray-50 p-4 flex gap-3 justify-end">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <Download size={18} /> Download
            </button>
            <button
              onClick={() => onSave(report)}
              disabled={isSaving || isSaved}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} /> {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Report"}
            </button>
            <button
              onClick={() => onSendEmail(report)}
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} /> {isSending ? "Sending..." : "Send Email"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
