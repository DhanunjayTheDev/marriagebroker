import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { CallHistoryPage } from '../../pages/calls/CallHistoryPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/calls/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><CallHistoryPage /></DashboardLayout>,
});
