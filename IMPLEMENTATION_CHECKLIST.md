# Student Authentication System - Implementation & Setup Checklist

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project

- [ ] Go to https://supabase.com
- [ ] Sign in or create account
- [ ] Click "New project"
- [ ] Fill in:
  - Project name: `student-portal`
  - Database password: (save securely)
  - Region: (select nearest)
- [ ] Wait for project to initialize (~2 min)
- [ ] Copy project credentials:
  - Project URL: `https://xxxxx.supabase.co`
  - Anon Public Key: `eyJhbGciOiJIUzI1NiIs...`

### 1.2 Enable Authentication Providers

- [ ] Go to Authentication → Providers
- [ ] Enable "Email"
  - [ ] Check "Confirm email" (optional but recommended)
  - [ ] Set redirect URL: `http://localhost:3000/student/dashboard` (for local testing)
  - [ ] Production URL: `https://yourdomain.com/student/dashboard`
- [ ] Enable "Password" auth
- [ ] Disable other providers (Google, GitHub, etc.) if not needed

### 1.3 Create Database Tables

In Supabase SQL Editor, run:

```sql
-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  remarks TEXT DEFAULT '',
  report TEXT DEFAULT '',
  "lastGeneratedAt" TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table (for role mapping)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('Good', 'Above Average', 'Average', 'Poor')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create metrics tables
CREATE TABLE IF NOT EXISTS metrics_good (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE UNIQUE,
  mock_interview_outcome TEXT,
  mentor_pre_interview_note TEXT,
  strength_to_project_changes_required BOOLEAN DEFAULT FALSE,
  strength_to_project_remarks TEXT,
  role_projection VARCHAR,
  tier_projection VARCHAR,
  justification TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metrics_above_average (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE UNIQUE,
  score_improvement_trend JSONB,
  revision_attendance_log JSONB,
  mentor_weekly_observation JSONB,
  problem_level_gap_analysis JSONB,
  placement_window_timeline JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metrics_average (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE UNIQUE,
  learning_gap_analysis TEXT,
  recommended_improvements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metrics_poor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE UNIQUE,
  critical_issues TEXT,
  intervention_plan TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_batch_id ON students(batch_id);
CREATE INDEX idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX idx_users_email ON users(email);
```

- [ ] Copy and paste in SQL editor
- [ ] Click "Run"
- [ ] Verify all tables created (check Table Editor on left)

### 1.4 Create Test Admin User

In Supabase Console:

- [ ] Go to Authentication → Users
- [ ] Click "Add user"
- [ ] Email: `admin@nxtwave.co.in`
- [ ] Password: (generate strong password)
- [ ] Uncheck "Auto confirm user"
- [ ] Click "Create user"
- [ ] In users table, verify entry created

#### Set Admin Role:

In SQL Editor, run:
```sql
INSERT INTO users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@nxtwave.co.in'
ON CONFLICT DO NOTHING;
```

- [ ] Verify entry in users table

### 1.5 Create Test Student User

In Supabase Console:

- [ ] Go to Authentication → Users
- [ ] Click "Add user"
- [ ] Email: `student@example.com`
- [ ] Password: (generate password)
- [ ] Click "Create user"

#### Set Student Role:

In SQL Editor, run:
```sql
INSERT INTO users (id, email, role)
SELECT id, email, 'student'
FROM auth.users
WHERE email = 'student@example.com'
ON CONFLICT DO NOTHING;
```

- [ ] Verify entry in users table with role='student'

### 1.6 Create Test Batch

In SQL Editor, run:
```sql
INSERT INTO batches (batch_name)
VALUES ('Python Django 2024')
RETURNING *;
```

- [ ] Copy the returned batch ID

### 1.7 Create Test Student Record

In SQL Editor, run (replace batch_id):
```sql
INSERT INTO students (id, full_name, email, batch_id)
VALUES (
  gen_random_uuid(),
  'Test Student',
  'student@example.com',
  'PASTE_BATCH_ID_HERE'
)
RETURNING *;
```

- [ ] Verify student record created

---

## Phase 2: Local Development Setup

### 2.1 Environment Variables

- [ ] Create `.env.local` in project root
- [ ] Add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] Save file
- [ ] Verify `.env.local` in `.gitignore` (don't commit secrets!)

### 2.2 Install Dependencies

```bash
npm install
```

- [ ] Verify no errors
- [ ] Check node_modules created

### 2.3 Run Development Server

```bash
npm run dev
```

- [ ] Server starts on http://localhost:3000
- [ ] No console errors

### 2.4 Test Admin Login

- [ ] Open http://localhost:3000/admin/login
- [ ] Enter: `admin@nxtwave.co.in`
- [ ] Enter password: (the one you created)
- [ ] Click "Sign In"
- [ ] Expected: Redirect to /admin/dashboard ✅
  
**If fails:**
- [ ] Check browser console for errors (F12)
- [ ] Check server console for errors
- [ ] Verify env variables are correct
- [ ] Verify user exists in Supabase Auth

### 2.5 Test Student Login

- [ ] Open http://localhost:3000/student/login
- [ ] Enter: `student@example.com`
- [ ] Enter password: (the one you created)
- [ ] Click "Sign In"
- [ ] Expected: Redirect to /student/dashboard ✅
- [ ] Verify student data displayed

**If fails:**
- [ ] Check browser console
- [ ] Verify student user exists in Auth
- [ ] Verify student record exists in students table
- [ ] Email must match

### 2.6 Test Logout

- [ ] Click "Logout" button
- [ ] Expected: Redirect to /student/login ✅
- [ ] Session cleared

---

## Phase 3: Admin Dashboard Testing

### 3.1 Test Batch Operations

- [ ] Login as admin
- [ ] View Dashboard
- [ ] Click "Create Batch"
- [ ] Enter batch name: "Test Batch 2024"
- [ ] Click "Create"
- [ ] Verify batch appears in list ✅

### 3.2 Test Manual Student Addition

- [ ] Click "Add Student"
- [ ] StudentModal opens
- [ ] Select batch: "Test Batch 2024"
- [ ] Name: "John Doe"
- [ ] Email: "john@example.com"
- [ ] Category: "Good"
- [ ] Click "Add"
- [ ] Verify student added to list ✅

**If fails:**
- [ ] Check console for error messages
- [ ] Verify email is unique
- [ ] Verify batch exists

### 3.3 Test Bulk Import

- [ ] Create Excel file with columns:
  ```
  Student ID | Full Name  | Email             | Category
  STU001     | Jane Smith | jane@example.com  | Above Average
  STU002     | Bob Jones  | bob@example.com   | Average
  STU003     | Alice Wang | alice@example.com | Good
  ```
- [ ] Save as `students.xlsx`
- [ ] Click "Import Students"
- [ ] Select batch: "Test Batch 2024"
- [ ] Choose file: `students.xlsx`
- [ ] Click "Import"
- [ ] Verify results summary shows successful imports ✅

**If fails:**
- [ ] Check Excel file format (no merged cells, proper headers)
- [ ] Check console for parsing errors
- [ ] Verify emails are unique

### 3.4 Test Student Search/Filter

- [ ] Type student name in search box
- [ ] Filter by category dropdown
- [ ] Sort by dropdown
- [ ] Verify results update ✅

### 3.5 Test Student Deletion

- [ ] Right-click on student row or find delete button
- [ ] Confirm deletion
- [ ] Verify student removed from list ✅

---

## Phase 4: Security Verification

### 4.1 Test Route Protection

- [ ] Logout
- [ ] Try accessing http://localhost:3000/student/dashboard directly
- [ ] Expected: Redirect to /student/login ✅
- [ ] Try accessing http://localhost:3000/admin/dashboard directly
- [ ] Expected: Redirect to /admin/login ✅

### 4.2 Test Role Separation

- [ ] Login as student
- [ ] Try accessing /admin/dashboard manually
- [ ] Expected: Error message + redirect ✅
- [ ] Login as admin
- [ ] Try accessing /student/dashboard manually
- [ ] Expected: Redirect to /admin/dashboard ✅

### 4.3 Test Invalid Credentials

- [ ] Try login with wrong email
- [ ] Expected: "Invalid email or password" error ✅
- [ ] Try login with wrong password
- [ ] Expected: Same error message ✅

### 4.4 Test Email Uniqueness

- [ ] Try adding student with duplicate email in admin
- [ ] Expected: Duplicate error in import results ✅

---

## Phase 5: Data Verification

### 5.1 Verify Database Schema

In Supabase SQL Editor, run:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' 
ORDER BY table_name;

-- Verify students data
SELECT * FROM students;

-- Verify users role mapping
SELECT * FROM users;

-- Verify batches
SELECT * FROM batches;

-- Verify evaluations
SELECT * FROM evaluations;
```

- [ ] All tables exist
- [ ] Data looks correct

### 5.2 Verify Auth Users

In Supabase Console Authentication → Users:

- [ ] Admin user exists: `admin@nxtwave.co.in` ✅
- [ ] Student user exists: `student@example.com` ✅
- [ ] Both have confirmation_sent_at timestamp

### 5.3 Verify Foreign Key Relationships

In SQL Editor:

```sql
-- Check students without batch (should be 0)
SELECT COUNT(*) FROM students WHERE batch_id IS NULL;

-- Check evaluations without student (should be 0)
SELECT COUNT(*) FROM evaluations WHERE student_id IS NULL;
```

- [ ] No orphaned records

---

## Phase 6: Production Preparation

### 6.1 Update Environment Variables

- [ ] Create `.env.production.local` (if needed)
- [ ] Or update in hosting platform (Vercel, Railway, etc.)
- [ ] Set production Supabase URL and keys
- [ ] Never commit secrets!

### 6.2 Update Redirect URLs in Supabase

- [ ] Go to Authentication → Providers → Email
- [ ] Update "Confirm email link redirect to":
  - Add: `https://yourdomain.com/student/dashboard`
- [ ] Update "Redirect URLs" to include production domain

### 6.3 Enable RLS (Row Level Security) - Optional but Recommended

```sql
-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies (example for students table)
CREATE POLICY "Students can view only their own record"
ON students FOR SELECT
USING (
  auth.uid()::text = (SELECT id::text FROM users WHERE email = students.email LIMIT 1)
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
```

- [ ] Test RLS doesn't break existing functionality

### 6.4 Setup Backups

In Supabase Console:

- [ ] Go to Backups
- [ ] Setup automated daily backups
- [ ] Verify backup retention policy

### 6.5 Monitor Performance

- [ ] Check Supabase logs for errors
- [ ] Monitor database query times
- [ ] Setup alerts for high failure rates

---

## Phase 7: Troubleshooting Reference

### Common Issues & Solutions

| Issue | Causes | Solution |
|-------|--------|----------|
| **Login Fails** | Wrong email format, Missing user record | Check email field, Verify user in Auth |
| **"Failed to fetch" errors** | Supabase unreachable, Invalid keys | Check env variables, Verify URL format |
| **Students not loading** | Missing batch_id, Database connection issue | Verify FK relationships, Check Supabase status |
| **Role verification fails** | Missing entry in users table | Run INSERT for role mapping |
| **Email not confirmed error** | Email verification enabled | Disable or send confirmation email |
| **Duplicate email error** | Email already exists in students table | Use unique email or check for existing record |
| **Route redirects incorrectly** | Role mismatch in public.users | Verify role value exactly matches ('admin' or 'student') |

### Debug Steps

1. **Check browser console (F12)**
   - Click Console tab
   - Look for red errors
   - Note error message

2. **Check server console**
   - Terminal where `npm run dev` runs
   - Look for error logs
   - Note stack trace

3. **Check Supabase logs**
   - Supabase Console → Logs
   - Filter by error level
   - Look for failed queries

4. **Verify data directly in Supabase**
   - Go to Table Editor
   - Check if data exists
   - Verify relationships

5. **Test API manually**
   - Use Supabase SQL Editor
   - Run SELECT queries directly
   - Verify data access

---

## Quick Reference Checklist - After Setup

### Before Going Live

- [ ] Email confirmation working (or disabled intentionally)
- [ ] Admin user verified
- [ ] Test student user works
- [ ] Role-based access is enforced
- [ ] Database backups enabled
- [ ] Environment variables secure
- [ ] No errors in console
- [ ] All CRUD operations working
- [ ] Bulk import tested
- [ ] Logout/session management working

### Daily Monitoring

- [ ] Check Supabase status dashboard
- [ ] Review error logs weekly
- [ ] Monitor backup completion
- [ ] Monitor database size growth
- [ ] Review access patterns (admin/student logins)

### Monthly Maintenance

- [ ] Review unused accounts
- [ ] Archive old batches
- [ ] Verify backups integrity
- [ ] Update passwords (admin account)
- [ ] Review security settings
- [ ] Check for deprecated columns

---

## API Response Examples

### Successful Login Response

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "student@example.com"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "..."
  },
  "userRole": "student",
  "email": "student@example.com"
}
```

### Student Dashboard Data

```json
{
  "id": "456f6789-e89b-12d3-a456-426614174111",
  "full_name": "John Doe",
  "email": "john@example.com",
  "batch_id": "789a1234-e89b-12d3-a456-426614174222",
  "remarks": "Excellent performance in web development",
  "report": "Full performance analysis...",
  "lastGeneratedAt": "2024-12-15T10:30:00Z",
  "created_at": "2024-12-01T08:00:00Z",
  "updated_at": "2024-12-15T10:30:00Z"
}
```

### Bulk Import Results

```json
{
  "students": [...],
  "results": {
    "successful": 45,
    "failed": 2,
    "duplicates": 3,
    "errors": [
      "STU045: Invalid email format",
      "STU048: Missing required field"
    ]
  }
}
```

---

## Files to Review

After setup, review these files to understand the system:

1. **Authentication Logic**
   - [src/lib/auth.ts](src/lib/auth.ts) - Core auth functions

2. **Database Operations**
   - [src/lib/database.ts](src/lib/database.ts) - CRUD operations

3. **Route Protection**
   - [src/lib/roleGuard.tsx](src/lib/roleGuard.tsx) - HOC guards

4. **Admin Interface**
   - [src/app/admin/dashboard/page.tsx](src/app/admin/dashboard/page.tsx) - Dashboard
   - [src/components/modals/StudentModal.tsx](src/components/modals/StudentModal.tsx) - Add student
   - [src/components/modals/ImportModal.tsx](src/components/modals/ImportModal.tsx) - Bulk import

5. **Student Interface**
   - [src/app/student/dashboard/page.tsx](src/app/student/dashboard/page.tsx) - Dashboard
   - [src/app/student/login/page.tsx](src/app/student/login/page.tsx) - Login form

6. **API Endpoints**
   - [src/app/api/generate-report/route.ts](src/app/api/generate-report/route.ts)
   - [src/app/api/generate-reports-batch/route.ts](src/app/api/generate-reports-batch/route.ts)

---

## Next Steps

1. Complete all checklist items in order
2. Test thoroughly before production
3. Document any customizations
4. Setup monitoring and alerts
5. Create backup/recovery procedures
6. Train admins on student creation process
7. Communicate access details to users

**Support & Troubleshooting:**
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Report issues in repository
- Supabase Discord: Community support

