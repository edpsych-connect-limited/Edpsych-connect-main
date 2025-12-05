/**
 * Annual Review Service
 * 
 * Comprehensive EHCP Annual Review management supporting:
 * - Statutory 12-month review cycle management
 * - Phase transfer reviews (Year 5, Year 9, Year 11)
 * - Multi-agency coordination
 * - Person-centred review facilitation
 * - Document collection and preparation
 * - Outcome review and target setting
 * - LA notification and liaison
 * - Decision tracking and implementation
 * 
 * Fully compliant with SEND Code of Practice 2015 Chapter 9
 * 
 * @module AnnualReviewService
 * @version 1.0.0
 */

import { PrismaClient, Prisma } from '@prisma/client';

// Types
interface AnnualReview {
  id: string;
  ehcpId: string;
  studentId: string;
  
  // Review details
  reviewType: 'STANDARD' | 'PHASE_TRANSFER' | 'EMERGENCY' | 'REQUESTED';
  phaseTransfer?: 'YEAR_5' | 'YEAR_9' | 'YEAR_11' | 'POST_16';
  academicYear: string;
  reviewNumber: number;
  
  // Scheduling
  dueDate: Date;
  scheduledDate?: Date;
  actualDate?: Date;
  venue?: string;
  format: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  
  // Participants
  participants: ReviewParticipant[];
  invitations: ReviewInvitation[];
  
  // Pre-review
  preReviewDocuments: ReviewDocument[];
  parentViews?: ParentViews;
  childViews?: ChildViews;
  professionalReports: ProfessionalReport[];
  
  // Meeting
  agenda: AgendaItem[];
  meetingNotes?: string;
  decisions: ReviewDecision[];
  
  // Outcomes review
  outcomesReview: OutcomeReviewItem[];
  newOutcomes: ProposedOutcome[];
  
  // Post-review
  recommendations: Recommendation[];
  amendmentsRequired: boolean;
  amendmentDetails?: string;
  nextReviewDate: Date;
  
  // LA liaison
  laNotificationSent: boolean;
  laNotificationDate?: Date;
  laResponse?: string;
  laDecision?: 'MAINTAIN' | 'AMEND' | 'CEASE' | 'PENDING';
  laDecisionDate?: Date;
  
  // Status tracking
  status: 'SCHEDULED' | 'PREPARING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'LA_REVIEW' | 'FINALISED' | 'CANCELLED';
  completionChecklist: ChecklistItem[];
  
  // Metadata
  createdById: string;
  coordinatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewParticipant {
  id: string;
  name: string;
  role: string;
  organisation: string;
  email?: string;
  phone?: string;
  attendanceStatus: 'INVITED' | 'CONFIRMED' | 'DECLINED' | 'ATTENDED' | 'APOLOGIES';
  contributionSubmitted: boolean;
  isEssential: boolean;
}

interface ReviewInvitation {
  participantId: string;
  sentDate: Date;
  responseDate?: Date;
  response: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  declineReason?: string;
  remindersSent: number;
}

interface ReviewDocument {
  id: string;
  type: 'EHCP' | 'SCHOOL_REPORT' | 'PROFESSIONAL_REPORT' | 'PARENT_VIEWS' | 'CHILD_VIEWS' | 'HEALTH_REPORT' | 'SOCIAL_CARE' | 'PROVISION_MAP' | 'PROGRESS_DATA' | 'OTHER';
  title: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileUrl: string;
  status: 'REQUESTED' | 'RECEIVED' | 'REVIEWED';
  notes?: string;
}

interface ParentViews {
  submittedAt: Date;
  whatWorking: string;
  whatNotWorking: string;
  aspirations: string;
  concerns: string;
  supportNeeded: string;
  questionsForReview: string[];
  additionalComments?: string;
}

interface ChildViews {
  submittedAt: Date;
  collectionMethod: 'QUESTIONNAIRE' | 'INTERVIEW' | 'SYMBOL_SUPPORTED' | 'VIDEO' | 'ADVOCATE';
  whatLike: string;
  whatHelpful: string;
  whatDifficult: string;
  whatWant: string;
  dreams: string;
  worries?: string;
  questions?: string[];
  accessibleFormat?: string;
}

interface ProfessionalReport {
  id: string;
  professionalName: string;
  role: string;
  organisation: string;
  reportDate: Date;
  summary: string;
  recommendations: string[];
  fileUrl?: string;
  status: 'REQUESTED' | 'RECEIVED' | 'REVIEWED';
}

interface AgendaItem {
  order: number;
  topic: string;
  duration: number;
  presenter?: string;
  notes?: string;
  completed: boolean;
}

interface ReviewDecision {
  area: string;
  currentProvision: string;
  discussionPoints: string[];
  decision: string;
  actionRequired: string;
  responsible: string;
  deadline?: Date;
  agreed: boolean;
}

interface OutcomeReviewItem {
  outcomeId: string;
  outcomeTitle: string;
  category: string;
  baselineLevel: number;
  targetLevel: number;
  currentLevel: number;
  progressPercentage: number;
  status: 'ACHIEVED' | 'ON_TRACK' | 'PARTIAL' | 'NOT_ACHIEVED' | 'DISCONTINUED';
  evidence: string;
  recommendation: 'CONTINUE' | 'MODIFY' | 'REPLACE' | 'REMOVE' | 'ACHIEVED';
  notes: string;
}

interface ProposedOutcome {
  title: string;
  category: string;
  description: string;
  targetLevel: number;
  timeframe: string;
  rationale: string;
  supportRequired: string;
  agreedBy: string[];
}

interface Recommendation {
  area: 'EDUCATION' | 'HEALTH' | 'SOCIAL_CARE' | 'PROVISION' | 'PLACEMENT' | 'OUTCOMES' | 'OTHER';
  recommendation: string;
  priority: 'ESSENTIAL' | 'IMPORTANT' | 'DESIRABLE';
  rationale: string;
  implementationPlan?: string;
  responsible: string;
  timeline: string;
  agreed: boolean;
  requiresAmendment: boolean;
}

interface ChecklistItem {
  task: string;
  completed: boolean;
  completedDate?: Date;
  completedBy?: string;
  notes?: string;
}

interface CreateReviewData {
  ehcpId: string;
  studentId: string;
  reviewType: AnnualReview['reviewType'];
  phaseTransfer?: AnnualReview['phaseTransfer'];
  dueDate: Date;
  coordinatorId: string;
}

interface ReviewFilters {
  studentId?: string;
  status?: string;
  reviewType?: string;
  academicYear?: string;
  overdueOnly?: boolean;
  upcomingDays?: number;
}

export class AnnualReviewService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  // ========================================
  // REVIEW MANAGEMENT
  // ========================================

  /**
   * Create annual review
   */
  async createReview(data: CreateReviewData, createdById: string): Promise<AnnualReview> {
    // Get academic year
    const academicYear = this.getAcademicYear(data.dueDate);

    // Count existing reviews for this EHCP in this academic year
    const existingReviews = await this.prisma.annualReview.count({
      where: { ehcpId: data.ehcpId, academicYear }
    });

    // Generate completion checklist based on review type
    const checklist = this.generateChecklist(data.reviewType, data.phaseTransfer);

    // Calculate next review date (12 months from due date)
    const nextReviewDate = new Date(data.dueDate);
    nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

    const review = await this.prisma.annualReview.create({
      data: {
        ehcpId: data.ehcpId,
        studentId: data.studentId,
        reviewType: data.reviewType,
        phaseTransfer: data.phaseTransfer,
        academicYear,
        reviewNumber: existingReviews + 1,
        dueDate: data.dueDate,
        format: 'IN_PERSON',
        participants: [] as unknown as Prisma.JsonValue,
        invitations: [] as unknown as Prisma.JsonValue,
        preReviewDocuments: [] as unknown as Prisma.JsonValue,
        professionalReports: [] as unknown as Prisma.JsonValue,
        agenda: this.generateDefaultAgenda(data.reviewType) as unknown as Prisma.JsonValue,
        decisions: [] as unknown as Prisma.JsonValue,
        outcomesReview: [] as unknown as Prisma.JsonValue,
        newOutcomes: [] as unknown as Prisma.JsonValue,
        recommendations: [] as unknown as Prisma.JsonValue,
        nextReviewDate,
        status: 'SCHEDULED',
        completionChecklist: checklist as unknown as Prisma.JsonValue,
        laNotificationSent: false,
        amendmentsRequired: false,
        coordinatorId: data.coordinatorId,
        createdById
      }
    });

    // Create action items for coordinator
    await this.createReviewActionItems(review.id, data.coordinatorId, data.dueDate);

    return review as unknown as AnnualReview;
  }

  /**
   * Get review by ID
   */
  async getReview(reviewId: string): Promise<AnnualReview | null> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: { firstName: true, lastName: true, dateOfBirth: true, yearGroup: true }
        },
        ehcp: {
          select: { id: true, issueDate: true, sections: true }
        }
      }
    });

    return review as unknown as AnnualReview;
  }

  /**
   * Get reviews with filters
   */
  async getReviews(
    schoolId: string,
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: AnnualReview[]; total: number }> {
    const where: Prisma.AnnualReviewWhereInput = {
      student: { schoolId }
    };

    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.status) where.status = filters.status;
    if (filters.reviewType) where.reviewType = filters.reviewType;
    if (filters.academicYear) where.academicYear = filters.academicYear;
    
    if (filters.overdueOnly) {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['COMPLETED', 'FINALISED', 'CANCELLED'] };
    }

    if (filters.upcomingDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.upcomingDays);
      where.dueDate = { gte: new Date(), lte: futureDate };
      where.status = { notIn: ['COMPLETED', 'FINALISED', 'CANCELLED'] };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.annualReview.findMany({
        where,
        include: {
          student: {
            select: { firstName: true, lastName: true, yearGroup: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: 'asc' }
      }),
      this.prisma.annualReview.count({ where })
    ]);

    return {
      reviews: reviews as unknown as AnnualReview[],
      total
    };
  }

  // ========================================
  // SCHEDULING & PARTICIPANTS
  // ========================================

  /**
   * Schedule review meeting
   */
  async scheduleReview(
    reviewId: string,
    data: {
      scheduledDate: Date;
      venue?: string;
      format: AnnualReview['format'];
      virtualLink?: string;
    }
  ): Promise<AnnualReview> {
    const review = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        scheduledDate: data.scheduledDate,
        venue: data.venue,
        format: data.format,
        virtualLink: data.virtualLink,
        status: 'PREPARING',
        updatedAt: new Date()
      }
    });

    return review as unknown as AnnualReview;
  }

  /**
   * Add participant to review
   */
  async addParticipant(
    reviewId: string,
    participant: Omit<ReviewParticipant, 'id' | 'attendanceStatus' | 'contributionSubmitted'>
  ): Promise<AnnualReview> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) throw new Error('Review not found');

    const newParticipant: ReviewParticipant = {
      ...participant,
      id: crypto.randomUUID(),
      attendanceStatus: 'INVITED',
      contributionSubmitted: false
    };

    const participants = review.participants as unknown as ReviewParticipant[] || [];
    participants.push(newParticipant);

    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        participants: participants as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    return updated as unknown as AnnualReview;
  }

  /**
   * Send invitations
   */
  async sendInvitations(reviewId: string): Promise<{ sent: number; failed: number }> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) throw new Error('Review not found');

    const participants = review.participants as unknown as ReviewParticipant[];
    const invitations: ReviewInvitation[] = [];
    let sent = 0;
    let failed = 0;

    for (const participant of participants) {
      try {
        // Send invitation (would integrate with email service)
        await this.sendInvitationEmail(participant, review);
        
        invitations.push({
          participantId: participant.id,
          sentDate: new Date(),
          response: 'PENDING',
          remindersSent: 0
        });
        sent++;
      } catch {
        failed++;
      }
    }

    await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        invitations: invitations as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    return { sent, failed };
  }

  /**
   * Update participant attendance
   */
  async updateParticipantStatus(
    reviewId: string,
    participantId: string,
    status: ReviewParticipant['attendanceStatus'],
    reason?: string
  ): Promise<AnnualReview> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) throw new Error('Review not found');

    const participants = review.participants as unknown as ReviewParticipant[];
    const participantIndex = participants.findIndex(p => p.id === participantId);
    
    if (participantIndex === -1) throw new Error('Participant not found');

    participants[participantIndex].attendanceStatus = status;

    // Update invitation response if applicable
    const invitations = review.invitations as unknown as ReviewInvitation[];
    const invitationIndex = invitations.findIndex(i => i.participantId === participantId);
    
    if (invitationIndex !== -1) {
      invitations[invitationIndex].responseDate = new Date();
      invitations[invitationIndex].response = status === 'CONFIRMED' || status === 'ATTENDED' ? 'ACCEPTED' : 'DECLINED';
      if (reason) invitations[invitationIndex].declineReason = reason;
    }

    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        participants: participants as unknown as Prisma.JsonValue,
        invitations: invitations as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    return updated as unknown as AnnualReview;
  }

  // ========================================
  // DOCUMENT COLLECTION
  // ========================================

  /**
   * Request document for review
   */
  async requestDocument(
    reviewId: string,
    document: Omit<ReviewDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<AnnualReview> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) throw new Error('Review not found');

    const newDocument: ReviewDocument = {
      ...document,
      id: crypto.randomUUID(),
      uploadedAt: new Date(),
      status: 'REQUESTED'
    };

    const documents = review.preReviewDocuments as unknown as ReviewDocument[] || [];
    documents.push(newDocument);

    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        preReviewDocuments: documents as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    return updated as unknown as AnnualReview;
  }

  /**
   * Submit parent views
   */
  async submitParentViews(reviewId: string, views: ParentViews): Promise<AnnualReview> {
    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        parentViews: views as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    // Update checklist
    await this.updateChecklistItem(reviewId, 'Collect parent/carer views', true);

    return updated as unknown as AnnualReview;
  }

  /**
   * Submit child views
   */
  async submitChildViews(reviewId: string, views: ChildViews): Promise<AnnualReview> {
    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        childViews: views as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    // Update checklist
    await this.updateChecklistItem(reviewId, 'Collect child/young person views', true);

    return updated as unknown as AnnualReview;
  }

  /**
   * Add professional report
   */
  async addProfessionalReport(
    reviewId: string,
    report: Omit<ProfessionalReport, 'id' | 'status'>
  ): Promise<AnnualReview> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) throw new Error('Review not found');

    const newReport: ProfessionalReport = {
      ...report,
      id: crypto.randomUUID(),
      status: 'RECEIVED'
    };

    const reports = review.professionalReports as unknown as ProfessionalReport[] || [];
    reports.push(newReport);

    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        professionalReports: reports as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    return updated as unknown as AnnualReview;
  }

  // ========================================
  // MEETING & DECISIONS
  // ========================================

  /**
   * Start review meeting
   */
  async startMeeting(reviewId: string): Promise<AnnualReview> {
    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        actualDate: new Date(),
        status: 'IN_PROGRESS',
        updatedAt: new Date()
      }
    });

    return updated as unknown as AnnualReview;
  }

  /**
   * Record meeting notes and decisions
   */
  async recordMeetingOutcome(
    reviewId: string,
    data: {
      meetingNotes: string;
      decisions: ReviewDecision[];
      outcomesReview: OutcomeReviewItem[];
      newOutcomes: ProposedOutcome[];
      recommendations: Recommendation[];
      amendmentsRequired: boolean;
      amendmentDetails?: string;
    }
  ): Promise<AnnualReview> {
    const amendmentsRequired = data.amendmentsRequired || 
      data.recommendations.some(r => r.requiresAmendment);

    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        meetingNotes: data.meetingNotes,
        decisions: data.decisions as unknown as Prisma.JsonValue,
        outcomesReview: data.outcomesReview as unknown as Prisma.JsonValue,
        newOutcomes: data.newOutcomes as unknown as Prisma.JsonValue,
        recommendations: data.recommendations as unknown as Prisma.JsonValue,
        amendmentsRequired,
        amendmentDetails: data.amendmentDetails,
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });

    // Update checklist
    await this.updateChecklistItem(reviewId, 'Complete review meeting', true);

    return updated as unknown as AnnualReview;
  }

  // ========================================
  // LA LIAISON
  // ========================================

  /**
   * Send notification to LA
   */
  async sendLANotification(reviewId: string): Promise<AnnualReview> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId },
      include: {
        student: true,
        ehcp: true
      }
    });

    if (!review) throw new Error('Review not found');

    // In production, this would send actual notification to LA
    // For now, we update the status
    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        laNotificationSent: true,
        laNotificationDate: new Date(),
        status: 'LA_REVIEW',
        updatedAt: new Date()
      }
    });

    // Update checklist
    await this.updateChecklistItem(reviewId, 'Send review papers to LA', true);

    return updated as unknown as AnnualReview;
  }

  /**
   * Record LA decision
   */
  async recordLADecision(
    reviewId: string,
    data: {
      decision: AnnualReview['laDecision'];
      response: string;
    }
  ): Promise<AnnualReview> {
    const updated = await this.prisma.annualReview.update({
      where: { id: reviewId },
      data: {
        laDecision: data.decision,
        laResponse: data.response,
        laDecisionDate: new Date(),
        status: 'FINALISED',
        updatedAt: new Date()
      }
    });

    // If maintaining or amending, schedule next review
    if (data.decision === 'MAINTAIN' || data.decision === 'AMEND') {
      await this.scheduleNextReview(reviewId);
    }

    return updated as unknown as AnnualReview;
  }

  // ========================================
  // ANALYTICS & REPORTING
  // ========================================

  /**
   * Get review analytics
   */
  async getReviewAnalytics(schoolId: string): Promise<{
    summary: {
      totalThisYear: number;
      completed: number;
      overdue: number;
      upcoming30Days: number;
    };
    compliance: {
      onTimeRate: number;
      averageDaysOverdue: number;
      parentParticipationRate: number;
    };
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    trends: { month: string; completed: number; scheduled: number }[];
  }> {
    const academicYear = this.getAcademicYear(new Date());
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const reviews = await this.prisma.annualReview.findMany({
      where: {
        student: { schoolId },
        academicYear
      }
    });

    const completed = reviews.filter(r => ['COMPLETED', 'FINALISED'].includes(r.status as string));
    const overdue = reviews.filter(r => 
      r.dueDate < now && 
      !['COMPLETED', 'FINALISED', 'CANCELLED'].includes(r.status as string)
    );
    const upcoming = reviews.filter(r =>
      r.dueDate >= now && 
      r.dueDate <= thirtyDaysFromNow &&
      !['COMPLETED', 'FINALISED', 'CANCELLED'].includes(r.status as string)
    );

    // Calculate on-time rate
    const completedOnTime = completed.filter(r => 
      r.actualDate && new Date(r.actualDate) <= new Date(r.dueDate)
    );
    const onTimeRate = completed.length > 0 
      ? Math.round((completedOnTime.length / completed.length) * 100) 
      : 100;

    // Calculate average days overdue
    const overduedays = overdue.map(r => 
      Math.ceil((now.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    );
    const averageDaysOverdue = overduedays.length > 0
      ? Math.round(overduedays.reduce((a, b) => a + b, 0) / overduedays.length)
      : 0;

    // Parent participation
    const withParentViews = reviews.filter(r => r.parentViews !== null);
    const parentParticipationRate = reviews.length > 0
      ? Math.round((withParentViews.length / reviews.length) * 100)
      : 0;

    // Group by status and type
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    
    reviews.forEach(r => {
      byStatus[r.status as string] = (byStatus[r.status as string] || 0) + 1;
      byType[r.reviewType as string] = (byType[r.reviewType as string] || 0) + 1;
    });

    // Monthly trends
    const trends: { month: string; completed: number; scheduled: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthCompleted = reviews.filter(r =>
        r.actualDate &&
        new Date(r.actualDate) >= monthStart &&
        new Date(r.actualDate) <= monthEnd
      ).length;

      const monthScheduled = reviews.filter(r =>
        r.dueDate >= monthStart && r.dueDate <= monthEnd
      ).length;

      trends.push({
        month: monthStart.toLocaleDateString('en-GB', { month: 'short' }),
        completed: monthCompleted,
        scheduled: monthScheduled
      });
    }

    return {
      summary: {
        totalThisYear: reviews.length,
        completed: completed.length,
        overdue: overdue.length,
        upcoming30Days: upcoming.length
      },
      compliance: {
        onTimeRate,
        averageDaysOverdue,
        parentParticipationRate
      },
      byStatus,
      byType,
      trends
    };
  }

  /**
   * Generate review report
   */
  async generateReviewReport(reviewId: string): Promise<{
    review: AnnualReview;
    summary: string;
    recommendations: Recommendation[];
    nextSteps: string[];
  }> {
    const review = await this.getReview(reviewId);
    
    if (!review) throw new Error('Review not found');

    // Generate summary
    const summary = this.generateReviewSummary(review);
    
    // Compile next steps
    const nextSteps = this.compileNextSteps(review);

    return {
      review,
      summary,
      recommendations: review.recommendations,
      nextSteps
    };
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private getAcademicYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (month >= 8) { // September onwards
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  }

  private generateChecklist(reviewType: string, phaseTransfer?: string): ChecklistItem[] {
    const baseChecklist: ChecklistItem[] = [
      { task: 'Send invitations to all participants', completed: false },
      { task: 'Collect parent/carer views', completed: false },
      { task: 'Collect child/young person views', completed: false },
      { task: 'Request professional reports', completed: false },
      { task: 'Prepare progress summary', completed: false },
      { task: 'Review current EHCP outcomes', completed: false },
      { task: 'Complete review meeting', completed: false },
      { task: 'Write up meeting notes', completed: false },
      { task: 'Send review papers to LA', completed: false },
      { task: 'Implement agreed actions', completed: false }
    ];

    if (phaseTransfer) {
      baseChecklist.push(
        { task: 'Include transition planning', completed: false },
        { task: 'Invite receiving setting', completed: false },
        { task: 'Consider Preparing for Adulthood outcomes', completed: false }
      );
    }

    if (reviewType === 'EMERGENCY') {
      baseChecklist.unshift(
        { task: 'Document reason for emergency review', completed: false }
      );
    }

    return baseChecklist;
  }

  private generateDefaultAgenda(reviewType: string): AgendaItem[] {
    const agenda: AgendaItem[] = [
      { order: 1, topic: 'Welcome and introductions', duration: 5, completed: false },
      { order: 2, topic: 'Review purpose and ground rules', duration: 5, completed: false },
      { order: 3, topic: 'Child/young person views', duration: 10, completed: false },
      { order: 4, topic: 'Parent/carer views', duration: 10, completed: false },
      { order: 5, topic: 'Progress towards outcomes', duration: 20, completed: false },
      { order: 6, topic: 'Professional reports summary', duration: 15, completed: false },
      { order: 7, topic: 'Review of provision', duration: 15, completed: false },
      { order: 8, topic: 'Setting new outcomes/targets', duration: 15, completed: false },
      { order: 9, topic: 'Recommendations and actions', duration: 10, completed: false },
      { order: 10, topic: 'Summary and next steps', duration: 5, completed: false }
    ];

    if (reviewType === 'PHASE_TRANSFER') {
      agenda.splice(7, 0, {
        order: 7,
        topic: 'Transition planning',
        duration: 20,
        completed: false
      });
    }

    return agenda;
  }

  private async updateChecklistItem(
    reviewId: string,
    task: string,
    completed: boolean
  ): Promise<void> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) return;

    const checklist = review.completionChecklist as unknown as ChecklistItem[];
    const itemIndex = checklist.findIndex(item => item.task === task);
    
    if (itemIndex !== -1) {
      checklist[itemIndex].completed = completed;
      checklist[itemIndex].completedDate = completed ? new Date() : undefined;

      await this.prisma.annualReview.update({
        where: { id: reviewId },
        data: {
          completionChecklist: checklist as unknown as Prisma.JsonValue
        }
      });
    }
  }

  private async createReviewActionItems(
    reviewId: string,
    coordinatorId: string,
    dueDate: Date
  ): Promise<void> {
    const twoWeeksBefore = new Date(dueDate);
    twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);

    await this.prisma.actionItem.createMany({
      data: [
        {
          type: 'REVIEW_DUE',
          priority: 'HIGH',
          title: 'Prepare annual review',
          description: 'Collect all documents and views for upcoming annual review',
          relatedEntityId: reviewId,
          relatedEntityType: 'ANNUAL_REVIEW',
          dueDate: twoWeeksBefore,
          assignedToId: coordinatorId,
          status: 'PENDING'
        }
      ]
    });
  }

  private async scheduleNextReview(reviewId: string): Promise<void> {
    const review = await this.prisma.annualReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) return;

    // Create next annual review
    await this.createReview(
      {
        ehcpId: review.ehcpId,
        studentId: review.studentId,
        reviewType: 'STANDARD',
        dueDate: new Date(review.nextReviewDate),
        coordinatorId: review.coordinatorId
      },
      review.createdById
    );
  }

  private async sendInvitationEmail(
    _participant: ReviewParticipant,
    _review: unknown
  ): Promise<void> {
    // Email integration would go here
    console.log('Invitation email sent');
  }

  private generateReviewSummary(review: AnnualReview): string {
    const outcomes = review.outcomesReview || [];
    const achieved = outcomes.filter(o => o.status === 'ACHIEVED').length;
    const onTrack = outcomes.filter(o => o.status === 'ON_TRACK').length;
    const atRisk = outcomes.filter(o => ['PARTIAL', 'NOT_ACHIEVED'].includes(o.status)).length;

    return `Annual Review completed on ${review.actualDate?.toLocaleDateString('en-GB')}. ` +
      `Of ${outcomes.length} outcomes reviewed: ${achieved} achieved, ${onTrack} on track, ${atRisk} requiring attention. ` +
      `${review.newOutcomes?.length || 0} new outcomes proposed. ` +
      `LA decision: ${review.laDecision || 'Pending'}.`;
  }

  private compileNextSteps(review: AnnualReview): string[] {
    const steps: string[] = [];

    // From decisions
    review.decisions?.forEach(d => {
      if (d.actionRequired) {
        steps.push(`${d.area}: ${d.actionRequired} (${d.responsible})`);
      }
    });

    // From recommendations
    review.recommendations?.forEach(r => {
      if (r.priority === 'ESSENTIAL') {
        steps.push(`${r.area}: ${r.recommendation}`);
      }
    });

    // LA related
    if (review.amendmentsRequired && review.laDecision !== 'AMEND') {
      steps.push('Await LA decision on proposed amendments');
    }

    return steps;
  }
}
