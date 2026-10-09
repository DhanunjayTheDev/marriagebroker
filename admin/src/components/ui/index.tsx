import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export { Button, buttonVariants } from './button';

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('bg-card text-card-foreground rounded-xl border border-border', className)} {...props} />
);
Card.displayName = 'Card';
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => <div className={cn('p-5 border-b border-border', className)} {...p} />;
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...p }) => <h3 className={cn('font-semibold', className)} {...p} />;
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => <div className={cn('p-5', className)} {...p} />;

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-primary/10 text-primary',
      secondary: 'bg-muted text-muted-foreground',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      destructive: 'bg-destructive/10 text-destructive',
      outline: 'border border-border text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});
export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>> = ({ className, variant, ...p }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...p} />
);

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variant = ['active', 'approved', 'paid', 'resolved', 'completed'].includes(status) ? 'success'
    : ['pending', 'under_review', 'open', 'reopened'].includes(status) ? 'warning'
    : ['suspended', 'rejected', 'failed', 'banned', 'cancelled'].includes(status) ? 'destructive'
    : 'secondary';
  return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>;
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn('flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground disabled:opacity-50', className)} {...props} />
  )
);
Input.displayName = 'Input';

// ─── Select (custom, Radix-based) ─────────────────────────────────────────────
export {
  Select, SelectGroup, SelectValue, SelectTrigger, SelectContent,
  SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton,
} from './select';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => <div className={cn('skeleton', className)} {...p} />;

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 8, cols = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3">
        {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className="h-9 flex-1" />)}
      </div>
    ))}
  </div>
);
