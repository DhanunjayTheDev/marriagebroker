import React, { useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Rocket, Users, MapPinned, Sparkles, Trophy, Smartphone } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '../../lib/utils';

gsap.registerPlugin(ScrollTrigger);

const TIMELINE = [
  { year: '2019', title: 'Founded in Hyderabad', detail: 'Started by engineers and counsellors who believed online matrimony could be done better with more trust, privacy, and real AI.', icon: Rocket, accent: 'brand' },
  { year: '2020', title: 'First 1 Lakh Members', detail: 'Word-of-mouth growth across Telugu and Kannada communities. Verification system and AI engine launched in beta.', icon: Users, accent: 'emerald' },
  { year: '2021', title: 'Pan-India Expansion', detail: 'Expanded to Tamil Nadu, Maharashtra, Kerala, and Delhi NCR. Multilingual support added: Telugu, Tamil, Kannada, Malayalam, Hindi, Marathi.', icon: MapPinned, accent: 'sky' },
  { year: '2022', title: 'AI Matchmaking v2', detail: 'Deep learning compatibility scoring trained on 5 lakh successful marriages. Full Kundli analysis with Ashta Koota launched.', icon: Sparkles, accent: 'violet' },
  { year: '2023', title: '10 Lakh Marriages', detail: 'Crossed 10 lakh successful marriages facilitated. Wedding Services Marketplace launched with 2,000+ verified vendors.', icon: Trophy, accent: 'gold' },
  { year: '2024', title: 'Mobile-First Rebuild', detail: 'Complete platform redesign for speed and mobile. Video calling, photo privacy controls, and family account system shipped.', icon: Smartphone, accent: 'rose' },
];

const TIMELINE_ACCENT: Record<string, { dot: string; ring: string; text: string; badge: string }> = {
  brand:   { dot: 'bg-brand-600',   ring: 'group-hover:ring-brand-200',   text: 'text-brand-700',   badge: 'bg-brand-50 text-brand-700' },
  emerald: { dot: 'bg-emerald-600', ring: 'group-hover:ring-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700' },
  sky:     { dot: 'bg-sky-600',     ring: 'group-hover:ring-sky-200',     text: 'text-sky-700',     badge: 'bg-sky-50 text-sky-700' },
  violet:  { dot: 'bg-violet-600',  ring: 'group-hover:ring-violet-200',  text: 'text-violet-700',  badge: 'bg-violet-50 text-violet-700' },
  gold:    { dot: 'bg-amber-500',   ring: 'group-hover:ring-amber-200',   text: 'text-amber-700',   badge: 'bg-amber-50 text-amber-700' },
  rose:    { dot: 'bg-rose-600',    ring: 'group-hover:ring-rose-200',    text: 'text-rose-700',    badge: 'bg-rose-50 text-rose-700' },
};

const VALUES = [
  {
    label: '01', title: 'Trust First',
    body: 'Every profile is treated with absolute seriousness. Aadhaar verification, zero-tolerance on fake profiles, and bank-grade encryption because trust is not optional.',
    accent: 'bg-brand-600',
  },
  {
    label: '02', title: 'Dignity Always',
    body: 'We built this the way a respected elder would run a matrimony service with warmth, discretion, and deep respect for every person and every family.',
    accent: 'bg-rose-600',
  },
  {
    label: '03', title: 'Technology with Empathy',
    body: 'AI is a tool, not a replacement for human judgment. Our algorithms suggest people decide. Relationship managers step in when technology isn\'t enough.',
    accent: 'bg-amber-500',
  },
  {
    label: '04', title: 'Cultural Authenticity',
    body: 'From Nakshatra matching to community filters, we understand the nuances of Indian matrimonial culture and celebrate them.',
    accent: 'bg-emerald-600',
  },
];

const TEAM = [
  { name: 'Venkat Reddy', role: 'Co-Founder & CEO', area: 'Product', bio: 'Former Product Lead, Infosys. IIT Hyderabad. Started Avyuktha after his own frustrating matrimony experience.' },
  { name: 'Ananya Iyer', role: 'Co-Founder & Head of AI', area: 'Technology', bio: 'PhD in Computational Social Science, IISc Bangalore. Designed the compatibility engine and astrology integration.' },
  { name: 'Pradeep Nair', role: 'CTO', area: 'Engineering', bio: '15 years in fintech. Previously VP Engineering at Naukri.com. Leads all technology and data infrastructure.' },
  { name: 'Lakshmi Sharma', role: 'Head of Relationships', area: 'People', bio: '20 years in traditional matchmaking. Leads 50+ relationship managers across 12 cities.' },
];

const AREA_COLORS: Record<string, string> = {
  Product: 'bg-brand-600',
  Technology: 'bg-violet-600',
  Engineering: 'bg-slate-700',
  People: 'bg-rose-600',
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0 },
};

/* ─── Mandala ────────────────────────────────────────────────────────────── */
const Ring: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="150" cy="150" r="140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 8" />
    <circle cx="150" cy="150" r="110" stroke="currentColor" strokeWidth="0.4" />
    <circle cx="150" cy="150" r="80" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 5" />
    <circle cx="150" cy="150" r="50" stroke="currentColor" strokeWidth="0.4" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <line
        key={deg}
        x1="150" y1="10" x2="150" y2="40"
        stroke="currentColor" strokeWidth="0.5"
        transform={`rotate(${deg} 150 150)`}
      />
    ))}
  </svg>
);

const TimelineCard: React.FC<{
  item: typeof TIMELINE[number];
  acc: { dot: string; ring: string; text: string; badge: string };
  align: 'left' | 'right';
}> = ({ item, acc, align }) => (
  <div className={cn(
    'bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group',
    align === 'right' ? 'lg:text-right lg:mr-2' : 'lg:ml-2',
  )}>
    <div className={cn(
      'flex items-center gap-2 mb-3',
      align === 'right' ? 'lg:flex-row-reverse' : '',
    )}>
      <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', acc.badge)}>
        {item.year}
      </span>
    </div>
    <h3 className="font-display font-bold text-lg text-brand-950 mb-2">{item.title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{item.detail}</p>
  </div>
);

export const AboutPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ab-line', {
        y: 60, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out',
      });
      gsap.from('.ab-stat', {
        scrollTrigger: { trigger: '.ab-stats', start: 'top 80%' },
        y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-background" ref={heroRef}>

      {/* ═══════════════════════════════════════════════════════════════
          HERO dark editorial, Cormorant Garamond
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-950 relative overflow-hidden pt-32 pb-24 lg:pb-32">
        {/* Decorative rings */}
        <Ring className="absolute -top-20 -right-20 w-[480px] h-[480px] text-white/[0.04] pointer-events-none" />
        <Ring className="absolute -bottom-32 -left-32 w-80 h-80 text-gold-400/[0.08] pointer-events-none" />

        {/* Thin horizontal rule */}
        <div className="absolute left-0 right-0 top-28 h-px bg-white/10" />

        <div className="container relative">
          <div className="max-w-4xl">
            <p className="ab-line text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-8">
              Our Story &nbsp;/&nbsp; Avyuktha Matrimony &nbsp;/&nbsp; Est. 2019
            </p>
            <h1 className="font-heading font-bold leading-[1.05] mb-8">
              <span className="ab-line block text-[2.8rem] md:text-[4rem] lg:text-[5.5rem] text-white">We Exist to Help</span>
              <span className="ab-line block text-[2.8rem] md:text-[4rem] lg:text-[5.5rem] text-gradient-gold italic">Good People</span>
              <span className="ab-line block text-[2.8rem] md:text-[4rem] lg:text-[5.5rem] text-white">Find Each Other.</span>
            </h1>
            <p className="ab-line text-white/55 text-lg leading-relaxed max-w-2xl">
              Avyuktha Matrimony was founded in Hyderabad with one belief: finding a life partner is one of the most
              important decisions a person makes, and technology should make it easier not overwhelming, not transactional, never demeaning.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS horizontal, large numerals, no icon boxes
      ═══════════════════════════════════════════════════════════════ */}
      <section className="ab-stats bg-white border-b border-border">
        <div className="container py-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {[
              { n: '50 L+', l: 'Registered\nMembers' },
              { n: '10 L+', l: 'Successful\nMarriages' },
              { n: '50+', l: 'Cities Across\nIndia' },
              { n: '4.9★', l: 'Google\nRating' },
            ].map((s, i) => (
              <div key={i} className="ab-stat py-10 px-8 group hover:bg-brand-950 transition-colors duration-500">
                <div className="font-display font-bold text-4xl lg:text-5xl text-brand-950 group-hover:text-white transition-colors duration-500">
                  {s.n}
                </div>
                <div className="text-xs text-slate-500 mt-2 leading-snug whitespace-pre-line group-hover:text-white/50 transition-colors duration-500">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MISSION + VISION editorial asymmetric
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start">
            {/* Left: big pullquote */}
            <motion.div {...fadeUp}>
              <p className="font-heading text-3xl lg:text-4xl leading-snug text-brand-950 italic font-bold">
                "To make the matrimonial journey dignified, safe, and effective for every Indian regardless of community, language, or location."
              </p>
              <div className="mt-8 w-12 h-0.5 bg-brand-600" />
              <p className="mt-4 text-sm font-bold text-brand-700 uppercase tracking-widest">Our Mission</p>
            </motion.div>

            {/* Right: vision text */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 block">Our Vision</span>
              <p className="text-brand-950 text-lg leading-relaxed mb-6">
                A future where every Indian family has access to a trustworthy, intelligent, and personal matchmaking service not just those who can afford a premium matrimony bureau.
              </p>
              <p className="text-slate-500 leading-relaxed">
                We want Avyuktha to be the first name every family thinks of when a son or daughter reaches marriageable age. Not because we advertise the most, but because we serve the best.
              </p>

              {/* Stat pull */}
              <div className="mt-10 pt-8 border-t border-border grid grid-cols-2 gap-6">
                <div>
                  <div className="font-display font-bold text-3xl text-brand-700">15 Min</div>
                  <div className="text-xs text-slate-500 mt-1">Average AI response time to new profile</div>
                </div>
                <div>
                  <div className="font-display font-bold text-3xl text-brand-700">3×</div>
                  <div className="text-xs text-slate-500 mt-1">Higher response rate for verified profiles</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          VALUES numbered, text-led, no icon boxes
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/20 border-y border-border">
        <div className="container py-24 lg:py-32">
          <div className="flex items-baseline justify-between gap-4 mb-16 flex-wrap">
            <h2 className="font-display font-bold text-display-sm lg:text-display-md text-brand-950">
              What We Stand For
            </h2>
            <p className="text-slate-500 text-sm max-w-xs">
              Four principles that guide every product decision, every hire, every line of code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border border border-border rounded-3xl overflow-hidden">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.label}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="bg-white p-8 group hover:bg-brand-950 transition-colors duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-1 h-14 rounded-full flex-shrink-0 mt-1 ${v.accent}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white/30 transition-colors">
                      {v.label}
                    </span>
                    <h3 className="font-display font-bold text-xl mt-2 mb-3 group-hover:text-white transition-colors">
                      {v.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed group-hover:text-white/60 transition-colors">
                      {v.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TIMELINE alternating zigzag, gradient spine, icon nodes
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white relative overflow-hidden">
        <div className="container py-24 lg:py-32">
          <div className="flex items-baseline justify-between gap-4 mb-20 flex-wrap">
            <h2 className="font-display font-bold text-display-sm lg:text-display-md text-brand-950">
              Our Journey
            </h2>
            <p className="text-slate-500 text-sm max-w-xs">
              Six years, six milestones from a Hyderabad startup to India's most trusted matrimony platform.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Gradient spine — desktop center, mobile left */}
            <div className="absolute left-6 lg:left-1/2 top-1 bottom-1 w-px lg:-translate-x-1/2 bg-gradient-to-b from-brand-200 via-border to-border" />

            <div className="space-y-10 lg:space-y-4">
              {TIMELINE.map((item, i) => {
                const acc = TIMELINE_ACCENT[item.accent];
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={item.year}
                    {...fadeUp}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      'group relative flex items-start gap-6 lg:gap-0',
                      'lg:grid lg:grid-cols-[1fr_auto_1fr]',
                    )}
                  >
                    {/* Left column (desktop only, populated on even rows) */}
                    <div className="hidden lg:block">
                      {isEven && <TimelineCard item={item} acc={acc} align="right" />}
                    </div>

                    {/* Center node */}
                    <div className="flex-shrink-0 lg:flex lg:flex-col lg:items-center lg:px-6 relative z-10">
                      <div className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-white transition-all duration-300 group-hover:scale-110',
                        acc.dot,
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Right column (desktop: odd rows here; mobile: always here) */}
                    <div className="flex-1 lg:hidden">
                      <TimelineCard item={item} acc={acc} align="left" />
                    </div>
                    <div className="hidden lg:block">
                      {!isEven && <TimelineCard item={item} acc={acc} align="left" />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TEAM color-banded cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-950">
        <div className="container py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-14">
            <h2 className="font-display font-bold text-display-sm lg:text-display-md text-white">
              Leadership Team
            </h2>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed">
              Built by people who care deeply about Indian families and relationships.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map((m, i) => (
              <motion.div
                key={m.name}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors"
              >
                {/* Role color band */}
                <div className={`h-1 w-full ${AREA_COLORS[m.area] ?? 'bg-brand-600'}`} />
                <div className="p-6">
                  {/* Initials */}
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                    <span className="font-display font-bold text-lg text-white">
                      {m.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="font-display font-bold text-white mb-0.5">{m.name}</div>
                  <div className="text-xs text-white/40 mb-4">{m.role}</div>
                  <p className="text-xs text-white/50 leading-relaxed">{m.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-border">
        <div className="container py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Join Us</p>
              <h2 className="font-heading font-bold text-3xl lg:text-5xl italic text-brand-950 max-w-lg leading-tight">
                Be part of the story.<br />Your story starts here.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link to="/auth/register" className="btn-luxury inline-flex items-center gap-2 px-8 py-4 text-base">
                <Heart className="w-4 h-4 fill-white" />
                Create Your Profile
              </Link>
              <Link to="/careers" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border font-semibold hover:bg-muted transition-colors text-base">
                Join Our Team <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

