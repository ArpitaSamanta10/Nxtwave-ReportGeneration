"use client";

import { Plus, Target } from "lucide-react";

interface AboveAverageRemarksProps {
  remarksForm: any;
  onUpdate: (field: string, value: any) => void;
  onAddMockScore: () => void;
  onUpdateMockScore: (index: number, val: string) => void;
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
}

export function AboveAverageRemarks({
  remarksForm,
  onUpdate,
  onAddMockScore,
  onUpdateMockScore,
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
}: AboveAverageRemarksProps) {
  return (
    <div className="space-y-4">
      {/* 1. Mock Scores (Dynamic + Average) */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-2">1. Mock Scores (Dynamic)</label>
        <div className="space-y-2">
          {(remarksForm.mockScores || []).map((score: string, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600 min-w-max">Mock Score {i + 1}:</label>
              <input
                type="number"
                className="w-24 p-2 border rounded text-sm outline-none focus:border-blue-400"
                value={score}
                onChange={(e) => onUpdateMockScore(i, e.target.value)}
                placeholder="0-100"
                min="0"
                max="100"
              />
            </div>
          ))}
          <button
            onClick={onAddMockScore}
            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
          >
            + Add Score
          </button>
        </div>
        {remarksForm.calculatedAverage > 0 && (
          <p className="text-sm font-semibold text-green-700 bg-green-50 inline-block px-2 py-1 rounded mt-2">
            Final Average: {remarksForm.calculatedAverage}
          </p>
        )}
      </div>

      {/* 2. Score Improvement Trend */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-2">2. Score Improvement Trend</label>
        <div className="space-y-3">
          {(remarksForm.scoreTrends || []).map((trend: any, i: number) => (
            <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  className="p-2 border rounded text-sm col-span-2"
                  placeholder="Topic (e.g., DSA, System Design)"
                  value={trend.topic}
                  onChange={(e) => onUpdateScoreTrend(i, "topic", e.target.value)}
                />
                <input
                  type="number"
                  className="p-2 border rounded text-sm"
                  placeholder="Current %"
                  value={trend.current}
                  onChange={(e) => onUpdateScoreTrend(i, "current", Number(e.target.value))}
                />
                <input
                  type="number"
                  className="p-2 border rounded text-sm"
                  placeholder="Previous %"
                  value={trend.previous}
                  onChange={(e) => onUpdateScoreTrend(i, "previous", Number(e.target.value))}
                />
              </div>
              {trend.topic && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{trend.topic}:</span>
                  <span className="text-gray-700">{trend.current}%</span>
                  <span
                    className={trend.change >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}
                  >
                    {trend.change >= 0 ? "↑" : "↓"} {Math.abs(trend.change)}%
                  </span>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={onAddScoreTrend}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Trend
          </button>
        </div>
      </div>

      {/* 3. Revision Attendance Log */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-gray-700">3. Revision Attendance Log</label>
          <button
            onClick={onCheckInAttendance}
            className="px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-xs font-medium"
          >
            ✓ Check In
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(remarksForm.attendanceLog || []).map((log: any, i: number) => (
            <div key={i} className="bg-gray-50 p-2 rounded border border-gray-200 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-600">{log.date}</span>
                <select
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : log.status === "late"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                  }`}
                  value={log.status}
                  onChange={(e) => onUpdateAttendanceLog(i, "status", e.target.value)}
                >
                  <option value="completed">✓ Completed</option>
                  <option value="late">⏱ Late Arrival</option>
                  <option value="missed">✗ Missed</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-gray-600">Confidence:</label>
                <select
                  className="px-2 py-1 border rounded text-xs"
                  value={log.confidenceLevel}
                  onChange={(e) => onUpdateAttendanceLog(i, "confidenceLevel", Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {"★".repeat(star)}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                className="w-full p-1 border rounded text-xs"
                placeholder="Self-reflection note..."
                value={log.note}
                onChange={(e) => onUpdateAttendanceLog(i, "note", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Mentor Weekly Observation */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-gray-700">4. Mentor Weekly Observation</label>
          <button
            onClick={onAddMentorObservation}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Entry
          </button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {(remarksForm.mentorObservations || []).map((obs: any, i: number) => (
            <div key={i} className="border-l-4 border-blue-400 bg-blue-50 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-600">{obs.date}</span>
                <select
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    obs.status === "On Track"
                      ? "bg-green-100 text-green-800"
                      : obs.status === "Warning"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                  }`}
                  value={obs.status}
                  onChange={(e) => onUpdateMentorObservation(i, "status", e.target.value)}
                >
                  <option value="On Track">✓ On Track</option>
                  <option value="Warning">⚠ Warning</option>
                  <option value="At Risk">✗ At Risk</option>
                </select>
              </div>
              <textarea
                className="w-full p-2 border rounded text-xs mb-2 outline-none focus:border-blue-400"
                rows={2}
                placeholder="Feedback..."
                value={obs.feedback}
                onChange={(e) => onUpdateMentorObservation(i, "feedback", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Problem-Level Gap Analysis */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-gray-700">5. Problem-Level Gap Analysis</label>
          <button
            onClick={onAddGapAnalysis}
            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
          >
            + Add Gap
          </button>
        </div>
        <div className="space-y-3">
          {(remarksForm.gapAnalysis || []).map((gap: any, i: number) => (
            <div key={i} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 rounded border border-gray-200 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                {/* Topic Dropdown */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Topic</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                    value={gap.topic}
                    onChange={(e) => onUpdateGapAnalysis(i, "topic", e.target.value)}
                  >
                    <option value="">-- Select Topic --</option>
                    <option value="DSA">DSA (Data Structures & Algorithms)</option>
                    <option value="Arrays">Arrays</option>
                    <option value="LinkedList">Linked Lists</option>
                    <option value="Trees">Trees & BST</option>
                    <option value="Graphs">Graphs</option>
                    <option value="DP">Dynamic Programming</option>
                    <option value="React">React</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Node.js">Node.js</option>
                    <option value="DBMS">DBMS</option>
                    <option value="SQL">SQL</option>
                    <option value="OS">Operating Systems</option>
                    <option value="SystemDesign">System Design</option>
                    <option value="OOPS">OOP Concepts</option>
                  </select>
                </div>

                {/* Difficulty Dropdown */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Difficulty Level</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                    value={gap.difficulty}
                    onChange={(e) => onUpdateGapAnalysis(i, "difficulty", e.target.value)}
                  >
                    <option value="Easy">🟢 Easy</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Hard">🔴 Hard</option>
                  </select>
                </div>
              </div>

              {/* Gap Type Dropdown */}
              <div className="mb-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Gap Type</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  value={gap.gapType}
                  onChange={(e) => onUpdateGapAnalysis(i, "gapType", e.target.value)}
                >
                  <option value="Logic Issue">🧩 Logic Issue</option>
                  <option value="Concept Gap">💡 Concept Gap</option>
                  <option value="Time Complexity">⏱️ Time Complexity</option>
                  <option value="Other">📝 Other</option>
                </select>
              </div>

              {/* Custom Gap Type Input (if "Other" is selected) */}
              {gap.gapType === "Other" && (
                <div className="mb-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Specify Custom Gap Type</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-orange-300 rounded text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 bg-orange-50"
                    placeholder="e.g., Space Complexity, Edge Cases, etc."
                    value={gap.customGapType || ""}
                    onChange={(e) => onUpdateGapAnalysis(i, "customGapType", e.target.value)}
                  />
                </div>
              )}

              {/* Remove Button */}
              <div className="flex justify-end pt-2 border-t border-gray-200">
                <button
                  onClick={() => onRemoveGapAnalysis(i)}
                  className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Placement Window Timeline */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-gray-700">6. Placement Window Timeline</label>
          <button
            onClick={onAddPlacementWeek}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Week
          </button>
        </div>
        <div className="space-y-3">
          {(remarksForm.placementTimeline || []).map((entry: any, i: number) => (
            <div key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded border border-blue-200">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <select
                  className="p-2 border rounded text-sm outline-none focus:border-blue-400 font-semibold"
                  value={entry.week}
                  onChange={(e) => onUpdatePlacementWeek(i, "week", Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                    <option key={w} value={w}>
                      Week {w}
                    </option>
                  ))}
                </select>
                <select
                  className={`p-2 rounded text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400 ${
                    entry.status === "Interview Ready"
                      ? "bg-green-100 text-green-800"
                      : entry.status === "Improving"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                  value={entry.status}
                  onChange={(e) => onUpdatePlacementWeek(i, "status", e.target.value)}
                >
                  <option value="Not Ready">⚪ Not Ready</option>
                  <option value="Improving">🔵 Improving</option>
                  <option value="Interview Ready">🟢 Interview Ready</option>
                </select>
                <button
                  onClick={() => {
                    const newTimeline = remarksForm.placementTimeline.filter(
                      (_: any, idx: number) => idx !== i
                    );
                    onUpdatePlacementWeek(i, "_delete", newTimeline);
                  }}
                  className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium"
                >
                  Remove
                </button>
              </div>
              <textarea
                className="w-full p-2 border border-blue-200 rounded text-sm outline-none focus:border-blue-500 focus:ring-blue-100 min-h-20"
                placeholder="Remarks - Add plan, actions, or observations for this week..."
                value={entry.remarks}
                onChange={(e) => onUpdatePlacementWeek(i, "remarks", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
