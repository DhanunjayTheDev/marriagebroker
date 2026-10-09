import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProfileDetailPage } from '../../pages/profile/ProfileDetailPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/profile/$userId')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' });
  },
  component: () => (
    <DashboardLayout>
      <ProfileDetailPage />
    </DashboardLayout>
  ),
});
