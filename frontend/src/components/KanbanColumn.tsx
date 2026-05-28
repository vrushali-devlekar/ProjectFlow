import React, { useMemo } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { FixedSizeList as List } from "react-window";
import type { Column, Task, Member, Filters } from "../types";
import TaskCard from "./TaskCard";
import { useBoardStore } from "../store/boardStore";
import { isWithinInterval, addDays, isPast } from "date-fns";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  members: Member[];
  filters: Filters;
  onAddTask: (columnId: string) => void;
}

function filterTasks(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter(t => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    }
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.assigneeId !== "all" && t.assigneeId !== filters.assigneeId) return false;
    if (filters.dueSoon) {
      const due = t.dueDate ? new Date(t.dueDate) : null;
      if (!due) return false;
      const overdue = isPast(due);
      const soon = !overdue && isWithinInterval(due, { start: new Date(), end: addDays(new Date(), 3) });
      if (!overdue && !soon) return false;
    }
    return true;
  });
}

// Virtualized row for large lists
function VirtualRow({ index, style, data }: { index: number; style: React.CSSProperties; data: { tasks: Task[]; members: Member[] } }) {
  const task = data.tasks[index];
  return (
    <div style={{ ...style, paddingBottom: 8 }}>
      <TaskCard task={task} index={index} members={data.members} />
    </div>
  );
}

const VIRTUALIZE_THRESHOLD = 20;
const CARD_HEIGHT = 140;

export default function KanbanColumn({ column, tasks, members, filters, onAddTask }: KanbanColumnProps) {
  const { deleteColumn } = useBoardStore();
  const filtered = useMemo(() => filterTasks(tasks.sort((a,b)=>a.order-b.order), filters), [tasks, filters]);
  const useVirtualization = filtered.length > VIRTUALIZE_THRESHOLD;

  return (
    <div className="flex-shrink-0 w-72 flex flex-col rounded-2xl border border-border bg-surface/60 overflow-hidden">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: column.color, boxShadow: `0 0 8px ${column.color}80` }} />
          <span className="font-display font-600 text-sm text-gray-200">{column.title}</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs font-mono bg-panel border border-border text-gray-500">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1.5 rounded-lg hover:bg-accent/20 hover:text-accent-light text-gray-600 transition-all"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => deleteColumn(column.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-gray-600 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Tasks area */}
      <Droppable
        droppableId={column.id}
        mode={useVirtualization ? "virtual" : "standard"}
        renderClone={useVirtualization ? (provided, _, rubric) => {
          const task = filtered[rubric.source.index];
          return (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <TaskCard task={task} index={rubric.source.index} members={members} />
            </div>
          );
        } : undefined}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[100px] p-3 transition-colors duration-200 ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
          >
            {useVirtualization ? (
              <List
                height={600}
                itemCount={filtered.length}
                itemSize={CARD_HEIGHT}
                width="100%"
                itemData={{ tasks: filtered, members }}
                outerRef={provided.innerRef}
              >
                {VirtualRow}
              </List>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((task, i) => (
                  <TaskCard key={task.id} task={task} index={i} members={members} />
                ))}
                {provided.placeholder}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center mb-2">
                  <Plus size={16} />
                </div>
                <span className="text-xs">Drop tasks here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
