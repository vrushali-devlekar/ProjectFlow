export type Priority = "low" | "medium" | "high";

export interface Member {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  assigneeId: string;
  tags: string[];
  order: number;
  createdAt: string;
  liveLink?: string;
}

export interface Stats {
  total: number;
  done: number;
  high: number;
  completionRate: number;
  byColumn: { id: string; title: string; count: number; color: string }[];
}

export interface Filters {
  search: string;
  priority: Priority | "all";
  assigneeId: string | "all";
  dueSoon: boolean;
}
