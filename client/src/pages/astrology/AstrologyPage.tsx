import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Star, Upload, Save, Loader2, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { profileService } from '../../services/profile.service';
import { upload } from '../../services';
import { RASI_LIST, NAKSHATRA_LIST } from '../../constants';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import type { Astrology } from '../../types';

export const AstrologyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const { data } = useQuery({ queryKey: ['astrology'], queryFn: () => profileService.getAstrology() });
  const astrology = data?.data as Astrology | undefined;

  const { register, handleSubmit, control } = useForm<Partial<Astrology>>({ values: astrology ?? {} as Partial<Astrology> });

  const saveMutation = useMutation({
    mutationFn: (formData: Partial<Astrology>) => profileService.updateAstrology(formData),
    onSuccess: () => {
      toast.success('Astrology details saved');
      queryClient.invalidateQueries({ queryKey: ['astrology'] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('horoscope', file);
      return upload('/profile/horoscope', formData);
    },
    onSuccess: (_res, file) => {
      setUploadedFile(file.name);
      toast.success('Horoscope uploaded successfully');
    },
    onError: () => toast.error('Failed to upload horoscope. Please try again.'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB');
      return;
    }
    uploadMutation.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl flex items-center gap-2">
          <Star className="w-6 h-6 text-gold-500" />
          Astrology & Horoscope
        </h1>
        <p className="text-slate-500 text-sm mt-1">Add your birth and astrology details for accurate kundli matching</p>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Birth Date"><input type="date" {...register('birthDate')} className="input-a" /></Field>
          <Field label="Birth Time"><input type="time" {...register('birthTime')} className="input-a" /></Field>
          <Field label="Birth Place"><input {...register('birthPlace')} placeholder="City" className="input-a" /></Field>
          <Field label="Gothram"><input {...register('gothram')} placeholder="Your gothram" className="input-a" /></Field>
          <Field label="Rasi (Moon Sign)">
            <Controller
              control={control}
              name="rasi"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {RASI_LIST.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Nakshatra">
            <Controller
              control={control}
              name="nakshatram"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {NAKSHATRA_LIST.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Lagnam"><input {...register('lagnam')} placeholder="Ascendant" className="input-a" /></Field>
          <Field label="Pada"><input type="number" {...register('pada')} min={1} max={4} className="input-a" /></Field>
        </div>

        <button type="submit" disabled={saveMutation.isPending} className="btn-luxury flex items-center gap-2 px-6 py-2.5">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Details
        </button>

        <style>{`.input-a { width:100%; border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.625rem 1rem; font-size:0.875rem; background:hsl(var(--background)); }
          .input-a:focus { outline:none; border-color:hsl(var(--primary)); }`}</style>
      </form>

      {/* Horoscope upload */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-500" /> Upload Horoscope
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-brand-300 transition-colors disabled:opacity-60 group"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-8 h-8 text-brand-500 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-slate-500">Uploading...</p>
            </>
          ) : uploadedFile ? (
            <>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-700">{uploadedFile}</p>
              <p className="text-xs text-slate-400 mt-1">Click to replace</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-500 mx-auto mb-2 transition-colors" />
              <p className="text-sm text-slate-500">Upload your horoscope PDF or image</p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG · Max 10 MB</p>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block">{label}</label>
    {children}
  </div>
);

