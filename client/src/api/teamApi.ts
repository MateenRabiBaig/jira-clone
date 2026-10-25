import api from './axios';
import type { Team, TeamInvitation, TeamRole } from '../types';

export const teamApi = {
  getAll: () => api.get<Team[]>('/teams').then((r) => r.data),
  getById: (id: string) => api.get<Team>(`/teams/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string }) => api.post<Team>('/teams', data).then((r) => r.data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<Team>(`/teams/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete<{ message: string }>(`/teams/${id}`).then((r) => r.data),
  getInvitations: () => api.get<TeamInvitation[]>('/teams/invitations').then((r) => r.data),
  invite: (id: string, email: string, role: 'admin' | 'member') =>
    api
      .post<{ message: string; invites: Team['invites'] }>(`/teams/${id}/invites`, { email, role })
      .then((r) => r.data),
  respondToInvite: (teamId: string, inviteId: string, action: 'accept' | 'decline') =>
    api.post<{ message: string }>(`/teams/${teamId}/invites/${inviteId}/respond`, { action }).then((r) => r.data),
  removeMember: (teamId: string, userId: string) =>
    api.delete<{ message: string }>(`/teams/${teamId}/members/${userId}`).then((r) => r.data),
  updateMemberRole: (teamId: string, userId: string, role: Exclude<TeamRole, 'owner'>) =>
    api.patch<{ message: string }>(`/teams/${teamId}/members/${userId}`, { role }).then((r) => r.data),
  leave: (teamId: string) => api.post<{ message: string }>(`/teams/${teamId}/leave`).then((r) => r.data),
};
