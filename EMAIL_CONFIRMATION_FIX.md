# Email Confirmation Issues & Solutions

## Problem

You're getting "Email not confirmed" error when trying to login, even though you have valid credentials.

**Cause**: Email confirmation is **enabled** in your Supabase project, but test users haven't confirmed their emails yet.

## ✅ Quick Fix (Recommended for Development)

### Step 1: Disable Email Confirmation in Supabase

1. Go to **[Supabase Dashboard](https://supabase.com)**
2. Select your project
3. Navigate to **Authentication** → **Providers** → **Email**
4. **Toggle OFF** "Confirm email" 
   - This is the toggle in your screenshot that's currently OFF
5. Click **Save**
6. Refresh your browser
7. Try logging in again

**This takes effect immediately!** No need to create new accounts.

---

## Alternative: Confirm Emails Manually (If You Keep Email Confirmation On)

If you want to keep email confirmation enabled, confirm existing users' emails manually:

### Option A: SQL Query (Supabase Console)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Run this to confirm a specific user:

```sql
-- Confirm a specific user by email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@nxtwave.co.in';

-- Confirm all users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify the update
SELECT id, email, email_confirmed_at FROM auth.users;
```

### Option B: Create API Endpoint for Auto-Confirmation

If you want new users to auto-confirm on signup, create an API endpoint:

1. Create file: `src/app/api/auth/confirm-email/route.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Use service role key for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId required" },
        { status: 400 }
      );
    }

    // Confirm email for user
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirmed_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm email error:", error);
    return NextResponse.json(
      { error: "Failed to confirm email" },
      { status: 500 }
    );
  }
}
```

2. Update `src/lib/auth.ts` - Add function to call the API:

```typescript
/**
 * Auto-confirm email for development
 */
export async function confirmEmail(userId: string) {
  try {
    const response = await fetch("/api/auth/confirm-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Failed to confirm email");
    return await response.json();
  } catch (error) {
    console.error("Confirm email error:", error);
  }
}
```

3. Update `src/lib/auth.ts` - Call it in `signUpStudent()`:

```typescript
export async function signUpStudent(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Auto-confirm email for development
    if (data?.user?.id) {
      await confirmEmail(data.user.id); // Add this line
      
      // Create user record in users table with student role
      const { error: createError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            email,
            role: "student",
          },
        ]);

      if (createError) {
        console.error("Error creating user in database:", createError);
      }
    }

    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}
```

---

## ⚡ Immediate Solution (30 Seconds)

### Step 1: Disable Email Confirmation
- Go to Supabase Dashboard
- Authentication → Email
- Toggle **OFF** "Confirm email"
- Save

### Step 2: Refresh App
```bash
# In terminal
npm run dev
```

### Step 3: Try Login
- Email: `admin@nxtwave.co.in`
- Password: [your password]
- Click Sign In

**Result**: ✅ Should work immediately!

---

## Why This Happens

| Setting | Effect |
|---------|--------|
| Email confirmation **ON** | Users must click email link before login |
| Email confirmation **OFF** | Users can login immediately |

For development/testing, you typically want it **OFF**.

For production, you typically want it **ON** (with email verification).

---

## Recommended Settings by Environment

### Development
```
✅ Confirm email: OFF
✅ Anonymous sign-ins: OFF (you don't need)
✅ Allow manual linking: OFF
```

### Production
```
✅ Confirm email: ON
✅ Enable CAPTCHA: ON
✅ Set email templates: Configure
```

---

## Quick SQL Commands

**Confirm all test users (if keeping email confirmation ON):**
```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
```

**Check confirmation status:**
```sql
SELECT email, email_confirmed_at IS NOT NULL as confirmed FROM auth.users;
```

**Confirm specific user:**
```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@nxtwave.co.in';
```

---

## What To Do Now

1. **Option A (Easiest)**: 
   - Go to Supabase → Authentication → Email
   - Toggle OFF "Confirm email"
   - Save & refresh browser
   - ✅ Done!

2. **Option B (If keeping confirmation on)**:
   - Run the SQL command above to confirm existing users
   - Then try logging in

Try Option A first - it's the quickest fix! 🚀

