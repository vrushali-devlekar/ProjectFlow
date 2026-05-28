import React from "react";
import { Search, Filter, Calendar, X } from "lucide-react";
import type { Member, Filters } from "../types";
import { useBoardStore } from "../store/boardStore";

interface FilterBarProps { members: Member[] }

export default function FilterBar({ members }: FilterBarProps) {
  const { filters, setFilters } = useBoardStore();
  const hasActive = filters.search || filters.priority !== "all" || filters.assigneeId !== "all" || filters.dueSoon;

  return (
    <div className="flex flex-wrap items-center gap-3 px-8 py-4 border-b border-border bg-surface/50">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters({ search: e.target.value })}
          placeholder="Search tasks..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-panel border border-border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors font-body"
        />
      </div>

      {/* Priority */}
      <div className="flex items-center gap-1.5">
        <Filter size={13} className="text-gray-500" />
        <select
          value={filters.priority}
          onChange={e => setFilters({ priority: e.target.value as Filters["priority"] })}
          className="px-3 py-2 rounded-lg bg-panel border border-border text-sm text-gray-300 focus:outline-none focus:border-accent cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {/* Assignee */}
      <select
        value={filters.assigneeId}
        onChange={e => setFilters({ assigneeId: e.target.value })}
        className="px-3 py-2 rounded-lg bg-panel border border-border text-sm text-gray-300 focus:outline-none focus:border-accent cursor-pointer"
      >
        <option value="all">All Members</option>
        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      {/* Due Soon */}
      <button
        onClick={() => setFilters({ dueSoon: !filters.dueSoon })}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
          filters.dueSoon ? "bg-accent/20 border-accent text-accent-light" : "bg-panel border-border text-gray-400 hover:border-accent/40"
        }`}
      >
        <Calendar size={13} />
        Due Soon
      </button>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => setFilters({ search: "", priority: "all", assigneeId: "all", dueSoon: false })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 border border-border hover:border-red-400/40 transition-all"
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
}
