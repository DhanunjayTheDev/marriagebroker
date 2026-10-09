import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { SocketProvider } from './SocketProvider';
import { I18nProvider } from './I18nProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                expand
                visibleToasts={5}
                toastOptions={{
                  style: {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    borderRadius: '12px',
                  },
                  classNames: {
                    toast: 'shadow-luxury',
                    title: 'font-semibold',
                  },
                }}
              />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
