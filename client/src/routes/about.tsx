import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { AboutPage } from '../pages/public/AboutPage';

export const Route = createFileRoute('/about')({
  component: () => <PublicLayout><AboutPage /></PublicLayout>,
});
