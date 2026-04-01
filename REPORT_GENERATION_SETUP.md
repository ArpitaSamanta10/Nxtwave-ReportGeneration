# Report Generation Setup Instructions

## Prerequisites

### 1. Gemini API Key Setup

You need a Google Gemini API key to generate reports. Here's how to get it:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key" 
3. Create a new API key in your Google Cloud project
4. Copy the API key

### 2. Add Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Gemini API Key (get from https://aistudio.google.com/app/apikey)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# n8n Webhook URL (for sending emails - set up in n8n, see below)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-report-email
```

### 3. Install Gemini SDK

The project needs the Google Generative AI library:

```bash
npm install @google/generative-ai
```

### 4. n8n Webhook Setup (for Email Sending)

In your n8n instance:

1. Create a new workflow
2. Add a Webhook trigger:
   - Set Method to POST
   - Copy the webhook URL (this goes into NEXT_PUBLIC_N8N_WEBHOOK_URL)
3. Add nodes to:
   - Receive the report data (webhook trigger receives it)
   - Send email using Gmail, Sendgrid, or SMTP node
   - Email template should use the report data

Example n8n Email Node properties:
- **To**: `{{ $json.studentEmail }}`
- **Subject**: `Your Development Report - {{ $json.studentName }}`
- **Body**: 
  ```
  Dear {{ $json.studentName }},

  Your development report for tier: {{ $json.tier }}

  WHAT WENT WELL
  {{ $json.report.whatWentWell }}

  GAPS
  {{ $json.report.gaps }}

  NEXT STEPS
  {{ $json.report.nextSteps }}

  PROJECTIONS
  {{ $json.report.projections }}

  Best regards,
  Your Mentor Team
  ```

## Features

### Generate Report for Single Student
- Click the "Report" button next to any student
- View the report in a modal with 4 sections (What Went Well, Gaps, Next Steps, Projections)
- Download as text file
- Send email via n8n

### Generate Reports for All Students
- Click "📄 Generate Reports for All" button
- All reports are generated using Gemini
- Each report is automatically sent to the respective student's email via n8n webhook

## Report Structure

The report format is identical across all 4 tiers:

1. **What Went Well** - Highlights positive achievements
2. **Gaps** - Identifies areas for improvement
3. **Next Steps** - Actionable recommendations
4. **Projections** - Future outlook and career trajectory

Only the input data changes based on the student's tier and remarks data.

## Tier-Specific Focus

- **Good**: Interview readiness, project quality, role projections
- **Above Average**: Score trends, attendance, mentor observations
- **Average**: Checkpoint performance, daily practice, readiness
- **Poor**: Progress indicators, submission patterns, remedial support

## Troubleshooting

### "Failed to generate report" error
- Check if NEXT_PUBLIC_GEMINI_API_KEY is set correctly
- Verify the API key has appropriate permissions
- Check browser console for detailed error messages

### Emails not being sent
- Verify NEXT_PUBLIC_N8N_WEBHOOK_URL is correct and accessible
- Check n8n workflow is active and email node is configured
- Review n8n logs for webhook failures

### API Rate Limiting
- Gemini API has rate limits
- The batch generation adds 500ms delay between requests
- For large batches, consider spacing out generation
