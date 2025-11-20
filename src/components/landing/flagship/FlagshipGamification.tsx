'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Target, Users, Zap } from 'lucide-react';

export default function FlagshipGamification() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
          
          {/* Visual/Demo Placeholder (Left on desktop for variety) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-amber-100 to-orange-100 rounded-3xl transform -rotate-3 scale-105 opacity-50 blur-2xl" />
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
              {/* Mock Leaderboard Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Battle Royale Season 4
                </div>
                <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Live Now</div>
              </div>
              
              {/* Mock Leaderboard Content */}
              <div className="p-0">
                {[
                  { rank: 1, name: "Squad Alpha", points: "12,450", change: "+450", color: "bg-amber-50" },
                  { rank: 2, name: "Team Phoenix", points: "11,200", change: "+120", color: "bg-white" },
                  { rank: 3, name: "Logic Legends", points: "10,890", change: "+300", color: "bg-white" },
                ].map((team, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 border-b border-slate-100 ${team.color}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {team.rank}
                      </div>
                      <div className="font-medium text-slate-900">{team.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{team.points}</div>
                      <div className="text-xs text-green-600 font-medium">{team.change}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Storm Event Banner */}
              <div className="bg-indigo-600 p-3 text-white text-center text-sm font-bold flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-300" />
                STORM EVENT ACTIVE: Double Merits!
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold mb-6">
              <Trophy className="w-4 h-4" />
              <span className="uppercase tracking-wide">Gamification & Engagement</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Engagement That <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Sustains Itself.</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Turn intervention into adventure. Our Battle Royale system keeps students motivated with live leaderboards, squad competitions, and merit-based rewards—automatically tracking progress while they play.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <Users className="w-8 h-8 text-indigo-600 mb-3" />
                <h4 className="font-bold text-slate-900 mb-1">Squad Competitions</h4>
                <p className="text-sm text-slate-600">Collaborative team-based learning challenges.</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <Target className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-bold text-slate-900 mb-1">Goal Tracking</h4>
                <p className="text-sm text-slate-600">Automatic progress monitoring towards EHCP goals.</p>
              </div>
            </div>

            <Link href="/signup" className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group">
              Explore The Arena
              <Zap className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
