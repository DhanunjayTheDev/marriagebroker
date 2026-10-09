import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Sparkles, RefreshCw, LayoutGrid, List, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { matchService, interestService } from '../../services';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileGridSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { cn } from '../../lib/utils';
import type { Match, MatchedUser } from '../../types';

const TABS = [
  { key: 'all', label: 'All Matches', icon: Heart },
  { key: 'ai', label: 'AI Recommended', icon: Sparkles },
  { key: 'high', label: 'Highly Compatible' },
  { key: 'recent', label: 'Recently Active' },
  { key: 'verified', label: 'Verified Only' },
];

export const MatchesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['matches', activeTab],
    queryFn: ({ pageParam = 1 }) => matchService.getMatches(pageParam, 20, activeTab),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext ? (lastPage.pagination.page + 1) : undefined,
  });

  const refreshMutation = useMutation({
    mutationFn: () => matchService.refreshMatches(),
    onSuccess: () => {
      toast.success('Refreshing your matches check back in a moment!');
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['matches'] }), 3000);
    },
  });

  const interestMutation = useMutation({
    mutationFn: (receiverId: string) => interestService.sendInterest(receiverId),
    onSuccess: () => toast.success('Interest sent! 💝'),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to send interest'),
  });

  const allMatches = (data?.pages.flatMap((p) => p.data ?? []) ?? []) as Match[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl">Your Matches</h1>
          <p className="text-slate-500 text-sm mt-1">
            {allMatches.length} compatible profiles found for you
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', refreshMutation.isPending && 'animate-spin')} />
            Refresh
          </button>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setView('grid')}
              className={cn('p-2 rounded-lg transition-colors', view === 'grid' ? 'bg-white dark:bg-card shadow-sm' : 'text-slate-500')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-white dark:bg-card shadow-sm' : 'text-slate-500')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.key
                ? 'bg-gradient-maroon text-white shadow-maroon'
                : 'bg-muted text-slate-500 hover:text-foreground'
            )}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <ProfileGridSkeleton count={8} />
      ) : allMatches.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No matches found yet"
          description="Complete your profile and partner preferences to start receiving AI-powered matches."
          action={
            <button onClick={() => refreshMutation.mutate()} className="btn-luxury text-sm px-5 py-2.5">
              Generate Matches
            </button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allMatches.map((match, i) => {
            const u = match.matchedUserId as MatchedUser;
            if (typeof u !== 'object') return null;
            return (
              <ProfileCard
                key={match._id}
                userId={u._id}
                user={u}
                matchScore={match.score}
                variant="compact"
                index={i % 20}
                onSendInterest={() => interestMutation.mutate(u._id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {allMatches.map((match, i) => {
            const u = match.matchedUserId as MatchedUser;
            if (typeof u !== 'object') return null;
            return (
              <ProfileCard
                key={match._id}
                userId={u._id}
                user={u}
                matchScore={match.score}
                variant="list"
                index={i % 20}
                onSendInterest={() => interestMutation.mutate(u._id)}
              />
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More Matches'}
          </button>
        </div>
      )}
    </div>
  );
};

