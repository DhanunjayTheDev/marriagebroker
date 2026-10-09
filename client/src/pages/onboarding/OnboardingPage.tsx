import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check, SkipForward } from 'lucide-react';
import { useOnboardingStore } from '../../store';
import { useAuth } from '../../providers/AuthProvider';
import { profileService } from '../../services/profile.service';
import { ONBOARDING_STEPS } from '../../constants';
import { StepBasic } from './steps/StepBasic';
import { StepPhotos } from './steps/StepPhotos';
import { StepEducation } from './steps/StepEducation';
import { StepGeneric } from './steps/StepGeneric';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const { currentStep, completedSteps, setStep, completeStep, getStepData } = useOnboardingStore();

  const step = ONBOARDING_STEPS.find((s) => s.step === currentStep) ?? ONBOARDING_STEPS[0];
  const isLastStep = currentStep === ONBOARDING_STEPS.length;

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => profileService.updateProfile(data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      refetchUser();
    },
  });

  const handleNext = async (data?: Record<string, unknown>) => {
    if (data) {
      await saveMutation.mutateAsync(data).catch(() => null);
    }
    completeStep(currentStep, data);

    if (isLastStep) {
      toast.success('Profile complete! Welcome to Avyuktha 🎉');
      navigate({ to: '/dashboard' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setStep(currentStep - 1);
  };

  const handleSkip = () => {
    if (isLastStep) {
      navigate({ to: '/dashboard' });
    } else {
      setStep(currentStep + 1);
    }
  };

  const renderStep = () => {
    const commonProps = {
      onNext: handleNext,
      initialData: getStepData(currentStep) as Record<string, unknown> | undefined,
      isSaving: saveMutation.isPending,
    };

    switch (currentStep) {
      case 1: return <StepBasic {...commonProps} />;
      case 2: return <StepPhotos {...commonProps} />;
      case 3: return <StepEducation {...commonProps} />;
      default: return <StepGeneric {...commonProps} step={currentStep} />;
    }
  };

  return (
    <div>
      {/* Step header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>Step {currentStep} of {ONBOARDING_STEPS.length}</span>
          <span>•</span>
          <span>{Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100)}% complete</span>
        </div>
        <h1 className="font-display font-bold text-3xl mb-2">{step.title}</h1>
        <p className="text-slate-500">{step.description}</p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-muted transition-colors disabled:opacity-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
          Skip for now
        </button>
      </div>
    </div>
  );
};

