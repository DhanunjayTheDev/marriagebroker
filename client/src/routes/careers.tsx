import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { CareersPage } from '../pages/public/CareersPage';

export const Route = createFileRoute('/careers')({
  component: () => <PublicLayout><CareersPage /></PublicLayout>,
});
