import api from './axios';
import type { Task, TaskStatus, PaginatedTasks } from '../types';

export type TaskUpdateData = Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  workType: 'task' | 'story' | 'bug';
  dueDate: string | null;
  labels: string[];
  assignee: string | null;
  reporter: string;
}>;

export interface MyTasksParams {
  status?: string;
  priority?: string;
  project?: string;
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const taskApi = {
  getByProject: (projectId: string) => api.get<Task[]>(`/tasks/project/${projectId}`).then((r) => r.data),
  getById: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  getMyTasks: (params: MyTasksParams = {}) =>
    api.get<PaginatedTasks>('/tasks/my-tasks', { params }).then((r) => r.data),
  create: (data: Record<string, unknown>) => api.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: string, data: TaskUpdateData) => api.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: TaskStatus) =>
    api.patch<Task>(`/tasks/${id}/status`, { status }).then((r) => r.data),
  delete: (id: string) => api.delete<{ message: string }>(`/tasks/${id}`).then((r) => r.data),
};
