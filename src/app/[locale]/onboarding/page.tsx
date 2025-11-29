/**
 * FILE: src/app/onboarding/page.tsx
 * PURPOSE: Onboarding wizard entry page
 *
 * ROUTE: /onboarding
 * AUTH: Required
 *
 * FEATURES:
 * - Wraps OnboardingWizard with OnboardingProvider
 * - Handles authentication check
 * - Redirects to login if not authenticated
 */

import { Metadata } from 'next';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export const metadata: Metadata = {
  title: 'Welcome to EdPsych Connect World | Onboarding',
  description: 'Get started with EdPsych Connect World in just a few steps. Complete your profile, explore key features, and set up your first case.',
};

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
