# Quick Reference - Database-Driven Role Verification

## ✅ What Was Implemented

### 1. Enhanced Authentication (`src/lib/auth.ts`)
- ✅ `loginUser()` - Now fetches role from `public.users` table
- ✅ `getUserRole()` - Changed from user metadata to database query
- ✅ Auto-creates users - New users automatically added to `public.users` with `"student"` role

### 2. Admin Login with Validation (`src/app/admin/login/page.tsx`)
- ✅ Email validation - Only `admin@nxtwave.co.in` allowed
- ✅ Role verification - Checks database role is `"admin"`
- ✅ Automatic logout - If not authorized, logs out immediately
- ✅ Error feedback - Specific toast messages for each failure

### 3. Student Login with Role Check (`src/app/student/login/page.tsx`)
- ✅ Role verification - Checks role is `"student"`
- ✅ Admin rejection - Admins redirected with message to use admin portal
- ✅ Unknown role handling - Logs out and shows error for invalid roles
- ✅ Error feedback - Clear messages for all scenarios

### 4. Route Protection HOCs (`src/lib/roleGuard.tsx`)
- ✅ `withAdminGuard()` - Protects admin routes
  - Checks session validity
  - Verifies admin role from database
  - Auto-redirects unauthorized users to `/student/login`
  - Shows loading screen while checking
  
- ✅ `withStudentGuard()` - Protects student routes
  - Checks session validity
  - Verifies student role from database
  - Redirects admins to `/admin/dashboard`
  - Logs out unknown roles

### 5. Protected Dashboards
- ✅ `/admin/dashboard` - Wrapped with `withAdminGuard`
- ✅ `/student/dashboard` - Wrapped with `withStudentGuard`

## 🔒 Security Features

| Feature | Benefit |
|---------|---------|
| Database-driven roles | Cannot be forged by client-side manipulation |
| Admin email restriction | Only `admin@nxtwave.co.in` can access admin features |
| Session validation | Expired sessions redirected to login |
| Automatic logout | Failed authorization triggers immediate logout |
| Loading screens | Prevents flash of unauthorized content |
| Cross-role rejection | Admins can't access student routes, vice versa |
| Role consistency | Single source of truth from database |

## 📊 User Flows

### Admin Login
```
1. Enter admin@nxtwave.co.in + password
2. Authenticate (Supabase)
3. ✓ Verify email = admin@nxtwave.co.in
4. ✓ Verify role = "admin" (from database)
5. → /admin/dashboard
```

### Student Login
```
1. Enter student@example.com + password
2. Authenticate (Supabase)
3. ✓ Verify role = "student" (from database)
4. → /student/dashboard
```

### Unauthorized Access Attempts
```
Non-admin email trying admin login → Logout + Error
Admin role trying student login → Logout + "Use admin portal" message
Unknown role → Logout + Error
Session expired → Redirect to login
```

## 🎯 Test Cases

### ✅ Test 1: Successful Admin Login
```
Email: admin@nxtwave.co.in
Password: [correct]
Expected: → /admin/dashboard
```

### ✅ Test 2: Successful Student Login
```
Email: student@example.com
Password: [correct]
Expected: → /student/dashboard
```

### ✅ Test 3: Wrong Admin Email
```
Email: wrong@example.com (with admin role)
Password: [correct]
Expected: Error "Only admin@nxtwave.co.in can access admin portal"
```

### ✅ Test 4: Wrong Role
```
Email: admin@nxtwave.co.in
Role in DB: "student"
Password: [correct]
Expected: Error "Your account does not have admin permissions"
```

### ✅ Test 5: Route Protection - Student → Admin
```
1. Login as student
2. Visit /admin/dashboard manually
3. Expected: Redirect to /student/login
```

### ✅ Test 6: Route Protection - Admin → Student
```
1. Login as admin
2. Visit /student/dashboard manually
3. Expected: Error message, stay redirected
```

## 📝 Database Requirements

### `public.users` Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL,  -- "admin" or "student"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Admin Setup
```sql
INSERT INTO public.users (id, email, role)
VALUES ('[user_id]', 'admin@nxtwave.co.in', 'admin');
```

### Student Setup
```sql
INSERT INTO public.users (id, email, role)
VALUES ('[user_id]', 'student@example.com', 'student');
```

## 🚀 Deployment Checklist

- [ ] Database schema created (see `DATABASE_SETUP_GUIDE.md`)
- [ ] Admin user created in `public.users` with email `admin@nxtwave.co.in`
- [ ] Test admin login works
- [ ] Test student login works
- [ ] Test students can't access `/admin/dashboard`
- [ ] Test admins can't access `/student/dashboard`
- [ ] Environment variables configured
- [ ] Project built successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] Toast notifications working
- [ ] Logout functionality tested

## 📂 Files Changed

| File | Changes |
|------|---------|
| `src/lib/auth.ts` | Enhanced role verification from database |
| `src/app/admin/login/page.tsx` | Added email & role validation |
| `src/app/student/login/page.tsx` | Added role verification logic |
| `src/app/admin/dashboard/page.tsx` | Wrapped with `withAdminGuard` |
| `src/app/student/dashboard/page.tsx` | Wrapped with `withStudentGuard` |
| `src/lib/roleGuard.tsx` | NEW: Route protection HOCs |

## 📄 New Documentation

| File | Purpose |
|------|---------|
| `DATABASE_ROLE_VERIFICATION.md` | Complete feature documentation |
| `DATABASE_SETUP_GUIDE.md` | Step-by-step database setup |
| `ROLE_VERIFICATION_QUICK_START.md` | This file - quick reference |

## 🎓 Key Concepts

### Session vs Role
- **Session**: Managed by Supabase Auth (authentication)
- **Role**: Stored in `public.users` table (authorization)

### Route Guards
- Not middleware - these are **client-side HOCs**
- Run on component mount
- Show loading screen while checking
- Redirect if unauthorized

### Database-Driven Auth
- **Advantages**: 
  - Can't be forged
  - Flexible permissioning
  - Easy to revoke access
  - Single source of truth
  
- **Trade-off**: 
  - One extra database query per login
  - Slightly longer auth flow

## 🔧 Customization

### Change Admin Email
In `src/app/admin/login/page.tsx`:
```typescript
if (loginData.email !== "your-admin@domain.com") {
  // Change this line to your admin email
}
```

### Add More Roles
In `src/lib/roleGuard.tsx`:
```typescript
// Create new guard for other roles
export function withModeratorGuard<P extends object>(
  Component: ComponentType<P>
) {
  // Similar to withAdminGuard but check for "moderator" role
}
```

### Customize Loading Screen
In `src/lib/roleGuard.tsx`, modify `LoadingScreen()` component

## ❓ FAQ

**Q: Can I use metadata instead of database?**
A: No, database is required for security. Metadata can't be trusted.

**Q: How do I change someone from admin to student?**
A: `UPDATE public.users SET role = 'student' WHERE email = 'user@example.com';`

**Q: Can students create their own admin accounts?**
A: No. Only direct database updates can set role to 'admin'.

**Q: What happens if user exists in auth but not in public.users?**
A: Automatically created with 'student' role on first login.

**Q: How long until an unauthorized user gets logged out?**
A: Immediately on next route protection check or page reload.

**Q: Can I have multiple admin emails?**
A: No, current implementation restricts to admin@nxtwave.co.in. Modify to allow more emails if needed.

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| Login redirect loop | Clear cache, check role in DB |
| Student sees admin page | Hard refresh, check roleGuard wrapper |
| Role doesn't update | Verify UPDATE query, check DB constraints |
| Toast not showing | Ensure ToastContainer in root layout |
| Session expires too fast | Check Supabase session config |

## 🎉 Status

✅ **Implementation Complete**
- All role verification logic implemented
- All route guards in place
- All error messages configured
- Build successful (0 errors)
- Ready for testing

🚀 **Next Steps**
1. Set up database schema
2. Create admin user
3. Test login flows
4. Verify route protection
5. Deploy to production

