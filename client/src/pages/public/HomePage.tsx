import React, { useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Heart, Shield, Sparkles, Star, ArrowRight, CheckCircle, BadgeCheck,
  Users, Award, Brain, Lock, Globe, Phone, MapPin, Quote,
  Zap, Eye, ChevronRight, Camera,
} from 'lucide-react';
import { cn } from '../../lib/utils';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ───────────────────────────────────────────────────────────────── */
const TRUST_MARQUEE = [
  '50 Lakh+ Members', '100% Verified Profiles', '10 Lakh+ Marriages',
  '4.9★ Google Rating', 'AI-Powered Matching', 'Aadhaar Verified',
  'NASSCOM Member', 'ISO 27001 Certified', 'Trusted Since 2008',
  'NRI Matches Worldwide', 'Bank-Grade Security', '15+ Years Trusted',
];

const COMMUNITY_STATS = [
  { value: '50L+',  label: 'Members', sub: 'across India & abroad' },
  { value: '10L+',  label: 'Marriages', sub: 'and counting every day' },
  { value: '98%',   label: 'Satisfaction', sub: 'verified post-match' },
  { value: '4.9★',  label: 'Rating', sub: 'across 1.2L+ reviews' },
];

const SHOWCASE = [
  { name: 'Ananya', age: 27, city: 'Hyderabad', qual: 'MBA, IIM-B', match: '89%', hue: 'from-rose-400 to-pink-300' },
  { name: 'Vikram', age: 30, city: 'Bangalore', qual: 'Software Architect', match: '94%', hue: 'from-violet-400 to-purple-300' },
  { name: 'Meera', age: 26, city: 'Chennai', qual: 'Doctor, AIIMS', match: '92%', hue: 'from-amber-400 to-yellow-300' },
];

const STEPS = [
  {
    n: '01', icon: Camera,
    title: 'Build Your Story',
    desc: 'Complete your profile in 12 guided steps — from basic details to astrology, lifestyle, and partner expectations.',
    accent: 'bg-violet-50 border-violet-200 text-violet-700',
    iconBg: 'bg-violet-600',
  },
  {
    n: '02', icon: Brain,
    title: 'AI Finds Your Match',
    desc: 'Our algorithm analyses 50+ dimensions — Rasi, Gun Milan, education, values, location — and surfaces your most compatible matches.',
    accent: 'bg-amber-50 border-amber-200 text-amber-700',
    iconBg: 'bg-amber-500',
  },
  {
    n: '03', icon: Shield,
    title: 'Connect with Confidence',
    desc: 'Every profile is Aadhaar-verified. Chat, voice call, or video call — all within Avyuktha\'s safe platform.',
    accent: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    iconBg: 'bg-emerald-600',
  },
  {
    n: '04', icon: Heart,
    title: 'Begin Forever',
    desc: 'When you\'re ready, our relationship managers guide both families through the final steps. Over 10 lakh marriages started here.',
    accent: 'bg-rose-50 border-rose-200 text-rose-700',
    iconBg: 'bg-rose-600',
  },
];

const PLANS = [
  {
    plan: 'Silver', price: '₹999', period: '/mo',
    features: ['20 contacts/month', 'Voice calls', 'Chat messaging', 'Basic AI matches'],
    popular: false, cta: 'Get Silver',
  },
  {
    plan: 'Gold', price: '₹1,999', period: '/mo',
    features: ['50 contacts/month', 'HD video calls', 'Photo unlock', 'Advanced AI', 'Priority support'],
    popular: true, cta: 'Get Gold — Most Popular',
  },
  {
    plan: 'Platinum', price: '₹3,499', period: '/mo',
    features: ['Unlimited contacts', 'VIP manager', 'Background checks', 'Featured profile', 'Concierge booking'],
    popular: false, cta: 'Get Platinum',
  },
];

const TESTIMONIALS = [
  {
    quote: "I had given up on matrimony sites. Avyuktha's AI was the first that matched us on things that actually matter — not just salary and height, but values, family expectations, and even astrology.",
    name: 'Priya Lakshmi', partner: 'married Arjun', city: 'Hyderabad', plan: 'Gold',
    duration: 'Found match in 11 weeks',
  },
  {
    quote: "The verification system made my parents comfortable in a way no other site had. Every profile was real. I found my husband within 3 months. The relationship manager was exceptional.",
    name: 'Lavanya Krishnamurthy', partner: 'married Karthik', city: 'Chennai', plan: 'Platinum',
    duration: 'Found match in 9 weeks',
  },
  {
    quote: "We were both NRI, both worried about cultural fit. The NRI filters and the relationship manager who understood our specific situation made all the difference. Truly personalised.",
    name: 'Sneha Mehta', partner: 'married Rahul', city: 'London → Pune', plan: 'VIP',
    duration: 'Found match in 14 weeks',
  },
];

const PRESS = [
  { name: 'Economic Times', note: 'Best Matrimony Platform 2024' },
  { name: 'YourStory', note: 'Top Indian Startup to Watch' },
  { name: 'Times of India', note: '\"The Matrimony App That Gets It Right\"' },
  { name: 'Inc42', note: 'Fastest-Growing Matchmaking Platform' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0 },
};

/* ─── Mandala SVG decoration ─────────────────────────────────────────────── */
const MandalaSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6" />
    <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
    <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="12" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 100 100)`}>
        <line x1="100" y1="10" x2="100" y2="30" stroke="currentColor" strokeWidth="0.5" />
        <line x1="100" y1="52" x2="100" y2="70" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="100" cy="40" r="3" stroke="currentColor" strokeWidth="0.5" fill="none" />
      </g>
    ))}
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 100 100)`}>
        <line x1="100" y1="70" x2="100" y2="88" stroke="currentColor" strokeWidth="0.4" />
      </g>
    ))}
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────────────── */
export const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.h-badge', { y: -20, opacity: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from('.h-head', { y: 40, opacity: 0, duration: 0.9, delay: 0.1, ease: 'power3.out' });
      gsap.from('.h-sub', { y: 24, opacity: 0, duration: 0.6, delay: 0.35, ease: 'power3.out' });
      gsap.from('.h-cta', { y: 16, opacity: 0, duration: 0.5, delay: 0.5, stagger: 0.1, ease: 'power3.out' });
      gsap.from('.h-card', { y: 60, opacity: 0, scale: 0.94, duration: 0.8, delay: 0.4, stagger: 0.14, ease: 'power3.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="hero-gradient relative pt-28 lg:pt-36 pb-0">

        {/* Mandala top-right decoration */}
        <MandalaSVG className="absolute top-16 right-8 w-80 h-80 text-brand-300/20 pointer-events-none hidden xl:block" />
        <MandalaSVG className="absolute -bottom-16 left-4 w-56 h-56 text-gold-300/15 pointer-events-none hidden xl:block" />

        <div className="container relative z-10 pb-20 lg:pb-28">
          <div className="grid lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-start">

            {/* ── Left copy ── */}
            <div className="max-w-xl pt-4">

              {/* Status badge */}
              <div className="h-badge inline-flex items-center gap-2.5 bg-white border border-brand-200/70 rounded-full pl-2 pr-4 py-1.5 shadow-sm mb-7">
                <span className="bg-brand-600 rounded-full px-2.5 py-1 text-[10px] font-bold text-white tracking-wider uppercase">New</span>
                <span className="text-sm font-medium text-brand-950">AI kundali matching now live</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>

              {/* Headline */}
              <h1 className="h-head font-display font-bold leading-[1.02] text-balance">
                <span className="block text-display-lg lg:text-display-xl text-brand-950">Where Sacred</span>
                <span className="block text-display-lg lg:text-display-xl text-gradient-primary">Bonds Begin</span>
                <span className="block text-display-md lg:text-display-lg text-brand-800 font-semibold mt-1">with Grace.</span>
              </h1>

              <p className="h-sub text-base lg:text-lg text-slate-500 mt-6 leading-relaxed max-w-lg">
                AI-powered matchmaking meets Vedic wisdom. Join{' '}
                <strong className="text-brand-950 font-semibold">50 lakh families</strong>{' '}
                who found their soulmate on India's most trusted matrimony platform.
              </p>

              {/* Trust chips */}
              <div className="h-cta flex flex-wrap gap-2 mt-5">
                {['Free forever', 'Aadhaar verified', 'Kundali matching', 'No spam calls'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-border rounded-full px-3 py-1.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{t}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="h-cta flex flex-col sm:flex-row gap-3 mt-8">
                <Link to="/auth/register" className="btn-luxury inline-flex items-center justify-center gap-2 text-base px-8 py-4 group">
                  <Heart className="w-5 h-5 fill-white flex-shrink-0" />
                  Find Your Partner Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/how-it-works" className="btn-gold inline-flex items-center justify-center gap-2 text-base px-8 py-4">
                  <Eye className="w-4 h-4" />
                  How It Works
                </Link>
              </div>

              {/* Rating row */}
              <div className="h-cta flex items-center gap-4 mt-7 pt-7 border-t border-border">
                <div className="flex -space-x-2">
                  {['A', 'V', 'M', 'R', 'S'].map((l, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: ['#7c3aed', '#e11d48', '#d97706', '#059669', '#0891b2'][i] }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((k) => <Star key={k} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                    <span className="text-sm font-bold text-brand-950 ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-slate-500">Trusted by 1.2 lakh+ families</p>
                </div>
              </div>
            </div>

            {/* ── Right: profile cards cluster ── */}
            <div className="relative h-[520px] hidden md:block flex-shrink-0">

              {/* Ring decoration */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[360px] h-[360px] rounded-full border border-brand-200/40 animate-spin-slow" />
                <div className="absolute w-[440px] h-[440px] rounded-full border border-gold-200/20" />
              </div>

              {/* Profile cards */}
              {SHOWCASE.map((p, i) => (
                <div
                  key={p.name}
                  className={cn(
                    'h-card absolute bg-white rounded-3xl shadow-warm-xl border border-border/60 overflow-hidden w-48',
                    i === 0 && 'top-10 left-4 animate-float',
                    i === 1 && 'top-16 right-2 animate-float-slow',
                    i === 2 && 'bottom-16 left-1/2 -translate-x-1/2 animate-float',
                  )}
                  style={{ animationDelay: `${i * 1.1}s` }}
                >
                  {/* Color band */}
                  <div className={cn('h-28 bg-gradient-to-br flex flex-col items-center justify-center gap-1', p.hue)}>
                    <span className="font-display text-4xl font-bold text-white/90">{p.name[0]}</span>
                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">{p.qual}</span>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-display font-semibold text-sm text-brand-950">{p.name}, {p.age}</span>
                      <BadgeCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2.5">
                      <MapPin className="w-3 h-3" />{p.city}
                    </div>
                    {/* AI match bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full" style={{ width: p.match }} />
                      </div>
                      <span className="text-[10px] font-bold text-brand-600">{p.match}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-0.5">AI compatibility</p>
                  </div>
                </div>
              ))}

              {/* Floating chips */}
              <div className="h-card absolute bottom-32 right-0 bg-white rounded-2xl shadow-warm-xl border border-border px-4 py-3 flex items-center gap-3 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-brand-700">94% Match</div>
                  <div className="text-[10px] text-slate-500">AI Compatibility</div>
                </div>
              </div>

              <div className="h-card absolute top-4 right-10 bg-emerald-500 rounded-xl shadow-lg px-3.5 py-2 flex items-center gap-2 animate-float-slow">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                <span className="text-xs font-semibold text-white">3,241 online now</span>
              </div>

              <div className="h-card absolute bottom-8 right-8 bg-gradient-gold rounded-2xl shadow-gold px-4 py-2.5 flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-900 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Verified</div>
                  <div className="text-xs font-semibold text-amber-900">Aadhaar + PAN</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom curve */}
        <div className="h-8 bg-white" style={{ borderRadius: '100% 100% 0 0 / 2rem 2rem 0 0', marginTop: '-1px' }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MARQUEE TRUST STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-border overflow-hidden py-4">
        <div className="flex whitespace-nowrap" style={{ animation: 'marqueeX 28s linear infinite' }}>
          {[...TRUST_MARQUEE, ...TRUST_MARQUEE].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-7 text-sm text-slate-500 font-medium flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS — editorial asymmetric layout
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container pt-20 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden border border-border">
            {COMMUNITY_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="bg-white py-10 px-8 text-center group hover:bg-brand-50 transition-colors"
              >
                <div className="font-display font-bold text-4xl lg:text-5xl text-brand-700 group-hover:scale-105 transition-transform origin-bottom">
                  {s.value}
                </div>
                <div className="font-semibold text-brand-950 mt-2">{s.label}</div>
                <div className="text-xs text-slate-500 mt-1">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS — 4-card grid
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container pt-16 pb-24">
          <div className="max-w-xl mb-14">
            <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-3 h-3" /> How It Works
            </span>
            <h2 className="font-display font-bold text-display-sm lg:text-display-md text-brand-950 text-balance">
              From Profile to Partner in Four Steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative bg-white border border-border rounded-2xl p-6 hover:border-brand-200 hover:shadow-warm-lg transition-all group"
              >
                {/* Large step number as background decoration */}
                <div className="absolute top-3 right-4 font-display font-bold text-[5rem] leading-none text-brand-50 select-none pointer-events-none group-hover:text-brand-100 transition-colors">
                  {s.n}
                </div>
                {/* Icon */}
                <div className={cn('relative w-11 h-11 rounded-xl flex items-center justify-center text-white mb-5', s.iconBg)}>
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-brand-950 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES — BENTO GRID
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-950 text-white">
        <div className="container py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-lg">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
                Why Avyuktha
              </span>
              <h2 className="font-display font-bold text-display-sm lg:text-display-md text-white text-balance">
                Crafted for Those Who Value<br />Tradition & Trust
              </h2>
            </div>
            <p className="text-white/60 max-w-xs leading-relaxed lg:text-right">
              The most advanced matrimony platform built for the modern Indian family — where technology meets tradition.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Large card — AI */}
            <motion.div {...fadeUp} className="md:col-span-3 bg-brand-800/50 border border-white/10 rounded-3xl p-8 hover:bg-brand-800/70 transition-colors group overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-brand-600/20 group-hover:bg-brand-600/30 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-brand-600 flex items-center justify-center mb-6 shadow-warm-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">AI-Powered Matching</h3>
                <p className="text-white/60 leading-relaxed text-sm">Proprietary AI analyses 50+ compatibility dimensions — astrology, values, lifestyle, personality, and family expectations. Every suggestion is explained, not just ranked.</p>
                <div className="mt-6 flex items-center gap-2 text-brand-300 text-sm font-semibold group-hover:gap-3 transition-all">
                  Learn about AI matching <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Large card — Verified */}
            <motion.div {...fadeUp} transition={{ delay: 0.06 }} className="md:col-span-3 bg-emerald-950/80 border border-emerald-800/40 rounded-3xl p-8 hover:bg-emerald-900/60 transition-colors group overflow-hidden relative">
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-emerald-700/20" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">100% Verified Profiles</h3>
                <p className="text-emerald-100/60 leading-relaxed text-sm">Aadhaar, PAN, face recognition, employment, and degree verification. Every badge on a profile is earned, not self-claimed.</p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {['Aadhaar', 'PAN', 'Face ID', 'Employment'].map((v) => (
                    <div key={v} className="flex items-center gap-1.5 text-xs text-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />{v}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Small cards */}
            {[
              { icon: Star, title: 'Astrology Matching', desc: 'Full Kundali analysis — Rasi, Nakshatra, Gun Milan, and dosha checks.', bg: 'bg-amber-950/80 border-amber-800/30', iconBg: 'bg-amber-500' },
              { icon: Lock, title: 'Complete Privacy', desc: 'Incognito mode. Hidden phone. Photo lock. Your data, your rules.', bg: 'bg-slate-900 border-slate-700/30', iconBg: 'bg-slate-600' },
              { icon: Globe, title: 'NRI Worldwide', desc: 'Connect with the Indian diaspora across 50+ countries.', bg: 'bg-blue-950/80 border-blue-800/30', iconBg: 'bg-blue-600' },
              { icon: Users, title: 'VIP Manager', desc: 'Dedicated managers personally curate matches for Elite & VIP members.', bg: 'bg-rose-950/80 border-rose-800/30', iconBg: 'bg-rose-600' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ delay: 0.12 + i * 0.06 }}
                className={cn('md:col-span-2 border rounded-2xl p-6 hover:-translate-y-0.5 transition-all group', f.bg)}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4', f.iconBg)}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TESTIMONIALS — editorial magazine style
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row gap-4 items-baseline justify-between mb-14">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                Success Stories
              </span>
              <h2 className="font-display font-bold text-display-sm lg:text-display-md text-brand-950 text-balance">
                Real Couples.<br />Real Love Stories.
              </h2>
            </div>
            <Link to="/success-stories" className="inline-flex items-center gap-2 text-brand-700 font-semibold hover:gap-3 transition-all text-sm flex-shrink-0">
              View all stories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'rounded-3xl p-7 flex flex-col',
                  i === 1
                    ? 'bg-brand-950 text-white lg:scale-[1.03] lg:-mt-3 shadow-warm-xl'
                    : 'bg-white border border-brand-100 shadow-sm'
                )}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((k) => (
                    <Star key={k} className={cn('w-4 h-4', i === 1 ? 'text-gold-400 fill-gold-400' : 'text-amber-400 fill-amber-400')} />
                  ))}
                </div>

                {/* Quote */}
                <Quote className={cn('w-7 h-7 mb-3 flex-shrink-0', i === 1 ? 'text-brand-400' : 'text-brand-300')} />
                <p className={cn('text-sm leading-relaxed flex-1', i === 1 ? 'text-white/85' : 'text-brand-900/75')}>
                  {t.quote}
                </p>

                {/* Author */}
                <div className="mt-7 pt-5 border-t flex items-center gap-3" style={{ borderColor: i === 1 ? 'rgba(255,255,255,0.1)' : undefined }}>
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                    i === 0 ? 'bg-brand-600' : i === 1 ? 'bg-brand-400' : 'bg-rose-500'
                  )}>
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn('font-semibold text-sm truncate', i === 1 ? 'text-white' : 'text-brand-950')}>{t.name}</div>
                    <div className={cn('text-xs truncate', i === 1 ? 'text-white/50' : 'text-slate-500')}>{t.partner} · {t.city}</div>
                  </div>
                  <div className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0', i === 1 ? 'bg-white/10 text-white/70' : 'bg-brand-50 text-brand-700')}>
                    {t.plan}
                  </div>
                </div>

                {/* Duration badge */}
                <div className={cn('mt-3 text-xs flex items-center gap-1.5', i === 1 ? 'text-emerald-400' : 'text-emerald-600')}>
                  <CheckCircle className="w-3.5 h-3.5" />{t.duration}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 border-t border-border">
        <div className="container py-24 lg:py-32">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              <Sparkles className="w-3 h-3" /> Pricing
            </span>
            <h2 className="font-display font-bold text-display-sm lg:text-display-md text-brand-950 text-balance">
              Start Free. Upgrade When Ready.
            </h2>
            <p className="text-slate-500 mt-4">No hidden fees. Cancel anytime. Full refund in 7 days.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.plan}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'rounded-3xl p-7 relative flex flex-col',
                  plan.popular
                    ? 'bg-gradient-brand text-white shadow-maroon lg:scale-[1.04]'
                    : 'bg-white border border-border hover:border-brand-200 hover:shadow-warm-lg transition-all'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-gold text-amber-900 text-[10px] font-bold px-5 py-1.5 rounded-full shadow-gold whitespace-nowrap">
                    ★ Most Popular
                  </div>
                )}

                <div className={cn('text-xs font-bold uppercase tracking-widest mb-3', plan.popular ? 'text-white/60' : 'text-slate-500')}>
                  {plan.plan}
                </div>
                <div className={cn('font-display font-bold text-4xl', plan.popular ? 'text-white' : 'text-brand-950')}>
                  {plan.price}
                  <span className={cn('text-base font-normal ml-1', plan.popular ? 'text-white/50' : 'text-slate-500')}>{plan.period}</span>
                </div>

                <ul className="space-y-3 my-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={cn('flex items-center gap-2.5 text-sm', plan.popular ? 'text-white/85' : 'text-brand-950')}>
                      <CheckCircle className={cn('w-4 h-4 flex-shrink-0', plan.popular ? 'text-gold-300' : 'text-emerald-500')} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/auth/register"
                  className={cn(
                    'block text-center py-3.5 rounded-2xl text-sm font-bold transition-all',
                    plan.popular
                      ? 'bg-white text-brand-800 hover:bg-brand-50'
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                  )}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Looking for more?{' '}
            <Link to="/pricing" className="text-brand-700 font-semibold hover:underline">
              See all plans including VIP Assisted →
            </Link>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRESS / TRUST BAND
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-border">
        <div className="container py-12">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">As Featured In</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {PRESS.map((p, i) => (
              <motion.div
                key={p.name}
                {...fadeUp}
                transition={{ delay: i * 0.06 }}
                className="bg-white py-8 px-6 text-center hover:bg-muted/20 transition-colors"
              >
                <div className="font-display font-bold text-lg text-brand-950/80">{p.name}</div>
                <div className="text-xs text-slate-500 mt-1.5 leading-snug">"{p.note}"</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA — with mandala decoration
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container py-24 lg:py-32">
          <div className="relative rounded-[2.5rem] bg-brand-950 overflow-hidden px-8 py-20 lg:py-28 text-center">

            {/* Mandala decorations */}
            <MandalaSVG className="absolute top-8 left-8 w-48 h-48 text-white/5 pointer-events-none" />
            <MandalaSVG className="absolute bottom-4 right-8 w-64 h-64 text-gold-400/10 pointer-events-none" />

            {/* Glow spots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-700/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-gold-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-5 py-2 mb-7">
                <Zap className="w-3.5 h-3.5 text-gold-300 flex-shrink-0" />
                <span className="text-white/80 font-medium text-sm">Registration is free, forever</span>
              </div>

              <h2 className="font-display font-bold text-display-md lg:text-display-lg text-white text-balance leading-tight">
                Your Perfect Partner<br />
                <span className="text-gradient-gold">Is Waiting for You.</span>
              </h2>

              <p className="text-white/55 text-lg mt-5 mb-10 leading-relaxed">
                Join 50 lakh+ families across India and the world.<br />
                No credit card. No hidden fees. Start today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-2.5 bg-white text-brand-900 font-bold px-10 py-4 rounded-full hover:bg-brand-50 transition-colors shadow-warm-xl text-base"
                >
                  <Heart className="w-5 h-5 fill-brand-700 text-brand-700 flex-shrink-0" />
                  Register Free Now
                </Link>
                <a href="tel:+919999999999" className="inline-flex items-center gap-2 text-white/65 font-medium hover:text-white transition-colors">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +91 99999 99999
                </a>
              </div>

              <p className="text-white/30 text-xs mt-8 tracking-wide">
                100% Safe & Secure &nbsp;·&nbsp; ISO 27001 Certified &nbsp;·&nbsp; Cancel Anytime
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

