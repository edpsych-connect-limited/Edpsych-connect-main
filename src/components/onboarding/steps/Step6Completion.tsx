'use client'

/**
 * FILE: src/components/onboarding/steps/Step6Completion.tsx
 * PURPOSE: Step 6 - Completion screen with certificate and next steps
 *
 * FEATURES:
 * - Completion celebration
 * - Certificate generation
 * - Next steps recommendations
 * - Dashboard tour option
 * - Success metrics recap
 * - WCAG 2.1 AA compliant
 */

import { logger } from "@/lib/logger";
import React, { useState, useEffect } from 'react';
import {
  PartyPopper,
  Award,
  Download,
  ArrowRight,
  Check,
  Brain,
  FileText as _FileText,
  Target,
  TrendingUp,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import { useRouter as _useRouter } from 'next/navigation';

export function Step6Completion() {
  const { state, completeOnboarding } = useOnboarding();
  const _router = _useRouter();
  const [certificateViewed, setCertificateViewed] = useState(state.step6Data.certificateViewed || false);
  const [selectedNextAction, setSelectedNextAction] = useState<string | null>(null);

  // Show confetti animation on mount
  useEffect(() => {
    // In production, trigger confetti animation here
    logger.debug('🎉 Onboarding completed!');
  }, []);

  const handleDownloadCertificate = () => {
    setCertificateViewed(true);
    // TODO: In production, generate and download actual certificate
    logger.debug('Downloading certificate...');
    alert('Certificate download would start here (feature in development)');
  };

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding({
        nextAction: selectedNextAction || 'dashboard'
      });
      // Redirect handled by OnboardingWizard
    } catch (_error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const nextActions = [
    {
      id: 'dashboard',
      icon: TrendingUp,
      title: 'Go to Dashboard',
      description: 'View your personalized dashboard and start working',
      url: '/dashboard',
      color: 'indigo',
      primary: true
    },
    {
      id: 'assessment',
      icon: Brain,
      title: 'Start Your First Assessment',
      description: 'Use the ECCA framework for a real student',
      url: '/assessments/new',
      color: 'purple',
      primary: false
    },
    {
      id: 'interventions',
      icon: Target,
      title: 'Browse Interventions',
      description: 'Explore 69 evidence-based interventions',
      url: '/interventions',
      color: 'green',
      primary: false
    },
    {
      id: 'training',
      icon: GraduationCap,
      title: 'Take a Training Course',
      description: 'Earn CPD certificates and expand your skills',
      url: '/training/marketplace',
      color: 'orange',
      primary: false
    }
  ];

  const completionStats = [
    {
      label: 'Time Spent',
      value: `${Math.floor(state.totalTimeSpent / 60)} min`,
      icon: '⏱️'
    },
    {
      label: 'Steps Completed',
      value: `${state.stepsCompleted.length} of 6`,
      icon: '✅'
    },
    {
      label: 'Features Explored',
      value: `${state.step4Data.featuresViewed.length}`,
      icon: '🔍'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, {
      bg: string;
      border: string;
      icon: string;
      button: string;
      buttonHover: string;
    }> = {
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600',
        button: 'bg-indigo-600',
        buttonHover: 'hover:bg-indigo-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        button: 'bg-purple-600',
        buttonHover: 'hover:bg-purple-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        button: 'bg-green-600',
        buttonHover: 'hover:bg-green-700'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        button: 'bg-orange-600',
        buttonHover: 'hover:bg-orange-700'
      }
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="space-y-8">
      {/* Celebration Header */}
      <div className="text-center relative">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
          <PartyPopper className="w-10 h-10 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Congratulations! 🎉
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You&apos;ve successfully completed the onboarding. You&apos;re now ready to transform your SEND practice with EdPsych Connect World!
        </p>
      </div>

      {/* Completion Stats */}
      <div className="grid grid-cols-3 gap-4">
        {completionStats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 text-center"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Certificate Section */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8 text-amber-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your Onboarding Certificate
            </h3>
            <p className="text-gray-600 mb-4">
              Download your certificate of completion to add to your professional portfolio. This demonstrates your commitment to evidence-based SEND practice.
            </p>
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Certificate
            </button>
            {certificateViewed && (
              <p className="mt-2 text-sm text-green-700 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Certificate downloaded
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          What would you like to do first?
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {nextActions.map((action) => {
            const colors = getColorClasses(action.color);
            const Icon = action.icon;
            const isSelected = selectedNextAction === action.id;

            return (
              <button
                key={action.id}
                onClick={() => setSelectedNextAction(action.id)}
                className={`
                  relative text-left p-5 rounded-xl border-2 transition-all
                  focus:outline-none focus:ring-4 focus:ring-${action.color}-200
                  ${isSelected
                    ? `${colors.bg} ${colors.border} shadow-md`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
                  }
                  ${action.primary ? 'md:col-span-2' : ''}
                `}
                {...(isSelected ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 border ${colors.border}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <button
          onClick={handleCompleteOnboarding}
          disabled={!selectedNextAction}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          Complete Onboarding & Get Started! 🚀
        </button>

        {!selectedNextAction && (
          <p className="text-sm text-gray-500 text-center">
            Select an action above to continue
          </p>
        )}
      </div>

      {/* Support Resources */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Need Help Getting Started?
        </h4>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <a
            href="/help"
            target="_blank"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
          >
            📚 Help Center
          </a>
          <a
            href="/training/getting-started"
            target="_blank"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
          >
            🎓 Getting Started Guide
          </a>
          <a
            href="mailto:support@edpsychconnect.com"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
          >
            ✉️ Contact Support
          </a>
        </div>
      </div>

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite">
        Congratulations on completing the onboarding! Select a next action and click the Complete Onboarding button to get started with the platform.
      </div>
    </div>
  );
}
