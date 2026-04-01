"use client";

interface AboveAverageRemarksProps {
  remarksForm: any;
  onUpdate: (field: string, value: any) => void;
}

export function AboveAverageRemarks({
  remarksForm,
  onUpdate,
}: AboveAverageRemarksProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold mb-2">3 Mock Scores</label>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((mockNum) => (
            <div key={mockNum}>
              <label className="block text-xs font-medium mb-1">Mock Score {mockNum}</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded text-sm"
                value={remarksForm.mockScores?.[mockNum - 1] || ""}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  const scores = remarksForm.mockScores || [0, 0, 0];
                  scores[mockNum - 1] = val;
                  onUpdate("mockScores", scores);
                }}
                placeholder="0-100"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">Assignment Completion %</label>
        <input
          type="number"
          min="0"
          max="100"
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.assignmentCompletion || ""}
          onChange={(e) => {
            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
            onUpdate("assignmentCompletion", val);
          }}
          placeholder="0-100"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Peer Learning Contribution</label>
        <textarea
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.peerContribution || ""}
          onChange={(e) => onUpdate("peerContribution", e.target.value)}
          placeholder="Describe contributions to peer learning..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Overall Remarks</label>
        <textarea
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.overallRemarks || ""}
          onChange={(e) => onUpdate("overallRemarks", e.target.value)}
          placeholder="Add overall remarks and feedback..."
        />
      </div>
    </>
  );
}
