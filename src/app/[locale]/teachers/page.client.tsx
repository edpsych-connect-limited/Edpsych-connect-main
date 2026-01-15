'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import { Link } from '@/navigation';
import TeacherClassDashboard from '@/components/orchestration/TeacherClassDashboard';

interface TeachersPageClientProps {
  demoTeacherId?: number;
  demoClassId?: string;
}

export default function TeachersPageClient({ demoTeacherId, demoClassId }: TeachersPageClientProps) {
  // If we have real demo data, use it.
  const useRealDemo = !!demoTeacherId && !!demoClassId;
  
  // Auto-show dashboard if user is logged in (useRealDemo is true)
  const [showDashboard, setShowDashboard] = useState(useRealDemo);

  // Note: classId prop in TeacherClassDashboard expects string | number, but our real ID is string (CUID)
  // and mock ID was number (1). The component handles both.
  const useRealDemo = !!demoTeacherId && !!demoClassId;

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold text-indigo-600">Classroom Cockpit</span>
                {useRealDemo && (
                  <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    Live Demo Data
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Exit Demo
              </button>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TeacherClassDashboard 
            classId={useRealDemo ? demoClassId! : 1} 
            teacherId={useRealDemo ? demoTeacherId! : 1} 
            isDemo={!useRealDemo} 
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 to-white py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-full text-sm mb-6">
                For Teachers & SENCOs
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Transform Your <br />
                <span className="text-indigo-600">Classroom Support</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Automate administrative tasks, generate evidence-based interventions, and track student progress with AI-powered tools designed for modern educators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowDashboard(true)}
                  className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Launch Dashboard Demo
                </button>
                <Link 
                  href="/signup?role=teacher" 
                  className="bg-white text-slate-700 font-bold py-4 px-8 rounded-xl border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-center"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative transform -rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-bold text-slate-900 text-lg">Class Overview</div>
                  <div className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm font-bold">Year 4</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">✓</div>
                      <div>
                        <div className="font-bold text-slate-900">Interventions</div>
                        <div className="text-xs text-slate-500">12 Active Plans</div>
                      </div>
                    </div>
                    <div className="text-green-600 font-bold text-sm">On Track</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">⚡</div>
                      <div>
                        <div className="font-bold text-slate-900">Assessments</div>
                        <div className="text-xs text-slate-500">3 Pending Review</div>
                      </div>
                    </div>
                    <div className="text-blue-600 font-bold text-sm">Action Needed</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">🤖</div>
                      <div>
                        <div className="font-bold text-slate-900">AI Assistant</div>
                        <div className="text-xs text-slate-500">Report Generated</div>
                      </div>
                    </div>
                    <div className="text-purple-600 font-bold text-sm">Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Tools That Give You Time Back</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Focus on teaching while we handle the paperwork and analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📝",
                title: "Instant Reports",
                desc: "Generate comprehensive EHCP drafts and progress reports in minutes, not hours."
              },
              {
                icon: "🎯",
                title: "Targeted Interventions",
                desc: "Get AI-recommended strategies based on specific student needs and assessment data."
              },
              {
                icon: "📈",
                title: "Data Tracking",
                desc: "Visualize student progress over time to prove impact and adjust support."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-black mb-6">Join the Future of Education</h2>
          <p className="text-xl text-slate-300 mb-10">Equip your classroom with the world&apos;s most advanced educational psychology platform.</p>
          <Link 
            href="/signup?role=teacher" 
            className="inline-block bg-indigo-600 text-white font-bold py-4 px-12 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-900/50"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
