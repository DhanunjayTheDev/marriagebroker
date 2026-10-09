import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { MarketplaceProvidersPage } from '../pages/MarketplaceProvidersPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/marketplace')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><MarketplaceProvidersPage /></AdminLayout>,
});
