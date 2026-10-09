import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { SupportPage } from '../../pages/support/SupportPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/support/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><SupportPage /></DashboardLayout>,
});
