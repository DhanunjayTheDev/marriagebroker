import { createFileRoute } from '@tanstack/react-router';
import { MarketplaceCategoryPage } from '../../pages/marketplace/MarketplaceCategoryPage';

export const Route = createFileRoute('/marketplace/$category')({
  component: MarketplaceCategoryPage,
});
