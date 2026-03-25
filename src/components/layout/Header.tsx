"use client";

import { GraduationCap, Users } from "lucide-react";

export function Header() {
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
      </div>
    </header>
  );
}
