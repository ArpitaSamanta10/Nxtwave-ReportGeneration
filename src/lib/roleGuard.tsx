/**
 * Role-based Route Guards
 * Higher-Order Components to protect routes based on user role
 */

import { ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole, getSession, logoutUser } from "./auth";
import { addToast } from "@/components/ui/Toast";

// Loading component shown while checking authentication
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600">Verifying access...</p>
      </div>
    </div>
  );
}

/**
 * HOC to protect admin routes
 * Only users with admin role can access the wrapped component
 */
export function withAdminGuard<P extends object>(
  Component: ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAdminAccess = async () => {
        try {
          // Step 1: Check if user has an active session
          const session = await getSession();
          if (!session) {
            addToast("❌ Session expired. Please login again.", "error");
            router.push("/admin/login");
            return;
          }

          // Step 2: Fetch user's role from database
          const userRole = await getUserRole();

          // Step 3: Verify admin role
          if (userRole !== "admin") {
            addToast("❌ Unauthorized - Admin access required", "error");
            await logoutUser();
            router.push("/student/login");
            return;
          }

          // Step 4: User is authorized
          setIsAuthorized(true);
        } catch (error) {
          console.error("Admin guard check failed:", error);
          addToast("❌ Authorization check failed. Please login again.", "error");
          router.push("/admin/login");
        } finally {
          setIsLoading(false);
        }
      };

      checkAdminAccess();
    }, [router]);

    if (isLoading) {
      return <LoadingScreen />;
    }

    if (!isAuthorized) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * HOC to protect student routes
 * Only users with student role can access the wrapped component
 */
export function withStudentGuard<P extends object>(
  Component: ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkStudentAccess = async () => {
        try {
          // Step 1: Check if user has an active session
          const session = await getSession();
          if (!session) {
            addToast("❌ Session expired. Please login again.", "error");
            router.push("/student/login");
            return;
          }

          // Step 2: Fetch user's role from database
          const userRole = await getUserRole();

          // Step 3: Verify student role
          if (userRole !== "student") {
            if (userRole === "admin") {
              // Admin tried to access student page
              addToast("❌ Admin accounts should access the admin portal", "error");
              router.push("/admin/dashboard");
            } else {
              // Unknown role
              addToast("❌ Unauthorized - Invalid user role", "error");
              await logoutUser();
              router.push("/student/login");
            }
            return;
          }

          // Step 4: User is authorized
          setIsAuthorized(true);
        } catch (error) {
          console.error("Student guard check failed:", error);
          addToast("❌ Authorization check failed. Please login again.", "error");
          router.push("/student/login");
        } finally {
          setIsLoading(false);
        }
      };

      checkStudentAccess();
    }, [router]);

    if (isLoading) {
      return <LoadingScreen />;
    }

    if (!isAuthorized) {
      return null;
    }

    return <Component {...props} />;
  };
}
