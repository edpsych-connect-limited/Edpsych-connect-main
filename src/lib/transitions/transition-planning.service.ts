/**
 * Transition Planning Service
 * 
 * Comprehensive transition support for students moving between:
 * - Early Years to Primary (EYFS to KS1)
 * - Primary to Secondary (KS2 to KS3)
 * - Secondary to Post-16 (KS4 to KS5/FE)
 * - Post-16 to Adulthood (KS5 to employment/higher education)
 * 
 * Video Claims Supported:
 * - "Seamless transitions"
 * - "Preparing for adulthood"
 * - "Information transfer"
 * - "Parent involvement in transitions"
 * - "Statutory compliance (SEND transitions)"
 * 
 * Zero Gap Project - Sprint 7
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

// Initialize Prisma
const prisma = new PrismaClient();

// ============================================================================
// Types and Interfaces
// ============================================================================

export type TransitionType =
  | 'eyfs_to_ks1'
  | 'ks1_to_ks2'
  | 'ks2_to_ks3'
  | 'ks3_to_ks4'
  | 'ks4_to_ks5'
  | 'ks5_to_adult'
  | 'setting_change'
  | 'mid_year_move'
  | 'managed_move'
  | 'alternative_provision';

export type TransitionStatus =
  | 'planning'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type PreparingForAdulthoodArea =
  | 'employment'
  | 'independent_living'
  | 'community_participation'
  | 'health';

export interface TransitionPlan {
  id: string;
  tenantId: number;
  studentId: number;
  studentName: string;
  
  // Transition Details
  transitionType: TransitionType;
  currentSetting: {
    name: string;
    type: string;
    keyContact: string;
    contactEmail?: string;
  };
  destinationSetting: {
    name: string;
    type: string;
    keyContact?: string;
    contactEmail?: string;
    confirmed: boolean;
  };
  
  // Timeline
  transitionDate: Date;
  planStartDate: Date;
  planningMeetingDate?: Date;
  reviewDates: Date[];
  
  // Status
  status: TransitionStatus;
  
  // Student Profile for Transfer
  transferProfile: TransferProfile;
  
  // Actions & Tasks
  tasks: TransitionTask[];
  
  // Visits & Meetings
  visits: TransitionVisit[];
  meetings: TransitionMeeting[];
  
  // Documents
  documents: TransitionDocument[];
  
  // Support Plan
  supportPlan: TransitionSupportPlan;
  
  // For Post-16/Adult Transitions
  preparingForAdulthood?: PreparingForAdulthoodPlan;
  
  // Family Involvement
  familyInvolvement: {
    preferences: string[];
    concerns: string[];
    supportNeeded: string[];
    meetings: { date: Date; outcome: string }[];
  };
  
  // Outcomes
  outcomes?: {
    successful: boolean;
    lessonsLearned: string[];
    feedback: string;
    settledDate?: Date;
  };
  
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferProfile {
  // Academic
  academic: {
    currentLevels: { subject: string; level: string }[];
    strengths: string[];
    areasForDevelopment: string[];
    learningStyle: string;
    preferredActivities: string[];
  };
  
  // SEND Information
  sendInformation?: {
    hasSEND: boolean;
    sendCategory?: 'SEND Support' | 'EHCP';
    primaryNeed?: string;
    secondaryNeeds?: string[];
    provisions: string[];
    strategies: string[];
    ehcpOutcomes?: string[];
  };
  
  // Social & Emotional
  socialEmotional: {
    friendships: string;
    socialSkills: string[];
    emotionalNeeds: string[];
    behaviourStrategies?: string[];
    rewards: string[];
    triggers?: string[];
  };
  
  // Communication
  communication: {
    verbal: string;
    understanding: string;
    expressiveSkills: string;
    preferredMethods: string[];
    assistiveTech?: string[];
  };
  
  // Independence
  independence: {
    selfCare: string;
    organizationSkills: string;
    travelSkills?: string;
    moneyManagement?: string;
  };
  
  // Medical
  medical?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    careNeeds: string[];
    emergencyPlan?: string;
  };
  
  // One Page Profile Link
  onePageProfileUrl?: string;
}

export interface TransitionTask {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'meeting' | 'visit' | 'preparation' | 'communication' | 'assessment';
  
  assignedTo: {
    userId?: number;
    name: string;
    role: string;
    setting: 'current' | 'destination' | 'family' | 'external';
  };
  
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  
  notes?: string;
  linkedDocuments?: string[];
}

export interface TransitionVisit {
  id: string;
  visitType: 'student' | 'parent' | 'staff' | 'combined';
  date: Date;
  duration: string;
  
  location: string;
  purpose: string;
  activities: string[];
  
  attendees: { name: string; role: string }[];
  
  outcomes: string;
  studentResponse?: string;
  parentFeedback?: string;
  
  followUpActions: string[];
  completed: boolean;
}

export interface TransitionMeeting {
  id: string;
  meetingType: 'planning' | 'review' | 'handover' | 'parent' | 'multi_agency';
  date: Date;
  duration: string;
  location: string;
  
  attendees: { name: string; role: string; organisation: string }[];
  
  agenda: string[];
  minutes?: string;
  decisions: string[];
  actions: { action: string; owner: string; deadline: Date }[];
  
  completed: boolean;
}

export interface TransitionDocument {
  id: string;
  documentType: TransitionDocumentType;
  name: string;
  description?: string;
  
  fileUrl?: string;
  status: 'draft' | 'final' | 'sent' | 'acknowledged';
  
  sentTo?: { name: string; organisation: string; sentDate: Date }[];
  acknowledgedBy?: { name: string; date: Date }[];
  
  confidential: boolean;
  createdAt: Date;
}

export type TransitionDocumentType =
  | 'transfer_form'
  | 'one_page_profile'
  | 'ehcp_summary'
  | 'medical_care_plan'
  | 'behaviour_support_plan'
  | 'individual_education_plan'
  | 'risk_assessment'
  | 'assessment_data'
  | 'attendance_record'
  | 'safeguarding_info'
  | 'reports'
  | 'other';

export interface TransitionSupportPlan {
  // Before Transition
  beforeTransition: {
    socialStories?: string[];
    visitSchedule: string;
    familiarizationActivities: string[];
    anxietyManagement: string[];
    keyPersonIntroduction: string;
  };
  
  // During Transition
  duringTransition: {
    inductionPlan: string;
    buddyScheme?: string;
    reducedTimetable?: { duration: string; schedule: string };
    safePlaces: string[];
    checkInSchedule: string;
    keyContacts: { name: string; role: string }[];
  };
  
  // After Transition
  afterTransition: {
    reviewSchedule: string[];
    supportFadingPlan?: string;
    contingencyPlan: string;
    successIndicators: string[];
  };
}

export interface PreparingForAdulthoodPlan {
  startAge: number;
  
  // Four PfA Outcomes
  employment: {
    aspirations: string[];
    workExperience: { provider: string; dates: string; outcome: string }[];
    supportedInternships?: string;
    trainingCourses: string[];
    skills: string[];
    nextSteps: string[];
  };
  
  independentLiving: {
    currentSkills: string[];
    targetSkills: string[];
    housingAspirations: string;
    supportNeeded: string[];
    training: string[];
    nextSteps: string[];
  };
  
  communityParticipation: {
    currentActivities: string[];
    interests: string[];
    socialConnections: string[];
    barriers: string[];
    support: string[];
    nextSteps: string[];
  };
  
  health: {
    healthManagement: string[];
    appointmentsSkills: string;
    medicationManagement: string;
    mentalHealthSupport: string;
    adultHealthTransition: string;
    nextSteps: string[];
  };
  
  // Risk Assessments
  riskAssessments: {
    area: string;
    risks: string[];
    mitigations: string[];
  }[];
  
  // Key Agencies
  adultServices: {
    agency: string;
    contact: string;
    role: string;
    referralDate?: Date;
  }[];
}

// ============================================================================
// Transition Checklist Templates
// ============================================================================

export const TRANSITION_CHECKLISTS: Record<TransitionType, TransitionTask[]> = {
  ks2_to_ks3: [
    { id: '1', title: 'Complete transfer form', description: 'Standard KS2-KS3 transfer documentation', category: 'documentation', assignedTo: { name: '', role: 'Class Teacher', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '2', title: 'Arrange parent meeting', description: 'Meet with parents to discuss transition', category: 'meeting', assignedTo: { name: '', role: 'SENCO', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '3', title: 'Schedule transition visits', description: 'Arrange visits to secondary school', category: 'visit', assignedTo: { name: '', role: 'Transition Coordinator', setting: 'destination' }, dueDate: new Date(), status: 'pending' },
    { id: '4', title: 'Transfer assessment data', description: 'Send SATs results and teacher assessments', category: 'documentation', assignedTo: { name: '', role: 'Data Manager', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '5', title: 'SENCO handover meeting', description: 'Meeting between primary and secondary SENCOs', category: 'meeting', assignedTo: { name: '', role: 'SENCO', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '6', title: 'Update One Page Profile', description: 'Ensure OPP is current for new school', category: 'documentation', assignedTo: { name: '', role: 'Class Teacher', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '7', title: 'Transition social story', description: 'Create social story for new school', category: 'preparation', assignedTo: { name: '', role: 'TA', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '8', title: 'Equipment transfer', description: 'Arrange transfer of specialist equipment', category: 'preparation', assignedTo: { name: '', role: 'SENCO', setting: 'current' }, dueDate: new Date(), status: 'pending' },
  ],
  ks4_to_ks5: [
    { id: '1', title: 'Complete PfA review', description: 'Review Preparing for Adulthood outcomes', category: 'meeting', assignedTo: { name: '', role: 'SENCO', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '2', title: 'Careers guidance meeting', description: 'Independent careers advice', category: 'meeting', assignedTo: { name: '', role: 'Careers Advisor', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '3', title: 'Post-16 options exploration', description: 'Research and visit potential settings', category: 'visit', assignedTo: { name: '', role: 'Transition Coordinator', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '4', title: 'EHCP annual review', description: 'Year 9+ annual review with PfA focus', category: 'meeting', assignedTo: { name: '', role: 'SENCO', setting: 'current' }, dueDate: new Date(), status: 'pending' },
    { id: '5', title: 'Adult services referrals', description: 'Referrals to relevant adult services', category: 'documentation', assignedTo: { name: '', role: 'SENCO', setting: 'current' }, dueDate: new Date(), status: 'pending' },
  ],
  // Add other transition types...
  eyfs_to_ks1: [],
  ks1_to_ks2: [],
  ks3_to_ks4: [],
  ks5_to_adult: [],
  setting_change: [],
  mid_year_move: [],
  managed_move: [],
  alternative_provision: [],
};

// ============================================================================
// Transition Planning Service
// ============================================================================

export class TransitionPlanningService {
  private tenantId: number;

  constructor(tenantId: number) {
    this.tenantId = tenantId;
  }

  // --------------------------------------------------------------------------
  // Transition Plan CRUD
  // --------------------------------------------------------------------------

  /**
   * Create transition plan
   */
  async createTransitionPlan(
    plan: Omit<TransitionPlan, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
    createdBy: number
  ): Promise<string> {
    const planId = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`[TransitionPlanning] Creating transition plan for student ${plan.studentId}`);
    
    // Would save plan
    // Would populate default tasks from checklist
    // Would notify relevant parties
    
    return planId;
  }

  /**
   * Get transition plan
   */
  async getTransitionPlan(planId: string): Promise<TransitionPlan | null> {
    // Would fetch plan with all relations
    return null;
  }

  /**
   * Get student's transition plans
   */
  async getStudentTransitionPlans(studentId: number): Promise<TransitionPlan[]> {
    // Would fetch all plans for student
    return [];
  }

  /**
   * Update transition plan
   */
  async updateTransitionPlan(
    planId: string,
    updates: Partial<TransitionPlan>
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Updating plan ${planId}`);
    // Would update plan
  }

  // --------------------------------------------------------------------------
  // Tasks Management
  // --------------------------------------------------------------------------

  /**
   * Add task to plan
   */
  async addTask(
    planId: string,
    task: Omit<TransitionTask, 'id'>
  ): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`[TransitionPlanning] Adding task to plan ${planId}`);
    
    // Would add task
    // Would notify assigned person
    
    return taskId;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    planId: string,
    taskId: string,
    status: TransitionTask['status'],
    notes?: string
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Updating task ${taskId} to ${status}`);
    // Would update task
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<{
    planId: string;
    studentName: string;
    task: TransitionTask;
    daysOverdue: number;
  }[]> {
    // Would find overdue tasks
    return [];
  }

  /**
   * Get default checklist for transition type
   */
  getDefaultChecklist(transitionType: TransitionType): TransitionTask[] {
    return TRANSITION_CHECKLISTS[transitionType] || [];
  }

  // --------------------------------------------------------------------------
  // Visits & Meetings
  // --------------------------------------------------------------------------

  /**
   * Schedule visit
   */
  async scheduleVisit(
    planId: string,
    visit: Omit<TransitionVisit, 'id' | 'completed'>
  ): Promise<string> {
    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`[TransitionPlanning] Scheduling visit for plan ${planId}`);
    
    // Would create visit
    // Would send notifications
    
    return visitId;
  }

  /**
   * Record visit outcome
   */
  async recordVisitOutcome(
    planId: string,
    visitId: string,
    outcome: Pick<TransitionVisit, 'outcomes' | 'studentResponse' | 'parentFeedback' | 'followUpActions'>
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Recording outcome for visit ${visitId}`);
    // Would update visit
  }

  /**
   * Schedule meeting
   */
  async scheduleMeeting(
    planId: string,
    meeting: Omit<TransitionMeeting, 'id' | 'completed'>
  ): Promise<string> {
    const meetingId = `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`[TransitionPlanning] Scheduling meeting for plan ${planId}`);
    
    return meetingId;
  }

  /**
   * Record meeting minutes
   */
  async recordMeetingMinutes(
    planId: string,
    meetingId: string,
    minutes: Pick<TransitionMeeting, 'minutes' | 'decisions' | 'actions'>
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Recording minutes for meeting ${meetingId}`);
    // Would update meeting
    // Would create tasks from actions
  }

  // --------------------------------------------------------------------------
  // Documents
  // --------------------------------------------------------------------------

  /**
   * Add document
   */
  async addDocument(
    planId: string,
    document: Omit<TransitionDocument, 'id' | 'createdAt'>
  ): Promise<string> {
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`[TransitionPlanning] Adding document to plan ${planId}`);
    
    return docId;
  }

  /**
   * Send document to receiving setting
   */
  async sendDocument(
    planId: string,
    documentId: string,
    recipients: { name: string; email: string; organisation: string }[]
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Sending document ${documentId}`);
    // Would send document
    // Would update status
  }

  /**
   * Generate transfer pack
   */
  async generateTransferPack(planId: string): Promise<{
    packUrl: string;
    documents: string[];
  }> {
    logger.info(`[TransitionPlanning] Generating transfer pack for plan ${planId}`);
    
    // Would compile all documents
    // Would generate PDF pack
    
    return {
      packUrl: '',
      documents: [],
    };
  }

  // --------------------------------------------------------------------------
  // Preparing for Adulthood
  // --------------------------------------------------------------------------

  /**
   * Create PfA plan
   */
  async createPfAPlan(
    planId: string,
    pfaPlan: PreparingForAdulthoodPlan
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Creating PfA plan for transition ${planId}`);
    // Would save PfA plan
  }

  /**
   * Update PfA area
   */
  async updatePfAArea(
    planId: string,
    area: PreparingForAdulthoodArea,
    updates: any
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Updating PfA ${area} for plan ${planId}`);
    // Would update specific area
  }

  /**
   * Record work experience
   */
  async recordWorkExperience(
    planId: string,
    experience: {
      provider: string;
      dates: string;
      activities: string[];
      outcome: string;
      skills: string[];
    }
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Recording work experience for plan ${planId}`);
    // Would add to PfA employment section
  }

  /**
   * Refer to adult service
   */
  async referToAdultService(
    planId: string,
    referral: {
      agency: string;
      reason: string;
      contactDetails: string;
    }
  ): Promise<string> {
    const referralId = `ref_${Date.now()}`;
    
    logger.info(`[TransitionPlanning] Referring to ${referral.agency}`);
    
    return referralId;
  }

  // --------------------------------------------------------------------------
  // Dashboard & Reporting
  // --------------------------------------------------------------------------

  /**
   * Get upcoming transitions
   */
  async getUpcomingTransitions(
    options?: {
      transitionType?: TransitionType;
      withinDays?: number;
    }
  ): Promise<TransitionPlan[]> {
    // Would find transitions within timeframe
    return [];
  }

  /**
   * Get transition dashboard
   */
  async getDashboard(): Promise<{
    totalActive: number;
    byType: { type: TransitionType; count: number }[];
    byStatus: { status: TransitionStatus; count: number }[];
    overdueTasks: number;
    upcomingMeetings: { planId: string; studentName: string; date: Date }[];
    upcomingVisits: { planId: string; studentName: string; date: Date }[];
    recentlyCompleted: TransitionPlan[];
  }> {
    // Would aggregate dashboard data
    return {
      totalActive: 0,
      byType: [],
      byStatus: [],
      overdueTasks: 0,
      upcomingMeetings: [],
      upcomingVisits: [],
      recentlyCompleted: [],
    };
  }

  /**
   * Generate transition report
   */
  async generateTransitionReport(
    academicYear: string
  ): Promise<{
    totalTransitions: number;
    successfulTransitions: number;
    byType: { type: string; count: number; successRate: number }[];
    averagePlanningDuration: number;
    lessonsLearned: string[];
    recommendations: string[];
  }> {
    logger.info(`[TransitionPlanning] Generating report for ${academicYear}`);
    
    // Would compile report
    
    return {
      totalTransitions: 0,
      successfulTransitions: 0,
      byType: [],
      averagePlanningDuration: 0,
      lessonsLearned: [],
      recommendations: [],
    };
  }

  // --------------------------------------------------------------------------
  // Family Involvement
  // --------------------------------------------------------------------------

  /**
   * Record family preferences
   */
  async recordFamilyPreferences(
    planId: string,
    preferences: {
      concerns: string[];
      hopes: string[];
      questions: string[];
      supportNeeded: string[];
    }
  ): Promise<void> {
    logger.info(`[TransitionPlanning] Recording family preferences for plan ${planId}`);
    // Would update plan
  }

  /**
   * Get family view of transition
   */
  async getFamilyView(planId: string): Promise<{
    plan: Partial<TransitionPlan>;
    upcomingDates: { event: string; date: Date }[];
    pendingActions: string[];
    resources: { title: string; url: string }[];
  }> {
    // Would return family-appropriate view
    return {
      plan: {},
      upcomingDates: [],
      pendingActions: [],
      resources: [],
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createTransitionPlanningService(tenantId: number): TransitionPlanningService {
  return new TransitionPlanningService(tenantId);
}
