'use client';

import React from 'react';
import Link from 'next/link';
import { ClipboardCheck, BarChart3, Info } from 'lucide-react';

export default function SencoAuditPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/school/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">&lt; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-emerald-500" />
            SENCO Classroom Audit
          </h1>
          <p className="text-slate-400 mt-2">Evaluate learning environments for inclusivity and accessibility.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" />
              Active Audits
            </h2>
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
              <ClipboardCheck className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No audits in progress.</p>
              <p className="text-xs mt-1 text-slate-600">Classroom audits will appear here once created.</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Compliance Overview
            </h2>
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
              <BarChart3 className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No compliance data yet.</p>
              <p className="text-xs mt-1 text-slate-600">Metrics will populate as audits are completed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
