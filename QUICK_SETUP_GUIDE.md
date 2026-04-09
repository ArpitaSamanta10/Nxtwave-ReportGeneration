# Quick Action Guide - Database Setup

## 🚀 Step 1: Check Your Current Setup (5 minutes)

### In Supabase Console:
1. Go to **SQL Editor** tab
2. Create new query
3. Run this to see what tables you have:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

**Expected Output:**
```
batches
evaluations
reports
students
users
```

If any are missing, run the **Full Setup SQL** below.

---

## 📋 Step 2: Verify Table Columns

Run this query:
```sql
-- Check what columns are in students table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students';
```

**Must have these columns:**
- id (UUID)
- email (text)
- full_name (text)
- batch_id (UUID)
- category (text)
- remarks (text)
- report (text)
- created_at (timestamp)
- updated_at (timestamp)

If missing any, add them using ALTER TABLE commands below.

---

## 🔧 Step 3: Add Missing Columns

If `category`, `remarks`, or `report` columns don't exist:

```sql
-- Add category column
ALTER TABLE public.students 
ADD COLUMN category TEXT CHECK (category IN ('Good', 'Above Average', 'Average', 'Poor'));

-- Add remarks column
ALTER TABLE public.students 
ADD COLUMN remarks TEXT;

-- Add report column
ALTER TABLE public.students 
ADD COLUMN report TEXT;

-- Add timestamp columns
ALTER TABLE public.students 
ADD COLUMN lastGeneratedAt TIMESTAMP;

ALTER TABLE public.students 
ADD COLUMN lastSavedAt TIMESTAMP;
```

---

## ✅ Step 4: Complete Database Setup (If Starting Fresh)

Run ALL of this in Supabase SQL Editor:

```sql
-- ==========================================
-- COMPLETE DATABASE SETUP
-- ==========================================

-- 1. CREATE BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREATE USERS TABLE (Role Mapping)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  batch_id UUID REFERENCES public.batches(id),
  category TEXT CHECK (category IN ('Good', 'Above Average', 'Average', 'Poor')),
  remarks TEXT,
  report TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastGeneratedAt TIMESTAMP,
  lastSavedAt TIMESTAMP
);

-- 4. CREATE EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Good', 'Above Average', 'Average', 'Poor')),
  remarks TEXT,
  remarks_details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CREATE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON public.evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_student ON public.reports(student_id);
CREATE INDEX IF NOT EXISTS idx_batches_name ON public.batches(batch_name);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CREATE RLS POLICIES FOR REPORTS
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students see own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins see all reports" ON public.reports;
DROP POLICY IF EXISTS "API can insert reports" ON public.reports;
DROP POLICY IF EXISTS "API can update reports" ON public.reports;

-- Students can only see their own reports
CREATE POLICY "Students see own reports"
  ON public.reports FOR SELECT
  USING (student_id = auth.uid());

-- Admins can see all reports
CREATE POLICY "Admins see all reports"
  ON public.reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- API can insert reports
CREATE POLICY "API can insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (true);

-- API can update reports
CREATE POLICY "API can update reports"
  ON public.reports FOR UPDATE
  USING (true);

-- ==========================================
-- VERIFY SETUP
-- ==========================================

-- This should show all 5 tables:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 🔍 Step 5: Verify RLS Policies

Run this to see if RLS is working:

```sql
-- Check if RLS is enabled on reports table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reports' AND schemaname = 'public';

-- Check all RLS policies
SELECT schemaname, tablename, policyname, qual
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;
```

**Expected Output:**
- rowsecurity should be TRUE
- Should see 4 policies: "Students see own reports", "Admins see all reports", etc.

---

## 🧪 Step 6: Test Data Flow

### Create Test Student:
```sql
-- 1. First, create auth user in Supabase Auth Console (email: test@example.com)
-- Then run this:

INSERT INTO public.users (id, email, name, role)
SELECT id, email, email, 'student'
FROM auth.users 
WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

-- 2. Insert test batch
INSERT INTO public.batches (batch_name) 
VALUES ('Test Batch 2024')
RETURNING id;

-- 3. Insert test student (replace UUIDs)
INSERT INTO public.students 
(id, email, full_name, batch_id, category, remarks)
SELECT 
  id, 
  email, 
  'Test Student',
  (SELECT id FROM public.batches WHERE batch_name = 'Test Batch 2024' LIMIT 1),
  'Good',
  'This is a test remark'
FROM auth.users 
WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

-- 4. Check data is there
SELECT * FROM public.students WHERE email = 'test@example.com';
SELECT * FROM public.evaluations WHERE student_id IN (SELECT id FROM public.students WHERE email = 'test@example.com');
```

---

## 📊 Step 7: Check Admin Data Saves Properly

### When Admin Saves Remarks:
1. Open DevTools → Console
2. Check for log: `Remarks saved successfully`
3. In Supabase Console, run:

```sql
SELECT 
  s.id,
  s.full_name,
  s.category,
  SUBSTRING(s.remarks, 1, 30) as remarks_preview,
  e.id as eval_id,
  e.category as eval_category
FROM public.students s
LEFT JOIN public.evaluations e ON s.id = e.student_id
WHERE s.full_name = 'Student Name'
ORDER BY s.updated_at DESC
LIMIT 5;
```

You should see:
- students.category = selected value
- evaluations.category = same value
- Both updated_at timestamps

---

## 🎯 Step 8: Verify Student Portal Sees Data

1. **Login as student** at http://localhost:3000/student/login
2. **Go to Student Dashboard**
3. **Check "Your Information" table shows:**
   - ✅ Student ID
   - ✅ Full Name
   - ✅ Email
   - ✅ Batch
   - ✅ Performance Category (with color)
   - ✅ Remarks Status
   - ✅ Reports Generated count

4. **If not showing:**
   - Open DevTools → Console
   - Look for errors in `loadStudentProfile`
   - Check network tab for API calls to `/students` and `/evaluations`

---

## 🚨 Troubleshooting

### Issue: Student Can't See Category
```sql
-- Check if students table has the category
SELECT id, email, category FROM public.students LIMIT 1;

-- Check if evaluations table has data
SELECT id, student_id, category FROM public.evaluations LIMIT 1;
```

**Fix**: Make sure admin code is saving to BOTH tables (see data_flow_guide.md)

---

### Issue: Reports Not Showing
```sql
-- Check RLS policy
SELECT * FROM public.reports WHERE student_id = auth.uid();

-- If that returns nothing but reports exist elsewhere, RLS is blocking
-- Check the policy is correct
```

---

### Issue: Old Data Not Updated
```sql
-- Clear old data (caution!)
DELETE FROM public.evaluations;
DELETE FROM public.reports;
-- Keep students data, just regenerate evaluations
```

---

## 📝 You Have 2 Options

### Option A: Keep Existing DB (Recommended)
Just add missing columns if needed (Step 3 above)

### Option B: Fresh Start
Drop everything and run Complete Setup (Step 4 above)
```sql
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.evaluations CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.batches CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Then run Step 4 Complete Setup SQL
```

---

## ✨ After Setup

```
Admin Portal                    Student Portal
     ↓                               ↑
Updates students table      ← reads students table
Updates evaluations table   ← reads evaluations table (latest)
Generates reports           ← reads reports table (RLS protected)
     ↓                               ↑
   Data flows automatically!
```

All data now syncs automatically with no additional work! 🎉
