import { supabase } from "./supabase";
import type { Batch, Student, RemarksCategory } from "@/components/types";

// ========== BATCHES ==========
export async function createBatch(batchName: string) {
  try {
    const { data, error } = await supabase
      .from("batches")
      .insert([{ batch_name: batchName }])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error creating batch:", error);
    throw error;
  }
}

export async function fetchBatches() {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching batches:", error);
    return [];
  }
}

export async function deleteBatch(batchId: string) {
  try {
    const { error } = await supabase
      .from("batches")
      .delete()
      .eq("id", batchId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting batch:", error);
    throw error;
  }
}

// ========== STUDENTS ==========
export async function createStudent(student: Omit<Student, "updatedAt">) {
  try {
    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          id: student.id,
          full_name: student.name,
          email: student.email,
          batch_id: student.batchId,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
}

export async function createBulkStudents(students: Omit<Student, "updatedAt">[]) {
  try {
    const studentRecords = students.map((s) => ({
      id: s.id,
      full_name: s.name,
      email: s.email,
      batch_id: s.batchId,
    }));

    const { data, error } = await supabase
      .from("students")
      .insert(studentRecords)
      .select();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error creating bulk students:", error);
    throw error;
  }
}

export async function fetchStudents(batchId?: string) {
  try {
    let query = supabase.from("students").select("*");

    if (batchId) {
      query = query.eq("batch_id", batchId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}

// ========== EVALUATIONS & METRICS ==========

export async function createEvaluation(
  studentId: string,
  category: RemarksCategory
) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .insert([{ student_id: studentId, category }])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error creating evaluation:", error);
    throw error;
  }
}

// --- GOOD METRICS ---
export async function saveGoodMetrics(
  evalId: string,
  metrics: any
) {
  try {
    const { error } = await supabase
      .from("metrics_good")
      .upsert(
        {
          evaluation_id: evalId,
          mock_interview_outcome: metrics.interviewOutcome || null,
          mentor_pre_interview_note: metrics.mentorNote || null,
          strength_to_project_changes_required: metrics.changesRequired || false,
          role_projection: metrics.roleProjection || null,
          tier_projection: metrics.tierProjection || null,
          justification: metrics.projectionJustification || null,
        },
        { onConflict: "evaluation_id" }
      );

    if (error) throw error;
  } catch (error) {
    console.error("Error saving good metrics:", error);
    throw error;
  }
}

// --- ABOVE AVERAGE METRICS ---
export async function saveAboveAverageMetrics(
  evalId: string,
  metrics: any
) {
  try {
    const { error } = await supabase
      .from("metrics_above_average")
      .upsert(
        {
          evaluation_id: evalId,
          score_improvement_trend: JSON.stringify(metrics.scoreTrends || []),
          revision_attendance_log: (metrics.attendanceLog?.length || 0) > 0,
          mentor_weekly_observation: JSON.stringify(
            metrics.mentorObservations || []
          ),
          problem_level_gap_analysis: JSON.stringify(metrics.gapAnalysis || []),
          placement_window_timeline: JSON.stringify(
            metrics.placementTimeline || []
          ),
        },
        { onConflict: "evaluation_id" }
      );

    if (error) throw error;
  } catch (error) {
    console.error("Error saving above average metrics:", error);
    throw error;
  }
}

// --- AVERAGE METRICS ---
export async function saveAverageMetrics(
  evalId: string,
  metrics: any
) {
  try {
    const scores = metrics.checkpointScores || [0, 0, 0, 0];
    
    const { error } = await supabase
      .from("metrics_average")
      .upsert(
        {
          evaluation_id: evalId,
          checkpoint_score_1: scores[0] || 0,
          checkpoint_score_2: scores[1] || 0,
          checkpoint_score_3: scores[2] || 0,
          checkpoint_score_4: scores[3] || 0,
          daily_practice_percentage: metrics.dailyPractice || 0,
          workshop_attendance_percentage: metrics.workshopAttendance || 0,
          phase_wise_readiness_signal: metrics.readiness || null,
        },
        { onConflict: "evaluation_id" }
      );

    if (error) throw error;
  } catch (error) {
    console.error("Error saving average metrics:", error);
    throw error;
  }
}

// --- POOR METRICS ---
export async function savePoorMetrics(
  evalId: string,
  metrics: any
) {
  try {
    const scores = metrics.remedialScores || [0, 0, 0];
    
    const { error } = await supabase
      .from("metrics_poor")
      .upsert(
        {
          evaluation_id: evalId,
          bootcamp_progress_percentage: metrics.progress || 0,
          project_submission_status: metrics.submissionStats || null,
          buddy_mentor_notes: metrics.buddyNotes || null,
          remedial_mock_score_1: scores[0] || 0,
          remedial_mock_score_2: scores[1] || 0,
          remedial_mock_score_3: scores[2] || 0,
        },
        { onConflict: "evaluation_id" }
      );

    if (error) throw error;
  } catch (error) {
    console.error("Error saving poor metrics:", error);
    throw error;
  }
}

// --- DYNAMIC MOCK SCORES ---
export async function saveMockScores(evalId: string, scores: any[]) {
  try {
    // Delete existing mock scores for this evaluation
    await supabase
      .from("evaluation_mock_scores")
      .delete()
      .eq("evaluation_id", evalId);

    // Insert new mock scores
    const mockScoreRecords = scores.map((score, index) => ({
      evaluation_id: evalId,
      score: score,
      label: `Mock ${index + 1}`,
    }));

    const { error } = await supabase
      .from("evaluation_mock_scores")
      .insert(mockScoreRecords);

    if (error) throw error;
  } catch (error) {
    console.error("Error saving mock scores:", error);
    throw error;
  }
}

// --- DYNAMIC ACTION ITEMS ---
export async function saveActionItems(evalId: string, items: string[]) {
  try {
    // Delete existing action items for this evaluation
    await supabase
      .from("evaluation_action_items")
      .delete()
      .eq("evaluation_id", evalId);

    // Insert new action items
    const actionItemRecords = items
      .filter((item) => item.trim())
      .map((item) => ({
        evaluation_id: evalId,
        item_text: item,
      }));

    if (actionItemRecords.length > 0) {
      const { error } = await supabase
        .from("evaluation_action_items")
        .insert(actionItemRecords);

      if (error) throw error;
    }
  } catch (error) {
    console.error("Error saving action items:", error);
    throw error;
  }
}

// --- COMPLETE EVALUATION SAVE (All in one) ---
export async function saveCompleteEvaluation(
  studentId: string,
  category: RemarksCategory,
  metrics: any
) {
  try {
    // First, check if evaluation exists for this student and category
    let evalId: string;

    const { data: existingEval } = await supabase
      .from("evaluations")
      .select("id")
      .eq("student_id", studentId)
      .eq("category", category)
      .single();

    if (existingEval) {
      evalId = existingEval.id;
      // Update existing evaluation
      await supabase
        .from("evaluations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", evalId);
    } else {
      // Create new evaluation
      const newEval = await createEvaluation(studentId, category);
      evalId = newEval.id;
    }

    // Save category-specific metrics
    if (category === "Good") {
      await saveGoodMetrics(evalId, metrics);
    } else if (category === "Above Average") {
      await saveAboveAverageMetrics(evalId, metrics);
    } else if (category === "Average") {
      await saveAverageMetrics(evalId, metrics);
    } else if (category === "Poor") {
      await savePoorMetrics(evalId, metrics);
    }

    // Save dynamic fields if they exist
    if (metrics.mockScores) {
      await saveMockScores(evalId, metrics.mockScores);
    }

    if (metrics.actionItems) {
      await saveActionItems(evalId, metrics.actionItems);
    }

    return evalId;
  } catch (error) {
    console.error("Error saving complete evaluation:", error);
    throw error;
  }
}

// --- FETCH EVALUATIONS ---
export async function fetchEvaluationsForStudent(studentId: string) {
  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return [];
  }
}
