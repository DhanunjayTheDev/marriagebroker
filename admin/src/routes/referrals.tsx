import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { ReferralsPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/referrals')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><ReferralsPage /></AdminLayout>,
});
