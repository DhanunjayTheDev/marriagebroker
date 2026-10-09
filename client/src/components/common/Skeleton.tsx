import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('skeleton', className)} {...props} />
);

export const ProfileCardSkeleton: React.FC = () => (
  <div className="profile-card">
    <Skeleton className="aspect-[4/5] rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <div className="flex divide-x divide-border">
      <Skeleton className="flex-1 h-12 rounded-none" />
      <Skeleton className="flex-1 h-12 rounded-none" />
    </div>
  </div>
);

export const ProfileGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProfileCardSkeleton key={i} />
    ))}
  </div>
);

export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-32 rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <ProfileGridSkeleton count={4} />
  </div>
);
