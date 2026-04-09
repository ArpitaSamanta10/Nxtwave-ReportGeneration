"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, Users, LogOut } from "lucide-react";
import { logoutUser } from "@/lib/auth";

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md">
          <GraduationCap size={24} />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Student Management Portal
        </h1>
      </div>
      <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
        <span>Admin Workspace</span>
        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
          <Users size={16} className="text-slate-500" />
        </div>
        <button
          onClick={handleLogout}
          className="ml-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm"
          title="Logout from admin account"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
