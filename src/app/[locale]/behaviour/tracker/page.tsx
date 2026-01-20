'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Calendar, AlertTriangle, CheckCircle, TrendingUp, Filter } from 'lucide-react';

export default function BehaviourTrackerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/demo" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">&lt; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-500" />
              Behaviour Tracker
            </h1>
            <p className="text-slate-400 mt-2">Monitor incidents, track patterns, and evaluate support strategies.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium flex items-center gap-2 border border-slate-700">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20">
              <AlertTriangle className="w-5 h-5" />
              Log New Incident
            </button>
          </div>
        </header>
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Decision Support</p>
              <p className="text-sm text-slate-400">
                Review spikes in incidents first, then compare top triggers against effective strategies.
                Log new incidents with context to improve trend accuracy.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Focus: spikes, triggers, strategies.
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Incident Frequency (Last 30 Days)</h2>
                <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm">
                  <option>All Students</option>
                  <option>Year 7</option>
                  <option>Year 8</option>
                </select>
              </div>
              
              {/* Mock Chart */}
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {[12, 8, 15, 10, 5, 8, 12, 18, 14, 10, 6, 4, 8, 12, 15, 20, 18, 12, 8, 5, 3, 6, 8, 10, 12, 15, 10, 8, 6, 4].map((h, i) => (
                  <div key={i} className="w-full bg-orange-500/20 hover:bg-orange-500/40 rounded-t transition-all relative group">
                    <div className="absolute bottom-0 w-full bg-orange-500 rounded-t" style={{ height: `${h * 4}%` }}></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                      {h} Incidents
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-slate-500 px-2">
                <span>1 Nov</span>
                <span>15 Nov</span>
                <span>30 Nov</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Top Triggers
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Unstructured Time', count: 45, color: 'bg-red-500' },
                    { label: 'Peer Conflict', count: 32, color: 'bg-orange-500' },
                    { label: 'Academic Demand', count: 28, color: 'bg-yellow-500' },
                    { label: 'Sensory Overload', count: 15, color: 'bg-blue-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${(item.count / 50) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Effective Strategies
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Time Out Card', success: '85%' },
                    { name: 'Restorative Chat', success: '72%' },
                    { name: 'Sensory Break', success: '68%' },
                    { name: 'Visual Timetable', success: '64%' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-slate-300">{item.name}</span>
                      <span className="text-sm font-bold text-emerald-400">{item.success}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Logs */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Recent Logs
            </h3>
            <div className="space-y-4">
              {[
                { student: 'Leo K.', type: 'Disruption', time: '10:45 AM', location: 'Maths Room 3' },
                { student: 'Mia S.', type: 'Refusal', time: '09:15 AM', location: 'Playground' },
                { student: 'Jayden R.', type: 'Verbal Abuse', time: 'Yesterday', location: 'Corridor' },
                { student: 'Sarah J.', type: 'Equipment Misuse', time: 'Yesterday', location: 'Science Lab' },
              ].map((log, i) => (
                <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white">{log.student}</span>
                    <span className="text-xs text-slate-500">{log.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded uppercase">{log.type}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                    {log.location}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
