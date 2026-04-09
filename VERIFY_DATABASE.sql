-- Run these queries in Supabase SQL Editor to verify your setup
-- They show you what's in each table and if data is flowing correctly

-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check students table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- 3. Check students data (how many students exist)
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as with_category,
  COUNT(CASE WHEN remarks IS NOT NULL THEN 1 END) as with_remarks
FROM public.students;

-- 4. Check evaluations data
SELECT 
  COUNT(*) as total_evaluations,
  COUNT(DISTINCT student_id) as unique_students
FROM public.evaluations;

-- 5. Sample student data (shows what admin sets)
SELECT 
  id,
  full_name,
  email,
  batch_id,
  category,
  SUBSTRING(remarks, 1, 50) as remarks_preview,
  updated_at
FROM public.students
LIMIT 5;

-- 6. Sample evaluation data (what admin saved in remarks modal)
SELECT 
  e.id,
  e.student_id,
  s.full_name,
  e.category,
  e.remarks,
  e.created_at
FROM public.evaluations e
LEFT JOIN public.students s ON e.student_id = s.id
ORDER BY e.created_at DESC
LIMIT 5;

-- 7. Check reports for students
SELECT 
  r.student_id,
  s.full_name,
  COUNT(r.id) as report_count,
  MAX(r.created_at) as latest_report
FROM public.reports r
LEFT JOIN public.students s ON r.student_id = s.id
GROUP BY r.student_id, s.full_name;

-- 8. Check RLS Policies are enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 9. View all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 10. Test student can see their own data
-- (Replace with actual student UUID)
-- SELECT * FROM public.reports WHERE student_id = 'student-uuid-here';
