'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Plus, Users, Trophy, BarChart2, Play, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface GameSession {
  id: string;
  title: string;
  className: string;
  joined: number;
  total: number;
  round: number;
  totalRounds: number;
  status: string;
}

interface Assignment {
  id: string;
  title: string;
  className: string;
  completion: string;
  avgScore: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  change: string;
}

interface GamificationData {
  activeSessions: GameSession[];
  recentAssignments: Assignment[];
  leaderboard: LeaderboardEntry[];
  weeklyParticipation: number | null;
  avgSessionTime: string | null;
}

export default function TeacherGamificationPage() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/gamification/teacher-dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        } else {
          setData({
            activeSessions: [],
            recentAssignments: [],
            leaderboard: [],
            weeklyParticipation: null,
            avgSessionTime: null,
          });
        }
      } catch {
        setData({
          activeSessions: [],
          recentAssignments: [],
          leaderboard: [],
          weeklyParticipation: null,
          avgSessionTime: null,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const activeSessions = data?.activeSessions ?? [];
  const recentAssignments = data?.recentAssignments ?? [];
  const leaderboard = data?.leaderboard ?? [];

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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                Active Sessions
              </h2>
              {activeSessions.length > 0 ? (
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{session.title}</h3>
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full animate-pulse">LIVE NOW</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400">
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {session.joined}/{session.total} Joined</span>
                          <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> Round {session.round}/{session.totalRounds}</span>
                        </div>
                      </div>
                      <div className="bg-slate-950/50 p-4 flex items-center justify-end">
                        <button className="text-purple-400 hover:text-purple-300 font-medium text-sm">Open Monitor &gt;</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No active sessions"
                  description="Create a new Battle Royale session to get started."
                  className="bg-slate-900/50 border border-slate-800 text-slate-400"
                />
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Recent Assignments</h2>
              {recentAssignments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssignments.map((item) => (
                    <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors cursor-pointer">
                      <div>
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="text-sm text-slate-400">{item.className}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-200">{item.avgScore} Avg</div>
                        <div className="text-xs text-slate-500">{item.completion} Complete</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No assignments yet"
                  description="Assigned gamification activities will appear here."
                  className="bg-slate-900/50 border border-slate-800 text-slate-400"
                />
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Class Leaderboard
              </h3>
              {leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800 text-slate-400'}`}>
                          {entry.rank}
                        </div>
                        <span className="text-sm font-medium">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{entry.points}</div>
                        <div className="text-[10px] text-emerald-400">{entry.change}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No leaderboard data yet. Start a session to populate rankings.</p>
              )}
              <button className="w-full mt-6 py-2 text-sm text-purple-400 hover:text-purple-300 border border-purple-500/30 rounded-lg">
                View Full Report
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                Engagement Stats
              </h3>
              {data?.weeklyParticipation != null ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Weekly Participation</span>
                      <span className="text-white">{data.weeklyParticipation}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${data.weeklyParticipation}%` }} />
                    </div>
                  </div>
                  {data.avgSessionTime && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Avg. Session Time</span>
                        <span className="text-white">{data.avgSessionTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Engagement stats will appear once sessions have been run.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
