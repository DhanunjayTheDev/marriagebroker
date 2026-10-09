import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { BackgroundVerificationPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/background-verification')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><BackgroundVerificationPage /></AdminLayout>,
});
