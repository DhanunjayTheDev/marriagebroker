import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  UserCircle2, Cpu, MessageCircle, ShieldCheck, Heart,
  CheckCircle2, Star, Video, Phone, Users, Lock,
  Sparkles, ArrowRight, FileCheck, Camera, ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const STEPS = [
  {
    n: '01', icon: UserCircle2,
    title: 'Build Your Profile',
    subtitle: 'Takes 10 minutes',
    desc: 'Answer guided questions about yourself, your family, career, and partner expectations. Upload photos with privacy controls and add astrology details for compatibility matching.',
    chips: ['Personal & family details', 'Education & career', 'Lifestyle preferences', 'Horoscope & astrology', 'Partner expectations', 'Photos with privacy'],
    palette: { bg: 'bg-brand-950', num: 'text-brand-800', chip: 'bg-white/10 text-white/70 border-white/10', icon: 'text-brand-400', sub: 'text-brand-400' },
  },
  {
    n: '02', icon: ShieldCheck,
    title: 'Get Verified',
    subtitle: 'Optional — 3× more responses',
    desc: 'Verify with Aadhaar, PAN, or employment docs. Verified profiles earn a Trust Badge that increases response rates by 3× — giving potential partners the confidence to connect.',
    chips: ['Aadhaar verification', 'PAN card check', 'Face match ID', 'Employment proof', 'Trust badge on profile', 'Priority in search'],
    palette: { bg: 'bg-emerald-950', num: 'text-emerald-800', chip: 'bg-white/10 text-white/70 border-white/10', icon: 'text-emerald-400', sub: 'text-emerald-400' },
  },
  {
    n: '03', icon: Cpu,
    title: 'AI Sends Your Matches',
    subtitle: 'Personalised daily',
    desc: 'Our AI analyses 50+ compatibility parameters — community, education, values, Gun Milan score, lifestyle — to deliver your best matches daily. No swiping, no noise, just quality.',
    chips: ['50+ compatibility factors', 'Ashta Koota scoring', 'Mutual preference alignment', 'Education & income filters', 'Location preferences', 'Family compatibility'],
    palette: { bg: 'bg-violet-950', num: 'text-violet-800', chip: 'bg-white/10 text-white/70 border-white/10', icon: 'text-violet-400', sub: 'text-violet-400' },
  },
  {
    n: '04', icon: MessageCircle,
    title: 'Connect Safely',
    subtitle: 'On your own terms',
    desc: 'Send an interest, start a conversation, connect at your own pace. Voice and video calls happen inside the platform — your personal number stays private until you decide to share it.',
    chips: ['In-app voice & video', 'Private number protection', 'Request contact details', 'Family chat rooms', 'Photo sharing with approval', 'Block & report controls'],
    palette: { bg: 'bg-sky-950', num: 'text-sky-800', chip: 'bg-white/10 text-white/70 border-white/10', icon: 'text-sky-400', sub: 'text-sky-400' },
  },
  {
    n: '05', icon: Heart,
    title: 'Begin Forever',
    subtitle: 'Over 10 L+ couples started here',
    desc: 'When you\'ve found the right person, arrange family meetings — online or offline. Our relationship managers guide both families through introductions if needed.',
    chips: ['Video family introductions', 'Relationship manager support', 'Offline meeting coordination', 'Wedding marketplace', 'Success story submission', 'Lifetime photo access'],
    palette: { bg: 'bg-rose-950', num: 'text-rose-800', chip: 'bg-white/10 text-white/70 border-white/10', icon: 'text-rose-400', sub: 'text-rose-400' },
  },
];

const FEATURES = [
  { icon: Lock, title: 'Data Privacy', desc: 'Your contact, salary, and photos are hidden by default.' },
  { icon: ShieldCheck, title: 'Verified Profiles', desc: 'Aadhaar, PAN, and face matching — no fakes.' },
  { icon: Sparkles, title: 'AI Matching', desc: 'Trained on 10 lakh successful marriages.' },
  { icon: Star, title: 'Astrology', desc: 'Full Kundli, Gun Milan, and Nakshatra analysis.' },
  { icon: Video, title: 'In-App Calls', desc: 'HD video without sharing your phone number.' },
  { icon: Users, title: 'Family Accounts', desc: 'Parents co-manage with full approval workflows.' },
  { icon: FileCheck, title: 'Legal Verification', desc: 'Documents checked against government databases.' },
  { icon: Camera, title: 'Private Gallery', desc: 'Photos visible only to members you approve.' },
];

const TESTIMONIALS = [
  {
    name: 'Kavya & Rohit', city: 'Hyderabad', time: '3 months',
    q: 'The AI recommendations were spot-on. Same values, same community, and our Nakshatras matched perfectly. Avyuktha made everything feel natural.',
  },
  {
    name: 'Priya & Karthik', city: 'Bangalore', time: '5 months',
    q: 'The verification gave my parents confidence. The relationship manager helped coordinate our first family video call — a detail no other platform offered.',
  },
  {
    name: 'Meera & Aravind', city: 'Chennai', time: '2 months',
    q: 'Our Kundli score was 32/36. The platform showed exactly which areas matched and which needed discussion. Honest and genuinely helpful.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0 },
};

export const HowItWorksPage: React.FC = () => (
  <div className="bg-background">

    {/* ═══════════════════════════════════════════════════════════════
        HERO — typographic, left-aligned, no blobs
    ═══════════════════════════════════════════════════════════════ */}
    <section className="bg-white border-b border-border pt-32 pb-16">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 mb-6">
            How Avyuktha Works &nbsp;·&nbsp; 5 Steps to Forever
          </p>
          <h1 className="font-heading font-bold text-[3rem] md:text-[4.5rem] lg:text-[6rem] leading-[1.0] text-brand-950 italic mb-8">
            Safe. Personal.<br />Intelligent.
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed mb-10">
            From profile creation to family introductions — everything happens privately, at your pace, with AI and human support at every step.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth/register" className="btn-luxury inline-flex items-center gap-2 px-8 py-4 text-base">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-border font-semibold hover:bg-muted transition-colors text-base">
              View Pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════
        STEPS — full-bleed dark panels with huge bg number
    ═══════════════════════════════════════════════════════════════ */}
    {STEPS.map((step, i) => {
      const Icon = step.icon;
      return (
        <motion.section
          key={step.n}
          {...fadeUp}
          transition={{ delay: 0.05 }}
          className={cn('relative overflow-hidden', step.palette.bg)}
        >
          {/* Giant background step number */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 right-0 font-display font-bold leading-none select-none pointer-events-none',
              'text-[22rem] lg:text-[28rem] opacity-100',
              step.palette.num,
            )}
            style={{ lineHeight: 0.85 }}
          >
            {step.n}
          </div>

          <div className="container relative py-20 lg:py-28">
            <div className="max-w-2xl">
              {/* Step meta */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className={cn('w-5 h-5', step.palette.icon)} />
                </div>
                <span className={cn('text-xs font-bold uppercase tracking-widest', step.palette.sub)}>
                  Step {step.n} &nbsp;·&nbsp; {step.subtitle}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-display-sm lg:text-display-md text-white leading-tight mb-6">
                {step.title}
              </h2>

              {/* Desc */}
              <p className="text-white/60 leading-relaxed text-lg mb-10 max-w-lg">
                {step.desc}
              </p>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-2">
                {step.chips.map((c) => (
                  <span
                    key={c}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full border',
                      step.palette.chip,
                    )}
                  >
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 opacity-70" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom rule */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        </motion.section>
      );
    })}

    {/* ═══════════════════════════════════════════════════════════════
        FEATURES — horizontal scrollable on mobile, 4-col desktop
    ═══════════════════════════════════════════════════════════════ */}
    <section className="bg-white border-t border-border">
      <div className="container py-20 lg:py-24">
        <div className="flex items-baseline justify-between mb-12 flex-wrap gap-4">
          <h2 className="font-display font-bold text-display-sm text-brand-950">
            Built for Trust & Safety
          </h2>
          <p className="text-slate-500 text-sm max-w-xs">
            Every feature designed with your privacy, safety, and dignity in mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
                className="border border-border rounded-2xl p-5 hover:border-brand-300 hover:shadow-warm-lg transition-all group"
              >
                <Icon className="w-5 h-5 text-brand-600 mb-4" />
                <div className="font-semibold text-sm mb-1.5 group-hover:text-brand-700 transition-colors">{f.title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════
        TESTIMONIALS — editorial pull-quote style
    ═══════════════════════════════════════════════════════════════ */}
    <section className="bg-muted/30 border-t border-border">
      <div className="container py-20 lg:py-24">
        <h2 className="font-display font-bold text-display-sm text-brand-950 mb-12">
          What Our Couples Say
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              {...fadeUp}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-7 border border-border flex flex-col"
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, k) => <Star key={k} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="font-heading text-lg leading-snug italic text-brand-950 flex-1 mb-6">
                "{t.q}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.city}</div>
                </div>
                <span className="text-xs bg-brand-50 text-brand-700 font-bold px-2.5 py-1 rounded-full">
                  {t.time}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════════════════════════════════════════════════════════
        CTA
    ═══════════════════════════════════════════════════════════════ */}
    <section className="bg-brand-950">
      <div className="container py-20 lg:py-24 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Get Started</p>
          <h2 className="font-heading font-bold text-3xl lg:text-5xl italic text-white max-w-lg leading-tight">
            Your story begins with a single step.
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-brand-900 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-colors text-base"
          >
            <Heart className="w-4 h-4 text-brand-700 fill-brand-700" />
            Start Free
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 border border-white/20 text-white/70 font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-colors text-base"
          >
            <Phone className="w-4 h-4" />
            Talk to a Manager
          </Link>
        </div>
      </div>
    </section>

  </div>
);

