import { createFileRoute, redirect } from '@tanstack/react-router';
import { OnboardingLayout } from '../../layouts/OnboardingLayout';
import { OnboardingPage } from '../../pages/onboarding/OnboardingPage';
import { useAuthStore } from '../../store';

export const Route = createFileRoute('/onboarding/')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) throw redirect({ to: '/auth/login' });
  },
  component: () => (
    <OnboardingLayout>
      <OnboardingPage />
    </OnboardingLayout>
  ),
});
