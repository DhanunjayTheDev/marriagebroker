import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) throw redirect({ to: '/auth/login' });
  },
  component: () => (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  ),
});
