import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/settings/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><SettingsPage /></DashboardLayout>,
});
