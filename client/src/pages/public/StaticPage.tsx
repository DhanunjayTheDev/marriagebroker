import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cmsService } from '../../services';
import { cn } from '../../lib/utils';

interface StaticPageProps {
  slug: string;
  title: string;
  fallbackContent?: React.ReactNode;
}

export const StaticPage: React.FC<StaticPageProps> = ({ slug, title, fallbackContent }) => {
  const { data } = useQuery({
    queryKey: ['cms', slug],
    queryFn: () => cmsService.getPage(slug),
    retry: false,
  });

  const page = data?.data as { title: string; content: string } | undefined;

  return (
    <div className="py-16 container max-w-3xl">
      <h1 className="font-display font-bold text-display-md mb-8">{page?.title ?? title}</h1>
      {page?.content ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : (
        fallbackContent ?? <p className="text-slate-500">Content coming soon.</p>
      )}
    </div>
  );
};

// FAQ page with accordion
const FAQ_ITEMS = [
  { q: 'Is Avyuktha Matrimony free to use?', a: 'Yes! Registration and basic profile browsing are completely free. Premium features like chat, calls, and contact access require a subscription.' },
  { q: 'How does AI matchmaking work?', a: 'Our AI analyzes 50+ compatibility parameters including astrology, education, family values, lifestyle, and personality to suggest your most compatible matches.' },
  { q: 'Are profiles verified?', a: 'We offer Aadhaar, PAN, face, employment, and document verification. Verified profiles display a badge for added trust.' },
  { q: 'Can my parents manage my profile?', a: 'Yes! Our family account system allows parents and guardians to help manage your matrimony journey with approval workflows.' },
  { q: 'How is my privacy protected?', a: 'You control everything hide your photos, salary, contact, and horoscope. Incognito mode lets you browse privately.' },
  { q: 'What is the refund policy?', a: 'Subscriptions can be cancelled anytime. Refunds are processed as per our refund policy for unused premium durations.' },
];

export const FAQPage: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="py-16 container max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-display-md mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-500 text-lg">Everything you need to know about Avyuktha Matrimony</p>
      </div>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-semibold">{item.q}</span>
              <ChevronDown className={cn('w-5 h-5 text-slate-500 transition-transform flex-shrink-0', open === i && 'rotate-180')} />
            </button>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5">
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

