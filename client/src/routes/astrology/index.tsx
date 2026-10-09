import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { AstrologyPage } from '../../pages/astrology/AstrologyPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/astrology/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><AstrologyPage /></DashboardLayout>,
});
