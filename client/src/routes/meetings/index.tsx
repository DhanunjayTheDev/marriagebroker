import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { MeetingsPage } from '../../pages/meetings/MeetingsPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/meetings/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><MeetingsPage /></DashboardLayout>,
});
