import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminLayout } from '../layouts/AdminLayout';
import { RecommendationAnalyticsPage } from '../pages/scaffolds';
import { useAuthStore } from '../store';

export const Route = createFileRoute('/recommendation-analytics')({
  beforeLoad: () => { if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/login' }); },
  component: () => <AdminLayout><RecommendationAnalyticsPage /></AdminLayout>,
});
