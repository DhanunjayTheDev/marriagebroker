import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ArrowRight, Loader2 } from 'lucide-react';
import { COMPLEXION_OPTIONS, LANGUAGES } from '../../../constants';
import { cn } from '../../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';

interface StepProps {
  onNext: (data?: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  isSaving?: boolean;
}

export const StepBasic: React.FC<StepProps> = ({ onNext, initialData, isSaving }) => {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { maritalStatus: 'never_married', ...(initialData as any)?.personal },
  });

  const onSubmit = (data: Record<string, unknown>) => {
    onNext({ personal: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Height (cm)">
          <input type="number" {...register('height')} min={100} max={250} placeholder="170"
            className="input-field" />
        </Field>
        <Field label="Weight (kg)">
          <input type="number" {...register('weight')} min={30} max={300} placeholder="65"
            className="input-field" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Marital Status">
          <Controller
            control={control}
            name="maritalStatus"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never_married">Never Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="awaiting_divorce">Awaiting Divorce</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Complexion">
          <Controller
            control={control}
            name="complexion"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {COMPLEXION_OPTIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Body Type">
          <Controller
            control={control}
            name="bodyType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slim">Slim</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Blood Group">
          <Controller
            control={control}
            name="bloodGroup"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field label="Mother Tongue">
        <Controller
          control={control}
          name="motherTongue"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="About Me">
        <textarea
          {...register('aboutMe')}
          rows={4}
          placeholder="Tell us about yourself, your values, and what you're looking for in a life partner..."
          className="input-field resize-none"
          maxLength={2000}
        />
      </Field>

      <button type="submit" disabled={isSaving} className="btn-luxury w-full flex items-center justify-center gap-2 py-3">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
      </button>

      <style>{`.input-field { width:100%; border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.625rem 1rem; font-size:0.875rem; background:hsl(var(--background)); transition:all 0.2s; }
        .input-field:focus { outline:none; border-color:hsl(var(--primary)); box-shadow:0 0 0 2px hsl(var(--primary)/0.1); }`}</style>
    </form>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    {children}
  </div>
);
