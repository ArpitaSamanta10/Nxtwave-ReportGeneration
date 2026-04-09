# Supabase Setup Guide

This guide explains how to configure your Supabase database for the authentication system.

## 1. Update Students Table

Your `students` table needs these additional columns for the report system to work:

### In Supabase Console:

1. Navigate to your project → SQL Editor
2. Run this SQL to add the missing columns:

```sql
-- Add columns to students table for remarks and report tracking
ALTER TABLE students ADD COLUMN remarks TEXT DEFAULT '';
ALTER TABLE students ADD COLUMN report TEXT DEFAULT '';
ALTER TABLE students ADD COLUMN lastGeneratedAt TIMESTAMP DEFAULT NOW();
```

## 2. Create Test Users

You need to create test accounts in Supabase Auth for both admin and student roles.

### Create Admin User:

1. Go to Supabase Console → Authentication → Users
2. Click "Create new user"
   - Email: `admin@example.com`
   - Password: `Password123!`
   - Auto-send invitation email: OFF
3. Click the user to edit
4. Scroll to "User Metadata" and add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save

### Create Student User:

1. Click "Create new user" again
   - Email: `student@example.com`
   - Password: `Password123!`
   - Auto-send invitation email: OFF
2. Click the user to edit
3. Scroll to "User Metadata" and add:
   ```json
   {
     "role": "student"
   }
   ```
4. Save

## 3. Add Test Student Data

Create a test student that matches the student user:

1. Go to SQL Editor
2. Run this SQL:

```sql
-- Insert test student
INSERT INTO students (full_name, email, batch_id, remarks, report)
VALUES ('John Doe', 'student@example.com', 'batch-1', 'Great performance!', '');
```

## 4. Test Your Setup

1. Start your app: `npm run dev`
2. Go to http://localhost:3000
3. You'll be redirected to admin login
4. Try logging in as admin:
   - Email: `admin@example.com`
   - Password: `Password123!`
5. After login, go to http://localhost:3000/student/login
6. Try logging in as student:
   - Email: `student@example.com`
   - Password: `Password123!`

## 5. How It Works

### Admin Login Flow:
1. Admin enters email/password at `/admin/login`
2. Supabase Auth verifies credentials
3. System checks user metadata for `role: "admin"`
4. If valid → redirects to `/admin/dashboard`
5. Admin can view students and update remarks
6. When remarks are updated, the system:
   - Checks if remarks changed
   - If changed → generates new report with AI
   - If unchanged → uses cached report

### Student Login Flow:
1. Student enters email/password at `/student/login`
2. Supabase Auth verifies credentials
3. System checks user metadata for `role: "student"`
4. If valid → redirects to `/student/dashboard`
5. Student can only view their profile and report (read-only)

## 6. Report Generation Logic

```
When admin updates student remarks:
├─ Check if remarks actually changed
├─ If YES:
│  ├─ Call Gemini AI to generate report
│  ├─ Save report to database
│  └─ Update lastGeneratedAt timestamp
└─ If NO:
   └─ Use cached report (no AI call, saves costs)
```

## Environment Variables

Make sure your `.env.local` has these Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

All are already configured in your `.env.local` ✓

## Next Steps

- [ ] Run the SQL migration to add columns
- [ ] Create admin user in Supabase Auth
- [ ] Create student user in Supabase Auth
- [ ] Insert test student data
- [ ] Test login flows
- [ ] Test remarks update and report generation
