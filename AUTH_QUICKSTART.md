# Supabase Auth Implementation - Quick Start

## ✅ What I've Implemented

### 1. **Supabase Auth System** (`src/lib/auth.ts`)
- Login/signup functions using Supabase Auth
- Role-based access (admin/student)
- Session management
- User metadata for storing roles

### 2. **Separate Login Pages**
- **Admin Portal** (`/admin/login`):
  - Blue theme
  - Email + password login
  - Checks for admin role in metadata
  - Redirects to `/admin/dashboard` on success
  
- **Student Portal** (`/student/login`):
  - Green theme
  - Email + password login
  - Checks for student role in metadata
  - Redirects to `/student/dashboard` on success

### 3. **Admin Dashboard** (`/admin/dashboard`)
- View all students in a table
- Edit student remarks inline
- Save changes to database
- Call smart report generation API
- Logout button

### 4. **Student Dashboard** (`/student/dashboard`)
- View own profile (name, email, batch)
- View remarks (read-only)
- View generated report (read-only)
- View when report was last generated
- Logout button
- No editing abilities

### 5. **Smart Report Generation** (`/api/generate-report`)
```
When admin updates remarks:
├─ Check if remarks actually changed
├─ If CHANGED:
│  ├─ Call Gemini AI to generate report
│  └─ Save new report to database
└─ If UNCHANGED:
   └─ Return cached report (saves API costs!)
```

### 6. **Home Page Redirect** (`/app/page.tsx`)
- Automatically routes users to correct page:
  - No session → `/admin/login`
  - Admin role → `/admin/dashboard`
  - Student role → `/student/dashboard`

---

## 🗄️ Database Schema Changes

Your `students` table needs these columns:

```sql
ALTER TABLE students ADD COLUMN remarks TEXT DEFAULT '';
ALTER TABLE students ADD COLUMN report TEXT DEFAULT '';
ALTER TABLE students ADD COLUMN lastGeneratedAt TIMESTAMP DEFAULT NOW();
```

---

## 👤 Create Test Users

### In Supabase Console → Authentication → Users:

**Admin User:**
- Email: `admin@example.com`
- Password: `Password123!`
- User Metadata:
  ```json
  { "role": "admin" }
  ```

**Student User:**
- Email: `student@example.com`
- Password: `Password123!`
- User Metadata:
  ```json
  { "role": "student" }
  ```

---

## 📝 Add Test Student Data

In Supabase SQL Editor, run:

```sql
INSERT INTO students (full_name, email, batch_id, remarks, report)
VALUES ('John Doe', 'student@example.com', 'batch-1', 'Great performance!', '');
```

---

## 🚀 Start Development

```bash
npm run dev
```

Then visit: http://localhost:3000

---

## 🧪 Test the Flow

### Test Admin:
1. Home → redirects to admin login
2. Click "Sign in as student" to toggle
3. Enter admin credentials
4. Should see admin dashboard with students table
5. Click "Edit" to update remarks
6. Click "Save" to trigger report generation
7. Click "Logout"

### Test Student:
1. Go to http://localhost:3000/student/login
2. Enter student credentials
3. Should see only your profile and report (read-only)
4. Try to edit → can't (protected)
5. Click "Logout"

---

## 📂 File Structure

```
src/
├── lib/
│   ├── auth.ts                    ← Auth functions (NEW)
│   ├── supabase.ts                ← Supabase client
│   ├── reportGenerator.ts         ← AI report generation
│   └── database.ts                ← Database queries
├── app/
│   ├── page.tsx                   ← Home (redirects users)
│   ├── admin/
│   │   ├── login/page.tsx         ← Admin login (NEW)
│   │   └── dashboard/page.tsx     ← Admin dashboard (NEW)
│   └── student/
│       ├── login/page.tsx         ← Student login (NEW)
│       └── dashboard/page.tsx     ← Student dashboard (NEW)
└── api/
    └── generate-report/
        └── route.ts               ← Smart report API (UPDATED)
```

---

## ⚙️ Code Examples

### Checking User Role:
```typescript
import { getUserRole } from "@/lib/auth";

const role = await getUserRole();
if (role === "admin") {
  // Show admin features
}
```

### Getting Current User:
```typescript
import { getSession } from "@/lib/auth";

const session = await getSession();
console.log(session?.user?.email);
```

### Logging Out:
```typescript
import { logoutUser } from "@/lib/auth";

await logoutUser();
// Clears Supabase session
```

---

## 🔒 Security Features

✅ **Role-based access control**
- Checks `user_metadata.role` before allowing access

✅ **Session validation**
- Routes check if user is logged in via Supabase session

✅ **Read-only student dashboard**
- Students cannot edit anything
- Can only view their own data

✅ **Smart report generation**
- Only calls AI when remarks actually change
- Saves costs by using cached reports

✅ **Secure logout**
- Clears Supabase session tokens

---

## 📝 Key Code Patterns

### In Components (Client-side):
```typescript
"use client"; // Client component (can use auth)

import { getSession, getUserRole } from "@/lib/auth";

// Check auth on mount
useEffect(() => {
  const session = await getSession();
  if (!session) router.push("/admin/login");
}, []);
```

### In API Routes (Server-side):
```typescript
// /api/generate-report/route.ts
import { supabase } from "@/lib/supabase";

// Check if remarks changed before generating report
if (oldRemarks === newRemarks && cachedReport) {
  // Return cached report
  return { report: cachedReport, isNew: false };
} else {
  // Generate new report
  return { report: newReport, isNew: true };
}
```

---

## 🐛 Troubleshooting

### "Student not found"
- Make sure you've inserted test student to database
- Email in students table must match login email

### "Login failed"
- Check that user exists in Supabase Auth
- Verify email/password are correct

### "This account does not have X access"
- Check user's metadata in Supabase
- Make sure `role` is set to "admin" or "student"

### "Report not generating"
- Check Gemini API key in `.env.local`
- Verify report generation code ran without errors

---

## 📞 Next Steps

1. ✅ Update Supabase schema (add columns)
2. ✅ Create test admin/student users
3. ✅ Add test student data
4. ✅ Run `npm run dev`
5. ✅ Test login flows
6. ✅ Test report generation
7. → Deploy to production!

---

**For detailed setup steps, see [SETUP_AUTH.md](./SETUP_AUTH.md)**
