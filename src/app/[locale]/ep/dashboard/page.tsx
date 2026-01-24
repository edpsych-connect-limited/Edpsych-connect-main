'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  FileText,
  Briefcase,
  Clock
} from 'lucide-react';
import { ASSESSMENT_LIBRARY } from '@/lib/assessments/assessment-library';
import { VoiceCommandInterface } from '@/components/orchestration/VoiceCommandInterface';

export default function EPDashboard() {
  // GAP ANALYSIS: Wiring Real Engines
  // 1. Assessment Engine: Fetching EP-qualified tools
  const epTools = ASSESSMENT_LIBRARY.filter(a => a.qualification_required === 'ep').slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              EdPsych Connect
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">EP Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                SC
              </div>
              <span className="text-sm font-medium text-slate-700">Dr. Sarah Chen</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Command Interface */}
        <div className="mb-6">
          <VoiceCommandInterface
            contextType="ep-dashboard"
            onCommandExecuted={(result) => {
              console.log('EP Command executed:', result);
            }}
            compact={false}
            className=""
          />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Caseload</h1>
            <p className="text-slate-600">You have 3 upcoming visits and 2 reports due.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              Sync Calendar
            </button>
            <Link
              href="/assessments/new"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Start Assessment
            </Link>
          </div>
        </div>
        <div className="mb-8 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Decision Support</p>
              <p className="text-sm text-indigo-800">
                Prioritize reports due this week, then confirm today&apos;s visits. Use the toolkit for
                EP-qualified assessments when planning new cases.
              </p>
            </div>
            <div className="text-xs text-indigo-700">
              Focus: reports, visits, then new assessments.
            </div>
          </div>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Review caseload',
              description: 'Confirm today\'s visits and triage new referrals.',
              href: '/cases',
              icon: Calendar,
              tone: 'text-indigo-600',
              bg: 'bg-indigo-50',
            },
            {
              title: 'Start assessment',
              description: 'Launch a new assessment from the EP toolkit.',
              href: '/assessments/new',
              icon: Briefcase,
              tone: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              title: 'Finish reports',
              description: 'Complete drafts due this week before deadlines.',
              href: '/reports',
              icon: FileText,
              tone: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${action.bg} ${action.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">{action.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{action.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Task List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" /> Today's Schedule
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="p-6 flex items-start gap-4">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-sm font-bold text-slate-900">09:00</span>
                    <span className="text-xs text-slate-500">AM</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Observation: Leo Thompson</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> St. Mary's Primary</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">Assessment</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded hover:bg-indigo-100">
                    View Notes
                  </button>
                </div>

                <div className="p-6 flex items-start gap-4 bg-slate-50/50">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-sm font-bold text-slate-900">13:30</span>
                    <span className="text-xs text-slate-500">PM</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Consultation: Sarah Jenkins</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Online (Teams)</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">Review</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                    Join Call
                  </button>
                </div>
              </div>
            </div>

            {/* Outstanding Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" /> Reports Due
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold border border-amber-100">
                      MC
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Michael Chang</h4>
                      <p className="text-xs text-amber-700 font-medium">Due in 2 days</p>
                    </div>
                  </div>
                  <Link
                    href="/assessments/123/report"
                    className="text-sm font-bold text-amber-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                  >
                    Continue Draft &gt;
                  </Link>
                </div>
                <div className="text-right">
                  <Link
                    href="/reports"
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                  >
                    View all reports
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">AI Assistant</h3>
              <p className="text-slate-400 text-sm mb-4">
                I've analyzed your notes from yesterday. Would you like me to draft the statutory advice for the Thompson case?
              </p>
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">
                Open Assistant
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Statutory Deadlines</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Week 6 Advice</span>
                  <span className="font-bold text-green-600">On Track</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
                
                <div className="flex items-center justify-between text-sm mt-4">
                  <span className="text-slate-600">Draft Plans</span>
                  <span className="font-bold text-amber-600">1 At Risk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>

            {/* Professional Toolkit (Wired to Assessment Engine) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" /> Professional Toolkit
              </h3>
              <div className="space-y-3">
                {epTools.map((tool) => (
                  <div key={tool.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">{tool.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 uppercase">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
                  </div>
                ))}
                <Link href="/assessments/library" className="block text-center text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-2">
                  View Full Library &gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
