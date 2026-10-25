import api from './axios';
import type { SearchResults } from '../types';

export const searchApi = {
  global: (q: string) => api.get<SearchResults>('/search', { params: { q } }).then((r) => r.data),
};
