import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff,
  MapPin, DollarSign, Tag, Globe, CheckCircle, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceService } from '../../services/marketplace.service';
import { cn } from '../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

const CATEGORIES = [
  { value: 'venue', label: '🏛️ Venues & Halls' },
  { value: 'photography', label: '📸 Photography' },
  { value: 'catering', label: '🍽️ Catering' },
  { value: 'decoration', label: '🌸 Decoration' },
  { value: 'makeup', label: '💄 Bridal Makeup' },
  { value: 'priest', label: '🪔 Priests & Pandits' },
  { value: 'event_management', label: '📋 Event Planners' },
  { value: 'music_band', label: '🎵 Music & Bands' },
  { value: 'mehendi', label: '🖐️ Mehendi Artists' },
  { value: 'bridal_wear', label: '👗 Bridal Wear' },
  { value: 'jewelry', label: '💎 Jewellery' },
  { value: 'invitation', label: '💌 Invitations' },
  { value: 'honeymoon', label: '✈️ Honeymoon' },
  { value: 'wedding_cake', label: '🎂 Wedding Cakes' },
  { value: 'transportation', label: '🚗 Transportation' },
];

// ─── Step 1 Form ───────────────────────────────────────────────────────────
interface Step1Data {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  category: string;
}

// ─── Step 2 Form ───────────────────────────────────────────────────────────
interface Step2Data {
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  priceMin: string;
  priceMax: string;
  tags: string;
  website: string;
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export const ProviderRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form1 = useForm<Step1Data>({ defaultValues: { businessName: '', ownerName: '', email: '', phone: '', password: '', confirmPassword: '', category: '' } });
  const form2 = useForm<Step2Data>({ defaultValues: { description: '', address: '', city: '', state: '', pincode: '', priceMin: '', priceMax: '', tags: '', website: '' } });

  const onStep1Submit = (data: Step1Data) => {
    if (data.password !== data.confirmPassword) {
      form1.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setStep1Data(data);
    setStep(2);
  };

  const onStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;
    setIsSubmitting(true);
    try {
      const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      await marketplaceService.providerRegister({
        businessName: step1Data.businessName,
        ownerName: step1Data.ownerName,
        email: step1Data.email,
        phone: step1Data.phone,
        password: step1Data.password,
        category: step1Data.category,
        description: data.description,
        location: {
          address: data.address || undefined,
          city: data.city,
          state: data.state || undefined,
          pincode: data.pincode || undefined,
          country: 'India',
        },
        priceMin: data.priceMin ? Number(data.priceMin) : undefined,
        priceMax: data.priceMax ? Number(data.priceMax) : undefined,
        tags,
        website: data.website || undefined,
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS = ['Account Info', 'Business Details', 'Done'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 to-white pt-28 pb-16">
      <div className="container px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">Vendor Registration</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Join as a Wedding Vendor</h1>
          <p className="text-slate-500">Register for free and get discovered by couples planning their dream wedding</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                  i + 1 < step ? 'bg-brand-600 border-brand-600 text-white' :
                  i + 1 === step ? 'border-brand-600 text-brand-600 bg-white' :
                  'border-border text-slate-500 bg-white'
                )}>
                  {i + 1 < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium hidden sm:block', i + 1 === step ? 'text-brand-700' : 'text-slate-500')}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2 transition-colors', i + 1 < step ? 'bg-brand-600' : 'bg-border')} style={{ maxWidth: '80px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Step 1 ────────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={form1.handleSubmit(onStep1Submit)} className="bg-white rounded-2xl border border-border p-8 space-y-5">
                <h2 className="font-display font-bold text-xl">Account Information</h2>

                {/* Business Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Business Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...form1.register('businessName', { required: 'Business name is required' })}
                      placeholder="Your business name"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                  </div>
                  {form1.formState.errors.businessName && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.businessName.message}</p>}
                </div>

                {/* Owner Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Owner Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...form1.register('ownerName', { required: 'Owner name is required' })}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                  </div>
                  {form1.formState.errors.ownerName && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.ownerName.message}</p>}
                </div>

                {/* Email & Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input {...form1.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                        type="email" placeholder="email@domain.com"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                    </div>
                    {form1.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input {...form1.register('phone', { required: 'Phone is required' })}
                        type="tel" placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                    </div>
                    {form1.formState.errors.phone && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.phone.message}</p>}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Business Category *</label>
                  <Controller
                    control={form1.control}
                    name="category"
                    rules={{ required: 'Please select a category' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="py-3">
                          <SelectValue placeholder="Select your service category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form1.formState.errors.category && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.category.message}</p>}
                </div>

                {/* Password */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input {...form1.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                        type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form1.formState.errors.password && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input {...form1.register('confirmPassword', { required: 'Please confirm password' })}
                        type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form1.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{form1.formState.errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <button type="submit" className="w-full btn-luxury py-3.5 text-base flex items-center justify-center gap-2 mt-2">
                  Continue <ChevronRight className="w-5 h-5" />
                </button>

                <p className="text-center text-sm text-slate-500">
                  Already registered?{' '}
                  <button type="button" onClick={() => navigate({ to: '/provider/login' })} className="text-brand-700 font-semibold hover:underline">
                    Login here
                  </button>
                </p>
              </form>
            </motion.div>
          )}

          {/* ─── Step 2 ────────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={form2.handleSubmit(onStep2Submit)} className="bg-white rounded-2xl border border-border p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(1)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-display font-bold text-xl">Business Details</h2>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Description *</label>
                  <textarea
                    {...form2.register('description', { required: 'Description is required', minLength: { value: 50, message: 'Minimum 50 characters' } })}
                    placeholder="Describe your services, experience, specialties..."
                    rows={4}
                    className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors resize-none"
                  />
                  {form2.formState.errors.description && <p className="text-xs text-red-500 mt-1">{form2.formState.errors.description.message}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input {...form2.register('address')}
                      placeholder="Street address"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">City *</label>
                    <input {...form2.register('city', { required: 'City is required' })}
                      placeholder="City"
                      className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                    {form2.formState.errors.city && <p className="text-xs text-red-500 mt-1">{form2.formState.errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">State</label>
                    <input {...form2.register('state')}
                      placeholder="State"
                      className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pincode</label>
                    <input {...form2.register('pincode')}
                      placeholder="Pincode"
                      className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Price Range (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input {...form2.register('priceMin')}
                      type="number" placeholder="Min price"
                      className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                    <input {...form2.register('priceMax')}
                      type="number" placeholder="Max price"
                      className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Tags (comma-separated)
                  </label>
                  <input {...form2.register('tags')}
                    placeholder="e.g. outdoor, traditional, budget-friendly, luxury"
                    className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                  <p className="text-xs text-slate-500 mt-1">Separate tags with commas to help couples find you</p>
                </div>

                {/* Website */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Website (optional)
                  </label>
                  <input {...form2.register('website')}
                    type="url" placeholder="https://yourbusiness.com"
                    className="w-full px-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-luxury py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ─── Step 3 (Success) ──────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-white rounded-2xl border border-border p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="font-display font-bold text-2xl mb-3">Registration Submitted!</h2>
                <p className="text-slate-500 text-lg mb-2 leading-relaxed">
                  Thank you for registering on Avyuktha Marketplace.
                </p>
                <p className="text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
                  Our admin team will review and approve your profile within <strong>24–48 hours</strong>. You'll receive an email once approved.
                </p>

                <div className="bg-brand-50 rounded-xl p-4 mb-8 text-left space-y-2 text-sm text-slate-500">
                  <p className="font-semibold text-foreground mb-1">What happens next?</p>
                  <p>1. Admin reviews your profile & documents</p>
                  <p>2. Your profile goes live on the marketplace</p>
                  <p>3. Couples can discover & book your services</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate({ to: '/provider/login' })}
                    className="btn-luxury px-8 py-3"
                  >
                    Go to Provider Login
                  </button>
                  <button
                    onClick={() => navigate({ to: '/marketplace' })}
                    className="px-8 py-3 border border-border rounded-full font-semibold hover:bg-accent transition-colors"
                  >
                    Back to Marketplace
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

