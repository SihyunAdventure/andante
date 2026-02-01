'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useConvexAuth, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import { useOnboardingStore } from '@/stores/onboarding';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import QuestionStep from '@/components/onboarding/QuestionStep';
import AnalyzingStep from '@/components/onboarding/AnalyzingStep';
import AvatarChoiceStep from '@/components/onboarding/AvatarChoiceStep';
import CompleteStep from '@/components/onboarding/CompleteStep';
import PersonaImportStep from '@/components/onboarding/PersonaImportStep';
import VoiceRecordingStep from '@/components/onboarding/VoiceRecordingStep';

const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL &&
  !process.env.NEXT_PUBLIC_CONVEX_URL.includes('placeholder');
const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

const stepComponents = {
  welcome: WelcomeStep,
  questions: QuestionStep,
  'persona-import': PersonaImportStep,
  analyzing: AnalyzingStep,
  'avatar-choice': AvatarChoiceStep,
  'voice-recording': VoiceRecordingStep,
  complete: CompleteStep,
};

function OnboardingWithAuth() {
  const step = useOnboardingStore((state) => state.step);
  const setConvexUserId = useOnboardingStore((state) => state.setConvexUserId);
  const convexUserId = useOnboardingStore((state) => state.convexUserId);

  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const getOrCreate = useMutation(api.users.getOrCreate);

  useEffect(() => {
    if (!isAuthenticated || !user || convexUserId) return;

    const initUser = async () => {
      try {
        const userId = await getOrCreate({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          displayName: user.fullName ?? undefined,
        });
        setConvexUserId(userId);
      } catch (err) {
        console.error('Failed to get or create Convex user:', err);
      }
    };

    initUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  if (!isLoading && !isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const StepComponent = stepComponents[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <StepComponent />
      </motion.div>
    </AnimatePresence>
  );
}

function OnboardingWithoutAuth() {
  const step = useOnboardingStore((state) => state.step);
  const StepComponent = stepComponents[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <StepComponent />
      </motion.div>
    </AnimatePresence>
  );
}

export default function OnboardingClient() {
  if (hasClerk && hasConvex) {
    return <OnboardingWithAuth />;
  }
  return <OnboardingWithoutAuth />;
}
