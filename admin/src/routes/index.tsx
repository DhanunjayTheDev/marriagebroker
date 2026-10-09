import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><DashboardPage /></AdminLayout>,
});
