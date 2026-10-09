import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { SupportPage } from '../pages/SupportPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/support')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><SupportPage /></AdminLayout>,
});
