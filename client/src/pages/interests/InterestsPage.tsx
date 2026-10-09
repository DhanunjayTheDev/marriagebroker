import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Send, Inbox, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { interestService } from '../../services';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { ListItemSkeleton } from '../../components/common/Skeleton';
import { INTEREST_STAGE_LABELS } from '../../constants';
import { cn, formatDate } from '../../lib/utils';
import type { Interest, User } from '../../types';
import { Link } from '@tanstack/react-router';

const TABS = [
  { key: 'received', label: 'Received', icon: Inbox },
  { key: 'sent', label: 'Sent', icon: Send },
];

const STAGE_STEPS = ['sent', 'accepted', 'chat_started', 'voice_called', 'meeting_scheduled', 'engaged', 'married'];

export const InterestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  const { data, isLoading } = useQuery({
    queryKey: ['interests', tab],
    queryFn: () => interestService.getInterests(tab),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      interestService.respondToInterest(id, action),
    onSuccess: (_, { action }) => {
      toast.success(action === 'accept' ? 'Interest accepted! 💝' : 'Interest declined');
      queryClient.invalidateQueries({ queryKey: ['interests'] });
    },
  });

  const interests = (data?.data ?? []) as Interest[];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl">Interests</h1>
        <p className="text-slate-500 text-sm mt-1">Manage interests sent and received</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'received' | 'sent')}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key ? 'bg-white dark:bg-card shadow-sm text-brand-700' : 'text-slate-500'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-card rounded-2xl border border-border"><ListItemSkeleton /></div>)}</div>
      ) : interests.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={`No ${tab} interests`}
          description={tab === 'received' ? 'When someone sends you interest, it appears here.' : 'Interests you send appear here.'}
          action={<Link to="/matches" className="btn-luxury text-sm px-5 py-2.5">Browse Matches</Link>}
        />
      ) : (
        <div className="space-y-3">
          {interests.map((interest, i) => {
            const person = (tab === 'received' ? interest.senderId : interest.receiverId) as Partial<User>;
            return (
              <motion.div
                key={interest._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <Link to="/profile/$userId" params={{ userId: person._id ?? '' }}>
                    <Avatar src={person.profile?.photoUrl} name={`${person.firstName ?? ''} ${person.lastName ?? ''}`} size="lg" verified={person.profile?.verificationBadge} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to="/profile/$userId" params={{ userId: person._id ?? '' }} className="font-semibold hover:text-brand-700 transition-colors">
                      {person.firstName} {person.lastName}
                    </Link>
                    {interest.message && <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">"{interest.message}"</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        interest.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        interest.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      )}>
                        {INTEREST_STAGE_LABELS[interest.status] ?? interest.status}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(interest.createdAt, 'relative')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {tab === 'received' && interest.status === 'sent' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondMutation.mutate({ id: interest._id, action: 'accept' })}
                        className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ id: interest._id, action: 'decline' })}
                        className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {interest.status === 'accepted' && (
                    <Link to="/chat" className="btn-luxury text-xs px-4 py-2">Chat Now</Link>
                  )}
                </div>

                {/* Stage progress */}
                {['accepted', 'chat_started', 'voice_called', 'meeting_scheduled', 'engaged'].includes(interest.currentStage) && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-1">
                    {STAGE_STEPS.map((stage, idx) => {
                      const currentIdx = STAGE_STEPS.indexOf(interest.currentStage);
                      const done = idx <= currentIdx;
                      return (
                        <React.Fragment key={stage}>
                          <div className={cn('w-2 h-2 rounded-full', done ? 'bg-brand-700' : 'bg-muted')} />
                          {idx < STAGE_STEPS.length - 1 && <div className={cn('flex-1 h-0.5', idx < currentIdx ? 'bg-brand-700' : 'bg-muted')} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

