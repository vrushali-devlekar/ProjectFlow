import React from "react";
import { LayoutGrid, Plus, Zap, LogOut } from "lucide-react";
import type { AuthUser } from "./LoginPage";

interface HeaderProps {
  onAddTask: () => void;
  user: AuthUser | null;
  onLogout: () => void;
}

export default function Header({ onAddTask, user, onLogout }: HeaderProps) {
  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm">
          <LayoutGrid size={16} className="text-white" />
        </div>
        <span className="font-display font-800 text-xl tracking-tight text-white">
          Project<span className="text-accent-light">Flow</span>
        </span>
        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-mono bg-panel border border-border text-gray-400">
          v2.0
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-panel border border-border text-xs text-gray-400">
          <Zap size={12} className="text-neon-amber" />
          <span className="font-mono">Live sync</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse2" />
        </div>

        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white text-sm font-medium transition-all shadow-glow-sm hover:shadow-glow active:scale-95"
        >
          <Plus size={16} />
          New Task
        </button>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: user.color }}
            >
              {user.avatar}
            </div>
            <div className="flex flex-col leading-tight hidden sm:flex">
              <span className="text-xs font-medium text-white">{user.name}</span>
              <span className="text-[10px] font-mono text-gray-500 capitalize">{user.role}</span>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="ml-1 p-1.5 rounded-lg hover:bg-panel text-gray-500 hover:text-white transition-all"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
