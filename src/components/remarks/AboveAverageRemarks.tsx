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
        <label className="block text-xs font-semibold mb-2">Score Improvement Trend</label>
        <div className="space-y-2">
          {(remarksForm.scoreTrends || []).map((trend: any, idx: number) => (
            <textarea
              key={idx}
              className="w-full p-2 border rounded text-sm"
              value={trend?.note || ""}
              onChange={(e) => {
                const trends = [...(remarksForm.scoreTrends || [])];
                trends[idx] = { ...trends[idx], note: e.target.value };
                onUpdate("scoreTrends", trends);
              }}
              placeholder={`Trend ${idx + 1} - Describe score progression...`}
              rows={2}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const trends = remarksForm.scoreTrends || [];
              trends.push({ note: "" });
              onUpdate("scoreTrends", [...trends]);
            }}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            + Add Trend
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2">Revision Attendance Log</label>
        <div className="space-y-2">
          {(remarksForm.attendanceLog || []).map((log: any, idx: number) => (
            <input
              key={idx}
              type="text"
              className="w-full p-2 border rounded text-sm"
              value={log?.date || ""}
              onChange={(e) => {
                const logs = [...(remarksForm.attendanceLog || [])];
                logs[idx] = { ...logs[idx], date: e.target.value };
                onUpdate("attendanceLog", logs);
              }}
              placeholder="Date / Session"
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const logs = remarksForm.attendanceLog || [];
              logs.push({ date: "" });
              onUpdate("attendanceLog", [...logs]);
            }}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            + Add Attendance
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2">Mentor Weekly Observations</label>
        <div className="space-y-2">
          {(remarksForm.mentorObservations || []).map((obs: any, idx: number) => (
            <textarea
              key={idx}
              className="w-full p-2 border rounded text-sm"
              value={obs?.observation || ""}
              onChange={(e) => {
                const obsList = [...(remarksForm.mentorObservations || [])];
                obsList[idx] = { ...obsList[idx], observation: e.target.value };
                onUpdate("mentorObservations", obsList);
              }}
              placeholder={`Week ${idx + 1} observation...`}
              rows={2}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const obsList = remarksForm.mentorObservations || [];
              obsList.push({ observation: "" });
              onUpdate("mentorObservations", [...obsList]);
            }}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            + Add Observation
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2">Problem Level Gap Analysis</label>
        <div className="space-y-2">
          {(remarksForm.gapAnalysis || []).map((gap: any, idx: number) => (
            <textarea
              key={idx}
              className="w-full p-2 border rounded text-sm"
              value={gap?.gap || ""}
              onChange={(e) => {
                const gaps = [...(remarksForm.gapAnalysis || [])];
                gaps[idx] = { ...gaps[idx], gap: e.target.value };
                onUpdate("gapAnalysis", gaps);
              }}
              placeholder={`Gap ${idx + 1} Analysis...`}
              rows={2}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const gaps = remarksForm.gapAnalysis || [];
              gaps.push({ gap: "" });
              onUpdate("gapAnalysis", [...gaps]);
            }}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            + Add Gap
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2">Placement Window Timeline</label>
        <div className="space-y-2">
          {(remarksForm.placementTimeline || []).map((timeline: any, idx: number) => (
            <input
              key={idx}
              type="text"
              className="w-full p-2 border rounded text-sm"
              value={timeline?.milestone || ""}
              onChange={(e) => {
                const timelines = [...(remarksForm.placementTimeline || [])];
                timelines[idx] = { ...timelines[idx], milestone: e.target.value };
                onUpdate("placementTimeline", timelines);
              }}
              placeholder="Milestone / Target"
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const timelines = remarksForm.placementTimeline || [];
              timelines.push({ milestone: "" });
              onUpdate("placementTimeline", [...timelines]);
            }}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            + Add Milestone
          </button>
        </div>
      </div>
    </>
  );
}
