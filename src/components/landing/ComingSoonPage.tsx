'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // In a real implementation, this would send to an API
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,#020617_100%)] z-10" />
      </div>

      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        {/* Logo / Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
            <div className="w-20 h-20 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-2xl">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            {/* Orbiting particles */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-indigo-500/10 w-[140%] h-[140%] -top-[20%] -left-[20%]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400"
        >
          EdPsych Connect World
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          We are architecting the future of educational psychology. <br className="hidden md:block" />
          <span className="text-indigo-400">Platform Intelligence</span> meets <span className="text-purple-400">Clinical Excellence</span>.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {[
            "Autonomous Orchestration",
            "Dynamic Assessment",
            "Clinical Precision"
          ].map((feature, i) => (
            <div key={i} className="px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-300 text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {feature}
            </div>
          ))}
        </motion.div>

        {/* Email Capture */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 px-4 py-3 outline-none rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  Notify Me <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-center gap-3 text-green-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">You're on the list. We'll be in touch soon.</span>
            </motion.div>
          )}
          <p className="mt-4 text-xs text-slate-600 uppercase tracking-widest">
            Launching Q1 2026
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} EdPsych Connect Limited. All rights reserved.
        </p>
      </div>
    </main>
  );
}
