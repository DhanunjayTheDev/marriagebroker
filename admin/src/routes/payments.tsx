import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { PaymentsPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/payments')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><PaymentsPage /></AdminLayout>,
});
