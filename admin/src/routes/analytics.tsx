import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/analytics')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><AnalyticsPage /></AdminLayout>,
});
