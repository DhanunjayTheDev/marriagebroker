import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { FeatureFlagsPage } from '../pages/FeatureFlagsPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/feature-flags')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><FeatureFlagsPage /></AdminLayout>,
});
