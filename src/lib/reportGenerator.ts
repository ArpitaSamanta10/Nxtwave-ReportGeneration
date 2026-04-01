import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Student, RemarksCategory } from "@/components/types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

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
  let prompt = `You are an expert educational evaluator generating a professional development report.

Student: ${studentName}
Tier: ${tier}

Remarks Data: ${JSON.stringify(remarksData, null, 2)}

Generate a structured report with EXACTLY these 4 sections. Keep each section concise but meaningful (150-250 words each).Give in point wise for better understanding Format it in numeric bullet points

FORMAT (use these headers exactly):
## What Went Well
[Highlight positive achievements, strengths, and accomplishments based on the tier]

## Gaps
[Identify specific areas for improvement and skill gaps relevant to the tier]

## Next Steps
[Provide actionable recommendations and specific steps to address gaps]

## Projections
[Provide future outlook, career trajectory, and expected milestones]

Important: The structure must be identical for all tiers. Only the content adapts based on tier-specific data and touchpoints.`;

  if (tier === "Good") {
    prompt += `\n\nFor GOOD tier focus on:
- Interview readiness and outcomes
- Project quality and completion
- Role/Tier projections
- Advanced skill development
- Leadership potential`;
  } else if (tier === "Above Average") {
    prompt += `\n\nFor ABOVE AVERAGE tier focus on:
- Score trends and improvements
- Attendance and consistency
- Mentor observations
- Gap analysis and learning areas
- Placement timeline readiness`;
  } else if (tier === "Average") {
    prompt += `\n\nFor AVERAGE tier focus on:
- Checkpoint performance
- Daily practice consistency
- Workshop engagement
- Readiness assessment
- Development areas`;
  } else if (tier === "Poor") {
    prompt += `\n\nFor POOR tier focus on:
- Progress indicators
- Submission patterns
- Remedial support needs
- Intervention effectiveness
- Recovery timeline`;
  }

  return prompt;
}

export async function generateReportForStudent(
  student: Student
): Promise<GeneratedReport> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildPromptForTier(
      student.category as RemarksCategory,
      student.remarksDetails || {},
      student.name
    );

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

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
    console.error(`Error generating report for ${student.name}:`, error);
    throw new Error(`Failed to generate report: ${error}`);
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
