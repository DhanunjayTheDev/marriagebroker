import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { AnnouncementsPage } from '../pages/AnnouncementsPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/announcements')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><AnnouncementsPage /></AdminLayout>,
});
