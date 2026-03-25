"use client";

interface AverageRemarksProps {
  remarksForm: any;
  onUpdate: (field: string, value: any) => void;
}

export function AverageRemarks({ remarksForm, onUpdate }: AverageRemarksProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold mb-2">4 Checkpoint Scores</label>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((checkpoint) => (
            <div key={checkpoint}>
              <label className="block text-xs font-medium mb-1">Checkpoint Score {checkpoint}</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded text-sm"
                value={remarksForm.checkpointScores?.[checkpoint - 1] || ""}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  const scores = remarksForm.checkpointScores || [0, 0, 0, 0];
                  scores[checkpoint - 1] = val;
                  onUpdate("checkpointScores", scores);
                }}
                placeholder="0-100"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Daily Practice %</label>
        <input
          type="number"
          min="0"
          max="100"
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.dailyPractice || ""}
          onChange={(e) => {
            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
            onUpdate("dailyPractice", val);
          }}
          placeholder="0-100"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Workshop Attendance %</label>
        <input
          type="number"
          min="0"
          max="100"
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.workshopAttendance || ""}
          onChange={(e) => {
            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
            onUpdate("workshopAttendance", val);
          }}
          placeholder="0-100"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Phase-wise Readiness Signal</label>
        <select
          className="w-full p-2 border rounded text-sm"
          value={remarksForm.readiness || ""}
          onChange={(e) => onUpdate("readiness", e.target.value)}
        >
          <option value="">Select Phase...</option>
          <option value="Foundation">
            🔴 Phase 1: Foundation-Learning
          </option>
          <option value="Transition">
            🟡 Phase 2: Transition-Applying
          </option>
          <option value="Elite">
            🟢 Phase 3: Elite-Ready
          </option>
        </select>
      </div>
    </>
  );
}
