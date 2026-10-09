import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { StaticPage } from '../pages/public/StaticPage';

export const Route = createFileRoute('/cookie-policy')({
  component: () => <PublicLayout><StaticPage slug="cookie-policy" title="Cookie Policy" /></PublicLayout>,
});
