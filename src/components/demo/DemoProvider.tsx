'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { logger } from "@/lib/logger";

import React, { createContext, useContext, useEffect as _useEffect, ReactNode } from 'react';
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
      element: '[data-tour="intervention-search"]',
      popover: {
        title: 'Search',
        description: 'Search by name, description, or target behavior.',
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
  ],
  'ehcp-wizard': [
    {
      element: '[data-tour="ehcp-steps"]',
      popover: {
        title: 'EHCP Wizard Steps',
        description: 'Progress through each statutory section of the EHCP in order.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="ehcp-form"]',
      popover: {
        title: 'Section Details',
        description: 'Complete the required fields for each section before moving on.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="ehcp-save"]',
      popover: {
        title: 'Save Drafts',
        description: 'Save progress at any time to avoid losing work.',
        side: 'top',
        align: 'end'
      }
    },
    {
      element: '[data-tour="ehcp-next"]',
      popover: {
        title: 'Advance Steps',
        description: 'Move to the next section once the current step is complete.',
        side: 'top',
        align: 'end'
      }
    }
  ],
  'case-create': [
    {
      element: '[data-tour="case-steps"]',
      popover: {
        title: 'Case Setup Steps',
        description: 'Follow the guided steps to capture a complete referral record.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="case-form"]',
      popover: {
        title: 'Case Details',
        description: 'Capture student information, referral details, and safeguarding notes.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="case-next"]',
      popover: {
        title: 'Next Step',
        description: 'Move forward once the current section is complete.',
        side: 'top',
        align: 'end'
      }
    },
    {
      element: '[data-tour="case-save"]',
      popover: {
        title: 'Create Case',
        description: 'Finalize and create the case once all sections are reviewed.',
        side: 'top',
        align: 'end'
      }
    }
  ],
  'reports': [
    {
      element: '[data-tour="report-header"]',
      popover: {
        title: 'Report Generator',
        description: 'Build compliant reports with structured sections and recommendations.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="report-actions"]',
      popover: {
        title: 'Save and Export',
        description: 'Save a draft or generate a PDF when the report is complete.',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '[data-tour="report-tabs"]',
      popover: {
        title: 'Report Sections',
        description: 'Move between details, narrative sections, recommendations, and evidence.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="report-recommendations"]',
      popover: {
        title: 'Actionable Recommendations',
        description: 'Capture priorities, responsibility, and timescales for each recommendation.',
        side: 'top',
        align: 'start'
      }
    }
  ],
  'marketplace-booking': [
    {
      element: '[data-tour="booking-subject"]',
      popover: {
        title: 'Booking Summary',
        description: 'Provide a short headline for the request so the EP can triage quickly.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="booking-schedule"]',
      popover: {
        title: 'Preferred Schedule',
        description: 'Share preferred dates and times to speed up scheduling.',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '[data-tour="booking-message"]',
      popover: {
        title: 'Context and Needs',
        description: 'Add the child context and priorities to help the EP prepare.',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '[data-tour="booking-submit"]',
      popover: {
        title: 'Send Request',
        description: 'Submit the enquiry and track progress in your dashboard.',
        side: 'top',
        align: 'center'
      }
    }
  ],
  'ai-reviews': [
    {
      element: '[data-tour="ethics-tabs"]',
      popover: {
        title: 'Ethics Workspaces',
        description: 'Navigate between monitors, incidents, evidence, and AI review tasks.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ethics-review-summary"]',
      popover: {
        title: 'Review Load',
        description: 'Track pending reviews and keep approval queues under control.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ai-review-queue"]',
      popover: {
        title: 'Review Queue',
        description: 'Each item includes the use case, reason, and severity context.',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ai-review-actions"]',
      popover: {
        title: 'Decision Actions',
        description: 'Approve, reject, or request modifications with clear notes.',
        side: 'top',
        align: 'start'
      }
    }
  ],
  'assessment-admin': [
    {
      element: '[data-tour="assessment-header"]',
      popover: {
        title: 'Assessment Workspace',
        description: 'Run the assessment with the active framework and student context.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="assessment-progress"]',
      popover: {
        title: 'Progress Tracker',
        description: 'Monitor completion across each assessment step.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="assessment-steps"]',
      popover: {
        title: 'Step Navigation',
        description: 'Jump between steps or review completed sections.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="assessment-content"]',
      popover: {
        title: 'Active Step',
        description: 'Capture observations, interpretation, and evidence for this step.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="assessment-save"]',
      popover: {
        title: 'Save Draft',
        description: 'Save progress at any time to protect your work.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="assessment-nav"]',
      popover: {
        title: 'Step Controls',
        description: 'Move back and forward as you complete the assessment.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="assessment-report"]',
      popover: {
        title: 'Generate Report',
        description: 'Produce the professional PDF once the review step is complete.',
        side: 'top',
        align: 'center'
      }
    }
  ],
  'case-detail': [
    {
      element: '[data-tour="case-header"]',
      popover: {
        title: 'Case Overview',
        description: 'Review key student and case context before taking action.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="case-actions"]',
      popover: {
        title: 'Quick Actions',
        description: 'Launch new interventions, assessments, or updates from here.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="case-tabs"]',
      popover: {
        title: 'Case Sections',
        description: 'Move between overview, interventions, notes, and timeline.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="case-content"]',
      popover: {
        title: 'Case Detail',
        description: 'Document evidence, concerns, and stakeholder context.',
        side: 'top',
        align: 'center'
      }
    }
  ],
  'ehcp-detail': [
    {
      element: '[data-tour="ehcp-header"]',
      popover: {
        title: 'EHCP Summary',
        description: 'Track status, review dates, and export options.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ehcp-sections"]',
      popover: {
        title: 'EHCP Sections',
        description: 'Navigate each statutory section for review or edit.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ehcp-content"]',
      popover: {
        title: 'Section Detail',
        description: 'Review evidence and provision content for accuracy.',
        side: 'top',
        align: 'center'
      }
    }
  ],
  'assessment-detail': [
    {
      element: '[data-tour="assessment-detail-header"]',
      popover: {
        title: 'Assessment Summary',
        description: 'Review the type, status, and student context.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="assessment-detail-card"]',
      popover: {
        title: 'Assessment Details',
        description: 'Confirm schedule and linked case information.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="assessment-detail-actions"]',
      popover: {
        title: 'Next Actions',
        description: 'Launch the wizard or jump to the case file.',
        side: 'top',
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
          logger.debug(`Tour ${tourId} finished`);
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
