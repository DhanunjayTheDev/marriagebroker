import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { ActivityPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/activity')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><ActivityPage /></AdminLayout>,
});
