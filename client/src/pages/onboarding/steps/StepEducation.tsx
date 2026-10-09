import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ArrowRight, Loader2 } from 'lucide-react';
import { EDUCATION_LEVELS } from '../../../constants';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';

interface StepProps {
  onNext: (data?: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  isSaving?: boolean;
}

export const StepEducation: React.FC<StepProps> = ({ onNext, initialData, isSaving }) => {
  const { register, handleSubmit, control } = useForm({
    defaultValues: (initialData as any)?.education ?? {},
  });

  return (
    <form onSubmit={handleSubmit((data) => onNext({ education: data }))} className="space-y-5">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Highest Qualification</label>
        <Controller
          control={control}
          name="highestDegree"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map((e) => <SelectItem key={e} value={e.toLowerCase()}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Field of Study</label>
        <input {...register('fieldOfStudy')} placeholder="e.g. Computer Science"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-brand-700" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">College</label>
          <input {...register('college')} placeholder="College name"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-brand-700" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">University</label>
          <input {...register('university')} placeholder="University name"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-brand-700" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Graduation Year</label>
        <input type="number" {...register('graduationYear')} min={1970} max={2030} placeholder="2020"
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-brand-700" />
      </div>

      <button type="submit" disabled={isSaving} className="btn-luxury w-full flex items-center justify-center gap-2 py-3">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
};
