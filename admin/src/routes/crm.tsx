import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { CrmPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/crm')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><CrmPage /></AdminLayout>,
});
