import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuditPage } from '../pages/AuditPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/audit')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><AuditPage /></AdminLayout>,
});
