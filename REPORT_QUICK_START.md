# Quick Start Guide - Report Generation

## ✅ Configuration Done

Your environment is now set up with:
- **Gemini API Key**: Added to `.env.local`
- **Model**: Gemini 2.5 Flash (latest model)
- **Report Generation**: Ready to use

## 🚀 How to Use

### 1. View Report for Single Student
- Click the **"Report"** button next to any student in the list
- The system will generate a report using Gemini AI
- Report includes 4 sections:
  - ✓ What Went Well
  - ⚠ Gaps
  - → Next Steps
  - 🎯 Projections

### 2. Generate Reports for All Students
- Click **"📄 Generate Reports for All"** button in the header
- Confirm the action
- All reports will be generated and a summary will show how many were created

### 3. Email Integration (n8n)
To enable automatic email sending:

1. **Set up n8n webhook:**
   - Go to your n8n instance
   - Create a new workflow
   - Add a Webhook trigger (POST method)
   - Copy the webhook URL
   
2. **Update `.env.local`:**
   ```
   NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/...
   ```

3. **Configure email node in n8n:**
   - Add Gmail/SendGrid/SMTP node
   - Use these variables:
     - To: `{{ $json.studentEmail }}`
     - Subject: `Your Development Report - {{ $json.studentName }}`

## 📋 Report Format

The report is identical in structure for all 4 tiers but content adapts based on student data:

**Good Tier:**
- Interview outcomes and readiness
- Project quality and completions
- Role/Tier projections

**Above Average:**
- Score trends and improvements
- Attendance consistency
- Mentor observations
- Placement timeline

**Average:**
- Checkpoint performance
- Practice consistency
- Readiness assessment

**Poor:**
- Progress indicators
- Support effectiveness
- Recovery timeline

## 🔧 Advanced Options

In the Report Modal, you can:
- **View Report** - See full formatted report
- **Download** - Save as text file
- **Send Email** - Trigger n8n webhook to send email
- **Close** - Dismiss modal

## ⚠️ Troubleshooting

**Issue**: "Failed to generate report"
- Check if NEXT_PUBLIC_GEMINI_API_KEY is set
- Verify no typos in API key
- Check browser console (F12) for detailed errors

**Issue**: Emails not sending
- Ensure NEXT_PUBLIC_N8N_WEBHOOK_URL is configured
- Verify n8n workflow is active
- Check n8n logs for webhook failures

**Issue**: API rate limit
- Reports add 500ms delay between generations (automatic)
- For bulk operations, batch requests naturally space out
