import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, IndianRupee, Heart, Gift } from 'lucide-react';
import { dataService } from '../services';
import { PageHeader, StatCard } from '../components/common';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '../components/ui';
import { formatCompact, formatCurrency } from '../lib/utils';

interface Overview {
  growth: { month: string; users: number; premium: number }[];
  totalRevenue: number;
  marriages: number;
  totalInterests: number;
  referrals: number;
  marriageConversion: number;
}

const tooltipStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 };

export const AnalyticsPage: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-overview'], queryFn: () => dataService.analyticsOverview() });
  const o = (data?.data ?? { growth: [], totalRevenue: 0, marriages: 0, totalInterests: 0, referrals: 0, marriageConversion: 0 }) as Overview;

  return (
    <div>
      <PageHeader title="Analytics" description="Platform metrics, conversions, and growth — live from the database" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={formatCurrency(o.totalRevenue)} icon={IndianRupee} color="warning" />
        <StatCard title="Total Interests" value={formatCompact(o.totalInterests)} icon={Heart} color="primary" />
        <StatCard title="Marriages" value={formatCompact(o.marriages)} icon={Heart} color="chart-6" />
        <StatCard title="Referrals" value={formatCompact(o.referrals)} icon={Gift} color="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>User & Premium Growth (6 months)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[280px]" /> : o.growth.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={o.growth}>
                  <defs>
                    <linearGradient id="au" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} /></linearGradient>
                    <linearGradient id="ap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCompact} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" fill="url(#au)" strokeWidth={2} />
                  <Area type="monotone" dataKey="premium" stroke="hsl(var(--chart-2))" fill="url(#ap)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Marriage Conversion</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[280px]">
              <div className="text-6xl font-display font-bold text-primary">{o.marriageConversion}%</div>
              <p className="text-sm text-muted-foreground mt-3">of interests lead to marriage</p>
              <div className="grid grid-cols-2 gap-6 mt-8 text-center">
                <div><div className="text-2xl font-bold tnum">{formatCompact(o.totalInterests)}</div><div className="text-xs text-muted-foreground">Interests sent</div></div>
                <div><div className="text-2xl font-bold tnum">{formatCompact(o.marriages)}</div><div className="text-xs text-muted-foreground">Marriages</div></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly New Users</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-[240px]" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={o.growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCompact} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
