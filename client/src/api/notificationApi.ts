import api from './axios';
import type { AppNotification } from '../types';

export interface NotificationsResponse {
  notifications: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
}

export const notificationApi = {
  getAll: (params: { unread?: boolean; page?: number; limit?: number } = {}) =>
    api.get<NotificationsResponse>('/notifications', { params }).then((r) => r.data),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),
  markRead: (id: string) => api.patch<AppNotification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post<{ message: string }>('/notifications/read-all').then((r) => r.data),
};
