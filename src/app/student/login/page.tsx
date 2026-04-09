"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser } from "@/lib/auth";
import { addToast } from "@/components/ui/Toast";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle student login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!email.trim()) {
        addToast("❌ Email is required", "error");
        setLoading(false);
        return;
      }

      if (!password.trim()) {
        addToast("❌ Password is required", "error");
        setLoading(false);
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        addToast("❌ Please enter a valid email address", "error");
        setLoading(false);
        return;
      }

      addToast("🔄 Signing in...", "info", 0);

      // Step 1: Attempt to login with credentials
      const loginData = await loginUser(email, password);

      // Validate user exists
      if (!loginData?.user) {
        addToast("❌ Login failed. User data not retrieved.", "error");
        setLoading(false);
        return;
      }

      // Step 2: Verify role from database
      const userRole = loginData.userRole;

      if (!userRole) {
        await logoutUser();
        addToast(
          "❌ Unauthorized - Your account has no role assigned. Contact support.",
          "error"
        );
        setLoading(false);
        return;
      }

      if (userRole === "admin") {
        // Admin tried to login as student
        await logoutUser();
        addToast(
          "❌ Unauthorized - Admin accounts must login via the admin portal",
          "error"
        );
        setLoading(false);
        return;
      }

      if (userRole !== "student") {
        // Unknown role
        await logoutUser();
        addToast(
          `❌ Unauthorized - Unknown role "${userRole}". Please contact support.`,
          "error"
        );
        setLoading(false);
        return;
      }

      // Student login successful - redirect to student dashboard
      addToast("✅ Login successful! Redirecting...", "success");
      setTimeout(() => router.push("/student/dashboard"), 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";

      console.error("Login attempt failed:", {
        email,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      addToast(`❌ ${errorMessage}`, "error");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Student Portal</h1>
            <p className="text-gray-600 mt-2">View your performance report</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Student Only</span>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-gray-600 text-sm mb-4">
            Are you an admin?{" "}
            <a href="/admin/login" className="text-green-600 hover:underline">
              Sign in as admin
            </a>
          </p>

          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <span className="font-semibold">✓ Student Only:</span> Use your
              student email and password to access your performance report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
