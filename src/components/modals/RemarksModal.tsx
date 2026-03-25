"use client";

import { X } from "lucide-react";
import { GoodRemarks } from "../remarks/GoodRemarks";
import { AboveAverageRemarks } from "../remarks/AboveAverageRemarks";
import { AverageRemarks } from "../remarks/AverageRemarks";
import { PoorRemarks } from "../remarks/PoorRemarks";
import type { Student, RemarksCategory, Batch } from "../types";

interface RemarksModalProps {
  isOpen: boolean;
  selectedStudent: Student | null;
  remarksCategory: RemarksCategory;
  remarksForm: any;
  batches: Batch[];
  onCategoryChange: (category: RemarksCategory) => void;
  onFormUpdate: (field: string, value: any) => void;
  onAddMockScore: () => void;
  onUpdateMockScore: (index: number, val: string) => void;
  onAddActionItem: () => void;
  onUpdateActionItem: (index: number, val: string) => void;
  onAddAboveAvgMockScore: () => void;
  onUpdateAboveAvgMockScore: (index: number, val: string) => void;
  onAddScoreTrend: () => void;
  onUpdateScoreTrend: (index: number, field: string, val: any) => void;
  onCheckInAttendance: () => void;
  onUpdateAttendanceLog: (index: number, field: string, val: any) => void;
  onAddMentorObservation: () => void;
  onUpdateMentorObservation: (index: number, field: string, val: any) => void;
  onAddGapAnalysis: () => void;
  onUpdateGapAnalysis: (index: number, field: string, val: string) => void;
  onRemoveGapAnalysis: (index: number) => void;
  onAddPlacementWeek: () => void;
  onUpdatePlacementWeek: (index: number, field: string, val: any) => void;
  onSave: () => void;
  onClose: () => void;
}

export function RemarksModal({
  isOpen,
  selectedStudent,
  remarksCategory,
  remarksForm,
  batches,
  onCategoryChange,
  onFormUpdate,
  onAddMockScore,
  onUpdateMockScore,
  onAddActionItem,
  onUpdateActionItem,
  onAddAboveAvgMockScore,
  onUpdateAboveAvgMockScore,
  onAddScoreTrend,
  onUpdateScoreTrend,
  onCheckInAttendance,
  onUpdateAttendanceLog,
  onAddMentorObservation,
  onUpdateMentorObservation,
  onAddGapAnalysis,
  onUpdateGapAnalysis,
  onRemoveGapAnalysis,
  onAddPlacementWeek,
  onUpdatePlacementWeek,
  onSave,
  onClose,
}: RemarksModalProps) {
  if (!isOpen || !selectedStudent) return null;

  const activeBatch = batches.find((b) => b.id === selectedStudent.batchId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Remarks for {selectedStudent.name}</h3>
            <p className="text-sm text-gray-500">Batch: {activeBatch?.name || "Unknown"}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Category Performance</label>
          <select
            className="w-full p-2 border rounded mb-4 bg-gray-50"
            value={remarksCategory}
            onChange={(e) => onCategoryChange(e.target.value as RemarksCategory)}
          >
            <option value="">-- Select Category --</option>
            <option value="Good">Good</option>
            <option value="Above Average">Above Average</option>
            <option value="Average">Average</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        {/* Dynamic Forms */}
        <div className="space-y-4 bg-gray-50 p-4 rounded border">
          <h4 className="font-semibold text-sm border-b pb-2">
            {remarksCategory === "Good"
              ? "Remarks – Good Category"
              : remarksCategory === "Above Average"
                ? "Remarks – Above Average Category"
                : "Category Specific Metrics"}
          </h4>

          {remarksCategory === "Good" && (
            <GoodRemarks
              remarksForm={remarksForm}
              onUpdate={onFormUpdate}
              onAddMockScore={onAddMockScore}
              onUpdateMockScore={onUpdateMockScore}
              onAddActionItem={onAddActionItem}
              onUpdateActionItem={onUpdateActionItem}
            />
          )}

          {remarksCategory === "Above Average" && (
            <AboveAverageRemarks
              remarksForm={remarksForm}
              onUpdate={onFormUpdate}
              onAddMockScore={onAddAboveAvgMockScore}
              onUpdateMockScore={onUpdateAboveAvgMockScore}
              onAddScoreTrend={onAddScoreTrend}
              onUpdateScoreTrend={onUpdateScoreTrend}
              onCheckInAttendance={onCheckInAttendance}
              onUpdateAttendanceLog={onUpdateAttendanceLog}
              onAddMentorObservation={onAddMentorObservation}
              onUpdateMentorObservation={onUpdateMentorObservation}
              onAddGapAnalysis={onAddGapAnalysis}
              onUpdateGapAnalysis={onUpdateGapAnalysis}
              onRemoveGapAnalysis={onRemoveGapAnalysis}
              onAddPlacementWeek={onAddPlacementWeek}
              onUpdatePlacementWeek={onUpdatePlacementWeek}
            />
          )}

          {remarksCategory === "Average" && (
            <AverageRemarks remarksForm={remarksForm} onUpdate={onFormUpdate} />
          )}

          {remarksCategory === "Poor" && (
            <PoorRemarks remarksForm={remarksForm} onUpdate={onFormUpdate} />
          )}

          {remarksCategory === "" && (
            <p className="text-sm text-gray-500 italic">Select a category to view specific metrics form.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onSave} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Save Metrics
          </button>
        </div>
      </div>
    </div>
  );
}
