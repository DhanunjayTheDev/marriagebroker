import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../../layouts/PublicLayout';
import { ProviderLoginPage } from '../../pages/marketplace/ProviderLoginPage';

export const Route = createFileRoute('/provider/login')({
  component: () => (
    <PublicLayout>
      <ProviderLoginPage />
    </PublicLayout>
  ),
});
