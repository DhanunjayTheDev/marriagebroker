import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store';
import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e?: unknown) => void }> = [];
const processQueue = (error: unknown, token: string | null = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  queue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'X-Platform': 'admin_panel' },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { tokens } = useAuthStore.getState();
  if (tokens?.accessToken) config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  const deviceId = localStorage.getItem('adminDeviceId') ?? crypto.randomUUID();
  localStorage.setItem('adminDeviceId', deviceId);
  config.headers['X-Device-ID'] = deviceId;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const { tokens, setTokens, logout } = useAuthStore.getState();
      if (!tokens?.refreshToken) {
        logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string; sessionId: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        );
        const nt = { accessToken: data.data!.accessToken, refreshToken: data.data!.refreshToken, sessionId: data.data!.sessionId };
        setTokens(nt);
        processQueue(null, nt.accessToken);
        if (original.headers) original.headers.Authorization = `Bearer ${nt.accessToken}`;
        return api(original);
      } catch (e) {
        processQueue(e, null);
        logout();
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const get = <T>(url: string, config?: AxiosRequestConfig) => api.get<ApiResponse<T>>(url, config).then((r) => r.data);
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => api.post<ApiResponse<T>>(url, data, config).then((r) => r.data);
export const put = <T>(url: string, data?: unknown) => api.put<ApiResponse<T>>(url, data).then((r) => r.data);
export const patch = <T>(url: string, data?: unknown) => api.patch<ApiResponse<T>>(url, data).then((r) => r.data);
export const del = <T>(url: string) => api.delete<ApiResponse<T>>(url).then((r) => r.data);

const qs = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) sp.set(k, String(v)); });
  return sp.toString();
};

export { api, qs, API_BASE_URL };
