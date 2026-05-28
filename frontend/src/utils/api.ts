import axios from "axios";
import type { Task, Column, Member, Stats } from "../types";

const api = axios.create({
  // Hardcoding your live Render URL ensures your frontend always communicates with the cloud backend
  baseURL: "https://backend-projects-34.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.reload();
    }
    return Promise.reject(err);
  },
);

export const getMembers = () =>
  api.get<Member[]>("/members").then((r) => r.data);
export const createMember = (name: string) =>
  api.post<Member>("/members", { name }).then((r) => r.data);
export const getColumns = () =>
  api.get<Column[]>("/columns").then((r) => r.data);
export const getTasks = (params?: object) =>
  api.get<Task[]>("/tasks", { params }).then((r) => r.data);
export const getStats = () => api.get<Stats>("/stats").then((r) => r.data);
export const createTask = (data: Partial<Task>) =>
  api.post<Task>("/tasks", data).then((r) => r.data);
export const updateTask = (id: string, data: Partial<Task>) =>
  api.patch<Task>(`/tasks/${id}`, data).then((r) => r.data);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
export const reorderTasks = (
  taskId: string,
  destinationColumnId: string,
  destinationIndex: number,
) =>
  api.post("/tasks/reorder", { taskId, destinationColumnId, destinationIndex });
export const createColumn = (data: Partial<Column>) =>
  api.post<Column>("/columns", data).then((r) => r.data);
export const deleteColumn = (id: string) => api.delete(`/columns/${id}`);
