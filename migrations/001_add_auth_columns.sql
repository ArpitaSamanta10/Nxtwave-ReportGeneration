-- ========== SUPABASE SCHEMA MIGRATION ==========
-- Run this SQL in your Supabase SQL Editor to set up the required columns
-- for the authentication and report system

-- Add columns to students table for remarks and report tracking
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS remarks TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS report TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS "lastGeneratedAt" TIMESTAMP DEFAULT NOW();

-- Create an index on email for faster lookups (already exists but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Optional: Add a batch_name column to batches table if it doesn't exist
-- ALTER TABLE batches 
-- ADD COLUMN IF NOT EXISTS batch_name TEXT DEFAULT '';

-- Optional: Add a created_at column to batches if it doesn't exist
-- ALTER TABLE batches 
-- ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- ========== TEST DATA (Optional) ==========
-- Uncomment below to insert test student data

-- INSERT INTO students (id, full_name, email, batch_id, remarks, report)
-- VALUES (
--   gen_random_uuid(),
--   'John Doe',
--   'student@example.com',
--   'batch-1',
--   'Great performance in all subjects!',
--   ''
-- )
-- ON CONFLICT DO NOTHING;

-- ========== NOTES ==========
-- 1. After running this migration, create users in Supabase Auth:
--    - Admin: admin@example.com (role: "admin")
--    - Student: student@example.com (role: "student")
--
-- 2. Add user metadata with roles:
--    Go to Authentication → Users → Click user → Edit "User Metadata"
--    Add: { "role": "admin" } or { "role": "student" }
--
-- 3. Test the app with:
--    npm run dev
--    Then visit http://localhost:3000
