import { createFileRoute } from '@tanstack/react-router';
import { ProviderBookingsPage } from '../../pages/marketplace/ProviderBookingsPage';

export const Route = createFileRoute('/provider/bookings')({
  component: () => <ProviderBookingsPage />,
});
