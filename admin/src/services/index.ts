import { get, post, put, patch, del, qs } from './api';
import type { AdminUser, AuthTokens } from '../types';

export { get, post, put, patch, del, qs } from './api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  sendOtp: (identifier: string, type: 'mobile' | 'email', purpose: string) =>
    post('/auth/send-otp', { identifier, type, purpose }),
  login: (data: { email: string; otp: string }) =>
    post<{ user: AdminUser; accessToken: string; refreshToken: string; sessionId: string; requires2FA?: boolean }>('/auth/login', { ...data, platform: 'admin_panel' }),
  verify2FA: (token: string) => post('/auth/2fa/enable', { token }),
  logout: () => post('/auth/logout'),
  logoutAll: () => post('/auth/logout-all'),
  getMe: () => get<AdminUser>('/users/me'),
  getSessions: () => get('/auth/sessions'),
  revokeSession: (id: string) => del(`/auth/sessions/${id}`),
  getLoginHistory: () => get('/auth/login-history'),
};

// ─── Admin dashboard + users ─────────────────────────────────────────────────
export const adminService = {
  getDashboard: () => get('/admin/dashboard'),
  getUsers: (params: Record<string, unknown>) => get(`/admin/users?${qs(params)}`),
  suspendUser: (id: string) => patch(`/admin/users/${id}/suspend`),
  restoreUser: (id: string) => patch(`/admin/users/${id}/restore`),
  getRevenue: (params: Record<string, unknown>) => get(`/admin/revenue?${qs(params)}`),
  getAuditLogs: (params: Record<string, unknown>) => get(`/admin/audit-logs?${qs(params)}`),

  getVerifications: (params: Record<string, unknown>) => get(`/admin/verifications?${qs(params)}`),
  approveVerification: (id: string, notes?: string) => patch(`/verification/${id}/approve`, { notes }),
  rejectVerification: (id: string, reason: string) => patch(`/verification/${id}/reject`, { reason }),

  getConfig: () => get('/admin/config'),
  updateConfig: (key: string, value: unknown) => put(`/admin/config/${key}`, { value }),

  getFeatureFlags: () => get('/admin/feature-flags'),
  createFeatureFlag: (data: unknown) => post('/admin/feature-flags', data),
  updateFeatureFlag: (id: string, data: unknown) => patch(`/admin/feature-flags/${id}`, data),

  getCmsPages: (type?: string) => get(`/admin/cms${type ? `?type=${type}` : ''}`),
  createCmsPage: (data: unknown) => post('/admin/cms', data),
  updateCmsPage: (id: string, data: unknown) => put(`/admin/cms/${id}`, data),

  createAnnouncement: (data: unknown) => post('/admin/announcements', data),
  getAnnouncements: () => get('/admin/announcements'),

  // Marketplace providers
  getMarketplaceProviders: (params: Record<string, unknown>) =>
    get(`/admin/marketplace/providers?${qs(params)}`),
  approveMarketplaceProvider: (id: string) =>
    patch(`/admin/marketplace/providers/${id}/approve`),
  rejectMarketplaceProvider: (id: string, reason: string) =>
    patch(`/admin/marketplace/providers/${id}/reject`, { reason }),
  suspendMarketplaceProvider: (id: string) =>
    patch(`/admin/marketplace/providers/${id}/reject`, { reason: 'Suspended by admin' }),
};

// ─── Profile (read for any user) ─────────────────────────────────────────────
export const profileService = {
  getProfile: (userId: string) => get(`/profiles/${userId}`),
};

// ─── Support ──────────────────────────────────────────────────────────────────
export const supportService = {
  getTickets: (params: Record<string, unknown>) => get(`/support?${qs(params)}`),
  assignTicket: (id: string, assigneeId: string) => patch(`/support/${id}/assign`, { assigneeId }),
  resolveTicket: (id: string) => patch(`/support/${id}/resolve`),
};

// ─── Payments (read via admin revenue + user payments not exposed; use revenue) ─
export const financeService = {
  getRevenue: (params: Record<string, unknown>) => get(`/admin/revenue?${qs(params)}`),
};

// Generic resource fetcher for list pages that hit admin endpoints
export const resourceService = {
  list: <T>(path: string, params: Record<string, unknown> = {}) => get<T>(`${path}?${qs(params)}`),
};

// ─── Admin data (real DB lists + aggregations) ────────────────────────────────
export const dataService = {
  // aggregations
  dashboardCharts: () => get('/admin/dashboard/charts'),
  analyticsOverview: () => get('/admin/analytics/overview'),
  monitoringHealth: () => get('/admin/monitoring/health'),
  storageStats: () => get('/admin/storage/stats'),

  // finance
  payments: (p: Record<string, unknown> = {}) => get(`/admin/payments?${qs(p)}`),
  subscriptions: (p: Record<string, unknown> = {}) => get(`/admin/subscriptions?${qs(p)}`),
  walletTransactions: (p: Record<string, unknown> = {}) => get(`/admin/wallet-transactions?${qs(p)}`),
  referrals: (p: Record<string, unknown> = {}) => get(`/admin/referrals?${qs(p)}`),

  // engagement
  interests: (p: Record<string, unknown> = {}) => get(`/admin/interests?${qs(p)}`),
  calls: (p: Record<string, unknown> = {}) => get(`/admin/calls?${qs(p)}`),
  meetings: (p: Record<string, unknown> = {}) => get(`/admin/meetings?${qs(p)}`),
  conversations: (p: Record<string, unknown> = {}) => get(`/admin/conversations?${qs(p)}`),
  conversationMessages: (id: string, p: Record<string, unknown> = {}) => get(`/admin/conversations/${id}/messages?${qs(p)}`),

  // content
  marketplace: (p: Record<string, unknown> = {}) => get(`/admin/marketplace?${qs(p)}`),
  approveMarketplace: (id: string) => patch(`/admin/marketplace/${id}/approve`),
  successStories: (p: Record<string, unknown> = {}) => get(`/admin/success-stories?${qs(p)}`),
  approveSuccessStory: (id: string) => patch(`/admin/success-stories/${id}/approve`),
  notifications: (p: Record<string, unknown> = {}) => get(`/admin/notifications?${qs(p)}`),

  // ops
  moderation: (p: Record<string, unknown> = {}) => get(`/admin/moderation?${qs(p)}`),
  fraud: (p: Record<string, unknown> = {}) => get(`/admin/fraud?${qs(p)}`),
  activity: (p: Record<string, unknown> = {}) => get(`/admin/activity?${qs(p)}`),
  family: (p: Record<string, unknown> = {}) => get(`/admin/family?${qs(p)}`),
  crmMembers: (p: Record<string, unknown> = {}) => get(`/admin/crm/members?${qs(p)}`),

  // account deletion
  accountDeletions: (p: Record<string, unknown> = {}) => get(`/admin/account-deletions?${qs(p)}`),
  restoreAccount: (id: string) => patch(`/admin/account-deletions/${id}/restore`),
};
