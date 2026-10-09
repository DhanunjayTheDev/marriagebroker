import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../../layouts/AdminLayout';
import { UserDetailPage } from '../../pages/UserDetailPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/users/$userId')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><UserDetailPage /></AdminLayout>,
});
