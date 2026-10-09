import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  User, GraduationCap, Briefcase, Home, Heart, Activity, Building2,
  Star, Sparkles, Search, Lock, Camera, Save, Loader2, MapPin, CheckCircle2,
} from 'lucide-react';
import { profileService } from '../../services/profile.service';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar } from '../../components/common/Avatar';
import { ScoreRing } from '../../components/common/ScoreRing';
import { Skeleton } from '../../components/common/Skeleton';
import { cn } from '../../lib/utils';
import {
  RELIGIONS, RASI_LIST, NAKSHATRA_LIST, EDUCATION_LEVELS,
  EMPLOYMENT_TYPES, COMPLEXION_OPTIONS, FAMILY_TYPES, FAMILY_VALUES,
  FAMILY_STATUS, FOOD_HABITS, LANGUAGES,
} from '../../constants';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import type { Profile } from '../../types';

const SECTIONS = [
  { key: 'personal',           label: 'Personal',            icon: User },
  { key: 'religion',           label: 'Religion',            icon: Sparkles },
  { key: 'location',           label: 'Location',            icon: MapPin },
  { key: 'education',          label: 'Education',           icon: GraduationCap },
  { key: 'employment',         label: 'Career',              icon: Briefcase },
  { key: 'family',             label: 'Family',              icon: Home },
  { key: 'lifestyle',          label: 'Lifestyle',           icon: Activity },
  { key: 'health',             label: 'Health',              icon: Heart },
  { key: 'assets',             label: 'Assets',              icon: Building2 },
  { key: 'personality',        label: 'Personality',         icon: Star },
  { key: 'partnerPreferences', label: 'Partner Preferences', icon: Search },
  { key: 'privacy',            label: 'Privacy',             icon: Lock },
];

type FieldDef =
  | { type: 'text' | 'number'; name: string; label: string; placeholder?: string; min?: number; max?: number; wide?: boolean }
  | { type: 'textarea'; name: string; label: string; placeholder?: string; rows?: number }
  | { type: 'select'; name: string; label: string; options: { value: string; label: string }[] }
  | { type: 'toggle'; name: string; label: string; desc?: string };

const SECTION_CONFIG: Record<string, { description: string; fields: FieldDef[] }> = {
  personal: {
    description: 'Your physical and personal details shown on your profile.',
    fields: [
      { type: 'number', name: 'height', label: 'Height (cm)', placeholder: '170', min: 100, max: 250 },
      { type: 'number', name: 'weight', label: 'Weight (kg)', placeholder: '65', min: 30, max: 300 },
      { type: 'select', name: 'maritalStatus', label: 'Marital Status', options: [
        { value: 'never_married', label: 'Never Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' },
        { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
      ]},
      { type: 'select', name: 'complexion', label: 'Complexion', options: COMPLEXION_OPTIONS },
      { type: 'select', name: 'bodyType', label: 'Body Type', options: [
        { value: 'slim', label: 'Slim' }, { value: 'athletic', label: 'Athletic' },
        { value: 'average', label: 'Average' }, { value: 'heavy', label: 'Heavy' },
      ]},
      { type: 'select', name: 'bloodGroup', label: 'Blood Group',
        options: ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((b) => ({ value: b, label: b })) },
      { type: 'select', name: 'motherTongue', label: 'Mother Tongue',
        options: LANGUAGES.map((l) => ({ value: l.toLowerCase(), label: l })) },
      { type: 'textarea', name: 'aboutMe', label: 'About Me',
        placeholder: 'Tell us about yourself, your values, and what you are looking for...', rows: 4 },
    ],
  },
  religion: {
    description: 'Your religious background and horoscope details.',
    fields: [
      { type: 'select', name: 'religion', label: 'Religion',
        options: RELIGIONS.map((r) => ({ value: r.toLowerCase().replace(/ /g, '_'), label: r })) },
      { type: 'text', name: 'caste', label: 'Caste', placeholder: 'Your caste' },
      { type: 'text', name: 'subCaste', label: 'Sub Caste', placeholder: 'Optional' },
      { type: 'text', name: 'gothram', label: 'Gothram', placeholder: 'Your gothram' },
      { type: 'select', name: 'rasi', label: 'Rasi (Moon Sign)',
        options: RASI_LIST.map((r) => ({ value: r, label: r })) },
      { type: 'select', name: 'nakshatram', label: 'Nakshatra',
        options: NAKSHATRA_LIST.map((n) => ({ value: n, label: n })) },
      { type: 'text', name: 'birthTime', label: 'Birth Time', placeholder: '10:30 AM' },
      { type: 'text', name: 'birthPlace', label: 'Birth Place', placeholder: 'City, State' },
      { type: 'toggle', name: 'kujaDosham', label: 'Kuja Dosham (Manglik)' },
    ],
  },
  location: {
    description: 'Your current city, state, and residency information.',
    fields: [
      { type: 'text', name: 'city', label: 'City', placeholder: 'City' },
      { type: 'text', name: 'state', label: 'State', placeholder: 'State' },
      { type: 'text', name: 'country', label: 'Country', placeholder: 'India' },
      { type: 'text', name: 'pincode', label: 'Pincode', placeholder: '500001' },
      { type: 'select', name: 'residencyStatus', label: 'Residency Status', options: [
        { value: 'citizen', label: 'Citizen' }, { value: 'nri', label: 'NRI' },
        { value: 'oci', label: 'OCI' }, { value: 'pio', label: 'PIO' },
      ]},
      { type: 'text', name: 'nriCountry', label: 'NRI Country (if applicable)', placeholder: 'USA, UK, Canada...' },
    ],
  },
  education: {
    description: 'Your educational qualifications and academic background.',
    fields: [
      { type: 'select', name: 'highestDegree', label: 'Highest Qualification',
        options: EDUCATION_LEVELS.map((e) => ({ value: e.toLowerCase(), label: e })) },
      { type: 'text', name: 'fieldOfStudy', label: 'Field of Study', placeholder: 'e.g. Computer Science' },
      { type: 'text', name: 'college', label: 'College / Institution', placeholder: 'College name' },
      { type: 'text', name: 'university', label: 'University', placeholder: 'University name' },
      { type: 'number', name: 'graduationYear', label: 'Graduation Year', placeholder: '2020', min: 1970, max: 2030 },
    ],
  },
  employment: {
    description: 'Your career, company, and income details.',
    fields: [
      { type: 'select', name: 'employmentType', label: 'Employment Type', options: EMPLOYMENT_TYPES },
      { type: 'text', name: 'company', label: 'Company', placeholder: 'Company name' },
      { type: 'text', name: 'designation', label: 'Designation', placeholder: 'e.g. Software Engineer' },
      { type: 'text', name: 'industry', label: 'Industry', placeholder: 'e.g. IT, Healthcare, Finance' },
      { type: 'number', name: 'experienceYears', label: 'Experience (years)', placeholder: '5' },
      { type: 'number', name: 'annualIncome', label: 'Annual Income (₹)', placeholder: '1200000' },
      { type: 'text', name: 'workLocation', label: 'Work Location', placeholder: 'City' },
      { type: 'toggle', name: 'isIncomePrivate', label: 'Keep income private from other members' },
    ],
  },
  family: {
    description: 'Your family background, values, and native place.',
    fields: [
      { type: 'select', name: 'familyType', label: 'Family Type',
        options: FAMILY_TYPES.map((f) => ({ value: f.toLowerCase(), label: f })) },
      { type: 'select', name: 'familyValues', label: 'Family Values',
        options: FAMILY_VALUES.map((f) => ({ value: f.toLowerCase(), label: f })) },
      { type: 'select', name: 'familyStatus', label: 'Family Status',
        options: FAMILY_STATUS.map((f) => ({ value: f.toLowerCase().replace(/ /g, '_'), label: f })) },
      { type: 'text', name: 'fatherOccupation', label: "Father's Occupation", placeholder: 'e.g. Business' },
      { type: 'text', name: 'motherOccupation', label: "Mother's Occupation", placeholder: 'e.g. Homemaker' },
      { type: 'number', name: 'brothers', label: 'Brothers', placeholder: '0' },
      { type: 'number', name: 'sisters', label: 'Sisters', placeholder: '0' },
      { type: 'text', name: 'nativePlaceCity', label: 'Native Place', placeholder: 'City, State' },
    ],
  },
  lifestyle: {
    description: 'Your daily habits, food preferences, and hobbies.',
    fields: [
      { type: 'select', name: 'foodHabits', label: 'Food Habits', options: FOOD_HABITS },
      { type: 'select', name: 'smokingHabit', label: 'Smoking', options: [
        { value: 'never', label: 'Never' }, { value: 'occasionally', label: 'Occasionally' }, { value: 'regularly', label: 'Regularly' },
      ]},
      { type: 'select', name: 'drinkingHabit', label: 'Drinking', options: [
        { value: 'never', label: 'Never' }, { value: 'occasionally', label: 'Occasionally' }, { value: 'regularly', label: 'Regularly' },
      ]},
      { type: 'select', name: 'religiousPractice', label: 'Religious Practice', options: [
        { value: 'very_religious', label: 'Very Religious' }, { value: 'religious', label: 'Religious' },
        { value: 'moderate', label: 'Moderate' }, { value: 'not_religious', label: 'Not Religious' },
      ]},
      { type: 'textarea', name: 'hobbies', label: 'Hobbies & Interests', placeholder: 'Reading, travel, cooking, music...', rows: 2 },
    ],
  },
  health: {
    description: 'Your health status. Can be kept private from others.',
    fields: [
      { type: 'toggle', name: 'hasDisabilities', label: 'Any physical disabilities?' },
      { type: 'toggle', name: 'hasDiabetes', label: 'Diabetes' },
      { type: 'toggle', name: 'hasBP', label: 'Blood Pressure' },
      { type: 'toggle', name: 'hasThyroid', label: 'Thyroid condition' },
      { type: 'toggle', name: 'hasAsthma', label: 'Asthma' },
      { type: 'toggle', name: 'hasHeartCondition', label: 'Heart condition' },
      { type: 'toggle', name: 'isHealthPrivate', label: 'Keep health info private', desc: 'Only visible to you' },
    ],
  },
  assets: {
    description: 'Your property and financial assets (optional, can be private).',
    fields: [
      { type: 'toggle', name: 'house', label: 'Own House' },
      { type: 'toggle', name: 'apartment', label: 'Apartment' },
      { type: 'toggle', name: 'villa', label: 'Villa' },
      { type: 'toggle', name: 'agriculturalLand', label: 'Agricultural Land' },
      { type: 'toggle', name: 'commercialProperty', label: 'Commercial Property' },
      { type: 'toggle', name: 'gold', label: 'Gold (significant quantity)' },
      { type: 'toggle', name: 'stocks', label: 'Stocks / Mutual Funds' },
      { type: 'toggle', name: 'isAssetsPrivate', label: 'Keep assets info private', desc: 'Only visible to you' },
    ],
  },
  personality: {
    description: 'Your personality traits and life goals.',
    fields: [
      { type: 'select', name: 'introvertExtrovert', label: 'Personality Type', options: [
        { value: 'introvert', label: 'Introvert I recharge alone' },
        { value: 'ambivert', label: 'Ambivert Balance of both' },
        { value: 'extrovert', label: 'Extrovert I love socialising' },
      ]},
      { type: 'select', name: 'wantsChildren', label: 'Want Children?', options: [
        { value: 'yes', label: 'Yes, definitely' }, { value: 'no', label: 'No' },
        { value: 'open', label: 'Open to discuss' },
      ]},
      { type: 'select', name: 'financialMindset', label: 'Financial Mindset', options: [
        { value: 'saver', label: 'Saver' }, { value: 'balanced', label: 'Balanced' }, { value: 'spender', label: 'Spender' },
      ]},
      { type: 'toggle', name: 'isFamilyOriented', label: 'Family Oriented' },
      { type: 'toggle', name: 'isCareerOriented', label: 'Career Oriented' },
      { type: 'toggle', name: 'willingToRelocate', label: 'Willing to relocate after marriage' },
    ],
  },
  partnerPreferences: {
    description: 'Define what you are looking for in your life partner.',
    fields: [
      { type: 'number', name: 'ageMin', label: 'Partner Age Min', placeholder: '22' },
      { type: 'number', name: 'ageMax', label: 'Partner Age Max', placeholder: '32' },
      { type: 'number', name: 'heightMin', label: 'Height Min (cm)', placeholder: '150' },
      { type: 'number', name: 'heightMax', label: 'Height Max (cm)', placeholder: '185' },
      { type: 'textarea', name: 'preferenceNote', label: 'Describe your ideal partner',
        placeholder: 'Values, personality, family background, career, lifestyle...', rows: 4 },
    ],
  },
  privacy: {
    description: 'Control who can see your profile information.',
    fields: [
      { type: 'toggle', name: 'isProfilePublic', label: 'Make profile visible to all members' },
      { type: 'toggle', name: 'incognitoMode', label: 'Incognito mode', desc: 'Browse without others knowing you visited' },
      { type: 'select', name: 'showPhotoTo', label: 'Show photos to', options: [
        { value: 'all', label: 'All members' }, { value: 'verified', label: 'Verified members only' },
        { value: 'mutual_interest', label: 'Mutual interest only' }, { value: 'paid', label: 'Paid members only' },
      ]},
      { type: 'select', name: 'showContactTo', label: 'Show contact details to', options: [
        { value: 'all', label: 'All members' }, { value: 'paid', label: 'Paid members only' },
        { value: 'mutual_interest', label: 'Mutual interest only' },
      ]},
    ],
  },
};

const INPUT_CLS =
  'w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all';

const hasSectionData = (profile: any, key: string): boolean => {
  const d = profile?.[key];
  if (!d) return false;
  const fields = SECTION_CONFIG[key]?.fields ?? [];
  // Toggles default to false server-side, and selects/numbers default to '' / 0 —
  // none of those distinguish "explicitly filled" from "never touched", so only
  // non-empty strings/numbers count, plus toggles that were explicitly set true.
  return fields.some((f) => {
    const v = d[f.name];
    if (f.type === 'toggle') return v === true;
    if (typeof v === 'number') return v !== 0;
    return v !== null && v !== undefined && v !== '';
  });
};

export const ProfileEditPage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('personal');

  // Deep-link from ProfileCompletionModal
  useEffect(() => {
    const target = sessionStorage.getItem('edit-section');
    if (target) {
      setActiveSection(target);
      sessionStorage.removeItem('edit-section');
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => profileService.getMyProfile(),
  });

  const profile = data?.data?.profile as Profile | undefined;

  const photoMutation = useMutation({
    mutationFn: (files: File[]) => profileService.uploadPhotos(files),
    onSuccess: () => {
      toast.success('Photo updated!');
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      refetchUser();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const score = user?.profile.completionScore ?? 0;

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <Avatar
              src={user?.profile.photoUrl}
              name={`${user?.firstName} ${user?.lastName}`}
              size="2xl"
              verified={user?.profile.verificationBadge}
            />
            <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center cursor-pointer shadow-maroon hover:shadow-warm-lg transition-shadow">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && photoMutation.mutate(Array.from(e.target.files))}
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display font-bold text-2xl text-foreground">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 capitalize">{user?.subscription.plan} Member</p>
            {score < 100 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ⚠ Complete all sections to unlock Send Interest requests
              </p>
            )}
            {score === 100 && (
              <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profile complete you can send interest requests
              </p>
            )}
          </div>

          <div className="flex gap-4 flex-shrink-0">
            <ScoreRing score={score} size="sm" label="Complete" />
            <ScoreRing score={user?.profile.trustScore ?? 0} size="sm" label="Trust" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border p-2 lg:sticky lg:top-20 flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
            {SECTIONS.map((s) => {
              const filled = hasSectionData(profile, s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors text-left',
                    activeSection === s.key
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-500 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <s.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{s.label}</span>
                  {filled && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Form panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <SectionEditor
              key={activeSection}
              section={activeSection}
              profile={profile}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: ['myProfile'] });
                refetchUser();
              }}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ─── Section Editor ───────────────────────────────────────────────────────────

const SectionEditor: React.FC<{
  section: string;
  profile?: Profile;
  onSaved: () => void;
}> = ({ section, profile, onSaved }) => {
  const config = SECTION_CONFIG[section];
  const sectionData = (profile as any)?.[section] ?? {};

  const { register, handleSubmit, setValue, watch } = useForm({ values: sectionData });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      if (section === 'partnerPreferences') return profileService.updatePartnerPreferences(data);
      if (section === 'privacy') return profileService.updatePrivacy(data);
      return profileService.updateProfile({ [section]: data } as never);
    },
    onSuccess: () => {
      toast.success('Saved successfully!');
      onSaved();
    },
    onError: () => toast.error('Failed to save please try again'),
  });

  const sectionMeta = SECTIONS.find((s) => s.key === section);

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
      className="bg-white rounded-2xl border border-border p-6"
    >
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-2">
        {sectionMeta && (
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <sectionMeta.icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground">{sectionMeta?.label}</h2>
          {config && <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>}
        </div>
      </div>

      <div className="border-b border-border mb-6" />

      {/* Fields grid */}
      {config ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.fields.map((field) => {
            if (field.type === 'toggle') {
              const checked = !!watch(field.name);
              return (
                <div
                  key={field.name}
                  className="flex items-center justify-between border border-border rounded-xl px-4 py-3.5 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">{field.label}</span>
                    {field.desc && <p className="text-xs text-slate-500 mt-0.5">{field.desc}</p>}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => setValue(field.name, !checked)}
                    className={cn(
                      'relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ml-3',
                      checked ? 'bg-brand-600' : 'bg-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200',
                        checked ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              );
            }

            const isWide = field.type === 'textarea';
            return (
              <div key={field.name} className={isWide ? 'sm:col-span-2' : ''}>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">{field.label}</label>
                {field.type === 'select' ? (
                  <Select value={watch(field.name)} onValueChange={(v) => setValue(field.name, v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {field.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    {...register(field.name)}
                    rows={field.rows ?? 3}
                    placeholder={field.placeholder}
                    className={cn(INPUT_CLS, 'resize-none')}
                  />
                ) : (
                  <input
                    type={field.type}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    min={'min' in field ? field.min : undefined}
                    max={'max' in field ? field.max : undefined}
                    className={INPUT_CLS}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No editable fields for this section.</p>
      )}

      {/* Save footer */}
      <div className="flex items-center gap-3 mt-7 pt-5 border-t border-border">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="btn-luxury flex items-center gap-2 px-6 py-2.5"
        >
          {saveMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Save className="w-4 h-4" />}
          Save Changes
        </button>
        {saveMutation.isSuccess && (
          <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </motion.form>
  );
};

