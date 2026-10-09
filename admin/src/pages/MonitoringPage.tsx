import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Database, Radio, HardDrive, Activity, CheckCircle2, AlertCircle, Cpu, Users, MessageSquare, CreditCard } from 'lucide-react';
import { dataService } from '../services';
import { PageHeader } from '../components/common';
import { Card, CardContent, Badge, Skeleton } from '../components/ui';
import { formatCompact } from '../lib/utils';

interface Health {
  api: { status: string; uptimeSeconds: number; memoryMB: number };
  database: { status: string };
  redis: { status: string };
  counts: { users: number; conversations: number; payments: number };
}

const fmtUptime = (s: number) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const MonitoringPage: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['monitoring'], queryFn: () => dataService.monitoringHealth(), refetchInterval: 15000 });
  const h = data?.data as Health | undefined;

  const ok = (s?: string) => s === 'healthy' || s === 'connected' || s === 'enabled';

  return (
    <div>
      <PageHeader title="System Monitoring" description="Live infrastructure health — auto-refreshes every 15s" />

      {isLoading || !h ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <HealthCard icon={Server} name="API Server" status="healthy" metric={`Uptime ${fmtUptime(h.api.uptimeSeconds)}`} />
            <HealthCard icon={Database} name="MongoDB" status={h.database.status} metric={h.database.status} />
            <HealthCard icon={Radio} name="Redis" status={h.redis.status === 'enabled' ? 'healthy' : 'degraded'} metric={h.redis.status} />
            <HealthCard icon={Cpu} name="Memory (RSS)" status="healthy" metric={`${h.api.memoryMB} MB`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CountCard icon={Users} name="Users" value={h.counts.users} />
            <CountCard icon={MessageSquare} name="Conversations" value={h.counts.conversations} />
            <CountCard icon={CreditCard} name="Payments" value={h.counts.payments} />
          </div>
        </>
      )}
    </div>
  );
};

const HealthCard: React.FC<{ icon: React.ElementType; name: string; status: string; metric: string }> = ({ icon: Icon, name, status, metric }) => {
  const healthy = status === 'healthy' || status === 'connected' || status === 'enabled';
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary"><Icon className="w-5 h-5" /></div>
          <Badge variant={healthy ? 'success' : 'warning'}>
            {healthy ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {healthy ? 'healthy' : status}
          </Badge>
        </div>
        <h3 className="font-semibold mt-3">{name}</h3>
        <p className="text-sm text-muted-foreground capitalize">{metric}</p>
      </CardContent>
    </Card>
  );
};

const CountCard: React.FC<{ icon: React.ElementType; name: string; value: number }> = ({ icon: Icon, name, value }) => (
  <Card>
    <CardContent className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center text-primary"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-2xl font-bold tnum">{formatCompact(value)}</div>
        <div className="text-sm text-muted-foreground">{name}</div>
      </div>
    </CardContent>
  </Card>
);
