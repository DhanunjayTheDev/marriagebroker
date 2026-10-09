import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../../layouts/PublicLayout';
import { ProviderRegisterPage } from '../../pages/marketplace/ProviderRegisterPage';

export const Route = createFileRoute('/provider/register')({
  component: () => (
    <PublicLayout>
      <ProviderRegisterPage />
    </PublicLayout>
  ),
});
