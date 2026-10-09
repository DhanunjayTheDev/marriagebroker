import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { SecurityPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/security')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><SecurityPage /></AdminLayout>,
});
