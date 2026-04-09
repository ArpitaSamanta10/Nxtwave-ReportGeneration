# Database Role Verification Setup Guide

## Prerequisites

Before using the enhanced authentication system, ensure your Supabase database is properly configured.

## Required Database Schema

Your Supabase project must have a `public.users` table with this exact structure:

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can update user roles"
  ON public.users
  FOR UPDATE
  TO service_role;
```

## Step-by-Step Setup

### Step 1: Prepare Your Database

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Create a new query
5. Copy the SQL schema above
6. Execute it

### Step 2: Verify the Table Structure

```sql
-- Check if users table exists and has correct columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public';
```

Expected output:
```
column_name     | data_type
----------------|---------------------------
id              | uuid
email           | text
role            | text
created_at      | timestamp with time zone
updated_at      | timestamp with time zone
```

### Step 3: Create Admin User

```sql
-- Create admin account in auth
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  password_hash,
  raw_user_meta_data,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  'admin@nxtwave.co.in',
  NOW(),
  crypt('your_password_here', gen_salt('bf')),
  '{}',
  'authenticated',
  'authenticated'
);

-- Get the user ID from the previous insert
-- Then create corresponding entry in public.users
INSERT INTO public.users (id, email, role)
VALUES ('[USER_ID_FROM_ABOVE]', 'admin@nxtwave.co.in', 'admin');
```

**Alternative: Use Supabase Auth API**

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Create User" → "Invite with email"
3. Enter: `admin@nxtwave.co.in`
4. Set strong password
5. Create user
6. Then run SQL to set role:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@nxtwave.co.in';
```

### Step 4: Create Test Students

```sql
-- Create multiple student accounts
INSERT INTO public.users (id, email, role)
VALUES 
  (gen_random_uuid(), 'student1@example.com', 'student'),
  (gen_random_uuid(), 'student2@example.com', 'student'),
  (gen_random_uuid(), 'student3@example.com', 'student');
```

### Step 5: Verify Users in Database

```sql
-- Check all users
SELECT id, email, role, created_at
FROM public.users
ORDER BY created_at DESC;
```

Expected output:
```
id                                   | email                    | role    | created_at
-------------------------------------|--------------------------|---------|--------------------
a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6 | admin@nxtwave.co.in      | admin   | 2024-01-15 10:30:00
b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7 | student1@example.com     | student | 2024-01-15 10:31:00
c3d4e5f6-a7b8-49ca-d1e2-f3a4b5c6d7e8 | student2@example.com     | student | 2024-01-15 10:31:00
```

### Step 6: Update Environment Variables

Ensure your `.env.local` is configured:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to find these values:**

1. Go to Supabase Dashboard
2. Click **Settings** → **API**
3. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 7: Rebuild and Test

```bash
# Navigate to project directory
cd d:\report

# Install dependencies (if needed)
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

The server will start at `http://localhost:3000`

## Testing Checklist

### ✓ Test Admin Login

1. Navigate to `http://localhost:3000/admin/login`
2. Enter:
   - Email: `admin@nxtwave.co.in`
   - Password: [the password you set]
3. Click "Sign In"
4. Expected: ✅ Redirect to `/admin/dashboard`

### ✓ Test Student Login

1. Navigate to `http://localhost:3000/student/login`
2. Enter:
   - Email: `student1@example.com`
   - Password: [student password]
3. Click "Sign In"
4. Expected: ✅ Redirect to `/student/dashboard`

### ✓ Test Email Validation

1. Navigate to `http://localhost:3000/admin/login`
2. Enter:
   - Email: `student1@example.com` (or any non-admin email)
   - Password: [correct password]
3. Click "Sign In"
4. Expected: ❌ Toast error: "Unauthorized - Only admin@nxtwave.co.in can access admin portal"

### ✓ Test Role Validation

1. Add a test admin user with non-matching email:

```sql
INSERT INTO auth.users (/* ... */) VALUES (/* ... admin email different from nxtwave */);
INSERT INTO public.users (/* ... */) VALUES (/* ... with role='admin' */);
```

2. Try to login with that email
3. Expected: ❌ Toast error: "Unauthorized - Only admin@nxtwave.co.in can access admin portal"

### ✓ Test Route Protection

1. Login as student at `/student/login`
2. Manually visit `/admin/dashboard`
3. Expected: ❌ Redirect to `/student/login`

### ✓ Test Cross-Role Rejection

1. Login as admin
2. Manually visit `/student/dashboard`
3. Expected: ⚠️ Toast error: "Unauthorized - Student access required"

### ✓ Test Session Expiration

1. Login successfully
2. Clear browser cookies/local storage (simulate session expiration)
3. Manually visit `/admin/dashboard` or `/student/dashboard`
4. Expected: ❌ Redirect to respective login page

## Database Migration (If Updating Existing Project)

If you already have a `users` table, you may need to migrate it:

### Step 1: Backup Existing Data

```sql
-- Create backup
CREATE TABLE public.users_backup AS SELECT * FROM public.users;
```

### Step 2: Update Schema

```sql
-- Add missing columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- Add constraint if needed
ALTER TABLE public.users ADD CONSTRAINT check_role CHECK (role IN ('admin', 'student'));

-- Update email if needed
ALTER TABLE public.users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

### Step 3: Verify Migration

```sql
-- Check all users have roles
SELECT COUNT(*) as total, 
       SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
       SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students
FROM public.users;
```

## Troubleshooting

### Issue: "Relation public.users does not exist"
**Solution**: Run the SQL schema creation script above

### Issue: "New user always gets logout when logging in"
**Solution**: Check that user exists in `public.users` table with correct role

### Issue: "Getting 'Unauthorized' even with correct email/password"
**Solution**: 
1. Verify email in `public.users` matches exactly
2. Check role is set to 'admin' or 'student'
3. Verify user exists in `auth.users`

### Issue: "Admin/Student fields show as undefined on dashboard"
**Solution**: Ensure user record in `public.users` has email and role fields populated

### Issue: "Toast not showing error messages"
**Solution**: 
1. Check `ToastContainer` is in root layout
2. Verify `addToast()` function is being called correctly
3. Check browser console for JavaScript errors

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Set appropriate RLS policies
- [ ] Rotate service role keys
- [ ] Enable email verification
- [ ] Set up password strength requirements
- [ ] Configure rate limiting on auth endpoints
- [ ] Test login attempts with wrong credentials don't expose user existence
- [ ] Verify admin@nxtwave.co.in email is protected
- [ ] Set up audit logging for role changes

## Database Queries Reference

### View All Users
```sql
SELECT id, email, role, created_at FROM public.users ORDER BY created_at DESC;
```

### Find User by Email
```sql
SELECT id, email, role FROM public.users WHERE email = 'admin@nxtwave.co.in';
```

### Update User Role
```sql
UPDATE public.users SET role = 'admin', updated_at = NOW() WHERE email = 'user@example.com';
```

### Delete User
```sql
DELETE FROM public.users WHERE email = 'user@example.com';
-- This will also delete from auth.users due to CASCADE constraint
```

### Count Users by Role
```sql
SELECT role, COUNT(*) as count FROM public.users GROUP BY role;
```

### Find Admin Users
```sql
SELECT id, email, created_at FROM public.users WHERE role = 'admin';
```

## Support

If you encounter any issues:

1. Check the error message in toast notification
2. Review database schema matches requirements
3. Verify environment variables are set correctly
4. Check Supabase logs in dashboard
5. Run the verification queries above

