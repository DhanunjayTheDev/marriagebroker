import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
      <Icon className="w-9 h-9 text-slate-500" />
    </div>
    <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

