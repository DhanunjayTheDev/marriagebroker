import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { DataExportPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/data-export')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><DataExportPage /></AdminLayout>,
});
