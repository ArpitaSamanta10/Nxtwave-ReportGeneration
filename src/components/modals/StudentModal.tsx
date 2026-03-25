"use client";

import type { Batch, RemarksCategory } from "../types";

interface StudentFormData {
  id: string;
  name: string;
  email: string;
  category: RemarksCategory;
  batchId: string;
}

interface StudentModalProps {
  isOpen: boolean;
  batches: Batch[];
  studentForm: StudentFormData;
  onFormChange: (form: StudentFormData) => void;
  onAdd: () => void;
  onClose: () => void;
}

export function StudentModal({
  isOpen,
  batches,
  studentForm,
  onFormChange,
  onAdd,
  onClose,
}: StudentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <h3 className="text-lg font-bold mb-4">Add Student Manually</h3>
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Batch *</label>
            <select
              className="w-full p-2 border rounded bg-white"
              value={studentForm.batchId}
              onChange={(e) => onFormChange({ ...studentForm, batchId: e.target.value })}
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
            <label className="block text-sm font-medium mb-1">Student ID (optional)</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={studentForm.id}
              placeholder="Leave blank to auto-generate"
              onChange={(e) => onFormChange({ ...studentForm, id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Student Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={studentForm.name}
              onChange={(e) => onFormChange({ ...studentForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={studentForm.email}
              onChange={(e) => onFormChange({ ...studentForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Initial Category</label>
            <select
              className="w-full p-2 border rounded bg-white"
              value={studentForm.category}
              onChange={(e) => onFormChange({ ...studentForm, category: e.target.value as RemarksCategory })}
            >
              <option value="">-- Select Category --</option>
              <option value="Good">Good</option>
              <option value="Above Average">Above Average</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              onFormChange({ id: "", name: "", email: "", category: "", batchId: "" });
            }}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button onClick={onAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
