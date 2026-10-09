import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { StaticPage } from '../pages/public/StaticPage';

export const Route = createFileRoute('/ai-matching')({
  component: () => (
    <PublicLayout>
      <StaticPage
        slug="ai-matching"
        title="AI-Powered Matchmaking"
        fallbackContent={
          <div className="space-y-4 text-slate-500 leading-relaxed">
            <p>Avyuktha's proprietary AI engine analyzes over 50 compatibility dimensions to find your most compatible life partner.</p>
            <p>We consider astrology, education, family values, lifestyle, personality, income, location, and more weighted by what matters most to you.</p>
            <p>Every match comes with a compatibility score and a clear explanation of why you matched.</p>
          </div>
        }
      />
    </PublicLayout>
  ),
});

