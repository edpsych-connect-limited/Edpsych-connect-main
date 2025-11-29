'use client'

/**
 * FILE: src/components/onboarding/ProgressIndicator.tsx
 * PURPOSE: Visual progress indicator for onboarding wizard
 *
 * FEATURES:
 * - Shows 6 steps with visual indicators
 * - Highlights current step
 * - Shows completed steps (checkmark)
 * - Shows skipped steps (dash)
 * - WCAG 2.1 AA compliant
 * - Responsive design
 *
 * ACCESSIBILITY:
 * - ARIA labels for screen readers
 * - Role="progressbar" with aria-valuenow
 * - Semantic HTML
 * - 4.5:1 color contrast
 */

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { OnboardingStep, STEP_NAMES } from '@/types/onboarding';

interface ProgressIndicatorProps {
  currentStep: OnboardingStep;
  stepsCompleted: number[];
  stepsSkipped: number[];
  progressPercentage: number;
}

export function ProgressIndicator({
  currentStep,
  stepsCompleted,
  stepsSkipped,
  progressPercentage
}: ProgressIndicatorProps) {
  const steps: OnboardingStep[] = [1, 2, 3, 4, 5, 6];

  const getStepStatus = (step: OnboardingStep): 'completed' | 'current' | 'skipped' | 'upcoming' => {
    if (stepsCompleted.includes(step)) return 'completed';
    if (step === currentStep) return 'current';
    if (stepsSkipped.includes(step)) return 'skipped';
    return 'upcoming';
  };

  const getStepClasses = (step: OnboardingStep): string => {
    const status = getStepStatus(step);

    const baseClasses = 'relative flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all duration-300';

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-600 border-green-600 text-white`;
      case 'current':
        return `${baseClasses} bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-200 shadow-lg`;
      case 'skipped':
        return `${baseClasses} bg-gray-300 border-gray-400 text-gray-600`;
      case 'upcoming':
        return `${baseClasses} bg-white border-gray-300 text-gray-500`;
      default:
        return baseClasses;
    }
  };

  const getConnectorClasses = (fromStep: OnboardingStep): string => {
    const toStep = (fromStep + 1) as OnboardingStep;
    const fromStatus = getStepStatus(fromStep);
    const toStatus = getStepStatus(toStep);

    const baseClasses = 'flex-1 h-1 mx-2 rounded transition-all duration-300';

    if (fromStatus === 'completed' && (toStatus === 'completed' || toStatus === 'current')) {
      return `${baseClasses} bg-green-600`;
    }
    if (fromStatus === 'current' || fromStatus === 'completed') {
      return `${baseClasses} bg-indigo-300`;
    }
    return `${baseClasses} bg-gray-300`;
  };

  const getStepLabelClasses = (step: OnboardingStep): string => {
    const status = getStepStatus(step);
    const baseClasses = 'mt-2 text-xs font-medium text-center transition-colors duration-300';

    switch (status) {
      case 'completed':
        return `${baseClasses} text-green-700`;
      case 'current':
        return `${baseClasses} text-indigo-700 font-semibold`;
      case 'skipped':
        return `${baseClasses} text-gray-500 line-through`;
      case 'upcoming':
        return `${baseClasses} text-gray-400`;
      default:
        return baseClasses;
    }
  };

  const ariaProps = {
    'aria-valuenow': Math.round(progressPercentage),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  };

  return (
    <div className="w-full mb-8">
      {/* Progress Bar Container */}
      <div
        role="progressbar"
        {...ariaProps}
        aria-label={`Onboarding progress: ${Math.round(progressPercentage)}% complete, on step ${currentStep} of 6: ${STEP_NAMES[currentStep]}`}
        className="w-full"
      >
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 6
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out progress-bar"
              aria-hidden="true"
            />
            <style jsx>{`
              .progress-bar {
                width: ${progressPercentage}%;
              }
            `}</style>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step);

            return (
              <React.Fragment key={step}>
                {/* Step Circle */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={getStepClasses(step)}
                    aria-label={`Step ${step}: ${STEP_NAMES[step]} - ${status}`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" aria-hidden="true" />
                    ) : status === 'skipped' ? (
                      <Minus className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <span className="text-sm">{step}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <p className={getStepLabelClasses(step)}>
                    {STEP_NAMES[step]}
                  </p>
                </div>

                {/* Connector Line (not after last step) */}
                {index < steps.length - 1 && (
                  <div
                    className={getConnectorClasses(step)}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Status Text (Screen Reader) */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          You are currently on step {currentStep} of 6: {STEP_NAMES[currentStep]}.
          {stepsCompleted.length > 0 && ` You have completed ${stepsCompleted.length} step${stepsCompleted.length === 1 ? '' : 's'}.`}
          {stepsSkipped.length > 0 && ` You have skipped ${stepsSkipped.length} step${stepsSkipped.length === 1 ? '' : 's'}.`}
        </div>
      </div>
    </div>
  );
}
