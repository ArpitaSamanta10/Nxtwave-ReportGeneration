"use client";

import { Plus, Target } from "lucide-react";

interface GoodRemarksProps {
  remarksForm: any;
  onUpdate: (field: string, value: any) => void;
  onAddMockScore: () => void;
  onUpdateMockScore: (index: number, val: string) => void;
  onAddActionItem: () => void;
  onUpdateActionItem: (index: number, val: string) => void;
}

export function GoodRemarks({
  remarksForm,
  onUpdate,
  onAddMockScore,
  onUpdateMockScore,
  onAddActionItem,
  onUpdateActionItem,
}: GoodRemarksProps) {
  return (
    <div className="space-y-5">
      {/* Mock Scores Block */}
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

      {/* Interview Outcome */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-1">2. Mock Interview Outcome</label>
        <textarea
          className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400"
          rows={3}
          value={remarksForm.interviewOutcome || ""}
          onChange={(e) => onUpdate("interviewOutcome", e.target.value)}
          placeholder="Capture qualitative feedback..."
        />
      </div>

      {/* Mentor Note */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-1">3. Mentor Pre-Interview Note</label>
        <textarea
          className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400"
          rows={2}
          value={remarksForm.mentorNote || ""}
          onChange={(e) => onUpdate("mentorNote", e.target.value)}
          placeholder="Define expectations, focus areas..."
        />
      </div>

      {/* Strength to Project */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-2">4. Strength to Project</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="changesReq"
            className="rounded w-4 h-4 cursor-pointer"
            checked={remarksForm.changesRequired || false}
            onChange={(e) => onUpdate("changesRequired", e.target.checked)}
          />
          <label htmlFor="changesReq" className="text-sm font-medium text-gray-700 cursor-pointer">
            Changes Required (Check if remarks are mandatory)
          </label>
        </div>
        {remarksForm.changesRequired && (
          <textarea
            className="w-full p-2 border border-red-300 rounded text-sm outline-none focus:border-red-500"
            rows={2}
            required
            value={remarksForm.projectRemarks || ""}
            onChange={(e) => onUpdate("projectRemarks", e.target.value)}
            placeholder="Project Remarks (Mandatory)..."
          />
        )}
      </div>

      {/* Action Items */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-2">5. Action Items Suggested</label>
        <div className="space-y-2">
          {(remarksForm.actionItems || [""]).map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-400">•</span>
              <input
                type="text"
                className="flex-1 p-2 border rounded text-sm outline-none focus:border-blue-400"
                value={item}
                onChange={(e) => onUpdateActionItem(i, e.target.value)}
                placeholder="e.g. Improve system design basics"
              />
            </div>
          ))}
          <button
            onClick={onAddActionItem}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mt-1"
          >
            <Plus size={14} /> Add item
          </button>
        </div>
      </div>

      {/* Role + Tier Projection */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-3">6. Role & Company Tier Projection</label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Role</label>
            <select
              className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400"
              value={remarksForm.roleProjection || ""}
              onChange={(e) => onUpdate("roleProjection", e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Other">Other (specify below)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Tier</label>
            <select
              className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400"
              value={remarksForm.tierProjection || ""}
              onChange={(e) => onUpdate("tierProjection", e.target.value)}
            >
              <option value="">Select Tier</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Tier 3">Tier 3</option>
              <option value="Other">Other (specify below)</option>
            </select>
          </div>
        </div>

        {remarksForm.roleProjection === "Other" && (
          <div className="mb-2">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Specify Custom Role</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400"
              value={remarksForm.customRole || ""}
              onChange={(e) => onUpdate("customRole", e.target.value)}
              placeholder="Enter role..."
            />
          </div>
        )}

        {remarksForm.tierProjection === "Other" && (
          <div className="mb-2">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Specify Custom Tier</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400"
              value={remarksForm.customTier || ""}
              onChange={(e) => onUpdate("customTier", e.target.value)}
              placeholder="Enter tier..."
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Justification</label>
          <textarea
            className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400"
            rows={2}
            value={remarksForm.projectionJustification || ""}
            onChange={(e) => onUpdate("projectionJustification", e.target.value)}
            placeholder="Why this role & tier?"
          />
        </div>
      </div>
    </div>
  );
}
