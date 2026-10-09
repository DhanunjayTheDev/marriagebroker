import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { SubscriptionsPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/subscriptions')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><SubscriptionsPage /></AdminLayout>,
});
