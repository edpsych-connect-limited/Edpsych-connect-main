'use client';
import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/components/gamification/leaderboard/LeaderboardEntry';
import BattleRoyalePreview from '@/components/battle-royale/BattleRoyalePreview';

export default function GamificationPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'battle-royale'>('leaderboard');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/gamification/leaderboard');
        const data = await res.json();
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="p-6">Loading gamification data...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Gamification Hub</h1>
            <p className="text-slate-600 mt-2">Compete, learn, and grow with the community.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  activeTab === 'leaderboard' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('battle-royale')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  activeTab === 'battle-royale' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Battle Royale
              </button>
            </div>
            
            <div className="hidden md:block">
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                <span>🏆</span>
                <span>Season 1 Active</span>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'battle-royale' ? (
          <BattleRoyalePreview />
        ) : (
          <>
            {leaderboard.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-200">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Be the First Champion!</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
              The leaderboard is currently waiting for its first pioneer. Complete assessments, log interventions, and engage with the community to earn points.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10 text-left">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">1. Complete Profile</div>
                <p className="text-sm text-slate-600">Earn 500 points for setting up your professional profile.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">2. Run Assessment</div>
                <p className="text-sm text-slate-600">Earn 1000 points for your first ECCA assessment.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">3. Join Community</div>
                <p className="text-sm text-slate-600">Earn 250 points for your first forum post.</p>
              </div>
            </div>

            <a 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Go to Dashboard & Start Earning
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {leaderboard.map((entry) => (
              <LeaderboardEntry
                key={entry.rank}
                rank={entry.rank}
                name={entry.name}
                points={entry.points}
              />
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </main>
  );
}