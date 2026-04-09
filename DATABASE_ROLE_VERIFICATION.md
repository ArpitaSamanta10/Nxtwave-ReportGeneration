# Database-Driven Role Verification & Route Protection

## Overview

The authentication system has been upgraded to use **database-driven role verification** instead of user metadata. This provides better security, flexibility, and ensures roles are verified from the `public.users` table.

## Key Changes

### 1. **Enhanced Auth Functions** (`src/lib/auth.ts`)

#### `loginUser(email, password)` - Database Role Verification
- **What Changed**: Now fetches the user's role from the `public.users` table after authentication
- **Returns**: User data with `userRole` field from database
- **Auto-creates**: If user doesn't exist in `users` table, automatically creates entry with `student` role

```typescript
const loginData = await loginUser(email, password);
console.log(loginData.userRole); // "admin" | "student"
```

#### `getUserRole()` - Database Lookup
- **What Changed**: Now queries `public.users` table instead of user metadata
- **Returns**: Role string ("admin" or "student") or null if not found

```typescript
const role = await getUserRole();
if (role === "admin") { /* ... */ }
```

### 2. **Admin Login - Email & Role Validation** (`src/app/admin/login/page.tsx`)

✅ **Step 1**: Authenticate with Supabase Auth
✅ **Step 2**: Verify email is `admin@nxtwave.co.in`
✅ **Step 3**: Verify role from database is `"admin"`
❌ **Unauthorized**: Non-matching email or role triggers automatic logout

```typescript
// Email validation
if (loginData.email !== "admin@nxtwave.co.in") {
  await logoutUser();
  addToast("❌ Unauthorized - Only admin@nxtwave.co.in can access admin portal", "error");
  return;
}

// Role validation
if (userRole !== "admin") {
  await logoutUser();
  addToast("❌ Unauthorized - Your account doesn't have admin permissions", "error");
  return;
}
```

### 3. **Student Login - Role Verification** (`src/app/student/login/page.tsx`)

✅ **Step 1**: Authenticate with Supabase Auth
✅ **Step 2**: Verify role from database is `"student"`
❌ **Admin Redirect**: If role is "admin", reject with admin portal message
❌ **Unauthorized**: If role is unknown, logout and show error

```typescript
// Verify role
if (userRole === "admin") {
  await logoutUser();
  addToast("❌ Admin accounts must login via the admin portal", "error");
  return;
}

if (userRole !== "student") {
  await logoutUser();
  addToast(`❌ Unauthorized - Unknown role "${userRole}"`, "error");
  return;
}
```

### 4. **Route Protection HOC** (`src/lib/roleGuard.tsx`)

Two Higher-Order Components protect routes from unauthorized access:

#### `withAdminGuard(Component)` - Protect Admin Routes
- Checks if user has active session
- Verifies role is `"admin"` from database
- Redirects to `/student/login` if unauthorized
- Shows loading screen while checking access

```typescript
import { withAdminGuard } from "@/lib/roleGuard";

function AdminDashboard() { /* ... */ }
export default withAdminGuard(AdminDashboard);
```

**Protection**: Students cannot manually access `/admin/dashboard` - they're automatically redirected

#### `withStudentGuard(Component)` - Protect Student Routes
- Checks if user has active session
- Verifies role is `"student"` from database
- Redirects to `/admin/dashboard` if admin tries to access
- Shows loading screen while checking access

```typescript
import { withStudentGuard } from "@/lib/roleGuard";

function StudentDashboard() { /* ... */ }
export default withStudentGuard(StudentDashboard);
```

**Protection**: Admins redirected to admin portal; unknown roles logged out and redirected to login

## User Database Schema

Your `public.users` table should have this structure:

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,              -- Same as auth.users.id
  email TEXT NOT NULL,              -- User's email
  role TEXT NOT NULL,               -- "admin" or "student"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Flow Diagrams

### Admin Login Flow

```
1. Enter email + password
   ↓
2. Authenticate via Supabase Auth
   ↓
3. ✓ Session exists
   ↓
4. Check email === "admin@nxtwave.co.in"
   ✗ → Logout + "Only admin@nxtwave.co.in can access" error
   ✓
   ↓
5. Fetch role from public.users
   ✗ → Logout + "No admin permissions" error
   ✓ role === "admin"
   ↓
6. Redirect to /admin/dashboard
```

### Student Login Flow

```
1. Enter email + password
   ↓
2. Authenticate via Supabase Auth
   ↓
3. ✓ Session exists
   ↓
4. Fetch role from public.users
   ✗ role === "admin" → Logout + "Use admin portal" error
   ✗ role === unknown → Logout + "Contact support" error
   ✓ role === "student"
   ↓
5. Redirect to /student/dashboard
```

### Protected Route Access

```
User tries to access /admin/dashboard
   ↓
withAdminGuard checks session
   ✗ No session → Redirect to /admin/login
   ✓
   ↓
withAdminGuard fetches role from database
   ✗ role !== "admin" → Logout + Redirect to /student/login
   ✓
   ↓
Component renders with full access
```

## Security Features

### 1. **Email Verification for Admin**
- Only `admin@nxtwave.co.in` can access admin portal
- Other emails with admin role rejected

### 2. **Database-Driven Roles**
- Roles stored in database, not user metadata
- Cannot be forged on client side
- Single source of truth for authorization

### 3. **Automatic Role Assignment**
- New users default to `"student"` role
- Update `public.users` to change role to `"admin"`

### 4. **Session Expiration Protection**
- Route guards check session validity
- Expired sessions redirected to login
- Loading screen prevents flash of unauthorized content

### 5. **Cross-Role Rejection**
- Admins trying to access student portal → redirected to admin portal
- Students trying to access admin portal → logged out and redirected to login

## Testing the Implementation

### Test 1: Admin Login
```
1. Email: admin@nxtwave.co.in
2. Password: [correct password]
3. Expected: ✓ Access to /admin/dashboard
```

### Test 2: Non-Admin Email with Admin Role
```
1. Email: [different email]@domain.com
2. Role: admin (in public.users table)
3. Expected: ✗ "Only admin@nxtwave.co.in can access admin portal"
```

### Test 3: Student Login
```
1. Email: student@example.com
2. Password: [correct password]
3. Expected: ✓ Access to /student/dashboard
```

### Test 4: Admin Accessing Student Route
```
1. Logged in as admin
2. Try to access /student/dashboard
3. Expected: ✗ Redirect to /admin/dashboard
```

### Test 5: Student Accessing Admin Route
```
1. Logged in as student
2. Try to access /admin/dashboard
3. Expected: ✗ Redirect to /student/login
```

### Test 6: Unknown Role
```
1. User has role = "moderator" in public.users
2. Try to login
3. Expected: ✗ "Unknown role 'moderator'"
```

## Database Setup

### Update User Roles

To make a user an admin:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@nxtwave.co.in';
```

To change admin to student:

```sql
UPDATE public.users
SET role = 'student'
WHERE email = 'admin@nxtwave.co.in';
```

### Check User Roles

```sql
SELECT id, email, role
FROM public.users
ORDER BY created_at DESC;
```

## Error Messages Explained

| Error | Cause | Solution |
|-------|-------|----------|
| "Only admin@nxtwave.co.in can access admin portal" | Non-admin email trying to access admin login | Use admin@nxtwave.co.in email |
| "Your account does not have admin permissions" | Admin email with student role in database | Update role in public.users to "admin" |
| "Unauthorized - Unknown role" | User role is not "admin" or "student" | Contact admin to set correct role |
| "Admin accounts must login via the admin portal" | Admin trying to login as student | Use /admin/login instead |
| "Session expired. Please login again." | Session invalid or expired | Login again at /admin/login or /student/login |

## Files Modified

1. ✅ `src/lib/auth.ts` - Enhanced with database role verification
2. ✅ `src/app/admin/login/page.tsx` - Added email & role validation
3. ✅ `src/app/student/login/page.tsx` - Added role verification
4. ✅ `src/lib/roleGuard.tsx` - NEW: Route protection HOCs
5. ✅ `src/app/admin/dashboard/page.tsx` - Wrapped with withAdminGuard
6. ✅ `src/app/student/dashboard/page.tsx` - Wrapped with withStudentGuard

## Next Steps

1. **Verify Database**: Ensure all users in `public.users` have correct roles
2. **Test Login Flow**: Test both admin and student login with various scenarios
3. **Verify Route Guards**: Try manually accessing protected routes as different roles
4. **Monitor Toast Messages**: Check that appropriate error messages appear
5. **Session Management**: Verify session expiration behavior

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Login                           │
├─────────────────────────────────────────────────────────┤
│ 1. Auth.signInWithPassword (Supabase Auth)             │
│    ↓                                                     │
│ 2. loginUser() fetches role from public.users table    │
│    ↓                                                     │
│ 3. Email validation (admin only)                        │
│    ↓                                                     │
│ 4. Role validation                                      │
│    ↓                                                     │
│ 5. Redirect to appropriate dashboard                    │
└─────────────────────────────────────────────────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
    ┌────────────┐        ┌──────────────┐
    │   ADMIN    │        │    STUDENT   │
    │ Dashboard  │        │  Dashboard   │
    └────────────┘        └──────────────┘
         ↑                       ↑
    withAdminGuard         withStudentGuard
    (route protection)     (route protection)
```

## Troubleshooting

### Issue: "Session expired" when just logged in
**Solution**: Check if `getSession()` returns valid session. Clear browser cookies and login again.

### Issue: Admin sees "No admin permissions"
**Solution**: Verify in Supabase that the user's role in `public.users` is set to "admin".

### Issue: Student can access /admin/dashboard
**Solution**: Ensure admin dashboard is wrapped with `withAdminGuard` HOC. Rebuild project with `npm run build`.

### Issue: Toast not showing error message
**Solution**: Ensure `<ToastContainer>` is in root layout. Check `src/app/layout.tsx`.

