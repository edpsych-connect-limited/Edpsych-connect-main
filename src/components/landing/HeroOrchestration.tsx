'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 */

import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import { ArrowRight, Sparkles, Brain, FileText, Target } from 'lucide-react';

export default function HeroOrchestration() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-20">
      {/* Background */}
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
          <span className="text-sm font-medium">Built by a Chartered Educational Psychologist · HCPC Registered PYL042340</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
        >
          Every Child Deserves<br />
          <span className="text-indigo-400">The Right Support, Right Now</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed"
        >
          EdPsych Connect gives EPs, SENCOs, and schools one platform to assess, intervene, and report — so they spend less time on admin and more time on children.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base text-slate-500 max-w-2xl mx-auto mb-12"
        >
          From first referral to final EHCP — every step connected, every decision traceable, every intervention evidence-based.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg transition-all border border-slate-700"
          >
            See How It Works
          </Link>
        </motion.div>

        {/* Platform proof points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: Brain, label: 'ECCA Assessment Framework', sub: 'Cognitive, emotional, contextual profiling' },
            { icon: Target, label: 'Structured Intervention Engine', sub: 'Evidence-based, linked to assessment' },
            { icon: FileText, label: 'Statutory EHCP Workflow', sub: 'Full lifecycle, deadline tracking built in' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-5 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
