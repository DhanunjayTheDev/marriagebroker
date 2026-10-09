import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { VerificationPage } from '../../pages/verification/VerificationPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/verification/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><VerificationPage /></DashboardLayout>,
});
