import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { StaticPage } from '../pages/public/StaticPage';

export const Route = createFileRoute('/terms')({
  component: () => <PublicLayout><StaticPage slug="terms" title="Terms & Conditions" /></PublicLayout>,
});
