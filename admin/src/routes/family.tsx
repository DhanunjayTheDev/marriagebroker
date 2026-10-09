import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { FamilyPage } from '../pages/data-pages';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/family')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><FamilyPage /></AdminLayout>,
});
