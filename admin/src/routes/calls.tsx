import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { CallsPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/calls')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><CallsPage /></AdminLayout>,
});
