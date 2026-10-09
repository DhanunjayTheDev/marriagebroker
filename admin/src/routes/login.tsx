import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginPage } from '../pages/LoginPage';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) throw redirect({ to: '/' });
  },
  component: LoginPage,
});
