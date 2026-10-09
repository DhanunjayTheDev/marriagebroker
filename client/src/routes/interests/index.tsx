import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { InterestsPage } from '../../pages/interests/InterestsPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/interests/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><InterestsPage /></DashboardLayout>,
});
