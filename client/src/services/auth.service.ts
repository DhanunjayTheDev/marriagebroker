import { get, post, patch, del } from './api';
import type { User, AuthTokens, ApiResponse } from '../types';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  requires2FA?: boolean;
  isNew?: boolean;
}

export interface Session {
  sessionId: string;
  deviceName?: string;
  platform: string;
  ipAddress: string;
  lastActiveAt: string;
  expiresAt: string;
  isActive: boolean;
}

export const authService = {
  // OTP
  sendOtp: (identifier: string, type: 'mobile' | 'email', purpose: string) =>
    post<{ message: string; expiresIn: number }>('/auth/send-otp', { identifier, type, purpose }),

  // Registration
  register: (data: { phone: string; firstName: string; lastName: string; gender: string; dateOfBirth: string; email?: string; referralCode?: string }) =>
    post<{ message: string }>('/auth/register', data),

  verifyRegistration: (data: { identifier: string; type: 'mobile' | 'email'; purpose: string; otp: string; deviceId?: string; platform?: string; fcmToken?: string }) =>
    post<LoginResponse>('/auth/register/verify', data),

  // Login
  login: (data: { phone?: string; email?: string; otp: string; deviceId?: string; platform?: string; fcmToken?: string }) =>
    post<LoginResponse>('/auth/login', data),

  // Google
  googleAuth: (idToken: string, deviceId?: string, fcmToken?: string) =>
    post<LoginResponse>('/auth/google', { idToken, deviceId, fcmToken }),

  // Token refresh
  refreshToken: (refreshToken: string) =>
    post<AuthTokens>('/auth/refresh', { refreshToken }),

  // Logout
  logout: () => post('/auth/logout'),
  logoutAll: () => post('/auth/logout-all'),

  // 2FA
  setup2FA: () => get<{ secret: string; qrCode: string; backupCodes: string[] }>('/auth/2fa/setup'),
  enable2FA: (token: string) => post('/auth/2fa/enable', { token }),
  disable2FA: (token: string) => post('/auth/2fa/disable', { token }),

  // Password
  changePassword: (currentPassword: string | undefined, newPassword: string, confirmPassword: string) =>
    post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),

  // Sessions
  getSessions: () => get<Session[]>('/auth/sessions'),
  revokeSession: (sessionId: string) => del(`/auth/sessions/${sessionId}`),

  // Login history
  getLoginHistory: () => get('/auth/login-history'),

  // Current user
  getMe: () => get<User>('/users/me'),
  updateFcmToken: (token: string, platform: string, deviceId: string) =>
    patch('/users/me/fcm', { token, platform, deviceId }),
};
