import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { NotificationsPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/notifications')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><NotificationsPage /></AdminLayout>,
});
