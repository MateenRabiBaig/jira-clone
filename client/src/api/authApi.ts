import api from './axios';
import type { User, NotificationPrefs } from '../types';

export interface UpdateProfileData {
    name?: string;
    email?: string;
    bio?: string;
    notificationPrefs?: NotificationPrefs;
}

export const authApi = {
    getMe: () => api.get<{ user: User }>('/auth/me').then((r) => r.data),
    login: (data: { email: string; password: string }) =>
        api.post<AuthPayload>('/auth/login', data).then((r) => r.data),
    register: (data: { name: string; email: string; password: string }) =>
        api.post<AuthPayload>('/auth/register', data).then((r) => r.data),
    updateMe: (data: UpdateProfileData) => api.patch<{ user: User }>('/auth/me', data).then((r) => r.data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.patch<{ token: string; message: string }>('/auth/password', data).then((r) => r.data),
    deleteMe: (password: string) => api.delete<{ message: string }>('/auth/me', { data: { password } }).then((r) => r.data),
    uploadAvatar: (file: File, onProgress?: (percent: number) => void) => {
        const form = new FormData();
        form.append('file', file);
        return api
            .post<{ avatarUrl: string }>('/auth/avatar', form, {
                onUploadProgress: (event) => {
                    if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
                },
            })
            .then((r) => r.data);
    },
};

interface AuthPayload {
    user: User;
    token: string;
}
