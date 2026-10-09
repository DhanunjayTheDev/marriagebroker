import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MarketplaceProvider } from '../types';

interface ProviderState {
  provider: MarketplaceProvider | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setProvider: (provider: MarketplaceProvider, accessToken: string, refreshToken: string) => void;
  clearProvider: () => void;
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      provider: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setProvider: (provider, accessToken, refreshToken) =>
        set({ provider, accessToken, refreshToken, isAuthenticated: true }),
      clearProvider: () =>
        set({ provider: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'avyuktha-provider' }
  )
);
