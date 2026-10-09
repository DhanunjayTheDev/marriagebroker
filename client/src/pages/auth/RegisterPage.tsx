import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Phone, Mail, Calendar, ArrowRight, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store';
import { cn, parsePhoneNumber } from '../../lib/utils';

type Step = 'basic' | 'otp';

const basicSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters').max(50),
  lastName: z.string().min(2, 'At least 2 characters').max(50),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Select gender' }),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  phone: z.string().min(10, 'Enter valid mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  referralCode: z.string().optional(),
});

type BasicFormData = z.infer<typeof basicSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [step, setStep] = useState<Step>('basic');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState<BasicFormData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = React.useRef<HTMLInputElement[]>([]);

  const form = useForm<BasicFormData>({ resolver: zodResolver(basicSchema) });

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const registerMutation = useMutation({
    mutationFn: async (data: BasicFormData) => {
      const phone = parsePhoneNumber(data.phone);
      return authService.register({
        ...data,
        phone,
        email: data.email || undefined,
      });
    },
    onSuccess: (_, data) => {
      setFormData(data);
      setStep('otp');
      setCountdown(60);
      toast.success('OTP sent to your mobile number');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Registration failed. Please try again.');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (otpCode: string) => {
      if (!formData) throw new Error('No form data');
      return authService.verifyRegistration({
        identifier: parsePhoneNumber(formData.phone),
        type: 'mobile',
        purpose: 'register',
        otp: otpCode,
        platform: 'web',
        deviceId: localStorage.getItem('deviceId') ?? undefined,
      });
    },
    onSuccess: (data) => {
      if (!data.data) return;
      const { user, accessToken, refreshToken, sessionId } = data.data;
      setUser(user);
      setTokens({ accessToken, refreshToken, sessionId });
      toast.success(`Welcome to Avyuktha, ${user.firstName}! 🎉`);
      navigate({ to: '/onboarding' });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) {
      verifyMutation.mutate(newOtp.join(''));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Create Your Profile</h1>
        <p className="text-slate-500">Find your perfect life partner completely free</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'basic' ? (
          <motion.form
            key="basic"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}
            className="space-y-4"
          >
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">First Name</label>
                <input
                  {...form.register('firstName')}
                  placeholder="Priya"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-all"
                />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                <input
                  {...form.register('lastName')}
                  placeholder="Sharma"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-all"
                />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'female', label: 'Bride (Female)', emoji: '👰' },
                  { value: 'male', label: 'Groom (Male)', emoji: '🤵' },
                  { value: 'other', label: 'Other', emoji: '👤' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => form.setValue('gender', g.value as 'male' | 'female' | 'other')}
                    className={cn(
                      'flex flex-col items-center py-3 rounded-xl border-2 text-xs font-medium transition-all',
                      form.watch('gender') === g.value
                        ? 'border-brand-700 bg-brand-50 dark:bg-brand-900/20 text-brand-700'
                        : 'border-border hover:border-brand-300'
                    )}
                  >
                    <span className="text-xl mb-1">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>
              {form.formState.errors.gender && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.gender.message}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date of Birth</label>
              <input
                {...form.register('dateOfBirth')}
                type="date"
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-all"
              />
              {form.formState.errors.dateOfBirth && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.dateOfBirth.message}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mobile Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 border border-border rounded-xl bg-muted text-sm font-medium">
                  🇮🇳 +91
                </div>
                <input
                  {...form.register('phone')}
                  type="tel"
                  placeholder="9876543210"
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-all"
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Email (optional) */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address <span className="text-slate-500 font-normal">(Optional)</span></label>
              <input
                {...form.register('email')}
                type="email"
                placeholder="your@email.com"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-all"
              />
            </div>

            {/* Referral code (optional) */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Referral Code <span className="text-slate-500 font-normal">(Optional)</span></label>
              <input
                {...form.register('referralCode')}
                placeholder="AVYUK123"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition-all"
              />
            </div>

            <p className="text-xs text-slate-500">
              By registering, you agree to our{' '}
              <Link to="/terms" className="text-brand-700 hover:underline">Terms & Conditions</Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-brand-700 hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn-luxury w-full flex items-center justify-center gap-2 py-3.5"
            >
              {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  Create Free Profile
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-brand-700 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-brand-700" />
              </div>
              <h2 className="font-semibold text-xl mb-1">Verify Mobile</h2>
              <p className="text-sm text-slate-500">
                OTP sent to <span className="font-semibold text-foreground">+91 {formData?.phone}</span>
              </p>
            </div>

            <div className="flex gap-3 mb-6 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { if (el) otpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      otpRefs.current[index - 1]?.focus();
                      const newOtp = [...otp];
                      newOtp[index - 1] = '';
                      setOtp(newOtp);
                    }
                  }}
                  className={cn(
                    'w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20',
                    digit ? 'border-brand-700 bg-brand-50 dark:bg-brand-900/20' : 'border-border'
                  )}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {verifyMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your profile...
              </div>
            )}

            <div className="text-center mb-4">
              {countdown > 0 ? (
                <p className="text-sm text-slate-500">Resend in {countdown}s</p>
              ) : (
                <button
                  onClick={() => {
                    if (formData) registerMutation.mutate(formData);
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="text-sm text-brand-700 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => setStep('basic')}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

