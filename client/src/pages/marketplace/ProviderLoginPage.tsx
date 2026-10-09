import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Store } from 'lucide-react';
import { toast } from 'sonner';
import { marketplaceService } from '../../services/marketplace.service';
import { useProviderStore } from '../../store/providerStore';
import type { MarketplaceProvider } from '../../types';

interface LoginForm {
  email: string;
  password: string;
}

export const ProviderLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setProvider = useProviderStore((s) => s.setProvider);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await marketplaceService.providerLogin(data.email, data.password);
      const { provider, accessToken, refreshToken } = (res.data as { data?: { provider: MarketplaceProvider; accessToken: string; refreshToken: string } })?.data
        ?? (res.data as { provider: MarketplaceProvider; accessToken: string; refreshToken: string });
      setProvider(provider, accessToken, refreshToken);
      toast.success(`Welcome back, ${provider.businessName}!`);
      navigate({ to: '/provider/dashboard' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid credentials. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 to-white pt-28 pb-16 flex items-center justify-center">
      <div className="container px-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-3xl mb-2">Provider Login</h1>
            <p className="text-slate-500">Sign in to manage your vendor portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border p-8 space-y-5 shadow-sm">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                  type="email"
                  placeholder="your@business.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border text-sm outline-none focus:border-brand-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-luxury py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Portal'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500">
                New vendor?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/provider/register' })}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  Register for free
                </button>
              </p>
              <p className="text-sm text-slate-500">
                Looking for matches?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/auth/login' })}
                  className="text-brand-700 font-semibold hover:underline"
                >
                  User Login
                </button>
              </p>
            </div>
          </form>

          <p className="text-xs text-slate-500 text-center mt-6">
            By logging in, you agree to our{' '}
            <button onClick={() => navigate({ to: '/terms' })} className="underline">Terms of Service</button>
            {' '}and{' '}
            <button onClick={() => navigate({ to: '/privacy-policy' })} className="underline">Privacy Policy</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

