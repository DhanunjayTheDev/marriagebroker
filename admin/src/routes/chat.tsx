import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { ChatMonitorPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/chat')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><ChatMonitorPage /></AdminLayout>,
});
