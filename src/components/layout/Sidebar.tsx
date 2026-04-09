"use client";

import { Plus, Trash2, FileText } from "lucide-react";
import type { Batch } from "../types";

interface SidebarProps {
  batches: Batch[];
  activeBatch: Batch | null;
  onBatchSelect: (batch: Batch | null) => void;
  onBatchCreate: () => void;
  onBatchDelete: (id: string) => void;
  onAddStudentClick: () => void;
  onImportClick: () => void;
  onCreateReportClick: () => void;
}

export function Sidebar({
  batches,
  activeBatch,
  onBatchSelect,
  onBatchCreate,
  onBatchDelete,
  onAddStudentClick,
  onImportClick,
  onCreateReportClick,
}: SidebarProps) {
  return (
    <aside className="w-1/4 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm z-0">
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500">Batches</h2>
          <button
            onClick={onBatchCreate}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            title="Create Batch"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                activeBatch?.id === batch.id
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => onBatchSelect(batch)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{batch.name}</p>
                  <p className="text-xs text-slate-400">
                    Created: {new Date(batch.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete batch "${batch.name}"?`)) {
                      onBatchDelete(batch.id);
                    }
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title="Delete Batch"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {batches.length > 0 && (
            <button
              onClick={() => onBatchSelect(null)}
              className={`w-full p-2 rounded text-sm font-medium border-2 transition-all ${
                activeBatch === null
                  ? "bg-slate-100 border-slate-400 text-slate-900"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              View All Students
            </button>
          )}
          {batches.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-8">No batches yet. Create one to get started.</p>
          )}
        </div>
      </div>

      {/* Action Dashboard - Sticks to bottom */}
      <div className="p-5 border-t border-slate-200 bg-slate-50 shrink-0">
        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">Student Actions</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={onAddStudentClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm w-full transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm font-medium"
          >
            <Plus size={16} className="text-blue-600" /> Add Manually
          </button>
          <button
            onClick={onImportClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm w-full transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-medium"
          >
            <span></span> Import from Sheet
          </button>
          <button
            onClick={onCreateReportClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm w-full transition-all bg-green-600 text-white hover:bg-green-700 shadow-sm font-medium"
          >
            <FileText size={16} /> Create Report
          </button>
        </div>
      </div>
    </aside>
  );
}
