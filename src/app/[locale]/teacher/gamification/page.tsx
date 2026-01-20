'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Plus, Users, Trophy, BarChart2, Play } from 'lucide-react';

export default function TeacherGamificationPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/demo" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">&lt; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-purple-500" />
              Gamification Control Centre
            </h1>
            <p className="text-slate-400 mt-2">Manage Battle Royale sessions, assignments, and leaderboards.</p>
          </div>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
            <Plus className="w-5 h-5" />
            Create New Battle
          </button>
        </header>
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Decision Support</p>
              <p className="text-sm text-slate-400">
                Start with live sessions, then scan assignments below 70% completion for follow-up. Use
                the leaderboard to spotlight positive momentum.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Priority: Live sessions, then assignments.
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Active Games */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                Active Sessions
              </h2>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Year 9 - Biology: Cell Structure</h3>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full animate-pulse">LIVE NOW</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 24/28 Joined</span>
                    <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> Round 3/5</span>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(64+i)}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">+20</div>
                  </div>
                  <button className="text-purple-400 hover:text-purple-300 font-medium text-sm">Open Monitor &gt;</button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Recent Assignments</h2>
              <div className="space-y-4">
                {[
                  { title: 'Maths: Quadratic Equations', class: 'Year 10 Set 1', completion: '92%', avgScore: '78%' },
                  { title: 'History: Cold War Origins', class: 'Year 11 History', completion: '100%', avgScore: '85%' },
                  { title: 'English: Macbeth Quotes', class: 'Year 9 English', completion: '65%', avgScore: '72%' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors cursor-pointer">
                    <div>
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.class}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-200">{item.avgScore} Avg</div>
                      <div className="text-xs text-slate-500">{item.completion} Complete</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Analytics */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Class Leaderboard
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Sarah J.', points: 2450, change: '+120' },
                  { name: 'Michael B.', points: 2380, change: '+45' },
                  { name: 'Amira K.', points: 2100, change: '+210' },
                ].map((student, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i===0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800 text-slate-400'}`}>
                        {i+1}
                      </div>
                      <span className="text-sm font-medium">{student.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{student.points}</div>
                      <div className="text-[10px] text-emerald-400">{student.change}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-sm text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg">
                View Full Report
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                Engagement Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Weekly Participation</span>
                    <span className="text-white">88%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[88%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Avg. Session Time</span>
                    <span className="text-white">18m</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
