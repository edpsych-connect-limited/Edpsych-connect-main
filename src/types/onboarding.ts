/**
 * FILE: src/types/onboarding.ts
 * PURPOSE: TypeScript type definitions for onboarding system
 *
 * EXPORTS:
 * - OnboardingStep: Step number (1-6)
 * - OnboardingStatus: Complete API response types
 * - OnboardingState: React state management
 * - StepData: Step-specific data interfaces
 * - RoleConfig: Role-specific configuration
 */

// ============================================================================
// STEP IDENTIFIERS
// ============================================================================

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export const STEP_NAMES: Record<OnboardingStep, string> = {
  1: 'Welcome',
  2: 'Role Selection',
  3: 'Profile Setup',
  4: 'Feature Tour',
  5: 'Quick Wins',
  6: 'Completion'
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Response from GET /api/onboarding/status
 */
export interface OnboardingStatusResponse {
  success: boolean;
  data?: {
    userId: number;
    onboardingCompleted: boolean;
    onboardingSkipped?: boolean; // Added
    currentStep: OnboardingStep;
    stepsCompleted: number[];
    progressPercentage: number;
    progress: {
      step1: StepProgress;
      step2: StepProgress & { role: string | null };
      step3: StepProgress & {
        photoUploaded: boolean;
        hcpcProvided: boolean;
        organizationProvided: boolean;
      };
      step4: StepProgress & {
        featuresViewed: string[];
        demosTried: string[];
      };
      step5: StepProgress & {
        caseCreated: boolean;
        assessmentDone: boolean;
        goalSet: boolean;
      };
      step6: StepProgress & {
        certificateViewed: boolean;
        tourCompleted: boolean;
        callBooked: boolean;
      };
    };
    totalTimeSpentSeconds: number;
    canResume: boolean;
    stepsSkipped: number[];
    timesRestarted: number;
  };
  error?: string;
}

export interface StepProgress {
  completed: boolean;
  completedAt: string | null;
}

/**
 * Response from POST /api/onboarding/start
 */
export interface OnboardingStartResponse {
  success: boolean;
  data?: {
    message: string;
    onboardingId: number;
    currentStep: OnboardingStep;
    startedAt: string;
    resumed?: boolean;
  };
  error?: string;
}

/**
 * Response from POST /api/onboarding/update-step
 */
export interface OnboardingUpdateStepResponse {
  success: boolean;
  data?: {
    message: string;
    currentStep: OnboardingStep;
    stepCompleted: boolean;
    nextStep: OnboardingStep | null;
    overallProgress: number;
    stepsCompleted: number[];
  };
  error?: string;
}

/**
 * Response from POST /api/onboarding/complete
 */
export interface OnboardingCompleteResponse {
  success: boolean;
  data?: {
    message: string;
    completedAt: string;
    totalTimeSpent: number;
    stepsCompleted: number;
    stepsSkipped: number;
    certificateUrl: string;
    nextSteps: {
      recommended: string;
      actions: Array<{
        label: string;
        url: string;
        icon: string;
      }>;
    };
  };
  error?: string;
}

/**
 * Response from POST /api/onboarding/skip-step
 */
export interface OnboardingSkipStepResponse {
  success: boolean;
  data?: {
    message: string;
    skippedStep: OnboardingStep;
    nextStep: OnboardingStep;
    currentProgress: number;
    totalStepsSkipped: number;
  };
  error?: string;
}

/**
 * Response from POST /api/onboarding/restart
 */
export interface OnboardingRestartResponse {
  success: boolean;
  data?: {
    message: string;
    currentStep: OnboardingStep;
    timesRestarted: number;
    previousProgress: {
      stepsCompleted: number;
      timeSpent: number;
    };
  };
  error?: string;
}

// ============================================================================
// STEP-SPECIFIC DATA TYPES
// ============================================================================

/**
 * Data collected/updated in Step 1 (Welcome)
 */
export interface Step1Data {
  videoWatched?: boolean;
  videoWatchPercentage?: number;
}

/**
 * Data collected/updated in Step 2 (Role Selection)
 */
export interface Step2Data {
  roleSelected?: string;
}

/**
 * Data collected/updated in Step 3 (Profile Setup)
 */
export interface Step3Data {
  photoUploaded?: boolean;
  photoUrl?: string;
  hcpcProvided?: boolean;
  hcpcNumber?: string;
  organizationProvided?: boolean;
  organizationName?: string;
  jobTitle?: string;
  yearsExperience?: string;
}

/**
 * Data collected/updated in Step 4 (Feature Tour)
 */
export interface Step4Data {
  featureViewed?: string;
  demoTried?: string;
}

/**
 * Data collected/updated in Step 5 (Quick Wins)
 */
export interface Step5Data {
  caseCreated?: boolean;
  caseId?: number;
  assessmentDone?: boolean;
  assessmentId?: number;
  goalSet?: boolean;
  goalId?: number;
}

/**
 * Data collected/updated in Step 6 (Completion)
 */
export interface Step6Data {
  certificateViewed?: boolean;
  tourCompleted?: boolean;
  callBooked?: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  nextAction?: string;
}

/**
 * Union type for all step data
 */
export type StepData = Step1Data | Step2Data | Step3Data | Step4Data | Step5Data | Step6Data;

// ============================================================================
// REACT STATE MANAGEMENT
// ============================================================================

/**
 * Main state for onboarding wizard
 */
export interface OnboardingState {
  // Current state
  currentStep: OnboardingStep;
  isLoading: boolean;
  error: string | null;

  // User info
  userId: number | null;
  onboardingCompleted: boolean;

  // Progress tracking
  stepsCompleted: number[];
  stepsSkipped: number[];
  progressPercentage: number;

  // Step-specific data
  step1Data: Step1Data;
  step2Data: Step2Data;
  step3Data: Step3Data;
  step4Data: {
    featuresViewed: string[];
    demosTried: string[];
  };
  step5Data: {
    caseCreated: boolean;
    assessmentDone: boolean;
    goalSet: boolean;
  };
  step6Data: Step6Data;

  // Navigation
  canGoBack: boolean;
  canSkip: boolean;
  canAdvance: boolean;

  // Time tracking
  timeStarted: Date | null;
  timePerStep: Record<OnboardingStep, number>;
  totalTimeSpent: number;

  // Resume capability
  canResume: boolean;
  timesRestarted: number;
}

/**
 * Actions for onboarding state reducer
 */
export type OnboardingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_STEP'; payload: OnboardingStep }
  | { type: 'LOAD_STATUS'; payload: OnboardingStatusResponse['data'] }
  | { type: 'UPDATE_STEP_1'; payload: Partial<Step1Data> }
  | { type: 'UPDATE_STEP_2'; payload: Partial<Step2Data> }
  | { type: 'UPDATE_STEP_3'; payload: Partial<Step3Data> }
  | { type: 'UPDATE_STEP_4'; payload: { featureViewed?: string; demoTried?: string } }
  | { type: 'UPDATE_STEP_5'; payload: Partial<OnboardingState['step5Data']> }
  | { type: 'UPDATE_STEP_6'; payload: Partial<Step6Data> }
  | { type: 'MARK_STEP_COMPLETED'; payload: OnboardingStep }
  | { type: 'MARK_STEP_SKIPPED'; payload: OnboardingStep }
  | { type: 'UPDATE_TIME'; payload: { step: OnboardingStep; seconds: number } }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SKIP_ONBOARDING' }
  | { type: 'RESTART_ONBOARDING' }
  | { type: 'RESET_STATE' };

// ============================================================================
// CONTEXT PROVIDER TYPES
// ============================================================================

/**
 * OnboardingContext value
 */
export interface OnboardingContextValue {
  // State
  state: OnboardingState;

  // Actions
  startOnboarding: () => Promise<void>;
  updateStep: (step: OnboardingStep, data: StepData, completed?: boolean) => Promise<void>;
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => void;
  skipCurrentStep: (reason?: string) => Promise<void>;
  completeOnboarding: (feedback?: { rating?: number; comment?: string; nextAction?: string }) => Promise<void>;
  skipOnboarding: () => Promise<void>;
  restartOnboarding: () => Promise<void>;

  // Utility functions
  getStepProgress: (step: OnboardingStep) => number;
  canCompleteStep: (step: OnboardingStep) => boolean;
  refreshStatus: () => Promise<void>;
}

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================

/**
 * Role-specific configuration
 */
export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  features: string[]; // Feature IDs to highlight
  quickWins: {
    case: string; // Sample case description
    assessment: string; // Assessment type to demo
    goal: string; // Goal example
  };
  resources: {
    video?: string; // Role-specific intro video URL
    articles: string[]; // Help article IDs
    courses: string[]; // Recommended course IDs
  };
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  'educational-psychologist': {
    id: 'educational-psychologist',
    name: 'Educational Psychologist',
    description: 'HCPC registered practitioner conducting assessments and consultations',
    icon: 'GraduationCap',
    features: ['ecca', 'ehcp', 'interventions', 'progress', 'training', 'cases'],
    quickWins: {
      case: 'Year 7 student with working memory difficulties',
      assessment: 'ECCA Cognitive Assessment',
      goal: 'Improve working memory strategies by 2 points on GAS scale'
    },
    resources: {
      articles: ['ecca-guide', 'ehcp-creation', 'professional-standards'],
      courses: ['ecca-certification', 'advanced-assessment']
    }
  },
  'senco': {
    id: 'senco',
    name: 'SENCO',
    description: 'Special Educational Needs Coordinator managing SEND provision',
    icon: 'School',
    features: ['interventions', 'progress', 'ehcp', 'training', 'cases', 'collaboration'],
    quickWins: {
      case: 'Year 5 student needing Tier 2 literacy support',
      assessment: 'ECCA Reading Profile',
      goal: 'Increase reading fluency by 15 words per minute'
    },
    resources: {
      articles: ['intervention-selection', 'progress-monitoring', 'ehcp-reviews'],
      courses: ['senco-essentials', 'intervention-planning']
    }
  },
  'teacher': {
    id: 'teacher',
    name: 'Teacher',
    description: 'Classroom teacher supporting SEND students',
    icon: 'BookOpen',
    features: ['interventions', 'progress', 'gamification', 'differentiation', 'cases'],
    quickWins: {
      case: 'Year 3 student with attention difficulties',
      assessment: 'Classroom observation checklist',
      goal: 'Increase on-task behavior from 60% to 80%'
    },
    resources: {
      articles: ['classroom-strategies', 'differentiation-guide', 'gamification-setup'],
      courses: ['send-in-the-classroom', 'behavior-strategies']
    }
  },
  'local-authority': {
    id: 'local-authority',
    name: 'Local Authority Officer',
    description: 'LA staff managing SEND services and compliance',
    icon: 'Building',
    features: ['ehcp', 'cases', 'analytics', 'compliance', 'multi-school', 'reporting'],
    quickWins: {
      case: 'EHCP annual review coordination',
      assessment: 'LA-wide SEND provision audit',
      goal: 'Reduce EHCP processing time by 20%'
    },
    resources: {
      articles: ['la-dashboard', 'compliance-tracking', 'multi-school-management'],
      courses: ['la-administration', 'send-legislation']
    }
  },
  'researcher': {
    id: 'researcher',
    name: 'Researcher',
    description: 'Academic or institutional researcher studying SEND interventions',
    icon: 'Search',
    features: ['analytics', 'research-api', 'data-export', 'interventions', 'outcomes'],
    quickWins: {
      case: 'Multi-school intervention effectiveness study',
      assessment: 'Research protocol setup',
      goal: 'Collect baseline data from 50 participants'
    },
    resources: {
      articles: ['research-api', 'data-export', 'ethical-approval'],
      courses: ['research-methods', 'data-analysis']
    }
  }
};

// ============================================================================
// FEATURE CONFIGURATION
// ============================================================================

/**
 * Feature showcase configuration
 */
export interface FeatureConfig {
  id: string;
  icon: string; // Lucide icon name
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  benefits: string[];
  demoLink: string;
  docsLink: string;
  colorClasses: {
    tabBorderSelected: string;
    tabBgSelected: string;
    iconSelected: string;
    textSelected: string;
    gradient: string;
    checkColor: string;
    badgeBg: string;
    badgeText: string;
  };
}

export const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  ecca: {
    id: 'ecca',
    icon: 'Brain',
    title: 'ECCA Cognitive Assessment',
    subtitle: 'Proprietary Evidence-Based Framework',
    description: 'Comprehensive cognitive evaluation combining cutting-edge research with dynamic test-teach-retest protocols.',
    highlights: [
      '8 comprehensive assessment domains',
      'Real-time scoring with percentiles',
      'Dynamic test-teach-retest protocol',
      'Professional PDF/Word report generation',
      'Collaborative input from all stakeholders',
      'Longitudinal progress tracking'
    ],
    benefits: [
      '45-60 minute comprehensive assessment',
      'Identifies specific learning strengths and needs',
      'Evidence-based intervention recommendations',
      'UK professional standards compliant'
    ],
    demoLink: '/assessments/new',
    docsLink: '/help/ecca-framework',
    colorClasses: {
      tabBorderSelected: 'border-indigo-500',
      tabBgSelected: 'bg-indigo-50',
      iconSelected: 'text-indigo-600',
      textSelected: 'text-indigo-900',
      gradient: 'from-indigo-500 to-purple-600',
      checkColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-600'
    }
  },
  // Add other features as needed...
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Navigation direction
 */
export type NavigationDirection = 'forward' | 'back' | 'skip';

/**
 * Completion status for a step
 */
export type StepCompletionStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

/**
 * Overall onboarding status
 */
export type OnboardingStatus = 'not-started' | 'in-progress' | 'completed';
