'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Lock, FileText } from 'lucide-react';

export default function SafeguardingLogPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link href="/demo" className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">&lt; Back to Demo</Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Safeguarding Log
          </h1>
          <p className="text-slate-400 mt-2">Secure incident reporting and management (CPOMS/MyConcern integration).</p>
        </header>

        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-red-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-200">Secure Environment</h3>
              <p className="text-red-200/70 text-sm">
                This area is strictly confidential. All entries are encrypted and audit-logged.
                Ensure you are in a private location before proceeding.
              </p>
            </div>
          </div>
        </div>
        <div className="mb-8 rounded-xl border border-red-900/40 bg-red-950/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-red-100">Decision Support</p>
              <p className="text-sm text-red-200/80">
                Record the immediate risk level and actions taken. Complete category and details before
                submitting, and escalate urgent concerns via the safeguarding lead.
              </p>
            </div>
            <div className="text-xs text-red-200/70">
              Focus: risk, actions, escalation.
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">New Incident Report</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Student Name</label>
                <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="Search student..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none">
                  <option>Select category...</option>
                  <option>Physical Abuse</option>
                  <option>Emotional Abuse</option>
                  <option>Neglect</option>
                  <option>Bullying (Online)</option>
                  <option>Bullying (In Person)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Incident Details</label>
              <textarea className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none" placeholder="Describe what happened, who was involved, and any immediate actions taken..." />
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button type="button" className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium">Submit Report</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
