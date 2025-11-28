'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from '@/navigation';
import { useEffect } from 'react';
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
  Building
} from 'lucide-react';
import { useDemo } from '@/components/demo/DemoProvider';

export default function DashboardPage() {
  const { user, isLoading, hasRole } = useAuth();
  const { startTour } = useDemo();
  const router = useRouter();

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
      } catch (error) {
        console.error('Failed to check onboarding status', error);
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

  const getFeatures = () => {
    const role = user.role?.toUpperCase() || 'GUEST';
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
    else if (role === 'LAA' || role === 'LOCAL_AUTHORITY') {
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
        }
      );
    }
    return list;
  };

  const features = getFeatures();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user.name || user.email}</p>
          </div>
          <button
            onClick={() => startTour('dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            Start Tour
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tour="quick-actions">
              {features.map((feature) => {
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
                      <p className="text-xs text-gray-500">2 hours ago • Student #{100 + i}</p>
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
    </div>
  );
}
