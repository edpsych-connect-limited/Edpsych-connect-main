'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

export default function InterventionSchedulePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/demo" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">← Back to Demo</Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-500" />
            Intervention Scheduler
          </h1>
          <p className="text-slate-400 mt-2">Schedule and manage targeted support sessions.</p>
        </header>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium">
              + New Session
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {i}
                  </div>
                  <div>
                    <h3 className="font-medium">Memory Magic Group {String.fromCharCode(64 + i)}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 10:00 AM</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 4 Students</span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
