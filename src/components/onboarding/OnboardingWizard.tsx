'use client'

/**
 * FILE: src/components/onboarding/OnboardingWizard.tsx
 * PURPOSE: Main container for onboarding wizard
 *
 * FEATURES:
 * - Orchestrates entire onboarding flow
 * - Conditionally renders step components
 * - Displays progress indicator
 * - Shows navigation controls
 * - Handles loading/error states
 * - WCAG 2.1 AA compliant
 * - Responsive design (desktop, tablet, mobile)
 *
 * USAGE:
 * <OnboardingProvider>
 *   <OnboardingWizard />
 * </OnboardingProvider>
 */

import { logger } from "@/lib/logger";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, PartyPopper } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { ProgressIndicator } from './ProgressIndicator';
import { Navigation } from './Navigation';

// Step components
import { Step1Welcome } from './steps/Step1Welcome';
import { Step2RoleSelection } from './steps/Step2RoleSelection';
import { Step3ProfileSetup } from './steps/Step3ProfileSetup';
import { Step4FeatureTour } from './steps/Step4FeatureTour';
import { Step5QuickWins } from './steps/Step5QuickWins';
import { Step6Completion } from './steps/Step6Completion';

interface OnboardingWizardProps {
  className?: string;
}

export function OnboardingWizard({ className = '' }: OnboardingWizardProps) {
  const {
    state,
    startOnboarding,
    goToNextStep,
    goToPreviousStep,
    skipCurrentStep,
    canCompleteStep,
    refreshStatus,
    skipOnboarding
  } = useOnboarding();

  const router = useRouter();

  // Initialize onboarding on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshStatus();

        // If not started, start it
        if (state.currentStep === 1 && !state.timeStarted) {
          await startOnboarding();
        }
      } catch (_error) {
        console.error('[OnboardingWizard] Initialization error:', _error);
      }
    };

    initialize();
  }, [refreshStatus, startOnboarding, state.currentStep, state.timeStarted]); // Run once on mount

  // Redirect if already completed
  useEffect(() => {
    if (state.onboardingCompleted) {
      logger.debug('[OnboardingWizard] Onboarding already completed, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [state.onboardingCompleted, router]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Skip keyboard shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Arrow keys for navigation (if not focused on a button)
      if (event.key === 'ArrowRight' && state.canAdvance && !state.isLoading) {
        goToNextStep();
      } else if (event.key === 'ArrowLeft' && state.canGoBack && !state.isLoading) {
        goToPreviousStep();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.canAdvance, state.canGoBack, state.isLoading, goToNextStep, goToPreviousStep]);

  // Render loading state (initial load)
  if (state.isLoading && !state.timeStarted) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${className}`}
        role="status"
        aria-live="polite"
        aria-label="Loading onboarding wizard"
      >
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">
          Preparing your onboarding experience...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This will only take a moment
        </p>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-200">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {state.error}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all"
            >
              Reload Page
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLastStep = state.currentStep === 6;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${className}`}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome to EdPsych Connect World
                </h1>
                <p className="text-sm text-gray-600">
                  Let's get you set up in just a few steps
                </p>
              </div>
            </div>

            {/* Exit button (optional) */}
            <button
              onClick={() => skipOnboarding()}
              className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1"
              aria-label="Exit onboarding and go to dashboard"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
        aria-label="Onboarding wizard content"
      >
        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={state.currentStep}
          stepsCompleted={state.stepsCompleted}
          stepsSkipped={state.stepsSkipped}
          progressPercentage={state.progressPercentage}
        />

        {/* Step Content Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 mb-8 min-h-[500px]">
          {renderStepContent(state.currentStep)}
        </div>

        {/* Navigation */}
        <Navigation
          canGoBack={state.canGoBack}
          canSkip={state.canSkip}
          canAdvance={canCompleteStep(state.currentStep)}
          isLoading={state.isLoading}
          onBack={goToPreviousStep}
          onSkip={() => skipCurrentStep()}
          onNext={goToNextStep}
          currentStep={state.currentStep}
          isLastStep={isLastStep}
        />

        {/* Helpful Tips */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            💡 <strong>Tip:</strong> Use arrow keys to navigate between steps.
            {state.canSkip && ' You can skip optional steps at any time.'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>
              Need help? Visit our{' '}
              <a
                href="/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
              >
                Help Centre
              </a>
            </p>
            <p>
              Time spent: {Math.floor(state.totalTimeSpent / 60)} min{' '}
              {state.totalTimeSpent % 60} sec
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Renders the appropriate step component based on current step
 */
function renderStepContent(step: number): React.ReactNode {
  switch (step) {
    case 1:
      return <Step1Welcome />;
    case 2:
      return <Step2RoleSelection />;
    case 3:
      return <Step3ProfileSetup />;
    case 4:
      return <Step4FeatureTour />;
    case 5:
      return <Step5QuickWins />;
    case 6:
      return <Step6Completion />;
    default:
      return <div>Unknown step</div>;
  }
}
