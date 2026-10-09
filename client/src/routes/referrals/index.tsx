import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ReferralsPage } from '../../pages/referrals/ReferralsPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/referrals/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><ReferralsPage /></DashboardLayout>,
});
