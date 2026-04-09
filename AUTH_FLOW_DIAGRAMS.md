# Authentication Flow Diagrams - Visual Reference

## 1. Complete Authentication Sequence Diagram

```
Student          Frontend          Supabase Auth       public.users      Student       Session
  │                 │                    │                   │           Record        (Browser)
  │                 │                    │                   │              │             │
  │  1. Enter Email & Password          │                   │              │             │
  ├────────────────────────────────────>│                   │              │             │
  │                                     │                   │              │             │
  │  2. Validate & Call loginUser()    │                   │              │             │
  │                                     │                   │              │             │
  │                                     │ 3. signInWithPassword(email, pwd)
  │                                     │<────────────────────────────────│             │
  │                                     │                   │              │             │
  │                                     │ 4. Verify password & return user.id
  │                                     │───────────────────────────────>│             │
  │                                     │                   │              │             │
  │  5. Query user row for role        │                   │              │             │
  │                                     │ 6. SELECT role FROM users WHERE id=?
  │                                     │<────────────────────────────────│             │
  │                                     │                   │              │             │
  │                                     │ 7. Return role: 'student'
  │                                     │───────────────────────────────>│             │
  │                                     │                   │              │             │
  │  8. Return loginData + userRole     │                   │              │             │
  │<────────────────────────────────────│                   │              │             │
  │                                     │                   │              │             │
  │  9. Check userRole == 'student'?    │                   │              │             │
  │                                     │                   │              │             │
  │  10. If YES → Set session in browser              (Store auth token)  │             │
  │                                     │                   │              │             ├────>
  │  11. Redirect /student/dashboard    │                   │              │             │
  ├───────────────────────────────────>│                   │              │             │
  │                                     │                   │              │             │
```

## 2. Student Dashboard Route Protection

```
User Visits /student/dashboard
         │
         ▼
    ┌─────────────────────────────────────┐
    │ withStudentGuard HOC Triggered      │
    │                                      │
    │ 1. Check session exists?             │
    │    getSession()                      │
    └──────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
       NO            YES
        │             │
        ▼             ▼
    Redirect     Continue
    /login       to Step 2

               │
               ▼
        ┌─────────────────────────────────┐
        │ 2. Get User Role               │
        │    getUserRole()                │
        │    Query: SELECT role FROM     │
        │    users WHERE id = user.id    │
        └──────────┬──────────────────────┘
                   │
        ───────────┼───────────────┐
        │           │               │
      admin      student         NULL/error
        │           │               │
        ▼           ▼               ▼
    Redirect   Render      Redirect
    /admin     Dashboard   /login
    ✅         ✅          ❌
```

## 3. Admin Dashboard Route Protection

```
Admin User Visits /admin/dashboard
         │
         ▼
    ┌──────────────────────────────┐
    │ withAdminGuard HOC Triggered │
    └──────────┬───────────────────┘
               │
        ┌──────┴──────┐
        │             │
       NO            YES
        │             │
        ▼             ▼
    Show error   Continue
    + redirect

               │
               ▼
        ┌──────────────────────┐
        │ Check role          │
        │ === 'admin'?        │
        └──────┬──────────────┘
               │
        ┌──────┴──────┐
        │             │
       YES            NO
        │             │
        ▼             ▼
    Render         Error
    Admin          + Logout
    Dashboard      + Redirect
    ✅             ❌
```

## 4. Student Creation Flow (Admin Action)

```
┌────────────────────────────────────────────────────────────────┐
│                    STUDENT CREATION FLOW                       │
└────────────────────────────────────────────────────────────────┘

Admin Dashboard
       │
       ├─ [Add Student Button] ─┐
       │                        │
       │                        ▼
       │                  StudentModal Opens
       │                  │
       │                  ├─ Select Batch
       │                  ├─ Enter Name
       │                  ├─ Enter Email
       │                  ├─ Select Category (optional)
       │                  │
       │                  ▼
       │                  [Add Button]
       │                        │
       │                        ▼
       │              handleAddStudent()
       │                        │
       │    ┌───────────────────┼───────────────────┐
       │    │                   │                   │
       │    ▼                   ▼                   ▼
       │  Validate       Generate UUID       Prepare Data
       │  Fields         if empty
       │    │                   │                   │
       │    └───────────────────┼───────────────────┘
       │                        │
       │                        ▼
       │              createStudent({
       │                id: "uuid-123",
       │                name: "John Doe",
       │                email: "john@...",
       │                batchId: "batch-1",
       │                category: "Good"
       │              })
       │                        │
       │                        ▼
       │  ┌─────────────────────────────────────┐
       │  │ database.ts                        │
       │  │                                    │
       │  │ await supabase               │
       │  │   .from("students")               │
       │  │   .insert([                       │
       │  │     {                             │
       │  │       id: uuid,                   │
       │  │       full_name: name,            │
       │  │       email: email,               │
       │  │       batch_id: batchId           │
       │  │     }                             │
       │  │   ])                              │
       │  │   .select()                       │
       │  └──────────────────┬────────────────┘
       │                     │
       │            ┌────────┴────────┐
       │            │                 │
       │           OK                ERROR
       │            │                 │
       │            ▼                 ▼
       │  UPDATE        Show
       │  LOCAL         Error
       │  STATE         Toast
       │    │
       │    ▼
       │  CLOSE
       │  MODAL
       │    │
       └────▼
         Dashboard
         Updated
         ✅
```

## 5. Bulk Student Import Flow

```
┌────────────────────────────────────────────────────────────────┐
│              BULK STUDENT IMPORT FLOW                          │
└────────────────────────────────────────────────────────────────┘

Admin Dashboard
       │
       ├─ [Import Students Button]
       │           │
       │           ▼
       │      ImportModal Opens
       │      │
       │      ├─ Select Batch
       │      ├─ Choose Excel File
       │      │
       │      ▼
       │      [Import Button]
       │           │
       │           ▼
       │      File Input Handler
       │      │
       │      ├─ Read file as ArrayBuffer
       │      ├─ Parse with XLSX library
       │      ├─ Extract rows
       │      │
       │      ▼
       │      Transform to Student Objects
       │      │
       │      └─ [
       │          { id, name, email, category },
       │          { id, name, email, category },
       │          ...
       │        ]
       │           │
       │           ▼
       │      createBulkStudents(studentArray)
       │           │
       │           ├─ Try bulk insert first
       │           │  supabase.insert([all_records])
       │           │
       │      ┌────┴────┐
       │      │          │
       │     OK          ERROR
       │      │          │
       │      ▼          ▼
       │    Return    Try one-by-one
       │    results   │
       │             ├─ Loop each student
       │             ├─ Insert individually
       │             ├─ Track success/fail
       │             │
       │             ▼
       │      Return results:
       │      {
       │        successful: 45,
       │        failed: 2,
       │        duplicates: 3,
       │        errors: [...]
       │      }
       │           │
       │           ▼
       │      createBulkEvaluations()
       │      │
       │      └─ For each student with category
       │         Insert into evaluations table
       │           │
       │           ▼
       │      Update Dashboard State
       │           │
       │           ▼
       │      Display Results Summary
       │           │
       └───────────▼
             ✅ Import Complete
             Show Toast with stats
```

## 6. Data Model Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                   DATA MODEL RELATIONSHIPS                       │
└──────────────────────────────────────────────────────────────────┘

auth.users (Supabase Internal)
    │
    │ (id Foreign Key)
    ▼
public.users (Role Mapping)
    │ id, email, role
    │
    ├─ (role = 'admin'  ) ──> /admin/login ---> /admin/dashboard
    │
    └─ (role = 'student') ──> /student/login --> /student/dashboard
                                      │                    │
                                      ▼                    ▼
                            Query (email match)   Load student profile
                                      │                    │
                                      ▼                    ▼
                                 students.email       students table
                                      │                    │
                                      └────────┬───────────┘
                                               │
                                               ▼
                                          students
                                          ├─ id
                                          ├─ full_name
                                          ├─ email (unique)
                                          ├─ batch_id ─────┐
                                          ├─ remarks       │
                                          ├─ report        │
                                          ├─ lastGenAt     │
                                          │                │
                                          ├─ evaluations ◄─┘
                                          │  ├─ id
                                          │  ├─ student_id ←─┐
                                          │  ├─ category    │
                                          │  │               │
                                          │  └─ metrics_*  ──┤
                                          │     (multiple    │
                                          │      tables)     │
                                          │                  │
                                          └─ batches ◄──────┘
                                             ├─ id
                                             ├─ batch_name
                                             └─ created_at
```

## 7. Session & Authentication State Flow

```
┌────────────────────────────────────────────────────────────────┐
│         SESSION & AUTHENTICATION STATE FLOW                    │
└────────────────────────────────────────────────────────────────┘

Initial State: Not Authenticated
    │
    ├─ session = null
    ├─ user = null
    ├─ userRole = null
    │
    ▼
User Navigates to /student/login
    │
    ▼
Login Form Displayed
    │
    ├─ Enter email & password
    ├─ Click Sign In
    │
    ▼
loginUser(email, password)
    │
    ├─ Authenticate with Supabase Auth
    │  └─ supabase.auth.signInWithPassword()
    │     ├─ Verify credentials
    │     ├─ Create session token
    │     └─ Set auth cookie (secure, httpOnly)
    │
    ├─ Fetch role from public.users
    │  └─ supabase.from("users").select("role")
    │
    ▼
State Updated:
    │
    ├─ session = { user: {...}, access_token: "..." }
    ├─ user = { id: "uuid", email: "..." }
    ├─ userRole = "student"
    │
    ▼
Redirect to /student/dashboard
    │
    ▼
withStudentGuard Checks:
    │
    ├─ getSession() → Returns stored session
    ├─ getUserRole() → Returns "student"
    ├─ Verify role == "student" → TRUE
    │
    ▼
Dashboard Loads
    │
    ├─ Display student profile
    ├─ Load remarks
    ├─ Load report
    │
    ▼
State: Authenticated & Authorized
    │
    ├─ session = { active: true }
    ├─ user = { authenticated: true }
    ├─ userRole = "student"
    │
    ▼ (Continues until logout)
    │
    
--- User clicks Logout ---
    │
    ▼
logoutUser()
    │
    ├─ supabase.auth.signOut()
    │  └─ Invalid session token
    │  └─ Clear auth cookie
    │
    ▼
State Reset:
    │
    ├─ session = null
    ├─ user = null
    ├─ userRole = null
    │
    ▼
Redirect to /student/login
    │
    ▼
State: Not Authenticated (Back to Start)
```

## 8. Role-Based Access Control (RBAC) Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                    RBAC PERMISSION MATRIX                        │
└──────────────────────────────────────────────────────────────────┘

Route                          Student    Admin    Public
─────────────────────────────────────────────────────────
/                              ✅         ✅       ✅
/student/login                 ✅         ✅       ✅
/admin/login                   ✅         ✅       ✅
/student/dashboard             ✅*        ❌       ❌
  (*if role='student')
/admin/dashboard               ❌         ✅**     ❌
  (**if role='admin' AND
     email='admin@nxtwave...')
/student/profile               ✅*        ❌       ❌
/api/generate-report           ✅         ✅       ❌
/api/generate-reports-batch    ❌         ✅       ❌

Action: Create Student
  ├─ Allowed by:    Admin only
  ├─ Method:        Manual form OR Bulk import
  ├─ Requires:      Admin auth + Batch selection
  └─ Impact:        Insert to students table

Action: View Own Profile
  ├─ Allowed by:    Authenticated student
  ├─ Via:           /student/dashboard
  ├─ Shows:         Email, name, batch, remarks, report
  └─ Editable:      None (read-only)

Action: View/Manage All Students
  ├─ Allowed by:    Admin only
  ├─ Via:           /admin/dashboard
  ├─ Can:           Search, filter, sort, add, delete
  └─ Impact:        Full CRUD to students table

Action: Generate Report
  ├─ Allowed by:    Admin only
  ├─ Endpoint:      POST /api/generate-report
  ├─ Target:        Single student
  └─ Updates:       students.report + lastGeneratedAt
```

## 9. Error Handling & Recovery Flow

```
┌────────────────────────────────────────────────────────────────┐
│          ERROR HANDLING & RECOVERY FLOW                        │
└────────────────────────────────────────────────────────────────┘

Login Attempt
    │
    ▼
Validation Errors?
    │
    ├─ Email empty? ❌ Toast: "Email required" → Stay on form
    ├─ Password empty? ❌ Toast: "Password required" → Stay on form
    ├─ Invalid format? ❌ Toast: "Invalid email" → Stay on form
    │
    ▼
Supabase Auth Error?
    │
    ├─ Invalid credentials ❌ 
    │  Message: "Invalid email or password"
    │  Action: Show error toast → Stay on form
    │
    ├─ Email not confirmed ❌
    │  Message: "Please confirm your email first"
    │  Action: Show error toast → Stay on form
    │
    ├─ User not found ❌
    │  Message: "No account with this email"
    │  Action: Show error toast → Stay on form
    │
    ├─ Too many attempts ❌
    │  Message: "Too many attempts, try again later"
    │  Action: Show error toast → Rate limit wait
    │
    ▼
Database Query Error?
    │
    ├─ User not in public.users?
    │  Action: Auto-create with role: "student"
    │  Continue: Proceed with login
    │
    ├─ Query timeout?
    │  Message: "Network error, please try again"
    │  Action: Show error toast → Retry
    │
    ▼
Role Verification Error?
    │
    ├─ Student role on admin login?
    │  Action: Logout + Redirect /student/login
    │  Message: "You must use student login"
    │
    ├─ Admin role on student login?
    │  Action: Logout + Redirect /admin/login
    │  Message: "Admins must use admin login"
    │
    ▼
Permission Error?
    │
    ├─ Student accessing /admin/dashboard?
    │  Action: withAdminGuard rejects → Redirect /student/login
    │
    ├─ Admin accessing /student/dashboard?
    │  Action: withStudentGuard rejects → Redirect /admin/dashboard
    │
    ▼
Session Error?
    │
    ├─ Session expired?
    │  Action: Redirect to login
    │  Message: "Session expired, please login again"
    │
    ├─ Token invalid?
    │  Action: Clear session → Redirect to login
    │  Message: "Please login again"
    │
    ▼
All checks pass?
    │
    ▼
✅ Login Success
  Redirect to appropriate dashboard
```

## 10. Environment Variables & Configuration

```
┌──────────────────────────────────────────────────────────────────┐
│           ENVIRONMENT VARIABLES DEPENDENCY GRAPH                 │
└──────────────────────────────────────────────────────────────────┘

.env.local file (ROOT)
    │
    ├─ NEXT_PUBLIC_SUPABASE_URL
    │  └─ Used in: src/lib/supabase.ts
    │     Purpose: Initialize Supabase client
    │     Validated: createClient() checks for presence
    │
    ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
    │  └─ Used in: src/lib/supabase.ts
    │     Purpose: Authenticate requests to Supabase
    │     Validated: createClient() checks for presence
    │
    └─ (Optional) Other configs not yet implemented:
       ├─ NEXT_PUBLIC_APP_URL (for email confirmations)
       ├─ SUPABASE_SERVICE_ROLE_KEY (for admin SDK)
       ├─ DATABASE_URL (for direct DB connection)
       └─ ...

Missing env = Error at startup:
"Missing Supabase credentials in environment variables"
└─ Application will not initialize
└─ All Supabase operations will fail

Validation in src/lib/supabase.ts:
    │
    ├─ if (!supabaseUrl) throw Error(...)
    ├─ if (!supabaseAnonKey) throw Error(...)
    │
    └─ If valid → Export supabase client
       └─ Available throughout app via imports
```
