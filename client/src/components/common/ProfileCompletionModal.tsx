import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { X, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Sheet, SheetContent } from '../ui/sheet';
import { cn } from '../../lib/utils';

interface Section {
  key: string;
  label: string;
  filled: boolean;
}

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
  score: number;
  sections: Section[];
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  open,
  onClose,
  score,
  sections,
}) => {
  const navigate = useNavigate();

  const goToSection = (key: string) => {
    sessionStorage.setItem('edit-section', key);
    onClose();
    navigate({ to: '/profile/edit' });
  };

  const incomplete = sections.filter((s) => !s.filled);
  const complete = sections.filter((s) => s.filled);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent hideClose className="sm:max-w-lg">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden">
              {/* Header gradient */}
              <div className="bg-gradient-brand px-6 pt-6 pb-8 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-white">Complete Your Profile</h2>
                    <p className="text-white/70 text-xs mt-0.5">More complete profiles get 5× more matches</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80 font-medium">Profile completion</span>
                    <span className="text-white font-bold">{score}%</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {incomplete.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Sections to complete ({incomplete.length})
                    </p>
                    <div className="space-y-2">
                      {incomplete.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => goToSection(s.key)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border hover:border-brand-300 hover:bg-brand-50 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-sm font-medium text-foreground">{s.label}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-brand-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            Fill now <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {complete.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Completed sections ({complete.length})
                    </p>
                    <div className="space-y-1.5">
                      {complete.map((s) => (
                        <div key={s.key} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-emerald-800">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-2 flex gap-3">
                {incomplete.length > 0 ? (
                  <>
                    <button
                      onClick={() => goToSection(incomplete[0].key)}
                      className="btn-luxury flex-1 py-2.5 text-sm"
                    >
                      Complete Profile
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-slate-500 hover:bg-muted transition-colors"
                    >
                      Later
                    </button>
                  </>
                ) : (
                  <button onClick={onClose} className="btn-luxury flex-1 py-2.5 text-sm">
                    Close
                  </button>
                )}
              </div>
            </div>
      </SheetContent>
    </Sheet>
  );
};

