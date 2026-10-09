import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { MeetingsPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/meetings')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><MeetingsPage /></AdminLayout>,
});
