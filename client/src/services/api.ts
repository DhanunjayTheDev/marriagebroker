import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';
import { useAuthStore } from '../store';
import type { ApiResponse } from '../types';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
    'X-Platform': 'web',
  },
  withCredentials: true,
});

// Request interceptor attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    const deviceId = localStorage.getItem('deviceId') ?? crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
    config.headers['X-Device-ID'] = deviceId;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { tokens, setTokens, logout } = useAuthStore.getState();

      if (!tokens?.refreshToken) {
        logout();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string; sessionId: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        );

        const newTokens = {
          accessToken: data.data!.accessToken,
          refreshToken: data.data!.refreshToken,
          sessionId: data.data!.sessionId,
        };

        setTokens(newTokens);
        processQueue(null, newTokens.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Typed helper functions
export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  api.get<ApiResponse<T>>(url, config).then((res) => res.data);

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.post<ApiResponse<T>>(url, data, config).then((res) => res.data);

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.put<ApiResponse<T>>(url, data, config).then((res) => res.data);

export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.patch<ApiResponse<T>>(url, data, config).then((res) => res.data);

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  api.delete<ApiResponse<T>>(url, config).then((res) => res.data);

export const upload = <T>(url: string, formData: FormData, onProgress?: (percent: number) => void) =>
  api.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded / (e.total ?? 1)) * 100))
      : undefined,
  }).then((res) => res.data);

export default api;
