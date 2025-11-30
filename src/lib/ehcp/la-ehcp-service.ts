/**
 * LA EHCP Application Service
 * 
 * Enterprise-grade service for managing the full EHCP statutory journey
 * UK SEND Code of Practice 2015 compliant
 * 
 * Features:
 * - Full 20-week statutory timeline management
 * - Multi-agency professional contribution workflow
 * - LA-centric dashboard with compliance monitoring
 * - Automated notifications and deadline tracking
 * - Audit trail for every action
 * 
 * @author EdPsych Connect Limited
 * @version 2.0.0
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type EHCPApplicationStatus = 
  | 'SUBMITTED'
  | 'EVIDENCE_GATHERING'
  | 'PANEL_REVIEW_PENDING'
  | 'DECISION_TO_ASSESS'
  | 'DECISION_NOT_TO_ASSESS'
  | 'PROFESSIONAL_REFERRALS_SENT'
  | 'AWAITING_EP_ASSESSMENT'
  | 'AWAITING_HEALTH_ASSESSMENT'
  | 'AWAITING_SOCIAL_CARE'
  | 'AWAITING_SCHOOL_ADVICE'
  | 'ALL_ADVICE_RECEIVED'
  | 'DRAFT_IN_PROGRESS'
  | 'DRAFT_QUALITY_CHECK'
  | 'DRAFT_READY'
  | 'CONSULTATION_PARENT_SENT'
  | 'CONSULTATION_SCHOOL_SENT'
  | 'CONSULTATION_FEEDBACK_RECEIVED'
  | 'AMENDMENTS_IN_PROGRESS'
  | 'FINAL_REVIEW'
  | 'FINAL_EHCP_ISSUED'
  | 'MEDIATION_REQUESTED'
  | 'TRIBUNAL_LODGED'
  | 'TRANSFERRED_IN'
  | 'CEASED'
  | 'ANNUAL_REVIEW_DUE';

export type SENPrimaryNeed = 
  | 'SPLD' | 'MLD' | 'SLD' | 'PMLD' | 'SEMH' 
  | 'SLCN' | 'HI' | 'VI' | 'MSI' | 'PD' | 'ASD' | 'OTH';

export type EHCPUrgency = 
  | 'STANDARD'
  | 'URGENT_SAFEGUARDING'
  | 'URGENT_TRIBUNAL_DEADLINE'
  | 'URGENT_SCHOOL_PLACEMENT'
  | 'EMERGENCY_TRANSFER';

export interface CreateApplicationInput {
  la_tenant_id: number;
  school_tenant_id: number;
  student_id: string;
  child_name: string;
  child_dob: Date;
  child_upn?: string;
  nhs_number?: string;
  primary_need: SENPrimaryNeed;
  secondary_needs?: SENPrimaryNeed[];
  request_type?: 'initial' | 'transfer_in' | 'reassessment';
  requested_by: 'parent' | 'school' | 'other_professional';
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  request_reason: string;
  caseworker_id: number;
  created_by_id: number;
  urgency?: EHCPUrgency;
}

export interface AssignProfessionalInput {
  application_id: string;
  professional_type: 'ep' | 'health' | 'social_care';
  professional_id: number;
  assigned_by_id: number;
  due_date?: Date;
}

export interface RecordDecisionInput {
  application_id: string;
  decision: boolean; // true = assess, false = not assess
  reason: string;
  decision_maker_id: number;
  panel_details?: {
    panel_date: Date;
    chair_id: number;
    members: Array<{ id: number; name: string; role: string }>;
    votes_for: number;
    votes_against: number;
    votes_abstain: number;
  };
}

export interface ContributionInput {
  application_id: string;
  contributor_id: number;
  contributor_name: string;
  contributor_role: string;
  contributor_org: string;
  section_type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
  content: Record<string, unknown>;
  evidence_summary?: string;
  assessment_date?: Date;
}

export interface LADashboardFilters {
  la_tenant_id: number;
  status?: EHCPApplicationStatus[];
  urgency?: EHCPUrgency[];
  caseworker_id?: number;
  is_overdue?: boolean;
  school_tenant_id?: number;
  primary_need?: SENPrimaryNeed[];
  date_from?: Date;
  date_to?: Date;
  search?: string;
}

export interface ComplianceMetrics {
  total_applications: number;
  applications_by_status: Record<string, number>;
  
  // Timeline compliance
  decision_compliance: {
    on_time: number;
    late: number;
    pending: number;
    compliance_rate: number;
  };
  draft_compliance: {
    on_time: number;
    late: number;
    pending: number;
    compliance_rate: number;
  };
  final_compliance: {
    on_time: number;
    late: number;
    pending: number;
    compliance_rate: number;
  };
  
  // Processing times
  average_decision_days: number;
  average_draft_days: number;
  average_completion_days: number;
  
  // At-risk applications
  at_risk_count: number;
  overdue_count: number;
  
  // Need distribution
  need_distribution: Record<SENPrimaryNeed, number>;
  
  // Tribunal/mediation
  mediations_count: number;
  tribunals_count: number;
}

// ============================================================================
// STATUTORY TIMELINE CALCULATOR
// ============================================================================

/**
 * Calculate statutory deadlines based on referral date
 * Per SEND Code of Practice 2015:
 * - Week 6: Decision to assess
 * - Week 16: Draft EHCP
 * - Week 20: Final EHCP
 */
export function calculateStatutoryDates(referralDate: Date, isTransfer: boolean = false): {
  decision_due: Date;
  draft_due: Date;
  final_due: Date;
} {
  const baseDate = new Date(referralDate);
  
  // Transfer cases have different timelines (8 weeks)
  if (isTransfer) {
    return {
      decision_due: addWeeks(baseDate, 2), // Faster decision for transfers
      draft_due: addWeeks(baseDate, 6),
      final_due: addWeeks(baseDate, 8), // 8 weeks total for transfers
    };
  }
  
  return {
    decision_due: addWeeks(baseDate, 6),   // 42 days
    draft_due: addWeeks(baseDate, 16),     // 112 days
    final_due: addWeeks(baseDate, 20),     // 140 days
  };
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + (weeks * 7));
  return result;
}

function _addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate current week of EHCP process
 */
export function calculateCurrentWeek(referralDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - referralDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

/**
 * Calculate days until/since deadline
 */
export function calculateDaysToDeadline(deadline: Date): number {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate unique LA reference number
 */
export function generateLAReference(laCode: string): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `${laCode}-${year}-${random}`;
}

// ============================================================================
// CORE SERVICE FUNCTIONS
// ============================================================================

export class LAEHCPService {
  
  // --------------------------------------------------------------------------
  // APPLICATION MANAGEMENT
  // --------------------------------------------------------------------------
  
  /**
   * Create a new EHCP application
   * This is typically triggered when a school submits an EHCNA request
   */
  static async createApplication(input: CreateApplicationInput): Promise<string> {
    // Get LA code for reference generation
    const laTenant = await prisma.tenants.findUnique({
      where: { id: input.la_tenant_id },
      select: { la_code: true, name: true }
    });
    
    const laCode = laTenant?.la_code || 'LA';
    const laReference = generateLAReference(laCode);
    
    // Calculate statutory deadlines
    const now = new Date();
    const isTransfer = input.request_type === 'transfer_in';
    const deadlines = calculateStatutoryDates(now, isTransfer);
    
    // Create the application
    const application = await prisma.eHCPApplication.create({
      data: {
        la_reference: laReference,
        la_tenant_id: input.la_tenant_id,
        school_tenant_id: input.school_tenant_id,
        student_id: input.student_id,
        child_name: input.child_name,
        child_dob: input.child_dob,
        child_upn: input.child_upn,
        nhs_number: input.nhs_number,
        primary_need: input.primary_need,
        secondary_needs: input.secondary_needs || [],
        request_type: input.request_type || 'initial',
        requested_by: input.requested_by,
        requester_name: input.requester_name,
        requester_email: input.requester_email,
        requester_phone: input.requester_phone,
        request_reason: input.request_reason,
        referral_date: now,
        decision_due_date: deadlines.decision_due,
        draft_due_date: deadlines.draft_due,
        final_due_date: deadlines.final_due,
        status: 'SUBMITTED',
        urgency: input.urgency || 'STANDARD',
        current_week: 0,
        caseworker_id: input.caseworker_id,
        created_by_id: input.created_by_id,
      },
    });
    
    // Create initial timeline event
    await this.createTimelineEvent(application.id, {
      event_type: 'application_created',
      event_category: 'administrative',
      event_description: `EHCNA request received from ${input.requested_by}. Reference: ${laReference}`,
      triggered_by_id: input.created_by_id,
      metadata: {
        request_type: input.request_type,
        requested_by: input.requested_by,
        primary_need: input.primary_need,
      },
    });
    
    return application.id;
  }
  
  /**
   * Get application by ID with full details
   */
  static async getApplicationById(applicationId: string) {
    return prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      include: {
        la_tenant: {
          select: { id: true, name: true, la_code: true }
        },
        school_tenant: {
          select: { id: true, name: true, urn: true }
        },
        caseworker: {
          select: { id: true, name: true, email: true }
        },
        assigned_ep: {
          select: { id: true, name: true, email: true }
        },
        assigned_health: {
          select: { id: true, name: true, email: true }
        },
        assigned_social: {
          select: { id: true, name: true, email: true }
        },
        contributions: {
          orderBy: { requested_at: 'desc' }
        },
        timeline_events: {
          orderBy: { occurred_at: 'desc' },
          take: 20
        },
        documents: {
          orderBy: { uploaded_at: 'desc' }
        },
        communications: {
          orderBy: { sent_at: 'desc' },
          take: 10
        },
        panel_decisions: {
          orderBy: { panel_date: 'desc' }
        }
      }
    });
  }
  
  /**
   * Get LA Dashboard applications with filtering
   */
  static async getLADashboard(filters: LADashboardFilters) {
    const where: Prisma.EHCPApplicationWhereInput = {
      la_tenant_id: filters.la_tenant_id,
    };
    
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    
    if (filters.urgency && filters.urgency.length > 0) {
      where.urgency = { in: filters.urgency };
    }
    
    if (filters.caseworker_id) {
      where.caseworker_id = filters.caseworker_id;
    }
    
    if (filters.is_overdue !== undefined) {
      where.is_overdue = filters.is_overdue;
    }
    
    if (filters.school_tenant_id) {
      where.school_tenant_id = filters.school_tenant_id;
    }
    
    if (filters.primary_need && filters.primary_need.length > 0) {
      where.primary_need = { in: filters.primary_need };
    }
    
    if (filters.date_from) {
      where.referral_date = { gte: filters.date_from };
    }
    
    if (filters.date_to) {
      where.referral_date = { ...where.referral_date as object, lte: filters.date_to };
    }
    
    if (filters.search) {
      where.OR = [
        { la_reference: { contains: filters.search, mode: 'insensitive' } },
        { child_name: { contains: filters.search, mode: 'insensitive' } },
        { child_upn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    const [applications, total] = await Promise.all([
      prisma.eHCPApplication.findMany({
        where,
        include: {
          school_tenant: {
            select: { id: true, name: true }
          },
          caseworker: {
            select: { id: true, name: true }
          },
        },
        orderBy: [
          { is_overdue: 'desc' },
          { urgency: 'asc' },
          { referral_date: 'asc' },
        ],
      }),
      prisma.eHCPApplication.count({ where }),
    ]);
    
    // Calculate current week and days to deadline for each application
    const enrichedApplications = applications.map(app => {
      const currentWeek = calculateCurrentWeek(app.referral_date);
      let nextDeadline: Date;
      let deadlineType: string;
      
      if (!app.decision_actual_date) {
        nextDeadline = app.decision_due_date;
        deadlineType = 'decision';
      } else if (!app.draft_actual_date) {
        nextDeadline = app.draft_due_date;
        deadlineType = 'draft';
      } else {
        nextDeadline = app.final_due_date;
        deadlineType = 'final';
      }
      
      const daysToDeadline = calculateDaysToDeadline(nextDeadline);
      
      return {
        ...app,
        current_week: currentWeek,
        next_deadline: nextDeadline,
        deadline_type: deadlineType,
        days_to_deadline: daysToDeadline,
        is_at_risk: daysToDeadline <= 7 && daysToDeadline > 0,
      };
    });
    
    return {
      applications: enrichedApplications,
      total,
      summary: {
        total,
        overdue: applications.filter(a => a.is_overdue).length,
        at_risk: enrichedApplications.filter(a => a.is_at_risk).length,
        urgent: applications.filter(a => a.urgency !== 'STANDARD').length,
      }
    };
  }
  
  // --------------------------------------------------------------------------
  // PROFESSIONAL ASSIGNMENT
  // --------------------------------------------------------------------------
  
  /**
   * Assign a professional to an application
   */
  static async assignProfessional(input: AssignProfessionalInput): Promise<void> {
    const updateData: Prisma.EHCPApplicationUpdateInput = {};
    
    // Default due date is 6 weeks from now (per statutory timelines for advice)
    const dueDate = input.due_date || addWeeks(new Date(), 6);
    
    switch (input.professional_type) {
      case 'ep':
        updateData.assigned_ep_id = input.professional_id;
        updateData.ep_contribution_status = 'pending';
        updateData.ep_contribution_due = dueDate;
        break;
      case 'health':
        updateData.assigned_health_id = input.professional_id;
        updateData.health_contribution_status = 'pending';
        updateData.health_contribution_due = dueDate;
        break;
      case 'social_care':
        updateData.assigned_social_id = input.professional_id;
        updateData.social_contribution_status = 'pending';
        updateData.social_contribution_due = dueDate;
        break;
    }
    
    await prisma.eHCPApplication.update({
      where: { id: input.application_id },
      data: updateData,
    });
    
    // Get professional details for timeline event
    const professional = await prisma.users.findUnique({
      where: { id: input.professional_id },
      select: { name: true, role: true }
    });
    
    // Create timeline event
    await this.createTimelineEvent(input.application_id, {
      event_type: 'professional_assigned',
      event_category: 'assessment',
      event_description: `${professional?.name} (${input.professional_type.toUpperCase()}) assigned to provide advice. Due: ${dueDate.toLocaleDateString('en-GB')}`,
      triggered_by_id: input.assigned_by_id,
      metadata: {
        professional_type: input.professional_type,
        professional_id: input.professional_id,
        due_date: dueDate,
      },
    });
  }
  
  // --------------------------------------------------------------------------
  // DECISION RECORDING
  // --------------------------------------------------------------------------
  
  /**
   * Record decision to assess (or not assess)
   */
  static async recordDecision(input: RecordDecisionInput): Promise<void> {
    const now = new Date();
    
    const updateData: Prisma.EHCPApplicationUpdateInput = {
      decision_to_assess: input.decision,
      decision_reason: input.reason,
      decision_made_by_id: input.decision_maker_id,
      decision_actual_date: now,
      status: input.decision ? 'DECISION_TO_ASSESS' : 'DECISION_NOT_TO_ASSESS',
    };
    
    // Get the application to check deadline compliance
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: input.application_id },
      select: { decision_due_date: true, la_reference: true }
    });
    
    // Check if decision is late (breach)
    if (application && now > application.decision_due_date) {
      updateData.statutory_compliant = false;
      updateData.breach_type = 'decision_breach';
      updateData.breach_reported_at = now;
      updateData.breach_reason = `Decision made ${calculateDaysToDeadline(application.decision_due_date) * -1} days after statutory deadline`;
    }
    
    await prisma.eHCPApplication.update({
      where: { id: input.application_id },
      data: updateData,
    });
    
    // Record panel decision if provided
    if (input.panel_details) {
      await prisma.eHCPPanelDecision.create({
        data: {
          application_id: input.application_id,
          panel_date: input.panel_details.panel_date,
          panel_type: 'initial_decision',
          chair_id: input.panel_details.chair_id,
          panel_members: input.panel_details.members,
          decision: input.decision ? 'agree_to_assess' : 'decline_to_assess',
          decision_rationale: input.reason,
          votes_for: input.panel_details.votes_for,
          votes_against: input.panel_details.votes_against,
          votes_abstain: input.panel_details.votes_abstain,
        },
      });
    }
    
    // Create timeline event
    await this.createTimelineEvent(input.application_id, {
      event_type: 'decision_recorded',
      event_category: 'decision',
      event_description: input.decision 
        ? 'Decision to proceed with statutory assessment' 
        : 'Decision not to proceed with statutory assessment',
      triggered_by_id: input.decision_maker_id,
      previous_status: 'PANEL_REVIEW_PENDING',
      new_status: input.decision ? 'DECISION_TO_ASSESS' : 'DECISION_NOT_TO_ASSESS',
      metadata: {
        decision: input.decision,
        reason: input.reason,
        panel_date: input.panel_details?.panel_date,
      },
    });
  }
  
  // --------------------------------------------------------------------------
  // CONTRIBUTION MANAGEMENT
  // --------------------------------------------------------------------------
  
  /**
   * Submit a professional contribution
   */
  static async submitContribution(input: ContributionInput): Promise<string> {
    // Determine contributor type from section
    let contributorType: string;
    switch (input.section_type) {
      case 'A':
        contributorType = 'school';
        break;
      case 'B':
      case 'E':
      case 'F':
        contributorType = 'ep';
        break;
      case 'C':
      case 'G':
        contributorType = 'health';
        break;
      case 'D':
      case 'H':
        contributorType = 'social_care';
        break;
      default:
        contributorType = 'other';
    }
    
    // Create the contribution
    const contribution = await prisma.eHCPContribution.create({
      data: {
        application_id: input.application_id,
        contributor_type: contributorType,
        contributor_id: input.contributor_id,
        contributor_name: input.contributor_name,
        contributor_role: input.contributor_role,
        contributor_org: input.contributor_org,
        section_type: input.section_type,
        content: input.content,
        evidence_summary: input.evidence_summary,
        assessment_date: input.assessment_date,
        status: 'submitted',
        due_date: addWeeks(new Date(), 6), // Default
        submitted_at: new Date(),
      },
    });
    
    // Update the application contribution status
    await this.updateContributionStatus(input.application_id, contributorType, 'submitted');
    
    // Create timeline event
    await this.createTimelineEvent(input.application_id, {
      event_type: 'contribution_submitted',
      event_category: 'assessment',
      event_description: `Section ${input.section_type} advice submitted by ${input.contributor_name} (${input.contributor_role})`,
      triggered_by_id: input.contributor_id,
      metadata: {
        section_type: input.section_type,
        contributor_type: contributorType,
        contributor_org: input.contributor_org,
      },
    });
    
    // Check if all contributions are now received
    await this.checkAllContributionsReceived(input.application_id);
    
    return contribution.id;
  }
  
  /**
   * Update contribution status on the application
   */
  private static async updateContributionStatus(
    applicationId: string, 
    contributorType: string, 
    status: string
  ): Promise<void> {
    const updateData: Prisma.EHCPApplicationUpdateInput = {};
    
    switch (contributorType) {
      case 'school':
        updateData.school_contribution_status = status;
        if (status === 'submitted') updateData.school_submitted_at = new Date();
        break;
      case 'ep':
        updateData.ep_contribution_status = status;
        if (status === 'submitted') updateData.ep_submitted_at = new Date();
        break;
      case 'health':
        updateData.health_contribution_status = status;
        if (status === 'submitted') updateData.health_submitted_at = new Date();
        break;
      case 'social_care':
        updateData.social_contribution_status = status;
        if (status === 'submitted') updateData.social_submitted_at = new Date();
        break;
    }
    
    await prisma.eHCPApplication.update({
      where: { id: applicationId },
      data: updateData,
    });
  }
  
  /**
   * Check if all required contributions are received
   */
  private static async checkAllContributionsReceived(applicationId: string): Promise<void> {
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      select: {
        school_contribution_status: true,
        ep_contribution_status: true,
        health_contribution_status: true,
        social_contribution_status: true,
      },
    });
    
    if (!application) return;
    
    // Check if all assigned professionals have submitted
    const allReceived = 
      (application.school_contribution_status === 'submitted' || application.school_contribution_status === 'accepted') &&
      (application.ep_contribution_status === 'submitted' || application.ep_contribution_status === 'accepted') &&
      (application.health_contribution_status === 'submitted' || application.health_contribution_status === 'accepted') &&
      (application.social_contribution_status === 'submitted' || application.social_contribution_status === 'accepted');
    
    if (allReceived) {
      await prisma.eHCPApplication.update({
        where: { id: applicationId },
        data: { status: 'ALL_ADVICE_RECEIVED' },
      });
      
      await this.createTimelineEvent(applicationId, {
        event_type: 'all_advice_received',
        event_category: 'assessment',
        event_description: 'All professional advice has been received. Ready to prepare draft EHCP.',
        triggered_by_system: true,
      });
    }
  }
  
  // --------------------------------------------------------------------------
  // STATUS MANAGEMENT
  // --------------------------------------------------------------------------
  
  /**
   * Update application status with full audit trail
   */
  static async updateStatus(
    applicationId: string,
    newStatus: EHCPApplicationStatus,
    userId: number,
    notes?: string
  ): Promise<void> {
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      select: { status: true },
    });
    
    const previousStatus = application?.status;
    
    await prisma.eHCPApplication.update({
      where: { id: applicationId },
      data: { 
        status: newStatus,
        updated_at: new Date(),
        last_updated_by_id: userId,
      },
    });
    
    await this.createTimelineEvent(applicationId, {
      event_type: 'status_change',
      event_category: 'administrative',
      event_description: notes || `Status changed from ${previousStatus} to ${newStatus}`,
      triggered_by_id: userId,
      previous_status: previousStatus,
      new_status: newStatus,
    });
  }
  
  // --------------------------------------------------------------------------
  // TIMELINE EVENTS
  // --------------------------------------------------------------------------
  
  /**
   * Create a timeline event
   */
  static async createTimelineEvent(
    applicationId: string,
    event: {
      event_type: string;
      event_category: string;
      event_description: string;
      triggered_by_id?: number;
      triggered_by_system?: boolean;
      previous_status?: string;
      new_status?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    await prisma.eHCPTimelineEvent.create({
      data: {
        application_id: applicationId,
        event_type: event.event_type,
        event_category: event.event_category,
        event_description: event.event_description,
        triggered_by_id: event.triggered_by_id,
        triggered_by_system: event.triggered_by_system || false,
        previous_status: event.previous_status,
        new_status: event.new_status,
        metadata: event.metadata,
      },
    });
  }
  
  // --------------------------------------------------------------------------
  // COMPLIANCE METRICS
  // --------------------------------------------------------------------------
  
  /**
   * Calculate compliance metrics for an LA
   */
  static async getComplianceMetrics(laTenantId: number, periodStart?: Date, periodEnd?: Date): Promise<ComplianceMetrics> {
    const now = new Date();
    const start = periodStart || new Date(now.getFullYear(), 0, 1); // Default: start of year
    const end = periodEnd || now;
    
    const applications = await prisma.eHCPApplication.findMany({
      where: {
        la_tenant_id: laTenantId,
        referral_date: {
          gte: start,
          lte: end,
        },
      },
    });
    
    // Calculate status distribution
    const statusCounts: Record<string, number> = {};
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    // Calculate decision compliance
    const decisionsNeeded = applications.filter(app => app.decision_due_date <= now || app.decision_actual_date);
    const decisionsOnTime = decisionsNeeded.filter(app => 
      app.decision_actual_date && app.decision_actual_date <= app.decision_due_date
    ).length;
    const decisionsLate = decisionsNeeded.filter(app => 
      app.decision_actual_date && app.decision_actual_date > app.decision_due_date
    ).length;
    const decisionsPending = decisionsNeeded.filter(app => !app.decision_actual_date && now > app.decision_due_date).length;
    
    // Calculate draft compliance
    const draftsNeeded = applications.filter(app => 
      app.decision_to_assess === true && (app.draft_due_date <= now || app.draft_actual_date)
    );
    const draftsOnTime = draftsNeeded.filter(app => 
      app.draft_actual_date && app.draft_actual_date <= app.draft_due_date
    ).length;
    const draftsLate = draftsNeeded.filter(app => 
      app.draft_actual_date && app.draft_actual_date > app.draft_due_date
    ).length;
    const draftsPending = draftsNeeded.filter(app => !app.draft_actual_date && now > app.draft_due_date).length;
    
    // Calculate final compliance
    const finalsNeeded = applications.filter(app => 
      app.decision_to_assess === true && (app.final_due_date <= now || app.final_actual_date)
    );
    const finalsOnTime = finalsNeeded.filter(app => 
      app.final_actual_date && app.final_actual_date <= app.final_due_date
    ).length;
    const finalsLate = finalsNeeded.filter(app => 
      app.final_actual_date && app.final_actual_date > app.final_due_date
    ).length;
    const finalsPending = finalsNeeded.filter(app => !app.final_actual_date && now > app.final_due_date).length;
    
    // Calculate average processing times
    const completedApplications = applications.filter(app => app.final_actual_date && app.decision_actual_date);
    const avgDecisionDays = completedApplications.length > 0
      ? completedApplications.reduce((sum, app) => {
          const diff = app.decision_actual_date!.getTime() - app.referral_date.getTime();
          return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
        }, 0) / completedApplications.length
      : 0;
    
    const avgDraftDays = completedApplications.filter(a => a.draft_actual_date).length > 0
      ? completedApplications.filter(a => a.draft_actual_date).reduce((sum, app) => {
          const diff = app.draft_actual_date!.getTime() - app.referral_date.getTime();
          return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
        }, 0) / completedApplications.filter(a => a.draft_actual_date).length
      : 0;
    
    const avgCompletionDays = completedApplications.length > 0
      ? completedApplications.reduce((sum, app) => {
          const diff = app.final_actual_date!.getTime() - app.referral_date.getTime();
          return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
        }, 0) / completedApplications.length
      : 0;
    
    // Calculate need distribution
    const needDistribution: Record<string, number> = {};
    applications.forEach(app => {
      needDistribution[app.primary_need] = (needDistribution[app.primary_need] || 0) + 1;
    });
    
    // Count at-risk and overdue
    const atRiskCount = applications.filter(app => {
      if (app.status === 'FINAL_EHCP_ISSUED' || app.status === 'DECISION_NOT_TO_ASSESS') return false;
      let nextDeadline: Date;
      if (!app.decision_actual_date) {
        nextDeadline = app.decision_due_date;
      } else if (!app.draft_actual_date) {
        nextDeadline = app.draft_due_date;
      } else {
        nextDeadline = app.final_due_date;
      }
      const daysToDeadline = calculateDaysToDeadline(nextDeadline);
      return daysToDeadline <= 7 && daysToDeadline > 0;
    }).length;
    
    const overdueCount = applications.filter(app => app.is_overdue).length;
    
    // Count mediations and tribunals
    const mediationsCount = applications.filter(app => app.status === 'MEDIATION_REQUESTED').length;
    const tribunalsCount = applications.filter(app => app.status === 'TRIBUNAL_LODGED').length;
    
    return {
      total_applications: applications.length,
      applications_by_status: statusCounts,
      decision_compliance: {
        on_time: decisionsOnTime,
        late: decisionsLate,
        pending: decisionsPending,
        compliance_rate: decisionsNeeded.length > 0 
          ? (decisionsOnTime / (decisionsOnTime + decisionsLate)) * 100 
          : 100,
      },
      draft_compliance: {
        on_time: draftsOnTime,
        late: draftsLate,
        pending: draftsPending,
        compliance_rate: draftsNeeded.length > 0 
          ? (draftsOnTime / (draftsOnTime + draftsLate)) * 100 
          : 100,
      },
      final_compliance: {
        on_time: finalsOnTime,
        late: finalsLate,
        pending: finalsPending,
        compliance_rate: finalsNeeded.length > 0 
          ? (finalsOnTime / (finalsOnTime + finalsLate)) * 100 
          : 100,
      },
      average_decision_days: Math.round(avgDecisionDays),
      average_draft_days: Math.round(avgDraftDays),
      average_completion_days: Math.round(avgCompletionDays),
      at_risk_count: atRiskCount,
      overdue_count: overdueCount,
      need_distribution: needDistribution as Record<SENPrimaryNeed, number>,
      mediations_count: mediationsCount,
      tribunals_count: tribunalsCount,
    };
  }
  
  // --------------------------------------------------------------------------
  // OVERDUE DETECTION (Run periodically)
  // --------------------------------------------------------------------------
  
  /**
   * Update overdue flags for all applications
   * Should be run daily via cron job
   */
  static async updateOverdueFlags(): Promise<{ updated: number }> {
    const now = new Date();
    
    // Find all applications that are now overdue but not marked
    const overdueApplications = await prisma.eHCPApplication.findMany({
      where: {
        is_overdue: false,
        status: {
          notIn: ['FINAL_EHCP_ISSUED', 'DECISION_NOT_TO_ASSESS', 'CEASED'],
        },
        OR: [
          {
            decision_actual_date: null,
            decision_due_date: { lt: now },
          },
          {
            decision_to_assess: true,
            draft_actual_date: null,
            draft_due_date: { lt: now },
          },
          {
            decision_to_assess: true,
            final_actual_date: null,
            final_due_date: { lt: now },
          },
        ],
      },
    });
    
    // Update each overdue application
    for (const app of overdueApplications) {
      let daysOverdue = 0;
      let breachType = '';
      
      if (!app.decision_actual_date && app.decision_due_date < now) {
        daysOverdue = Math.abs(calculateDaysToDeadline(app.decision_due_date));
        breachType = 'decision_breach';
      } else if (!app.draft_actual_date && app.draft_due_date < now) {
        daysOverdue = Math.abs(calculateDaysToDeadline(app.draft_due_date));
        breachType = 'draft_breach';
      } else if (!app.final_actual_date && app.final_due_date < now) {
        daysOverdue = Math.abs(calculateDaysToDeadline(app.final_due_date));
        breachType = 'final_breach';
      }
      
      await prisma.eHCPApplication.update({
        where: { id: app.id },
        data: {
          is_overdue: true,
          days_overdue: daysOverdue,
          statutory_compliant: false,
          breach_type: breachType,
          breach_reported_at: now,
          breach_reason: `Statutory deadline exceeded by ${daysOverdue} days`,
        },
      });
      
      // Create breach timeline event
      await this.createTimelineEvent(app.id, {
        event_type: 'statutory_breach',
        event_category: 'compliance',
        event_description: `⚠️ STATUTORY BREACH: ${breachType.replace('_', ' ')} - ${daysOverdue} days overdue`,
        triggered_by_system: true,
        metadata: {
          breach_type: breachType,
          days_overdue: daysOverdue,
        },
      });
    }
    
    return { updated: overdueApplications.length };
  }
  
  // --------------------------------------------------------------------------
  // SCHOOL REQUEST SUBMISSION
  // --------------------------------------------------------------------------
  
  /**
   * School EHCNA Request Submission
   * Creates an application with all school evidence auto-attached
   */
  static async submitSchoolRequest(
    schoolTenantId: number,
    studentId: string,
    requestData: {
      child_name: string;
      child_dob: Date;
      child_upn?: string;
      primary_need: SENPrimaryNeed;
      secondary_needs?: SENPrimaryNeed[];
      request_reason: string;
      senco_id: number;
      senco_name: string;
      senco_email: string;
      supporting_evidence?: {
        sen_support_history: string;
        interventions_tried: string[];
        assessment_results: string[];
        professional_reports: string[];
      };
    }
  ): Promise<{ application_id: string; la_reference: string }> {
    // Get the LA for this school
    const school = await prisma.tenants.findUnique({
      where: { id: schoolTenantId },
      select: {
        parent_tenant_id: true,
        parent_tenant: {
          select: { id: true, la_code: true, name: true }
        }
      }
    });
    
    if (!school?.parent_tenant_id) {
      throw new Error('School is not linked to a Local Authority');
    }
    
    // Find an available caseworker at the LA (or use a default/pool)
    const caseworker = await prisma.users.findFirst({
      where: {
        tenant_id: school.parent_tenant_id,
        role: { in: ['LA_OFFICER', 'SEND_CASEWORKER', 'ADMIN'] },
        is_active: true,
      },
      select: { id: true }
    });
    
    if (!caseworker) {
      throw new Error('No available SEND caseworker at Local Authority');
    }
    
    // Create the application
    const applicationId = await this.createApplication({
      la_tenant_id: school.parent_tenant_id,
      school_tenant_id: schoolTenantId,
      student_id: studentId,
      child_name: requestData.child_name,
      child_dob: requestData.child_dob,
      child_upn: requestData.child_upn,
      primary_need: requestData.primary_need,
      secondary_needs: requestData.secondary_needs,
      request_type: 'initial',
      requested_by: 'school',
      requester_name: requestData.senco_name,
      requester_email: requestData.senco_email,
      request_reason: requestData.request_reason,
      caseworker_id: caseworker.id,
      created_by_id: requestData.senco_id,
    });
    
    // Get the generated LA reference
    const application = await prisma.eHCPApplication.findUnique({
      where: { id: applicationId },
      select: { la_reference: true }
    });
    
    // Auto-create school contribution with evidence
    if (requestData.supporting_evidence) {
      await this.submitContribution({
        application_id: applicationId,
        contributor_id: requestData.senco_id,
        contributor_name: requestData.senco_name,
        contributor_role: 'SENCO',
        contributor_org: (await prisma.tenants.findUnique({ where: { id: schoolTenantId }, select: { name: true } }))?.name || 'School',
        section_type: 'A',
        content: {
          sen_support_history: requestData.supporting_evidence.sen_support_history,
          interventions_tried: requestData.supporting_evidence.interventions_tried,
          assessment_results: requestData.supporting_evidence.assessment_results,
          professional_reports: requestData.supporting_evidence.professional_reports,
        },
        evidence_summary: `SEN Support Stage evidence for ${requestData.child_name}. ${requestData.supporting_evidence.interventions_tried.length} interventions documented.`,
      });
    }
    
    return {
      application_id: applicationId,
      la_reference: application?.la_reference || '',
    };
  }
}

export default LAEHCPService;
