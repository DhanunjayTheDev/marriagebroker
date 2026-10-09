import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { FAQPage } from '../pages/public/FAQPage';

export const Route = createFileRoute('/faq')({
  component: () => <PublicLayout><FAQPage /></PublicLayout>,
});
