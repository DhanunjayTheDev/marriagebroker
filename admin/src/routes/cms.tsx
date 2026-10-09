import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { CmsPage } from '../pages/CmsPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/cms')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><CmsPage /></AdminLayout>,
});
