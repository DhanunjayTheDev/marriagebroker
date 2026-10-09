import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Phone, Mail, ArrowRight, RefreshCw, Shield, Loader2 } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store';
import { cn, parsePhoneNumber } from '../../lib/utils';

type LoginMethod = 'mobile' | 'email';
type Step = 'identifier' | 'otp';

const identifierSchema = z.object({
  identifier: z.string().min(1, 'Required'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter 6-digit OTP').regex(/^\d+$/, 'OTP must be numeric'),
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [method, setMethod] = useState<LoginMethod>('mobile');
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = React.useRef<HTMLInputElement[]>([]);

  const identifierForm = useForm({ resolver: zodResolver(identifierSchema) });
  const otpForm = useForm({ resolver: zodResolver(otpSchema) });

  // OTP countdown
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtpMutation = useMutation({
    mutationFn: async (id: string) => {
      const formattedId = method === 'mobile' ? parsePhoneNumber(id) : id;
      return authService.sendOtp(formattedId, method, 'login');
    },
    onSuccess: (_, id) => {
      setIdentifier(method === 'mobile' ? parsePhoneNumber(id) : id);
      setStep('otp');
      setCountdown(60);
      toast.success(`OTP sent to your ${method === 'mobile' ? 'mobile number' : 'email'}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to send OTP');
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (otpCode: string) => {
      const payload = method === 'mobile'
        ? { phone: identifier, otp: otpCode }
        : { email: identifier, otp: otpCode };
      return authService.login({ ...payload, platform: 'web', deviceId: localStorage.getItem('deviceId') ?? undefined });
    },
    onSuccess: (data) => {
      if (!data.data) return;
      const { user, accessToken, refreshToken, sessionId } = data.data;
      setUser(user);
      setTokens({ accessToken, refreshToken, sessionId });
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate({ to: '/dashboard' });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Login failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    },
  });

  const googleMutation = useMutation({
    mutationFn: async () => {
      toast.error('Google login not configured in this demo');
    },
  });

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      if (newOtp.every(d => d !== '')) {
        loginMutation.mutate(newOtp.join(''));
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '')) {
      loginMutation.mutate(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">Welcome Back</h1>
        <p className="text-slate-500">Login to continue your journey</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'identifier' ? (
          <motion.div
            key="identifier"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Method toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
              {[
                { key: 'mobile' as const, label: 'Mobile OTP', icon: Phone },
                { key: 'email' as const, label: 'Email OTP', icon: Mail },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                    method === key
                      ? 'bg-white dark:bg-card shadow-sm text-brand-700 font-semibold'
                      : 'text-slate-500 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Identifier input */}
            <form onSubmit={identifierForm.handleSubmit((data) => sendOtpMutation.mutate(data.identifier))}>
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {method === 'mobile' ? 'Mobile Number' : 'Email Address'}
                </label>
                <div className="relative">
                  {method === 'mobile' && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">+91</span>
                  )}
                  <input
                    {...identifierForm.register('identifier')}
                    type={method === 'mobile' ? 'tel' : 'email'}
                    placeholder={method === 'mobile' ? '9876543210' : 'your@email.com'}
                    className={cn(
                      'w-full border border-border rounded-xl py-3 pr-4 text-sm transition-all',
                      'focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10',
                      method === 'mobile' ? 'pl-12' : 'pl-4'
                    )}
                    autoFocus
                  />
                </div>
                {identifierForm.formState.errors.identifier && (
                  <p className="text-xs text-destructive mt-1">{identifierForm.formState.errors.identifier.message as string}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="btn-luxury w-full flex items-center justify-center gap-2 py-3"
              >
                {sendOtpMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-slate-500">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google login */}
            <button
              onClick={() => googleMutation.mutate()}
              className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-slate-500 mt-6">
              New to Avyuktha?{' '}
              <Link to="/auth/register" className="text-brand-700 font-semibold hover:underline">
                Register Free
              </Link>
            </p>
          </motion.div>
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
              <h2 className="font-semibold text-xl mb-1">Verify OTP</h2>
              <p className="text-slate-500 text-sm">
                Enter the 6-digit OTP sent to{' '}
                <span className="font-semibold text-foreground">{identifier}</span>
              </p>
            </div>

            {/* OTP input */}
            <div className="flex gap-3 mb-6 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { if (el) otpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    handleOtpChange(0, e.clipboardData.getData('text'));
                  }}
                  className={cn(
                    'w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all',
                    'focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20',
                    digit ? 'border-brand-700 bg-brand-50 dark:bg-brand-900/20' : 'border-border'
                  )}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {loginMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </div>
            )}

            {/* Resend */}
            <div className="text-center mb-6">
              {countdown > 0 ? (
                <p className="text-sm text-slate-500">
                  Resend OTP in <span className="font-semibold text-foreground">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={() => {
                    sendOtpMutation.mutate(identifier);
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="flex items-center gap-1.5 text-sm text-brand-700 font-semibold hover:underline mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setStep('identifier');
                setOtp(['', '', '', '', '', '']);
              }}
              className="w-full text-center text-sm text-slate-500 hover:text-foreground transition-colors"
            >
              â† Change {method === 'mobile' ? 'mobile number' : 'email'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

