import { createFileRoute } from '@tanstack/react-router';
import { ProviderDashboardPage } from '../../pages/marketplace/ProviderDashboardPage';

export const Route = createFileRoute('/provider/dashboard')({
  component: () => <ProviderDashboardPage />,
});
