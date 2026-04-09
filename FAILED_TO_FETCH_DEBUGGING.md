# "Failed to Fetch" Error - Troubleshooting Guide

## Overview

The "Failed to fetch" error in the admin dashboard typically occurs when trying to load batches or students, or when generating reports. I've added better logging to help diagnose the issue.

## 🔍 Where to Check for Errors

### Step 1: Open Browser Developer Tools

1. Press **F12** or **Right-click → Inspect**
2. Go to **Console** tab
3. Look for log messages starting with:
   - `📥 Loading batches and students from Supabase...`
   - `✅ Batches loaded:`
   - `❌ Error fetching batches:`
   - `❌ Error fetching students:`
   - `❌ Error loading data from Supabase:`

### Step 2: Identify Where It Fails

The console logs will show exactly what failed:

```
✅ Version 16.2.1
📥 Loading batches and students from Supabase...
❌ Error fetching batches: [exact error message]
```

## 🚨 Common Causes and Solutions

### **Issue 1: Database Permission Error**

**Error Message:** `❌ Error fetching batches: permission denied`

**Solution:**
1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Set RLS policies:

```sql
-- Allow reading batches
CREATE POLICY "Users can read batches"
  ON batches FOR SELECT
  TO authenticated
  USING (true);

-- Allow reading students
CREATE POLICY "Users can read students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

-- Allow reading evaluations
CREATE POLICY "Users can read evaluations"
  ON evaluations FOR SELECT
  TO authenticated
  USING (true);
```

---

### **Issue 2: Tables Don't Exist**

**Error Message:** `❌ Error fetching batches: relation "batches" does not exist`

**Solution:**

Create the necessary tables:

```sql
-- Create batches table
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  category TEXT,
  metrics_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **Issue 3: Network/CORS Error**

**Error Message:** `❌ Failed to fetch`

**Solution:**

This usually means:
1. The dev server crashed or isn't running
2. Supabase credentials are invalid

**Fix:**
```bash
# Stop the server (Ctrl+C)
# Restart it
npm run dev
```

---

### **Issue 4: Environment Variables Not Set**

**Error Message:** When sending reports - `❌ N8N_WEBHOOK_URL not configured`

**Solution:**

The app won't crash, but will warn you. To fix:

1. Open `.env.local`
2. Add (or already have):

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-webhook-url
```

If N8N_WEBHOOK_URL is not set, reports will generate but won't send via email.

---

## 🛠️ Step-by-Step Debugging

### 1. Check Database Connection

Open browser console and look for:

```
📥 Loading batches and students from Supabase...
✅ Batches loaded: 5
✅ Students loaded: 25
```

If you see this, database is working! ✅

### 2. Check Permission Issues

Look for:

```
❌ Error fetching batches: permission denied
```

If yes → Fix RLS policies (see Issue 2 above)

### 3. Check Table Existence

Look for:

```
❌ Error fetching batches: relation "batches" does not exist
```

If yes → Create tables (see Issue 2 above)

### 4. Check API Routes

When generating reports, console shows:

```
📄 Generating report for: John Doe
✅ Report generated successfully
```

OR

```
❌ API error: 500
```

If you see a 500 error → check server logs

---

## 📊 Full Console Output Examples

### ✅ **Good - Healthy Dashboard**

```
📥 Loading batches and students from Supabase...
✅ Batches loaded: 3
✅ Students loaded: 18
📄 Generating report for: Alice
✅ Report generated successfully
✅ Report sent to: alice@example.com
```

### ❌ **Bad - Permission Denied**

```
📥 Loading batches and students from Supabase...
❌ Error fetching batches: new PayloadTooLargeError("relation 'batches' does not exist")
📦 Using cached batches from localStorage
```

**Fix:** Create the batches table

### ❌ **Bad - Network Error**

```
📥 Loading batches and students from Supabase...
❌ Error loading data from Supabase: TypeError: Failed to fetch
📦 Using cached batches from localStorage
```

**Fix:** Check internet connection or restart dev server

---

## 🚀 How to Enable Debug Mode

The updated code now logs everything to the console. You'll see:

- `📥` = Starting operation
- `✅` = Success
- `❌` = Error
- `📦` = Using fallback/cache
- `📄` = Report generation
- `📧` = Email sending

All with context about what was attempted and what failed.

---

## 📞 Getting More Help

1. **Open DevTools (F12)**
2. **Go to Console tab**
3. **Copy all error messages**
4. **Share them** - they'll tell us exactly what's wrong

Example helpful error:
```
❌ Error fetching batches: relation "public.batches" does not exist
```

This tells us: we need to create the `batches` table in Supabase.

---

## 🎯 Quick Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] Supabase credentials in `.env.local`
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Console shows `✅` messages, not `❌`
- [ ] No "Failed to fetch" errors

If all checked ✅, the dashboard should work!

