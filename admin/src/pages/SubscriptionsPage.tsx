import React from 'react';
import { CreditCard, Edit, Crown, Star, Sparkles, Shield, Users as UsersIcon } from 'lucide-react';
import { PageHeader } from '../components/common';
import { Card, CardContent, Button, Badge } from '../components/ui';
import { formatCurrency } from '../lib/utils';

const PLANS = [
  { key: 'free', name: 'Free', icon: UsersIcon, price: 0, subscribers: 32400, features: 4 },
  { key: 'silver', name: 'Silver', icon: Star, price: 999, subscribers: 8200, features: 8 },
  { key: 'gold', name: 'Gold', icon: Sparkles, price: 1999, subscribers: 6100, features: 14, popular: true },
  { key: 'platinum', name: 'Platinum', icon: Crown, price: 3499, subscribers: 2800, features: 20 },
  { key: 'elite', name: 'Elite', icon: Shield, price: 5999, subscribers: 920, features: 26 },
  { key: 'vip_assisted', name: 'VIP Assisted', icon: Crown, price: 9999, subscribers: 240, features: 30 },
];

export const SubscriptionsPage: React.FC = () => (
  <div>
    <PageHeader title="Subscription Management" description="Manage plans, pricing, features, and entitlements" />
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PLANS.map((plan) => (
        <Card key={plan.key} className={plan.popular ? 'ring-2 ring-secondary' : ''}>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary"><plan.icon className="w-5 h-5" /></div>
              {plan.popular && <Badge variant="warning">Popular</Badge>}
            </div>
            <h3 className="font-display font-semibold text-lg mt-3">{plan.name}</h3>
            <div className="text-2xl font-bold text-primary mt-1">{plan.price === 0 ? 'Free' : formatCurrency(plan.price)}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>{plan.subscribers.toLocaleString()} subscribers</span>
              <span>{plan.features} features</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4"><Edit className="w-4 h-4" /> Edit Plan</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
