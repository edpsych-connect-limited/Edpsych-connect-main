'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Tour {
  id: string;
  steps: TourStep[];
}

interface DemoContextType {
  startTour: (tourId: string) => void;
  stopTour: () => void;
  currentStep: number;
  totalSteps: number;
  activeTour: Tour | null;
  nextStep: () => void;
  prevStep: () => void;
  isActive: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// Predefined tours
const TOURS: Record<string, Tour> = {
  'dashboard': {
    id: 'dashboard',
    steps: [
      {
        target: 'h1',
        title: 'Welcome to Your Dashboard',
        content: 'This is your central hub for managing assessments, students, and reports.',
        position: 'bottom'
      },
      {
        target: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        content: 'Start new assessments, create EHCPs, or browse interventions with one click.',
        position: 'right'
      },
      {
        target: '[data-tour="recent-activity"]',
        title: 'Recent Activity',
        content: 'Keep track of your latest cases and reports here.',
        position: 'left'
      }
    ]
  },
  'assessment-wizard': {
    id: 'assessment-wizard',
    steps: [
      {
        target: '[data-tour="wizard-stepper"]',
        title: 'Assessment Progress',
        content: 'Track your progress through the 7 stages of the ECCA framework.',
        position: 'bottom'
      },
      {
        target: '[data-tour="domain-selector"]',
        title: 'Cognitive Domains',
        content: 'Switch between the 4 key cognitive domains to record observations.',
        position: 'right'
      },
      {
        target: '[data-tour="generate-report"]',
        title: 'Generate Report',
        content: 'When you are done, click here to generate a professional PDF report instantly.',
        position: 'left'
      }
    ]
  }
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const pathname = usePathname();

  // Auto-start tours based on URL parameters or first visit logic could go here
  useEffect(() => {
    // Reset tour on page change
    stopTour();
  }, [pathname]);

  const startTour = (tourId: string) => {
    const tour = TOURS[tourId];
    if (tour) {
      setActiveTour(tour);
      setCurrentStep(0);
    } else {
      console.warn(`Tour ${tourId} not found`);
    }
  };

  const stopTour = () => {
    setActiveTour(null);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (activeTour && currentStep < activeTour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      stopTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <DemoContext.Provider value={{
      startTour,
      stopTour,
      currentStep,
      totalSteps: activeTour ? activeTour.steps.length : 0,
      activeTour,
      nextStep,
      prevStep,
      isActive: !!activeTour
    }}>
      {children}
      {activeTour && <TourOverlay />}
    </DemoContext.Provider>
  );
}

function TourOverlay() {
  const { activeTour, currentStep, nextStep, prevStep, stopTour, totalSteps } = useDemo();
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!activeTour) return;

    const step = activeTour.steps[currentStep];
    const element = document.querySelector(step.target);

    if (element) {
      const rect = element.getBoundingClientRect();
      // Add scroll offset
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      setPosition({
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
      });
      setIsVisible(true);
      
      // Scroll to element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Element not found, maybe skip or wait?
      console.warn(`Target ${step.target} not found`);
      setIsVisible(false);
    }
  }, [activeTour, currentStep]);

  if (!activeTour || !isVisible) return null;

  const step = activeTour.steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop with hole */}
      {/* eslint-disable-next-line */}
      <div 
        className="absolute inset-0 bg-black/50 transition-all duration-300" 
        {...{ style: {
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${position.left}px 100%, 
            ${position.left}px ${position.top}px, 
            ${position.left + position.width}px ${position.top}px, 
            ${position.left + position.width}px ${position.top + position.height}px, 
            ${position.left}px ${position.top + position.height}px, 
            ${position.left}px 100%, 
            100% 100%, 
            100% 0%
          )`
        } }}
      />

      {/* Highlight Border */}
      {/* eslint-disable-next-line */}
      <div 
        className="absolute border-2 border-blue-500 rounded transition-all duration-300"
        {...{ style: {
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8
        } }}
      />

      {/* Tooltip */}
      {/* eslint-disable-next-line */}
      <div 
        className="absolute bg-white rounded-lg shadow-xl p-6 w-80 pointer-events-auto transition-all duration-300"
        {...{ style: {
          top: position.top + position.height + 20, // Default to bottom
          left: position.left + (position.width / 2) - 160, // Center horizontally
        } }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900">{step.title}</h3>
          <button onClick={stopTour} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <p className="text-gray-600 mb-4 text-sm">{step.content}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Step {currentStep + 1} of {totalSteps}</span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={prevStep}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Back
              </button>
            )}
            <button 
              onClick={nextStep}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
