import { createFileRoute } from '@tanstack/react-router';
import { BlogArticlePage } from '../../pages/public/BlogArticlePage';

export const Route = createFileRoute('/blogs/$slug')({
  component: BlogArticlePage,
});
