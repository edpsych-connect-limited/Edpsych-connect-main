'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

export const AICentralNervousSystem = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [systemStatus] = useState('Operational');

  // Simulate AI activity
  useEffect(() => {
    const interval = setInterval(() => {
      const levels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      setActivityLevel(levels[Math.floor(Math.random() * levels.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-end gap-2">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 p-4 rounded-2xl shadow-2xl w-72 mb-2"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Central Nervous System
              </h3>
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>System Status</span>
                <span className="text-emerald-400 font-mono">{systemStatus}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Neural Activity</span>
                  <span className="text-indigo-400 font-mono">{activityLevel.toUpperCase()}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    animate={{ 
                      width: activityLevel === 'low' ? '30%' : activityLevel === 'medium' ? '60%' : '95%' 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  EdPsych Connect is powered by an autonomous AI orchestration layer, continuously optimizing learning pathways and clinical interventions in real-time.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-3 rounded-full shadow-lg border transition-all duration-300 ${
          isExpanded 
            ? 'bg-indigo-600 border-indigo-400 text-white' 
            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
        }`}
      >
        <div className="relative">
          <Brain className={`w-6 h-6 ${isExpanded ? 'animate-pulse' : ''}`} />
          {!isExpanded && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          )}
        </div>
      </motion.button>
    </div>
  );
};
