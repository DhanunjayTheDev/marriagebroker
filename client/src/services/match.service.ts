import { get, post, patch } from './api';
import type { Match, SearchFilters, ApiResponse, Pagination } from '../types';

export const matchService = {
  getMatches: (page = 1, limit = 20, type?: string) =>
    get<Match[]>(`/matches?page=${page}&limit=${limit}${type && type !== 'all' ? `&type=${type}` : ''}`),

  refreshMatches: () => post('/matches/refresh'),

  markViewed: (matchId: string) => patch(`/matches/${matchId}/view`),

  search: (filters: SearchFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      }
    });
    return get<unknown[]>(`/search?${params.toString()}`);
  },

  getSavedSearches: () => get('/search/saved'),
  saveSearch: (name: string, filters: SearchFilters, alertEnabled = false) =>
    post('/search/saved', { name, filters, alertEnabled }),
  deleteSavedSearch: (id: string) => import('./api').then(m => m.del(`/search/saved/${id}`)),
  toggleSearchAlert: (id: string, alertEnabled: boolean) =>
    patch(`/search/saved/${id}/alert`, { alertEnabled }),
};
