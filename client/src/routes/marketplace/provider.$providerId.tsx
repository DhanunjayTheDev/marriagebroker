import { createFileRoute } from '@tanstack/react-router';
import { MarketplaceProviderDetailPage } from '../../pages/marketplace/MarketplaceProviderDetailPage';

export const Route = createFileRoute('/marketplace/provider/$providerId')({
  component: MarketplaceProviderDetailPage,
});
