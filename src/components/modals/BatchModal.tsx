"use client";

interface BatchModalProps {
  isOpen: boolean;
  batchName: string;
  onBatchNameChange: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function BatchModal({
  isOpen,
  batchName,
  onBatchNameChange,
  onCreate,
  onClose,
}: BatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Create New Batch</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Batch Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={batchName}
            onChange={(e) => onBatchNameChange(e.target.value)}
            placeholder="e.g., Summer 2026 Batch A"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
