'use client'

/**
 * Interactive Demo Page
 * Showcase the AI capabilities of the platform
 * 
 * @copyright EdPsych Connect Limited 2025
 */

import React from 'react';
import AIAssistant from '@/components/ai/AIAssistant';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();
  
  const handleNavigate = (path: string) => {
    router.push(path);
  };
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              EdPsych Connect
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Experience the <span className="text-indigo-400">Invisible Brain</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Interact with our multi-agent AI system. See how it plans lessons, writes reports, and analyses behaviour in real-time.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Voice Enabled
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-medium">
              13 AI Agents Active
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* AI Assistant Interface */}
          <div className="lg:col-span-8">
            <AIAssistant 
              className="border border-slate-700 shadow-2xl shadow-indigo-500/10" 
              onNavigate={handleNavigate}
            />
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* GOLDEN THREAD CARD - NEW FLAGSHIP DEMO */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 text-white text-xs font-bold mb-3 backdrop-blur-sm border border-white/10">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" /> NEW
                </div>
                <h3 className="text-xl font-bold text-white mb-2">The Golden Thread</h3>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                  See the full autonomous loop: Audit → Assess → Act → Communicate. The future of education in one screen.
                </p>
                <Link 
                  href="/demo/golden-thread" 
                  className="block w-full text-center px-4 py-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg font-bold transition-all shadow-lg"
                >
                  Launch Full Experience
                </Link>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Active Agents
              </h3>
              <div className="space-y-4">
                <AgentCard 
                  name="Curriculum Designer" 
                  role="Lesson Planning & Differentiation"
                  color="blue"
                />
                <AgentCard 
                  name="Student Mentor" 
                  role="Intervention Strategies"
                  color="purple"
                />
                <AgentCard 
                  name="Assessment Generator" 
                  role="Adaptive Testing"
                  color="green"
                />
              </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-indigo-300">Try asking about:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  "Create a lesson plan for Year 5 fractions"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  "Help a student with dyslexia"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  "Write a parent email about progress"
                </li>
              </ul>
            </div>

            {/* New Assessment Demo Card */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Assessment Sandbox</h3>
              <p className="text-slate-300 text-sm mb-4">
                Try our dynamic assessment workflow without creating an account. Generate a real PDF report.
              </p>
              <Link 
                href="/demo/assessment" 
                className="block w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
              >
                Launch Sandbox
              </Link>
            </div>

            {/* Intervention Demo Card */}
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Intervention Library</h3>
              <p className="text-slate-300 text-sm mb-4">
                Explore our evidence-based intervention database. Filter by age, need, and evidence level.
              </p>
              <Link 
                href="/demo/interventions" 
                className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Browse Library
              </Link>
            </div>

            {/* Training Demo Card */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Training Platform</h3>
              <p className="text-slate-300 text-sm mb-4">
                Experience our CPD-accredited training courses. Try a sample module and quiz.
              </p>
              <Link 
                href="/demo/training" 
                className="block w-full text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
              >
                Start Learning
              </Link>
            </div>

            {/* EHCP Demo Card */}
            <div className="bg-gradient-to-br from-orange-900/50 to-amber-900/50 border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">EHCP Wizard</h3>
              <p className="text-slate-300 text-sm mb-4">
                Draft a compliant Education, Health and Care Plan in minutes using our guided workflow.
              </p>
              <Link 
                href="/demo/ehcp" 
                className="block w-full text-center px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
              >
                Draft EHCP
              </Link>
            </div>

            {/* Gamification Demo Card */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Battle Royale</h3>
              <p className="text-slate-300 text-sm mb-4">
                Experience our adaptive student learning arena. Gamified lessons that adjust to each student's needs.
              </p>
              <Link 
                href="/demo/gamification" 
                className="block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                Enter Arena
              </Link>
            </div>

            {/* Progress Tracking Demo Card */}
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Progress Tracking</h3>
              <p className="text-slate-300 text-sm mb-4">
                Visualize student outcomes and measure intervention impact with our analytics dashboard.
              </p>
              <Link 
                href="/demo/tracking" 
                className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                View Dashboard
              </Link>
            </div>

            {/* Coding Curriculum Demo Card */}
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Developers of Tomorrow</h3>
              <p className="text-slate-300 text-sm mb-4">
                Empower students to build their own tools. From block coding to React, integrated into the platform.
              </p>
              <Link 
                href="/demo/coding" 
                className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
              >
                Start Coding
              </Link>
            </div>

            {/* Zero-Touch Onboarding Demo Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white flex items-center gap-2">
                <span className="text-indigo-400">AI</span> Zero-Touch Onboarding
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                Experience our "Forensic Audit" engine. Connect a mock MIS and find unclaimed funding in seconds.
              </p>
              <Link 
                href="/demo/onboarding" 
                className="block w-full text-center px-4 py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold transition-colors"
              >
                Run Forensic Audit
              </Link>
            </div>

            {/* Universal Translator Demo Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white flex items-center gap-2">
                <span className="text-purple-400">AI</span> Universal Translator
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                Convert complex educational jargon into clear, empathetic language for parents and students.
              </p>
              <Link 
                href="/demo/translator" 
                className="block w-full text-center px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg font-bold transition-colors"
              >
                Try Translator
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AgentCard({ name, role, color }: { name: string, role: string, color: string }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
  }[color] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div className={`p-3 rounded-lg border ${colorClasses} flex items-center gap-3`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-current opacity-20`}>
        <div className="w-4 h-4 bg-current rounded-full" />
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs opacity-80">{role}</div>
      </div>
    </div>
  );
}
