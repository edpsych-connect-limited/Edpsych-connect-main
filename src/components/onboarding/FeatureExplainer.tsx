import { logger } from "@/lib/logger";
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
import { usePathname } from 'next/navigation';
import { X, HelpCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureGuide {
  path: string;
  title: string;
  steps: {
    target?: string; // CSS selector for highlighting
    title: string;
    content: string;
  }[];
}

const GUIDES: FeatureGuide[] = [
  {
    path: '/teachers',
    title: 'Classroom Cockpit Tour',
    steps: [
      {
        title: 'Welcome to Your Command Center',
        content: 'This dashboard gives you a real-time overview of your class. Use the "Launch Dashboard Demo" button to see it in action.',
      },
      {
        title: 'Urgency Sorting',
        content: 'Students are automatically sorted by need. "Urgent" cases appear first, ensuring no child slips through the cracks.',
      },
      {
        title: 'Voice Commands',
        content: 'Use the microphone icon to ask questions like "Who needs help with reading?" or "Create an intervention for Sarah".',
      }
    ]
  },
  {
    path: '/gamification',
    title: 'Gamification Hub Guide',
    steps: [
      {
        title: 'Compete & Learn',
        content: 'Switch between the "Leaderboard" to see top performers and "Battle Royale" for live multiplayer learning games.',
      },
      {
        title: 'Earn Points',
        content: 'Complete assessments and log interventions to climb the ranks. Look for the "Season 1 Active" badge!',
      }
    ]
  },
  {
    path: '/parents',
    title: 'Parent Portal Walkthrough',
    steps: [
      {
        title: 'Your Child\'s Progress',
        content: 'Click "Launch Portal Demo" to see a live view of student progress, wins, and areas for development.',
      },
      {
        title: 'Secure Messaging',
        content: 'Communicate directly with teachers and EPs through the secure message center.',
      }
    ]
  }
];

export default function FeatureExplainer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState<Record<string, boolean>>({});

  const currentGuide = GUIDES.find(g => g.path === pathname);

  useEffect(() => {
    // Auto-open if not seen before (and guide exists)
    if (currentGuide && !hasSeenGuide[pathname]) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // Delay slightly to let page load
      return () => clearTimeout(timer);
    }
  }, [pathname, currentGuide, hasSeenGuide]);

  const handleClose = () => {
    setIsOpen(false);
    setHasSeenGuide(prev => ({ ...prev, [pathname]: true }));
  };

  const handleNext = () => {
    if (currentGuide && currentStep < currentGuide.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  if (!currentGuide) return null;

  return (
    <>
      {/* Trigger Button (always visible when guide available) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-44 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50 group"
        aria-label="Show Feature Guide"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Page Guide
        </span>
      </button>

      {/* Guide Modal/Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-44 w-80 bg-white rounded-xl shadow-2xl border border-indigo-100 z-50 overflow-hidden"
          >
            <div className="bg-indigo-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-bold">{currentGuide.title}</h3>
              </div>
              <button onClick={handleClose} className="text-indigo-200 hover:text-white" aria-label="Close guide">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Step {currentStep + 1} of {currentGuide.steps.length}
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-1 mb-2">
                  {currentGuide.steps[currentStep].title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentGuide.steps[currentStep].content}
                </p>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-1">
                  {currentGuide.steps.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full ${idx === currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  {currentStep === currentGuide.steps.length - 1 ? 'Got it!' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
