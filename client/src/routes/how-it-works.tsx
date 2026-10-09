import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';

export const Route = createFileRoute('/how-it-works')({
  component: () => <PublicLayout><HowItWorksPage /></PublicLayout>,
});
