import api from './axios';
import type { DashboardStats, RecentTaskItem } from '../types';

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats').then((r) => r.data),
  getRecentTasks: () => api.get<RecentTaskItem[]>('/dashboard/recent-tasks').then((r) => r.data)
}