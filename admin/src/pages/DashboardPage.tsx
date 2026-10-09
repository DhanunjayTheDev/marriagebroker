import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, UserCheck, UserPlus, ShieldCheck, Crown, IndianRupee,
  Headphones, Heart,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { adminService, dataService } from '../services';
import { PageHeader, StatCard } from '../components/common';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '../components/ui';
import { useRealtimeStore } from '../store';
import { formatCompact, formatCurrency, formatDate } from '../lib/utils';
import type { DashboardStats } from '../types';

const PLAN_COLORS: Record<string, string> = {
  free: 'hsl(var(--muted-foreground))',
  silver: 'hsl(var(--chart-4))',
  gold: 'hsl(var(--chart-3))',
  platinum: 'hsl(var(--chart-1))',
  elite: 'hsl(var(--chart-6))',
  vip_assisted: 'hsl(var(--chart-5))',
};

interface Charts {
  registrations: { day: string; registrations: number; verified: number }[];
  revenue: { month: string; revenue: number }[];
  planDistribution: { name: string; value: number }[];
  funnel: { stage: string; value: number }[];
}

const tooltipStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12, color: 'hsl(var(--foreground))' };

export const DashboardPage: React.FC = () => {
  const { alerts } = useRealtimeStore();
  const { data: statsRes } = useQuery({ queryKey: ['dashboard'], queryFn: () => adminService.getDashboard(), refetchInterval: 30000 });
  const { data: chartsRes, isLoading: chartsLoading } = useQuery({ queryKey: ['dashboard-charts'], queryFn: () => dataService.dashboardCharts(), refetchInterval: 60000 });

  const stats = (statsRes?.data ?? {}) as DashboardStats;
  const charts = (chartsRes?.data ?? { registrations: [], revenue: [], planDistribution: [], funnel: [] }) as Charts;

  const premiumCount = charts.planDistribution.filter((p) => p.name !== 'free').reduce((s, p) => s + p.value, 0);

  return (
    <div>
      <PageHeader title="Dashboard" description="Real-time platform overview and operational metrics" />

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={formatCompact(stats.users?.total ?? 0)} icon={Users} color="primary" live />
        <StatCard title="Active Users" value={formatCompact(stats.users?.active ?? 0)} icon={UserCheck} color="success" />
        <StatCard title="New Today" value={stats.users?.todayRegistrations ?? 0} icon={UserPlus} color="chart-4" />
        <StatCard title="Total Revenue" value={formatCurrency(stats.revenue?.total ?? 0)} icon={IndianRupee} color="warning" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Pending Verifications" value={stats.verifications?.pending ?? 0} icon={ShieldCheck} color="warning" live />
        <StatCard title="Open Tickets" value={stats.tickets?.open ?? 0} icon={Headphones} color="destructive" live />
        <StatCard title="Premium Users" value={formatCompact(premiumCount)} icon={Crown} color="chart-6" />
        <StatCard title="Live Alerts" value={alerts.length} icon={Heart} color="info" live />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Registrations & Verifications (7 days)</CardTitle></CardHeader>
          <CardContent>
            {chartsLoading ? <Skeleton className="h-[280px]" /> : charts.registrations.length === 0 ? (
              <EmptyChart label="No registrations in the last 7 days" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={charts.registrations}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="registrations" stroke="hsl(var(--chart-1))" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="verified" stroke="hsl(var(--chart-2))" fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscription Distribution</CardTitle></CardHeader>
          <CardContent>
            {chartsLoading ? <Skeleton className="h-[280px]" /> : charts.planDistribution.length === 0 ? (
              <EmptyChart label="No subscription data" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={charts.planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {charts.planDistribution.map((e, i) => <Cell key={i} fill={PLAN_COLORS[e.name] ?? 'hsl(var(--chart-1))'} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Revenue Trend (6 months)</CardTitle></CardHeader>
          <CardContent>
            {chartsLoading ? <Skeleton className="h-[240px]" /> : charts.revenue.length === 0 ? (
              <EmptyChart label="No revenue recorded yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={charts.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCompact(v)} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--warning))" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
          <CardContent>
            {chartsLoading ? <Skeleton className="h-[240px]" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={charts.funnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCompact(v)} allowDecimals={false} />
                  <YAxis type="category" dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} width={70} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Realtime alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live Activity Feed</CardTitle>
          <span className="flex items-center gap-1 text-xs text-success font-medium"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />Real-time</span>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No live activity yet. Socket events appear here in real-time.</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 8).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm flex-1">{alert.message}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(alert.at, 'relative')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const EmptyChart: React.FC<{ label: string }> = ({ label }) => (
  <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">{label}</div>
);
