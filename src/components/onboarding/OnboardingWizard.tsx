/**
 * Self-Service Onboarding Wizard
 * 5-step guided setup for new users with role-based personalization
 *
 * Features:
 * - Welcome and role selection
 * - Profile completion
 * - Workspace setup and preferences
 * - Interactive feature tour
 * - First task guidance
 * - Progress tracking and saving
 * - Skip option with confirmation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingWizardProps {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  currentStep?: number;
}

export default function OnboardingWizard({
  userId,
  userName,
  userEmail,
  userRole,
  currentStep: initialStep = 0,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [userData, setUserData] = useState({
    role: userRole || '',
    organization_type: '',
    primary_focus: [] as string[],
    preferred_features: [] as string[],
    experience_level: '',
    goals: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 5;

  // Auto-save progress
  useEffect(() => {
    saveProgress();
  }, [currentStep]);

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_step: currentStep,
          onboarding_started_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to save your preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    if (confirm('Are you sure you want to skip the onboarding? You can always access it later from your settings.')) {
      try {
        await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            onboarding_skipped: true,
          }),
        });

        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to skip onboarding:', error);
      }
    }
  };

  const goToNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep userName={userName} userData={userData} setUserData={setUserData} />;
      case 1:
        return <ProfileStep userData={userData} setUserData={setUserData} />;
      case 2:
        return <WorkspaceStep userData={userData} setUserData={setUserData} />;
      case 3:
        return <FeatureTourStep userData={userData} />;
      case 4:
        return <FirstTaskStep userData={userData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to EdPsych Connect World</h1>
          <p className="text-gray-600">Let's get you set up in just a few minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Skip for now
          </button>

          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={goToPrevious}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}

            <button
              onClick={goToNext}
              disabled={isSaving}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? 'Saving...' : currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 1: WELCOME & ROLE SELECTION
// ============================================================================

function WelcomeStep({ userName, userData, setUserData }: any) {
  const roles = [
    {
      id: 'educational_psychologist',
      title: 'Educational Psychologist',
      description: 'Conduct assessments, create reports, and manage cases',
      icon: '🎓',
    },
    {
      id: 'senco',
      title: 'SENCO',
      description: 'Coordinate SEND provision and track student progress',
      icon: '👨‍🏫',
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Access interventions and monitor student learning',
      icon: '👩‍🏫',
    },
    {
      id: 'researcher',
      title: 'Researcher',
      description: 'Access data and conduct educational research',
      icon: '🔬',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {userName}!</h2>
        <p className="text-gray-600">
          Let's personalize your experience. What best describes your role?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setUserData((prev: any) => ({ ...prev, role: role.id }))}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              userData.role === role.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-3">{role.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{role.title}</h3>
            <p className="text-sm text-gray-600">{role.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: PROFILE COMPLETION
// ============================================================================

function ProfileStep({ userData, setUserData }: any) {
  const organizationTypes = [
    'Local Authority',
    'Multi-Academy Trust',
    'Single School',
    'Independent Practice',
    'University/Research',
  ];

  const focusAreas = [
    'SEND Assessment',
    'EHCP Support',
    'Intervention Design',
    'Progress Monitoring',
    'Staff Training',
    'Research & Analysis',
  ];

  const toggleFocus = (focus: string) => {
    setUserData((prev: any) => ({
      ...prev,
      primary_focus: prev.primary_focus.includes(focus)
        ? prev.primary_focus.filter((f: string) => f !== focus)
        : [...prev.primary_focus, focus],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your work</h2>
        <p className="text-gray-600">
          This helps us customize your dashboard and recommendations
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Type
        </label>
        <select
          value={userData.organization_type}
          onChange={(e) => setUserData((prev: any) => ({ ...prev, organization_type: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select your organization type...</option>
          {organizationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Focus Areas (select all that apply)
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {focusAreas.map((focus) => (
            <button
              key={focus}
              onClick={() => toggleFocus(focus)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                userData.primary_focus.includes(focus)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{focus}</span>
                {userData.primary_focus.includes(focus) && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: WORKSPACE SETUP
// ============================================================================

function WorkspaceStep({ userData, setUserData }: any) {
  const features = [
    {
      id: 'problem_solver',
      title: 'Problem Solver',
      description: 'AI-powered quick solutions for classroom challenges',
      icon: '🎯',
    },
    {
      id: 'assessments',
      title: 'Assessment Library',
      description: '51 evidence-based assessment templates',
      icon: '📋',
    },
    {
      id: 'interventions',
      title: 'Intervention Library',
      description: '69 research-backed interventions',
      icon: '🎓',
    },
    {
      id: 'ehcp',
      title: 'EHCP Support',
      description: 'Streamlined EHCP creation and management',
      icon: '📄',
    },
    {
      id: 'training',
      title: 'CPD Training',
      description: 'Professional development courses',
      icon: '🏆',
    },
    {
      id: 'battle_royale',
      title: 'Battle Royale',
      description: 'Gamified professional development',
      icon: '🎮',
    },
  ];

  const toggleFeature = (featureId: string) => {
    setUserData((prev: any) => ({
      ...prev,
      preferred_features: prev.preferred_features.includes(featureId)
        ? prev.preferred_features.filter((f: string) => f !== featureId)
        : [...prev.preferred_features, featureId],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your key features</h2>
        <p className="text-gray-600">
          Select the features you'll use most often to customize your dashboard
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => toggleFeature(feature.id)}
            className={`p-5 border-2 rounded-lg text-left transition-all ${
              userData.preferred_features.includes(feature.id)
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{feature.icon}</div>
              {userData.preferred_features.includes(feature.id) && (
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: FEATURE TOUR
// ============================================================================

function FeatureTourStep({ userData }: any) {
  const highlights = [
    {
      title: 'Dashboard',
      description: 'Your personalized hub for all your work',
      image: '📊',
    },
    {
      title: 'Quick Actions',
      description: 'Start assessments, create EHCPs, or access interventions instantly',
      image: '⚡',
    },
    {
      title: 'Search & Filter',
      description: 'Find any student, case, or resource in seconds',
      image: '🔍',
    },
    {
      title: 'Help & Support',
      description: 'Contextual help available wherever you need it',
      image: '💡',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Tour</h2>
        <p className="text-gray-600">
          Here are some key features to help you get started
        </p>
      </div>

      <div className="space-y-4">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
          >
            <div className="text-4xl flex-shrink-0">{highlight.image}</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{highlight.title}</h3>
              <p className="text-gray-600">{highlight.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
        <p className="text-blue-800">
          Press <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-sm">?</kbd> anywhere in the platform for context-sensitive help
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: FIRST TASK
// ============================================================================

function FirstTaskStep({ userData }: any) {
  const suggestedTasks = [
    {
      id: 'assessment',
      title: 'Start Your First Assessment',
      description: 'Use the ECCA framework to conduct a cognitive assessment',
      icon: '📋',
      action: '/assessments/new',
    },
    {
      id: 'problem_solver',
      title: 'Try the Problem Solver',
      description: 'Get AI-powered solutions for a classroom challenge',
      icon: '🎯',
      action: '/problem-solver',
    },
    {
      id: 'browse',
      title: 'Explore Interventions',
      description: 'Browse 69 evidence-based interventions',
      icon: '🎓',
      action: '/interventions',
    },
    {
      id: 'training',
      title: 'Start a Training Course',
      description: 'Begin your professional development journey',
      icon: '🏆',
      action: '/training',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-gray-600">
          Choose your first action to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {suggestedTasks.map((task) => (
          <a
            key={task.id}
            href={task.action}
            className="p-6 border-2 border-gray-200 rounded-lg text-left hover:border-blue-600 hover:bg-blue-50 transition-all group"
          >
            <div className="text-4xl mb-3">{task.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              {task.title} →
            </h3>
            <p className="text-sm text-gray-600">{task.description}</p>
          </a>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-gray-600 mb-2">Or skip ahead to your dashboard</p>
        <p className="text-sm text-gray-500">You can access all features from there</p>
      </div>
    </div>
  );
}
