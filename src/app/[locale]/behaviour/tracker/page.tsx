'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Calendar, AlertTriangle, CheckCircle, Filter, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface BehaviourLog {
  id: string;
  studentName: string;
  type: string;
  time: string;
  location: string;
}

interface TriggerItem {
  label: string;
  count: number;
}

interface StrategyItem {
  name: string;
  successRate: string;
}

interface BehaviourData {
  logs: BehaviourLog[];
  triggers: TriggerItem[];
  strategies: StrategyItem[];
  incidentFrequency: number[];
}

export default function BehaviourTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BehaviourData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/behaviour?action=tracker-summary');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        }
      } catch {
        // API not yet implemented — show empty states
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const logs = data?.logs ?? [];
  const triggers = data?.triggers ?? [];
  const strategies = data?.strategies ?? [];
  const frequency = data?.incidentFrequency ?? [];

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
                </select>
              </div>

              {frequency.length > 0 ? (
                <>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {frequency.map((h, i) => (
                      <div key={i} className="w-full bg-orange-500/20 hover:bg-orange-500/40 rounded-t transition-all relative group">
                        <div className="absolute bottom-0 w-full bg-orange-500 rounded-t" style={{ height: `${(h / Math.max(...frequency)) * 100}%` }} />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                          {h} Incidents
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-slate-500 px-2">
                    <span>Day 1</span>
                    <span>Day 15</span>
                    <span>Day 30</span>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No incident data yet"
                  description="Log incidents using the button above to start tracking patterns."
                  className="bg-slate-800/40 border-slate-700 border-dashed text-slate-400"
                />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Top Triggers
                </h3>
                {triggers.length > 0 ? (
                  <div className="space-y-3">
                    {triggers.map((item, i) => {
                      const max = Math.max(...triggers.map(t => t.count), 1);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{item.label}</span>
                            <span className="text-slate-500">{item.count}</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: `${(item.count / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No trigger data"
                    description="Triggers will appear as incidents are logged."
                    className="bg-slate-800/40 border-slate-700 border-dashed text-slate-400"
                  />
                )}
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Effective Strategies
                </h3>
                {strategies.length > 0 ? (
                  <div className="space-y-4">
                    {strategies.map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-slate-300">{item.name}</span>
                        <span className="text-sm font-bold text-emerald-400">{item.successRate}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No strategy data"
                    description="Strategy effectiveness will populate as outcomes are recorded."
                    className="bg-slate-800/40 border-slate-700 border-dashed text-slate-400"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Logs */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Recent Logs
            </h3>
            {logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-white">{log.studentName}</span>
                      <span className="text-xs text-slate-500">{log.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded uppercase">{log.type}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      {log.location}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No incidents logged"
                description="Use 'Log New Incident' to record behaviour events."
                className="bg-slate-800/40 border-slate-700 border-dashed text-slate-400"
              />
            )}
            <button className="w-full mt-6 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
