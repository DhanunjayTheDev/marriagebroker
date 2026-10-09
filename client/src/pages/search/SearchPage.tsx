import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, SlidersHorizontal, X, Save, Bell, ChevronDown, Heart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '../../components/ui/sheet';
import { toast } from 'sonner';
import { matchService, interestService } from '../../services';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileGridSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  RELIGIONS, EDUCATION_LEVELS, EMPLOYMENT_TYPES, FOOD_HABITS,
  COMPLEXION_OPTIONS, RASI_LIST, NAKSHATRA_LIST, FAMILY_TYPES, LANGUAGES,
} from '../../constants';
import { cn } from '../../lib/utils';
import type { SearchFilters, MatchedUser } from '../../types';

export const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({ ageMin: 21, ageMax: 35 });
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({ ageMin: 21, ageMax: 35 });
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['search', appliedFilters],
    queryFn: () => matchService.search(appliedFilters, 1, 24),
  });

  const interestMutation = useMutation({
    mutationFn: (receiverId: string) => interestService.sendInterest(receiverId),
    onSuccess: () => toast.success('Interest sent! 💝'),
  });

  const saveSearchMutation = useMutation({
    mutationFn: () => matchService.saveSearch(saveName, appliedFilters, true),
    onSuccess: () => {
      toast.success('Search saved with alerts enabled!');
      setShowSaveDialog(false);
      setSaveName('');
    },
  });

  const results = (data?.data ?? []) as Array<{ userId: MatchedUser; [key: string]: unknown }>;
  const activeFilterCount = Object.keys(appliedFilters).filter(
    (k) => k !== 'ageMin' && k !== 'ageMax' && appliedFilters[k as keyof SearchFilters] !== undefined
  ).length;

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => {
      const current = (prev[key] as string[] | undefined) ?? [];
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [key]: updated.length ? updated : undefined };
    });
  };

  const applyFilters = () => setAppliedFilters(filters);
  const clearFilters = () => {
    const reset = { ageMin: 21, ageMax: 35 };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const filterFieldsContent = (
    <>
      {/* Age */}
      <FilterSection title="Age Range">
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={filters.ageMin ?? ''}
            onChange={(e) => updateFilter('ageMin', Number(e.target.value))}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-700"
            placeholder="Min"
          />
          <span className="text-slate-500 text-xs">to</span>
          <input
            type="number"
            value={filters.ageMax ?? ''}
            onChange={(e) => updateFilter('ageMax', Number(e.target.value))}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-700"
            placeholder="Max"
          />
        </div>
      </FilterSection>

      {/* Religion */}
      <FilterSection title="Religion">
        <ChipGroup
          options={RELIGIONS.map((r) => ({ value: r.toLowerCase(), label: r }))}
          selected={filters.religion ?? []}
          onToggle={(v) => toggleArrayFilter('religion', v)}
        />
      </FilterSection>

      {/* Mother Tongue */}
      <FilterSection title="Mother Tongue">
        <ChipGroup
          options={LANGUAGES.map((l) => ({ value: l.toLowerCase(), label: l }))}
          selected={(filters as any).motherTongue ?? []}
          onToggle={(v) => toggleArrayFilter('motherTongue' as keyof SearchFilters, v)}
        />
      </FilterSection>

      {/* Education */}
      <FilterSection title="Education">
        <ChipGroup
          options={EDUCATION_LEVELS.map((e) => ({ value: e.toLowerCase(), label: e }))}
          selected={filters.education ?? []}
          onToggle={(v) => toggleArrayFilter('education', v)}
        />
      </FilterSection>

      {/* Employment */}
      <FilterSection title="Employment Type">
        <ChipGroup
          options={EMPLOYMENT_TYPES}
          selected={filters.employmentType ?? []}
          onToggle={(v) => toggleArrayFilter('employmentType', v)}
        />
      </FilterSection>

      {/* Income */}
      <FilterSection title="Annual Income (₹)">
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={filters.annualIncomeMin ?? ''}
            onChange={(e) => updateFilter('annualIncomeMin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-700"
            placeholder="Min"
          />
          <span className="text-slate-500 text-xs">to</span>
          <input
            type="number"
            value={filters.annualIncomeMax ?? ''}
            onChange={(e) => updateFilter('annualIncomeMax', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-700"
            placeholder="Max"
          />
        </div>
      </FilterSection>

      {/* Food habits */}
      <FilterSection title="Food Habits">
        <ChipGroup
          options={FOOD_HABITS}
          selected={filters.foodHabits ?? []}
          onToggle={(v) => toggleArrayFilter('foodHabits', v)}
        />
      </FilterSection>

      {/* Complexion */}
      <FilterSection title="Complexion">
        <ChipGroup
          options={COMPLEXION_OPTIONS}
          selected={(filters as any).complexion ?? []}
          onToggle={(v) => toggleArrayFilter('complexion' as keyof SearchFilters, v)}
        />
      </FilterSection>

      {/* Family type */}
      <FilterSection title="Family Type">
        <ChipGroup
          options={FAMILY_TYPES.map((f) => ({ value: f.toLowerCase(), label: f }))}
          selected={filters.familyType ?? []}
          onToggle={(v) => toggleArrayFilter('familyType', v)}
        />
      </FilterSection>

      {/* Rasi */}
      <FilterSection title="Rasi (Moon Sign)">
        <ChipGroup
          options={RASI_LIST.map((r) => ({ value: r, label: r }))}
          selected={filters.rasi ?? []}
          onToggle={(v) => toggleArrayFilter('rasi', v)}
        />
      </FilterSection>

      {/* Nakshatra */}
      <FilterSection title="Nakshatra">
        <ChipGroup
          options={NAKSHATRA_LIST.map((n) => ({ value: n, label: n }))}
          selected={filters.nakshatra ?? []}
          onToggle={(v) => toggleArrayFilter('nakshatra', v)}
        />
      </FilterSection>

      {/* Toggles */}
      <FilterSection title="Preferences">
        <div className="space-y-2">
          <ToggleFilter label="NRI Only" checked={filters.isNRI ?? false} onChange={(v) => updateFilter('isNRI', v || undefined)} />
          <ToggleFilter label="Verified Profiles Only" checked={filters.isVerified ?? false} onChange={(v) => updateFilter('isVerified', v || undefined)} />
          <ToggleFilter label="With Photo" checked={filters.hasPhoto ?? false} onChange={(v) => updateFilter('hasPhoto', v || undefined)} />
          <ToggleFilter label="Manglik" checked={filters.manglik ?? false} onChange={(v) => updateFilter('manglik', v || undefined)} />
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="flex gap-6">
      {/* Filters sidebar — desktop only */}
      <AnimatePresence>
        {showFilters && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:block flex-shrink-0 overflow-hidden"
          >
            <div className="w-80 bg-card rounded-2xl border border-border sticky top-20">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-700" />
                  <h2 className="font-semibold">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button onClick={clearFilters} className="text-xs text-brand-700 hover:underline">
                  Clear all
                </button>
              </div>

              <div className="p-4 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
                {filterFieldsContent}
              </div>

              {/* Apply button */}
              <div className="p-4 border-t border-border space-y-2">
                <button onClick={applyFilters} className="btn-luxury w-full text-sm py-2.5">
                  Apply Filters
                </button>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-brand-700 py-2 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Search & Get Alerts
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Filters bottom sheet — mobile only */}
      <Dialog.Root open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl border-t border-border max-h-[85vh] flex flex-col shadow-warm-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom focus:outline-none"
            aria-describedby={undefined}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3 border-b border-border flex-shrink-0">
              <Dialog.Title className="flex items-center gap-2 font-semibold">
                <SlidersHorizontal className="w-4 h-4 text-brand-700" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </Dialog.Title>
              <div className="flex items-center gap-1">
                <button onClick={clearFilters} className="text-xs text-brand-700 hover:underline px-2 py-2">
                  Clear all
                </button>
                <Dialog.Close className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4" />
                </Dialog.Close>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">
              {filterFieldsContent}
            </div>

            <div
              className="p-4 border-t border-border space-y-2 flex-shrink-0"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
            >
              <button
                onClick={() => { applyFilters(); setMobileFiltersOpen(false); }}
                className="btn-luxury w-full text-sm py-3"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { setMobileFiltersOpen(false); setShowSaveDialog(true); }}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-brand-700 py-2.5 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Search & Get Alerts
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Results */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display font-bold text-2xl">Search Results</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {data?.pagination?.total ?? 0} profiles match your criteria
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:flex hidden items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-maroon text-white text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {isLoading ? (
          <ProfileGridSkeleton count={9} />
        ) : results.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No profiles found"
            description="Try adjusting your filters to see more results."
            action={<button onClick={clearFilters} className="btn-luxury text-sm px-5 py-2.5">Clear Filters</button>}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((result, i) => {
              const u = result.userId;
              if (typeof u !== 'object') return null;
              return (
                <ProfileCard
                  key={u._id}
                  userId={u._id}
                  user={u}
                  profile={result as never}
                  variant="compact"
                  index={i}
                  onSendInterest={() => interestMutation.mutate(u._id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Save search dialog */}
      <Sheet open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Save This Search</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <p className="text-sm text-slate-500 mb-4">
              Get notified when new profiles match your criteria.
            </p>
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Hindu Brahmin, Bangalore"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700"
              autoFocus
            />
          </SheetBody>
          <SheetFooter>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveSearchMutation.mutate()}
                disabled={!saveName || saveSearchMutation.isPending}
                className="flex-1 btn-luxury text-sm py-2.5 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Save & Alert
              </button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">{title}</h3>
    {children}
  </div>
);

const ChipGroup: React.FC<{
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}> = ({ options, selected, onToggle }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onToggle(opt.value)}
        className={cn(
          'text-xs px-2.5 py-1.5 rounded-lg border transition-all',
          selected.includes(opt.value)
            ? 'bg-brand-700 border-brand-700 text-white font-medium'
            : 'border-border text-slate-500 hover:border-brand-300'
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ToggleFilter: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative w-12 h-7 rounded-full flex-shrink-0 transition-colors duration-200', checked ? 'bg-brand-600' : 'bg-slate-200')}
    >
      <span className={cn('absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200', checked ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  </div>
);

