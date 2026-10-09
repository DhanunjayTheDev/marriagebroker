import React from 'react';
import { cn, getInitials } from '../../lib/utils';
import { BadgeCheck } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  verified?: boolean;
  online?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
};

const BADGE_SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-3 h-3 -right-0.5 -top-0.5',
  sm: 'w-3.5 h-3.5 -right-0.5 -top-0.5',
  md: 'w-4 h-4 -right-0.5 -top-0.5',
  lg: 'w-5 h-5 -right-0 -top-0',
  xl: 'w-6 h-6 -right-1 -top-1',
  '2xl': 'w-7 h-7 -right-1 -top-1',
};

const ONLINE_SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-2 h-2 bottom-0 right-0',
  sm: 'w-2 h-2 bottom-0 right-0',
  md: 'w-2.5 h-2.5 bottom-0 right-0',
  lg: 'w-3 h-3 bottom-0.5 right-0.5',
  xl: 'w-4 h-4 bottom-0.5 right-0.5',
  '2xl': 'w-5 h-5 bottom-1 right-1',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  verified,
  online,
  className,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const initials = name ? getInitials(name.split(' ')[0], name.split(' ')[1]) : '?';

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold',
          'bg-gradient-maroon text-white ring-2 ring-offset-1 ring-transparent',
          SIZE_CLASSES[size]
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name ?? 'User'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {verified && (
        <div className={cn('absolute rounded-full bg-white dark:bg-background', BADGE_SIZES[size])}>
          <BadgeCheck className="w-full h-full text-brand-700" fill="currentColor" />
        </div>
      )}

      {online && (
        <div
          className={cn(
            'absolute rounded-full bg-emerald-500 ring-2 ring-white dark:ring-background',
            ONLINE_SIZES[size]
          )}
        />
      )}
    </div>
  );
};
