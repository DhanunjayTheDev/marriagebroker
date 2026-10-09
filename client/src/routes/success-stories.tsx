import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { SuccessStoriesPage } from '../pages/public/SuccessStoriesPage';

export const Route = createFileRoute('/success-stories')({
  component: () => <PublicLayout><SuccessStoriesPage /></PublicLayout>,
});
