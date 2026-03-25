"use client";

interface PoorRemarksProps {
  remarksForm: any;
  onUpdate: (field: string, value: any) => void;
}

export function PoorRemarks({ remarksForm, onUpdate }: PoorRemarksProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold mb-1">Bootcamp Progress %</label>
        <input
          type="number"
          min="0"
          max="100"
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.progress || ""}
          onChange={(e) => {
            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
            onUpdate("progress", val);
          }}
          placeholder="0-100"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Project Submission Status</label>
        <select
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.submissionStats || ""}
          onChange={(e) => onUpdate("submissionStats", e.target.value)}
        >
          <option value="">Select Status...</option>
          <option value="Submitted">Submitted</option>
          <option value="Not yet submitted">Not yet submitted</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Buddy Mentor Notes</label>
        <textarea
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.buddyNotes || ""}
          onChange={(e) => onUpdate("buddyNotes", e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2">3 Remedial Mock Scores</label>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((mockNum) => (
            <div key={mockNum}>
              <label className="block text-xs font-medium mb-1">Mock Score -{mockNum}</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded text-sm"
                value={remarksForm.remedialScores?.[mockNum - 1] || ""}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  const scores = remarksForm.remedialScores || [0, 0, 0];
                  scores[mockNum - 1] = val;
                  onUpdate("remedialScores", scores);
                }}
                placeholder="0-100"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
