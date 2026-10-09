import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Building2, Camera, ChefHat, Sparkles, Star, BookOpen, Calendar, Music,
  Palette, ShoppingBag, Gem, Mail, Heart, Cake, Car, MapPin, Search,
  ArrowRight, CheckCircle, Users, Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { marketplaceService } from '../../services/marketplace.service';
import { cn } from '../../lib/utils';
import type { MarketplaceProvider } from '../../types';

// ─── Category Info ─────────────────────────────────────────────────────────
const CATEGORY_INFO: Record<string, { label: string; icon: LucideIcon; description: string; emoji: string }> = {
  venue: { label: 'Venues & Halls', icon: Building2, description: 'Convention halls, banquet halls, farmhouses', emoji: '🏛️' },
  photography: { label: 'Photography', icon: Camera, description: 'Photographers & videographers', emoji: '📸' },
  catering: { label: 'Catering', icon: ChefHat, description: 'Food & beverage services', emoji: '🍽️' },
  decoration: { label: 'Decoration', icon: Sparkles, description: 'Floral & event decoration', emoji: '🌸' },
  makeup: { label: 'Bridal Makeup', icon: Star, description: 'Makeup artists & hair stylists', emoji: '💄' },
  priest: { label: 'Priests & Pandits', icon: BookOpen, description: 'Religious ceremonies & muhurtam', emoji: '🪔' },
  event_management: { label: 'Event Planners', icon: Calendar, description: 'Full-service event management', emoji: '📋' },
  music_band: { label: 'Music & Bands', icon: Music, description: 'Naadaswaram, DJ, orchestras', emoji: '🎵' },
  mehendi: { label: 'Mehendi Artists', icon: Palette, description: 'Traditional & designer mehendi', emoji: '🖐️' },
  bridal_wear: { label: 'Bridal Wear', icon: ShoppingBag, description: 'Sarees, lehengas & groom wear', emoji: '👗' },
  jewelry: { label: 'Jewellery', icon: Gem, description: 'Traditional & designer jewellery', emoji: '💎' },
  invitation: { label: 'Invitations', icon: Mail, description: 'Wedding cards & digital invites', emoji: '💌' },
  honeymoon: { label: 'Honeymoon', icon: Heart, description: 'Travel packages & planning', emoji: '✈️' },
  wedding_cake: { label: 'Wedding Cakes', icon: Cake, description: 'Custom cakes & desserts', emoji: '🎂' },
  transportation: { label: 'Transportation', icon: Car, description: 'Cars, buses & horse carriages', emoji: '🚗' },
};

// ─── Star Rating ───────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(sz, i <= Math.round(rating) ? 'text-gold-500 fill-gold-500' : 'text-slate-500/30 fill-muted-foreground/30')} />
      ))}
    </div>
  );
};

// ─── Provider Card ─────────────────────────────────────────────────────────
const ProviderCard: React.FC<{ provider: MarketplaceProvider; index: number }> = ({ provider, index }) => {
  const navigate = useNavigate();
  const catInfo = CATEGORY_INFO[provider.category];
  const [imgError, setImgError] = useState(false);
  const showImage = provider.photos?.[0] && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={() => navigate({ to: '/marketplace/provider/$providerId', params: { providerId: provider._id } })}
    >
      <div className="aspect-[4/3] overflow-hidden bg-brand-50 relative">
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
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-semibold bg-white/90 backdrop-blur text-brand-700 px-2.5 py-1 rounded-full border border-brand-100">
            {catInfo?.label ?? provider.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-brand-950 truncate">{provider.businessName}</h3>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{provider.location.city}{provider.location.state ? `, ${provider.location.state}` : ''}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={provider.rating} />
          <span className="text-xs text-slate-500">{provider.rating.toFixed(1)} ({provider.reviewCount})</span>
        </div>
        {(provider.priceMin || provider.priceMax) && (
          <div className="text-sm font-semibold text-brand-700 mt-2">
            {provider.priceMin && `₹${provider.priceMin.toLocaleString('en-IN')}`}
            {provider.priceMin && provider.priceMax && ' – '}
            {provider.priceMax && `₹${provider.priceMax.toLocaleString('en-IN')}`}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────
const CategorySkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-border p-5 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-brand-50 mb-3" />
    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
    <div className="h-3 bg-muted rounded w-full" />
    <div className="h-5 bg-muted rounded-full w-16 mt-3" />
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
export const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchService, setSearchService] = useState('');

  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: () => marketplaceService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['marketplace-featured'],
    queryFn: () => marketplaceService.getProviders({ limit: 8, minRating: 4 }),
    staleTime: 5 * 60 * 1000,
  });

  const categoryCounts: Record<string, number> = {};
  const cats = (categoriesData?.data?.data as Array<{ category: string; count: number }> | undefined) ?? [];
  cats.forEach((c) => { categoryCounts[c.category] = c.count; });

  const providers: MarketplaceProvider[] = (featuredData?.data?.data as MarketplaceProvider[] | undefined) ?? [];

  const handleSearch = () => {
    if (searchService) {
      navigate({ to: '/marketplace/$category', params: { category: searchService } });
    } else {
      const params: Record<string, string> = {};
      if (searchCity) params.city = searchCity;
      navigate({ to: '/marketplace/$category', params: { category: 'venue' }, search: params as never });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 via-white to-white">
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 bg-gold-100/30 rounded-full blur-3xl" />
        </div>
        <div className="container relative text-center max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              Wedding Services Marketplace
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-brand-950 leading-tight mb-6">
              Your Complete{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-violet-600">
                Wedding Services
              </span>{' '}
              Marketplace
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover and book trusted wedding vendors — venues, photographers, caterers, decorators and more — all in one place.
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 bg-white rounded-2xl border border-border shadow-lg p-2">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <input
                    placeholder="Service type (venue, catering...)"
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent placeholder:text-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="w-px bg-border self-stretch" />
                <div className="flex items-center gap-2 px-3">
                  <MapPin className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <input
                    placeholder="City"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-28 outline-none text-sm bg-transparent placeholder:text-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="btn-luxury px-5 py-2.5 text-sm rounded-xl"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Quick category pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['venue', 'photography', 'catering', 'decoration', 'makeup'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => navigate({ to: '/marketplace/$category', params: { category: cat } })}
                  className="text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  {CATEGORY_INFO[cat]?.emoji} {CATEGORY_INFO[cat]?.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────── */}
      <section className="py-16 container px-4">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">Browse by Category</h2>
          <p className="text-slate-500">Find exactly what you need for your perfect wedding</p>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(CATEGORY_INFO).map(([key, info], i) => {
              const Icon = info.icon;
              const count = categoryCounts[key] ?? 0;
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate({ to: '/marketplace/$category', params: { category: key } })}
                  className="bg-white rounded-2xl border border-border p-5 text-left hover:border-brand-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center mb-3 transition-colors">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="font-semibold text-sm text-brand-950 leading-tight mb-1">{info.label}</div>
                  <div className="text-xs text-slate-500 line-clamp-2 mb-3">{info.description}</div>
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    count > 0 ? 'bg-brand-50 text-brand-700' : 'bg-muted text-slate-500'
                  )}>
                    {count > 0 ? `${count} vendors` : 'Coming soon'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Featured Providers ───────────────────────────────────────── */}
      {(featuredLoading || providers.length > 0) && (
        <section className="py-16 bg-brand-50/40">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display font-bold text-3xl md:text-4xl mb-2">Featured Vendors</h2>
                <p className="text-slate-500">Top-rated wedding service providers</p>
              </div>
              <button
                onClick={() => navigate({ to: '/marketplace/$category', params: { category: 'venue' } })}
                className="hidden md:flex items-center gap-1.5 text-brand-700 font-semibold text-sm hover:gap-3 transition-all"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {featuredLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {providers.map((p, i) => (
                  <ProviderCard key={p._id} provider={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── How It Works ─────────────────────────────────────────────── */}
      <section className="py-20 container px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">How It Works</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Book wedding services in 3 simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: 1,
              icon: Search,
              title: 'Browse',
              description: 'Search vendors by category and location. Read reviews, compare prices, and shortlist your favorites.',
              color: 'bg-brand-50 text-brand-600',
            },
            {
              step: 2,
              icon: Calendar,
              title: 'Book',
              description: 'Select an available slot, fill your event details, and confirm your booking instantly.',
              color: 'bg-gold-50 text-gold-600',
            },
            {
              step: 3,
              icon: Heart,
              title: 'Celebrate',
              description: 'Relax and enjoy your special day. Our verified vendors ensure a flawless experience.',
              color: 'bg-emerald-50 text-emerald-600',
            },
          ].map(({ step, icon: Icon, title, description, color }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={cn('w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center', color)}>
                <Icon className="w-8 h-8" />
              </div>
              <div className="text-xs font-bold text-slate-500 mb-1">STEP {step}</div>
              <h3 className="font-display font-bold text-xl mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
        {/* Connector lines */}
        <div className="hidden md:flex items-center justify-center gap-0 max-w-4xl mx-auto -mt-24 mb-12 pointer-events-none relative z-0">
          <div className="flex-1 h-px border-t-2 border-dashed border-border mx-16" />
          <div className="flex-1 h-px border-t-2 border-dashed border-border mx-16" />
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      <section className="py-12 bg-gradient-brand">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '500+', label: 'Verified Vendors', icon: CheckCircle },
              { value: '15', label: 'Categories', icon: Briefcase },
              { value: '50+', label: 'Cities', icon: MapPin },
              { value: '10K+', label: 'Happy Couples', icon: Users },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="w-6 h-6 text-white/70" />
                <div className="font-display font-bold text-3xl">{value}</div>
                <div className="text-sm text-white/80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Provider CTA ─────────────────────────────────────────────── */}
      <section className="py-20 container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white rounded-3xl border border-border shadow-lg p-10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand mx-auto mb-6 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl mb-4">Are you a Wedding Service Provider?</h2>
          <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Join thousands of vendors on Avyuktha Marketplace. Get discovered by couples planning their dream wedding — completely free to register.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate({ to: '/provider/register' })}
              className="btn-luxury px-8 py-3 text-base"
            >
              Join Free as a Vendor
            </button>
            <button
              onClick={() => navigate({ to: '/provider/login' })}
              className="px-8 py-3 border border-border rounded-full font-semibold hover:bg-accent transition-colors text-base"
            >
              Provider Login
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-slate-500">
            {['Free to list', 'No commission', 'Direct bookings', 'Admin verified'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

