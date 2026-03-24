'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  AlertCircle, 
  Plus, 
  Search,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSchoolDashboard } from '@/hooks/useSchoolDashboard';

export default function SchoolDashboard() {
  const { data: session } = useSession();
  const { stats, classroomInterventions, students, loading } = useSchoolDashboard();
  
  const schoolName = (session?.user as any)?.organization || 'School Portal';
  const schoolInitials = schoolName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');
  const featuredInterventions = classroomInterventions.slice(0, 3);
  const visibleStudents = students.slice(0, 6);

  if (loading || !stats) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              EdPsych Connect
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">School Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {schoolInitials}
              </div>
              <span className="text-sm font-medium text-slate-700">{schoolName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SENCO Dashboard</h1>
            <p className="text-slate-600">Manage your SEN register and assessment requests.</p>
          </div>
          <Link
            href="/cases/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="w-4 h-4" /> New Request
          </Link>
        </div>
        <div className="mb-8 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Decision Support</p>
              <p className="text-sm text-emerald-800">
                Triage critical actions first, then review teacher assessments and align
                classroom strategies with priority needs.
              </p>
            </div>
            <div className="text-xs text-emerald-700">
              Focus: critical actions, assessments, interventions.
            </div>
          </div>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Review critical actions',
              description: 'Check students requiring immediate SENCO attention.',
              href: '/cases',
              icon: AlertCircle,
              tone: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              title: 'Launch assessment',
              description: 'Start a new teacher assessment request.',
              href: '/assessments',
              icon: FileText,
              tone: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              title: 'Assign intervention',
              description: 'Select strategies aligned to this term\'s priorities.',
              href: '/interventions',
              icon: GraduationCap,
              tone: 'text-indigo-600',
              bg: 'bg-indigo-50',
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${action.bg} ${action.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">{action.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{action.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Stats Grid (Wired to Libraries) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Cases', value: stats.activeCases.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Teacher Assessments', value: stats.teacherAssessments.toString(), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Intervention Library', value: stats.interventionCount.toString(), icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Critical Actions', value: stats.criticalActions.toString(), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              </div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Classroom Interventions (Wired to Intervention Engine) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Featured Classroom Strategies</h2>
            <Link
              href="/interventions"
              className="text-sm text-indigo-600 font-medium hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              View All {stats.interventionCount} Strategies
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredInterventions.map(intervention => (
              <div key={intervention.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium capitalize">
                    {intervention.evidence_level.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{intervention.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{intervention.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                    {intervention.category}
                  </span>
                  <span className="px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                    {intervention.complexity} complexity
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Active Register</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Year Group</th>
                <th className="px-6 py-4">Primary Need</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Next Review</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStudents.map((student, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600">{student.year}</td>
                  <td className="px-6 py-4 text-slate-600">{student.need}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${student.statusColor}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{student.review}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/cases/${i}`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length > visibleStudents.length && (
            <div className="px-6 py-4 border-t border-slate-100 text-right">
              <Link
                href="/cases"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                View full register ({students.length})
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
