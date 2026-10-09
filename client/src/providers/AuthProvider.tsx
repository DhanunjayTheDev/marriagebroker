import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store';
import { authService } from '../services/auth.service';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tokens, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();

  const { isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authService.getMe();
      if (res.data) setUser(res.data);
      return res.data;
    },
    enabled: !!tokens?.accessToken && !user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
      window.location.href = '/';
    }
  }, [storeLogout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isAuthenticated && !!user,
        isLoading,
        logout,
        refetchUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
