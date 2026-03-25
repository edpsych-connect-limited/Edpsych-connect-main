'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Activity, 
  Clock, 
  Star,
  BookOpen,
  PlayCircle
} from 'lucide-react';
import { useParentDashboard } from '@/hooks/useParentDashboard';

export default function ParentDashboard() {
  const { childProfile, activeIntervention, parentCourses, loading } = useParentDashboard();

  if (loading) {
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
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Parent Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                P
              </div>
              <span className="text-sm font-medium text-slate-700">Parent</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-600">Here's what's happening with {childProfile?.name || 'your child'}'s support plan.</p>
        </div>
        <div className="mb-8 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Decision Support</p>
              <p className="text-sm text-indigo-800">
                Review the active support plan, confirm upcoming appointments, and keep your wellbeing log current.
              </p>
            </div>
            <div className="text-xs text-indigo-700">
              Focus: support plan, appointments, wellbeing.
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Interventions Card (Wired to Intervention Engine) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> Active Support
                </h2>
                <Link
                  href="/interventions/schedule"
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  View Schedule
                </Link>
              </div>
              <div className="p-6">
                {activeIntervention ? (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <Star className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{activeIntervention.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{activeIntervention.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <span className="px-2 py-1 bg-slate-50 rounded-md border border-slate-100 capitalize">
                          {activeIntervention.category}
                        </span>
                        <span className="px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                          {activeIntervention.evidence_level.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No active support strategy assigned yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Training (Wired to Training Engine) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Recommended Training
                </h2>
                <Link
                  href="/training"
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Browse Catalog
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {parentCourses.map(course => (
                  <div key={course.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {course.duration_minutes} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400" /> {course.level}
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/training/${course.id}`}
                        className="ml-4 p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <PlayCircle className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline / Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-500" /> Recent Activity
                </h2>
              </div>
              <div className="p-8 text-center text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Activity history will appear here once your child&apos;s support plan is active.</p>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Next Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/interventions/schedule"
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Review support schedule
                </Link>
                <Link
                  href="/wellbeing/survey"
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Update wellbeing log
                </Link>
                <Link
                  href="/training"
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Start parent training
                </Link>
              </div>
            </div>
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Upcoming
              </h2>
              <div className="text-center py-6 text-slate-400 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No upcoming appointments scheduled.</p>
                <p className="text-xs mt-1">Appointments will appear here when arranged through the platform.</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/wellbeing/survey"
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Update Wellbeing Log
                </Link>
                <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  Contact SENCO
                </button>
                <button className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                  Upload Documents
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
