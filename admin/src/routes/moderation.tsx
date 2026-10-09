import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { ModerationPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/moderation')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><ModerationPage /></AdminLayout>,
});
