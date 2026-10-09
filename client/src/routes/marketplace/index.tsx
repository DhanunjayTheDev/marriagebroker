import { createFileRoute } from '@tanstack/react-router';
import { MarketplacePage } from '../../pages/public/MarketplacePage';

export const Route = createFileRoute('/marketplace/')({
  component: MarketplacePage,
});
