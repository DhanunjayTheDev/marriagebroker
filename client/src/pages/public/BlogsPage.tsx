import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Tag, BookOpen, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cmsService } from '../../services';
import { cn } from '../../lib/utils';

const STATIC_ARTICLES = [
  {
    _id: 's1', slug: 'how-to-write-a-matrimony-profile',
    category: 'Profile Tips',
    title: 'How to Write a Matrimony Profile That Gets Responses',
    excerpt: "Your matrimony profile is the first impression you make. Here's a step-by-step guide to writing an honest, compelling profile that attracts compatible matches.",
    readTime: '5 min', publishedAt: '2024-11-10', featured: true,
    tags: ['Profile', 'Tips', 'Getting Started'],
  },
  {
    _id: 's2', slug: 'understanding-gun-milan-kundli-matching',
    category: 'Astrology',
    title: 'Gun Milan Explained: What a High Kundli Score Actually Means',
    excerpt: "Many families put great weight on the Ashta Koota score, but what does a 28/36 really tell you? A certified astrologer explains each Koota and its real significance.",
    readTime: '8 min', publishedAt: '2024-11-03', featured: true,
    tags: ['Astrology', 'Kundli', 'Compatibility'],
  },
  {
    _id: 's3', slug: 'first-meeting-tips-matrimony',
    category: 'Relationship',
    title: '10 Things to Discuss at Your First Meeting (That Most People Skip)',
    excerpt: "The first face-to-face meeting after online connection is crucial. Go beyond family background these questions reveal genuine compatibility before you get too emotionally invested.",
    readTime: '6 min', publishedAt: '2024-10-28',
    tags: ['Meeting', 'Relationship', 'Compatibility'],
  },
  {
    _id: 's4', slug: 'nri-matrimony-challenges',
    category: 'NRI',
    title: 'NRI Matrimony: 7 Challenges and How to Navigate Them',
    excerpt: "Marrying someone settled abroad comes with unique challenges visa timelines, cultural adjustment, family distance. Couples who made it work share their advice.",
    readTime: '7 min', publishedAt: '2024-10-20',
    tags: ['NRI', 'Abroad', 'Planning'],
  },
  {
    _id: 's5', slug: 'inter-caste-marriage-family-acceptance',
    category: 'Relationship',
    title: 'Inter-Caste Marriages: Getting Family Acceptance Without Conflict',
    excerpt: "More Indian couples are choosing partners across caste lines. Three couples who did it successfully share how they brought their families onboard.",
    readTime: '9 min', publishedAt: '2024-10-14',
    tags: ['Inter-caste', 'Family', 'Modern India'],
  },
  {
    _id: 's6', slug: 'red-flags-matrimony-profiles',
    category: 'Safety',
    title: '8 Red Flags in Matrimony Profiles You Should Never Ignore',
    excerpt: "Vague income claims, no family photo, reluctance to video call learn to spot the patterns that suggest a profile may not be authentic.",
    readTime: '4 min', publishedAt: '2024-10-07',
    tags: ['Safety', 'Verification', 'Tips'],
  },
  {
    _id: 's7', slug: 'telugu-wedding-traditions',
    category: 'Culture',
    title: 'A Complete Guide to Telugu Wedding Traditions and Rituals',
    excerpt: "From Pellikoduku to Saptapadi a detailed walkthrough of every ritual in a traditional Telugu Hindu wedding and what each ceremony symbolises.",
    readTime: '11 min', publishedAt: '2024-09-30',
    tags: ['Telugu', 'Wedding', 'Culture', 'Traditions'],
  },
  {
    _id: 's8', slug: 'managing-family-pressure-marriage',
    category: 'Mental Health',
    title: 'How to Manage Family Pressure Around Marriage Without Losing Yourself',
    excerpt: "When parents are anxious, conversations become arguments. A counsellor shares communication strategies that help bridge the gap between what families want and what you need.",
    readTime: '7 min', publishedAt: '2024-09-22',
    tags: ['Mental Health', 'Family', 'Communication'],
  },
  {
    _id: 's9', slug: 'background-verification-matrimony',
    category: 'Safety',
    title: "Why Background Verification Matters in Matrimony (And How It Works)",
    excerpt: "In an era of curated profiles, how do you know what's real? We explain the layers of verification on Avyuktha and why some checks matter more than others.",
    readTime: '5 min', publishedAt: '2024-09-15',
    tags: ['Safety', 'Verification', 'Trust'],
  },
];

const CATEGORIES = ['All', 'Profile Tips', 'Astrology', 'Relationship', 'Safety', 'Culture', 'NRI', 'Mental Health'];

export const BlogsPage: React.FC = () => {
  const [activeCat, setActiveCat] = useState('All');

  const { data: cmsData } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => cmsService.getBlogs(),
    retry: false,
  });

  const cmsBlogs = ((cmsData?.data as { data?: typeof STATIC_ARTICLES } | undefined)?.data) ?? [];
  const allArticles = cmsBlogs.length > 0 ? cmsBlogs : STATIC_ARTICLES;

  const featured = allArticles.filter((a: any) => a.featured);
  const filtered = activeCat === 'All'
    ? allArticles
    : allArticles.filter((a: any) => a.category === activeCat);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="pt-28 pb-14 bg-gradient-to-b from-brand-50/50 via-white to-white">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Avyuktha Blog
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-5">
              Advice, Insights & Stories
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Expert guidance on finding your partner, understanding Indian marriage traditions, relationship health, and more.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h2 className="font-display font-bold text-xl">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.slice(0, 2).map((art: any, i: number) => (
                <motion.div
                  key={art._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to="/blogs/$slug"
                    params={{ slug: art.slug }}
                    className="bg-white rounded-3xl border border-border overflow-hidden group hover:shadow-lg transition-all block"
                  >
                    <div className="h-48 bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-brand-300" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">{art.category}</span>
                        {art.readTime && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{art.readTime} read</span>}
                      </div>
                      <h3 className="font-display font-bold text-xl mb-3 leading-snug group-hover:text-brand-700 transition-colors">{art.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{art.excerpt}</p>
                      <div className="flex items-center text-sm font-semibold text-brand-700 gap-1 group-hover:gap-2 transition-all">
                        Read article <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={cn(
                'text-xs font-semibold px-4 py-2 rounded-full transition-colors',
                activeCat === cat ? 'bg-brand-600 text-white' : 'bg-muted text-slate-500 hover:bg-accent'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((art: any, i: number) => (
            <motion.div
              key={art._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/blogs/$slug"
                params={{ slug: art.slug }}
                className="bg-white rounded-2xl border border-border p-5 hover:border-brand-200 hover:shadow-md transition-all group block"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">{art.category}</span>
                  {art.readTime && (
                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />{art.readTime}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">{art.excerpt}</p>
                {art.tags && (
                  <div className="flex flex-wrap gap-1">
                    {art.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="text-[10px] flex items-center gap-0.5 text-slate-500">
                        <Tag className="w-2.5 h-2.5" />{t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

