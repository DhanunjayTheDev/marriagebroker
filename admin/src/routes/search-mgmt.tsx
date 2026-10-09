import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { SearchMgmtPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/search-mgmt')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><SearchMgmtPage /></AdminLayout>,
});
