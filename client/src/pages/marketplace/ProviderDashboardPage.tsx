import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Store, Calendar, BookOpen, CheckCircle, Clock, AlertTriangle,
  TrendingUp, Users, ChevronRight, LogOut, Settings, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceService } from '../../services/marketplace.service';
import { useProviderStore } from '../../store/providerStore';
import { cn } from '../../lib/utils';
import type { MarketplaceBooking } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

export const ProviderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { provider, isAuthenticated, clearProvider } = useProviderStore();

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: '/provider/login' });
  }, [isAuthenticated, navigate]);

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['provider-bookings', 'dashboard'],
    queryFn: () => marketplaceService.getMyProviderBookings({ limit: 10 }),
    enabled: isAuthenticated,
  });

  const bookings = (bookingsData?.data as { bookings?: MarketplaceBooking[]; data?: MarketplaceBooking[] } | undefined);
  const bookingList: MarketplaceBooking[] = bookings?.bookings ?? bookings?.data ?? [];

  const totalBookings = bookingList.length;
  const pendingBookings = bookingList.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookingList.filter((b) => b.status === 'confirmed').length;
  const thisMonthEarnings = bookingList
    .filter((b) => b.status === 'confirmed' && new Date(b.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const handleLogout = () => {
    clearProvider();
    toast.success('Logged out successfully');
    navigate({ to: '/provider/login' });
  };

  if (!provider) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl">{provider.businessName}</h1>
                <p className="text-white/70 text-sm capitalize">{provider.category.replace(/_/g, ' ')} • {provider.location.city}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full border',
                    provider.status === 'approved' ? 'bg-emerald-500/30 text-white border-emerald-400' : 'bg-yellow-500/30 text-white border-yellow-400'
                  )}>
                    {provider.status === 'approved' ? '✓ Approved' : provider.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <Star className="w-3.5 h-3.5 text-gold-300 fill-gold-300" />
                    {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* ─── Pending Approval Warning ────────────────────────────── */}
        {provider.status !== 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">Profile Pending Approval</p>
              <p className="text-sm text-yellow-700 mt-0.5">
                Your profile is currently under review. Our admin team will approve it within 24–48 hours. You can manage slots and bookings once approved.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Stats ───────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Bookings', value: totalBookings, icon: BookOpen, color: 'bg-brand-50 text-brand-600' },
            { label: 'Pending', value: pendingBookings, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
            { label: 'Confirmed', value: confirmedBookings, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'This Month', value: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-violet-50 text-violet-600' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-border p-5"
            >
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-3', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-foreground">{value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* ─── Quick Links ─────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Slots', desc: 'Add & edit availability', icon: Calendar, to: '/provider/slots' },
            { label: 'View Bookings', desc: 'Confirm or reject requests', icon: Users, to: '/provider/bookings' },
            { label: 'Edit Profile', desc: 'Update business information', icon: Settings, to: '/provider/dashboard' },
          ].map(({ label, desc, icon: Icon, to }) => (
            <button
              key={label}
              onClick={() => navigate({ to: to as never })}
              className="bg-white rounded-2xl border border-border p-5 text-left hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-600 transition-colors" />
              </div>
              <div className="font-semibold text-foreground">{label}</div>
              <div className="text-sm text-slate-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {/* ─── Recent Bookings ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display font-bold text-lg">Recent Bookings</h2>
            <button
              onClick={() => navigate({ to: '/provider/bookings' })}
              className="text-sm text-brand-700 font-medium hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : bookingList.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-500">No bookings yet. Once your profile is approved, customers can book your services.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Booking #</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Event Date</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookingList.slice(0, 10).map((b) => (
                    <tr key={b._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-mono text-brand-700 font-medium">{b.bookingNumber}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium">{b.customerName}</div>
                        <div className="text-xs text-slate-500">{b.customerPhone}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {format(new Date(b.eventDate), 'dd MMM yyyy')}
                      </td>
                      <td className="px-5 py-3.5 text-sm">{b.eventType}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-right">₹{b.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', STATUS_STYLES[b.status] ?? 'bg-muted text-slate-500 border-border')}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

