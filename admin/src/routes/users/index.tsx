import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../../layouts/AdminLayout';
import { UsersPage } from '../../pages/UsersPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/users/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><UsersPage /></AdminLayout>,
});
