import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { User, AuthTokens, Notification, Call, Conversation } from '../types';

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setTokens: (tokens) => set({ tokens }),
        updateUser: (updates) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          })),
        logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
      }),
      {
        name: 'avyuktha-auth',
        partialize: (state) => ({ tokens: state.tokens, user: state.user }),
      }
    ),
    { name: 'auth-store' }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UIState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  activeCallId: string | null;
  incomingCall: Call | null;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setActiveCall: (callId: string | null) => void;
  setIncomingCall: (call: Call | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      sidebarCollapsed: false,
      isMobileMenuOpen: false,
      activeCallId: null,
      incomingCall: null,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setActiveCall: (callId) => set({ activeCallId: callId }),
      setIncomingCall: (call) => set({ incomingCall: call }),
    }),
    {
      name: 'avyuktha-ui',
      partialize: (state) => ({ theme: state.theme, language: state.language, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);

// ─── Notification Store ───────────────────────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// ─── Chat Store ───────────────────────────────────────────────────────────────
interface ChatState {
  activeConversationId: string | null;
  conversations: Conversation[];
  typingUsers: Record<string, string[]>;
  onlineUsers: Set<string>;
  setActiveConversation: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, online: boolean) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeConversationId: null,
  conversations: [],
  typingUsers: {},
  onlineUsers: new Set(),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setConversations: (conversations) => set({ conversations }),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c._id === id ? { ...c, ...updates } : c)),
    })),
  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      const updated = isTyping ? [...new Set([...current, userId])] : current.filter((id) => id !== userId);
      return { typingUsers: { ...state.typingUsers, [conversationId]: updated } };
    }),
  setUserOnline: (userId, online) =>
    set((state) => {
      const updated = new Set(state.onlineUsers);
      if (online) updated.add(userId);
      else updated.delete(userId);
      return { onlineUsers: updated };
    }),
}));

// ─── Onboarding Store ─────────────────────────────────────────────────────────
interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  stepData: Record<number, unknown>;
  setStep: (step: number) => void;
  completeStep: (step: number, data?: unknown) => void;
  getStepData: (step: number) => unknown;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],
      stepData: {},
      setStep: (step) => set({ currentStep: step }),
      completeStep: (step, data) =>
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
          stepData: data ? { ...state.stepData, [step]: data } : state.stepData,
          currentStep: Math.min(step + 1, 12),
        })),
      getStepData: (step) => get().stepData[step],
      reset: () => set({ currentStep: 1, completedSteps: [], stepData: {} }),
    }),
    { name: 'avyuktha-onboarding' }
  )
);
