import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthLayout } from '../../layouts/AuthLayout';
import { LoginPage } from '../../pages/auth/LoginPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) throw redirect({ to: '/dashboard' });
  },
  component: () => (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  ),
});
