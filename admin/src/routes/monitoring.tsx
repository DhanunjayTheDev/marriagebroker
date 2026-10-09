import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { MonitoringPage } from '../pages/MonitoringPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/monitoring')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><MonitoringPage /></AdminLayout>,
});
