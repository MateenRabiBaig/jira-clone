import api from './axios';
import type { Task, TaskStatus } from '../types';

export const taskApi = {
  getByProject: (projectId: string) => api.get<Task[]>(`/tasks/project/${projectId}`).then((r) => r.data),
  create: (data: Partial<Task>) => api.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: string, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: TaskStatus) => api.patch<Task>(`/tasks/${id}/status`, { status }).then((r) => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data)
}