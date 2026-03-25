'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, TrendingUp, Smile } from 'lucide-react';

export default function WellbeingSurveyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">&lt; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            Wellbeing Pulse
          </h1>
          <p className="text-slate-400 mt-2">Monitor staff and student wellbeing trends.</p>
        </header>
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Decision Support</p>
              <p className="text-sm text-slate-400">
                Review shifts in morale or anxiety first, then launch a targeted survey. Favor short
                check-ins when response rate is high.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Focus: trends, survey selection, engagement.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-1">Staff Morale</div>
            <div className="text-3xl font-bold text-emerald-400">7.8/10</div>
            <div className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +0.4 this week
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-1">Student Anxiety</div>
            <div className="text-3xl font-bold text-amber-400">Medium</div>
            <div className="text-xs text-slate-500 mt-1">Stable vs last term</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-1">Response Rate</div>
            <div className="text-3xl font-bold text-indigo-400">92%</div>
            <div className="text-xs text-indigo-500 mt-1">High engagement</div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Launch New Survey</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors group">
              <div className="font-medium text-white group-hover:text-pink-400 mb-1">Weekly Check-in</div>
              <p className="text-sm text-slate-400">Short 3-question pulse survey for all staff.</p>
            </button>
            <button className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors group">
              <div className="font-medium text-white group-hover:text-pink-400 mb-1">Termly Deep Dive</div>
              <p className="text-sm text-slate-400">Comprehensive assessment of school culture.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
