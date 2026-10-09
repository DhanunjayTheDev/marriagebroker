import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { StaticPage } from '../pages/public/StaticPage';

export const Route = createFileRoute('/privacy-policy')({
  component: () => <PublicLayout><StaticPage slug="privacy-policy" title="Privacy Policy" /></PublicLayout>,
});
