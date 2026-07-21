import api from './axios';
import { Project } from '../types';

export const projectApi = {
  getAll: () => api.get<Project[]>('/projects').then((r) => r.data),
  getById: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string }) => api.post<Project>('/projects', data).then((r) => r.data),
  update: (id: string, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),
  addMember: (id: string, userId: string) => api.post<Project>(`/projects/${id}/members`, { userId }).then((r) => r.data),
};