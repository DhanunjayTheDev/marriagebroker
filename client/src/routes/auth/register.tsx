import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '../../layouts/AuthLayout';
import { RegisterPage } from '../../pages/auth/RegisterPage';

export const Route = createFileRoute('/auth/register')({
  component: () => (
    <AuthLayout>
      <RegisterPage />
    </AuthLayout>
  ),
});
