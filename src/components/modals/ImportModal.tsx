"use client";

import { FileSpreadsheet } from "lucide-react";
import type { Batch } from "../types";

interface ImportModalProps {
  isOpen: boolean;
  batches: Batch[];
  importBatchId: string;
  onBatchChange: (id: string) => void;
  onFileSelect: () => void;
  onClose: () => void;
}

export function ImportModal({
  isOpen,
  batches,
  importBatchId,
  onBatchChange,
  onFileSelect,
  onClose,
}: ImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <h3 className="text-lg font-bold mb-4">Import Students</h3>
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Select Batch *</label>
            <select
              className="w-full p-2 border rounded bg-white"
              value={importBatchId}
              onChange={(e) => onBatchChange(e.target.value)}
            >
              <option value="">-- Select Batch --</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select File (.csv, .xlsx)</label>
            <button
              onClick={onFileSelect}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded text-sm w-full transition-colors ${
                importBatchId
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!importBatchId}
            >
              <FileSpreadsheet size={16} /> Choose File & Import
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
