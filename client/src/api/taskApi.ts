import api from './axios';
import type { Task, TaskStatus } from '../types';

export const taskApi = {
  getByProject: (projectId: string) => api.get<Task[]>(`/tasks/project/${projectId}`).then((r) => r.data),
  create: (data: Omit<Partial<Task>, 'assignee' | 'reporter'> & { assignee?: string; reporter?: string }) => api.post<Task>('/tasks', data).then((r) => r.data),
  updateStatus: (id: string, status: TaskStatus) => api.patch<Task>(`/tasks/${id}/status`, { status }).then((r) => r.data),
}
