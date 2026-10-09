import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';

export const Route = createFileRoute('/relationship-advice')({
  component: () => <PublicLayout><Outlet /></PublicLayout>,
});
