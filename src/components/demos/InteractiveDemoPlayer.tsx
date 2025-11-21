/**
 * Interactive Demo Player
 * Container for all feature demos with navigation and controls
 *
 * Features:
 * - Auto-play with pause/resume
 * - Step-by-step navigation
 * - Full-screen mode
 * - Progress tracking
 * - Demo completion tracking
 */

'use client';

import React, { useState, useEffect } from 'react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  duration?: number; // Auto-advance duration in ms
  highlight?: string; // CSS selector to highlight
}

interface InteractiveDemoPlayerProps {
  title: string;
  description: string;
  steps: DemoStep[];
  onComplete?: () => void;
}

export default function InteractiveDemoPlayer({
  title,
  description,
  steps,
  onComplete,
}: InteractiveDemoPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(prev => prev + 1);
    } else {
      // Demo complete
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  };

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return;

    const currentStepData = steps[currentStep];
    const duration = currentStepData.duration || 3000;

    const timer = setTimeout(() => {
      handleNext();
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setCompletedSteps(new Set());
  };

  const currentStepData = steps[currentStep];

  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-blue-100">{description}</p>

        {/* Progress Bar */}
        <div className="mt-4">
          // ...existing code...
import React, { useState, useEffect } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface DemoStep {
  id: string;
// ...existing code...
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <ProgressBar 
            value={progress} 
            max={100} 
            colorClass="bg-white" 
            trackColorClass="bg-blue-400/30"
          />
        </div>
      </div>

      {/* Step Navigation */}
// ...existing code...
        </div>
      </div>

      {/* Step Navigation */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                index === currentStep
                  ? 'bg-blue-600 text-white shadow-md'
                  : completedSteps.has(index)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {completedSteps.has(index) && '✓ '}
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 min-h-[400px]">
          {currentStepData.content}
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={handleRestart}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handlePlayPause}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              {isPlaying ? (
                <>
                  <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  {currentStep === totalSteps - 1 ? 'Restart' : 'Play'}
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
