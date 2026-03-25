"use client";

import { MessageCircle, Trash2, Target, ChevronLeft, ChevronRight } from "lucide-react";
import type { Student } from "../types";

interface StudentListProps {
  students: Student[];
  totalStudents: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedStudentIds: Set<string>;
  onSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onOpenRemarks: (student: Student) => void;
  onDelete: (id: string) => void;
}

export function StudentList({
  students,
  totalStudents,
  currentPage,
  totalPages,
  onPageChange,
  selectedStudentIds,
  onSelectAll,
  onToggleSelect,
  onOpenRemarks,
  onDelete,
}: StudentListProps) {
  const startIndex = (currentPage - 1) * 25 + 1;
  const endIndex = Math.min(currentPage * 25, totalStudents);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
      {/* Header Row */}
      <div className="flex items-center text-xs uppercase tracking-wider font-bold text-slate-500 bg-slate-50 p-4 border-b border-slate-200 sticky top-0 z-10">
        <div className="w-12 text-center shrink-0">
          <input
            type="checkbox"
            className="cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            checked={students.length > 0 && selectedStudentIds.size === students.length}
            onChange={onSelectAll}
          />
        </div>
        <div className="w-1/6 px-2">ID</div>
        <div className="w-1/5 px-2">Name</div>
        <div className="w-1/4 px-2">Email</div>
        <div className="w-1/6 px-2">Category</div>
        <div className="w-1/6 px-2 text-right">Actions</div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {students.map((s) => (
          <StudentItem
            key={s.id}
            student={s}
            isSelected={selectedStudentIds.has(s.id)}
            onToggleSelect={onToggleSelect}
            onOpenRemarks={onOpenRemarks}
            onDelete={onDelete}
          />
        ))}
        {students.length === 0 && (
          <div className="p-8 text-center text-gray-500">No students found matching your criteria.</div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing <span className="font-semibold">{startIndex}</span> to <span className="font-semibold">{endIndex}</span> of{" "}
          <span className="font-semibold">{totalStudents}</span> students
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="px-3 py-1 bg-white border border-slate-200 rounded font-semibold">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface StudentItemProps {
  student: Student;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenRemarks: (student: Student) => void;
  onDelete: (id: string) => void;
}

function StudentItem({ student: s, isSelected, onToggleSelect, onOpenRemarks, onDelete }: StudentItemProps) {
  return (
    <details className="group border-b last:border-none bg-white hover:bg-gray-50 text-sm overflow-hidden">
      <summary className={`flex items-center p-3 cursor-pointer list-none ${isSelected ? "bg-blue-50" : ""}`}>
        <div className="w-10 text-center shrink-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="cursor-pointer rounded w-4 h-4"
            checked={isSelected}
            onChange={() => onToggleSelect(s.id)}
          />
        </div>
        <div className="w-1/6 px-2 text-gray-500 font-mono text-xs truncate" title={s.id}>
          {s.id.length > 12 ? s.id.substring(0, 8) + "..." : s.id}
        </div>
        <div className="w-1/5 px-2 font-medium truncate">{s.name}</div>
        <div className="w-1/4 px-2 text-gray-600 truncate">{s.email}</div>
        <div className="w-1/6 px-2">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              s.category === "Good"
                ? "bg-green-100 text-green-800"
                : s.category === "Above Average"
                  ? "bg-blue-100 text-blue-800"
                  : s.category === "Average"
                    ? "bg-yellow-100 text-yellow-800"
                    : s.category === "Poor"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
            }`}
          >
            {s.category || "Pending"}
          </span>
        </div>
        <div className="w-1/6 px-2 flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onOpenRemarks(s)}
            title="Remarks"
            className="p-1.5 bg-black text-white hover:bg-gray-800 rounded flex items-center gap-2 text-xs font-medium"
          >
            <MessageCircle size={14} /> Remarks
          </button>
          <button onClick={() => onDelete(s.id)} className="text-red-500 hover:text-red-700">
            <Trash2 size={16} />
          </button>
        </div>
      </summary>

      {/* Expanded Section */}
      <div className="p-4 bg-gray-50 border-t ml-10 text-sm grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-semibold text-gray-700 mb-2">Category: {s.category || "Pending"}</h4>
          {s.remarksDetails && Object.entries(s.remarksDetails).length > 0 ? (
            <div className="space-y-3">
              {s.category === "Good" ? (
                <StudentItemGoodView remarks={s.remarksDetails} />
              ) : s.category === "Above Average" ? (
                <StudentItemAboveAverageView remarks={s.remarksDetails} />
              ) : (
                <ul className="space-y-1 text-gray-600">
                  {Object.entries(s.remarksDetails).map(([key, val]) => (
                    <li key={key}>
                      <span className="font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>{" "}
                      {String(val)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic block mt-2">No remarks details added yet. Click the Remarks button to update.</p>
          )}
        </div>
        <div className="text-right flex flex-col justify-end">
          <p className="text-xs text-gray-400">
            Last Updated: {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "N/A"}
          </p>
        </div>
      </div>
    </details>
  );
}

function StudentItemGoodView({ remarks }: { remarks: any }) {
  return (
    <div className="space-y-4">
      {remarks.mockScores && remarks.mockScores.length > 0 && (
        <div>
          <span className="font-medium text-gray-700 block text-xs">Mock Scores:</span>
          <div className="flex gap-2 items-center flex-wrap">
            {remarks.mockScores.map((score: string, i: number) =>
              score.trim() ? (
                <span key={i} className="px-2 py-1 bg-white border rounded text-xs font-mono">
                  {score}
                </span>
              ) : null
            )}
            {remarks.calculatedAverage > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-bold text-xs ml-2">
                Avg: {remarks.calculatedAverage}
              </span>
            )}
          </div>
        </div>
      )}

      {remarks.interviewOutcome && (
        <div>
          <span className="font-medium text-gray-700 block text-xs">Interview Outcome:</span>
          <p className="text-gray-600 bg-white p-2 rounded border mt-1 italic text-xs leading-relaxed">
            {remarks.interviewOutcome}
          </p>
        </div>
      )}

      {remarks.mentorNote && (
        <div>
          <span className="font-medium text-gray-700 block text-xs">Mentor Note:</span>
          <p className="text-gray-600 bg-white p-2 rounded border mt-1 text-xs">{remarks.mentorNote}</p>
        </div>
      )}

      {remarks.changesRequired && remarks.projectRemarks && (
        <div>
          <span className="font-medium text-red-600 block text-xs flex items-center gap-1">
            <Target size={12} /> Project Needs Changes:
          </span>
          <p className="text-gray-600 bg-red-50 p-2 rounded border border-red-100 mt-1 text-xs">
            {remarks.projectRemarks}
          </p>
        </div>
      )}

      {remarks.actionItems && remarks.actionItems.some((item: string) => item.trim()) && (
        <div>
          <span className="font-medium text-gray-700 block text-xs mb-1">Action Items:</span>
          <ul className="list-disc pl-4 space-y-1">
            {remarks.actionItems.map((item: string, i: number) =>
              item.trim() ? (
                <li key={i} className="text-gray-600 text-xs">
                  {item}
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}

      {(remarks.roleProjection || remarks.tierProjection) && (
        <div className="bg-blue-50 border border-blue-100 p-2 rounded">
          <span className="font-semibold text-blue-800 block text-xs mb-1">Projection:</span>
          <p className="text-xs text-blue-900 border-b border-blue-200 pb-1 mb-1">
            <strong>Role:</strong>{" "}
            {remarks.roleProjection === "Other" ? remarks.customRole : remarks.roleProjection} |{" "}
            <strong>Tier:</strong> {remarks.tierProjection === "Other" ? remarks.customTier : remarks.tierProjection}
          </p>
          {remarks.projectionJustification && (
            <p className="text-xs text-blue-800 italic">"{remarks.projectionJustification}"</p>
          )}
        </div>
      )}
    </div>
  );
}

function StudentItemAboveAverageView({ remarks }: { remarks: any }) {
  return (
    <div className="space-y-3">
      {remarks.mockScores && remarks.mockScores.length > 0 && (
        <div>
          <span className="font-medium text-blue-700 block text-xs">📊 Mock Scores:</span>
          <div className="flex gap-2 flex-wrap mt-1">
            {remarks.mockScores.map((score: string, i: number) =>
              score ? (
                <span key={i} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-mono">
                  M{i + 1}: {score}
                </span>
              ) : null
            )}
            {remarks.calculatedAverage > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-bold text-xs">
                Avg: {remarks.calculatedAverage}
              </span>
            )}
          </div>
        </div>
      )}

      {remarks.scoreTrends && remarks.scoreTrends.length > 0 && (
        <div>
          <span className="font-medium text-blue-700 block text-xs">📈 Score Trends:</span>
          <div className="space-y-1 mt-1">
            {remarks.scoreTrends.map(
              (trend: any, i: number) =>
                trend.topic && (
                  <div key={i} className="flex items-center gap-2 text-xs bg-blue-50 p-1 rounded px-2">
                    <span>{trend.topic}:</span>
                    <span className="font-mono">{trend.current}%</span>
                    <span
                      className={
                        trend.change >= 0
                          ? "text-green-600 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >
                      {trend.change >= 0 ? "↑" : "↓"} {Math.abs(trend.change)}%
                    </span>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {remarks.attendanceLog && remarks.attendanceLog.length > 0 && (
        <div>
          <span className="font-medium text-blue-700 block text-xs">📅 Attendance: {remarks.attendanceLog.length} sessions</span>
          <div className="text-xs text-gray-600 mt-1">
            {remarks.attendanceLog.slice(-3).map((log: any, i: number) => (
              <div
                key={i}
                className={`px-2 py-1 rounded ${
                  log.status === "completed"
                    ? "bg-green-50 text-green-700"
                    : log.status === "late"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {log.date}: {log.status} ⭐ {log.confidenceLevel}/5
              </div>
            ))}
          </div>
        </div>
      )}

      {remarks.mentorObservations && remarks.mentorObservations.length > 0 && (
        <div>
          <span className="font-medium text-blue-700 block text-xs">🧑‍🏫 Mentor Observations: {remarks.mentorObservations.length} entries</span>
          <div className="text-xs text-gray-600 mt-1">
            {remarks.mentorObservations.slice(-1).map((obs: any, i: number) => (
              <div
                key={i}
                className={`px-2 py-1 rounded ${
                  obs.status === "On Track"
                    ? "bg-green-50"
                    : obs.status === "Warning"
                      ? "bg-orange-50"
                      : "bg-red-50"
                }`}
              >
                <strong>{obs.date}</strong> - {obs.status}: {obs.feedback.substring(0, 40)}...
              </div>
            ))}
          </div>
        </div>
      )}

      {remarks.gapAnalysis && remarks.gapAnalysis.length > 0 && (
        <div>
          <span className="font-medium text-blue-700 block text-xs">🔍 Gap Analysis: {remarks.gapAnalysis.length} topics</span>
          <div className="text-xs text-gray-600 mt-1">
            {remarks.gapAnalysis.slice(0, 3).map((gap: any, i: number) => (
              <div key={i} className="px-2 py-1">
                {gap.topic} ({gap.difficulty}) - {gap.gapType === "Other" ? gap.customGapType : gap.gapType}
              </div>
            ))}
          </div>
        </div>
      )}

      {remarks.placementTimeline && remarks.placementTimeline.length > 0 && (
        <div>
          <span className="font-medium text-blue-700 block text-xs">📅 Placement Timeline: {remarks.placementTimeline.length} weeks</span>
          <div className="text-xs text-gray-600 mt-1">
            {remarks.placementTimeline.map((week: any, i: number) => (
              <div
                key={i}
                className={`px-2 py-1 rounded ${
                  week.status === "Interview Ready"
                    ? "bg-green-50 text-green-700"
                    : week.status === "Improving"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                Week {week.week}: {week.status}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
