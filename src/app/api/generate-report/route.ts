import { NextRequest, NextResponse } from "next/server";
import { generateReportForStudent } from "@/lib/reportGenerator";
import type { GeneratedReport } from "@/lib/reportGenerator";
import type { Student } from "@/components/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student } = body as { student: Student };

    if (!student) {
      return NextResponse.json(
        { error: "Student data is required" },
        { status: 400 }
      );
    }

    const report = await generateReportForStudent(student);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
