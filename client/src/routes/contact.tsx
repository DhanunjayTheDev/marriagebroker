import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { ContactPage } from '../pages/public/ContactPage';

export const Route = createFileRoute('/contact')({
  component: () => <PublicLayout><ContactPage /></PublicLayout>,
});
