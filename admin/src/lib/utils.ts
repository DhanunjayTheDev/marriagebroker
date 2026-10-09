import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (date?: string | Date, mode: 'short' | 'long' | 'datetime' | 'relative' = 'short'): string => {
  if (!date) return '';
  const d = new Date(date);
  if (mode === 'relative') {
    const diff = Date.now() - d.getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (mode === 'long') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  if (mode === 'datetime') return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

export const formatCompact = (n: number): string => {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

export const getInitials = (first?: string, last?: string): string =>
  `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}` || '?';

export const calculateAge = (dob?: string): number => {
  if (!dob) return 0;
  const b = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
};

export const debounce = <T extends (...a: never[]) => void>(fn: T, ms: number) => {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    active: 'text-success bg-success/10', approved: 'text-success bg-success/10',
    paid: 'text-success bg-success/10', resolved: 'text-success bg-success/10',
    pending: 'text-warning bg-warning/10', under_review: 'text-warning bg-warning/10', open: 'text-warning bg-warning/10',
    suspended: 'text-destructive bg-destructive/10', rejected: 'text-destructive bg-destructive/10',
    failed: 'text-destructive bg-destructive/10', banned: 'text-destructive bg-destructive/10',
    deactivated: 'text-muted-foreground bg-muted', expired: 'text-muted-foreground bg-muted',
  };
  return map[status] ?? 'text-muted-foreground bg-muted';
};
