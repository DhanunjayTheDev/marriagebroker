import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { PricingPage } from '../pages/public/PricingPage';

export const Route = createFileRoute('/pricing')({
  component: () => <PublicLayout><PricingPage /></PublicLayout>,
});
