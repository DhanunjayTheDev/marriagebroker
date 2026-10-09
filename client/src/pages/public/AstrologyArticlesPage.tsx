import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Moon, Sun, Clock, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '../../lib/utils';

const RASI_COMPAT: Record<string, { best: string[]; good: string[]; challenging: string[] }> = {
  Mesha: { best: ['Simha', 'Dhanus'], good: ['Mithuna', 'Kumbha'], challenging: ['Kataka', 'Makara'] },
  Vrishabha: { best: ['Kanya', 'Makara'], good: ['Kataka', 'Meena'], challenging: ['Simha', 'Kumbha'] },
  Mithuna: { best: ['Tula', 'Kumbha'], good: ['Mesha', 'Simha'], challenging: ['Kanya', 'Meena'] },
  Kataka: { best: ['Vrishchika', 'Meena'], good: ['Vrishabha', 'Kanya'], challenging: ['Mesha', 'Tula'] },
  Simha: { best: ['Mesha', 'Dhanus'], good: ['Mithuna', 'Tula'], challenging: ['Vrishabha', 'Vrishchika'] },
  Kanya: { best: ['Vrishabha', 'Makara'], good: ['Kataka', 'Vrishchika'], challenging: ['Mithuna', 'Dhanus'] },
  Tula: { best: ['Mithuna', 'Kumbha'], good: ['Simha', 'Dhanus'], challenging: ['Kataka', 'Makara'] },
  Vrishchika: { best: ['Kataka', 'Meena'], good: ['Kanya', 'Makara'], challenging: ['Simha', 'Kumbha'] },
  Dhanus: { best: ['Mesha', 'Simha'], good: ['Tula', 'Kumbha'], challenging: ['Kanya', 'Meena'] },
  Makara: { best: ['Vrishabha', 'Kanya'], good: ['Vrishchika', 'Meena'], challenging: ['Mesha', 'Tula'] },
  Kumbha: { best: ['Mithuna', 'Tula'], good: ['Mesha', 'Dhanus'], challenging: ['Vrishabha', 'Vrishchika'] },
  Meena: { best: ['Kataka', 'Vrishchika'], good: ['Vrishabha', 'Makara'], challenging: ['Mithuna', 'Dhanus'] },
};

const RASIS = Object.keys(RASI_COMPAT);

const ARTICLES = [
  {
    icon: '🔱', cat: 'Gun Milan',
    title: 'Ashta Koota Matching: What Each of the 8 Kootas Actually Measures',
    excerpt: 'Varna, Vasya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi a comprehensive guide to what each of the eight compatibility factors tests and how much weight each should carry.',
    readTime: '12 min',
  },
  {
    icon: '🌙', cat: 'Nakshatras',
    title: 'Nakshatra Compatibility in Marriage: Beyond Just the Tara Porutham',
    excerpt: 'The 27 birth stars carry specific energies that influence personality, career, and relationships. This guide explains how Nakshatra matching works and which combinations are particularly auspicious.',
    readTime: '10 min',
  },
  {
    icon: '♂️', cat: 'Doshas',
    title: 'Mangal Dosha: Myths vs. Reality A Modern Astrologer\'s Perspective',
    excerpt: 'Mangal Dosha causes more matrimonial anxiety than almost anything else. A Vedic astrologer with 20 years of practice separates fact from superstition.',
    readTime: '8 min',
  },
  {
    icon: '🐍', cat: 'Doshas',
    title: 'Kaal Sarp Dosha in Marriage Compatibility What You Need to Know',
    excerpt: 'If both planets in a Kundli are between Rahu and Ketu, Kaal Sarp Dosha forms. This article explains the different types, their true severity, and remedies that are evidence-based.',
    readTime: '9 min',
  },
  {
    icon: '⭐', cat: 'Kundli',
    title: 'How to Read Your Own Kundli for Marriage Compatibility',
    excerpt: 'You don\'t need a pandit to do a basic kundli reading. A beginner\'s guide to understanding the 12 houses, the 9 planets, and what the 7th house specifically tells you about marriage.',
    readTime: '15 min',
  },
  {
    icon: '🔢', cat: 'Numerology',
    title: 'Numerology in Matrimony: Does Your Life Path Number Matter?',
    excerpt: 'Numerology isn\'t Vedic astrology, but it has deep roots in Indian culture. How life path numbers interact, which numbers are compatible, and when to actually listen to your number.',
    readTime: '6 min',
  },
  {
    icon: '📅', cat: 'Muhurtham',
    title: 'How to Choose an Auspicious Wedding Date (Muhurtham) in 2025–2026',
    excerpt: 'The Panchang, the planetary positions, the Nakshatra of the day all of it matters. A step-by-step guide to identifying auspicious dates for your wedding in the upcoming year.',
    readTime: '7 min',
  },
  {
    icon: '🏠', cat: 'Houses',
    title: 'The 7th House in Vedic Astrology: What It Reveals About Your Future Partner',
    excerpt: 'The 7th house is the house of marriage and partnerships. The sign in this house, its lord, and any planets present describe the nature of your future spouse in remarkable detail.',
    readTime: '11 min',
  },
];

const CATEGORIES = ['All', 'Gun Milan', 'Nakshatras', 'Doshas', 'Kundli', 'Numerology', 'Muhurtham', 'Houses'];

const GUN_MILAN_KOOTAS = [
  { name: 'Varna', points: 1, meaning: 'Spiritual compatibility and ego levels' },
  { name: 'Vasya', points: 2, meaning: 'Mutual attraction and control' },
  { name: 'Tara', points: 3, meaning: 'Health and longevity post-marriage' },
  { name: 'Yoni', points: 4, meaning: 'Physical and sexual compatibility' },
  { name: 'Graha Maitri', points: 5, meaning: 'Mental compatibility and friendship' },
  { name: 'Gana', points: 6, meaning: 'Nature and temperament match' },
  { name: 'Bhakoot', points: 7, meaning: 'Love, prosperity, and family welfare' },
  { name: 'Nadi', points: 8, meaning: 'Health, genetics, and progeny' },
];

export const AstrologyArticlesPage: React.FC = () => {
  const [cat, setCat] = useState('All');
  const [selectedRasi, setSelectedRasi] = useState<string | null>(null);
  const [openKoota, setOpenKoota] = useState<number | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filtered = cat === 'All' ? ARTICLES : ARTICLES.filter((a) => a.cat === cat);
  const rasiData = selectedRasi ? RASI_COMPAT[selectedRasi] : null;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="pt-28 pb-14 bg-gradient-to-b from-violet-50/40 via-white to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-72 h-72 bg-gold-100/20 rounded-full blur-3xl" />
        </div>
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-violet-700 bg-violet-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Astrology & Compatibility
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-5">
              Vedic Astrology for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-brand-600">
                Modern Marriages
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Deep dives into Kundli matching, Gun Milan, Nakshatra compatibility, doshas, and auspicious dates explained clearly for today's couples.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        {/* Rasi compatibility tool */}
        <section className="mb-16 bg-white rounded-3xl border border-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Moon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Quick Rasi Compatibility</h2>
              <p className="text-xs text-slate-500">Select your Rasi (moon sign) to see compatibility at a glance</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {RASIS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRasi(selectedRasi === r ? null : r)}
                className={cn(
                  'text-xs font-semibold px-3.5 py-2 rounded-full transition-colors',
                  selectedRasi === r ? 'bg-violet-600 text-white' : 'bg-muted text-slate-500 hover:bg-accent'
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {rasiData && selectedRasi && (
            <motion.div
              key={selectedRasi}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current" /> Best Match
                </div>
                <div className="flex flex-wrap gap-2">
                  {rasiData.best.map((r) => <span key={r} className="text-sm font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">{r}</span>)}
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Good Match</div>
                <div className="flex flex-wrap gap-2">
                  {rasiData.good.map((r) => <span key={r} className="text-sm font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">{r}</span>)}
                </div>
              </div>
              <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
                <div className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">Needs Work</div>
                <div className="flex flex-wrap gap-2">
                  {rasiData.challenging.map((r) => <span key={r} className="text-sm font-semibold text-orange-800 bg-orange-100 px-3 py-1 rounded-full">{r}</span>)}
                </div>
              </div>
              <p className="sm:col-span-3 text-xs text-slate-500">
                * Rasi compatibility is one of many factors. Full Kundli analysis with all 8 Kootas provides a much more accurate picture.
              </p>
            </motion.div>
          )}
        </section>

        {/* Gun Milan quick reference */}
        <section className="mb-16 bg-gradient-to-br from-violet-50 to-brand-50 rounded-3xl border border-violet-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sun className="w-6 h-6 text-gold-600" />
            <h2 className="font-display font-bold text-xl">Ashta Koota 36 Points Explained</h2>
          </div>
          <div className="space-y-2">
            {GUN_MILAN_KOOTAS.map((k, i) => (
              <div key={k.name} className="bg-white rounded-xl overflow-hidden border border-border">
                <button
                  onClick={() => setOpenKoota(openKoota === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {k.points}
                    </span>
                    <span className="font-semibold text-sm">{k.name} Koota</span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', openKoota === i && 'rotate-180')} />
                </button>
                {openKoota === i && (
                  <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-border pt-3">
                    <strong className="text-brand-950">What it measures:</strong> {k.meaning}. Out of {k.points} possible points. A score of 0 or 1 in Nadi Koota (8 points) is considered very inauspicious; a score of 0 in Bhakoot is similarly concerning.
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Minimum recommended total: 18/36. Avyuktha automatically calculates your Gun Milan score when you add birth details to your profile.
          </p>
        </section>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'text-xs font-semibold px-4 py-2 rounded-full transition-colors',
                cat === c ? 'bg-violet-600 text-white' : 'bg-muted text-slate-500 hover:bg-accent'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((art, i) => {
            const isExpanded = expandedArticle === art.title;
            return (
              <motion.div
                key={art.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setExpandedArticle(isExpanded ? null : art.title)}
                className={cn(
                  'bg-white rounded-2xl border p-6 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer group',
                  isExpanded ? 'border-violet-300 shadow-md' : 'border-border',
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{art.icon}</span>
                  <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">{art.cat}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3" />{art.readTime}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base mb-2 leading-snug group-hover:text-violet-700 transition-colors">
                  {art.title}
                </h3>
                <p className={cn(
                  'text-sm text-slate-500 leading-relaxed transition-all',
                  isExpanded ? '' : 'line-clamp-3',
                )}>
                  {art.excerpt}
                </p>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-violet-600 font-semibold">
                      {isExpanded ? 'Click to collapse' : 'Click to read more'}
                    </p>
                  </div>
                )}
                {!isExpanded && (
                  <p className="text-xs text-violet-600 font-semibold mt-3">Read more →</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-white rounded-3xl border border-border p-8 text-center">
          <div className="text-4xl mb-4">🔮</div>
          <h3 className="font-display font-bold text-2xl mb-3">Get Your Free Kundli Compatibility Report</h3>
          <p className="text-slate-500 max-w-lg mx-auto mb-6 text-sm">
            Add your birth details to your Avyuktha profile and we'll calculate your Ashta Koota score, identify doshas, and suggest auspicious matches automatically.
          </p>
          <Link to="/auth/register" className="btn-luxury px-10 py-3.5 inline-flex items-center gap-2">
            Create Free Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

