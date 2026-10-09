import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { FraudPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/fraud')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><FraudPage /></AdminLayout>,
});
