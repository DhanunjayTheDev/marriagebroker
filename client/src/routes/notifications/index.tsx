import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { NotificationsPage } from '../../pages/notifications/NotificationsPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/notifications/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><NotificationsPage /></DashboardLayout>,
});
