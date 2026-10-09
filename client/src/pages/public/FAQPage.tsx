import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '../../lib/utils';

const FAQ_DATA: Record<string, Array<{ q: string; a: string }>> = {
  'Getting Started': [
    {
      q: 'Is Avyuktha Matrimony free to use?',
      a: 'Yes. Registration is completely free and you can build your full profile, browse matches, and view compatibility scores at no cost. Premium features — chat, calling, contact access, and dedicated relationship manager — require a subscription.',
    },
    {
      q: 'How do I create my profile?',
      a: 'Register with your phone number, set a password, and complete the 12-step profile guide. It covers basic info, partner preferences, education, career, family background, lifestyle, and photos. The more complete your profile, the better your AI match quality.',
    },
    {
      q: 'Can family members create a profile on my behalf?',
      a: "Yes. Our family account feature lets parents, siblings, or guardians create and manage your profile. Any connection request or message requires your explicit approval — your consent is always required before anyone contacts you.",
    },
    {
      q: 'What is the minimum age to register?',
      a: 'As per Indian law, the minimum marriageable age is 18 years for women and 21 years for men. We verify this and will not permit profiles below these thresholds.',
    },
    {
      q: 'I registered but cannot log in. What should I do?',
      a: "Try the 'Forgot Password' option to reset via your registered phone number. If you still cannot access your account, contact support at support@avyuktha.com with your registered number and we'll resolve it within 2 hours.",
    },
    {
      q: 'Can I create multiple profiles?',
      a: 'No. Each person may have only one active profile. Duplicate profiles are detected and removed. If you need to update personal details, use the edit profile section.',
    },
  ],
  'AI Matching': [
    {
      q: 'How does the AI matchmaking work?',
      a: 'Our proprietary algorithm analyzes 50+ compatibility parameters: astrology (Gun Milan score), education level, family values, dietary preference, lifestyle habits, personality traits derived from your answers, income range, location, height, and more. It learns from your browsing and interaction behaviour to refine recommendations over time.',
    },
    {
      q: 'What is the compatibility score?',
      a: "Every suggested match includes a compatibility score from 0–100%. It reflects how closely you align across all parameters weighted by what you've indicated matters most to you in your partner preferences. Scores above 75% generally mean strong alignment.",
    },
    {
      q: 'Can I search for matches myself or only rely on AI suggestions?',
      a: "Both. AI Matches is the recommendations feed. You can also use the Search page to filter by community, education, age, height, income, location, and other criteria and browse independently. Premium subscribers get advanced filter access.",
    },
    {
      q: 'How do I improve the quality of my matches?',
      a: 'Complete 100% of your profile including astrology details, add clear photos, and be specific in your partner preferences. Use the feedback buttons (thumbs up/down on suggestions) — the AI uses this to recalibrate your feed.',
    },
    {
      q: 'Are matches shown only within my community/caste?',
      a: "By default, the algorithm respects your community preference. If you're open to inter-community matches, you can set this in your partner preferences and matches from other backgrounds will appear. Avyuktha does not enforce or encourage caste discrimination.",
    },
  ],
  'Subscriptions & Billing': [
    {
      q: 'What plans are available?',
      a: 'We offer four premium plans: Silver (₹999/month), Gold (₹1,999/month), Platinum (₹3,499/month), and Elite (₹5,999/month). Longer durations (3 months, 6 months, 1 year) offer significant savings. A VIP Assisted plan with a dedicated relationship manager is available at ₹9,999/month.',
    },
    {
      q: 'What does each plan include?',
      a: 'Silver: 20 contacts/month. Gold: 50 contacts, chat, voice calls, relationship manager. Platinum: Unlimited contacts, video calls, profile highlights, AI insights. Elite: Everything in Platinum plus background verification priority and concierge service.',
    },
    {
      q: 'How do I cancel my subscription?',
      a: 'Go to Settings → Subscription → Cancel Plan. You retain premium access until the end of your current billing cycle. No cancellation fee applies.',
    },
    {
      q: 'What is the refund policy?',
      a: 'If you cancel within 7 days of purchase and have not used more than 5 contact reveals, you are eligible for a full refund. Partial refunds are considered case by case for technical issues. Contact billing@avyuktha.com.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'UPI (PhonePe, GPay, Paytm), debit/credit cards (Visa, Mastercard, Rupay), net banking, and EMI via select banks for 6-month and 1-year plans.',
    },
    {
      q: 'Can I upgrade mid-subscription?',
      a: "Yes. Go to Settings → Subscription → Upgrade. You'll be charged the prorated difference for the remaining days in your cycle.",
    },
  ],
  'Privacy & Safety': [
    {
      q: 'Who can see my profile?',
      a: "By default, registered and verified members can view your profile. You can restrict photo visibility, hide salary, and block anyone. Incognito mode (Gold+) lets you browse profiles without appearing in their 'Profile Visitors' list.",
    },
    {
      q: 'Is my phone number visible to other members?',
      a: "No. Your phone number is never shared without your explicit consent. Contact reveal is a paid feature — even then, the other member must also agree to share. Double opt-in protects both sides.",
    },
    {
      q: 'How do I block or report a profile?',
      a: "On any profile page, tap the three-dot menu → Block or Report. Blocked members cannot view your profile, message you, or appear in your matches. Reports go to our Trust & Safety team who review within 24 hours.",
    },
    {
      q: 'What data does Avyuktha collect and store?',
      a: "We collect profile data you provide, interaction logs (views, messages, matches), and device/session information. We do not sell your data to third parties. Full details are in our Privacy Policy at avyuktha.com/privacy-policy.",
    },
    {
      q: 'Can I delete my account and all my data?',
      a: "Yes. Settings → Account → Delete Account permanently removes your profile and all associated data within 30 days. You'll receive a confirmation email. Some anonymised data may be retained for fraud prevention as permitted by our policy.",
    },
  ],
  'Verification': [
    {
      q: 'Is profile verification mandatory?',
      a: "Verification is optional but strongly recommended. Verified profiles get a blue badge, appear higher in search results, and receive more connection requests. Verified members also tend to get faster responses from others.",
    },
    {
      q: 'What documents can I verify?',
      a: 'Aadhaar card (identity), PAN card (identity + income), employment letter or payslip (career), degree certificate (education), and face verification (selfie match). Each successfully verified document adds a specific badge.',
    },
    {
      q: 'How long does verification take?',
      a: 'Most verifications complete within 2–6 hours. Document reviews by our team can take up to 24 hours. Priority verification (same-day, human-reviewed) is available for Platinum and Elite subscribers.',
    },
    {
      q: 'Can I verify my income if I am self-employed?',
      a: "Yes. Submit your ITR (Income Tax Return) acknowledgement or CA-certified income certificate. Freelancers can also upload Form 16A or 3 months of bank statements.",
    },
  ],
  'Wedding Marketplace': [
    {
      q: 'What is the Wedding Marketplace?',
      a: 'A curated directory of wedding service providers — venues, photographers, caterers, decorators, make-up artists, priests, mehendi artists, music bands, bridal wear shops, invitation designers, travel agents, and more — all in one place.',
    },
    {
      q: 'Are marketplace vendors verified?',
      a: "All vendors are reviewed and approved by our team before listing. We check business registration, GST, and customer reviews. You'll see an 'Approved' badge on all active listings.",
    },
    {
      q: 'How do I book a vendor?',
      a: "Browse the marketplace by category and location. View available slots on the vendor's calendar, select a date and time, and confirm the booking. Payment is made directly to the vendor — Avyuktha does not charge the customer for bookings.",
    },
    {
      q: 'Can I review a vendor after my wedding?',
      a: 'Yes, and we encourage it. After a confirmed booking passes its date, you can leave a 1–5 star review with comments. Reviews are publicly visible and help other couples make informed decisions.',
    },
  ],
  'Technical': [
    {
      q: 'Which devices and browsers are supported?',
      a: "The web app works on Chrome, Firefox, Safari, and Edge (latest 2 versions). The mobile web experience is optimised for Android and iOS. Native mobile apps are coming soon.",
    },
    {
      q: 'Why are my photos not uploading?',
      a: 'Photos must be JPG or PNG, under 10MB, and show your face clearly. Sunglasses, groups photos, or obscured faces may be rejected by our automatic check. Try a different photo or contact support.',
    },
    {
      q: 'The video call dropped. What should I do?',
      a: "Check your internet connection (minimum 2 Mbps recommended for video). Refresh the page and rejoin. If the issue persists, switch to audio-only mode using the camera toggle. Video calls use Agora's infrastructure which is highly reliable but depends on both users' connections.",
    },
    {
      q: 'I am not receiving OTPs on my phone. What do I do?',
      a: "Check that you entered the correct country code and phone number. OTPs expire in 5 minutes — request a new one if it's expired. If your number is on DND, contact your operator to whitelist transactional SMS. Alternatively, request the OTP via WhatsApp.",
    },
  ],
};

const CATEGORIES = Object.keys(FAQ_DATA);

export const FAQPage: React.FC = () => {
  const [activeCat, setActiveCat] = useState('Getting Started');
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const results: Array<{ cat: string; item: { q: string; a: string }; idx: number }> = [];
    CATEGORIES.forEach((cat) => {
      FAQ_DATA[cat].forEach((item, idx) => {
        if (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) {
          results.push({ cat, item, idx });
        }
      });
    });
    return results;
  }, [search]);

  const items = searchResults ? [] : FAQ_DATA[activeCat] ?? [];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-brand-50/50 via-white to-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Help Center
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-5">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
              Everything you need to know about Avyuktha Matrimony — from creating your profile to wedding day planning.
            </p>
            {/* Search */}
            <div className="max-w-lg mx-auto relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpenIdx(null); }}
                placeholder="Search questions..."
                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-border text-sm bg-white outline-none focus:border-brand-400 shadow-sm transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        {searchResults !== null ? (
          /* Search results */
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-slate-500 mb-6">
              {searchResults.length === 0 ? 'No results found.' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${search}"`}
            </p>
            <div className="space-y-3">
              {searchResults.map(({ cat, item }, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  isOpen={openIdx === i}
                  onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                  badge={cat}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category sidebar */}
            <aside className="lg:w-60 flex-shrink-0">
              <div className="sticky top-28 space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCat(cat); setOpenIdx(null); }}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      activeCat === cat
                        ? 'bg-brand-600 text-white font-semibold'
                        : 'text-slate-500 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {cat}
                    <span className={cn('ml-2 text-xs', activeCat === cat ? 'text-white/70' : 'text-slate-500')}>
                      ({FAQ_DATA[cat].length})
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* FAQ accordion */}
            <div className="flex-1 max-w-2xl">
              <motion.div
                key={activeCat}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <h2 className="font-display font-bold text-2xl mb-6">{activeCat}</h2>
                {items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    item={item}
                    isOpen={openIdx === i}
                    onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Still need help */}
        <div className="mt-20 bg-gradient-to-r from-brand-50 to-violet-50 rounded-3xl border border-brand-200 p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-display font-bold text-2xl mb-2">Still have questions?</h3>
            <p className="text-slate-500">Our support team is available Mon–Sat, 9 AM – 9 PM IST.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href="tel:+919999999999"
              className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-border p-5 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors">
                <Phone className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">Call Us</div>
                <div className="text-xs text-slate-500">+91 99999 99999</div>
              </div>
            </a>
            <a
              href="mailto:support@avyuktha.com"
              className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-border p-5 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors">
                <Mail className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">Email Us</div>
                <div className="text-xs text-slate-500">Response in 4 hours</div>
              </div>
            </a>
            <Link
              to="/contact"
              className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-border p-5 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center transition-colors">
                <MessageSquare className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">Contact Form</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">Send a message <ArrowRight className="w-3 h-3" /></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccordionItem: React.FC<{
  item: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
}> = ({ item, isOpen, onToggle, badge }) => (
  <div className="bg-white rounded-2xl border border-border overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors gap-3"
    >
      <div className="flex items-center gap-3 flex-1">
        {badge && (
          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full flex-shrink-0">{badge}</span>
        )}
        <span className="font-semibold text-sm leading-snug">{item.q}</span>
      </div>
      <ChevronDown className={cn('w-4 h-4 text-slate-500 flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-border">
            {item.a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

