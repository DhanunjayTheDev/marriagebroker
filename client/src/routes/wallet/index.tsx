import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { WalletPage } from '../../pages/wallet/WalletPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/wallet/')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <DashboardLayout><WalletPage /></DashboardLayout>,
});
