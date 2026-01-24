'use client';

/**
 * @copyright EdPsych Connect Limited 2026
 * @license Proprietary - All Rights Reserved
 * 
 * THE NEURO-ARCADE: ENTERPRISE GAMIFICATION HUB
 * High-fidelity engagement platform combining curricular objectives with AAA-style mechanics.
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Trophy, 
  Code, 
  Gamepad2, 
  Zap, 
  Target, 
  ArrowLeft,
  Crown,
  TrendingUp,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Game Engines
const BattleRoyalePreview = dynamic(() => import('@/components/battle-royale/BattleRoyalePreview'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
      Loading Battle Royale...
    </div>
  )
});
const EnhancedCodingCurriculum = dynamic(() => import('@/components/demo/EnhancedCodingCurriculum'), {
  ssr: false,
  loading: () => (
    <div className="py-12 text-center text-sm text-slate-500">
      Loading Coding Dojo...
    </div>
  )
});

// Types
type GameMode = 'LOBBY' | 'BATTLE_ROYALE' | 'CODING_DOJO';

export default function GamificationPage() {
  const [activeGame, setActiveGame] = useState<GameMode>('LOBBY');
  const [userLevel, setUserLevel] = useState(12);
  const [xpCurrent, setXpCurrent] = useState(2450);
  const [xpNext, setXpNext] = useState(3000);

  // Simple mock leaderboard data if API fails or for initial render
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'CyberStudent_99', xp: 15400, school: 'Oakwood Academy' },
    { rank: 2, name: 'NeuroNinja', xp: 14200, school: 'St. Marys' },
    { rank: 3, name: 'LogicMaster', xp: 13800, school: 'Westfield High' },
  ]);

  // Load leaderboard (simulate API)
  useEffect(() => {
    // In a real implementation, this would fetch from /api/gamification/leaderboard
    // keeping the mock for World Class UI demo resilience
  }, []);

  const handleReturnToLobby = () => setActiveGame('LOBBY');

  // --- RENDERERS ---

  if (activeGame === 'BATTLE_ROYALE') {
    return (
      <div className="min-h-screen bg-slate-950 text-white animate-in fade-in duration-500">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <Button 
            variant="ghost" 
            onClick={handleReturnToLobby}
            className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Exit to Lobby
          </Button>
          <div className="flex items-center gap-3">
             <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                <Gamepad2 className="w-3 h-3 mr-1" /> Battle Mode
             </Badge>
             <span className="font-mono text-sm text-slate-400">Session ID: #BR-8821</span>
          </div>
        </div>
        <div className="h-[calc(100vh-65px)]">
           <BattleRoyalePreview />
        </div>
      </div>
    );
  }

  if (activeGame === 'CODING_DOJO') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 animate-in fade-in duration-500">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-50">
           <Button 
            variant="ghost" 
            onClick={handleReturnToLobby}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Exit to Lobby
          </Button>
          <div className="flex items-center gap-3">
             <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Code className="w-3 h-3 mr-1" /> Coding Dojo
             </Badge>
             <span className="font-mono text-sm text-slate-400">Phyton Core: Active</span>
          </div>
        </div>
        <EnhancedCodingCurriculum />
      </div>
    );
  }

  // --- LOBBY VIEW (Default) ---

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* PLAYER HUD */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                ARCADE
              </h1>
              <Badge className="bg-amber-500 text-slate-900 font-bold border-0 px-2 py-0.5">BETA</Badge>
            </div>
            <p className="text-slate-400 max-w-md">
              Master curriculum objectives to unlock rewards. Compete globally, learn locally.
            </p>
          </div>

          <Card className="bg-slate-900/50 border-slate-700 w-full md:w-96 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Level {userLevel}</span>
                <span className="text-xs font-mono text-purple-400">{xpCurrent} / {xpNext} XP</span>
              </div>
              <Progress value={(xpCurrent / xpNext) * 100} className="h-2 bg-slate-800" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="flex justify-between mt-3 text-xs text-slate-500">
                <span className="flex items-center"><Trophy className="w-3 h-3 mr-1 text-amber-500" /> Rank #42</span>
                <span className="flex items-center"><Coins className="w-3 h-3 mr-1 text-yellow-400" /> 850 Tokens</span>
              </div>
            </CardContent>
          </Card>
        </header>

        {/* MAIN ARCADE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* GAMES COLUMN (8) */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-400" /> 
              Available Modes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BATTLE ROYALE CARD */}
              <div 
                onClick={() => setActiveGame('BATTLE_ROYALE')}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-slate-700 bg-slate-900 hover:border-purple-500/50 transition-all duration-300 shadow-2xl hover:shadow-purple-900/20"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950 z-10" />
                {/* Mock Background Image Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 group-hover:scale-105 transition-transform duration-700" />
                
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <Badge className="mb-3 bg-purple-600 hover:bg-purple-700 border-0">MULTIPLAYER</Badge>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Safety Net Royale</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        Compete against 99 other students in a trivia battle royale. Be the last mind standing.
                      </p>
                      <div className="flex gap-4 text-xs font-mono text-slate-500">
                        <span className="flex items-center"><UsersIcon className="w-3 h-3 mr-1" /> 1.2k Online</span>
                        <span className="flex items-center"><Target className="w-3 h-3 mr-1" /> PvP</span>
                      </div>
                    </div>
                    <Button size="icon" className="rounded-full h-12 w-12 bg-white text-black hover:bg-purple-400 hover:text-white transition-colors">
                      <PlayIcon className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

               {/* CODING DOJO CARD */}
               <div 
                onClick={() => setActiveGame('CODING_DOJO')}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-slate-700 bg-slate-900 hover:border-blue-500/50 transition-all duration-300 shadow-2xl hover:shadow-blue-900/20"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950 z-10" />
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 group-hover:scale-105 transition-transform duration-700" />
                
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <Badge className="mb-3 bg-blue-600 hover:bg-blue-700 border-0">SKILL BUILDER</Badge>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Python Dojo</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        Master Python through interactive puzzles. Debug the mainframe and secure the data.
                      </p>
                       <div className="flex gap-4 text-xs font-mono text-slate-500">
                        <span className="flex items-center"><Code className="w-3 h-3 mr-1" /> Python 3.10</span>
                        <span className="flex items-center"><Zap className="w-3 h-3 mr-1" /> Daily Challenges</span>
                      </div>
                    </div>
                    <Button size="icon" className="rounded-full h-12 w-12 bg-white text-black hover:bg-blue-400 hover:text-white transition-colors">
                      <PlayIcon className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* QUICK QUESTS */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
               <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" /> Daily Quests
               </h3>
               <div className="space-y-3">
                  {[
                     { title: "Debug 3 Functions", reward: "150 XP", progress: 66 },
                     { title: "Win a Royale Match", reward: "500 XP", progress: 0 },
                     { title: "Complete 'Data Types' Module", reward: "300 XP", progress: 100 }
                  ].map((quest, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <div className="flex-1 mr-4">
                           <div className="flex justify-between text-sm mb-1">
                              <span className={quest.progress === 100 ? "text-slate-500 line-through" : "text-slate-200"}>{quest.title}</span>
                              <span className="text-amber-400 text-xs font-mono">{quest.reward}</span>
                           </div>
                           <Progress value={quest.progress} className={`h-1.5 ${quest.progress === 100 ? "bg-green-900" : "bg-slate-800"}`}  indicatorClassName={quest.progress === 100 ? "bg-green-600" : "bg-blue-500"} />
                        </div>
                        {quest.progress === 100 && <Badge variant="outline" className="border-green-500 text-green-500 text-[10px]">DONE</Badge>}
                     </div>
                  ))}
               </div>
            </div>
          </div>

          {/* SIDEBAR COLUMN (4) - Leaderboards */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="bg-slate-900 border-slate-800 h-full">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center gap-2">
                         <TrendingUp className="w-5 h-5 text-amber-500" /> Global Rankings
                      </h3>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Weekly</span>
                   </div>
                   
                   <div className="space-y-4">
                      {leaderboard.map((entry, index) => (
                         <div key={index} className="flex items-center p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/50 transition-colors group">
                            <div className={`
                               w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm
                               ${index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 
                                 index === 1 ? 'bg-slate-300 text-black' :
                                 index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-500'}
                            `}>
                               {index <= 2 ? <Crown className="w-4 h-4" /> : entry.rank}
                            </div>
                            <div className="flex-1">
                               <div className="font-bold text-sm group-hover:text-white transition-colors">{entry.name}</div>
                               <div className="text-xs text-slate-500">{entry.school}</div>
                            </div>
                            <div className="text-right">
                               <div className="font-mono text-sm text-purple-400 font-bold">{entry.xp.toLocaleString()}</div>
                               <div className="text-[10px] text-slate-600">XP</div>
                            </div>
                         </div>
                      ))}
                      
                      {/* User Rank Placeholder */}
                      <div className="mt-6 pt-4 border-t border-slate-800">
                         <div className="flex items-center p-3 rounded-lg bg-blue-900/10 border border-blue-500/30">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3 text-xs">
                               You
                            </div>
                            <div className="flex-1">
                               <div className="font-bold text-sm text-blue-200">Current Student</div>
                               <div className="text-xs text-blue-400">Rank #42</div>
                            </div>
                            <div className="text-right">
                               <div className="font-mono text-sm text-blue-300 font-bold">2,450</div>
                               <div className="text-[10px] text-blue-500">XP</div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <Button className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-300">
                      View Full Boards
                   </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

// Sub-components for icons to keep main clean
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
   return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
   )
}
