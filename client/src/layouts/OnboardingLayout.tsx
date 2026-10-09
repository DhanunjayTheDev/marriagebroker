import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Heart, CheckCircle2, Circle } from 'lucide-react';
import { useOnboardingStore } from '../store';
import { ONBOARDING_STEPS } from '../constants';
import { cn } from '../lib/utils';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  const { currentStep, completedSteps } = useOnboardingStore();
  const progressPercent = Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: step navigator */}
      <aside className="lg:w-80 xl:w-96 bg-white dark:bg-card border-r border-border lg:fixed lg:inset-y-0 lg:left-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-maroon flex items-center justify-center shadow-maroon">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none text-brand-800">Avyuktha</div>
              <div className="text-[10px] text-gold-600 tracking-widest uppercase">Matrimony</div>
            </div>
          </Link>

          <div className="mt-6">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-medium">Profile Completion</span>
              <span className="font-bold text-brand-700">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-maroon rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {completedSteps.length} of {ONBOARDING_STEPS.length} sections complete
            </p>
          </div>
        </div>

        {/* Steps list */}
        <nav className="overflow-y-auto scrollbar-thin" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="p-4 space-y-1">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.step);
              const isActive = currentStep === step.step;
              const isLocked = !isCompleted && step.step > currentStep;

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left',
                      isActive && 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm',
                      isCompleted && !isActive && 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50',
                      !isActive && !isCompleted && 'text-slate-500',
                      isLocked && 'opacity-40 cursor-not-allowed',
                      !isLocked && !isActive && 'hover:bg-muted cursor-pointer'
                    )}
                    disabled={isLocked}
                  >
                    {/* Step indicator */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full border-2 border-brand-700 bg-brand-700 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{step.step}</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                          <span className="text-[10px] text-slate-500">{step.step}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={cn('font-medium truncate', isActive && 'font-semibold')}>{step.title}</div>
                      <div className="text-xs text-slate-500 truncate">{step.description}</div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Right: step content */}
      <main className="flex-1 lg:ml-80 xl:ml-96 min-h-screen flex flex-col">
        {/* Mobile progress bar */}
        <div className="lg:hidden bg-white dark:bg-card border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-maroon rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-brand-700">{progressPercent}%</span>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center p-4 lg:p-8 xl:p-12">
          <div className="w-full max-w-2xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

