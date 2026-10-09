import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { SearchPage } from '../../pages/search/SearchPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/search/')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' });
  },
  component: () => (
    <DashboardLayout>
      <SearchPage />
    </DashboardLayout>
  ),
});
