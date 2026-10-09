import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Loader2 } from 'lucide-react';
import { EMPLOYMENT_TYPES, FOOD_HABITS, FAMILY_TYPES, FAMILY_VALUES, RASI_LIST, NAKSHATRA_LIST } from '../../../constants';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';

interface StepProps {
  onNext: (data?: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  isSaving?: boolean;
  step: number;
}

type FieldDef =
  | { type: 'text' | 'number' | 'textarea'; name: string; label: string; placeholder?: string }
  | { type: 'select'; name: string; label: string; options: Array<{ value: string; label: string }> }
  | { type: 'toggle'; name: string; label: string };

const STEP_CONFIG: Record<number, { key: string; fields: FieldDef[] }> = {
  4: {
    key: 'employment',
    fields: [
      { type: 'select', name: 'employmentType', label: 'Employment Type', options: EMPLOYMENT_TYPES },
      { type: 'text', name: 'company', label: 'Company', placeholder: 'Company name' },
      { type: 'text', name: 'designation', label: 'Designation', placeholder: 'e.g. Software Engineer' },
      { type: 'text', name: 'industry', label: 'Industry', placeholder: 'e.g. IT, Healthcare' },
      { type: 'number', name: 'experienceYears', label: 'Experience (years)', placeholder: '5' },
      { type: 'number', name: 'annualIncome', label: 'Annual Income (₹)', placeholder: '1200000' },
      { type: 'text', name: 'workLocation', label: 'Work Location', placeholder: 'City' },
      { type: 'toggle', name: 'isIncomePrivate', label: 'Keep income private' },
    ],
  },
  5: {
    key: 'family',
    fields: [
      { type: 'select', name: 'familyType', label: 'Family Type', options: FAMILY_TYPES.map((f) => ({ value: f.toLowerCase(), label: f })) },
      { type: 'select', name: 'familyValues', label: 'Family Values', options: FAMILY_VALUES.map((f) => ({ value: f.toLowerCase(), label: f })) },
      { type: 'text', name: 'fatherOccupation', label: "Father's Occupation", placeholder: 'e.g. Business' },
      { type: 'text', name: 'motherOccupation', label: "Mother's Occupation", placeholder: 'e.g. Homemaker' },
      { type: 'number', name: 'brothers', label: 'Brothers', placeholder: '0' },
      { type: 'number', name: 'sisters', label: 'Sisters', placeholder: '0' },
      { type: 'text', name: 'nativePlaceCity', label: 'Native Place', placeholder: 'City' },
    ],
  },
  6: {
    key: 'lifestyle',
    fields: [
      { type: 'select', name: 'foodHabits', label: 'Food Habits', options: FOOD_HABITS },
      { type: 'select', name: 'smokingHabit', label: 'Smoking', options: [{ value: 'never', label: 'Never' }, { value: 'occasionally', label: 'Occasionally' }, { value: 'regularly', label: 'Regularly' }] },
      { type: 'select', name: 'drinkingHabit', label: 'Drinking', options: [{ value: 'never', label: 'Never' }, { value: 'occasionally', label: 'Occasionally' }, { value: 'regularly', label: 'Regularly' }] },
      { type: 'select', name: 'religiousPractice', label: 'Religious Practice', options: [{ value: 'very_religious', label: 'Very Religious' }, { value: 'religious', label: 'Religious' }, { value: 'moderate', label: 'Moderate' }, { value: 'not_religious', label: 'Not Religious' }] },
    ],
  },
  7: {
    key: 'health',
    fields: [
      { type: 'toggle', name: 'hasDisabilities', label: 'Any disabilities?' },
      { type: 'toggle', name: 'hasDiabetes', label: 'Diabetes' },
      { type: 'toggle', name: 'hasBP', label: 'Blood Pressure' },
      { type: 'toggle', name: 'hasThyroid', label: 'Thyroid' },
      { type: 'toggle', name: 'hasAsthma', label: 'Asthma' },
      { type: 'toggle', name: 'hasHeartCondition', label: 'Heart Condition' },
      { type: 'toggle', name: 'isHealthPrivate', label: 'Keep health info private' },
    ],
  },
  8: {
    key: 'assets',
    fields: [
      { type: 'toggle', name: 'house', label: 'Own House' },
      { type: 'toggle', name: 'apartment', label: 'Apartment' },
      { type: 'toggle', name: 'villa', label: 'Villa' },
      { type: 'toggle', name: 'agriculturalLand', label: 'Agricultural Land' },
      { type: 'toggle', name: 'commercialProperty', label: 'Commercial Property' },
      { type: 'toggle', name: 'gold', label: 'Gold' },
      { type: 'toggle', name: 'stocks', label: 'Stocks / Mutual Funds' },
      { type: 'toggle', name: 'isAssetsPrivate', label: 'Keep assets private' },
    ],
  },
  9: {
    key: 'astrology',
    fields: [
      { type: 'select', name: 'rasi', label: 'Rasi (Moon Sign)', options: RASI_LIST.map((r) => ({ value: r, label: r })) },
      { type: 'select', name: 'nakshatram', label: 'Nakshatra', options: NAKSHATRA_LIST.map((n) => ({ value: n, label: n })) },
      { type: 'text', name: 'gothram', label: 'Gothram', placeholder: 'Your gothram' },
      { type: 'text', name: 'birthPlace', label: 'Birth Place', placeholder: 'City' },
      { type: 'text', name: 'birthTime', label: 'Birth Time', placeholder: 'HH:MM AM/PM' },
      { type: 'toggle', name: 'kujaDosham', label: 'Kuja Dosham (Manglik)' },
    ],
  },
  10: {
    key: 'personality',
    fields: [
      { type: 'select', name: 'introvertExtrovert', label: 'Personality', options: [{ value: 'introvert', label: 'Introvert' }, { value: 'extrovert', label: 'Extrovert' }, { value: 'ambivert', label: 'Ambivert' }] },
      { type: 'select', name: 'wantsChildren', label: 'Want Children?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'open', label: 'Open to discuss' }] },
      { type: 'select', name: 'financialMindset', label: 'Financial Mindset', options: [{ value: 'saver', label: 'Saver' }, { value: 'spender', label: 'Spender' }, { value: 'balanced', label: 'Balanced' }] },
      { type: 'toggle', name: 'isFamilyOriented', label: 'Family Oriented' },
      { type: 'toggle', name: 'isCareerOriented', label: 'Career Oriented' },
    ],
  },
  11: {
    key: 'partnerPreferences',
    fields: [
      { type: 'number', name: 'ageMin', label: 'Partner Age Min', placeholder: '21' },
      { type: 'number', name: 'ageMax', label: 'Partner Age Max', placeholder: '35' },
      { type: 'number', name: 'heightMin', label: 'Height Min (cm)', placeholder: '150' },
      { type: 'number', name: 'heightMax', label: 'Height Max (cm)', placeholder: '185' },
      { type: 'textarea', name: 'preferenceNote', label: 'What are you looking for?', placeholder: 'Describe your ideal partner...' },
    ],
  },
  12: {
    key: '_verification',
    fields: [],
  },
};

export const StepGeneric: React.FC<StepProps> = ({ onNext, initialData, isSaving, step }) => {
  const config = STEP_CONFIG[step];
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: (initialData as any)?.[config?.key] ?? {},
  });

  // Verification step special UI
  if (step === 12) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h3 className="font-display font-semibold text-xl mb-2">Almost There!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Verify your profile to build trust and get a verified badge. Verified profiles get 3x more matches.
            You can complete verification anytime from your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['Aadhaar', 'PAN', 'Face', 'Employment'].map((v) => (
            <div key={v} className="border border-border rounded-xl p-4 text-center">
              <div className="text-sm font-medium">{v} Verification</div>
              <div className="text-xs text-slate-500 mt-1">Optional · Build trust</div>
            </div>
          ))}
        </div>

        <button onClick={() => onNext({})} disabled={isSaving} className="btn-luxury w-full flex items-center justify-center gap-2 py-3">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finish & Go to Dashboard <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    );
  }

  if (!config) {
    return (
      <button onClick={() => onNext({})} className="btn-luxury w-full py-3">Continue</button>
    );
  }

  const onSubmit = (data: Record<string, unknown>) => {
    onNext({ [config.key]: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {config.fields.map((field) => {
          if (field.type === 'toggle') {
            const checked = watch(field.name);
            return (
              <div key={field.name} className="flex items-center justify-between gap-4 border border-border rounded-xl px-4 py-3 sm:col-span-1">
                <span className="text-sm font-medium">{field.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={checked}
                  onClick={() => setValue(field.name, !checked)}
                  className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors duration-200 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            );
          }

          return (
            <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
              {field.type === 'select' ? (
                <Select value={watch(field.name)} onValueChange={(v) => setValue(field.name, v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <textarea {...register(field.name)} rows={3} placeholder={field.placeholder}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-brand-700 resize-none" />
              ) : (
                <input type={field.type} {...register(field.name)} placeholder={field.placeholder}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-brand-700" />
              )}
            </div>
          );
        })}
      </div>

      <button type="submit" disabled={isSaving} className="btn-luxury w-full flex items-center justify-center gap-2 py-3">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
};

