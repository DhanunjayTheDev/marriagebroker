import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Check, X, Star, Sparkles, Crown, Shield, Zap, ChevronDown, ArrowRight, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

const DURATIONS = [
  { label: '1 Month', value: 30 },
  { label: '3 Months', value: 90, badge: 'Save 17%' },
  { label: '6 Months', value: 180, badge: 'Save 25%' },
  { label: '1 Year', value: 365, badge: 'Save 33%' },
] as const;

const PLANS = [
  {
    key: 'silver', name: 'Silver', icon: Star,
    tagline: 'Start your journey',
    prices: { 30: 999, 90: 2499, 180: 4499, 365: 7999 },
    color: 'slate',
    gradient: 'from-slate-500 to-slate-700',
    ring: 'ring-slate-200',
    badge: '',
    features: [
      { label: 'View up to 50 profiles/day', included: true },
      { label: 'Send & receive interests', included: true },
      { label: 'Voice calls (30 min/day)', included: true },
      { label: 'Contact requests (5/month)', included: true },
      { label: 'Basic filters & search', included: true },
      { label: 'Video calls', included: false },
      { label: 'AI matchmaking', included: false },
      { label: 'Photo access', included: false },
      { label: 'Profile boost', included: false },
      { label: 'Dedicated relationship manager', included: false },
    ],
  },
  {
    key: 'gold', name: 'Gold', icon: Sparkles,
    tagline: 'Most popular choice',
    prices: { 30: 1999, 90: 4999, 180: 8999, 365: 14999 },
    color: 'gold',
    gradient: 'from-gold-500 to-amber-600',
    ring: 'ring-gold-400',
    badge: 'Most Popular',
    features: [
      { label: 'Unlimited profile views', included: true },
      { label: 'Send & receive interests', included: true },
      { label: 'Voice calls (unlimited)', included: true },
      { label: 'Contact requests (20/month)', included: true },
      { label: 'Advanced filters & saved searches', included: true },
      { label: 'HD video calls', included: true },
      { label: 'AI matchmaking', included: true },
      { label: 'Private photo access', included: true },
      { label: 'Profile boost', included: false },
      { label: 'Dedicated relationship manager', included: false },
    ],
  },
  {
    key: 'platinum', name: 'Platinum', icon: Crown,
    tagline: 'Maximum visibility',
    prices: { 30: 3499, 90: 8999, 180: 15999, 365: 24999 },
    color: 'sky',
    gradient: 'from-sky-500 to-indigo-600',
    ring: 'ring-sky-300',
    badge: '',
    features: [
      { label: 'Everything in Gold', included: true },
      { label: 'Unlimited chats & calls', included: true },
      { label: 'Unlimited contact requests', included: true },
      { label: 'Priority search placement', included: true },
      { label: 'Daily profile boost', included: true },
      { label: 'Featured profile badge', included: true },
      { label: 'Priority customer support', included: true },
      { label: 'Match alerts via WhatsApp', included: true },
      { label: 'Background verification', included: false },
      { label: 'Dedicated relationship manager', included: false },
    ],
  },
  {
    key: 'elite', name: 'Elite', icon: Shield,
    tagline: 'White-glove service',
    prices: { 30: 5999, 90: 14999, 180: 27999, 365: 44999 },
    color: 'violet',
    gradient: 'from-violet-500 to-purple-700',
    ring: 'ring-violet-300',
    badge: 'Premium',
    features: [
      { label: 'Everything in Platinum', included: true },
      { label: 'Government ID verification', included: true },
      { label: 'Employment verification', included: true },
      { label: 'Dedicated relationship manager', included: true },
      { label: 'Hand-picked matches weekly', included: true },
      { label: 'Elite premium badge', included: true },
      { label: 'Family concierge assistance', included: true },
      { label: 'WhatsApp status match alerts', included: true },
      { label: 'Offline meetup coordination', included: true },
      { label: 'Money-back guarantee', included: true },
    ],
  },
];

const COMPARE_ROWS = [
  { feature: 'Profile views per day', silver: '50', gold: 'Unlimited', platinum: 'Unlimited', elite: 'Unlimited' },
  { feature: 'Interest requests', silver: 'Unlimited', gold: 'Unlimited', platinum: 'Unlimited', elite: 'Unlimited' },
  { feature: 'Contact requests (monthly)', silver: '5', gold: '20', platinum: 'Unlimited', elite: 'Unlimited' },
  { feature: 'Voice calls', silver: '30 min/day', gold: 'Unlimited', platinum: 'Unlimited', elite: 'Unlimited' },
  { feature: 'Video calls', silver: '—', gold: 'HD', platinum: 'HD', elite: 'HD' },
  { feature: 'AI match recommendations', silver: '—', gold: '✓', platinum: '✓', elite: '✓' },
  { feature: 'Private photo access', silver: '—', gold: '✓', platinum: '✓', elite: '✓' },
  { feature: 'Profile boost', silver: '—', gold: '—', platinum: 'Daily', elite: 'Daily' },
  { feature: 'Background verification', silver: '—', gold: '—', platinum: '—', elite: '✓' },
  { feature: 'Dedicated relationship manager', silver: '—', gold: '—', platinum: '—', elite: '✓' },
  { feature: 'Hand-picked matches', silver: '—', gold: '—', platinum: '—', elite: 'Weekly' },
];

const FAQ_ITEMS = [
  { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade anytime and the remaining credit from your current plan is adjusted proportionally. Downgrades take effect at the end of the current billing cycle.' },
  { q: 'Is there a free plan?', a: 'Yes! You can create a complete profile, browse matches, and send interests on our Free plan. Premium features like chat, video calls, and contact access require a paid subscription.' },
  { q: 'Are there any hidden charges?', a: 'No hidden charges. The price you see is the price you pay. GST (18%) is included in all displayed prices.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and EMI options via Razorpay. All payments are secured with 256-bit SSL encryption.' },
  { q: 'What is your refund policy?', a: 'We offer a 7-day money-back guarantee on all plans if you\'re not satisfied. Refunds are processed within 5–7 business days to the original payment method.' },
  { q: 'Is VIP Assisted service available?', a: 'Yes — our VIP Assisted service (₹9,999/month) includes a personal matchmaking consultant who interviews you, curates matches, and facilitates introductions. Contact our team to enroll.' },
];

export const PricingPage: React.FC = () => {
  const [duration, setDuration] = useState<30 | 90 | 180 | 365>(90);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const savings: Record<number, string> = { 30: '', 90: '17%', 180: '25%', 365: '33%' };

  return (
    <div className="bg-background">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-950 pt-32 pb-14 border-b border-white/10">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/30 mb-6">
              Plans &nbsp;·&nbsp; Transparent Pricing &nbsp;·&nbsp; No Hidden Fees
            </p>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <h1 className="font-heading font-bold italic text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] leading-[1.0] text-white mb-4">
                  Invest in Finding<br />Your Life Partner.
                </h1>
                <p className="text-white/50 max-w-lg leading-relaxed">
                  No commission. No hidden fees. Pay once, connect with verified matches. Cancel anytime. 7-day money-back guarantee on all plans.
                </p>
              </div>

              {/* Duration selector */}
              <div className="flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Billing Period</p>
                <div className="inline-flex bg-white/10 rounded-2xl p-1 gap-1">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value as typeof duration)}
                      className={cn(
                        'relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                        duration === d.value
                          ? 'bg-white text-brand-950 shadow-sm'
                          : 'text-white/50 hover:text-white'
                      )}
                    >
                      {d.label}
                      {'badge' in d && d.badge && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {d.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {savings[duration] && (
                  <p className="mt-3 text-sm text-emerald-400 font-semibold">
                    ✓ You save {savings[duration]} vs monthly
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Plan Cards ─────────────────────────────────────────────────── */}
      <section className="pb-20 container">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const price = plan.prices[duration];
            const monthly = Math.round(price / (duration / 30));
            const isPopular = plan.badge === 'Most Popular';

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'relative bg-white rounded-3xl border p-6 flex flex-col',
                  isPopular
                    ? 'border-gold-400 ring-2 ring-gold-400 shadow-xl'
                    : 'border-border hover:border-brand-200 hover:shadow-lg transition-shadow'
                )}
              >
                {plan.badge && (
                  <div className={cn(
                    'absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap',
                    isPopular ? 'bg-gold-500 text-white' : 'bg-violet-600 text-white'
                  )}>
                    {plan.badge}
                  </div>
                )}

                <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4', plan.gradient)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="font-display font-bold text-xl mb-0.5">{plan.name}</div>
                <div className="text-xs text-slate-500 mb-4">{plan.tagline}</div>

                <div className="mb-1">
                  <span className="font-display font-bold text-3xl">₹{price.toLocaleString('en-IN')}</span>
                  <span className="text-slate-500 text-sm ml-1">/{duration === 30 ? 'mo' : `${duration} days`}</span>
                </div>
                {duration > 30 && (
                  <div className="text-xs text-slate-500 mb-4">
                    ≈ ₹{monthly.toLocaleString('en-IN')}/month
                  </div>
                )}

                <Link
                  to="/auth/register"
                  className={cn(
                    'block text-center py-3 rounded-xl font-semibold text-sm transition-all mb-6 mt-2',
                    isPopular
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-white hover:shadow-md'
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                  )}
                >
                  Get Started
                </Link>

                <div className="space-y-2.5 flex-1">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2.5">
                      {f.included ? (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-slate-500/40 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={cn('text-sm', f.included ? 'text-brand-950' : 'text-slate-500/60')}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* VIP Assisted CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 bg-gradient-to-r from-brand-600 via-brand-700 to-violet-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl mb-1">VIP Assisted — ₹9,999/month</div>
              <p className="text-white/80 text-sm max-w-lg">
                A personal matchmaking consultant interviews you, shortlists matches by hand, coordinates family introductions, and stays with you until you say "I do."
              </p>
            </div>
          </div>
          <a
            href="tel:+919999999999"
            className="shrink-0 flex items-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors"
          >
            <Phone className="w-4 h-4" /> Call Us Now
          </a>
        </motion.div>
      </section>

      {/* ── Free Plan Banner ───────────────────────────────────────────── */}
      <section className="py-10 bg-muted/40 border-y border-border">
        <div className="container text-center">
          <h3 className="font-display font-bold text-xl mb-2">Not ready to commit? Start Free.</h3>
          <p className="text-slate-500 max-w-xl mx-auto mb-5 text-sm">
            Create your profile, browse matches, and send interests — completely free. Upgrade when you're ready to take the next step.
          </p>
          <Link to="/auth/register" className="btn-luxury px-8 py-3 inline-flex items-center gap-2">
            Register Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Feature Comparison Table ───────────────────────────────────── */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">Compare Plans</h2>
          <p className="text-slate-500">See exactly what you get with each plan</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-4 font-semibold text-sm text-slate-500 w-1/3">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.key} className="px-4 py-4 text-center">
                    <div className="font-display font-bold text-sm">{p.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARE_ROWS.map((row, i) => (
                <tr key={i} className={cn('hover:bg-muted/20 transition-colors', i % 2 === 0 && 'bg-white')}>
                  <td className="px-5 py-3.5 text-sm text-brand-950">{row.feature}</td>
                  {(['silver', 'gold', 'platinum', 'elite'] as const).map((key) => (
                    <td key={key} className="px-4 py-3.5 text-center text-sm">
                      {row[key] === '✓' ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : row[key] === '—' ? (
                        <span className="text-slate-500/40">—</span>
                      ) : (
                        <span className="font-medium">{row[key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Trust Signals ──────────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-brand">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: '50 Lakh+', label: 'Registered Members' },
              { value: '10 Lakh+', label: 'Successful Marriages' },
              { value: '4.8★', label: 'Google Rating' },
              { value: '7-Day', label: 'Money-Back Guarantee' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display font-bold text-3xl mb-1">{value}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-20 container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">Pricing FAQ</h2>
          <p className="text-slate-500">Common questions about our plans</p>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition-colors"
              >
                <span className="font-semibold text-sm pr-4">{item.q}</span>
                <ChevronDown className={cn('w-5 h-5 text-slate-500 flex-shrink-0 transition-transform', openFAQ === i && 'rotate-180')} />
              </button>
              {openFAQ === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-50/50 border-t border-border">
        <div className="container text-center">
          <h2 className="font-display font-bold text-3xl mb-3">Ready to find your life partner?</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Join over 50 lakh members who trust Avyuktha Matrimony. Start for free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register" className="btn-luxury px-10 py-3.5 text-base">
              Create Free Profile
            </Link>
            <a href="tel:+919999999999" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-border font-semibold text-base hover:bg-accent transition-colors">
              <Phone className="w-4 h-4" /> Talk to Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

