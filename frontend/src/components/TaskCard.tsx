import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Flag, Trash2, ExternalLink } from "lucide-react";
import { format, isPast, isWithinInterval, addDays } from "date-fns";
import type { Task, Member } from "../types";
import { useBoardStore } from "../store/boardStore";

interface TaskCardProps {
  task: Task;
  index: number;
  members: Member[];
}

const PRIORITY_STYLES = {
  high:   { bar: "#ff2d78", badge: "bg-red-500/15 text-red-400 border-red-500/30" },
  medium: { bar: "#ffb347", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  low:    { bar: "#00ffa3", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

export default function TaskCard({ task, index, members }: TaskCardProps) {
  const { setSelectedTask, deleteTask } = useBoardStore();
  const assignee = members.find(m => m.id === task.assigneeId);
  const p = PRIORITY_STYLES[task.priority];
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && isPast(due);
  const isDueSoon = due && !isOverdue && isWithinInterval(due, { start: new Date(), end: addDays(new Date(), 3) });

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setSelectedTask(task)}
          className={`group relative rounded-xl border bg-panel cursor-pointer transition-all duration-200 overflow-hidden
            ${snapshot.isDragging ? "shadow-glow border-accent/60 rotate-1 scale-105" : "border-border hover:border-accent/40 hover:shadow-card"}`}
        >
          {/* Priority bar */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: p.bar }} />

          <div className="p-4 pl-5">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium text-gray-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
                {task.title}
              </h3>
              <button
                onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-gray-600 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-1">{task.description}</p>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
                {task.tags.length > 3 && <span className="tag-chip">+{task.tags.length - 3}</span>}
              </div>
            )}

            {/* Footer row 1: priority + date + avatar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${p.badge}`}>
                  <Flag size={10} />
                  {task.priority}
                </span>

                {due && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-mono whitespace-nowrap
                    ${isOverdue ? "bg-red-900/20 border-red-500/30 text-red-400" : isDueSoon ? "bg-amber-900/20 border-amber-500/30 text-amber-400" : "bg-surface border-border text-gray-500"}`}
                  >
                    <Calendar size={10} />
                    {format(due, "MMM d")}
                  </span>
                )}
              </div>

              {assignee && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                  style={{ background: assignee.color }}
                  title={assignee.name}
                >
                  {assignee.avatar}
                </div>
              )}
            </div>

            {/* Footer row 2: live link (only when present) */}
            {task.liveLink && (
              <div className="mt-2">
                <a
                  href={task.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border bg-accent/10 border-accent/30 text-accent-light hover:bg-accent/20 transition-all"
                >
                  <ExternalLink size={10} />
                  Live Preview
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
