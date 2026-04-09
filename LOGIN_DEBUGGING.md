# 🔍 Login Error Debugging Guide

## What Changed?

✅ **Better Error Messages** - The app now shows specific toasts for each error type
✅ **Input Validation** - Checks email format and passwords before trying to login  
✅ **Better Logging** - Console logs include timestamp and email for debugging
✅ **Role Verification** - Checks if user has the correct role (admin/student)

---

## 📋 Error Messages and Solutions

### ❌ "Invalid email or password"

**What it means:** 
- Email doesn't exist in Supabase Auth, OR
- Password is wrong

**How to fix:**
1. **Double-check the email** - Spelling mistakes?
2. **Verify it's created in Supabase** - Go to Auth → Users and look for the email
3. **Check the password** - Must be exactly: `Password123!` (with the `!`)
4. **Try on a fresh browser** - Clear cookies (Ctrl+Shift+Delete)

**Test:**
```
Admin Email: admin@example.com
Password: Password123!
```

---

### ⚠️ "Please enter your email address"

**What it means:** You clicked "Sign In" without entering an email

**How to fix:**
- Type your email in the email field and try again

---

### ⚠️ "Please enter your password"

**What it means:** You clicked "Sign In" without entering a password

**How to fix:**
- Type your password in the password field and try again

---

### ❌ "Please enter a valid email address"

**What it means:** Email doesn't have an `@` symbol

**How to fix:**
- Make sure email looks like: `admin@example.com` (has `@`)
- Not like: `admineexample.com` (missing `@`)

---

### ❌ "Email verification required"

**What it means:** 
- Email confirmation is enabled in Supabase
- You need to click the link in your email first

**How to fix:**
1. Go to **Supabase Console** → **Authentication** → **Providers** → **Email**
2. Find the toggle for **"Confirm email"** or **"Require email confirmation"**
3. **DISABLE it** by clicking the toggle (make it gray/unchecked)
4. Click **Save** if there's a button
5. Try logging in again

---

### ❌ "No account found with this email"

**What it means:** 
- Supabase doesn't have this email in the system
- The user wasn't created properly

**How to fix:**
1. Go to **Supabase Console**
2. Click **Authentication** in the left sidebar
3. Look for the email in the Users list
4. If it's not there:
   - Create it using "Create new user" button
   - Email: `admin@example.com`
   - Password: `Password123!`
   - Metadata: `{"role":"admin"}`
5. Try logging in again

---

### ❌ "Your account has no role assigned"

**What it means:** 
- User exists but has no role in metadata
- Can't determine if they're admin or student

**How to fix:**
1. Go to **Supabase Console** → **Authentication** → **Users**
2. Click on the user email
3. Scroll to **"User Metadata"** section
4. Add the role:
   - For admin: `{"role":"admin"}`
   - For student: `{"role":"student"}`
5. Click **Save**
6. Try logging in again

---

### ❌ "This account has 'admin' role, not student access"

**What it means:** 
- You're trying to login on `/student/login` page
- But this email has `admin` role
- You need to use the correct portal

**How to fix:**
- **If you're an admin:** Go to `/admin/login`
- **If you're a student:** Use a different email that has `student` role
- Check the role in Supabase User Metadata

---

### ❌ "This account has 'student' role, not admin access"

**What it means:** 
- You're trying to login on `/admin/login` page
- But this email has `student` role
- You need to use the correct portal

**How to fix:**
- **If you're a student:** Go to `/student/login`
- **If you're an admin:** Use a different email that has `admin` role
- Check the role in Supabase User Metadata

---

### ⏱️ "Too many login attempts"

**What it means:** 
- You tried to login many times with wrong password
- Supabase locked the account temporarily for security

**How to fix:**
- **Wait 5-15 minutes** before trying again
- Make sure you have the correct password
- Try again after the timeout

---

### ❌ "Network error"

**What it means:** 
- No internet connection, OR
- Supabase service is down

**How to fix:**
1. Check your internet connection
2. Refresh the page
3. Try again in a few moments
4. Check if Supabase is operational: https://status.supabase.com

---

## 🧪 Step-by-Step Test

### Test Admin Login:

1. Go to http://localhost:3000/admin/login
2. Enter:
   - Email: `admin@example.com`
   - Password: `Password123!`
3. Click "Sign In"

**Expected:**
- ✅ Toast shows "🔄 Signing in..."
- ✅ Toast shows "✅ Login successful! Redirecting..."
- ✅ Redirect to `/admin/dashboard`

### Test Student Login:

1. Go to http://localhost:3000/student/login
2. Enter:
   - Email: `student@example.com`
   - Password: `Password123!`
3. Click "Sign In"

**Expected:**
- ✅ Toast shows "🔄 Signing in..."
- ✅ Toast shows "✅ Login successful! Redirecting..."
- ✅ Redirect to `/student/dashboard`

---

## 🐛 Debugging Guide

### Check Browser Console:

1. Right-click on the page
2. Click **"Inspect"** or **"Inspect Element"**
3. Go to **"Console"** tab
4. Look for logs like:
   ```
   Login attempt failed: {
     email: "admin@example.com",
     error: "Invalid email or password.",
     timestamp: "2026-04-06T10:30:45.123Z"
   }
   ```

**This helps identify exactly what's wrong!**

---

### Check Supabase Logs:

1. Go to **Supabase Console**
2. Click **Authentication**
3. Go to **"Logs"** tab
4. Look for failed login attempts
5. See the exact error from Supabase

---

## ✅ Checklist Before Login

- [ ] Users created in Supabase Auth
- [ ] Users have correct metadata: `{"role":"admin"}` or `{"role":"student"}`
- [ ] Email confirmation is DISABLED (not required)
- [ ] Using correct email: `admin@example.com` or `student@example.com`
- [ ] Using correct password: `Password123!` (with the `!`)
- [ ] Internet connection is working
- [ ] No "too many attempts" lockout

---

## 💡 Tips

✅ **Clear browser cookies** if you keep getting redirected
- Ctrl+Shift+Delete → Clear browsing data

✅ **Check console** (F12 → Console) for detailed error logs

✅ **Verify JSON** is valid when editing metadata
- Use https://jsonlint.com if unsure

✅ **Try incognito/private mode** to rule out cached data

✅ **Test one user at a time** - Get admin login working first

---

## 🆘 Still Stuck?

**Collect this info and let me know:**

1. What email are you using? (admin@example.com?)
2. Does the email exist in Supabase Auth? (Check Users list)
3. What role is in the metadata? (Check User Metadata)
4. What's the exact error message shown in the toast?
5. What's in the browser console? (F12 → Console)

---

**Good luck! 🚀**
