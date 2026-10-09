import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { MatchmakingPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/matchmaking')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><MatchmakingPage /></AdminLayout>,
});
