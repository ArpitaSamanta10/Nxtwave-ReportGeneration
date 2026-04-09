import { supabase } from "./supabase";

// ========== AUTHENTICATION FUNCTIONS ==========
// These handle login, signup, and session management with Supabase Auth
// Role is verified from public.users table, not user_metadata

/**
 * Login user with email and password
 * Authenticates via Supabase Auth, then verifies role from database
 * @param email - User email
 * @param password - User password
 * @returns User data with authenticated session
 */
export async function loginUser(email: string, password: string) {
  try {
    // Step 1: Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map Supabase error codes to user-friendly messages
      if (error.status === 400) {
        if (error.message?.includes("Invalid login credentials")) {
          throw new Error(
            `Invalid email or password. Please check your credentials and try again.`
          );
        } else if (error.message?.includes("Email not confirmed")) {
          throw new Error(
            `Email not confirmed. Please check your email inbox and confirm your account before logging in.`
          );
        } else if (error.message?.includes("User not found")) {
          throw new Error(
            `No account found with this email. Please make sure you have the correct email or contact support.`
          );
        }
      }

      if (error.status === 429) {
        throw new Error(
          `Too many login attempts. Please try again in a few minutes.`
        );
      }

      throw new Error(error.message || "Login failed. Please try again.");
    }

    if (!data?.user) {
      throw new Error("Login failed. User data not retrieved.");
    }

    // Step 2: Fetch user role from public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", data.user.id)
      .single();

    if (userError || !userData) {
      // User doesn't exist in users table - create entry
      const { error: createError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            role: "student", // Default to student
          },
        ]);

      if (createError) {
        console.error("Error creating user in database:", createError);
      }

      return {
        ...data,
        userRole: "student",
        email: data.user.email,
      };
    }

    // Step 3: Return data with role
    return {
      ...data,
      userRole: userData.role,
      email: userData.email,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Get current user's role from database
 * @returns User role ("admin" or "student") or null
 */
export async function getUserRole() {
  try {
    const { data } = await supabase.auth.getUser();
    
    if (!data?.user?.id) {
      return null;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return userData?.role || "student";
  } catch (error) {
    console.error("Get role error:", error);
    return null;
  }
}

/**
 * Get current session
 * @returns Current user session or null
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Logout current user
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Sign up a new student account
 * @param email - Student email
 * @param password - Student password
 */
export async function signUpStudent(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user record in users table with student role
    if (data?.user?.id) {
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
