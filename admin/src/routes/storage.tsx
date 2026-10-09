import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { StoragePage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/storage')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><StoragePage /></AdminLayout>,
});
