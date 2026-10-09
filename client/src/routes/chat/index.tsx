import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ChatPage } from '../../pages/chat/ChatPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/chat/')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/login' });
  },
  component: () => (
    <DashboardLayout fullWidth>
      <ChatPage />
    </DashboardLayout>
  ),
});
