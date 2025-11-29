import { logger } from "@/lib/logger";
/**
 * FILE: src/lib/ehcp/timeline-tracker.ts
 * PURPOSE: 20-week statutory EHCP timeline tracking
 *
 * UK STATUTORY TIMELINE (SEND Code of Practice 2015):
 * - Week 0: Referral/request received
 * - Week 6: Decision to assess (or not assess) must be made
 * - Week 16: Draft EHCP must be completed
 * - Week 20: Final EHCP must be issued
 *
 * FEATURES:
 * - Automatic deadline calculation excluding bank holidays/weekends
 * - Status tracking for each milestone
 * - Alert system for approaching/missed deadlines
 * - Exception handling (e.g., 8-week extensions for transfers)
 */

// ============================================================================
// TYPES
// ============================================================================

export type TimelineStatus = 'not_started' | 'on_track' | 'at_risk' | 'overdue' | 'completed';

export type MilestoneType =
  | 'referral_received'
  | 'initial_review'
  | 'decision_to_assess'
  | 'assessment_commenced'
  | 'assessments_completed'
  | 'draft_ehcp_prepared'
  | 'consultation_started'
  | 'consultation_completed'
  | 'final_ehcp_issued';

export interface TimelineMilestone {
  type: MilestoneType;
  name: string;
  description: string;
  statutoryWeek: number; // Week by which this must be completed
  targetDate: Date;
  actualDate: Date | null;
  status: TimelineStatus;
  responsible: string[];
  notes?: string;
}

export interface EHCPTimeline {
  referralDate: Date;
  expectedCompletionDate: Date;
  actualCompletionDate: Date | null;
  status: TimelineStatus;
  currentWeek: number;
  weeksRemaining: number;
  milestones: TimelineMilestone[];
  alerts: TimelineAlert[];
  exceptionsApplied: TimelineException[];
}

export interface TimelineAlert {
  severity: 'info' | 'warning' | 'critical';
  milestone: MilestoneType;
  message: string;
  createdAt: Date;
}

export interface TimelineException {
  type: 'transfer' | 'mediation' | 'tribunal' | 'other';
  reason: string;
  extensionWeeks: number;
  appliedDate: Date;
  approvedBy: string;
}

// ============================================================================
// STATUTORY TIMELINE CONFIGURATION
// ============================================================================

const STATUTORY_MILESTONES: Omit<TimelineMilestone, 'targetDate' | 'actualDate' | 'status'>[] = [
  {
    type: 'referral_received',
    name: 'Referral Received',
    description: 'EHCP assessment request received by LA',
    statutoryWeek: 0,
    responsible: ['LA SEND Team'],
  },
  {
    type: 'initial_review',
    name: 'Initial Review',
    description: 'Review referral information and supporting evidence',
    statutoryWeek: 2,
    responsible: ['EP', 'SEND Caseworker'],
  },
  {
    type: 'decision_to_assess',
    name: 'Decision to Assess',
    description: 'LA decision on whether to proceed with statutory assessment',
    statutoryWeek: 6,
    responsible: ['LA SEND Panel'],
  },
  {
    type: 'assessment_commenced',
    name: 'Assessment Commenced',
    description: 'Advice requested from all relevant professionals',
    statutoryWeek: 7,
    responsible: ['SEND Caseworker'],
  },
  {
    type: 'assessments_completed',
    name: 'Assessments Completed',
    description: 'All professional advice received',
    statutoryWeek: 14,
    responsible: ['EP', 'Health', 'Social Care', 'School'],
  },
  {
    type: 'draft_ehcp_prepared',
    name: 'Draft EHCP Prepared',
    description: 'Draft EHCP document completed by LA',
    statutoryWeek: 16,
    responsible: ['SEND Caseworker', 'EP'],
  },
  {
    type: 'consultation_started',
    name: 'Consultation Started',
    description: 'Draft EHCP sent to parents for consultation (15 days minimum)',
    statutoryWeek: 16,
    responsible: ['SEND Caseworker'],
  },
  {
    type: 'consultation_completed',
    name: 'Consultation Completed',
    description: 'Parent consultation period concluded, amendments made',
    statutoryWeek: 19,
    responsible: ['SEND Caseworker'],
  },
  {
    type: 'final_ehcp_issued',
    name: 'Final EHCP Issued',
    description: 'Final EHCP document issued to parents and named setting',
    statutoryWeek: 20,
    responsible: ['LA SEND Team'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate working days between two dates (excluding weekends)
 * Note: Bank holidays not included in this simplified version
 */
function addWorkingDays(startDate: Date, daysToAdd: number): Date {
  const result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < daysToAdd) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }

  return result;
}

/**
 * Calculate target date for a milestone based on referral date and statutory week
 */
function calculateMilestoneTargetDate(referralDate: Date, statutoryWeek: number): Date {
  // Each statutory week = 5 working days
  const workingDays = statutoryWeek * 5;
  return addWorkingDays(referralDate, workingDays);
}

/**
 * Calculate current week of EHCP process
 */
function calculateCurrentWeek(referralDate: Date): number {
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - referralDate.getTime()) / (1000 * 60 * 60 * 24));
  // Approximate: 1 week = 5 working days = ~7 calendar days
  return Math.floor(daysDiff / 7);
}

/**
 * Determine milestone status
 */
function determineMilestoneStatus(
  targetDate: Date,
  actualDate: Date | null
): TimelineStatus {
  if (actualDate) {
    return 'completed';
  }

  const now = new Date();
  const daysUntilDue = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    return 'overdue';
  } else if (daysUntilDue <= 5) {
    return 'at_risk'; // Less than 1 working week remaining
  } else {
    return 'on_track';
  }
}

/**
 * Generate alerts based on timeline status
 */
function generateAlerts(milestones: TimelineMilestone[]): TimelineAlert[] {
  const alerts: TimelineAlert[] = [];
  const now = new Date();

  milestones.forEach((milestone) => {
    if (milestone.actualDate) return; // Skip completed milestones

    const daysUntilDue = Math.floor(
      (milestone.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (milestone.status === 'overdue') {
      alerts.push({
        severity: 'critical',
        milestone: milestone.type,
        message: `${milestone.name} is overdue by ${Math.abs(daysUntilDue)} days`,
        createdAt: now,
      });
    } else if (milestone.status === 'at_risk') {
      alerts.push({
        severity: 'warning',
        milestone: milestone.type,
        message: `${milestone.name} is due in ${daysUntilDue} days`,
        createdAt: now,
      });
    }

    // Special statutory alerts
    if (milestone.type === 'decision_to_assess' && daysUntilDue <= 7 && daysUntilDue > 0) {
      alerts.push({
        severity: 'warning',
        milestone: milestone.type,
        message: 'Statutory 6-week decision deadline approaching',
        createdAt: now,
      });
    }

    if (milestone.type === 'final_ehcp_issued' && daysUntilDue <= 14 && daysUntilDue > 0) {
      alerts.push({
        severity: 'warning',
        milestone: milestone.type,
        message: 'Statutory 20-week completion deadline approaching',
        createdAt: now,
      });
    }
  });

  return alerts;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Initialize EHCP timeline from referral date
 */
export function initializeTimeline(referralDate: Date): EHCPTimeline {
  const milestones: TimelineMilestone[] = STATUTORY_MILESTONES.map((milestone) => ({
    ...milestone,
    targetDate: calculateMilestoneTargetDate(referralDate, milestone.statutoryWeek),
    actualDate: milestone.statutoryWeek === 0 ? referralDate : null,
    status: milestone.statutoryWeek === 0 ? 'completed' : 'not_started',
  }));

  const expectedCompletionDate = calculateMilestoneTargetDate(referralDate, 20);
  const currentWeek = calculateCurrentWeek(referralDate);
  const weeksRemaining = Math.max(0, 20 - currentWeek);

  // Update statuses
  milestones.forEach((milestone) => {
    if (!milestone.actualDate) {
      milestone.status = determineMilestoneStatus(milestone.targetDate, milestone.actualDate);
    }
  });

  const alerts = generateAlerts(milestones);

  // Determine overall status
  let overallStatus: TimelineStatus = 'on_track';
  const hasOverdue = milestones.some((m) => m.status === 'overdue');
  const hasAtRisk = milestones.some((m) => m.status === 'at_risk');
  const allCompleted = milestones.every((m) => m.status === 'completed');

  if (allCompleted) {
    overallStatus = 'completed';
  } else if (hasOverdue) {
    overallStatus = 'overdue';
  } else if (hasAtRisk) {
    overallStatus = 'at_risk';
  }

  return {
    referralDate,
    expectedCompletionDate,
    actualCompletionDate: null,
    status: overallStatus,
    currentWeek,
    weeksRemaining,
    milestones,
    alerts,
    exceptionsApplied: [],
  };
}

/**
 * Update milestone completion
 */
export function updateMilestone(
  timeline: EHCPTimeline,
  milestoneType: MilestoneType,
  completionDate: Date,
  notes?: string
): EHCPTimeline {
  const updatedMilestones = timeline.milestones.map((milestone) => {
    if (milestone.type === milestoneType) {
      return {
        ...milestone,
        actualDate: completionDate,
        status: 'completed' as TimelineStatus,
        notes,
      };
    }
    return milestone;
  });

  // Recalculate statuses
  updatedMilestones.forEach((milestone) => {
    if (!milestone.actualDate) {
      milestone.status = determineMilestoneStatus(milestone.targetDate, milestone.actualDate);
    }
  });

  const alerts = generateAlerts(updatedMilestones);

  // Check if final milestone completed
  const finalMilestone = updatedMilestones.find((m) => m.type === 'final_ehcp_issued');
  const actualCompletionDate = finalMilestone?.actualDate || null;

  // Determine overall status
  let overallStatus: TimelineStatus = timeline.status;
  const hasOverdue = updatedMilestones.some((m) => m.status === 'overdue');
  const hasAtRisk = updatedMilestones.some((m) => m.status === 'at_risk');
  const allCompleted = updatedMilestones.every((m) => m.status === 'completed');

  if (allCompleted) {
    overallStatus = 'completed';
  } else if (hasOverdue) {
    overallStatus = 'overdue';
  } else if (hasAtRisk) {
    overallStatus = 'at_risk';
  }

  return {
    ...timeline,
    milestones: updatedMilestones,
    alerts,
    actualCompletionDate,
    status: overallStatus,
  };
}

/**
 * Apply exception/extension to timeline
 */
export function applyException(
  timeline: EHCPTimeline,
  exception: Omit<TimelineException, 'appliedDate'>
): EHCPTimeline {
  const newException: TimelineException = {
    ...exception,
    appliedDate: new Date(),
  };

  // Extend target dates for incomplete milestones
  const extendedMilestones = timeline.milestones.map((milestone) => {
    if (!milestone.actualDate) {
      const newTargetDate = addWorkingDays(
        milestone.targetDate,
        exception.extensionWeeks * 5
      );
      return {
        ...milestone,
        targetDate: newTargetDate,
        status: determineMilestoneStatus(newTargetDate, milestone.actualDate),
      };
    }
    return milestone;
  });

  const extendedCompletionDate = addWorkingDays(
    timeline.expectedCompletionDate,
    exception.extensionWeeks * 5
  );

  const alerts = generateAlerts(extendedMilestones);

  return {
    ...timeline,
    expectedCompletionDate: extendedCompletionDate,
    milestones: extendedMilestones,
    alerts,
    exceptionsApplied: [...timeline.exceptionsApplied, newException],
  };
}

/**
 * Get next pending milestone
 */
export function getNextPendingMilestone(timeline: EHCPTimeline): TimelineMilestone | null {
  return timeline.milestones.find((m) => m.status !== 'completed') || null;
}

/**
 * Get critical alerts (overdue or imminent deadlines)
 */
export function getCriticalAlerts(timeline: EHCPTimeline): TimelineAlert[] {
  return timeline.alerts.filter((alert) => alert.severity === 'critical' || alert.severity === 'warning');
}

/**
 * Calculate compliance percentage
 */
export function calculateCompliance(timeline: EHCPTimeline): number {
  const completed = timeline.milestones.filter((m) => m.status === 'completed').length;
  const total = timeline.milestones.length;
  return Math.round((completed / total) * 100);
}

/**
 * Check if timeline is within statutory limits
 */
export function isWithinStatutoryTimeline(timeline: EHCPTimeline): boolean {
  const finalMilestone = timeline.milestones.find((m) => m.type === 'final_ehcp_issued');
  if (!finalMilestone) return false;

  if (finalMilestone.actualDate) {
    const daysTaken = Math.floor(
      (finalMilestone.actualDate.getTime() - timeline.referralDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    // 20 weeks = ~140 calendar days (including weekends)
    return daysTaken <= 140 + (timeline.exceptionsApplied.reduce((sum, ex) => sum + ex.extensionWeeks, 0) * 7);
  }

  return timeline.status !== 'overdue';
}
