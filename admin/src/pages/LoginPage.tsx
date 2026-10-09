import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Heart, Mail, ShieldCheck, ArrowRight, Loader2, Lock } from 'lucide-react';
import { authService } from '../services';
import { useAuthStore } from '../store';
import { Button, Input } from '../components/ui';
import { cn } from '../lib/utils';

type Step = 'email' | 'otp';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = React.useRef<HTMLInputElement[]>([]);

  const sendOtp = useMutation({
    mutationFn: () => authService.sendOtp(email, 'email', 'login'),
    onSuccess: () => { setStep('otp'); toast.success('OTP sent to your email'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to send OTP'),
  });

  const login = useMutation({
    mutationFn: (code: string) => authService.login({ email, otp: code }),
    onSuccess: (res) => {
      if (!res.data) return;
      const { user, accessToken, refreshToken, sessionId } = res.data;
      // Restrict to staff roles
      const staffRoles = ['super_admin', 'admin', 'verifier', 'moderator', 'support', 'relationship_manager', 'analyst', 'content_manager'];
      if (!staffRoles.includes(user.role)) {
        toast.error('Access denied. Admin credentials required.');
        return;
      }
      setUser(user as never);
      setTokens({ accessToken, refreshToken, sessionId });
      toast.success(`Welcome, ${user.firstName}!`);
      navigate({ to: '/' });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? 'Login failed');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    },
  });

  const handleOtp = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((d) => d)) login.mutate(next.join(''));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md"><Heart className="w-6 h-6 text-white fill-white" /></div>
            <div>
              <div className="font-display font-bold text-xl">Avyuktha</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase">Admin Control Center</div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">Operational Control<br />at Scale</h1>
            <p className="text-white/60 max-w-md">Manage millions of users, verifications, payments, and the entire matrimony ecosystem from one powerful command center.</p>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Lock className="w-3.5 h-3.5" />
            Secured with 2FA, RBAC, and IP monitoring
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><Heart className="w-5 h-5 text-white fill-white" /></div>
            <span className="font-bold text-lg">Avyuktha Admin</span>
          </div>

          {step === 'email' ? (
            <>
              <h2 className="text-2xl font-bold mb-1">Admin Login</h2>
              <p className="text-muted-foreground text-sm mb-6">Sign in to your admin account</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@avyuktha.com" className="pl-9" autoFocus />
                  </div>
                </div>
                <Button onClick={() => sendOtp.mutate()} loading={sendOtp.isPending} disabled={!email} className="w-full">
                  Send OTP <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><ShieldCheck className="w-6 h-6 text-primary" /></div>
              <h2 className="text-2xl font-bold mb-1">Verify OTP</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter the code sent to <strong>{email}</strong></p>
              <div className="flex gap-2 mb-6">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { if (el) otpRefs.current[i] = el; }}
                    value={d}
                    onChange={(e) => handleOtp(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); }}
                    maxLength={1}
                    inputMode="numeric"
                    className={cn('w-11 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none focus:border-primary', d ? 'border-primary bg-primary/5' : 'border-border')}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              {login.isPending && <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</div>}
              <button onClick={() => setStep('email')} className="text-sm text-muted-foreground hover:text-foreground">← Change email</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
