import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useUIStore, useRealtimeStore } from '../store';
import { authService } from '../services';
import { socketService } from '../services/socket.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (count, err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return count < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

const ThemeManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useUIStore();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return <>{children}</>;
};

const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tokens, user, setUser, isAuthenticated } = useAuthStore();
  const { addAlert } = useRealtimeStore();

  useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const res = await authService.getMe();
      if (res.data) setUser(res.data);
      return res.data;
    },
    enabled: !!tokens?.accessToken && !user,
    retry: false,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    socketService.connect();
    const sock = socketService.getNotification();
    sock?.on('notification', (data: { type: string; title: string; body: string }) => {
      addAlert({ id: crypto.randomUUID(), type: data.type, message: data.title, at: new Date().toISOString() });
    });
    return () => socketService.disconnect();
  }, [isAuthenticated, addAlert]);

  return <>{children}</>;
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeManager>
      <SessionManager>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </SessionManager>
    </ThemeManager>
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);
