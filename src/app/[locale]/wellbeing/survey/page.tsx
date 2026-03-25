'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, TrendingUp, Loader2 } from 'lucide-react';

interface WellbeingMetrics {
  staffMorale: number | null;
  staffMoraleTrend: number | null;
  studentAnxiety: string | null;
  responseRate: number | null;
}

export default function WellbeingSurveyPage() {
  const [metrics, setMetrics] = useState<WellbeingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/wellbeing?action=summary');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setMetrics(json.data);
          }
        }
      } catch {
        // API not yet implemented — show empty states
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

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
                Review shifts in morale or anxiety first, then launch a targeted survey. Favour short
                check-ins when response rate is high.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Focus: trends, survey selection, engagement.
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : metrics ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-1">Staff Morale</div>
              {metrics.staffMorale !== null ? (
                <>
                  <div className="text-3xl font-bold text-emerald-400">{metrics.staffMorale}/10</div>
                  {metrics.staffMoraleTrend !== null && (
                    <div className={`text-xs flex items-center mt-1 ${metrics.staffMoraleTrend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metrics.staffMoraleTrend >= 0 ? '+' : ''}{metrics.staffMoraleTrend} this week
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-500 text-sm mt-2">No survey data yet</div>
              )}
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-1">Student Anxiety</div>
              {metrics.studentAnxiety ? (
                <>
                  <div className="text-3xl font-bold text-amber-400">{metrics.studentAnxiety}</div>
                  <div className="text-xs text-slate-500 mt-1">Based on recent surveys</div>
                </>
              ) : (
                <div className="text-slate-500 text-sm mt-2">No survey data yet</div>
              )}
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-1">Response Rate</div>
              {metrics.responseRate !== null ? (
                <>
                  <div className="text-3xl font-bold text-indigo-400">{metrics.responseRate}%</div>
                  <div className="text-xs text-indigo-500 mt-1">Latest survey cycle</div>
                </>
              ) : (
                <div className="text-slate-500 text-sm mt-2">No surveys launched yet</div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {['Staff Morale', 'Student Anxiety', 'Response Rate'].map((label) => (
              <div key={label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="text-slate-400 text-sm mb-1">{label}</div>
                <div className="text-slate-500 text-sm mt-2">No data available</div>
              </div>
            ))}
          </div>
        )}

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
