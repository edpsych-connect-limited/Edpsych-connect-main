/**
 * Interactive Demo Page
 * Showcase the AI capabilities of the platform
 */

'use client';

import React from 'react';
import AIConversationDemo from '@/components/landing/legacy/ai-conversation-demo';
import Link from 'next/link';

export default function DemoPage() {
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
            Interact with our multi-agent AI system. See how it plans lessons, writes reports, and analyzes behavior in real-time.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Demo Interface */}
          <div className="lg:col-span-8">
            <AIConversationDemo className="h-[600px] border border-slate-700 shadow-2xl shadow-indigo-500/10" />
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
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
