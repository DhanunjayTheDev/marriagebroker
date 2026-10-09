import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Heart, MessageCircle, CheckCheck, Phone, CreditCard, ShieldCheck } from 'lucide-react';
import { notificationService } from '../../services';
import { EmptyState } from '../../components/common/EmptyState';
import { ListItemSkeleton } from '../../components/common/Skeleton';
import { cn, formatDate } from '../../lib/utils';
import type { Notification } from '../../types';

const ICON_MAP: Record<string, React.ElementType> = {
  interest_received: Heart, interest_accepted: Heart, message_received: MessageCircle,
  call_incoming: Phone, call_missed: Phone, payment_success: CreditCard,
  verification_approved: ShieldCheck, default: Bell,
};

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(1, 50),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = (data?.data ?? []) as Notification[];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated on your matches and activity</p>
        </div>
        <button onClick={() => markAllMutation.mutate()} className="flex items-center gap-2 text-sm text-brand-700 font-medium hover:underline">
          <CheckCheck className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => <ListItemSkeleton key={i} />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {notifications.map((notif, i) => {
            const Icon = ICON_MAP[notif.type] ?? ICON_MAP.default;
            return (
              <motion.button
                key={notif._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !notif.isRead && markReadMutation.mutate(notif._id)}
                className={cn('w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors', !notif.isRead && 'bg-brand-50/50 dark:bg-brand-900/10')}
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', notif.isRead ? 'bg-muted text-slate-500' : 'bg-brand-100 text-brand-700')}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !notif.isRead && 'font-semibold')}>{notif.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{notif.body}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(notif.createdAt, 'relative')}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-700 flex-shrink-0 mt-2" />}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

