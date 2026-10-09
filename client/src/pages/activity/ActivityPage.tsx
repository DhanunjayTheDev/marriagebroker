import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Circle } from 'lucide-react';
import { activityService } from '../../services';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../lib/utils';

export const ActivityPage: React.FC = () => {
  const { data } = useQuery({ queryKey: ['activity'], queryFn: () => activityService.getActivity() });
  const activities = (data?.data ?? []) as Array<{ _id: string; action: string; createdAt: string; metadata?: Record<string, unknown> }>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl">Activity Timeline</h1>
        <p className="text-slate-500 text-sm mt-1">Your complete activity history</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" description="Your actions and milestones will appear here." />
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
          {activities.map((act, i) => (
            <div key={act._id} className="relative pb-6 last:pb-0">
              <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-brand-700 ring-4 ring-background" />
              <div className="bg-card rounded-xl border border-border p-3">
                <div className="text-sm font-medium capitalize">{act.action.replace(/[._]/g, ' ')}</div>
                <div className="text-xs text-slate-500">{formatDate(act.createdAt, 'long')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

