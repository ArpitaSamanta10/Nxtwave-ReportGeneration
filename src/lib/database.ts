import { supabase } from "./supabase";
import type { Batch, Student, RemarksCategory } from "@/components/types";

// ========== BATCHES ==========
export async function createBatch(batchName: string) {
  try {
    const { data, error } = await supabase
      .from("batches")
      .insert([{ batch_name: batchName }])
      .select();

    if (error) {
      const errorMessage = `Supabase error: ${error.message || JSON.stringify(error)} | Batch: ${batchName} | Context: Create Batch`;
      throw new Error(errorMessage);
    }
    return data?.[0];
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error creating batch:", errorDetail);
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

    if (error) {
      const errorMessage = `Supabase error: ${error.message || JSON.stringify(error)} | Student: ${student.id} | Context: Create Student`;
      throw new Error(errorMessage);
    }
    return data?.[0];
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error creating student:", errorDetail);
    throw error;
  }
}

export async function createBulkStudents(students: Omit<Student, "updatedAt">[]) {
  const results = {
    successful: 0,
    failed: 0,
    duplicates: 0,
    errors: [] as string[],
  };

  try {
    // Try to insert all students at once first
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

    if (error) {
      // If bulk insert fails (likely due to duplicates), try one by one
      console.warn("Bulk insert failed, attempting individual inserts:", error.message);

      for (const student of students) {
        try {
          const { error: insertError } = await supabase
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

          if (insertError) {
            if (insertError.code === "23505") {
              // Duplicate key error
              results.duplicates++;
            } else {
              results.failed++;
              results.errors.push(
                `${student.id}: ${insertError.message || insertError.code}`
              );
            }
          } else {
            results.successful++;
          }
        } catch (singleError) {
          results.failed++;
          results.errors.push(`${student.id}: ${String(singleError)}`);
        }
      }

      console.log("Import results:", results);

      // Return the results so caller knows what happened
      return {
        students: [],
        results,
      };
    }

    // If bulk insert succeeded
    results.successful = data?.length || 0;
    return {
      students: data || [],
      results,
    };
  } catch (error) {
    console.error("Error creating bulk students:", error);
    throw error;
  }
}

// --- CREATE BULK EVALUATIONS FOR IMPORTED STUDENTS ---
export async function createBulkEvaluations(
  students: Omit<Student, "updatedAt">[]
) {
  try {
    // Filter students that have a category
    const studentsWithCategory = students.filter(
      (s) => s.category && ["Good", "Above Average", "Average", "Poor"].includes(s.category)
    );

    if (studentsWithCategory.length === 0) {
      console.log("No students with categories to create evaluations for");
      return { created: 0 };
    }

    // Create evaluation records for each student
    const evaluationRecords = studentsWithCategory.map((s) => ({
      student_id: s.id,
      category: s.category,
    }));

    const { data, error } = await supabase
      .from("evaluations")
      .insert(evaluationRecords)
      .select();

    if (error) {
      console.warn("Bulk evaluation insert failed, attempting individual inserts:", error.message);

      let successCount = 0;
      for (const record of evaluationRecords) {
        try {
          const { error: insertError } = await supabase
            .from("evaluations")
            .insert([record]);

          if (!insertError) {
            successCount++;
          }
        } catch (e) {
          console.error("Failed to create evaluation for student:", record.student_id, e);
        }
      }

      return { created: successCount };
    }

    console.log(
      `Created ${data?.length || 0} evaluations for imported students`
    );
    return { created: data?.length || 0 };
  } catch (error) {
    console.error("Error creating bulk evaluations:", error);
    return { created: 0 };
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
    if (!evalId) {
      throw new Error("Missing evaluation ID for good metrics");
    }

    // Define all fields
    const allFields = {
      evaluation_id: evalId,
      mock_interview_outcome: metrics.interviewOutcome || null,
      mentor_pre_interview_note: metrics.mentorNote || null,
      strength_to_project_changes_required: metrics.changesRequired || false,
      strength_to_project_remarks: metrics.projectRemarks || null,
      role_projection: metrics.roleProjection || null,
      tier_projection: metrics.tierProjection || null,
      justification: metrics.projectionJustification || null,
    };

    // Try full save first
    const { error: fullError } = await supabase
      .from("metrics_good")
      .upsert(allFields, { onConflict: "evaluation_id" });

    if (!fullError) {
      console.log("✓ Good metrics saved successfully with all fields");
      return;
    }

    // If full save fails, test fields individually to identify schema issues
    console.warn("Full save failed. Diagnosing field compatibility...");

    // Test each field individually
    const fieldTests = [
      { name: "mock_interview_outcome", value: allFields.mock_interview_outcome },
      { name: "mentor_pre_interview_note", value: allFields.mentor_pre_interview_note },
      { name: "strength_to_project_changes_required", value: allFields.strength_to_project_changes_required },
      { name: "strength_to_project_remarks", value: allFields.strength_to_project_remarks },
      { name: "role_projection", value: allFields.role_projection },
      { name: "tier_projection", value: allFields.tier_projection },
      { name: "justification", value: allFields.justification },
    ];

    const workingFields: string[] = [];
    const failingFields: { name: string; error: string }[] = [];

    for (const field of fieldTests) {
      const testData = { evaluation_id: evalId, [field.name]: field.value };
      const { error: fieldError } = await supabase
        .from("metrics_good")
        .upsert(testData, { onConflict: "evaluation_id" });

      if (!fieldError) {
        workingFields.push(field.name);
        console.log(`  ✓ ${field.name} - Compatible`);
      } else {
        failingFields.push({ name: field.name, error: fieldError.message });
        console.log(`  ✗ ${field.name} - ${fieldError.message}`);
      }
    }

    if (workingFields.length === 0) {
      throw new Error(
        `No fields could be saved. All columns have schema issues. Details:\n${failingFields
          .map((f) => `${f.name}: ${f.error}`)
          .join("\n")}`
      );
    }

    // Save using only compatible fields
    const compatibleData: any = { evaluation_id: evalId };
    for (const fieldName of workingFields) {
      compatibleData[fieldName] = allFields[fieldName as keyof typeof allFields];
    }

    const { error: compatibleError } = await supabase
      .from("metrics_good")
      .upsert(compatibleData, { onConflict: "evaluation_id" });

    if (compatibleError) {
      throw new Error(`Failed to save compatible fields: ${compatibleError.message}`);
    }

    console.log(
      `✓ Saved Good metrics using compatible fields: ${workingFields.join(", ")}`
    );

    if (failingFields.length > 0) {
      console.warn(
        "⚠️  Some fields could not be saved due to schema type mismatches:",
        failingFields.map((f) => f.name).join(", ")
      );
      console.warn("📄 See SUPABASE_SCHEMA_FIX.md in the project root for SQL to fix this.");
    }
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error saving good metrics:", errorDetail);
    throw error;
  }
}

// --- ABOVE AVERAGE METRICS ---
export async function saveAboveAverageMetrics(
  evalId: string,
  metrics: any
) {
  try {
    if (!evalId) {
      throw new Error("Missing evaluation ID for above average metrics");
    }

    // Define all fields
    const allFields = {
      evaluation_id: evalId,
      score_improvement_trend: metrics.scoreTrends ? JSON.stringify(metrics.scoreTrends) : null,
      revision_attendance_log: metrics.attendanceLog ? JSON.stringify(metrics.attendanceLog) : null,
      mentor_weekly_observation: metrics.mentorObservations ? JSON.stringify(metrics.mentorObservations) : null,
      problem_level_gap_analysis: metrics.gapAnalysis ? JSON.stringify(metrics.gapAnalysis) : null,
      placement_window_timeline: metrics.placementTimeline ? JSON.stringify(metrics.placementTimeline) : null,
    };

    // Try full save first
    const { error: fullError } = await supabase
      .from("metrics_above_average")
      .upsert(allFields, { onConflict: "evaluation_id" });

    if (!fullError) {
      console.log("✓ Above Average metrics saved successfully with all fields");
      return;
    }

    // If full save fails, test fields individually to identify schema issues
    console.warn("Full save failed. Diagnosing field compatibility...");
    
    const booleanFieldRegex = /invalid input syntax for type boolean/i;
    const isBooleanError = booleanFieldRegex.test(fullError.message);

    if (isBooleanError) {
      console.error(
        "⚠️  SCHEMA ISSUE DETECTED: One or more columns in metrics_above_average have boolean type but need JSONB/TEXT.",
        "See SUPABASE_SCHEMA_FIX.md for SQL to fix this."
      );
    }

    // Test each field individually
    const fieldTests = [
      { name: "score_improvement_trend", value: allFields.score_improvement_trend },
      { name: "revision_attendance_log", value: allFields.revision_attendance_log },
      { name: "mentor_weekly_observation", value: allFields.mentor_weekly_observation },
      { name: "problem_level_gap_analysis", value: allFields.problem_level_gap_analysis },
      { name: "placement_window_timeline", value: allFields.placement_window_timeline },
    ];

    const workingFields: string[] = [];
    const failingFields: { name: string; error: string }[] = [];

    for (const field of fieldTests) {
      const testData = { evaluation_id: evalId, [field.name]: field.value };
      const { error: fieldError } = await supabase
        .from("metrics_above_average")
        .upsert(testData, { onConflict: "evaluation_id" });

      if (!fieldError) {
        workingFields.push(field.name);
        console.log(`  ✓ ${field.name} - Compatible`);
      } else {
        failingFields.push({ name: field.name, error: fieldError.message });
        console.log(`  ✗ ${field.name} - ${fieldError.message}`);
      }
    }

    if (workingFields.length === 0) {
      throw new Error(
        `No fields could be saved. All columns have schema issues. Details:\n${failingFields
          .map((f) => `${f.name}: ${f.error}`)
          .join("\n")}`
      );
    }

    // Save using only compatible fields
    const compatibleData: any = { evaluation_id: evalId };
    for (const fieldName of workingFields) {
      compatibleData[fieldName] = allFields[fieldName as keyof typeof allFields];
    }

    const { error: compatibleError } = await supabase
      .from("metrics_above_average")
      .upsert(compatibleData, { onConflict: "evaluation_id" });

    if (compatibleError) {
      throw new Error(`Failed to save compatible fields: ${compatibleError.message}`);
    }

    console.log(
      `✓ Saved Above Average metrics using compatible fields: ${workingFields.join(", ")}`
    );

    if (failingFields.length > 0) {
      console.warn(
        "⚠️  Some fields could not be saved due to schema type mismatches:",
        failingFields.map((f) => f.name).join(", ")
      );
      console.warn("📄 See SUPABASE_SCHEMA_FIX.md in the project root for SQL to fix this.");
    }
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error saving above average metrics:", errorDetail);
    throw error;
  }
}

// --- AVERAGE METRICS ---
export async function saveAverageMetrics(
  evalId: string,
  metrics: any
) {
  try {
    if (!evalId) {
      throw new Error("Missing evaluation ID for average metrics");
    }

    const scores = metrics.checkpointScores || [0, 0, 0, 0];

    // Define all fields
    const allFields = {
      evaluation_id: evalId,
      checkpoint_score_1: scores[0] || 0,
      checkpoint_score_2: scores[1] || 0,
      checkpoint_score_3: scores[2] || 0,
      checkpoint_score_4: scores[3] || 0,
      daily_practice_percentage: metrics.dailyPractice || 0,
      workshop_attendance_percentage: metrics.workshopAttendance || 0,
      phase_wise_readiness_signal: metrics.readiness || null,
    };

    // Try full save first
    const { error: fullError } = await supabase
      .from("metrics_average")
      .upsert(allFields, { onConflict: "evaluation_id" });

    if (!fullError) {
      console.log("✓ Average metrics saved successfully with all fields");
      return;
    }

    // If full save fails, test fields individually to identify schema issues
    console.warn("Full save failed. Diagnosing field compatibility...");

    // Test each field individually
    const fieldTests = [
      { name: "checkpoint_score_1", value: allFields.checkpoint_score_1 },
      { name: "checkpoint_score_2", value: allFields.checkpoint_score_2 },
      { name: "checkpoint_score_3", value: allFields.checkpoint_score_3 },
      { name: "checkpoint_score_4", value: allFields.checkpoint_score_4 },
      { name: "daily_practice_percentage", value: allFields.daily_practice_percentage },
      { name: "workshop_attendance_percentage", value: allFields.workshop_attendance_percentage },
      { name: "phase_wise_readiness_signal", value: allFields.phase_wise_readiness_signal },
    ];

    const workingFields: string[] = [];
    const failingFields: { name: string; error: string }[] = [];

    for (const field of fieldTests) {
      const testData = { evaluation_id: evalId, [field.name]: field.value };
      const { error: fieldError } = await supabase
        .from("metrics_average")
        .upsert(testData, { onConflict: "evaluation_id" });

      if (!fieldError) {
        workingFields.push(field.name);
        console.log(`  ✓ ${field.name} - Compatible`);
      } else {
        failingFields.push({ name: field.name, error: fieldError.message });
        console.log(`  ✗ ${field.name} - ${fieldError.message}`);
      }
    }

    if (workingFields.length === 0) {
      throw new Error(
        `No fields could be saved. All columns have schema issues. Details:\n${failingFields
          .map((f) => `${f.name}: ${f.error}`)
          .join("\n")}`
      );
    }

    // Save using only compatible fields
    const compatibleData: any = { evaluation_id: evalId };
    for (const fieldName of workingFields) {
      compatibleData[fieldName] = allFields[fieldName as keyof typeof allFields];
    }

    const { error: compatibleError } = await supabase
      .from("metrics_average")
      .upsert(compatibleData, { onConflict: "evaluation_id" });

    if (compatibleError) {
      throw new Error(`Failed to save compatible fields: ${compatibleError.message}`);
    }

    console.log(
      `✓ Saved Average metrics using compatible fields: ${workingFields.join(", ")}`
    );

    if (failingFields.length > 0) {
      console.warn(
        "⚠️  Some fields could not be saved due to schema type mismatches:",
        failingFields.map((f) => f.name).join(", ")
      );
      console.warn("📄 See SUPABASE_SCHEMA_FIX.md in the project root for SQL to fix this.");
    }
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error saving average metrics:", errorDetail);
    throw error;
  }
}

// --- POOR METRICS ---
export async function savePoorMetrics(
  evalId: string,
  metrics: any
) {
  try {
    if (!evalId) {
      throw new Error("Missing evaluation ID for poor metrics");
    }

    const scores = metrics.remedialScores || [0, 0, 0];

    // Define all fields
    const allFields = {
      evaluation_id: evalId,
      bootcamp_progress_percentage: metrics.progress || 0,
      project_submission_status: metrics.submissionStats || null,
      buddy_mentor_notes: metrics.buddyNotes || null,
      remedial_mock_score_1: scores[0] || 0,
      remedial_mock_score_2: scores[1] || 0,
      remedial_mock_score_3: scores[2] || 0,
    };

    // Try full save first
    const { error: fullError } = await supabase
      .from("metrics_poor")
      .upsert(allFields, { onConflict: "evaluation_id" });

    if (!fullError) {
      console.log("✓ Poor metrics saved successfully with all fields");
      return;
    }

    // If full save fails, test fields individually to identify schema issues
    console.warn("Full save failed. Diagnosing field compatibility...");

    // Test each field individually
    const fieldTests = [
      { name: "bootcamp_progress_percentage", value: allFields.bootcamp_progress_percentage },
      { name: "project_submission_status", value: allFields.project_submission_status },
      { name: "buddy_mentor_notes", value: allFields.buddy_mentor_notes },
      { name: "remedial_mock_score_1", value: allFields.remedial_mock_score_1 },
      { name: "remedial_mock_score_2", value: allFields.remedial_mock_score_2 },
      { name: "remedial_mock_score_3", value: allFields.remedial_mock_score_3 },
    ];

    const workingFields: string[] = [];
    const failingFields: { name: string; error: string }[] = [];

    for (const field of fieldTests) {
      const testData = { evaluation_id: evalId, [field.name]: field.value };
      const { error: fieldError } = await supabase
        .from("metrics_poor")
        .upsert(testData, { onConflict: "evaluation_id" });

      if (!fieldError) {
        workingFields.push(field.name);
        console.log(`  ✓ ${field.name} - Compatible`);
      } else {
        failingFields.push({ name: field.name, error: fieldError.message });
        console.log(`  ✗ ${field.name} - ${fieldError.message}`);
      }
    }

    if (workingFields.length === 0) {
      throw new Error(
        `No fields could be saved. All columns have schema issues. Details:\n${failingFields
          .map((f) => `${f.name}: ${f.error}`)
          .join("\n")}`
      );
    }

    // Save using only compatible fields
    const compatibleData: any = { evaluation_id: evalId };
    for (const fieldName of workingFields) {
      compatibleData[fieldName] = allFields[fieldName as keyof typeof allFields];
    }

    const { error: compatibleError } = await supabase
      .from("metrics_poor")
      .upsert(compatibleData, { onConflict: "evaluation_id" });

    if (compatibleError) {
      throw new Error(`Failed to save compatible fields: ${compatibleError.message}`);
    }

    console.log(
      `✓ Saved Poor metrics using compatible fields: ${workingFields.join(", ")}`
    );

    if (failingFields.length > 0) {
      console.warn(
        "⚠️  Some fields could not be saved due to schema type mismatches:",
        failingFields.map((f) => f.name).join(", ")
      );
      console.warn("📄 See SUPABASE_SCHEMA_FIX.md in the project root for SQL to fix this.");
    }
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error saving poor metrics:", errorDetail);
    throw error;
  }
}

// --- DYNAMIC MOCK SCORES ---
export async function saveMockScores(evalId: string, scores: any[]) {
  try {
    if (!evalId) {
      throw new Error("Missing evaluation ID for mock scores");
    }

    // Delete existing mock scores for this evaluation
    const { error: deleteError } = await supabase
      .from("evaluation_mock_scores")
      .delete()
      .eq("evaluation_id", evalId);

    if (deleteError) {
      // If table doesn't exist, log warning and return (not critical)
      if (deleteError.message.includes("Could not find the table")) {
        console.warn("⚠️  Mock scores table does not exist. Skipping mock scores save.");
        return;
      }
      throw deleteError;
    }

    // Insert new mock scores
    const mockScoreRecords = scores.map((score, index) => ({
      evaluation_id: evalId,
      score: score,
      label: `Mock ${index + 1}`,
    }));

    const { error } = await supabase
      .from("evaluation_mock_scores")
      .insert(mockScoreRecords);

    if (error) {
      if (error.message.includes("Could not find the table")) {
        console.warn("⚠️  Mock scores table does not exist. Skipping mock scores save.");
        return;
      }
      const errorMessage = `Supabase error: ${error.message || JSON.stringify(error)} | evalId: ${evalId} | Context: Mock Scores`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error saving mock scores:", errorDetail);
    // Don't throw - mock scores are optional, don't block main save
  }
}

// --- DYNAMIC ACTION ITEMS ---
export async function saveActionItems(evalId: string, items: string[]) {
  try {
    if (!evalId) {
      throw new Error("Missing evaluation ID for action items");
    }

    // Delete existing action items for this evaluation
    const { error: deleteError } = await supabase
      .from("evaluation_action_items")
      .delete()
      .eq("evaluation_id", evalId);

    if (deleteError) {
      // If table doesn't exist, log warning and return (not critical)
      if (deleteError.message.includes("Could not find the table")) {
        console.warn("⚠️  Action items table does not exist. Skipping action items save.");
        return;
      }
      throw deleteError;
    }

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

      if (error) {
        if (error.message.includes("Could not find the table")) {
          console.warn("⚠️  Action items table does not exist. Skipping action items save.");
          return;
        }
        const errorMessage = `Supabase error: ${error.message || JSON.stringify(error)} | evalId: ${evalId} | Context: Action Items`;
        throw new Error(errorMessage);
      }
    }
  } catch (error) {
    const errorDetail = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error saving action items:", errorDetail);
    // Don't throw - action items are optional, don't block main save
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

// --- FETCH METRICS FOR A SPECIFIC EVALUATION ---
export async function fetchMetricsForEvaluation(
  evalId: string,
  category: RemarksCategory
) {
  try {
    let tableName = "";
    
    if (category === "Good") {
      tableName = "metrics_good";
    } else if (category === "Above Average") {
      tableName = "metrics_above_average";
    } else if (category === "Average") {
      tableName = "metrics_average";
    } else if (category === "Poor") {
      tableName = "metrics_poor";
    }

    if (!tableName) {
      console.warn("No table found for category:", category);
      return null;
    }

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("evaluation_id", evalId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 = no rows found, which is OK
        console.log(`No metrics found for evaluation ${evalId} in ${tableName}`);
        return null;
      }
      throw error;
    }

    console.log(`Fetched metrics for ${category}:`, data);
    return data || null;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
}

// --- FETCH MOCK SCORES FOR EVALUATION ---
export async function fetchMockScoresForEvaluation(evalId: string) {
  try {
    const { data, error } = await supabase
      .from("evaluation_mock_scores")
      .select("*")
      .eq("evaluation_id", evalId)
      .order("id", { ascending: true });

    if (error) {
      if (error.message.includes("Could not find the table")) {
        console.warn("⚠️  Mock scores table does not exist.");
        return [];
      }
      throw error;
    }
    return data?.map((d: any) => d.score) || [];
  } catch (error) {
    console.error("Error fetching mock scores:", error);
    return [];
  }
}

// --- FETCH ACTION ITEMS FOR EVALUATION ---
export async function fetchActionItemsForEvaluation(evalId: string) {
  try {
    const { data, error } = await supabase
      .from("evaluation_action_items")
      .select("*")
      .eq("evaluation_id", evalId)
      .order("id", { ascending: true });

    if (error) {
      if (error.message.includes("Could not find the table")) {
        console.warn("⚠️  Action items table does not exist.");
        return [];
      }
      throw error;
    }
    return data?.map((d: any) => d.item_text) || [];
  } catch (error) {
    console.error("Error fetching action items:", error);
    return [];
  }
}

// --- FETCH COMPLETE STUDENT DATA WITH EVALUATIONS ---
export async function fetchStudentsWithEvaluations(batchId?: string) {
  try {
    let studentQuery = supabase.from("students").select("*");

    if (batchId) {
      studentQuery = studentQuery.eq("batch_id", batchId);
    }

    const { data: students, error: studentError } = await studentQuery.order(
      "created_at",
      { ascending: false }
    );

    if (studentError) throw studentError;

    // Helper function to safely parse JSON
    const safeJsonParse = (jsonString: string | null, defaultValue: any = []) => {
      if (!jsonString) return defaultValue;
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.error("JSON parse error:", e, jsonString);
        return defaultValue;
      }
    };

    // For each student, fetch their latest evaluation
    const studentsWithRemarks = await Promise.all(
      (students || []).map(async (s: any) => {
        const evaluations = await fetchEvaluationsForStudent(s.id);
        const latestEval = evaluations?.[0];

        if (latestEval) {
          const metrics = await fetchMetricsForEvaluation(
            latestEval.id,
            latestEval.category
          );
          const mockScores = await fetchMockScoresForEvaluation(latestEval.id);
          const actionItems = await fetchActionItemsForEvaluation(latestEval.id);

          // Map database fields to UI field names based on category
          let remarksDetails: any = {
            mockScores: mockScores || [],
            actionItems: actionItems || [],
          };

          if (metrics) {
            if (latestEval.category === "Good") {
              remarksDetails = {
                ...remarksDetails,
                mockScores: mockScores || [],
                calculatedAverage: 0,
                interviewOutcome: metrics.mock_interview_outcome || "",
                mentorNote: metrics.mentor_pre_interview_note || "",
                changesRequired: metrics.strength_to_project_changes_required || false,
                projectRemarks: metrics.strength_to_project_remarks || "",
                actionItems: actionItems || [""],
                roleProjection: metrics.role_projection || "",
                customRole: "",
                tierProjection: metrics.tier_projection || "",
                customTier: "",
                projectionJustification: metrics.justification || "",
              };
            } else if (latestEval.category === "Above Average") {
              remarksDetails = {
                ...remarksDetails,
                mockScores: mockScores || [],
                calculatedAverage: 0,
                scoreTrends: safeJsonParse(metrics.score_improvement_trend, []),
                attendanceLog: safeJsonParse(metrics.revision_attendance_log, []),
                mentorObservations: safeJsonParse(metrics.mentor_weekly_observation, []),
                gapAnalysis: safeJsonParse(metrics.problem_level_gap_analysis, []),
                placementTimeline: safeJsonParse(metrics.placement_window_timeline, []),
              };
            } else if (latestEval.category === "Average") {
              remarksDetails = {
                ...remarksDetails,
                checkpointScores: [
                  metrics.checkpoint_score_1 || 0,
                  metrics.checkpoint_score_2 || 0,
                  metrics.checkpoint_score_3 || 0,
                  metrics.checkpoint_score_4 || 0,
                ],
                dailyPractice: metrics.daily_practice_percentage || 0,
                workshopAttendance: metrics.workshop_attendance_percentage || 0,
                readiness: metrics.phase_wise_readiness_signal || "",
              };
            } else if (latestEval.category === "Poor") {
              remarksDetails = {
                ...remarksDetails,
                progress: metrics.bootcamp_progress_percentage || 0,
                submissionStats: metrics.project_submission_status || "",
                buddyNotes: metrics.buddy_mentor_notes || "",
                remedialScores: [
                  metrics.remedial_mock_score_1 || 0,
                  metrics.remedial_mock_score_2 || 0,
                  metrics.remedial_mock_score_3 || 0,
                ],
              };
            }
          }

          console.log(
            `Loaded remarks for ${s.full_name} (${latestEval.category}):`,
            remarksDetails
          );

          return {
            id: s.id,
            name: s.full_name,
            email: s.email,
            batchId: s.batch_id,
            category: latestEval.category,
            remarksDetails,
            updatedAt: latestEval.updated_at || s.created_at,
          };
        }

        return {
          id: s.id,
          name: s.full_name,
          email: s.email,
          batchId: s.batch_id,
          category: "",
          remarksDetails: null,
          updatedAt: s.created_at,
        };
      })
    );

    console.log("Fetched students with evaluations:", studentsWithRemarks);
    return studentsWithRemarks;
  } catch (error) {
    console.error("Error fetching students with evaluations:", error);
    return [];
  }
}
