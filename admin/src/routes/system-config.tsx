import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { SystemConfigPage } from '../pages/SystemConfigPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/system-config')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><SystemConfigPage /></AdminLayout>,
});
