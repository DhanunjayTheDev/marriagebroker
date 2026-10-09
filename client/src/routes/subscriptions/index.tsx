import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { SubscriptionsPage } from '../../pages/subscriptions/SubscriptionsPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/subscriptions/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><SubscriptionsPage /></DashboardLayout>,
});
