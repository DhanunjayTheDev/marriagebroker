import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';

// Layout wrapper — children render via <Outlet />, each child supplies its own page component
export const Route = createFileRoute('/marketplace')({
  component: () => <PublicLayout><Outlet /></PublicLayout>,
});
