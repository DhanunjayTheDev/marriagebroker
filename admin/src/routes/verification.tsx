import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { VerificationPage } from '../pages/VerificationPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/verification')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><VerificationPage /></AdminLayout>,
});
