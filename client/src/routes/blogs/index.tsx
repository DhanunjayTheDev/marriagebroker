import { createFileRoute } from '@tanstack/react-router';
import { BlogsPage } from '../../pages/public/BlogsPage';

export const Route = createFileRoute('/blogs/')({
  component: BlogsPage,
});
