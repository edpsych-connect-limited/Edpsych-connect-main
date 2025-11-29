'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Layers, Zap } from 'lucide-react';

export default function HeroOrchestration() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 animate-pulse-slow" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Invisible Intelligence is Here</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
        >
          No Child Left Behind.<br />
          <span className="text-indigo-400">The UK's First SEND Orchestration System.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Experience what feels like magic, works like clockwork, and delivers like expertise multiplied.
          Automate the paperwork, orchestrate the interventions, and focus on the child.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            href="/onboarding"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            Start Orchestrating
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/about"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg transition-all border border-slate-700"
          >
            Learn More
          </Link>
        </motion.div>

        {/* Floating Elements Animation */}
        <div className="mt-24 relative h-64 hidden md:block">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.8 }}
             className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 flex flex-col gap-4"
           >
              {/* Mock UI Elements */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs text-slate-500 font-mono">Orchestration Active</div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                 <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-indigo-400" />
                    <div className="text-sm font-medium text-slate-300">Differentiation</div>
                    <div className="text-xs text-green-400">Optimized</div>
                 </div>
                 <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex flex-col items-center justify-center gap-2">
                    <Zap className="w-8 h-8 text-amber-400" />
                    <div className="text-sm font-medium text-slate-300">Interventions</div>
                    <div className="text-xs text-green-400">Active</div>
                 </div>
                 <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                    <div className="text-sm font-medium text-slate-300">Reports</div>
                    <div className="text-xs text-green-400">Generated</div>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
