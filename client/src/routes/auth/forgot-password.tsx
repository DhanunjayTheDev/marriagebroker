import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { authService } from '../../services/auth.service';

function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const mutation = useMutation({
    mutationFn: () => authService.sendOtp(identifier, identifier.includes('@') ? 'email' : 'mobile', 'reset'),
    onSuccess: () => toast.success('Reset instructions sent!'),
    onError: () => toast.error('Failed to send reset instructions'),
  });

  return (
    <AuthLayout>
      <div>
        <h1 className="font-display font-bold text-3xl mb-2">Reset Password</h1>
        <p className="text-slate-500 mb-8">Enter your email or mobile to receive reset instructions</p>
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or mobile number"
              className="w-full border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10"
            />
          </div>
          <button onClick={() => mutation.mutate()} disabled={!identifier || mutation.isPending} className="btn-luxury w-full py-3 flex items-center justify-center gap-2">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Instructions'}
          </button>
          <Link to="/auth/login" className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
});

