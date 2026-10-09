import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { AiPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/ai')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><AiPage /></AdminLayout>,
});
