import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { SuccessStoriesPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/success-stories')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><SuccessStoriesPage /></AdminLayout>,
});
