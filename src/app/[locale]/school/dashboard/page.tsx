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
import { INTERVENTION_STATS, INTERVENTION_LIBRARY } from '@/lib/interventions/intervention-library';
import { ASSESSMENT_LIBRARY } from '@/lib/assessments/assessment-library';

export default function SchoolDashboard() {
  // GAP ANALYSIS: Wiring Real Engines
  // 1. Intervention Engine Stats
  const interventionCount = INTERVENTION_STATS.total;
  
  // 2. Assessment Engine Stats
  const assessmentCount = ASSESSMENT_LIBRARY.length;
  const teacherAssessments = ASSESSMENT_LIBRARY.filter(a => a.qualification_required === 'teacher' || a.qualification_required === 'senco').length;

  // 3. Featured Interventions for Schools (Classroom setting)
  const classroomInterventions = INTERVENTION_LIBRARY.filter(i => i.setting.includes('classroom')).slice(0, 3);

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
                SM
              </div>
              <span className="text-sm font-medium text-slate-700">St. Mary's Primary</span>
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
          <Link href="/cases/new" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Request
          </Link>
        </div>

        {/* Stats Grid (Wired to Libraries) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Cases', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Teacher Assessments', value: teacherAssessments.toString(), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Intervention Library', value: interventionCount.toString(), icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Critical Actions', value: '2', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
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
            <Link href="/interventions" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
              View All {interventionCount} Strategies
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {classroomInterventions.map(intervention => (
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
              {[
                { name: 'Leo Thompson', year: 'Year 4', need: 'Cognition & Learning', status: 'Assessment', statusColor: 'bg-amber-100 text-amber-700', review: 'Jan 24, 2026' },
                { name: 'Sarah Jenkins', year: 'Year 6', need: 'SEMH', status: 'EHCP Active', statusColor: 'bg-green-100 text-green-700', review: 'Feb 10, 2026' },
                { name: 'Michael Chang', year: 'Year 3', need: 'Communication', status: 'Monitoring', statusColor: 'bg-blue-100 text-blue-700', review: 'Mar 01, 2026' },
              ].map((student, i) => (
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
                    <Link href={`/cases/${i}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
