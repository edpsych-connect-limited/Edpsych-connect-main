'use client'

/**
 * FILE: src/components/onboarding/Navigation.tsx
 * PURPOSE: Navigation buttons for onboarding wizard
 *
 * FEATURES:
 * - Back button (disabled on step 1)
 * - Skip button (conditional based on step)
 * - Next button (conditional based on validation)
 * - Loading states
 * - Keyboard navigation (Tab, Enter, Space)
 * - WCAG 2.1 AA compliant
 *
 * ACCESSIBILITY:
 * - ARIA labels
 * - Disabled state management
 * - Focus management
 * - 4.5:1 color contrast
 */

import React from 'react';
import { ChevronLeft, ChevronRight, SkipForward, Loader2 } from 'lucide-react';

interface NavigationProps {
  // Button states
  canGoBack: boolean;
  canSkip: boolean;
  canAdvance: boolean;
  isLoading: boolean;

  // Button handlers
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;

  // Button labels (optional customization)
  backLabel?: string;
  skipLabel?: string;
  nextLabel?: string;

  // Current step (for conditional rendering)
  currentStep: number;
  isLastStep: boolean;
}

export function Navigation({
  canGoBack,
  canSkip,
  canAdvance,
  isLoading,
  onBack,
  onSkip,
  onNext,
  backLabel = 'Back',
  skipLabel = 'Skip',
  nextLabel = 'Next',
  currentStep,
  isLastStep
}: NavigationProps) {
  const handleKeyDown = (event: React.KeyboardEvent, handler: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  };

  return (
    <nav
      className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8"
      aria-label="Onboarding navigation"
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack || isLoading}
        onKeyDown={(e) => handleKeyDown(e, onBack)}
        aria-label={`Go back to previous step (Step ${currentStep - 1})`}
        aria-disabled={!canGoBack || isLoading}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
          transition-all duration-200 focus:outline-none focus:ring-4
          ${
            canGoBack && !isLoading
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-200 shadow-sm'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed opacity-60'
          }
        `}
      >
        <ChevronLeft
          className="w-5 h-5"
          aria-hidden="true"
        />
        <span>{backLabel}</span>
      </button>

      {/* Center Section: Skip Button or Progress Info */}
      <div className="flex items-center gap-4">
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            onKeyDown={(e) => handleKeyDown(e, onSkip)}
            aria-label={`Skip step ${currentStep}`}
            aria-disabled={isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200 focus:outline-none focus:ring-4
              ${
                !isLoading
                  ? 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 focus:ring-gray-200'
                  : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed opacity-60'
              }
            `}
          >
            <SkipForward
              className="w-4 h-4"
              aria-hidden="true"
            />
            <span>{skipLabel}</span>
          </button>
        )}

        {/* Optional: Step indicator text */}
        <div className="hidden sm:flex items-center text-sm text-gray-500" aria-hidden="true">
          Step {currentStep} of 6
        </div>
      </div>

      {/* Next/Complete Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canAdvance || isLoading}
        onKeyDown={(e) => handleKeyDown(e, onNext)}
        aria-label={
          isLastStep
            ? 'Complete onboarding'
            : `Go to next step (Step ${currentStep + 1})`
        }
        aria-disabled={!canAdvance || isLoading}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold
          transition-all duration-200 focus:outline-none focus:ring-4
          ${
            canAdvance && !isLoading
              ? isLastStep
                ? 'text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:ring-green-200 shadow-lg hover:shadow-xl'
                : 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-200 shadow-lg hover:shadow-xl'
              : 'text-gray-400 bg-gray-300 cursor-not-allowed opacity-60'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{isLastStep ? 'Complete' : nextLabel}</span>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>

      {/* Screen Reader Status */}
      {isLoading && (
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Processing your request, please wait...
        </div>
      )}
    </nav>
  );
}

/**
 * Compact version for mobile or constrained layouts
 */
export function NavigationCompact({
  canGoBack,
  canSkip,
  canAdvance,
  isLoading,
  onBack,
  onSkip,
  onNext,
  currentStep,
  isLastStep
}: NavigationProps) {
  return (
    <nav
      className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6"
      aria-label="Onboarding navigation"
    >
      {/* Back Button - Icon Only */}
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack || isLoading}
        aria-label={`Go back to step ${currentStep - 1}`}
        aria-disabled={!canGoBack || isLoading}
        className={`
          p-2 rounded-lg transition-all focus:outline-none focus:ring-2
          ${
            canGoBack && !isLoading
              ? 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300'
              : 'text-gray-400 cursor-not-allowed opacity-60'
          }
        `}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Center: Skip */}
      {canSkip && (
        <button
          type="button"
          onClick={onSkip}
          disabled={isLoading}
          aria-label={`Skip step ${currentStep}`}
          className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-gray-300 rounded px-2 py-1"
        >
          Skip
        </button>
      )}

      {/* Next Button - Icon Only */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canAdvance || isLoading}
        aria-label={isLastStep ? 'Complete onboarding' : `Go to step ${currentStep + 1}`}
        className={`
          p-2 rounded-lg transition-all focus:outline-none focus:ring-2
          ${
            canAdvance && !isLoading
              ? isLastStep
                ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-300'
                : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
              : 'text-gray-400 bg-gray-300 cursor-not-allowed opacity-60'
          }
        `}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <ChevronRight className="w-6 h-6" />
        )}
      </button>
    </nav>
  );
}
