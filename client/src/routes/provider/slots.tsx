import { createFileRoute } from '@tanstack/react-router';
import { ProviderSlotsPage } from '../../pages/marketplace/ProviderSlotsPage';

export const Route = createFileRoute('/provider/slots')({
  component: () => <ProviderSlotsPage />,
});
