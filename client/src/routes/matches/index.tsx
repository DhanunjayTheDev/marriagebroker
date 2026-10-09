import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { MatchesPage } from '../../pages/matches/MatchesPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/matches/')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' });
  },
  component: () => (
    <DashboardLayout>
      <MatchesPage />
    </DashboardLayout>
  ),
});
