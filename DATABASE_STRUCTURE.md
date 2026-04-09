# Database Structure Guide - Admin to Student Portal Data Flow

## Current Database Schema

### 1. **auth.users** (Supabase Built-in)
- Purpose: Handles authentication
- Fields: id (UUID), email, password
- Used by: Both admin and student login

### 2. **public.users** (Role Mapping)
- Purpose: Map users to their roles (admin/student)
- Fields:
  - id (UUID) → foreign key to auth.users.id
  - email (text)
  - name (text)
  - role (text) → 'admin' or 'student'
- Used by: Route guards, role verification

### 3. **public.batches** (Batch Information)
- Purpose: Student cohorts/groups
- Fields:
  - id (UUID)
  - batch_name (text)
  - created_at (timestamp)
- Used by: Admin to group students, Admin dashboard filtering

### 4. **public.students** (Core Student Data) ⭐ MAIN TABLE
- Purpose: Student profile and report storage
- Fields:
  - id (UUID) → foreign key to auth.users.id
  - email (text)
  - full_name (text)
  - batch_id (UUID) → foreign key to batches.id
  - category (text) → 'Good', 'Above Average', 'Average', 'Poor'
  - remarks (text) → Detailed feedback text
  - report (text) → Generated report content
  - created_at (timestamp)
  - updated_at (timestamp)
  - lastGeneratedAt (timestamp)
  - lastSavedAt (timestamp)

### 5. **public.evaluations** (Latest Remarks & Metadata)
- Purpose: Store category and detailed remarks for students
- Fields:
  - id (UUID)
  - student_id (UUID) → foreign key to students.id
  - category (text) → 'Good', 'Above Average', 'Average', 'Poor'
  - remarks (text) → Short summary
  - remarks_details (jsonb) → Detailed structured data (mockScores, actionItems, etc.)
  - created_at (timestamp)
  - updated_at (timestamp)
- Used by: Admin to manage remarks, Student portal to show feedback

### 6. **public.reports** (Generated Reports) ⭐ RLS PROTECTED
- Purpose: Store individual student reports
- Fields:
  - id (UUID)
  - student_id (UUID) → foreign key to auth.users.id
  - title (text)
  - content (text)
  - generated_by (text)
  - created_at (timestamp)
  - updated_at (timestamp)
- Row-Level Security: Students can only see their own reports

---

## Data Flow: Admin → Student Portal

### What Admin Sets:
1. Admin clicks "Remarks" → Opens RemarksModal
2. Selects student, category, and fills in remarks
3. Clicks "Save" → Data saved to:
   - `public.students` table (batch_id, category, remarks)
   - `public.evaluations` table (all details)

### What Student Sees:
The student portal queries:
```
SELECT * FROM public.students WHERE email = current_user_email
  ↓
SELECT * FROM public.evaluations WHERE student_id = student_id LIMIT 1
  ↓
SELECT * FROM public.reports WHERE student_id = auth.uid()
```

---

## ✅ Recommended Database Setup

### Create This SQL (Run in Supabase → SQL Editor):

```sql
-- 1. Batches Table
CREATE TABLE public.batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Role Mapping)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students Table (MAIN)
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  batch_id UUID REFERENCES public.batches(id),
  category TEXT CHECK (category IN ('Good', 'Above Average', 'Average', 'Poor', null)),
  remarks TEXT,
  report TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastGeneratedAt TIMESTAMP,
  lastSavedAt TIMESTAMP
);

-- 4. Evaluations Table (Detailed Remarks)
CREATE TABLE public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Good', 'Above Average', 'Average', 'Poor')),
  remarks TEXT,
  remarks_details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reports Table (RLS Protected)
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_students_email ON public.students(email);
CREATE INDEX idx_evaluations_student ON public.evaluations(student_id);
CREATE INDEX idx_reports_student ON public.reports(student_id);

-- Enable RLS on Reports Table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Reports
CREATE POLICY "Students see own reports"
  ON public.reports FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins see all reports"
  ON public.reports FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "API can insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "API can update reports"
  ON public.reports FOR UPDATE
  USING (true);
```

---

## 🔄 Data Sync: How to Keep Admin & Student Data In Sync

### When Admin Updates Remarks:
1. Update `students` table:
   ```sql
   UPDATE public.students 
   SET category = 'Good', remarks = '...', updated_at = NOW()
   WHERE id = student_id;
   ```

2. Insert into `evaluations` table:
   ```sql
   INSERT INTO public.evaluations 
   (student_id, category, remarks, remarks_details)
   VALUES (student_id, 'Good', '...', '{}');
   ```

### Student Portal Loads:
```javascript
// 1. Fetch student profile
SELECT * FROM students WHERE email = current_email

// 2. Fetch latest remarks
SELECT * FROM evaluations 
WHERE student_id = student.id 
ORDER BY created_at DESC LIMIT 1

// 3. Fetch reports
SELECT * FROM reports 
WHERE student_id = auth.uid()
```

---

## 🔧 Key Changes Needed (If Not Already Done)

### In Admin Dashboard (handleOpenRemarks):
✅ Make sure when saving remarks:
- Updates `students` table with category
- Inserts record into `evaluations` table
- Student portal will auto-pick it up via latest evaluation query

### In Student Portal (loadStudentProfile):
✅ Already does:
1. Fetch from students table
2. Fetch from evaluations table
3. Fetch from reports table (RLS protected)
4. Merge all data and display

---

## 📋 What Data Shows in Student Portal

| From Table | Field | Shows In Portal |
|-----------|-------|-----------------|
| students | id | Student ID |
| students | full_name | Full Name |
| students | email | Email |
| students | batch_id | Batch |
| evaluations | category | Performance Category (color-coded) |
| evaluations | remarks | Remarks & Feedback |
| students | report | Generated Report |
| reports | * | List of all reports with mock numbers |

---

## ✅ Checklist

- [ ] All 5 tables exist in Supabase
- [ ] Foreign keys are properly set up
- [ ] RLS policies are enabled on reports table
- [ ] Admin can set remarks/category
- [ ] Student portal fetches student + evaluations + reports
- [ ] Data flows correctly from admin to student

If you check these boxes, all admin data will automatically appear in the student portal!
