'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import { FileText, LayoutDashboard, Bot, PlayCircle } from 'lucide-react';
import { useDemo } from '@/components/demo/DemoProvider';
import { StreamingAvatar } from '@/components/features/StreamingAvatar';
import { resolveRoleProfile } from '@/lib/navigation/role-journeys';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { startTour } = useDemo();
  const router = useRouter();
  const [showAvatar, setShowAvatar] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      if (isLoading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      // Auto-start tour for first-time visitors
      const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
      if (!hasSeenTour) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          startTour('dashboard');
          localStorage.setItem('hasSeenDashboardTour', 'true');
        }, 1000);
      }

      // Check onboarding status
      if (user.onboardingCompleted || user.onboardingSkipped) {
        return;
      }

      try {
        // Verify with API to avoid stale session data
        const res = await fetch('/api/onboarding/status');
        const data = await res.json();
        
        if (data.success && data.data) {
          const { onboardingCompleted, onboardingSkipped } = data.data;
          
          if (!onboardingCompleted && !onboardingSkipped) {
            router.push('/onboarding');
          }
        }
      } catch (_error) {
        console.error('Failed to check onboarding status', _error);
      }
    };

    checkAuthAndOnboarding();
  }, [user, isLoading, router, startTour]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-hidden="true"></div>
      </div>
    );
  }

  const roleProfile = resolveRoleProfile(user.role);
  const features = roleProfile.quickActions;
  const guidedSteps = roleProfile.guidedSteps;
  const visibleFeatures = showAllTools ? features : features.slice(0, 4);
  const primaryWorkspace = roleProfile.primaryWorkspace;
  const outcomes = roleProfile.outcomes;
  const roleTourMap: Record<string, string> = {
    'owner-admin': 'ai-reviews',
    'platform-admin': 'ai-reviews',
    'local-authority': 'ehcp',
    'ep': 'assessments',
    'school': 'interventions',
    'teacher': 'assessments',
    'parent': 'dashboard',
    'student': 'dashboard',
    'researcher': 'reports',
  };
  const roleTourId = roleTourMap[roleProfile.id] || 'dashboard';
  const shouldShowOnboarding = Boolean(user.onboardingSkipped);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user.name || user.email}</p>
            <p className="mt-1 text-sm text-gray-500">
              Role focus: <span className="font-medium text-gray-700">{roleProfile.label}</span>
            </p>
          </div>
          <div className="flex gap-3">
            {primaryWorkspace && primaryWorkspace.href !== '/dashboard' && (
              <Link
                href={primaryWorkspace.href}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Open Workspace
              </Link>
            )}
            <button
              onClick={() => startTour(roleTourId)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Role Tour
            </button>
            <button
              onClick={() => setShowAvatar(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Bot className="w-4 h-4" />
              AI Concierge
            </button>
            <button
              onClick={() => startTour('dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Start Tour
            </button>
          </div>
        </div>

        {shouldShowOnboarding && (
          <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Onboarding Checkpoint</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">Finish your role setup</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Complete onboarding to unlock tailored guidance for {roleProfile.label}.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                Resume onboarding
              </Link>
            </div>
          </div>
        )}

        {primaryWorkspace && (
          <div className="mb-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Primary Workspace</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">{primaryWorkspace.label}</h2>
                <p className="mt-1 text-sm text-gray-600">{primaryWorkspace.description}</p>
              </div>
              <Link
                href={primaryWorkspace.href}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Enter workspace
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Next 3 Steps</h2>
                <button
                  onClick={() => startTour('dashboard')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Need a walkthrough?
                </button>
              </div>
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {roleProfile.description}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guidedSteps.map((step, index) => (
                  <Link
                    key={step.href}
                    href={step.href}
                    className="rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition"
                  >
                    <div className="text-xs font-semibold text-blue-600">Step {index + 1}</div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-xs text-gray-600">{step.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week's Outcomes</h2>
              <div className="space-y-3">
                {outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500"></span>
                    <p className="text-sm text-gray-700">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              {features.length > 4 && (
                <button
                  onClick={() => setShowAllTools((prev) => !prev)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {showAllTools ? 'Show fewer tools' : `Show all ${features.length} tools`}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tour="quick-actions">
              {visibleFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link 
                    key={feature.href} 
                    href={feature.href}
                    className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Link>
                );
              })}
            </div>
            {!showAllTools && features.length > 4 && (
              <div className="mt-4 text-sm text-gray-500">
                Showing the most-used tools first to keep things focused.
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-tour="recent-activity">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assessment Report Generated</p>
                      <p className="text-xs text-gray-500">2 hours ago - Student #{100 + i}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
      <StreamingAvatar isOpen={showAvatar} onClose={() => setShowAvatar(false)} />
    </div>
  );
}
