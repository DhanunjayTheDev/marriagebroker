import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { AccountDeletionPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/account-deletion')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><AccountDeletionPage /></AdminLayout>,
});
