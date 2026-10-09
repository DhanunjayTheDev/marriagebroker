import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';

export { DataTable } from './DataTable';

// ─── PageHeader ───────────────────────────────────────────────────────────────
export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode }> = ({ title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground text-sm mt-0.5">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  color?: string;
  live?: boolean;
}> = ({ title, value, icon: Icon, change, changeLabel, color = 'primary', live }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', `bg-${color}/10 text-${color}`)} style={{ backgroundColor: `hsl(var(--${color}) / 0.1)`, color: `hsl(var(--${color}))` }}>
        <Icon className="w-5 h-5" />
      </div>
      {live && <span className="flex items-center gap-1 text-[10px] text-success font-medium"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />LIVE</span>}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
    {change !== undefined && (
      <div className="flex items-center gap-1 mt-2 text-xs">
        <span className={cn('flex items-center gap-0.5 font-medium', change >= 0 ? 'text-success' : 'text-destructive')}>
          {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
        {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
      </div>
    )}
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar: React.FC<{ src?: string; name?: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ src, name, size = 'md', className }) => {
  const [err, setErr] = React.useState(false);
  const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };
  return (
    <div className={cn('rounded-full overflow-hidden flex items-center justify-center bg-primary/10 text-primary font-semibold flex-shrink-0', sizes[size], className)}>
      {src && !err ? <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} /> : <span>{getInitials(name?.split(' ')[0], name?.split(' ')[1])}</span>}
    </div>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-muted-foreground" /></div>
    <h3 className="font-semibold mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

// ─── FilterBar ────────────────────────────────────────────────────────────────
export const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap items-center gap-2 mb-4">{children}</div>
);

// ─── PermissionGate ───────────────────────────────────────────────────────────
import { useAuthStore } from '../../store';
import { hasPermission, type Permission } from '../../permissions';

export const PermissionGate: React.FC<{ permission: Permission; children: React.ReactNode; fallback?: React.ReactNode }> = ({ permission, children, fallback }) => {
  const { user } = useAuthStore();
  if (!hasPermission(user?.role, permission)) return <>{fallback ?? null}</>;
  return <>{children}</>;
};
