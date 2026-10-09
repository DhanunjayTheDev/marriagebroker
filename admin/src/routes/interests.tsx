import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { InterestsPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/interests')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><InterestsPage /></AdminLayout>,
});
