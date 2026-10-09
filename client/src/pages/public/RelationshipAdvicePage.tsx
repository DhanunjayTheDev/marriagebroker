import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Users, Star, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '../../lib/utils';

const ARTICLES = [
  {
    slug: 'five-conversations-before-marriage',
    cat: 'Communication',
    icon: '💬',
    title: 'The 5 Conversations Every Couple Must Have Before Marriage',
    excerpt: "Money, in-laws, children, career ambitions, religious practice these topics feel awkward to raise, but avoiding them now creates problems later. Here's how to have them with grace.",
    readTime: '8 min', expert: 'Dr. Sunitha Rao, Family Therapist',
  },
  {
    slug: 'first-meeting-less-awkward',
    cat: 'First Meetings',
    icon: '☕',
    title: 'How to Make Your First Meeting Less Awkward and More Meaningful',
    excerpt: "The in-person meeting after weeks of online chatting can feel tense. Practical conversation starters, venue choices, and what to pay attention to beyond what's said.",
    readTime: '6 min', expert: 'Kavitha Menon, Relationship Counsellor',
  },
  {
    slug: 'navigating-family-expectations',
    cat: 'Family Dynamics',
    icon: '🏠',
    title: 'Navigating Expectations Between His Family and Hers',
    excerpt: "Both sides come with different expectations about lifestyle, finances, and household roles. How to negotiate early and set boundaries that both families can respect.",
    readTime: '9 min', expert: 'Prakash Reddy, Marriage Coach',
  },
  {
    slug: 'long-distance-courtship',
    cat: 'Long-Distance',
    icon: '✈️',
    title: 'Maintaining Emotional Connection in a Long-Distance Courtship',
    excerpt: "When you're in Hyderabad and your match is in the UK, the relationship has to survive on calls, texts, and occasional visits. Here's what keeps the spark alive.",
    readTime: '5 min', expert: 'Ananya Singh, Psychologist',
  },
  {
    slug: 'dual-career-marriage',
    cat: 'Modern Marriages',
    icon: '💼',
    title: 'When Both Partners Have Demanding Careers: Making It Work',
    excerpt: "The dual-career marriage is now the norm. Couples who navigate it successfully share how they divide responsibilities, protect couple time, and support each other's ambitions.",
    readTime: '7 min', expert: 'Dr. Venkat Rao, Couples Therapist',
  },
  {
    slug: 'healthy-boundaries-in-laws',
    cat: 'Family Dynamics',
    icon: '👩‍👩‍👦',
    title: 'How to Set Healthy Boundaries with In-Laws from Day One',
    excerpt: "Boundaries aren't about keeping people out. They're about creating clarity. How to have the in-law conversation kindly and early, before small misunderstandings become resentments.",
    readTime: '6 min', expert: 'Meera Iyer, Family Therapist',
  },
  {
    slug: 'marriage-anxiety',
    cat: 'Mental Health',
    icon: '🧠',
    title: 'Marriage Anxiety Is Real And More Common Than You Think',
    excerpt: "Feeling nervous, second-guessing yourself, or afraid of commitment before or after saying yes a therapist explains what's normal and what might need professional support.",
    readTime: '8 min', expert: 'Dr. Rohini Nair, Psychotherapist',
  },
  {
    slug: 'how-to-say-no-matrimony',
    cat: 'Communication',
    icon: '💡',
    title: 'How to Say "No" in Matrimony Without Hurting Anyone',
    excerpt: "Declining a match whether on your side or theirs is one of the most socially challenging parts of the process. A counsellor shares how to do it with respect and finality.",
    readTime: '4 min', expert: 'Kavitha Menon, Relationship Counsellor',
  },
];

const CATEGORIES = ['All', 'Communication', 'First Meetings', 'Family Dynamics', 'Long-Distance', 'Modern Marriages', 'Mental Health'];

const TIPS = [
  { icon: '🎯', tip: 'Be specific about dealbreakers early it saves time and feelings for both sides.' },
  { icon: '🔇', tip: 'Listen more than you talk in the first three meetings. You learn more by observing.' },
  { icon: '📱', tip: 'Consistent small messages (a good morning, a shared article) build connection faster than long phone calls.' },
  { icon: '👨‍👩‍👦', tip: 'Meet the family early. How someone treats their parents tells you how they\'ll treat you.' },
  { icon: '⏸️', tip: 'If something feels off, pause before acting. Gut feelings in relationships are usually right.' },
  { icon: '💰', tip: 'Talk about money before marriage, not after. Salary, savings, debt, spending habits all of it.' },
];

export const RelationshipAdvicePage: React.FC = () => {
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? ARTICLES : ARTICLES.filter((a) => a.cat === cat);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="pt-28 pb-14 bg-gradient-to-b from-rose-50/40 via-white to-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-rose-700 bg-rose-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Relationship Advice
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-5">
              Guidance from Real Experts,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-brand-600">
                for Real Couples
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Therapists, counsellors, and couples who've been through it share advice on every stage of the matrimonial journey.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        {/* Quick Tips */}
        <section className="mb-16 bg-white rounded-3xl border border-border p-8">
          <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-gold-500 fill-gold-500" /> Quick Tips from Our Experts
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-3 p-4 bg-muted/30 rounded-xl"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{t.icon}</span>
                <p className="text-sm text-slate-500 leading-relaxed">{t.tip}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'text-xs font-semibold px-4 py-2 rounded-full transition-colors',
                cat === c ? 'bg-brand-600 text-white' : 'bg-muted text-slate-500 hover:bg-accent'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-5">
          {filtered.map((art, i) => (
            <motion.div
              key={art.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/relationship-advice/$slug"
                params={{ slug: art.slug }}
                className="bg-white rounded-2xl border border-border p-6 flex gap-5 hover:border-brand-200 hover:shadow-md transition-all group block"
              >
                <div className="text-4xl flex-shrink-0 mt-1">{art.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">{art.cat}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{art.readTime} read</span>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 leading-snug group-hover:text-brand-700 transition-colors">{art.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">{art.excerpt}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />{art.expert}
                    </span>
                    <span className="text-sm font-semibold text-brand-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Expert CTA */}
        <div className="mt-14 bg-gradient-to-r from-brand-600 to-violet-600 rounded-3xl p-8 text-white text-center">
          <Heart className="w-10 h-10 text-white/70 mx-auto mb-4 fill-current" />
          <h3 className="font-display font-bold text-2xl mb-3">Need Personal Guidance?</h3>
          <p className="text-white/80 max-w-lg mx-auto mb-6 text-sm">
            Gold and Elite subscribers get direct access to certified relationship counsellors for one-on-one sessions. No extra charge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register" className="bg-white text-brand-700 font-bold px-8 py-3 rounded-full hover:bg-brand-50 transition-colors inline-flex items-center gap-2">
              Register to Access <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="border border-white/40 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

