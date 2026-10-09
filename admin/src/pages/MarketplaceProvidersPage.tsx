import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store, Check, X, Eye, Building2, Star, MapPin, Phone, Mail, Globe,
  Clock, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  ExternalLink, Instagram, Facebook,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services';
import { PageHeader, FilterBar, EmptyState } from '../components/common';
import { Card, CardContent, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, StatusBadge, Badge, TableSkeleton, Input } from '../components/ui';
import { formatDate, cn, debounce } from '../lib/utils';
import type { Pagination } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketplaceProvider {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  city: string;
  state: string;
  address?: string;
  description?: string;
  priceRange?: { min: number; max: number; currency?: string };
  website?: string;
  socialLinks?: { instagram?: string; facebook?: string; youtube?: string };
  photos?: string[];
  rating?: { average: number; count: number };
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

interface ProvidersResponse {
  data: MarketplaceProvider[];
  pagination: Pagination;
  counts?: { pending: number; approved: number; rejected: number; suspended: number; total: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  venue: 'Venue',
  photography: 'Photography',
  catering: 'Catering',
  decoration: 'Decoration',
  makeup: 'Makeup',
  priest: 'Priest',
  event_management: 'Event Mgmt',
  music_band: 'Music Band',
  mehendi: 'Mehendi',
  bridal_wear: 'Bridal Wear',
  jewelry: 'Jewellery',
  invitation: 'Invitation',
  honeymoon: 'Honeymoon',
  wedding_cake: 'Wedding Cake',
  transportation: 'Transport',
};

const CATEGORY_COLORS: Record<string, string> = {
  venue: 'bg-blue-100 text-blue-700',
  photography: 'bg-purple-100 text-purple-700',
  catering: 'bg-orange-100 text-orange-700',
  decoration: 'bg-pink-100 text-pink-700',
  makeup: 'bg-rose-100 text-rose-700',
  priest: 'bg-amber-100 text-amber-700',
  event_management: 'bg-indigo-100 text-indigo-700',
  music_band: 'bg-cyan-100 text-cyan-700',
  mehendi: 'bg-green-100 text-green-700',
  bridal_wear: 'bg-fuchsia-100 text-fuchsia-700',
  jewelry: 'bg-yellow-100 text-yellow-700',
  invitation: 'bg-teal-100 text-teal-700',
  honeymoon: 'bg-sky-100 text-sky-700',
  wedding_cake: 'bg-lime-100 text-lime-700',
  transportation: 'bg-slate-100 text-slate-700',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => (
  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[category] ?? 'bg-muted text-muted-foreground')}>
    {CATEGORY_LABELS[category] ?? category}
  </span>
);

const StarRating: React.FC<{ value?: number; count?: number }> = ({ value, count }) => {
  if (!value) return <span className="text-xs text-muted-foreground">No reviews</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Star className="w-3.5 h-3.5 fill-warning text-warning" />
      <span className="font-medium">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
};

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value?: React.ReactNode }> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-muted-foreground text-xs">{label}</span>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
};

// ─── Provider Detail Panel ────────────────────────────────────────────────────

interface DetailPanelProps {
  provider: MarketplaceProvider;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onSuspend: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  isSuspending: boolean;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  provider, onClose, onApprove, onReject, onSuspend,
  isApproving, isRejecting, isSuspending,
}) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(provider._id, rejectReason);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const photos = provider.photos ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base leading-tight">{provider.businessName}</h3>
            <CategoryBadge category={provider.category} />
          </div>
          <StatusBadge status={provider.status} />
        </div>
        <Button size="icon-sm" variant="ghost" onClick={onClose} title="Close panel">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="aspect-video rounded-lg border border-border overflow-hidden bg-muted relative">
            <img
              src={photos[photoIndex]}
              alt={`${provider.businessName} photo ${photoIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {photos.length > 1 && (
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button
                  onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
                  disabled={photoIndex === 0}
                  className="w-6 h-6 rounded bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
                  disabled={photoIndex === photos.length - 1}
                  className="w-6 h-6 rounded bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {photos.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                {photoIndex + 1} / {photos.length}
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {photos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={cn('w-12 h-12 rounded flex-shrink-0 border-2 overflow-hidden', i === photoIndex ? 'border-primary' : 'border-transparent')}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {provider.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{provider.description}</p>
      )}

      {/* Info grid */}
      <div className="space-y-3">
        <InfoRow icon={Building2} label="Owner" value={provider.ownerName} />
        <InfoRow icon={Mail} label="Email" value={<a href={`mailto:${provider.email}`} className="text-primary hover:underline">{provider.email}</a>} />
        <InfoRow icon={Phone} label="Phone" value={provider.phone} />
        <InfoRow
          icon={MapPin}
          label="Location"
          value={[provider.address, provider.city, provider.state].filter(Boolean).join(', ')}
        />
        {provider.priceRange && (
          <InfoRow
            icon={Store}
            label="Price Range"
            value={`₹${provider.priceRange.min.toLocaleString('en-IN')} – ₹${provider.priceRange.max.toLocaleString('en-IN')}`}
          />
        )}
        {provider.rating?.average && (
          <InfoRow
            icon={Star}
            label="Rating"
            value={<StarRating value={provider.rating.average} count={provider.rating.count} />}
          />
        )}
        {provider.website && (
          <InfoRow
            icon={Globe}
            label="Website"
            value={
              <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                {provider.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
              </a>
            }
          />
        )}
        {provider.socialLinks?.instagram && (
          <InfoRow
            icon={Instagram}
            label="Instagram"
            value={
              <a href={`https://instagram.com/${provider.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {provider.socialLinks.instagram}
              </a>
            }
          />
        )}
        {provider.socialLinks?.facebook && (
          <InfoRow
            icon={Facebook}
            label="Facebook"
            value={
              <a href={provider.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Facebook Page
              </a>
            }
          />
        )}
        <InfoRow icon={Clock} label="Registered" value={formatDate(provider.createdAt, 'datetime')} />
      </div>

      {/* Status history */}
      {(provider.approvedAt || provider.rejectedAt || provider.rejectionReason) && (
        <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status History</p>
          {provider.approvedAt && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Approved on {formatDate(provider.approvedAt, 'datetime')}</span>
            </div>
          )}
          {provider.rejectedAt && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <div>
                <div>Rejected on {formatDate(provider.rejectedAt, 'datetime')}</div>
                {provider.rejectionReason && (
                  <div className="text-xs text-muted-foreground mt-0.5">Reason: {provider.rejectionReason}</div>
                )}
              </div>
            </div>
          )}
          {!provider.rejectedAt && provider.rejectionReason && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-warning" />
              <div className="text-xs text-muted-foreground">Rejection reason: {provider.rejectionReason}</div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-1">
        {provider.status === 'pending' && (
          <>
            <Button
              className="w-full"
              variant="success"
              onClick={() => onApprove(provider._id)}
              loading={isApproving}
            >
              <Check className="w-4 h-4" /> Approve Provider
            </Button>
            {!showRejectForm ? (
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
              >
                <X className="w-4 h-4" /> Reject Provider
              </Button>
            ) : (
              <div className="space-y-2 rounded-lg border border-destructive/30 p-3 bg-destructive/5">
                <p className="text-xs font-medium text-destructive">Enter rejection reason:</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (required)..."
                  rows={3}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-card"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    disabled={!rejectReason.trim()}
                    onClick={handleReject}
                    loading={isRejecting}
                  >
                    <X className="w-3.5 h-3.5" /> Confirm Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {provider.status === 'approved' && (
          <Button
            className="w-full"
            variant="destructive"
            onClick={() => onSuspend(provider._id)}
            loading={isSuspending}
          >
            <XCircle className="w-4 h-4" /> Suspend Provider
          </Button>
        )}

        {(provider.status === 'rejected' || provider.status === 'suspended') && (
          <Button
            className="w-full"
            variant="success"
            onClick={() => onApprove(provider._id)}
            loading={isApproving}
          >
            <Check className="w-4 h-4" /> Approve Provider
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const MarketplaceProvidersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Record<string, unknown>>({
    status: '',
    category: '',
    search: '',
    page: 1,
    limit: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected] = useState<MarketplaceProvider | null>(null);

  // Debounced search
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 400),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  // Fetch active filters (strip empty strings)
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
  );

  const { data, isLoading } = useQuery({
    queryKey: ['mp-providers', filters],
    queryFn: () => adminService.getMarketplaceProviders(activeFilters),
  });

  // Stat queries for counts
  const { data: pendingData } = useQuery({
    queryKey: ['mp-providers-count', 'pending'],
    queryFn: () => adminService.getMarketplaceProviders({ status: 'pending', limit: 1 }),
  });
  const { data: approvedData } = useQuery({
    queryKey: ['mp-providers-count', 'approved'],
    queryFn: () => adminService.getMarketplaceProviders({ status: 'approved', limit: 1 }),
  });
  const { data: rejectedData } = useQuery({
    queryKey: ['mp-providers-count', 'rejected'],
    queryFn: () => adminService.getMarketplaceProviders({ status: 'rejected', limit: 1 }),
  });
  const { data: totalData } = useQuery({
    queryKey: ['mp-providers-count', 'all'],
    queryFn: () => adminService.getMarketplaceProviders({ limit: 1 }),
  });

  const providers = (data?.data ?? []) as MarketplaceProvider[];
  const pagination = data?.pagination as Pagination | undefined;

  const pendingCount = pendingData?.pagination?.total ?? 0;
  const approvedCount = approvedData?.pagination?.total ?? 0;
  const rejectedCount = rejectedData?.pagination?.total ?? 0;
  const totalCount = totalData?.pagination?.total ?? 0;

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveMarketplaceProvider(id),
    onSuccess: () => {
      toast.success('Provider approved successfully');
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['mp-providers'] });
    },
    onError: () => toast.error('Failed to approve provider'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectMarketplaceProvider(id, reason),
    onSuccess: () => {
      toast.success('Provider rejected');
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['mp-providers'] });
    },
    onError: () => toast.error('Failed to reject provider'),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminService.suspendMarketplaceProvider(id),
    onSuccess: () => {
      toast.success('Provider suspended');
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['mp-providers'] });
    },
    onError: () => toast.error('Failed to suspend provider'),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((f) => ({ ...f, page }));
  };

  return (
    <div>
      <PageHeader
        title="Marketplace Providers"
        description="Review and manage wedding service providers on the marketplace"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <button
          onClick={() => handleFilterChange('status', 'pending')}
          className={cn('stat-card text-left transition-all hover:shadow-md', filters.status === 'pending' && 'ring-2 ring-warning')}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold mt-1">{pendingCount}</p>
          <Badge variant="warning" className="mt-1 text-[10px]">Needs review</Badge>
        </button>
        <button
          onClick={() => handleFilterChange('status', 'approved')}
          className={cn('stat-card text-left transition-all hover:shadow-md', filters.status === 'approved' && 'ring-2 ring-success')}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Approved</span>
          </div>
          <p className="text-2xl font-bold mt-1">{approvedCount}</p>
          <Badge variant="success" className="mt-1 text-[10px]">Active</Badge>
        </button>
        <button
          onClick={() => handleFilterChange('status', 'rejected')}
          className={cn('stat-card text-left transition-all hover:shadow-md', filters.status === 'rejected' && 'ring-2 ring-destructive')}
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Rejected</span>
          </div>
          <p className="text-2xl font-bold mt-1">{rejectedCount}</p>
          <Badge variant="destructive" className="mt-1 text-[10px]">Inactive</Badge>
        </button>
        <button
          onClick={() => handleFilterChange('status', '')}
          className={cn('stat-card text-left transition-all hover:shadow-md', filters.status === '' && 'ring-2 ring-primary')}
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold mt-1">{totalCount}</p>
          <Badge variant="default" className="mt-1 text-[10px]">All providers</Badge>
        </button>
      </div>

      {/* Filters */}
      <FilterBar>
        <Input
          placeholder="Search by business name..."
          value={searchInput}
          onChange={handleSearchChange}
          className="w-52"
        />
        <Select
          value={String(filters.status) || 'all'}
          onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value || 'all'} value={o.value || 'all'}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(filters.category) || 'all'}
          onValueChange={(v) => handleFilterChange('category', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filters.status || filters.category || filters.search) ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setFilters({ status: '', category: '', search: '', page: 1, limit: 20 });
              setSearchInput('');
            }}
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </Button>
        ) : null}
        <span className="ml-auto text-xs text-muted-foreground">
          {pagination ? `${pagination.total} provider${pagination.total !== 1 ? 's' : ''}` : ''}
        </span>
      </FilterBar>

      {/* Split layout */}
      <div className={cn('grid gap-4', selected ? 'lg:grid-cols-5' : 'grid-cols-1')}>
        {/* Provider list */}
        <div className={cn('space-y-2', selected ? 'lg:col-span-3' : '')}>
          {isLoading ? (
            <Card><CardContent><TableSkeleton rows={8} cols={4} /></CardContent></Card>
          ) : providers.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={Store}
                  title="No providers found"
                  description={
                    filters.status || filters.category || filters.search
                      ? 'Try adjusting your filters to see more results.'
                      : 'No service providers have registered yet.'
                  }
                />
              </CardContent>
            </Card>
          ) : (
            providers.map((provider) => (
              <Card
                key={provider._id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selected?._id === provider._id && 'ring-2 ring-primary'
                )}
              >
                <CardContent className="flex items-center gap-3 py-3">
                  <div
                    onClick={() => setSelected(provider)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    {/* Business icon */}
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold',
                      CATEGORY_COLORS[provider.category] ?? 'bg-muted text-muted-foreground'
                    )}>
                      {(CATEGORY_LABELS[provider.category] ?? 'S')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{provider.businessName}</span>
                        <CategoryBadge category={provider.category} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        <span>{provider.ownerName}</span>
                        {provider.city && (
                          <span className="inline-flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />{provider.city}
                          </span>
                        )}
                        {provider.rating?.average && (
                          <StarRating value={provider.rating.average} count={provider.rating.count} />
                        )}
                        <span className="text-[11px]">{formatDate(provider.createdAt, 'short')}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={provider.status} />
                    </div>
                  </div>
                  {/* Quick actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    {provider.status === 'pending' && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Quick approve"
                        onClick={(e) => { e.stopPropagation(); approveMutation.mutate(provider._id); }}
                      >
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="View details"
                      onClick={() => setSelected(provider)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasPrev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lg:col-span-2">
            <Card className="sticky top-20">
              <CardContent>
                <DetailPanel
                  provider={selected}
                  onClose={() => setSelected(null)}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
                  onSuspend={(id) => suspendMutation.mutate(id)}
                  isApproving={approveMutation.isPending}
                  isRejecting={rejectMutation.isPending}
                  isSuspending={suspendMutation.isPending}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
