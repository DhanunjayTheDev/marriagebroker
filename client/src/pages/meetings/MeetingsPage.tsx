import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Calendar, Video, Users, MapPin, Clock, Plus, Loader2 } from 'lucide-react';
import { meetingService } from '../../services';
import { EmptyState } from '../../components/common/EmptyState';
import { cn, formatDate } from '../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '../../components/ui/sheet';
import type { Meeting } from '../../types';

const TYPE_ICON = { video: Video, family: Users, physical: MapPin };

interface ScheduleFormData {
  participantId: string;
  type: 'video' | 'family' | 'physical';
  scheduledAt: string;
  duration: number;
  location?: string;
  notes?: string;
}

const ScheduleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ScheduleFormData>({
    defaultValues: { type: 'video', duration: 30 },
  });
  const meetingType = watch('type');

  const scheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => meetingService.scheduleMeeting(data),
    onSuccess: () => {
      toast.success('Meeting scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to schedule meeting'),
  });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Schedule Meeting</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit((d) => scheduleMutation.mutate(d))} className="contents">
        <SheetBody className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Partner's User ID *
            </label>
            <input
              {...register('participantId', { required: 'Partner ID is required' })}
              placeholder="Paste user ID from their profile"
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
            />
            {errors.participantId && (
              <p className="text-xs text-red-500 mt-1">{errors.participantId.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Meeting Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['video', 'family', 'physical'] as const).map((t) => {
                const Icon = TYPE_ICON[t];
                return (
                  <label
                    key={t}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 cursor-pointer transition-all',
                      meetingType === t ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-200',
                    )}
                  >
                    <input type="radio" value={t} {...register('type')} className="hidden" />
                    <Icon className={cn('w-5 h-5', meetingType === t ? 'text-brand-700' : 'text-slate-400')} />
                    <span className={cn('text-xs font-medium capitalize', meetingType === t ? 'text-brand-700' : 'text-slate-600')}>
                      {t}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Date & Time *</label>
              <input
                type="datetime-local"
                {...register('scheduledAt', { required: 'Date and time required' })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
              />
              {errors.scheduledAt && <p className="text-xs text-red-500 mt-1">{errors.scheduledAt.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Duration</label>
              <Select value={String(watch('duration'))} onValueChange={(v) => setValue('duration', Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 60, 90].map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {meetingType === 'physical' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Location</label>
              <input
                {...register('location')}
                placeholder="Cafe, restaurant, or address"
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes (optional)</label>
            <textarea
              {...register('notes')}
              placeholder="Any additional details..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors resize-none"
            />
          </div>
        </SheetBody>

        <SheetFooter>
          <button
            type="submit"
            disabled={scheduleMutation.isPending}
            className="btn-luxury w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {scheduleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Schedule Meeting
          </button>
        </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export const MeetingsPage: React.FC = () => {
  const [showSchedule, setShowSchedule] = useState(false);
  const { data } = useQuery({ queryKey: ['meetings'], queryFn: () => meetingService.getMeetings() });
  const meetings = (data?.data ?? []) as Meeting[];

  return (
    <>
      <AnimatePresence>
        {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}
      </AnimatePresence>

      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl">Meetings</h1>
            <p className="text-slate-500 text-sm mt-1">Schedule and manage your meetings</p>
          </div>
          <button
            onClick={() => setShowSchedule(true)}
            className="btn-luxury flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No meetings scheduled"
            description="Schedule a meeting with one of your matches to take the next step."
            action={
              <button onClick={() => setShowSchedule(true)} className="btn-luxury text-sm px-5 py-2.5">
                Schedule First Meeting
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const Icon = TYPE_ICON[meeting.type] ?? Calendar;
              return (
                <motion.div
                  key={meeting._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-700 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm capitalize">{meeting.type} Meeting</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDate(meeting.scheduledAt, 'long')} · {meeting.duration} min
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium capitalize',
                    meeting.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700',
                  )}>
                    {meeting.status}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
