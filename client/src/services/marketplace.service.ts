import axios from 'axios';
import api from './api';

// Separate axios instance for provider auth calls (uses provider token, not user token)
const providerApi = axios.create({
  baseURL: (api.defaults.baseURL as string) ?? '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
    'X-Platform': 'web',
  },
});

providerApi.interceptors.request.use((config) => {
  const stored = localStorage.getItem('avyuktha-provider');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.accessToken) config.headers.Authorization = `Bearer ${state.accessToken}`;
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

export const marketplaceService = {
  // ─── Public ───────────────────────────────────────────────────────────────
  getProviders: (params?: Record<string, unknown>) =>
    api.get('/marketplace/providers', { params }),

  getCategories: () =>
    api.get('/marketplace/providers/categories'),

  getProvider: (id: string) =>
    api.get(`/marketplace/providers/${id}`),

  getProviderSlots: (id: string, month?: string) =>
    api.get(`/marketplace/providers/${id}/slots`, { params: { month } }),

  getProviderReviews: (id: string, params?: Record<string, unknown>) =>
    api.get(`/marketplace/providers/${id}/reviews`, { params }),

  // ─── User actions ─────────────────────────────────────────────────────────
  bookSlot: (providerId: string, data: Record<string, unknown>) =>
    api.post(`/marketplace/providers/${providerId}/book`, data),

  getMyBookings: () =>
    api.get('/marketplace/providers/my-bookings'),

  cancelBooking: (bookingId: string, reason?: string) =>
    api.patch(`/marketplace/providers/bookings/${bookingId}/cancel`, { reason }),

  addReview: (providerId: string, data: { rating: number; review: string }) =>
    api.post(`/marketplace/providers/${providerId}/reviews`, data),

  // ─── Provider auth (uses main api - no provider token needed) ─────────────
  providerRegister: (data: Record<string, unknown>) =>
    api.post('/marketplace/providers/register', data),

  providerLogin: (email: string, password: string) =>
    api.post('/marketplace/providers/login', { email, password }),

  // ─── Provider portal (uses providerApi with provider token) ───────────────
  getMyProfile: () =>
    providerApi.get('/marketplace/providers/me'),

  updateMyProfile: (data: Record<string, unknown>) =>
    providerApi.put('/marketplace/providers/me', data),

  getMySlots: (month?: string) =>
    providerApi.get('/marketplace/providers/me/slots', { params: { month } }),

  addSlots: (slots: Record<string, unknown>[]) =>
    providerApi.post('/marketplace/providers/me/slots', slots),

  updateSlot: (slotId: string, data: Record<string, unknown>) =>
    providerApi.patch(`/marketplace/providers/me/slots/${slotId}`, data),

  deleteSlot: (slotId: string) =>
    providerApi.delete(`/marketplace/providers/me/slots/${slotId}`),

  getMyProviderBookings: (params?: Record<string, unknown>) =>
    providerApi.get('/marketplace/providers/me/bookings', { params }),

  respondToBooking: (bookingId: string, action: 'confirm' | 'reject', reason?: string) =>
    providerApi.patch(`/marketplace/providers/me/bookings/${bookingId}`, { action, reason }),
};
