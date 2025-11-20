'use client';
import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/components/gamification/leaderboard/LeaderboardEntry';

export default function GamificationPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    return <div className="p-6">Loading leaderboard...</div>;
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Gamification Leaderboard</h1>
      {leaderboard.length === 0 ? (
        <p>No active players yet. Be the first!</p>
      ) : (
        leaderboard.map((entry) => (
          <LeaderboardEntry
            key={entry.rank}
            rank={entry.rank}
            name={entry.name}
            points={entry.points}
          />
        ))
      )}
    </main>
  );
}