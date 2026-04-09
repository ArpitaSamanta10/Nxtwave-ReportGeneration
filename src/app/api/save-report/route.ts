import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, reportContent } = body;

    console.log("Save Report API Received:", {
      studentId,
      reportLength: reportContent?.length || 0,
    });

    if (!studentId || !reportContent) {
      return NextResponse.json(
        { error: "Missing studentId or reportContent" },
        { status: 400 }
      );
    }

    // Save report to database
    const { error: updateError } = await supabaseServer
      .from("students")
      .update({
        report: reportContent,
        lastSavedAt: new Date().toISOString(),
      })
      .eq("id", studentId);

    console.log("Database save result:", { updateError: updateError?.message });

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Report saved successfully",
      studentId,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error("Save Report Error:", errorDetails, error);
    return NextResponse.json(
      {
        error: "Failed to save report",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
