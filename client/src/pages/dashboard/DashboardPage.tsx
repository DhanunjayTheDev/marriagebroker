import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, Eye, MessageCircle, Phone, Calendar, TrendingUp,
  Sparkles, ShieldCheck, Award, ArrowRight, Star, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { matchService, interestService, meetingService, chatService } from '../../services';
import { ScoreRing } from '../../components/common/ScoreRing';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileGridSkeleton } from '../../components/common/Skeleton';
import { cn } from '../../lib/utils';
import type { Match, MatchedUser } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', 'dashboard'],
    queryFn: () => matchService.getMatches(1, 4),
  });

  const { data: interestsData } = useQuery({
    queryKey: ['interests', 'dashboard'],
    queryFn: () => interestService.getInterests('received', 'pending', 1, 1),
  });

  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', 'dashboard'],
    queryFn: () => chatService.getConversations(),
  });

  const { data: meetingsData } = useQuery({
    queryKey: ['meetings', 'dashboard'],
    queryFn: () => meetingService.getMeetings(),
  });

  const matches = (matchesData?.data ?? []) as Match[];
  const completionScore = user?.profile.completionScore ?? 0;
  const isProfileIncomplete = completionScore < 80;

  const newInterestsCount = (interestsData as any)?.pagination?.total ?? 0;
  const unreadMessagesCount = ((conversationsData?.data ?? []) as any[]).reduce(
    (sum: number, c: any) => sum + (c.unreadCount?.[user?.id ?? ''] ?? 0), 0,
  );
  const meetingsCount = ((meetingsData?.data ?? []) as any[]).filter(
    (m: any) => m.status === 'confirmed' || m.status === 'pending',
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-maroon p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gold-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm">Welcome back,</p>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-white mt-1">
              {user?.firstName} {user?.lastName} 👋
            </h1>
            <p className="text-white/70 text-sm mt-2">
              {matches.length > 0
                ? `You have ${matches.length} new compatible matches waiting!`
                : 'Complete your profile to get personalized matches.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/matches"
              className="bg-white text-brand-800 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gold-50 transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              View Matches
            </Link>
            <Link
              to="/search"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors"
            >
              Advanced Search
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Profile completion alert */}
      {isProfileIncomplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4"
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">
              Your profile is {completionScore}% complete
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300/70">
              Profiles with 80%+ completeness get 5x more matches. Complete now!
            </p>
          </div>
          <Link
            to="/onboarding"
            className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Complete Profile
          </Link>
        </motion.div>
      )}

      {/* Score widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreWidget
          icon={TrendingUp}
          title="Profile Strength"
          score={user?.profile.profileStrengthScore ?? completionScore}
          color="brand"
        />
        <ScoreWidget
          icon={ShieldCheck}
          title="Trust Score"
          score={user?.profile.trustScore ?? 0}
          color="emerald"
        />
        <ScoreWidget
          icon={Award}
          title="Profile Completion"
          score={completionScore}
          color="gold"
        />
        <StatWidget
          icon={Eye}
          title="Profile Views"
          value="—"
          subtitle="This week"
          color="sky"
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat icon={Heart}         label="New Interests" value={newInterestsCount}   to="/interests" color="rose" />
        <QuickStat icon={MessageCircle} label="Unread Chats"  value={unreadMessagesCount} to="/chat"      color="sky" />
        <QuickStat icon={Phone}         label="Calls"         value={0}                   to="/calls"     color="violet" />
        <QuickStat icon={Calendar}      label="Meetings"      value={meetingsCount}        to="/meetings"  color="amber" />
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-700" />
            <h2 className="font-display font-semibold text-xl">AI-Recommended Matches</h2>
          </div>
          <Link to="/matches" className="text-sm text-brand-700 font-medium hover:underline flex items-center gap-1">
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {matchesLoading ? (
          <ProfileGridSkeleton count={4} />
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {matches.map((match, i) => {
              const matchedUser = match.matchedUserId as MatchedUser;
              if (typeof matchedUser !== 'object') return null;
              return (
                <ProfileCard
                  key={match._id}
                  userId={matchedUser._id}
                  user={matchedUser}
                  matchScore={match.score}
                  variant="compact"
                  index={i}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No matches yet</h3>
            <p className="text-sm text-slate-500 mb-4">
              Complete your profile and preferences to get AI-powered matches.
            </p>
            <Link to="/onboarding" className="btn-luxury inline-flex text-sm px-5 py-2.5">
              Complete Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const ScoreWidget: React.FC<{ icon: React.ElementType; title: string; score: number; color: string }> = ({
  icon: Icon, title, score, color,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
  >
    <ScoreRing score={score} size="sm" />
    <div>
      <p className="text-xs text-slate-500">{title}</p>
      <p className="font-display font-bold text-lg">{score}%</p>
    </div>
  </motion.div>
);

const StatWidget: React.FC<{ icon: React.ElementType; title: string; value: string; subtitle: string; color: string }> = ({
  icon: Icon, title, value, subtitle, color,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl border border-border p-4"
  >
    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30`)}>
      <Icon className="w-4.5 h-4.5" />
    </div>
    <p className="font-display font-bold text-2xl">{value}</p>
    <p className="text-xs text-slate-500">{title} · {subtitle}</p>
  </motion.div>
);

const QuickStat: React.FC<{ icon: React.ElementType; label: string; value: number; to: string; color: string }> = ({
  icon: Icon, label, value, to, color,
}) => (
  <Link to={to}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card rounded-2xl border border-border p-4 hover:shadow-card-hover transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30`)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-display font-bold text-2xl">{value}</span>
      </div>
      <p className="text-sm text-slate-500 mt-2">{label}</p>
    </motion.div>
  </Link>
);

