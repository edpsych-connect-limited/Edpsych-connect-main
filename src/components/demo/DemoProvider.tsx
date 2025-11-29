'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

interface DemoContextType {
  startTour: (tourId: string) => void;
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
const TOURS: Record<string, DriveStep[]> = {
  'dashboard': [
    {
      element: 'h1',
      popover: {
        title: 'Welcome to Your Dashboard',
        description: 'This is your central hub for managing assessments, students, and reports.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="quick-actions"]',
      popover: {
        title: 'Quick Actions',
        description: 'Start new assessments, create EHCPs, or browse interventions with one click.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="recent-activity"]',
      popover: {
        title: 'Recent Activity',
        description: 'Keep track of your latest cases and reports here.',
        side: 'left',
        align: 'start'
      }
    }
  ],
  'assessments': [
    {
      element: 'h1',
      popover: {
        title: 'Assessment Management',
        description: 'Track and manage all student assessments in one place.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="assessment-filters"]',
      popover: {
        title: 'Filter & Search',
        description: 'Find specific assessments by case ID, status, or type.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ecca-widget"]',
      popover: {
        title: 'ECCA Framework',
        description: 'Quickly start a new cognitive assessment using our evidence-based framework.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="schedule-assessment"]',
      popover: {
        title: 'Schedule New',
        description: 'Book a new assessment for a student.',
        side: 'left',
        align: 'start'
      }
    }
  ],
  'assessment-wizard': [
    {
      element: '[data-tour="assessment-type-section"]',
      popover: {
        title: 'Assessment Details',
        description: 'Select the type of assessment and configure when it will be conducted.',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '[data-tour="domain-selector"]',
      popover: {
        title: 'Assessment Type',
        description: 'Choose from cognitive, educational, behavioural, and other specialized assessment types based on the student\'s needs.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="generate-report"]',
      popover: {
        title: 'Save Assessment',
        description: 'When you\'re done configuring the assessment, click "Create Assessment" to save it to the case.',
        side: 'top',
        align: 'end'
      }
    }
  ],
  'interventions': [
    {
      element: 'h1',
      popover: {
        title: 'Intervention Library',
        description: 'Access evidence-based interventions tailored for specific needs like Dyslexia, Autism, and SEMH.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="intervention-filters"]',
      popover: {
        title: 'Filter Interventions',
        description: 'Narrow down interventions by age group, tier (1-3), and specific areas of need.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="create-intervention"]',
      popover: {
        title: 'Create Custom Plan',
        description: 'Build a bespoke intervention plan for a student using our template builder.',
        side: 'left',
        align: 'center'
      }
    }
  ],
  'ehcp': [
    {
      element: 'h1',
      popover: {
        title: 'EHCP Management',
        description: 'Manage Education, Health and Care Plans. Track timelines and statutory deadlines.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ehcp-timeline"]',
      popover: {
        title: '20-Week Timeline',
        description: 'Visual tracker for the statutory 20-week EHCP process. Alerts you to upcoming deadlines.',
        side: 'bottom',
        align: 'center'
      }
    }
  ]
};

export function DemoProvider({ children }: { children: ReactNode }) {
  
  const startTour = (tourId: string) => {
    const steps = TOURS[tourId];
    if (steps) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        steps: steps,
        onDestroyed: () => {
          // Optional: Save that user has seen the tour
          console.log(`Tour ${tourId} finished`);
        }
      });
      
      driverObj.drive();
    } else {
      console.warn(`Tour ${tourId} not found`);
    }
  };

  return (
    <DemoContext.Provider value={{ startTour }}>
      {children}
    </DemoContext.Provider>
  );
}
