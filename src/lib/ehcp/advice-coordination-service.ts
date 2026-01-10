/**
 * LA Advice Coordination Service
 * 
 * Orchestrates the collection of statutory advice from multiple agencies
 * during the EHCP assessment phase (Sections B-K of the plan).
 * 
 * SEND Code of Practice 2015 Requirements:
 * - Section B: Child's/Young Person's Views
 * - Section C: Parent/Carer Views
 * - Section D: Educational Needs and Provision
 * - Section E: Health Needs and Provision
 * - Section F: Social Care Needs and Provision
 * - Section G: Current Outcomes
 * - Section H: Outcomes
 * - Section I: Educational Placement
 * - Section J: Personal Budget
 * - Section K: Advice Received
 * 
 * Statutory Deadline: 20 weeks from decision to assess to final plan issuance.
 * Week 6: Advice requests sent to all parties
 * Week 10: Reminder 1
 * Week 12: Reminder 2 (escalation to managers)
 * Week 16: All advice due
 * 
 * @author EdPsych Connect Limited
 * @module lib/ehcp/advice-coordination-service
 */

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export type AdviceSection = 
  | 'SECTION_B_CHILD_VIEWS'
  | 'SECTION_C_PARENT_VIEWS'
  | 'SECTION_D_EDUCATIONAL'
  | 'SECTION_E_HEALTH'
  | 'SECTION_F_SOCIAL_CARE'
  | 'SECTION_G_CURRENT_OUTCOMES'
  | 'SECTION_H_OUTCOMES'
  | 'SECTION_I_PLACEMENT';

export type AdviceStatus = 
  | 'REQUESTED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'OVERDUE'
  | 'ESCALATED'
  | 'WAIVED';

export type ProfessionalRole =
  | 'EDUCATIONAL_PSYCHOLOGIST'
  | 'SPEECH_LANGUAGE_THERAPIST'
  | 'OCCUPATIONAL_THERAPIST'
  | 'PHYSIOTHERAPIST'
  | 'PAEDIATRICIAN'
  | 'CAMHS_CLINICIAN'
  | 'SOCIAL_WORKER'
  | 'SENCO'
  | 'CLASS_TEACHER'
  | 'PARENT_CARER'
  | 'CHILD_YOUNG_PERSON'
  | 'OTHER_PROFESSIONAL';

export interface AdviceRequest {
  id: string;
  ehcpApplicationId: number;
  section: AdviceSection;
  professionalRole: ProfessionalRole;
  professionalName: string;
  professionalEmail: string;
  professionalOrganisation: string;
  status: AdviceStatus;
  requestedDate: Date;
  dueDate: Date;
  submittedDate?: Date;
  remindersSent: number;
  lastReminderDate?: Date;
  adviceText?: string;
  attachmentUrls: string[];
  notes?: string;
}

export interface AdviceCoordinationSummary {
  applicationId: number;
  totalAdviceRequests: number;
  requestsSent: number;
  requestsAcknowledged: number;
  requestsInProgress: number;
  requestsSubmitted: number;
  requestsOverdue: number;
  completionPercentage: number;
  onTrackForDeadline: boolean;
  nextReminderDue?: Date;
  estimatedCompletionDate: Date;
  criticallyOverdue: string[]; // List of critical missing advice
}

export class AdviceCoordinationService {
  private laTenantId: number;

  constructor(laTenantId: number) {
    this.laTenantId = laTenantId;
  }

  /**
   * Initialize advice requests for a new EHCP assessment
   * Called when LA decides to proceed with assessment (Week 0)
   */
  async initializeAdviceRequests(
    ehcpApplicationId: number,
    primaryNeed: string
  ): Promise<AdviceRequest[]> {
    logger.info(`[AdviceCoordination] Initializing advice requests for EHCP application ${ehcpApplicationId}`);

    const now = new Date();
    const week16 = new Date(now);
    week16.setDate(now.getDate() + (16 * 7));

    // Standard advice requests (always required)
    const standardRequests: Partial<AdviceRequest>[] = [
      {
        section: 'SECTION_B_CHILD_VIEWS',
        professionalRole: 'CHILD_YOUNG_PERSON',
        professionalName: 'Child/Young Person',
        dueDate: week16
      },
      {
        section: 'SECTION_C_PARENT_VIEWS',
        professionalRole: 'PARENT_CARER',
        professionalName: 'Parent/Carer',
        dueDate: week16
      },
      {
        section: 'SECTION_D_EDUCATIONAL',
        professionalRole: 'SENCO',
        professionalName: 'SENCo',
        dueDate: week16
      },
      {
        section: 'SECTION_D_EDUCATIONAL',
        professionalRole: 'EDUCATIONAL_PSYCHOLOGIST',
        professionalName: 'Educational Psychologist',
        dueDate: week16
      }
    ];

    // Add need-specific professionals
    if (primaryNeed === 'SLCN' || primaryNeed === 'ASD') {
      standardRequests.push({
        section: 'SECTION_E_HEALTH',
        professionalRole: 'SPEECH_LANGUAGE_THERAPIST',
        professionalName: 'Speech and Language Therapist',
        dueDate: week16
      });
    }

    if (primaryNeed === 'PD' || primaryNeed === 'PMLD') {
      standardRequests.push({
        section: 'SECTION_E_HEALTH',
        professionalRole: 'OCCUPATIONAL_THERAPIST',
        professionalName: 'Occupational Therapist',
        dueDate: week16
      });
      standardRequests.push({
        section: 'SECTION_E_HEALTH',
        professionalRole: 'PHYSIOTHERAPIST',
        professionalName: 'Physiotherapist',
        dueDate: week16
      });
    }

    if (primaryNeed === 'SEMH') {
      standardRequests.push({
        section: 'SECTION_E_HEALTH',
        professionalRole: 'CAMHS_CLINICIAN',
        professionalName: 'CAMHS Clinician',
        dueDate: week16
      });
    }

    // Medical advice (always required)
    standardRequests.push({
      section: 'SECTION_E_HEALTH',
      professionalRole: 'PAEDIATRICIAN',
      professionalName: 'Paediatrician',
      dueDate: week16
    });

    // In production, we would save to database
    // const savedRequests = await prisma.adviceRequest.createMany({ data: standardRequests });

    // Mock implementation
    const adviceRequests: AdviceRequest[] = standardRequests.map((req, index) => ({
      id: `advice_${Date.now()}_${index}`,
      ehcpApplicationId,
      section: req.section!,
      professionalRole: req.professionalRole!,
      professionalName: req.professionalName!,
      professionalEmail: `${req.professionalRole?.toLowerCase()}@example.nhs.uk`,
      professionalOrganisation: 'Local NHS Trust',
      status: 'REQUESTED',
      requestedDate: now,
      dueDate: req.dueDate!,
      remindersSent: 0,
      attachmentUrls: []
    }));

    logger.info(`[AdviceCoordination] Created ${adviceRequests.length} advice requests`);
    return adviceRequests;
  }

  /**
   * Get coordination summary for an EHCP application
   */
  async getCoordinationSummary(ehcpApplicationId: number): Promise<AdviceCoordinationSummary> {
    logger.info(`[AdviceCoordination] Getting summary for application ${ehcpApplicationId}`);

    // Mock data for demonstration
    const mockRequests: AdviceRequest[] = [
      {
        id: 'adv_001',
        ehcpApplicationId,
        section: 'SECTION_B_CHILD_VIEWS',
        professionalRole: 'CHILD_YOUNG_PERSON',
        professionalName: 'Child Views',
        professionalEmail: 'collected@school.com',
        professionalOrganisation: 'School',
        status: 'SUBMITTED',
        requestedDate: new Date('2026-01-02'),
        dueDate: new Date('2026-04-25'),
        submittedDate: new Date('2026-01-08'),
        remindersSent: 0,
        attachmentUrls: []
      },
      {
        id: 'adv_002',
        ehcpApplicationId,
        section: 'SECTION_C_PARENT_VIEWS',
        professionalRole: 'PARENT_CARER',
        professionalName: 'Parent Views',
        professionalEmail: 'parent@example.com',
        professionalOrganisation: 'Family',
        status: 'SUBMITTED',
        requestedDate: new Date('2026-01-02'),
        dueDate: new Date('2026-04-25'),
        submittedDate: new Date('2026-01-05'),
        remindersSent: 0,
        attachmentUrls: []
      },
      {
        id: 'adv_003',
        ehcpApplicationId,
        section: 'SECTION_D_EDUCATIONAL',
        professionalRole: 'EDUCATIONAL_PSYCHOLOGIST',
        professionalName: 'Dr. Sarah Williams',
        professionalEmail: 'sarah.williams@la-ep.gov.uk',
        professionalOrganisation: 'LA Educational Psychology Service',
        status: 'IN_PROGRESS',
        requestedDate: new Date('2026-01-02'),
        dueDate: new Date('2026-04-25'),
        remindersSent: 0,
        attachmentUrls: []
      },
      {
        id: 'adv_004',
        ehcpApplicationId,
        section: 'SECTION_E_HEALTH',
        professionalRole: 'SPEECH_LANGUAGE_THERAPIST',
        professionalName: 'Emma Thompson',
        professionalEmail: 'emma.thompson@nhs.uk',
        professionalOrganisation: 'Community Health NHS Trust',
        status: 'REQUESTED',
        requestedDate: new Date('2026-01-02'),
        dueDate: new Date('2026-04-25'),
        remindersSent: 1,
        lastReminderDate: new Date('2026-01-09'),
        attachmentUrls: []
      },
      {
        id: 'adv_005',
        ehcpApplicationId,
        section: 'SECTION_E_HEALTH',
        professionalRole: 'PAEDIATRICIAN',
        professionalName: 'Dr. James Patterson',
        professionalEmail: 'j.patterson@hospital.nhs.uk',
        professionalOrganisation: 'Children\'s Hospital',
        status: 'OVERDUE',
        requestedDate: new Date('2026-01-02'),
        dueDate: new Date('2026-01-20'), // Overdue
        remindersSent: 2,
        lastReminderDate: new Date('2026-01-08'),
        attachmentUrls: []
      }
    ];

    const submitted = mockRequests.filter(r => r.status === 'SUBMITTED').length;
    const total = mockRequests.length;
    const overdue = mockRequests.filter(r => r.status === 'OVERDUE').length;

    return {
      applicationId: ehcpApplicationId,
      totalAdviceRequests: total,
      requestsSent: total,
      requestsAcknowledged: 1,
      requestsInProgress: mockRequests.filter(r => r.status === 'IN_PROGRESS').length,
      requestsSubmitted: submitted,
      requestsOverdue: overdue,
      completionPercentage: Math.round((submitted / total) * 100),
      onTrackForDeadline: overdue === 0 && submitted >= total * 0.4, // At least 40% done
      nextReminderDue: new Date('2026-01-16'), // Week 2 reminder
      estimatedCompletionDate: new Date('2026-04-25'),
      criticallyOverdue: mockRequests
        .filter(r => r.status === 'OVERDUE')
        .map(r => `${r.professionalRole}: ${r.professionalName}`)
    };
  }

  /**
   * Send reminder to professional for outstanding advice
   */
  async sendReminder(adviceRequestId: string): Promise<void> {
    logger.info(`[AdviceCoordination] Sending reminder for advice request ${adviceRequestId}`);
    
    // In production:
    // - Increment remindersSent counter
    // - Update lastReminderDate
    // - Send email via email service
    // - If remindersSent >= 2, escalate to manager
    // - Update status to ESCALATED if needed
  }

  /**
   * Check for overdue advice and auto-escalate
   */
  async checkOverdueAdvice(): Promise<void> {
    logger.info('[AdviceCoordination] Checking for overdue advice requests');
    
    // In production:
    // - Query all advice requests with status REQUESTED/IN_PROGRESS
    // - Check if dueDate < now
    // - Update status to OVERDUE
    // - Send escalation emails
    // - Create compliance alert for LA dashboard
  }
}
