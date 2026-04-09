"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, getUserRole } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  // Redirect to appropriate dashboard or login on mount
  useEffect(() => {
    const redirectUser = async () => {
      try {
        // Check if user has an active session
        const session = await getSession();

        if (!session) {
          // No session - redirect to admin login (default entry point)
          router.push("/admin/login");
          return;
        }

        // User is logged in - check their role
        const role = await getUserRole();

        if (role === "admin") {
          // Admin user - go to admin dashboard
          router.push("/admin/dashboard");
        } else if (role === "student") {
          // Student user - go to student dashboard
          router.push("/student/dashboard");
        } else {
          // Unknown role - default to admin login
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // On error, redirect to admin login
        router.push("/admin/login");
      }
    };

    redirectUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
