import { createFileRoute, redirect } from '@tanstack/react-router';
import { ActiveCallPage } from '../../pages/calls/ActiveCallPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/calls/active')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' }); },
  component: () => <ActiveCallPage />,
});
