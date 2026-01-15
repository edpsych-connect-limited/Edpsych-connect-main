'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import { Bot, X, Sparkles, MessageCircle, HelpCircle, BookOpen } from 'lucide-react';
import { VoiceCommandInterface } from '@/components/orchestration/VoiceCommandInterface';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Personal Tutor (AI Companion)
 * 
 * A friendly, always-available AI study companion for students.
 * Uses the main AI Nervous System (VoiceCommandService) to provide
 * contextual help, not hardcoded answers.
 */
export const PersonalTutor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<'happy' | 'thinking' | 'idle'>('idle');

  const handleCommandResult = (result: any) => {
    // React to the AI's response (e.g., change mood)
    if (result.confidence > 0.8) {
      setMood('happy');
      setTimeout(() => setMood('idle'), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* The Chat Interface (Pointer events auto-enabled for children) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Learning Companion</h3>
                  <p className="text-xs text-indigo-100">Powered by Neural AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close tutor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Interface */}
            <div className="p-0">
               <VoiceCommandInterface 
                 contextType="student"
                 onCommandExecuted={handleCommandResult}
                 compact={false}
                 className="border-0 shadow-none rounded-none"
                 initialQuery="I'm stuck on this problem..."
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Trigger Button (Avatar) */}
      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/30 text-white transition-all"
        aria-label="Toggle Personal Tutor"
      >
        {/* Status indicator ring */}
        <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse-slow"></span>
        
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <Sparkles className="w-7 h-7" />
        )}

        {/* Notification Badge (Demo) */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};
