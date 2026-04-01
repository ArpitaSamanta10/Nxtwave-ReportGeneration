"use client";

import { MessageCircle, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
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
  onViewReport: (student: Student) => void;
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
  onViewReport,
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
            onViewReport={onViewReport}
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
  onViewReport: (student: Student) => void;
  onDelete: (id: string) => void;
}

function StudentItem({ student: s, isSelected, onToggleSelect, onOpenRemarks, onViewReport, onDelete }: StudentItemProps) {
  return (
    <div className="border-b last:border-none bg-white hover:bg-gray-50 text-sm overflow-hidden">
      <div className={`flex items-center p-3 ${isSelected ? "bg-blue-50" : ""}`}>
        <div className="w-10 text-center shrink-0">
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
        <div className="w-1/6 px-2 flex items-center justify-end gap-2" style={{ minWidth: "300px" }}>
          <button
            onClick={() => onViewReport(s)}
            title="View Report"
            className="p-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded flex items-center gap-2 text-xs font-medium"
          >
            <FileText size={14} /> Report
          </button>
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
      </div>
    </div>
  );
}

