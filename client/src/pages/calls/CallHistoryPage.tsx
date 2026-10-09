import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { callService } from '../../services';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { cn, formatDate } from '../../lib/utils';
import type { Call, User } from '../../types';

export const CallHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ['calls'], queryFn: () => callService.getHistory() });
  const calls = (data?.data ?? []) as Call[];

  const formatDuration = (s: number) => {
    if (!s) return '—';
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl">Call History</h1>
        <p className="text-slate-500 text-sm mt-1">Your voice and video calls</p>
      </div>

      {calls.length === 0 ? (
        <EmptyState icon={Phone} title="No calls yet" description="Your call history will appear here." />
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {calls.map((call) => {
            const isOutgoing = (typeof call.callerId === 'string' ? call.callerId : call.callerId._id) === user?.id;
            const peer = (isOutgoing ? call.receiverId : call.callerId) as Partial<User>;
            const missed = call.status === 'missed' || call.status === 'declined';
            const Icon = missed ? PhoneMissed : isOutgoing ? PhoneOutgoing : PhoneIncoming;
            return (
              <div key={call._id} className="flex items-center gap-3 p-4">
                <Avatar src={peer.profile?.photoUrl} name={`${peer.firstName ?? ''} ${peer.lastName ?? ''}`} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{peer.firstName} {peer.lastName}</div>
                  <div className={cn('flex items-center gap-1 text-xs', missed ? 'text-red-500' : 'text-slate-500')}>
                    <Icon className="w-3 h-3" />
                    {call.type === 'video' ? 'Video' : 'Voice'} · {formatDate(call.createdAt, 'relative')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{formatDuration(call.durationSeconds)}</div>
                  {call.type === 'video' ? <Video className="w-4 h-4 text-slate-500 ml-auto mt-1" /> : <Phone className="w-4 h-4 text-slate-500 ml-auto mt-1" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

