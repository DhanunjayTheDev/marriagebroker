import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Building2, Camera, ChefHat, Sparkles, Star, BookOpen, Calendar, Music,
  Palette, ShoppingBag, Gem, Mail, Heart, Cake, Car, MapPin, Filter,
  SlidersHorizontal, ChevronLeft, ChevronRight, Search, ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { marketplaceService } from '../../services/marketplace.service';
import { cn } from '../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import type { MarketplaceProvider } from '../../types';

// ─── Category Info ─────────────────────────────────────────────────────────
const CATEGORY_INFO: Record<string, { label: string; icon: LucideIcon; description: string; emoji: string }> = {
  venue: { label: 'Venues & Halls', icon: Building2, description: 'Convention halls, banquet halls & farmhouses', emoji: '🏛️' },
  photography: { label: 'Photography', icon: Camera, description: 'Professional photographers & videographers', emoji: '📸' },
  catering: { label: 'Catering', icon: ChefHat, description: 'Food & beverage services for all events', emoji: '🍽️' },
  decoration: { label: 'Decoration', icon: Sparkles, description: 'Floral arrangements & event decoration', emoji: '🌸' },
  makeup: { label: 'Bridal Makeup', icon: Star, description: 'Makeup artists & hair stylists', emoji: '💄' },
  priest: { label: 'Priests & Pandits', icon: BookOpen, description: 'Religious ceremonies & muhurtam', emoji: '🪔' },
  event_management: { label: 'Event Planners', icon: Calendar, description: 'Full-service event management', emoji: '📋' },
  music_band: { label: 'Music & Bands', icon: Music, description: 'Naadaswaram, DJ & orchestras', emoji: '🎵' },
  mehendi: { label: 'Mehendi Artists', icon: Palette, description: 'Traditional & designer mehendi', emoji: '🖐️' },
  bridal_wear: { label: 'Bridal Wear', icon: ShoppingBag, description: 'Sarees, lehengas & groom wear', emoji: '👗' },
  jewelry: { label: 'Jewellery', icon: Gem, description: 'Traditional & designer jewellery', emoji: '💎' },
  invitation: { label: 'Invitations', icon: Mail, description: 'Wedding cards & digital invites', emoji: '💌' },
  honeymoon: { label: 'Honeymoon', icon: Heart, description: 'Travel packages & honeymoon planning', emoji: '✈️' },
  wedding_cake: { label: 'Wedding Cakes', icon: Cake, description: 'Custom cakes & desserts', emoji: '🎂' },
  transportation: { label: 'Transportation', icon: Car, description: 'Cars, buses & horse carriages', emoji: '🚗' },
};

// ─── Star Rating ───────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={cn('w-3.5 h-3.5', i <= Math.round(rating) ? 'text-gold-500 fill-gold-500' : 'text-slate-500/30 fill-muted-foreground/30')} />
    ))}
  </div>
);

// ─── Provider Card ─────────────────────────────────────────────────────────
const ProviderCard: React.FC<{ provider: MarketplaceProvider; index: number }> = ({ provider, index }) => {
  const navigate = useNavigate();
  const catInfo = CATEGORY_INFO[provider.category];
  const [imgError, setImgError] = useState(false);
  const showImage = provider.photos?.[0] && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
    >
      {/* Photo */}
      <div className="aspect-[4/3] overflow-hidden bg-brand-50 relative flex-shrink-0">
        {showImage ? (
          <img
            src={provider.photos![0]}
            alt={provider.businessName}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {catInfo && <catInfo.icon className="w-16 h-16 text-brand-200" />}
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 backdrop-blur text-brand-700 px-2.5 py-1 rounded-full border border-brand-100 z-10">
          {catInfo?.emoji} {catInfo?.label ?? provider.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-brand-950 mb-1 truncate">{provider.businessName}</h3>
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{provider.location.city}{provider.location.state ? `, ${provider.location.state}` : ''}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={provider.rating} />
          <span className="text-xs text-slate-500">{provider.rating.toFixed(1)} ({provider.reviewCount} reviews)</span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{provider.description}</p>

        {/* Footer — pushed to bottom, price above full-width button */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="mb-3">
            {(provider.priceMin || provider.priceMax) ? (
              <>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">Starting from</div>
                <div className="text-base font-bold text-brand-700 whitespace-nowrap">
                  {provider.priceMin && `₹${provider.priceMin.toLocaleString('en-IN')}`}
                  {provider.priceMin && provider.priceMax && ' – '}
                  {provider.priceMax && `₹${provider.priceMax.toLocaleString('en-IN')}`}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">Price on request</div>
            )}
          </div>
          <button
            onClick={() => navigate({ to: '/marketplace/provider/$providerId', params: { providerId: provider._id } })}
            className="btn-luxury w-full text-sm py-2.5"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
export const MarketplaceCategoryPage: React.FC = () => {
  const { category } = useParams({ from: '/marketplace/$category' });
  const navigate = useNavigate();
  const catInfo = CATEGORY_INFO[category] ?? { label: category, icon: Search, description: '', emoji: '' };

  const [city, setCity] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace-providers', category, city, priceMin, priceMax, minRating, sortBy, page],
    queryFn: () => marketplaceService.getProviders({
      category,
      city: city || undefined,
      minPrice: priceMin || undefined,
      maxPrice: priceMax || undefined,
      minRating: minRating || undefined,
      sortBy,
      page,
      limit: 9,
    }),
    staleTime: 2 * 60 * 1000,
  });

  const respData = data?.data as { providers?: MarketplaceProvider[]; data?: MarketplaceProvider[]; pagination?: { totalPages: number; total: number } } | undefined;
  const providers: MarketplaceProvider[] = respData?.providers ?? respData?.data ?? [];
  const pagination = respData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const IconComp = catInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 text-white pt-24 pb-12">
        <div className="container px-4">
          <button
            onClick={() => navigate({ to: '/marketplace' })}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <IconComp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
                {catInfo.emoji} {catInfo.label}
              </h1>
              <p className="text-white/80 text-lg">{catInfo.description}</p>
              {pagination && (
                <p className="text-white/60 text-sm mt-1">{pagination.total} vendors found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Sidebar Filters ───────────────────────────────────── */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:hidden flex items-center justify-between mb-4">
              <span className="font-semibold">Filters</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 text-sm text-brand-700 font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>

            <div className={cn('bg-white rounded-2xl border border-border p-5 space-y-5', !showFilters && 'hidden lg:block')}>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Filter className="w-4 h-4 text-brand-600" />
                Filters
              </div>

              {/* City */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setPage(1); }}
                    placeholder="e.g. Hyderabad"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Price Range (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                  />
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                  />
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Min Rating</label>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setMinRating(minRating === String(r) ? '' : String(r)); setPage(1); }}
                      className={cn(
                        'flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium border transition-colors',
                        minRating === String(r)
                          ? 'border-brand-400 bg-brand-50 text-brand-700'
                          : 'border-border text-slate-500 hover:border-brand-300'
                      )}
                    >
                      <Star className={cn('w-3.5 h-3.5', minRating === String(r) ? 'text-gold-500 fill-gold-500' : 'text-slate-500')} />
                      {r}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear */}
              <button
                onClick={() => { setCity(''); setPriceMin(''); setPriceMax(''); setMinRating(''); setSortBy('rating'); setPage(1); }}
                className="w-full text-sm text-brand-700 font-medium hover:underline text-left"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          {/* ─── Provider Grid ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-5 space-y-2.5">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                      <div className="h-10 bg-muted rounded-xl mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-16 text-center">
                <IconComp className="w-16 h-16 text-brand-200 mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl mb-2">No vendors found</h3>
                <p className="text-slate-500">Try adjusting your filters or search in a different city.</p>
                <button
                  onClick={() => { setCity(''); setPriceMin(''); setPriceMax(''); setMinRating(''); }}
                  className="btn-luxury mt-6 px-6 py-2.5 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {providers.map((p, i) => (
                    <ProviderCard key={p._id} provider={p} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground disabled:opacity-40 hover:bg-accent transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={cn(
                            'w-10 h-10 rounded-xl border text-sm font-medium transition-colors',
                            p === page ? 'bg-gradient-brand text-white border-transparent' : 'border-border hover:bg-accent'
                          )}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground disabled:opacity-40 hover:bg-accent transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

