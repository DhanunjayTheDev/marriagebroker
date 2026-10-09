import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { CronPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/cron')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><CronPage /></AdminLayout>,
});
