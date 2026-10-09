import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, getDay, isToday, isBefore, startOfDay,
} from 'date-fns';
import {
  Star, MapPin, Phone, Globe, Instagram, Facebook, Youtube,
  ArrowLeft, ChevronLeft, ChevronRight, X, Calendar, Users,
  Clock, Tag, CheckCircle, MessageSquare, ExternalLink, ImageOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceService } from '../../services/marketplace.service';
import { useAuthStore } from '../../store';
import { cn } from '../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '../../components/ui/sheet';
import type { MarketplaceProvider, MarketplaceSlot, MarketplaceReview } from '../../types';

// ─── Star Rating ───────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onChange?: (r: number) => void }> = ({
  rating, size = 'md', interactive = false, onChange
}) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const display = interactive ? hovered || rating : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(sz, i <= display ? 'text-gold-500 fill-gold-500' : 'text-slate-500/30 fill-muted-foreground/30', interactive && 'cursor-pointer hover:scale-110 transition-transform')}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  );
};

// ─── Booking Modal ─────────────────────────────────────────────────────────
interface BookingModalProps {
  slot: MarketplaceSlot;
  providerId: string;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ slot, providerId, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    customerName: user ? `${user.firstName} ${user.lastName}` : '',
    customerPhone: user?.phone ?? '',
    customerEmail: user?.email ?? '',
    eventType: '',
    guestCount: '',
    notes: '',
    amount: slot.price ? String(slot.price) : '',
    advanceAmount: '',
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      onClose();
      navigate({ to: '/auth/login' });
    }
  }, [isAuthenticated, navigate, onClose]);

  const mutation = useMutation({
    mutationFn: () => marketplaceService.bookSlot(providerId, {
      slotId: slot._id,
      eventType: form.eventType,
      guestCount: form.guestCount ? Number(form.guestCount) : undefined,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || undefined,
      notes: form.notes || undefined,
      amount: Number(form.amount),
      advanceAmount: form.advanceAmount ? Number(form.advanceAmount) : undefined,
    }),
    onSuccess: () => {
      toast.success('Booking request sent! The vendor will confirm shortly.');
      qc.invalidateQueries({ queryKey: ['provider-slots', providerId] });
      onClose();
    },
    onError: () => toast.error('Booking failed. Please try again.'),
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <div>
            <SheetTitle>Book Slot</SheetTitle>
            <p className="text-sm text-slate-500 mt-0.5">{slot.label} {format(new Date(slot.date), 'dd MMM yyyy')}</p>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-4">
          {/* Slot info */}
          <div className="bg-brand-50 rounded-xl p-3.5 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-semibold">{format(new Date(slot.date), 'EEEE, dd MMMM yyyy')}</div>
              {slot.startTime && <div className="text-slate-500">{slot.startTime}{slot.endTime ? ` – ${slot.endTime}` : ''}</div>}
            </div>
            {slot.price && (
              <div className="ml-auto font-bold text-brand-700">₹{slot.price.toLocaleString('en-IN')}</div>
            )}
          </div>

          {/* Form fields */}
          {[
            { key: 'customerName', label: 'Your Name *', type: 'text', placeholder: 'Full name' },
            { key: 'customerPhone', label: 'Phone *', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
            { key: 'customerEmail', label: 'Email', type: 'email', placeholder: 'email@example.com' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Event Type *</label>
            <Select value={form.eventType} onValueChange={(v) => update('eventType', v)}>
              <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
              <SelectContent>
                {['Wedding', 'Reception', 'Engagement', 'Haldi', 'Mehendi', 'Sangeet', 'Pre-Wedding Shoot', 'Birthday', 'Anniversary', 'Other'].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Guest Count</label>
              <input
                type="number"
                value={form.guestCount}
                onChange={(e) => update('guestCount', e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (₹) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                placeholder="Total amount"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Advance Amount (₹)</label>
            <input
              type="number"
              value={form.advanceAmount}
              onChange={(e) => update('advanceAmount', e.target.value)}
              placeholder="Advance to pay"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Special requirements, preferences..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors resize-none"
            />
          </div>
        </SheetBody>

        <SheetFooter>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.customerName || !form.customerPhone || !form.eventType || !form.amount}
            className="w-full btn-luxury py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Sending Request...' : 'Confirm Booking Request'}
          </button>
          <p className="text-xs text-slate-500 text-center mt-3">The vendor will confirm your booking within 24 hours</p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
export const MarketplaceProviderDetailPage: React.FC = () => {
  const { providerId } = useParams({ from: '/marketplace/provider/$providerId' });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedSlot, setSelectedSlot] = useState<MarketplaceSlot | null>(null);
  const [selectedCalDay, setSelectedCalDay] = useState<Date | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [photoError, setPhotoError] = useState(false);
  useEffect(() => setPhotoError(false), [currentPhoto]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewPage, setReviewPage] = useState(1);

  const { data: providerData, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => marketplaceService.getProvider(providerId),
  });

  const { data: slotsData } = useQuery({
    queryKey: ['provider-slots', providerId, currentMonth],
    queryFn: () => marketplaceService.getProviderSlots(providerId, currentMonth),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['provider-reviews', providerId, reviewPage],
    queryFn: () => marketplaceService.getProviderReviews(providerId, { page: reviewPage, limit: 10 }),
  });

  const reviewMutation = useMutation({
    mutationFn: () => marketplaceService.addReview(providerId, { rating: reviewRating, review: reviewText }),
    onSuccess: () => {
      toast.success('Review submitted!');
      setReviewRating(0);
      setReviewText('');
      qc.invalidateQueries({ queryKey: ['provider-reviews', providerId] });
    },
    onError: () => toast.error('Failed to submit review.'),
  });

  const provider = (providerData?.data as { data?: MarketplaceProvider } | undefined)?.data;
  const slots = ((slotsData?.data as { data?: MarketplaceSlot[] } | undefined)?.data) ?? [];
  const reviews = (reviewsData?.data as { data?: MarketplaceReview[]; reviews?: MarketplaceReview[] } | undefined);
  const reviewList: MarketplaceReview[] = reviews?.data ?? reviews?.reviews ?? [];
  const reviewPagination = (reviewsData?.data as { pagination?: { totalPages: number } } | undefined)?.pagination;

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(format(d, 'yyyy-MM'));
  };
  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCurrentMonth(format(d, 'yyyy-MM'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="container px-4 py-10 animate-pulse">
          <div className="h-72 bg-muted rounded-2xl mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-32 bg-muted rounded-xl" />
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl mb-2">Provider not found</h2>
          <button onClick={() => navigate({ to: '/marketplace' })} className="btn-luxury mt-4 px-6 py-2.5">Back to Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Photo Gallery */}
      <div className="relative bg-foreground/5 pt-20">
        <div className="container px-4 pt-4 pb-0">
          <button
            onClick={() => navigate({ to: '/marketplace/$category', params: { category: provider.category } })}
            className="flex items-center gap-1.5 text-slate-500 hover:text-foreground text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {provider.category}
          </button>
        </div>

        {provider.photos?.length > 0 ? (
          <div className="relative h-72 md:h-96 overflow-hidden bg-brand-50">
            {photoError ? (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-12 h-12 text-brand-200" />
              </div>
            ) : (
              <img
                src={provider.photos[currentPhoto]}
                alt={provider.businessName}
                onError={() => setPhotoError(true)}
                className="w-full h-full object-cover"
              />
            )}
            {provider.photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhoto((p) => (p - 1 + provider.photos.length) % provider.photos.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPhoto((p) => (p + 1) % provider.photos.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {provider.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPhoto(i)}
                      className={cn('w-2 h-2 rounded-full transition-all', i === currentPhoto ? 'bg-white w-4' : 'bg-white/50')}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-48 bg-brand-50 flex items-center justify-center">
            <span className="text-6xl">💍</span>
          </div>
        )}
      </div>

      <div className="container px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Main Info ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="font-display font-bold text-3xl text-foreground flex-1">{provider.businessName}</h1>
                <span className={cn(
                  'text-xs font-bold px-3 py-1.5 rounded-full',
                  provider.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-slate-500'
                )}>
                  {provider.status === 'approved' && <><CheckCircle className="w-3 h-3 inline mr-1" />Verified</>}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 mt-2 mb-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{provider.location.address ?? ''} {provider.location.city}, {provider.location.state ?? ''}, {provider.location.country}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={provider.rating} size="md" />
                <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                <span className="text-slate-500 text-sm">({provider.reviewCount} reviews)</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span className="text-sm text-slate-500 capitalize">{provider.category.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Price */}
            {(provider.priceMin || provider.priceMax) && (
              <div className="bg-brand-50 rounded-2xl p-5">
                <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">Price Range</div>
                <div className="font-display font-bold text-2xl text-brand-700">
                  {provider.priceMin && `₹${provider.priceMin.toLocaleString('en-IN')}`}
                  {provider.priceMin && provider.priceMax && ' – '}
                  {provider.priceMax && `₹${provider.priceMax.toLocaleString('en-IN')}`}
                  <span className="text-sm font-normal text-slate-500 ml-2">{provider.currency}</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-display font-bold text-xl mb-3">About</h2>
              <p className="text-slate-500 leading-relaxed">{provider.description}</p>
            </div>

            {/* Tags */}
            {provider.tags?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-brand-600" /> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {provider.tags.map((t) => (
                    <span key={t} className="text-sm bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Details */}
            {provider.serviceDetails && Object.keys(provider.serviceDetails).length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl mb-3">Service Details</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(provider.serviceDetails).map(([k, v]) => (
                    <div key={k} className="bg-white rounded-xl border border-border px-3.5 py-2">
                      <span className="text-xs text-slate-500 capitalize">{k.replace(/_/g, ' ')}: </span>
                      <span className="text-sm font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slots Calendar View */}
            <div id="slots-section">
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" /> Availability Calendar
              </h2>

              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                {/* Month nav */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-display font-bold text-lg">
                    {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
                  </span>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-5 px-5 py-2.5 border-b border-border bg-muted/20 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" />Booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-5 h-2.5 rounded-full bg-brand-600" />Today</span>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="py-2.5 text-center text-xs font-semibold text-slate-500">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                {(() => {
                  const monthStart = startOfMonth(new Date(currentMonth + '-01'));
                  const monthEnd = endOfMonth(monthStart);
                  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  const firstDow = getDay(monthStart);
                  const today = startOfDay(new Date());

                  const getSlotsForDay = (d: Date) =>
                    slots.filter((s) => isSameDay(new Date(s.date), d));

                  return (
                    <div className="grid grid-cols-7">
                      {Array.from({ length: firstDow }).map((_, i) => (
                        <div key={`e${i}`} className={cn('min-h-20 border-r border-b border-border bg-muted/10', i === firstDow - 1 && 'border-r')} />
                      ))}
                      {days.map((day, i) => {
                        const daySlots = getSlotsForDay(day);
                        const available = daySlots.filter((s) => s.isAvailable);
                        const booked = daySlots.filter((s) => !s.isAvailable);
                        const past = isBefore(day, today);
                        const todayDay = isToday(day);
                        const selected = selectedCalDay ? isSameDay(day, selectedCalDay) : false;
                        const colIdx = (firstDow + i) % 7;
                        const hasSlots = daySlots.length > 0;

                        return (
                          <div
                            key={day.toISOString()}
                            onClick={() => {
                              if (!past && hasSlots) setSelectedCalDay(selected ? null : day);
                            }}
                            className={cn(
                              'min-h-20 border-r border-b border-border p-1.5 flex flex-col transition-all',
                              colIdx === 6 && 'border-r-0',
                              past && 'bg-muted/10 opacity-40 cursor-default',
                              !past && hasSlots && 'cursor-pointer hover:bg-brand-50/60',
                              !past && !hasSlots && 'cursor-default',
                              selected && 'bg-brand-50 ring-2 ring-inset ring-brand-500',
                            )}
                          >
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1 shrink-0',
                              todayDay ? 'bg-brand-600 text-white' : 'text-foreground',
                            )}>
                              {format(day, 'd')}
                            </div>
                            {/* Dot indicators */}
                            {hasSlots && (
                              <div className="flex flex-wrap gap-0.5 mt-auto">
                                {available.slice(0, 3).map((s) => (
                                  <span key={s._id} className="w-2 h-2 rounded-full bg-emerald-500" title={s.label} />
                                ))}
                                {booked.slice(0, 2).map((s) => (
                                  <span key={s._id} className="w-2 h-2 rounded-full bg-orange-400" title={s.label} />
                                ))}
                                {daySlots.length > 5 && (
                                  <span className="text-[9px] text-slate-500 font-medium">+{daySlots.length - 5}</span>
                                )}
                              </div>
                            )}
                            {!past && !hasSlots && (
                              <div className="text-[9px] text-slate-500/40 mt-auto">No slots</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Selected day slots */}
                <AnimatePresence>
                  {selectedCalDay && (() => {
                    const daySlots = slots.filter((s) => isSameDay(new Date(s.date), selectedCalDay));
                    return (
                      <motion.div
                        key={selectedCalDay.toISOString()}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-brand-200 bg-brand-50/40 overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-display font-bold text-base">
                                {format(selectedCalDay, 'EEEE, dd MMMM yyyy')}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''} available
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedCalDay(null)}
                              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                            >
                              <X className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            {daySlots.map((slot) => (
                              <div
                                key={slot._id}
                                className={cn(
                                  'bg-white rounded-xl border p-4 flex items-center gap-4',
                                  slot.isAvailable ? 'border-emerald-200' : 'border-border opacity-60'
                                )}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm">{slot.label}</span>
                                    <span className={cn(
                                      'text-xs px-2 py-0.5 rounded-full font-medium',
                                      slot.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'
                                    )}>
                                      {slot.isAvailable ? `${slot.capacity - slot.bookedCount} left` : 'Fully Booked'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                                    {slot.startTime && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {slot.startTime}{slot.endTime ? ` – ${slot.endTime}` : ''}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {slot.capacity} capacity
                                    </span>
                                    <span className="capitalize">{slot.slotType.replace(/_/g, ' ')}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  {slot.price && (
                                    <span className="font-bold text-brand-700 text-sm">
                                      ₹{slot.price.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  {slot.isAvailable && (
                                    <button
                                      onClick={() => setSelectedSlot(slot)}
                                      className="btn-luxury text-xs px-4 py-2 whitespace-nowrap"
                                    >
                                      Book Now
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>

                {slots.length === 0 && (
                  <div className="p-10 text-center">
                    <Calendar className="w-10 h-10 text-slate-500/40 mx-auto mb-3" />
                    <p className="text-slate-500">No slots available for this month</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" /> Reviews ({provider.reviewCount})
              </h2>

              {reviewList.length === 0 ? (
                <div className="bg-muted/50 rounded-2xl p-8 text-center mb-6">
                  <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviewList.map((review) => {
                    const reviewer = typeof review.userId === 'object' ? review.userId : null;
                    return (
                      <div key={review._id} className="bg-white rounded-2xl border border-border p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {reviewer?.profile?.photoUrl ? (
                              <img src={reviewer.profile.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-brand-700 font-bold text-sm">
                                {reviewer ? `${reviewer.firstName[0]}${reviewer.lastName[0]}` : 'U'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">
                                {reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Anonymous'}
                              </span>
                              {review.isVerified && (
                                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                              )}
                              <span className="text-xs text-slate-500 ml-auto">
                                {format(new Date(review.createdAt), 'dd MMM yyyy')}
                              </span>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{review.review}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Review Pagination */}
                  {reviewPagination && reviewPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button onClick={() => setReviewPage((p) => Math.max(1, p - 1))} disabled={reviewPage === 1} className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">
                        Previous
                      </button>
                      <span className="text-sm text-slate-500">Page {reviewPage}</span>
                      <button onClick={() => setReviewPage((p) => p + 1)} disabled={reviewPage >= reviewPagination.totalPages} className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Leave Review */}
              {isAuthenticated && (
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h3 className="font-semibold mb-4">Leave a Review</h3>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Rating *</label>
                    <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                  </div>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Your Review *</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors resize-none"
                    />
                  </div>
                  <button
                    onClick={() => reviewMutation.mutate()}
                    disabled={reviewMutation.isPending || reviewRating === 0 || !reviewText.trim()}
                    className="btn-luxury px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-24">
              <h3 className="font-display font-bold text-lg mb-4">Contact</h3>

              <div className="space-y-3">
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 hover:bg-brand-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-brand-600" />
                  <span className="text-sm font-medium text-foreground">{provider.phone}</span>
                </a>

                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-accent transition-colors"
                  >
                    <Globe className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-medium text-foreground truncate">{provider.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 ml-auto" />
                  </a>
                )}
              </div>

              {/* Social Links */}
              {provider.socialLinks && (
                <div className="flex gap-2 mt-4">
                  {provider.socialLinks.instagram && (
                    <a href={provider.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium">
                      <Instagram className="w-4 h-4 text-pink-500" />
                    </a>
                  )}
                  {provider.socialLinks.facebook && (
                    <a href={provider.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium">
                      <Facebook className="w-4 h-4 text-blue-600" />
                    </a>
                  )}
                  {provider.socialLinks.youtube && (
                    <a href={provider.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium">
                      <Youtube className="w-4 h-4 text-red-500" />
                    </a>
                  )}
                </div>
              )}

              {/* Book CTA */}
              <button
                onClick={() => {
                  const firstAvail = slots.find((s) => s.isAvailable);
                  if (firstAvail) setSelectedSlot(firstAvail);
                  else {
                    const el = document.getElementById('slots-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full btn-luxury py-3 mt-5"
              >
                Book Now
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-slate-500 text-center mt-2">
                  <button onClick={() => navigate({ to: '/auth/login' })} className="text-brand-700 underline">Login</button> to book
                </p>
              )}
            </div>

            {/* Owner */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-semibold mb-2">Owner</h3>
              <p className="text-sm text-slate-500">{provider.ownerName}</p>
              <p className="text-xs text-slate-500 mt-1">{provider.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <BookingModal
            slot={selectedSlot}
            providerId={providerId}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

