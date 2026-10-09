import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ActivityPage } from '../../pages/activity/ActivityPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/activity/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><ActivityPage /></DashboardLayout>,
});
