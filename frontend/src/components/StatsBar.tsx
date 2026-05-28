import React from "react";
import { CheckCircle2, Flame, ListTodo, TrendingUp } from "lucide-react";
import type { Stats } from "../types";

interface StatsBarProps { stats: Stats | null }

export default function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;

  const cards = [
    { icon: <ListTodo size={18} />, label: "Total Tasks", value: stats.total, color: "#8EB69B" },
    { icon: <CheckCircle2 size={18} />, label: "Completed", value: stats.done, color: "#00ffa3" },
    { icon: <Flame size={18} />, label: "High Priority", value: stats.high, color: "#ff2d78" },
    { icon: <TrendingUp size={18} />, label: "Completion", value: `${stats.completionRate}%`, color: "#00c6ff" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-8 py-5 border-b border-border">
      {cards.map((c, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-panel border border-border hover:border-accent/40 transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${c.color}18`, color: c.color }}>
            {c.icon}
          </div>
          <div>
            <div className="text-xl font-display font-700 text-white">{c.value}</div>
            <div className="text-xs text-gray-500">{c.label}</div>
          </div>
        </div>
      ))}

      {/* Column breakdown */}
      <div className="col-span-2 lg:col-span-4 flex items-center gap-3 px-1">
        {stats.byColumn.map(col => (
          <div key={col.id} className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">{col.title}</span>
              <span className="font-mono text-gray-400">{col.count}</span>
            </div>
            <div className="h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: stats.total ? `${(col.count / stats.total) * 100}%` : "0%", background: col.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
