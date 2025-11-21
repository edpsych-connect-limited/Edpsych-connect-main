'use client';

import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  GraduationCap, 
  Brain,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const features = [
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
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.name || user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
