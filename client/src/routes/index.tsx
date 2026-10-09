import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { HomePage } from '../pages/public/HomePage';

export const Route = createFileRoute('/')({
  component: () => (
    <PublicLayout>
      <HomePage />
    </PublicLayout>
  ),
});
