import api from './axios';
import type { Project } from '../types';

export const projectApi = {
  getAll: () => api.get<Project[]>('/projects').then((r) => r.data),
  getById: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string; team?: string | null }) =>
    api.post<Project>('/projects', data).then((r) => r.data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<Project>(`/projects/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete<{ message: string }>(`/projects/${id}`).then((r) => r.data),
  addMember: (id: string, userId: string) =>
    api.post<Project>(`/projects/${id}/members`, { userId }).then((r) => r.data),
  removeMember: (id: string, userId: string) =>
    api.delete<Project>(`/projects/${id}/members/${userId}`).then((r) => r.data),
};
