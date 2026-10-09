export { authService } from './auth.service';
export { profileService } from './profile.service';
export { matchService } from './match.service';
export { chatService } from './chat.service';

export { get, post, put, patch, del, upload } from './api';

// Inline service factories for smaller modules
import { get, post, patch, del } from './api';

export const interestService = {
  sendInterest: (receiverId: string, message?: string) => post('/interests', { receiverId, message }),
  getInterests: (type: 'sent' | 'received', status?: string, page = 1, limit = 20) =>
    get(`/interests?type=${type}${status ? `&status=${status}` : ''}&page=${page}&limit=${limit}`),
  respondToInterest: (interestId: string, action: 'accept' | 'decline') =>
    post(`/interests/${interestId}/respond`, { action }),
  withdrawInterest: (interestId: string) => del(`/interests/${interestId}`),
  updateStage: (interestId: string, stage: string) => patch(`/interests/${interestId}/stage`, { stage }),
};

export const subscriptionService = {
  getPlans: () => get('/subscriptions/plans'),
  createOrder: (plan: string, duration: number) => post('/subscriptions/order', { plan, duration }),
  verifyPayment: (data: { orderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    post('/subscriptions/verify', data),
  getMySubscription: () => get('/subscriptions/me'),
  getHistory: () => get('/subscriptions/me/history'),
};

export const notificationService = {
  getNotifications: (page = 1, limit = 20, unreadOnly = false) =>
    get(`/notifications?page=${page}&limit=${limit}${unreadOnly ? '&unreadOnly=true' : ''}`),
  getUnreadCount: () => get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => patch(`/notifications/${id}/read`),
  markAllRead: () => patch('/notifications/read-all'),
};

export const verificationService = {
  getVerifications: () => get('/verification/me'),
  submitVerification: (type: string, files: Record<string, File>, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('type', type);
    Object.entries(files).forEach(([key, file]) => formData.append(key, file));
    return import('./api').then(m => m.upload('/verification/submit', formData, onProgress));
  },
};

export const supportService = {
  createTicket: (category: string, subject: string, message: string) =>
    post('/support', { category, subject, message }),
  getTickets: (page = 1, status?: string) =>
    get(`/support?page=${page}${status ? `&status=${status}` : ''}`),
  replyToTicket: (ticketId: string, message: string) =>
    post(`/support/${ticketId}/message`, { message }),
};

export const walletService = {
  getBalance: () => get<{ balance: number; currency: string }>('/wallet/balance'),
  getTransactions: () => get('/wallet/transactions'),
};

export const referralService = {
  getMyCode: () => get<{ referralCode: string }>('/referrals/my-code'),
  getMyReferrals: () => get('/referrals/my-referrals'),
};

export const callService = {
  initiateCall: (receiverId: string, type: 'voice' | 'video') =>
    post<{ callId: string; channel: string; token: string; uid: number; expiresAt: number }>('/calls/initiate', { receiverId, type }),
  updateStatus: (callId: string, status: string, durationSeconds?: number) =>
    patch(`/calls/${callId}/status`, { status, durationSeconds }),
  getHistory: (page = 1, type?: string) =>
    get(`/calls/history?page=${page}${type ? `&type=${type}` : ''}`),
  rateCall: (callId: string, score: number, feedback?: string) =>
    post(`/calls/${callId}/rate`, { score, feedback }),
};

export const meetingService = {
  scheduleMeeting: (data: unknown) => post('/meetings', data),
  getMeetings: () => get('/meetings'),
  updateMeeting: (id: string, data: unknown) => patch(`/meetings/${id}`, data),
};

export const cmsService = {
  getPage: (slug: string) => get(`/cms/pages/${slug}`),
  getBlogs: () => get('/cms/blogs'),
};

export const successStoryService = {
  getStories: () => get('/success-stories'),
  submitStory: (data: { title: string; story: string; marriageDate?: string }) =>
    post('/success-stories', data),
};

export const marketplaceService = {
  getListings: (params?: { category?: string; city?: string; page?: number }) => {
    const q = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
    return get(`/marketplace?${q.toString()}`);
  },
};

export const announcementService = {
  getAnnouncements: () => get('/announcements'),
};

export const activityService = {
  getActivity: () => get('/activity'),
};

export const dataExportService = {
  requestExport: (format = 'json', email?: string) =>
    get(`/export/profile?format=${format}${email ? `&email=${encodeURIComponent(email)}` : ''}`),
};

export const accountService = {
  requestDeletion: (reason?: string) => post('/account/request', { reason }),
  restoreAccount: () => post('/account/restore'),
};

export const contactAccessService = {
  requestAccess: (targetId: string) => post('/contact-access/request', { targetId }),
  getRequests: () => get('/contact-access/requests'),
  respondToRequest: (id: string, action: 'approve' | 'deny') =>
    patch(`/contact-access/${id}/respond`, { action }),
};

export const photoAccessService = {
  requestAccess: (targetId: string) => post('/photo-access/request', { targetId }),
  getRequests: () => get('/photo-access/requests'),
  respondToRequest: (id: string, action: 'approve' | 'deny') =>
    patch(`/photo-access/${id}/respond`, { action }),
};
