import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { AstrologyArticlesPage } from '../pages/public/AstrologyArticlesPage';

export const Route = createFileRoute('/astrology-articles')({
  component: () => <PublicLayout><AstrologyArticlesPage /></PublicLayout>,
});
