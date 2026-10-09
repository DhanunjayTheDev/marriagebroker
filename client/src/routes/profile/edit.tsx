import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ProfileEditPage } from '../../pages/profile/ProfileEditPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/profile/edit')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' });
  },
  component: () => (
    <DashboardLayout>
      <ProfileEditPage />
    </DashboardLayout>
  ),
});
