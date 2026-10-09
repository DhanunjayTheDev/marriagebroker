import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser, AuthTokens } from '../types';

interface AuthState {
  user: AdminUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setUser: (u: AdminUser | null) => void;
  setTokens: (t: AuthTokens | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => set({ tokens }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    { name: 'avyuktha-admin-auth' }
  )
);

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  setTheme: (t: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'avyuktha-admin-ui' }
  )
);

interface RealtimeState {
  liveStats: Record<string, number>;
  alerts: Array<{ id: string; type: string; message: string; at: string }>;
  setLiveStat: (key: string, value: number) => void;
  addAlert: (alert: { id: string; type: string; message: string; at: string }) => void;
  clearAlerts: () => void;
}

export const useRealtimeStore = create<RealtimeState>()((set) => ({
  liveStats: {},
  alerts: [],
  setLiveStat: (key, value) => set((s) => ({ liveStats: { ...s.liveStats, [key]: value } })),
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 50) })),
  clearAlerts: () => set({ alerts: [] }),
}));
