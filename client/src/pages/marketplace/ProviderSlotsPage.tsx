import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, getDay, isToday, isBefore, startOfDay,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, Plus, X, Trash2,
  Clock, Users, ArrowLeft, CalendarDays, CheckCircle2,
  XCircle, TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceService } from '../../services/marketplace.service';
import { useProviderStore } from '../../store/providerStore';
import { cn } from '../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '../../components/ui/sheet';
import type { MarketplaceSlot } from '../../types';

// ─── Add Slot Modal ────────────────────────────────────────────────────────
interface AddSlotModalProps {
  preselectedDate?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSlotModal: React.FC<AddSlotModalProps> = ({ preselectedDate, onClose, onSuccess }) => {
  const [slots, setSlots] = useState([{
    date: preselectedDate ?? format(new Date(), 'yyyy-MM-dd'),
    label: '',
    slotType: 'full_day' as const,
    startTime: '',
    endTime: '',
    capacity: '1',
    price: '',
    notes: '',
  }]);

  const mutation = useMutation({
    mutationFn: () => marketplaceService.addSlots(slots.map((s) => ({
      date: s.date,
      label: s.label,
      slotType: s.slotType,
      startTime: s.startTime || undefined,
      endTime: s.endTime || undefined,
      capacity: Number(s.capacity),
      price: s.price ? Number(s.price) : undefined,
      notes: s.notes || undefined,
    }))),
    onSuccess: () => {
      toast.success('Slots added!');
      onSuccess();
      onClose();
    },
    onError: () => toast.error('Failed to add slots.'),
  });

  const update = (i: number, key: string, val: string) =>
    setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const addRow = () =>
    setSlots((prev) => [...prev, { date: preselectedDate ?? format(new Date(), 'yyyy-MM-dd'), label: '', slotType: 'full_day', startTime: '', endTime: '', capacity: '1', price: '', notes: '' }]);

  const removeRow = (i: number) => {
    if (slots.length === 1) return;
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <div>
            <SheetTitle>Add Availability</SheetTitle>
            {preselectedDate && (
              <p className="text-sm text-slate-500 mt-0.5">
                {format(new Date(preselectedDate), 'EEEE, dd MMMM yyyy')}
              </p>
            )}
          </div>
        </SheetHeader>

        <SheetBody className="space-y-5">
          {slots.map((slot, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-4 relative">
              {slots.length > 1 && (
                <button
                  onClick={() => removeRow(i)}
                  className="absolute top-3 right-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {slots.length > 1 && (
                <div className="text-xs font-semibold text-brand-600">Slot {i + 1}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Date *</label>
                  <input
                    type="date"
                    value={slot.date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => update(i, 'date', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Type *</label>
                  <Select value={slot.slotType} onValueChange={(v) => update(i, 'slotType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_day">Full Day</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Label *</label>
                <input
                  value={slot.label}
                  onChange={(e) => update(i, 'label', e.target.value)}
                  placeholder="e.g. Morning Session, Full Day Package"
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Start Time</label>
                  <input type="time" value={slot.startTime} onChange={(e) => update(i, 'startTime', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">End Time</label>
                  <input type="time" value={slot.endTime} onChange={(e) => update(i, 'endTime', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Capacity *</label>
                  <input type="number" min="1" value={slot.capacity} onChange={(e) => update(i, 'capacity', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Price (₹)</label>
                  <input type="number" value={slot.price} onChange={(e) => update(i, 'price', e.target.value)} placeholder="Optional"
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
                <input value={slot.notes} onChange={(e) => update(i, 'notes', e.target.value)} placeholder="Any additional notes..."
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
              </div>
            </div>
          ))}

          <button
            onClick={addRow}
            className="w-full py-3 border-2 border-dashed border-brand-300 rounded-xl text-sm font-medium text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Another Slot
          </button>
        </SheetBody>

        <SheetFooter>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || slots.some((s) => !s.date || !s.label)}
            className="w-full btn-luxury py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Adding...' : `Add ${slots.length} Slot${slots.length > 1 ? 's' : ''}`}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// ─── Day Panel ─────────────────────────────────────────────────────────────
interface DayPanelProps {
  date: Date;
  slots: MarketplaceSlot[];
  onClose: () => void;
  onAddSlot: (dateStr: string) => void;
  onDeleted: () => void;
}

const DayPanel: React.FC<DayPanelProps> = ({ date, slots, onClose, onAddSlot, onDeleted }) => {
  const qc = useQueryClient();
  const isPast = isBefore(date, startOfDay(new Date()));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => marketplaceService.deleteSlot(id),
    onSuccess: () => {
      toast.success('Slot deleted');
      qc.invalidateQueries({ queryKey: ['my-slots'] });
      onDeleted();
    },
    onError: () => toast.error('Failed to delete slot'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      className="flex flex-col h-full"
    >
      {/* Panel Header */}
      <div className="flex items-start justify-between p-5 border-b border-border">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            {format(date, 'EEEE')}
          </div>
          <div className="font-display font-bold text-2xl text-foreground">
            {format(date, 'd MMMM')}
          </div>
          <div className="text-sm text-slate-500">{format(date, 'yyyy')}</div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors mt-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Slots */}
      <div className="flex-1 overflow-y-auto p-5">
        {slots.length === 0 ? (
          <div className="text-center py-10">
            <CalendarDays className="w-10 h-10 text-slate-500/40 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">No slots this day</p>
            {!isPast && (
              <p className="text-xs text-slate-500 mt-1">Click below to add availability</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot) => {
              const booked = slot.bookedCount > 0;
              const pct = Math.round((slot.bookedCount / slot.capacity) * 100);
              return (
                <div
                  key={slot._id}
                  className={cn(
                    'rounded-xl border p-4 space-y-3',
                    slot.isAvailable ? 'border-emerald-200 bg-emerald-50/50' : 'border-orange-200 bg-orange-50/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{slot.label}</div>
                      <div className="text-xs text-slate-500 capitalize mt-0.5">
                        {slot.slotType.replace(/_/g, ' ')}
                        {slot.startTime && ` · ${slot.startTime}${slot.endTime ? ` – ${slot.endTime}` : ''}`}
                      </div>
                    </div>
                    <span className={cn(
                      'shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1',
                      slot.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    )}>
                      {slot.isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {slot.isAvailable ? 'Available' : 'Full'}
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{slot.bookedCount} / {slot.capacity} booked</span>
                      {slot.price && <span className="font-semibold text-brand-700">₹{slot.price.toLocaleString('en-IN')}</span>}
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-orange-500' : pct > 60 ? 'bg-yellow-500' : 'bg-emerald-500')}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {!booked && (
                    <button
                      onClick={() => deleteMutation.mutate(slot._id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete slot
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add button */}
      {!isPast && (
        <div className="p-5 border-t border-border">
          <button
            onClick={() => onAddSlot(format(date, 'yyyy-MM-dd'))}
            className="w-full flex items-center justify-center gap-2 btn-luxury py-3 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Slot for {format(date, 'dd MMM')}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ProviderSlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useProviderStore();
  const qc = useQueryClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDate, setAddModalDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: '/provider/login' });
  }, [isAuthenticated, navigate]);

  const monthStr = format(currentDate, 'yyyy-MM');

  const { data } = useQuery({
    queryKey: ['my-slots', monthStr],
    queryFn: () => marketplaceService.getMySlots(monthStr),
    enabled: isAuthenticated,
  });

  const rawSlots = (data?.data as { slots?: MarketplaceSlot[]; data?: MarketplaceSlot[] } | undefined);
  const slotList: MarketplaceSlot[] = rawSlots?.slots ?? rawSlots?.data ?? [];

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const firstDayOfWeek = getDay(startOfMonth(currentDate));

  const getSlotsForDay = (d: Date) => slotList.filter((s) => isSameDay(new Date(s.date), d));
  const selectedDaySlots = selectedDay ? getSlotsForDay(selectedDay) : [];

  const prevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const openAdd = (dateStr?: string) => {
    setAddModalDate(dateStr ?? '');
    setShowAddModal(true);
  };

  // Month stats
  const totalSlots = slotList.length;
  const bookedSlots = slotList.filter((s) => !s.isAvailable || s.bookedCount > 0).length;
  const availableSlots = slotList.filter((s) => s.isAvailable).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 text-white py-6 px-4 shrink-0">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate({ to: '/provider/dashboard' })}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl">Availability Calendar</h1>
              <p className="text-white/70 text-sm mt-1">Manage your booking slots</p>
            </div>
            <button
              onClick={() => openAdd()}
              className="flex items-center gap-2 bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Add Slot
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Total Slots', value: totalSlots, icon: CalendarDays, color: 'text-white' },
              { label: 'Available', value: availableSlots, icon: CheckCircle2, color: 'text-emerald-300' },
              { label: 'Booked', value: bookedSlots, icon: TrendingUp, color: 'text-yellow-300' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
                <div className="font-bold text-xl">{value}</div>
                <div className="text-white/60 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calendar + Side Panel ─────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-5">
        {/* Calendar */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-border overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-display font-bold text-xl">{format(currentDate, 'MMMM yyyy')}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-5 py-2.5 border-b border-border bg-muted/20 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-400" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-400" />Booked / Full</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-600" />Today</span>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/10">
            {DAY_LABELS.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 tracking-wide">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Empty leading cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e${i}`} className={cn('min-h-28 border-r border-b border-border bg-muted/10', i === firstDayOfWeek - 1 && 'border-r')} />
            ))}

            {days.map((day, i) => {
              const daySlots = getSlotsForDay(day);
              const today = isToday(day);
              const past = isBefore(day, startOfDay(new Date()));
              const selected = selectedDay ? isSameDay(day, selectedDay) : false;
              const colIdx = (firstDayOfWeek + i) % 7;
              const available = daySlots.filter((s) => s.isAvailable).length;
              const booked = daySlots.filter((s) => !s.isAvailable).length;

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(selected ? null : day)}
                  className={cn(
                    'min-h-28 border-r border-b border-border p-2 cursor-pointer transition-all duration-150 flex flex-col',
                    colIdx === 6 && 'border-r-0',
                    past && 'bg-muted/10 opacity-50 cursor-default',
                    !past && !selected && 'hover:bg-brand-50/50',
                    selected && 'bg-brand-50 ring-2 ring-inset ring-brand-400',
                    today && !selected && 'bg-violet-50/30',
                  )}
                >
                  {/* Day number */}
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1.5 shrink-0',
                    today ? 'bg-brand-600 text-white' : 'text-foreground',
                  )}>
                    {format(day, 'd')}
                  </div>

                  {/* Slot chips */}
                  <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                    {daySlots.slice(0, 2).map((s) => (
                      <div
                        key={s._id}
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate leading-4',
                          s.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        )}
                      >
                        {s.label}
                      </div>
                    ))}
                    {daySlots.length > 2 && (
                      <div className="text-[10px] text-slate-500 font-medium px-1">
                        +{daySlots.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Bottom: counts or add hint */}
                  <div className="mt-auto pt-1">
                    {daySlots.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        {available > 0 && <span className="text-[10px] font-bold text-emerald-600">{available}✓</span>}
                        {booked > 0 && <span className="text-[10px] font-bold text-orange-500">{booked}✗</span>}
                      </div>
                    ) : !past ? (
                      <div className="text-[10px] text-slate-500/50 font-medium">+ Add</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className={cn(
          'shrink-0 bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300',
          selectedDay ? 'w-80 opacity-100' : 'w-0 opacity-0 border-0'
        )}>
          <AnimatePresence mode="wait">
            {selectedDay && (
              <DayPanel
                key={selectedDay.toISOString()}
                date={selectedDay}
                slots={selectedDaySlots}
                onClose={() => setSelectedDay(null)}
                onAddSlot={(dateStr) => openAdd(dateStr)}
                onDeleted={() => {
                  if (selectedDaySlots.length <= 1) setSelectedDay(null);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddSlotModal
            preselectedDate={addModalDate || undefined}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => qc.invalidateQueries({ queryKey: ['my-slots'] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

