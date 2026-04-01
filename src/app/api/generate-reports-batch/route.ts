import { NextRequest, NextResponse } from "next/server";
import { generateReportsForAllStudents } from "@/lib/reportGenerator";
import type { Student } from "@/components/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { students } = body as { students: Student[] };

    if (!students || students.length === 0) {
      return NextResponse.json(
        { error: "Students array is required" },
        { status: 400 }
      );
    }

    const reports = await generateReportsForAllStudents(students);

    // Trigger n8n webhook for each report
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      for (const report of reports) {
        try {
          await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              studentEmail: report.studentEmail,
              studentName: report.studentName,
              tier: report.tier,
              report: {
                whatWentWell: report.whatWentWell,
                gaps: report.gaps,
                nextSteps: report.nextSteps,
                projections: report.projections,
              },
              generatedAt: report.generatedAt,
            }),
          });
        } catch (error) {
          console.error(`Failed to send report to n8n for ${report.studentEmail}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      reportsGenerated: reports.length,
      reports: reports,
    });
  } catch (error) {
    console.error("Error generating batch reports:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}
