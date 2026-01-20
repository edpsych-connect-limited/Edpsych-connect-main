'use client';

import React from 'react';
import Link from 'next/link';
import { ClipboardCheck, AlertTriangle, BarChart3 } from 'lucide-react';

export default function SencoAuditPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/demo" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">&lt; Back to Demo</Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-emerald-500" />
            SENCO Classroom Audit
          </h1>
          <p className="text-slate-400 mt-2">Evaluate learning environments for inclusivity and accessibility.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Active Audits
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-medium">Year 4 - Room 12</h3>
                <p className="text-sm text-slate-400">Sensory processing focus - In Progress</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-medium">Year 2 - Room 5</h3>
                <p className="text-sm text-slate-400">Visual support check - Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Compliance Overview
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Visual Schedules</span>
                  <span className="text-emerald-400">85%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sensory Zones</span>
                  <span className="text-amber-400">42%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[42%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
