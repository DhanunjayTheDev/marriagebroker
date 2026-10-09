import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Renders as a bottom sheet on mobile (slide up, rounded top, drag handle)
 * and a centered dialog card on sm+ screens (zoom/fade).
 */
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Mobile: bottom sheet
        'fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl border-t border-border shadow-warm-xl',
        'max-h-[88vh] focus:outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        // Desktop: centered dialog
        'sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2',
        'sm:w-full sm:max-w-md sm:rounded-2xl sm:border sm:max-h-[85vh]',
        'sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0',
        'sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    >
      {/* Drag handle — mobile only */}
      <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
        <div className="w-10 h-1.5 rounded-full bg-border" />
      </div>
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-3 top-3 sm:right-4 sm:top-4 p-2.5 sm:p-1.5 rounded-lg text-slate-400 hover:bg-muted hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </DialogPrimitive.Close>
      )}
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-between gap-3 px-5 pb-3 pt-1 sm:pt-0 border-b border-border flex-shrink-0', className)} {...props} />
);

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('font-display font-semibold text-lg text-brand-950', className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-slate-500', className)} {...props} />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export const SheetBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex-1 overflow-y-auto scrollbar-thin px-5 py-4', className)} {...props} />
);

export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, style, ...props }) => (
  <div
    className={cn('px-5 py-4 border-t border-border space-y-2 flex-shrink-0', className)}
    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)', ...style }}
    {...props}
  />
);
