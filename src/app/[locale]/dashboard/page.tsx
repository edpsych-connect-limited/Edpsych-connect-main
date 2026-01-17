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
import { 
  Users, 
  FileText, 
  TrendingUp, 
  GraduationCap, 
  Brain,
  Zap,
  PlayCircle,
  LayoutDashboard,
  Shield,
  Home,
  Trophy,
  Building,
  Bot,
  Mail
} from 'lucide-react';
import { useDemo } from '@/components/demo/DemoProvider';
import { StreamingAvatar } from '@/components/features/StreamingAvatar';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const role = user.role?.toUpperCase() || 'GUEST';

  const getFeatures = () => {
    const list = [];

    // Admin / Super Admin
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      if (role === 'SUPERADMIN') {
        list.push({
          title: 'Institutional Management',
          description: 'Manage multi-academy trusts and institutions.',
          icon: Building,
          href: '/institutional-management',
          color: 'bg-slate-100 text-slate-600',
        });
      }
      list.push(
        {
          title: 'Admin Dashboard',
          description: 'Manage users, settings, and system configuration.',
          icon: Shield,
          href: '/admin',
          color: 'bg-red-100 text-red-600',
        },
        {
          title: 'LA Dashboard',
          description: 'Statutory timeline monitoring and case oversight.',
          icon: Building,
          href: '/marketplace/la-panel',
          color: 'bg-cyan-100 text-cyan-600',
        },
        {
          title: 'Classroom Cockpit',
          description: 'Manage your class, assign lessons, and track daily progress.',
          icon: LayoutDashboard,
          href: '/teachers',
          color: 'bg-indigo-100 text-indigo-600',
        },
        {
          title: 'Assessments',
          description: 'Conduct cognitive assessments using the ECCA framework.',
          icon: Brain,
          href: '/assessments',
          color: 'bg-purple-100 text-purple-600',
        },
        {
          title: 'Interventions',
          description: 'Access evidence-based interventions for your cases.',
          icon: Zap,
          href: '/interventions',
          color: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'Cases',
          description: 'Manage your student cases and profiles.',
          icon: Users,
          href: '/cases',
          color: 'bg-green-100 text-green-600',
        },
        {
          title: 'EHCP',
          description: 'Generate and manage EHCP reports.',
          icon: FileText,
          href: '/ehcp',
          color: 'bg-orange-100 text-orange-600',
        },
        {
          title: 'Progress',
          description: 'Track student progress and outcomes.',
          icon: TrendingUp,
          href: '/progress',
          color: 'bg-indigo-100 text-indigo-600',
        },
        {
          title: 'Training',
          description: 'Professional development and training resources.',
          icon: GraduationCap,
          href: '/training',
          color: 'bg-pink-100 text-pink-600',
        }
      );
    }
    // Teacher
    else if (role === 'TEACHER' || role === 'STAFF') {
      list.push(
        {
          title: 'Classroom Cockpit',
          description: 'Manage your class, assign lessons, and track daily progress.',
          icon: LayoutDashboard,
          href: '/teachers',
          color: 'bg-indigo-100 text-indigo-600',
        },
        {
          title: 'Assessments',
          description: 'Conduct cognitive assessments using the ECCA framework.',
          icon: Brain,
          href: '/assessments',
          color: 'bg-purple-100 text-purple-600',
        },
        {
          title: 'Interventions',
          description: 'Access evidence-based interventions for your cases.',
          icon: Zap,
          href: '/interventions',
          color: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'Cases',
          description: 'Manage your student cases and profiles.',
          icon: Users,
          href: '/cases',
          color: 'bg-green-100 text-green-600',
        },
        {
          title: 'EHCP',
          description: 'Generate and manage EHCP reports.',
          icon: FileText,
          href: '/ehcp',
          color: 'bg-orange-100 text-orange-600',
        },
        {
          title: 'Progress',
          description: 'Track student progress and outcomes.',
          icon: TrendingUp,
          href: '/progress',
          color: 'bg-indigo-100 text-indigo-600',
        },
        {
          title: 'Training',
          description: 'Professional development and training resources.',
          icon: GraduationCap,
          href: '/training',
          color: 'bg-pink-100 text-pink-600',
        }
      );
    }
    // Parent
    else if (role === 'PARENT') {
      list.push(
        {
          title: 'Parent Portal',
          description: 'View your child\'s progress and communicate with teachers.',
          icon: Home,
          href: '/parents',
          color: 'bg-rose-100 text-rose-600',
        },
        {
          title: 'Child Progress',
          description: 'Detailed breakdown of your child\'s learning journey.',
          icon: TrendingUp,
          href: '/progress',
          color: 'bg-blue-100 text-blue-600',
        }
      );
    }
    // Student
    else if (role === 'STUDENT') {
      list.push(
        {
          title: 'Gamification Hub',
          description: 'Compete in Battle Royale and check the leaderboard.',
          icon: Trophy,
          href: '/gamification',
          color: 'bg-yellow-100 text-yellow-600',
        },
        {
          title: 'Coding Curriculum',
          description: 'Learn to code by modding your favourite games.',
          icon: PlayCircle,
          href: '/demo/coding',
          color: 'bg-green-100 text-green-600',
        },
        {
          title: 'My Progress',
          description: 'Track your own learning achievements.',
          icon: TrendingUp,
          href: '/progress',
          color: 'bg-blue-100 text-blue-600',
        }
      );
    } 
    // Researcher
    else if (role === 'RESEARCHER') {
      list.push(
        {
          title: 'Research Hub',
          description: 'Manage clinical trials and validate assessment frameworks.',
          icon: Brain,
          href: '/research',
          color: 'bg-purple-100 text-purple-600',
        },
        {
          title: 'Data Enclave',
          description: 'Access anonymized datasets for analysis.',
          icon: Shield,
          href: '/research?tab=datasets',
          color: 'bg-slate-100 text-slate-600',
        }
      );
    }
    // Local Authority (LAA)
    else if (role === 'LAA' || role === 'LOCAL_AUTHORITY' || role === 'LA_ADMIN' || role === 'LA_MANAGER' || role === 'LA_CASEWORKER') {
      list.push(
        {
          title: 'LAA Dashboard',
          description: 'Manage SEND provision and professional panels.',
          icon: Building,
          href: '/marketplace/la-panel',
          color: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'EHCP Review',
          description: 'Review and approve EHCP applications.',
          icon: FileText,
          href: '/ehcp',
          color: 'bg-orange-100 text-orange-600',
        }
      );
    }
    else {
      // Fallback (EPs and others)
      list.push(
        {
          title: 'Assessments',
          description: 'Conduct cognitive assessments using the ECCA framework.',
          icon: Brain,
          href: '/assessments',
          color: 'bg-purple-100 text-purple-600',
        },
        {
          title: 'Interventions',
          description: 'Access evidence-based interventions for your cases.',
          icon: Zap,
          href: '/interventions',
          color: 'bg-blue-100 text-blue-600',
        },
        {
          title: 'Professional Marketplace',
          description: 'Find jobs and connect with Local Authorities.',
          icon: Users,
          href: '/marketplace',
          color: 'bg-green-100 text-green-600',
        },
        {
          title: 'Inquiries',
          description: 'View messages from potential clients.',
          icon: Mail,
          href: '/dashboard/inquiries',
          color: 'bg-teal-100 text-teal-600',
        }
      );
    }
    return list;
  };

  const getGuidedSteps = () => {
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      return [
        { title: 'Invite your team', description: 'Add core roles to unlock collaboration.', href: '/admin' },
        { title: 'Configure compliance guardrails', description: 'Validate governance, security, and ethics defaults.', href: '/admin/ethics' },
        { title: 'Review live workloads', description: 'Monitor cases, assessments, and interventions.', href: '/cases' }
      ];
    }
    if (role === 'TEACHER' || role === 'STAFF') {
      return [
        { title: 'Create your class', description: 'Set up your learners and timetables.', href: '/teachers' },
        { title: 'Run a baseline assessment', description: 'Capture starting points for each learner.', href: '/assessments' },
        { title: 'Assign an intervention', description: 'Launch evidence-based support quickly.', href: '/interventions' }
      ];
    }
    if (role === 'PARENT') {
      return [
        { title: 'Connect your child profile', description: 'Link your child to their learning plan.', href: '/parents' },
        { title: 'Review progress', description: 'See goals, milestones, and outcomes.', href: '/progress' },
        { title: 'Message your team', description: 'Collaborate with teachers and staff.', href: '/collaborate' }
      ];
    }
    if (role === 'STUDENT') {
      return [
        { title: 'Start Battle Royale', description: 'Jump into competitions and challenges.', href: '/gamification' },
        { title: 'Begin a coding mission', description: 'Learn through game modding.', href: '/demo/coding' },
        { title: 'Track your progress', description: 'Celebrate your wins and streaks.', href: '/progress' }
      ];
    }
    if (role === 'RESEARCHER') {
      return [
        { title: 'Open the research hub', description: 'Manage studies and evidence workflows.', href: '/research' },
        { title: 'Request a dataset', description: 'Access anonymized data safely.', href: '/research?tab=datasets' },
        { title: 'Launch a trial', description: 'Design and track a new study.', href: '/research' }
      ];
    }
    if (role === 'LAA' || role === 'LOCAL_AUTHORITY' || role === 'LA_ADMIN' || role === 'LA_MANAGER' || role === 'LA_CASEWORKER') {
      return [
        { title: 'Review open cases', description: 'See priority workflows and deadlines.', href: '/marketplace/la-panel' },
        { title: 'Check compliance risk', description: 'Spot at-risk timelines early.', href: '/ehcp/modules/compliance-risk' },
        { title: 'Approve EHCPs', description: 'Validate applications and decisions.', href: '/ehcp' }
      ];
    }
    return [
      { title: 'Run an assessment', description: 'Start evidence-led assessments.', href: '/assessments' },
      { title: 'Open interventions', description: 'Deploy structured support plans.', href: '/interventions' },
      { title: 'Create a case', description: 'Organize student journeys in one place.', href: '/cases' }
    ];
  };

  const features = getFeatures();
  const guidedSteps = getGuidedSteps();
  const visibleFeatures = showAllTools ? features : features.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user.name || user.email}</p>
          </div>
          <div className="flex gap-3">
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
