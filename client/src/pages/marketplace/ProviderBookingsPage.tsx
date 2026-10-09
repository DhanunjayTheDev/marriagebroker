import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  BookOpen, CheckCircle, XCircle, Clock, Users, Calendar,
  Phone, ArrowLeft, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceService } from '../../services/marketplace.service';
import { useProviderStore } from '../../store/providerStore';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '../../components/ui/sheet';
import type { MarketplaceBooking } from '../../types';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_STYLES: Record<string, { badge: string; icon: React.FC<{ className?: string }> }> = {
  pending: { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  confirmed: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  cancelled: { badge: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
  completed: { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
};

// ─── Reject Reason Modal ───────────────────────────────────────────────────
interface RejectModalProps {
  bookingId: string;
  bookingNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ bookingId, bookingNumber, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const mutation = useMutation({
    mutationFn: () => marketplaceService.respondToBooking(bookingId, 'reject', reason),
    onSuccess: () => {
      toast.success('Booking rejected');
      onSuccess();
      onClose();
    },
    onError: () => toast.error('Failed to reject booking'),
  });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <SheetTitle>Reject Booking</SheetTitle>
              <p className="text-sm text-slate-500 mt-1">Booking #{bookingNumber}</p>
            </div>
          </div>
        </SheetHeader>
        <SheetBody>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Reason for rejection (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you are rejecting this booking..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors resize-none"
          />
        </SheetBody>
        <SheetFooter>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Rejecting...' : 'Reject Booking'}
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
export const ProviderBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useProviderStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; number: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: '/provider/login' });
  }, [isAuthenticated, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ['provider-bookings', activeTab, page],
    queryFn: () => marketplaceService.getMyProviderBookings({ status: activeTab || undefined, page, limit: 15 }),
    enabled: isAuthenticated,
  });

  const respData = data?.data as { bookings?: MarketplaceBooking[]; data?: MarketplaceBooking[]; pagination?: { totalPages: number; total: number } } | undefined;
  const bookings: MarketplaceBooking[] = respData?.bookings ?? respData?.data ?? [];
  const pagination = respData?.pagination;

  const confirmMutation = useMutation({
    mutationFn: (bookingId: string) => marketplaceService.respondToBooking(bookingId, 'confirm'),
    onSuccess: () => {
      toast.success('Booking confirmed!');
      qc.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
    onError: () => toast.error('Failed to confirm booking'),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <button onClick={() => navigate({ to: '/provider/dashboard' })} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="font-display font-bold text-2xl">Booking Requests</h1>
          <p className="text-white/70 text-sm mt-1">Confirm or reject booking requests from customers</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.key
                  ? 'bg-gradient-brand text-white shadow-sm'
                  : 'bg-white border border-border text-slate-500 hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-8 w-24 bg-muted rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl mb-2">No bookings found</h3>
            <p className="text-slate-500">
              {activeTab ? `No ${activeTab} bookings yet.` : 'You have no booking requests yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => {
              const statusStyle = STATUS_STYLES[booking.status];
              const StatusIcon = statusStyle?.icon ?? Clock;

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-border p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Top row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-brand-700">{booking.bookingNumber}</span>
                        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1', statusStyle?.badge ?? 'bg-muted text-slate-500 border-border')}>
                          <StatusIcon className="w-3 h-3" />
                          {booking.status}
                        </span>
                        <span className="text-xs text-slate-500 ml-auto">
                          {format(new Date(booking.createdAt), 'dd MMM yyyy, h:mm a')}
                        </span>
                      </div>

                      {/* Customer */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="font-medium">{booking.customerName}</span>
                        </div>
                        <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-1.5 text-sm text-brand-700 hover:underline">
                          <Phone className="w-4 h-4" />
                          {booking.customerPhone}
                        </a>
                      </div>

                      {/* Event details */}
                      <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(booking.eventDate), 'EEE, dd MMM yyyy')}
                        </span>
                        <span>{booking.eventType}</span>
                        {booking.guestCount && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {booking.guestCount} guests
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <p className="text-sm text-slate-500 italic">"{booking.notes}"</p>
                      )}

                      {/* Amount */}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-foreground">₹{booking.amount.toLocaleString('en-IN')}</span>
                        {booking.advanceAmount && (
                          <span className="text-slate-500">• Advance: ₹{booking.advanceAmount.toLocaleString('en-IN')}</span>
                        )}
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                          booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                          booking.paymentStatus === 'partial' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-muted text-slate-500'
                        )}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'pending' && (
                      <div className="flex sm:flex-col gap-2 sm:flex-shrink-0">
                        <button
                          onClick={() => confirmMutation.mutate(booking._id)}
                          disabled={confirmMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4" /> Confirm
                        </button>
                        <button
                          onClick={() => setRejectTarget({ id: booking._id, number: booking.bookingNumber })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors whitespace-nowrap"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center disabled:opacity-40 hover:bg-accent transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-slate-500">Page {page} of {pagination.totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center disabled:opacity-40 hover:bg-accent transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          bookingId={rejectTarget.id}
          bookingNumber={rejectTarget.number}
          onClose={() => setRejectTarget(null)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['provider-bookings'] })}
        />
      )}
    </div>
  );
};

