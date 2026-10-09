import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { WalletPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/wallet')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><WalletPage /></AdminLayout>,
});
