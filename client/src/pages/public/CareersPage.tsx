import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, Heart, Sparkles, Users, Coffee, Laptop, TrendingUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const PERKS = [
  { icon: Heart, title: 'Meaningful Work', detail: 'You\'re helping families find happiness. Every line of code, every support call, every match it matters.' },
  { icon: TrendingUp, title: 'Fast Growth', detail: 'We\'re growing 40% year-on-year. Early team members grow with the company and take on increasing responsibility.' },
  { icon: Laptop, title: 'Remote-Friendly', detail: 'Most roles are hybrid (2 days office). Full-remote options available for engineering positions.' },
  { icon: Coffee, title: 'Great Culture', detail: 'Monthly team lunches, Diwali bonuses, learning budgets, and a team that genuinely celebrates wins together.' },
  { icon: Users, title: 'Diverse Team', detail: '200+ team members across 8 states speaking 10 languages. Inclusion is built in, not bolted on.' },
  { icon: Sparkles, title: 'AI & Innovation', detail: 'Work on cutting-edge matching algorithms, NLP for profile analysis, and computer vision for verification.' },
];

const JOBS = [
  {
    title: 'Senior React Engineer',
    dept: 'Engineering', location: 'Hyderabad / Remote', type: 'Full-time', experience: '4–7 years',
    description: 'Build and scale our consumer-facing web platform. Work with React 19, TanStack Router, Tailwind CSS, and a high-traffic Mongoose/Express backend.',
    skills: ['React', 'TypeScript', 'TanStack Query', 'Tailwind CSS', 'REST APIs'],
  },
  {
    title: 'ML Engineer Recommender Systems',
    dept: 'AI & Data', location: 'Hyderabad', type: 'Full-time', experience: '3–6 years',
    description: 'Improve our compatibility scoring engine trained on 10 lakh successful marriages. Design experiments, run A/B tests, and deploy models to production.',
    skills: ['Python', 'PyTorch / TensorFlow', 'Feature Engineering', 'MLflow', 'SQL'],
  },
  {
    title: 'Relationship Manager',
    dept: 'Customer Success', location: 'Hyderabad / Bangalore / Chennai', type: 'Full-time', experience: '2–5 years',
    description: 'Help premium members navigate their matrimonial journey. Counsel families, shortlist profiles, and facilitate introductions with empathy and professionalism.',
    skills: ['People Skills', 'Telugu / Tamil / Kannada', 'CRM Tools', 'Conflict Resolution'],
  },
  {
    title: 'Product Designer (UI/UX)',
    dept: 'Design', location: 'Hyderabad / Remote', type: 'Full-time', experience: '3–5 years',
    description: 'Own end-to-end product design for our mobile and web experiences. Run user research, create prototypes, and work alongside engineers to ship polished UI.',
    skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Mobile-first'],
  },
  {
    title: 'Trust & Safety Analyst',
    dept: 'Operations', location: 'Hyderabad', type: 'Full-time', experience: '1–3 years',
    description: 'Review verification documents, investigate fake profiles, and enforce our community guidelines to keep our platform safe for real seekers.',
    skills: ['Attention to Detail', 'Document Verification', 'Policy Enforcement', 'Hindi / Telugu'],
  },
  {
    title: 'Digital Marketing Manager',
    dept: 'Marketing', location: 'Hyderabad', type: 'Full-time', experience: '4–6 years',
    description: 'Lead performance marketing across Google, Meta, and influencer channels. Manage ₹2Cr+ monthly ad budget and own customer acquisition.',
    skills: ['Google Ads', 'Meta Ads', 'Analytics', 'SEO', 'Budget Management'],
  },
];

const DEPTS = ['All', 'Engineering', 'AI & Data', 'Design', 'Customer Success', 'Operations', 'Marketing'];

export const CareersPage: React.FC = () => {
  const [dept, setDept] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);
  const filtered = dept === 'All' ? JOBS : JOBS.filter((j) => j.dept === dept);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-brand-50/60 via-white to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-0 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl" />
        </div>
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Join Our Team
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-5 leading-tight">
              Build Technology That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-violet-600">
                Changes Lives
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              At Avyuktha, your work isn't abstract. Every feature you build, every algorithm you tune, every person you support you're directly helping real families find happiness.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white border border-border rounded-full px-4 py-2">📍 Hyderabad HQ</span>
              <span className="bg-white border border-border rounded-full px-4 py-2">💼 200+ Team Members</span>
              <span className="bg-white border border-border rounded-full px-4 py-2">🚀 40% YoY Growth</span>
              <span className="bg-white border border-border rounded-full px-4 py-2">🌐 Hybrid / Remote</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container">
          <h2 className="font-display font-bold text-2xl mb-8 text-center">Why Avyuktha?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-border p-5 flex gap-4"
                >
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-20 container">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <h2 className="font-display font-bold text-3xl">Open Positions</h2>
          <span className="text-sm text-slate-500">{filtered.length} role{filtered.length !== 1 ? 's' : ''} open</span>
        </div>

        {/* Dept filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DEPTS.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={cn(
                'text-xs font-semibold px-4 py-2 rounded-full transition-colors',
                dept === d ? 'bg-brand-600 text-white' : 'bg-muted text-slate-500 hover:bg-accent'
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((job, i) => (
            <motion.div
              key={job.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/20 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <span className="font-display font-bold text-base">{job.title}</span>
                    <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full font-semibold">{job.dept}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.experience}</span>
                  </div>
                </div>
                <ChevronDown className={cn('w-5 h-5 text-slate-500 flex-shrink-0 transition-transform', expanded === i && 'rotate-180')} />
              </button>

              {expanded === i && (
                <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                  <p className="text-sm text-slate-500 leading-relaxed">{job.description}</p>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((s) => (
                        <span key={s} className="text-xs bg-muted text-brand-950 px-3 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                  <a
                    href={`mailto:careers@avyuktha.com?subject=Application: ${job.title}`}
                    className="inline-flex items-center gap-2 btn-luxury text-sm px-6 py-2.5"
                  >
                    Apply via Email
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-brand-50 rounded-3xl border border-brand-200 p-8 text-center">
          <h3 className="font-display font-bold text-xl mb-2">Don't see the right role?</h3>
          <p className="text-slate-500 text-sm mb-5 max-w-lg mx-auto">
            We're always looking for exceptional people. Send your resume and a note about what you'd like to contribute.
          </p>
          <a
            href="mailto:careers@avyuktha.com"
            className="btn-luxury px-8 py-3"
          >
            Send Open Application
          </a>
        </div>
      </section>
    </div>
  );
};

