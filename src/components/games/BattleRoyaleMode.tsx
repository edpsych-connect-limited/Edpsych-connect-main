'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";
import { GamificationAPI } from "../../lib/gamificationApi";
import { LeaderboardEntry } from "../gamification/leaderboard/LeaderboardEntry";


interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  health: number;
}

export const BattleRoyaleMode: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const leaderboard = await GamificationAPI.getLeaderboard();
        const enriched = leaderboard.map((entry, idx) => ({
          id: String(idx),
          name: entry.name,
          avatarUrl: entry.avatarUrl,
          points: entry.points,
          health: 100,
        }));
        setPlayers(enriched);
      } catch (_err) {
        console.error("Failed to load players", _err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const attackPlayer = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, health: Math.max(0, p.health - 20) } : p
      )
    );
  };

  if (loading) return <p className="p-6 text-lg">Loading Battle Royale...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Battle Royale Mode
      </h2>
      <div className="flex flex-col gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className={`p-4 border rounded-md ${
              player.health > 0 ? "bg-white border-gray-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <LeaderboardEntry
                rank={1}
                name={player.name}
                avatarUrl={player.avatarUrl}
                points={player.points}
              />
              <button
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={() => attackPlayer(player.id)}
                disabled={player.health === 0}
              >
                Attack
              </button>
            </div>
            <LinearProgress
              variant="determinate"
              value={player.health}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: player.health > 50 ? '#10b981' : player.health > 0 ? '#f59e0b' : '#ef4444',
                  borderRadius: 1,
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
