import api from './axios';
import type { User } from '../types';

export const userApi = { searchByEmail: (email: string) => api.get<User>('/users/search', { params: { email } }).then((r) => r.data) }