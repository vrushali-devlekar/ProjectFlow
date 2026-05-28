import React, { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import AddColumnModal from "./AddColumnModal";

export default function Board() {
  const { tasks, columns, members, filters, selectedTask, setSelectedTask, moveTask } = useBoardStore();
  const [addTaskColId, setAddTaskColId] = useState<string | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    moveTask(draggableId, destination.droppableId, destination.index);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 px-8 py-6 overflow-x-auto flex-1 items-start">
          {columns.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.columnId === col.id)}
              members={members}
              filters={filters}
              onAddTask={(colId) => setAddTaskColId(colId)}
            />
          ))}

          {/* Add Column */}
          <button
            onClick={() => setShowAddColumn(true)}
            className="flex-shrink-0 w-72 flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-border text-gray-600 hover:border-accent/50 hover:text-accent-light transition-all group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-sm">Add Column</span>
          </button>
        </div>
      </DragDropContext>

      {/* Task detail / create modal */}
      {(selectedTask || addTaskColId !== null) && (
        <TaskModal
          task={selectedTask}
          members={members}
          columns={columns}
          defaultColumnId={addTaskColId ?? undefined}
          onClose={() => { setSelectedTask(null); setAddTaskColId(null); }}
        />
      )}

      {/* Add column modal */}
      {showAddColumn && <AddColumnModal onClose={() => setShowAddColumn(false)} />}
    </>
  );
}
