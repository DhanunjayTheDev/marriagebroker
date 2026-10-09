import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, Star, Quote, ArrowRight } from 'lucide-react';
import { successStoryService } from '../../services';
import { formatDate } from '../../lib/utils';
import { Link } from '@tanstack/react-router';
import type { SuccessStory } from '../../types';

const STATIC_STORIES = [
  {
    _id: 's1',
    title: 'Arjun & Deepika',
    story: 'We matched on Avyuktha in March 2023. Arjun reached out first his profile mentioned that he reads the same obscure South Indian literature I do. What started as a 20-minute call turned into a 3-hour conversation. Six months later we were engaged in Hyderabad with both families present. The AI match score was 91%. We now know why.',
    location: 'Hyderabad â†’ Bangalore',
    marriageDate: '2024-01-15',
    duration: 'Married in 9 months',
    rating: 5,
    tags: ['Telugu', 'Software Engineer', 'Cross-city'],
  },
  {
    _id: 's2',
    title: 'Karthik & Priya',
    story: 'I was skeptical about matrimony sites. My mother insisted I try Avyuktha. Priya\'s profile stood out she had listed her grandmother\'s recipes in the hobbies section. That was the detail that made me write to her. The verification system gave both families confidence. Our wedding was in Chennai with 400 guests and it still feels like a dream.',
    location: 'Chennai',
    marriageDate: '2023-10-08',
    duration: 'Married in 7 months',
    rating: 5,
    tags: ['Tamil Brahmin', 'Doctor', 'Family Match'],
  },
  {
    _id: 's3',
    title: 'Rahul & Sneha',
    story: 'Both of us were settled in the UK and didn\'t want to compromise on cultural values while being open to modern relationships. Avyuktha\'s NRI section had genuinely compatible profiles. We video-called for two months before our families met in Pune. The relationship manager assigned to our case was exceptional she guided both sides through the process without pressure.',
    location: 'London â†’ Pune (Home)',
    marriageDate: '2024-04-22',
    duration: 'Married in 11 months',
    rating: 5,
    tags: ['NRI', 'Marathi', 'Long Distance'],
  },
  {
    _id: 's4',
    title: 'Vikram & Ananya',
    story: 'We had the same kundli dosha both had Mangal dosha. That actually became a conversation starter. Ananya joked in her first message that we were probably astrologically destined to find each other here. She was right. Our priest confirmed a 32/36 Gun Milan score. The families were delighted. We got married in Mysore in a ceremony that lasted four days.',
    location: 'Mysore',
    marriageDate: '2023-12-03',
    duration: 'Married in 8 months',
    rating: 5,
    tags: ['Kannada', 'Kundli Match', 'Traditional'],
  },
  {
    _id: 's5',
    title: 'Suresh & Kavitha',
    story: 'I was 38 and thought I had missed my window. My sister registered me on Avyuktha without telling me and filled in my profile. When I found out, I was annoyed until I saw Kavitha\'s profile. She was 36, a professor in Coimbatore, never married. We bonded over our shared view that age was not a barrier. We proved everyone right.',
    location: 'Coimbatore',
    marriageDate: '2024-06-17',
    duration: 'Married in 5 months',
    rating: 5,
    tags: ['Tamil', 'Second Chance', 'Late Marriage'],
  },
  {
    _id: 's6',
    title: 'Arun & Meghana',
    story: 'What I appreciated was that Avyuktha\'s profile format asked the right questions. Not just salary and city but values, expectations about in-laws, views on children. Meghana and I had answered nearly identically on all those questions. When we finally met in Hyderabad over filter coffee, it felt like catching up with an old friend.',
    location: 'Hyderabad',
    marriageDate: '2024-02-29',
    duration: 'Married in 6 months',
    rating: 5,
    tags: ['Telugu', 'Values Match', 'Modern Couple'],
  },
];

const STATS = [
  { value: '10 Lakh+', label: 'Marriages Facilitated' },
  { value: '4.8â˜…', label: 'Average Rating' },
  { value: '93%', label: 'Match Satisfaction' },
  { value: '6 Months', label: 'Average Time to Match' },
];

export const SuccessStoriesPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['success-stories'],
    queryFn: () => successStoryService.getStories(),
    retry: false,
  });

  const apiStories = ((data?.data as { data?: SuccessStory[] } | undefined)?.data) ?? [];
  const stories = apiStories.length > 0 ? apiStories : STATIC_STORIES;
  const isStatic = apiStories.length === 0;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="pt-28 pb-14 bg-gradient-to-b from-rose-50/50 via-white to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-10 w-72 h-72 bg-brand-100/20 rounded-full blur-3xl" />
        </div>
        <div className="container text-center relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-rose-700 bg-rose-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Success Stories
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-5">
              Real Couples,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-brand-600">
                Real Love Stories
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Thousands of families found happiness through Avyuktha. Here are some of their stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-y border-border py-8 mb-14">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-brand-700 mb-1">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {(isStatic ? STATIC_STORIES : stories as any[]).map((story: any, i: number) => {
            const id = story._id;
            const isOpen = expanded === id;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-3xl border border-border overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-7 h-7 text-white fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-xl">{story.title || `Story #${i + 1}`}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {story.location && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{story.location}
                          </span>
                        )}
                        {(story.marriageDate || story.duration) && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {story.marriageDate ? formatDate(story.marriageDate, 'long') : story.duration}
                          </span>
                        )}
                      </div>
                      {story.rating && (
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: story.rating }).map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {story.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {story.tags.map((t: string) => (
                        <span key={t} className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Story text */}
                <div className="px-6 pb-6">
                  <div className="relative">
                    <Quote className="w-6 h-6 text-brand-200 absolute -top-1 -left-1" />
                    <p className={`text-sm text-slate-500 leading-relaxed pl-5 ${!isOpen ? 'line-clamp-3' : ''}`}>
                      {story.story}
                    </p>
                  </div>
                  {story.story && story.story.length > 200 && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : id)}
                      className="text-xs font-semibold text-brand-700 mt-2 hover:underline"
                    >
                      {isOpen ? 'Read less' : 'Read full story'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-rose-600 to-brand-600 rounded-3xl p-10 text-center text-white">
          <Heart className="w-10 h-10 text-white/60 mx-auto mb-4 fill-current" />
          <h3 className="font-display font-bold text-3xl mb-3">Your Story Could Be Next</h3>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Join over 50 lakh members who found their perfect match on Avyuktha. Your profile is free to create.
          </p>
          <Link
            to="/auth/register"
            className="bg-white text-brand-700 font-bold px-10 py-4 rounded-full hover:bg-brand-50 transition-colors inline-flex items-center gap-2 text-base"
          >
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

