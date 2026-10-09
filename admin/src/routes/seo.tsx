import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { SeoPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/seo')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><SeoPage /></AdminLayout>,
});
