import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Student, RemarksCategory } from "@/components/types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

if (!apiKey) {
  console.error("⚠️ NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set. Report generation will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface GeneratedReport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  tier: RemarksCategory;
  whatWentWell: string;
  gaps: string;
  nextSteps: string;
  projections: string;
  generatedAt: string;
}

function buildPromptForTier(
  tier: RemarksCategory,
  remarksData: any,
  studentName: string
): string {
  // Extract key metrics from remarks data
  const extractedData = {
    hasData: Object.keys(remarksData).length > 0,
    mockScores: remarksData.mockScores || [],
    calculatedAverage: remarksData.calculatedAverage || 0,
    actionItems: remarksData.actionItems || [],
    scoreTrends: remarksData.scoreTrends || [],
    attendanceLog: remarksData.attendanceLog || [],
    mentorObservations: remarksData.mentorObservations || [],
    gapAnalysis: remarksData.gapAnalysis || [],
    placementTimeline: remarksData.placementTimeline || [],
    checkpointScores: remarksData.checkpointScores || [],
    dailyPractice: remarksData.dailyPractice || 0,
    workshopAttendance: remarksData.workshopAttendance || 0,
    progress: remarksData.progress || 0,
    remedialScores: remarksData.remedialScores || [],
  };

  let prompt = `You are an expert educational evaluator generating a comprehensive professional development report.

Student Name: ${studentName}
Performance Tier: ${tier}

=== COMPLETE REMARKS DATA ===
${JSON.stringify(remarksData, null, 2)}

=== EXTRACTED METRICS ===
- Mock Scores: ${extractedData.mockScores.join(", ") || "N/A"}
- Average Score: ${extractedData.calculatedAverage || "N/A"}
- Score Trends: ${extractedData.scoreTrends.length > 0 ? "Available" : "N/A"}
- Attendance Logs: ${extractedData.attendanceLog.length} entries
- Mentor Observations: ${extractedData.mentorObservations.length} entries
- Gap Analysis: ${extractedData.gapAnalysis.length} gaps identified
- Placement Timeline: ${extractedData.placementTimeline.length} weeks tracked
- Checkpoint Scores: ${extractedData.checkpointScores.join(", ") || "N/A"}
- Daily Practice Level: ${extractedData.dailyPractice}%
- Workshop Attendance: ${extractedData.workshopAttendance}%
- Progress Level: ${extractedData.progress}%
- Remedial Scores: ${extractedData.remedialScores.join(", ") || "N/A"}

=== REPORT GENERATION INSTRUCTIONS ===
Generate a structured report with EXACTLY these 4 sections. Each section should be 150-250 words.
Use numeric bullet points format (1., 2., 3., etc.) for clarity.
Base your analysis on the actual remarks data provided above - use specific metrics, observations, and dates where available.

FORMAT (use these headers exactly):
## What Went Well
[Highlight specific positive achievements, strengths, and accomplishments based on the remarks data]

## Gaps
[Identify specific areas for improvement using actual gaps from the data]

## Next Steps
[Provide concrete, actionable recommendations based on the identified gaps and trends]

## Projections
[Provide realistic future outlook and expected milestones based on current trajectory]

IMPORTANT RULES:
- The structure must be identical for all tiers - only the content adapts based on actual remarks data
- Reference specific numbers, dates, and observations from the remarks data when possible
- Keep language professional but accessible`;

  if (tier === "Good") {
    prompt += `

=== GOOD TIER SPECIFIC ANALYSIS ===
Focus your analysis on:
- Interview performance and outcomes (from remarksData.interviewOutcome)
- Project quality and completion status (from remarksData.projectRemarks)
- Role and tier projections (from remarksData.roleProjection, customRole, tierProjection)
- Mock scores trends (from remarksData.mockScores and calculatedAverage)
- Leadership potential and advanced skill development
- Action items that need follow-up (from remarksData.actionItems)`;
  } else if (tier === "Above Average") {
    prompt += `

=== ABOVE AVERAGE TIER SPECIFIC ANALYSIS ===
Focus your analysis on:
- Score improvement trends (from remarksData.scoreTrends - analyze current vs previous)
- Attendance consistency and engagement patterns (from attendanceLog)
- Mentor feedback and observations (from mentorObservations)
- Specific skill gaps identified (from gapAnalysis)
- Placement readiness based on timeline (from placementTimeline)
- Confidence levels and readiness assessments`;
  } else if (tier === "Average") {
    prompt += `

=== AVERAGE TIER SPECIFIC ANALYSIS ===
Focus your analysis on:
- Checkpoint performance progression (from checkpointScores - scores at 4 key points)
- Daily practice consistency rate (from dailyPractice percentage)
- Workshop attendance and engagement (from workshopAttendance percentage)
- Current readiness level (from remarksData.readiness)
- Critical development areas that need improvement
- Support systems and resources needed`;
  } else if (tier === "Poor") {
    prompt += `

=== POOR TIER SPECIFIC ANALYSIS ===
Focus your analysis on:
- Overall progress indicators (from remarksData.progress percentage)
- Submission patterns and consistency (from remarksData.submissionStats)
- Buddy/mentor support feedback (from remarksData.buddyNotes)
- Remedial intervention effectiveness (from remarksData.remedialScores)
- Priority areas requiring immediate intervention
- Recovery timeline and support recommendations`;
  }

  return prompt;
}

export async function generateReportForStudent(
  student: Student
): Promise<GeneratedReport> {
  try {
    // Validate API key
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not configured. Please set it in your environment variables.");
    }

    // Try gemini-pro which is confirmed working with Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = buildPromptForTier(
      student.category as RemarksCategory,
      student.remarksDetails || {},
      student.name
    );

    console.log("Generating report for", student.name, "with prompt length:", prompt.length);

    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      throw new Error("Gemini API returned empty response");
    }
    
    const responseText = result.response.text();
    
    if (!responseText) {
      throw new Error("Gemini API returned empty text content");
    }

    // Parse the response into sections
    const whatWentWellMatch = responseText.match(
      /## What Went Well\n([\s\S]*?)(?=## Gaps|$)/
    );
    const gapsMatch = responseText.match(/## Gaps\n([\s\S]*?)(?=## Next Steps|$)/);
    const nextStepsMatch = responseText.match(
      /## Next Steps\n([\s\S]*?)(?=## Projections|$)/
    );
    const projectionsMatch = responseText.match(/## Projections\n([\s\S]*?)$/);

    return {
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      tier: student.category as RemarksCategory,
      whatWentWell: whatWentWellMatch?.[1]?.trim() || "",
      gaps: gapsMatch?.[1]?.trim() || "",
      nextSteps: nextStepsMatch?.[1]?.trim() || "",
      projections: projectionsMatch?.[1]?.trim() || "",
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error generating report for ${student.name}:`, errorMessage);
    throw new Error(`Failed to generate report: ${errorMessage}`);
  }
}

export async function generateReportsForAllStudents(
  students: Student[]
): Promise<GeneratedReport[]> {
  const reports: GeneratedReport[] = [];

  for (const student of students) {
    try {
      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
      const report = await generateReportForStudent(student);
      reports.push(report);
    } catch (error) {
      console.error(`Failed to generate report for ${student.name}:`, error);
    }
  }

  return reports;
}
