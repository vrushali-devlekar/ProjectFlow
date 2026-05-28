import { create } from "zustand";
import type { Task, Column, Member, Stats, Filters } from "../types";
import * as api from "../utils/api";

interface BoardState {
  tasks: Task[];
  columns: Column[];
  members: Member[];
  stats: Stats | null;
  filters: Filters;
  loading: boolean;
  selectedTask: Task | null;

  // Actions
  init: () => Promise<void>;
  setFilters: (f: Partial<Filters>) => void;
  setSelectedTask: (t: Task | null) => void;

  moveTask: (taskId: string, destColId: string, destIndex: number) => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addColumn: (title: string, color: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  addMember: (name: string) => Promise<Member>;
  refreshStats: () => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  tasks: [],
  columns: [],
  members: [],
  stats: null,
  loading: false,
  selectedTask: null,
  filters: { search: "", priority: "all", assigneeId: "all", dueSoon: false },

  init: async () => {
    set({ loading: true });
    const [tasks, columns, members, stats] = await Promise.all([
      api.getTasks(), api.getColumns(), api.getMembers(), api.getStats(),
    ]);
    set({ tasks, columns, members, stats, loading: false });
  },

  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),
  setSelectedTask: (t) => set({ selectedTask: t }),

  refreshStats: async () => {
    const stats = await api.getStats();
    set({ stats });
  },

  moveTask: async (taskId, destColId, destIndex) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === taskId)!;
    const oldColId = task.columnId;

    // Optimistic update
    const updated = tasks.map(t => t.id === taskId ? { ...t, columnId: destColId } : t);
    const srcTasks = updated.filter(t => t.columnId === oldColId && t.id !== taskId).sort((a,b)=>a.order-b.order);
    srcTasks.forEach((t,i) => { const found = updated.find(u=>u.id===t.id); if(found) found.order=i; });
    const dstTasks = updated.filter(t => t.columnId === destColId && t.id !== taskId).sort((a,b)=>a.order-b.order);
    const movedTask = updated.find(t => t.id === taskId)!;
    dstTasks.splice(destIndex, 0, movedTask);
    dstTasks.forEach((t,i) => { const found = updated.find(u=>u.id===t.id); if(found) found.order=i; });
    set({ tasks: updated });

    await api.reorderTasks(taskId, destColId, destIndex);
    get().refreshStats();
  },

  addTask: async (data) => {
    const task = await api.createTask(data);
    set(s => ({ tasks: [...s.tasks, task] }));
    get().refreshStats();
  },

  updateTask: async (id, data) => {
    const updated = await api.updateTask(id, data);
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t), selectedTask: s.selectedTask?.id === id ? updated : s.selectedTask }));
    get().refreshStats();
  },

  deleteTask: async (id) => {
    await api.deleteTask(id);
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id), selectedTask: s.selectedTask?.id === id ? null : s.selectedTask }));
    get().refreshStats();
  },

  addColumn: async (title, color) => {
    const col = await api.createColumn({ title, color });
    set(s => ({ columns: [...s.columns, col] }));
  },

  deleteColumn: async (id) => {
    await api.deleteColumn(id);
    set(s => ({ columns: s.columns.filter(c => c.id !== id), tasks: s.tasks.filter(t => t.columnId !== id) }));
    get().refreshStats();
  },

  addMember: async (name) => {
    const member = await api.createMember(name);
    set(s => ({ members: [...s.members, member] }));
    return member;
  },
}));
