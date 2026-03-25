"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import type { RemarksCategory } from "../types";

interface SearchFilterSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: RemarksCategory | "All";
  onFilterChange: (category: RemarksCategory | "All") => void;
  sortBy: "name" | "performance" | "lastUpdated";
  onSortChange: (sort: "name" | "performance" | "lastUpdated") => void;
}

export function SearchFilterSort({
  searchQuery,
  onSearchChange,
  filterCategory,
  onFilterChange,
  sortBy,
  onSortChange,
}: SearchFilterSortProps) {
  return (
    <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm shrink-0 items-center text-sm border border-slate-100">
      <div className="flex items-center flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 hover:border-blue-400 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100">
        <Search size={18} className="text-slate-400 mr-3" />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          className="bg-transparent border-none outline-none w-full text-slate-700 placeholder-slate-400"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={18} className="text-slate-500" />
        <select
          className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none text-slate-700 hover:border-slate-300 focus:border-blue-500 transition-colors"
          value={filterCategory}
          onChange={(e) => onFilterChange(e.target.value as RemarksCategory | "All")}
        >
          <option value="All">All Categories</option>
          <option value="Good">Good</option>
          <option value="Above Average">Above Average</option>
          <option value="Average">Average</option>
          <option value="Poor">Poor</option>
          <option value="">Pending / Uncategorized</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown size={18} className="text-slate-500" />
        <select
          className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none text-slate-700 hover:border-slate-300 focus:border-blue-500 transition-colors"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "name" | "performance" | "lastUpdated")}
        >
          <option value="name">Sort by Name</option>
          <option value="performance">Sort by Performance (High-Low)</option>
          <option value="lastUpdated">Sort by Last Updated</option>
        </select>
      </div>
    </div>
  );
}
