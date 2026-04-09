import { supabaseServer } from "@/lib/supabaseServer";
import { generateReportForStudent } from "@/lib/reportGenerator";
import type { GeneratedReport } from "@/lib/reportGenerator";
import type { Student } from "@/components/types";
import { NextRequest, NextResponse } from "next/server";

// ========== SMART REPORT GENERATION ==========
// This only generates a new report if remarks actually changed.
// If remarks didn't change, it returns the cached report instead.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, remarksCategory, remarksDetails } = body;

    console.log("API Received:", {
      studentId,
      remarksCategory,
      remarksDetailsKeys: remarksDetails ? Object.keys(remarksDetails) : [],
      fullBody: body,
    });

    if (!studentId || !remarksCategory) {
      console.error("Validation failed:", {
        hasStudentId: !!studentId,
        hasRemarksCategory: !!remarksCategory,
        studentId,
        remarksCategory,
      });
      return NextResponse.json(
        { 
          error: "Missing studentId or remarksCategory",
          received: { studentId, remarksCategory },
        },
        { status: 400 }
      );
    }

    // Fetch current student data
    const { data: student, error: fetchError } = await supabaseServer
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    console.log("Student fetch result:", {
      found: !!student,
      error: fetchError?.message,
      studentId,
    });

    if (fetchError || !student) {
      return NextResponse.json(
        { error: "Student not found", studentId, fetchError: fetchError?.message },
        { status: 404 }
      );
    }

    // Check if remarks category changed (regenerate if tier changed or no report exists)
    const remarksChanged = student.category !== remarksCategory || !student.report;

    console.log("Remarks comparison:", {
      storedCategory: student.category,
      newCategory: remarksCategory,
      hasExistingReport: !!student.report,
      changed: remarksChanged,
    });

    if (!remarksChanged && student.report) {
      // Remarks same and report exists - return cached report
      console.log("Using cached report");
      return NextResponse.json({
        message: "Using cached report (remarks unchanged)",
        report: student.report,
        isNew: false,
      });
    }

    // Remarks changed - generate new report with AI
    try {
      console.log("Generating new report with AI...");
      console.log("Using remarks details:", remarksDetails);
      
      // Create student object for report generation with ALL remarks data
      const studentForReport: Student = {
        id: student.id,
        name: student.full_name,
        email: student.email,
        batchId: student.batch_id,
        category: remarksCategory as any,
        remarksDetails: remarksDetails || {}, // Use the complete remarks data!
      };

      // Generate report using AI
      const generatedReport = await generateReportForStudent(studentForReport);

      // Combine report sections into a single string
      const fullReport = `
## What Went Well
${generatedReport.whatWentWell}

## Gaps
${generatedReport.gaps}

## Next Steps
${generatedReport.nextSteps}

## Projections
${generatedReport.projections}
`.trim();

      // Save report to database with updated category
      const { error: updateError } = await supabaseServer
        .from("students")
        .update({
          report: fullReport,
          category: remarksCategory,
          last_generated_at: new Date().toISOString(),
        })
        .eq("id", studentId);

      console.log("Save result:", { updateError: updateError?.message });

      if (updateError) throw updateError;

      console.log("Report generated successfully");
      return NextResponse.json({
        message: "Report generated successfully",
        report: fullReport,
        isNew: true,
      });
    } catch (error) {
      const errorDetails = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      console.error("Report generation error:", {
        message: errorDetails,
        stack,
        name: error instanceof Error ? error.name : "Unknown",
        error: JSON.stringify(error, null, 2),
      });
      return NextResponse.json(
        { 
          error: "Failed to generate report",
          details: errorDetails,
          type: error instanceof Error ? error.name : "UnknownError",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const outerErrorDetails = error instanceof Error ? error.message : String(error);
    const outerStack = error instanceof Error ? error.stack : undefined;
    console.error("Outer API error:", {
      message: outerErrorDetails,
      stack: outerStack,
      name: error instanceof Error ? error.name : "Unknown",
      error: JSON.stringify(error, null, 2),
    });
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: outerErrorDetails,
        type: error instanceof Error ? error.name : "UnknownError",
      },
      { status: 500 }
    );
  }
}
