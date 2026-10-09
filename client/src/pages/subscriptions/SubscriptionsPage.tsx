import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Star, Zap, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService } from '../../services';
import { PLAN_DURATIONS } from '../../constants';
import { cn } from '../../lib/utils';

declare global {
  interface Window { Razorpay: any; }
}

const PLANS = [
  { key: 'silver', name: 'Silver', icon: Star, color: 'slate', prices: { 30: 999, 90: 2499, 180: 4499, 365: 7999 }, features: ['View matches', 'Send interests', 'Voice calls', 'Contact requests', 'Basic search'] },
  { key: 'gold', name: 'Gold', icon: Sparkles, color: 'gold', popular: true, prices: { 30: 1999, 90: 4999, 180: 8999, 365: 14999 }, features: ['Everything in Silver', 'Video calls', 'Photo access', 'AI matching', 'Advanced search', 'Saved searches + alerts'] },
  { key: 'platinum', name: 'Platinum', icon: Crown, color: 'sky', prices: { 30: 3499, 90: 8999, 180: 15999, 365: 24999 }, features: ['Everything in Gold', 'Unlimited chats', 'Unlimited calls', 'Priority support', 'Profile boost', 'Featured profile'] },
  { key: 'elite', name: 'Elite', icon: Shield, color: 'violet', prices: { 30: 5999, 90: 14999, 180: 27999, 365: 44999 }, features: ['Everything in Platinum', 'Background verification', 'Dedicated RM', 'Hand-picked matches', 'Premium badge'] },
];

export const SubscriptionsPage: React.FC = () => {
  const [duration, setDuration] = useState<30 | 90 | 180 | 365>(90);

  const { data: currentSub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getMySubscription(),
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ plan }: { plan: string }) => subscriptionService.createOrder(plan, duration),
    onSuccess: (res, { plan }) => {
      const order = res.data as { razorpayOrderId: string; amount: number; orderId: string };
      openRazorpay(order, plan);
    },
    onError: () => toast.error('Failed to create order'),
  });

  const verifyMutation = useMutation({
    mutationFn: (data: { orderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
      subscriptionService.verifyPayment(data),
    onSuccess: () => toast.success('Subscription activated! 🎉'),
    onError: () => toast.error('Payment verification failed'),
  });

  const openRazorpay = (order: { razorpayOrderId: string; amount: number; orderId: string }, plan: string) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount * 100,
      currency: 'INR',
      name: 'Avyuktha Matrimony',
      description: `${plan} Plan Subscription`,
      order_id: order.razorpayOrderId,
      handler: (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
        verifyMutation.mutate({
          orderId: order.orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      theme: { color: '#8b1538' },
    };
    if (window.Razorpay) {
      new window.Razorpay(options).open();
    } else {
      toast.error('Payment gateway not loaded');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-3xl mb-2">Upgrade Your Experience</h1>
        <p className="text-slate-500">Unlock premium features to find your perfect match faster</p>
      </div>

      {/* Duration toggle */}
      <div className="flex justify-center">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {PLAN_DURATIONS.map((d) => (
            <button
              key={d.days}
              onClick={() => setDuration(d.days as 30 | 90 | 180 | 365)}
              className={cn(
                'relative px-4 py-2 rounded-lg text-sm font-medium transition-all',
                duration === d.days ? 'bg-white dark:bg-card shadow-sm text-brand-700' : 'text-slate-500'
              )}
            >
              {d.label}
              {d.discount > 0 && (
                <span className="absolute -top-2 -right-1 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  -{d.discount}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map((plan, i) => {
          const price = plan.prices[duration];
          const monthly = Math.round(price / (duration / 30));
          const isCurrent = (currentSub?.data as any)?.plan === plan.key;
          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                'rounded-2xl border-2 p-6 relative flex flex-col',
                plan.popular ? 'border-brand-700 shadow-maroon' : 'border-border'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-maroon text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', `bg-${plan.color}-100 dark:bg-${plan.color}-900/30 text-${plan.color}-700`)}>
                <plan.icon className="w-6 h-6" />
              </div>

              <h3 className="font-display font-bold text-xl">{plan.name}</h3>
              <div className="mt-2 mb-1">
                <span className="font-bold text-3xl text-brand-700">₹{monthly.toLocaleString()}</span>
                <span className="text-sm text-slate-500">/mo</span>
              </div>
              <p className="text-xs text-slate-500 mb-5">₹{price.toLocaleString()} billed {PLAN_DURATIONS.find((d) => d.days === duration)?.label.toLowerCase()}</p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => checkoutMutation.mutate({ plan: plan.key })}
                disabled={isCurrent || checkoutMutation.isPending}
                className={cn(
                  'w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  isCurrent ? 'bg-muted text-slate-500 cursor-default' :
                  plan.popular ? 'bg-gradient-maroon text-white shadow-maroon hover:shadow-warm-lg' :
                  'border-2 border-brand-700 text-brand-700 hover:bg-brand-50'
                )}
              >
                {checkoutMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCurrent ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-sm text-slate-500">
        🔒 Secure payment via Razorpay & Cashfree · Cancel anytime · 100% safe
      </p>
    </div>
  );
};

