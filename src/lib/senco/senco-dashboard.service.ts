/**
 * SENCO Dashboard Service
 * 
 * Comprehensive dashboard for Special Educational Needs Coordinators providing:
 * - SEND Register management
 * - Caseload overview and prioritisation
 * - Statutory compliance monitoring
 * - EHCP tracking and deadlines
 * - Provision mapping overview
 * - Staff training needs
 * - Parent engagement metrics
 * - Multi-agency coordination
 * - Outcome monitoring
 * - Resource allocation
 * 
 * Aligned with SEND Code of Practice 2015 and statutory duties
 * 
 * @module SENCODashboardService
 * @version 1.0.0
 */

import { Prisma } from '@prisma/client';
import type { DbClient } from '@/lib/prisma';
import { prisma as defaultPrisma } from '@/lib/prisma';

// Types
interface SENDRegisterEntry {
  id: string;
  studentId: string;
  student: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    yearGroup: string;
    classGroup: string;
  };
  
  // SEND Status
  sendStatus: 'MONITORING' | 'SEN_SUPPORT' | 'EHCP' | 'EHCP_ASSESSMENT' | 'GRADUATED';
  primaryNeed: string;
  secondaryNeeds: string[];
  needLevel: 'UNIVERSAL' | 'TARGETED' | 'SPECIALIST' | 'HIGHLY_SPECIALIST';
  
  // Key dates
  identifiedDate: Date;
  lastReviewDate?: Date;
  nextReviewDate: Date;
  ehcpStartDate?: Date;
  ehcpAnnualReviewDate?: Date;
  
  // Support details
  keyWorker?: string;
  interventions: string[];
  provisions: ProvisionSummary[];
  
  // Progress
  progressRAG: 'RED' | 'AMBER' | 'GREEN';
  outcomesOnTrack: number;
  outcomesTotal: number;
  
  // Flags
  requiresUrgentAction: boolean;
  hasOverdueReview: boolean;
  hasTransition: boolean;
  
  updatedAt: Date;
}

interface ProvisionSummary {
  name: string;
  type: string;
  frequency: string;
  deliveredBy: string;
  costPerWeek?: number;
}

interface CaseloadSummary {
  totalStudents: number;
  byStatus: Record<string, number>;
  byNeedType: Record<string, number>;
  byYearGroup: Record<string, number>;
  byProgressRAG: Record<string, number>;
  
  urgentActions: number;
  overdueReviews: number;
  upcomingTransitions: number;
  pendingAssessments: number;
}

interface ComplianceStatus {
  overallCompliance: number;
  
  ehcpCompliance: {
    total: number;
    compliant: number;
    annualReviewsDue: number;
    annualReviewsOverdue: number;
    assessmentsInProgress: number;
    assessmentsOverdue: number;
  };
  
  senSupportCompliance: {
    total: number;
    withCurrentPlans: number;
    plansNeedingReview: number;
    reviewsOverdue: number;
  };
  
  documentationCompliance: {
    provisionMaps: number;
    outcomeRecords: number;
    parentConsent: number;
    riskAssessments: number;
  };
  
  statutoryDeadlines: StatutoryDeadline[];
}

interface StatutoryDeadline {
  type: string;
  studentId: string;
  studentName: string;
  deadline: Date;
  daysRemaining: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
  description: string;
}

interface DashboardMetrics {
  caseload: CaseloadSummary;
  compliance: ComplianceStatus;
  
  // Weekly activity
  weeklyActivity: {
    reviewsCompleted: number;
    parentMeetings: number;
    professionalMeetings: number;
    documentsUpdated: number;
    interventionsStarted: number;
  };
  
  // Resource usage
  resourceSummary: {
    totalProvisionCost: number;
    staffHoursAllocated: number;
    externalSpecialistHours: number;
    budgetUtilisation: number;
  };
  
  // Trends
  trends: {
    newIdentifications: TrendData[];
    ehcpApplications: TrendData[];
    graduations: TrendData[];
    progressImprovement: TrendData[];
  };
}

interface TrendData {
  period: string;
  value: number;
  change: number;
}

interface ActionItem {
  id: string;
  type: 'REVIEW_DUE' | 'EHCP_DEADLINE' | 'MEETING_SCHEDULED' | 'DOCUMENT_NEEDED' | 'INTERVENTION_REVIEW' | 'PARENT_CONTACT' | 'REFERRAL_PENDING' | 'TRANSITION_TASK';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  studentId?: string;
  studentName?: string;
  dueDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedTo?: string;
  createdAt: Date;
}

interface StaffTrainingNeed {
  staffId: string;
  staffName: string;
  role: string;
  trainingNeeds: {
    area: string;
    priority: 'ESSENTIAL' | 'RECOMMENDED' | 'DEVELOPMENTAL';
    reason: string;
    suggestedCourses: string[];
  }[];
  lastTrainingDate?: Date;
  cpdHoursThisYear: number;
}

interface ParentEngagementMetrics {
  overallEngagement: number;
  
  byType: {
    reviewAttendance: number;
    portalLogins: number;
    messageResponses: number;
    documentViews: number;
  };
  
  lowEngagementStudents: {
    studentId: string;
    studentName: string;
    lastParentContact: Date;
    engagementScore: number;
    recommendedAction: string;
  }[];
}

interface RegisterFilters {
  yearGroup?: string;
  sendStatus?: string;
  primaryNeed?: string;
  progressRAG?: string;
  keyWorker?: string;
  hasOverdueReview?: boolean;
  requiresUrgentAction?: boolean;
}

export class SENCODashboardService {
  private prisma: DbClient;

  constructor(prismaClient?: DbClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  // ========================================
  // DASHBOARD OVERVIEW
  // ========================================

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(schoolId: string): Promise<DashboardMetrics> {
    const [caseload, compliance, weeklyActivity, resourceSummary, trends] = await Promise.all([
      this.getCaseloadSummary(schoolId),
      this.getComplianceStatus(schoolId),
      this.getWeeklyActivity(schoolId),
      this.getResourceSummary(schoolId),
      this.getTrends(schoolId)
    ]);

    return {
      caseload,
      compliance,
      weeklyActivity,
      resourceSummary,
      trends
    };
  }

  /**
   * Get caseload summary
   */
  async getCaseloadSummary(schoolId: string): Promise<CaseloadSummary> {
    const students = await (this.prisma.sENDRegister as any).findMany({
      where: { 
        schoolId,
        status: { not: 'ARCHIVED' }
      },
      include: {
        student: {
          select: { yearGroup: true }
        }
      }
    });

    const byStatus: Record<string, number> = {};
    const byNeedType: Record<string, number> = {};
    const byYearGroup: Record<string, number> = {};
    const byProgressRAG: Record<string, number> = {};
    
    let urgentActions = 0;
    let overdueReviews = 0;
    let upcomingTransitions = 0;
    
    const now = new Date();

    students.forEach((entry: any) => {
      const e = entry as any;
      // By status
      if (e.sendStatus) byStatus[e.sendStatus] = (byStatus[e.sendStatus] || 0) + 1;
      
      // By need type
      if (e.primaryNeed) byNeedType[e.primaryNeed] = (byNeedType[e.primaryNeed] || 0) + 1;
      
      // By year group
      const yearGroup = e.student?.yearGroup || 'Unknown';
      byYearGroup[yearGroup] = (byYearGroup[yearGroup] || 0) + 1;
      
      // By RAG
      if (e.progressRAG) byProgressRAG[e.progressRAG] = (byProgressRAG[e.progressRAG] || 0) + 1;
      
      // Flags
      if (e.requiresUrgentAction) urgentActions++;
      if (e.nextReviewDate && new Date(e.nextReviewDate) < now) overdueReviews++;
      if (e.hasTransition) upcomingTransitions++;
    });

    // Count pending assessments
    const pendingAssessments = await this.prisma.eHCPAssessment.count({
      where: {
        // @ts-expect-error - schoolId might not exist on EHCPAssessment
        schoolId: schoolId as any,
        status: { in: ['REQUESTED', 'IN_PROGRESS'] }
      }
    });

    return {
      totalStudents: students.length,
      byStatus,
      byNeedType,
      byYearGroup,
      byProgressRAG,
      urgentActions,
      overdueReviews,
      upcomingTransitions,
      pendingAssessments
    };
  }

  // ========================================
  // SEND REGISTER
  // ========================================

  /**
   * Get SEND register with filters
   */
  async getSENDRegister(
    schoolId: string,
    filters: RegisterFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ entries: SENDRegisterEntry[]; total: number; page: number; totalPages: number }> {
    const where: Prisma.SENDRegisterWhereInput = {
      schoolId,
      status: { not: 'ARCHIVED' }
    };

    if (filters.yearGroup) {
      (where as any).student = { yearGroup: filters.yearGroup };
    }
    if (filters.sendStatus) {
      where.sendStatus = filters.sendStatus;
    }
    if (filters.primaryNeed) {
      where.primaryNeed = filters.primaryNeed;
    }
    if (filters.progressRAG) {
      where.progressRAG = filters.progressRAG;
    }
    if (filters.keyWorker) {
      where.keyWorkerId = filters.keyWorker;
    }
    if (filters.hasOverdueReview) {
      where.nextReviewDate = { lt: new Date() };
    }
    if (filters.requiresUrgentAction) {
      where.requiresUrgentAction = true;
    }

    const [entries, total] = await Promise.all([
      (this.prisma.sENDRegister as any).findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              yearGroup: true,
              classGroup: true
            }
          },
          provisions: {
            where: { status: 'ACTIVE' },
            select: {
              name: true,
              type: true,
              frequency: true,
              deliveredBy: true,
              costPerWeek: true
            }
          },
          outcomes: {
            where: { status: { not: 'ARCHIVED' } },
            select: { status: true }
          }
        } as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { requiresUrgentAction: 'desc' },
          { nextReviewDate: 'asc' }
        ]
      }),
      this.prisma.sENDRegister.count({ where })
    ]);

    return {
      entries: entries.map((e: any) => this.transformRegisterEntry(e)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update SEND register entry
   */
  async updateRegisterEntry(
    entryId: string,
    data: Partial<SENDRegisterEntry>
  ): Promise<SENDRegisterEntry> {
    const updated = await (this.prisma.sENDRegister as any).update({
      where: { id: entryId },
      data: {
        sendStatus: data.sendStatus,
        primaryNeed: data.primaryNeed,
        needs: data.secondaryNeeds || [],
        needLevel: data.needLevel,
        progressRAG: data.progressRAG,
        requiresUrgentAction: data.requiresUrgentAction,
        nextReviewDate: data.nextReviewDate,
        updatedAt: new Date()
      },
      include: {
        student: true,
        provisions: { where: { status: 'ACTIVE' } },
        outcomes: { where: { status: { not: 'ARCHIVED' } } }
      } as any
    });

    return this.transformRegisterEntry(updated);
  }

  /**
   * Add student to SEND register
   */
  async addToRegister(
    schoolId: string,
    studentId: string,
    data: {
      sendStatus: string;
      primaryNeed: string;
      secondaryNeeds?: string[];
      needLevel: string;
      identifiedBy: string;
      reason: string;
    }
  ): Promise<SENDRegisterEntry> {
    const now = new Date();
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + 3); // Default 3-month review cycle

    const entry = await (this.prisma.sENDRegister as any).create({
      data: {
        schoolId,
        studentId,
        sendStatus: data.sendStatus,
        primaryNeed: data.primaryNeed,
        needs: data.secondaryNeeds || [],
        needLevel: data.needLevel,
        identifiedDate: now,
        nextReviewDate: nextReview,
        progressRAG: 'AMBER',
        // identifiedBy: data.identifiedBy, // Not in model
        // identificationReason: data.reason, // Not in model
        status: 'ACTIVE'
      },
      include: {
        student: true,
        provisions: true,
        outcomes: true
      } as any
    });

    // Create audit entry
    await this.createAuditEntry(entry.id, 'ADDED_TO_REGISTER', data.identifiedBy, data.reason);

    return this.transformRegisterEntry(entry);
  }

  // ========================================
  // COMPLIANCE MONITORING
  // ========================================

  /**
   * Get comprehensive compliance status
   */
  async getComplianceStatus(schoolId: string): Promise<ComplianceStatus> {
    const now = new Date();
    
    // EHCP compliance
    const ehcpStudents = await (this.prisma.sENDRegister as any).findMany({
      where: { schoolId, sendStatus: { in: ['EHCP', 'EHCP_ASSESSMENT'] } },
      include: { ehcp: true } as any
    });

    const ehcpCompliance = {
      total: ehcpStudents.filter((s: any) => s.sendStatus === 'EHCP').length,
      compliant: 0,
      annualReviewsDue: 0,
      annualReviewsOverdue: 0,
      assessmentsInProgress: ehcpStudents.filter((s: any) => s.sendStatus === 'EHCP_ASSESSMENT').length,
      assessmentsOverdue: 0
    };

    ehcpStudents.forEach((student: any) => {
      if (student.sendStatus === 'EHCP' && student.ehcpAnnualReviewDate) {
        const reviewDate = new Date(student.ehcpAnnualReviewDate);
        const daysUntilReview = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilReview < 0) {
          ehcpCompliance.annualReviewsOverdue++;
        } else if (daysUntilReview <= 60) {
          ehcpCompliance.annualReviewsDue++;
        } else {
          ehcpCompliance.compliant++;
        }
      }
    });

    // SEN Support compliance
    const senSupportStudents = await (this.prisma.sENDRegister as any).findMany({
      where: { schoolId, sendStatus: 'SEN_SUPPORT' },
      include: { supportPlan: true } as any
    });

    const senSupportCompliance = {
      total: senSupportStudents.length,
      withCurrentPlans: 0,
      plansNeedingReview: 0,
      reviewsOverdue: 0
    };

    senSupportStudents.forEach((student: any) => {
      if (student.nextReviewDate) {
        const reviewDate = new Date(student.nextReviewDate);
        if (reviewDate < now) {
          senSupportCompliance.reviewsOverdue++;
        } else {
          senSupportCompliance.withCurrentPlans++;
        }
      } else {
        senSupportCompliance.plansNeedingReview++;
      }
    });

    // Documentation compliance
    const [provisionMaps, outcomes, consents, riskAssessments] = await Promise.all([
      this.prisma.provisionMap.count({
        where: { schoolId, status: 'CURRENT' } as any
      }),
      this.prisma.sENDOutcome.count({
        where: { schoolId, lastUpdated: { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1) } } as any
      }),
      this.prisma.parentConsent.count({
        where: { schoolId, status: 'ACTIVE' } as any
      }),
      this.prisma.riskAssessment.count({
        where: { schoolId, status: 'CURRENT' } as any
      })
    ]);

    const totalStudents = ehcpStudents.length + senSupportStudents.length;

    // Get statutory deadlines
    const statutoryDeadlines = await this.getStatutoryDeadlines(schoolId);

    // Calculate overall compliance
    const complianceScores = [
      ehcpCompliance.total > 0 ? (ehcpCompliance.compliant / ehcpCompliance.total) * 100 : 100,
      senSupportCompliance.total > 0 ? (senSupportCompliance.withCurrentPlans / senSupportCompliance.total) * 100 : 100,
      totalStudents > 0 ? (provisionMaps / totalStudents) * 100 : 100
    ];
    
    const overallCompliance = Math.round(complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length);

    return {
      overallCompliance,
      ehcpCompliance,
      senSupportCompliance,
      documentationCompliance: {
        provisionMaps,
        outcomeRecords: outcomes,
        parentConsent: consents,
        riskAssessments
      },
      statutoryDeadlines
    };
  }

  /**
   * Get statutory deadlines
   */
  async getStatutoryDeadlines(schoolId: string): Promise<StatutoryDeadline[]> {
    const now = new Date();
    const deadlines: StatutoryDeadline[] = [];

    // EHCP Annual Reviews
    const ehcpStudents = await (this.prisma.sENDRegister as any).findMany({
      where: { 
        schoolId, 
        sendStatus: 'EHCP',
        ehcpAnnualReviewDate: { lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) }
      },
      include: { student: { select: { firstName: true, lastName: true } } } as any
    });

    ehcpStudents.forEach((student: any) => {
      const reviewDate = new Date(student.ehcpAnnualReviewDate!);
      const daysRemaining = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      deadlines.push({
        type: 'EHCP_ANNUAL_REVIEW',
        studentId: student.studentId,
        studentName: `${(student as unknown as { student: { firstName: string; lastName: string } }).student.firstName} ${(student as unknown as { student: { firstName: string; lastName: string } }).student.lastName}`,
        deadline: reviewDate,
        daysRemaining,
        status: daysRemaining < 0 ? 'OVERDUE' : daysRemaining <= 14 ? 'AT_RISK' : 'ON_TRACK',
        description: `Annual review due within ${daysRemaining} days`
      });
    });

    // EHCP Assessment deadlines (20 week statutory timeframe)
    const assessments = await this.prisma.eHCPAssessment.findMany({
      where: { 
        schoolId, 
        status: { in: ['REQUESTED', 'IN_PROGRESS'] }
      } as any,
      include: { student: { select: { firstName: true, lastName: true } } } as any
    } as any);

    assessments.forEach(assessment => {
      const startDate = new Date((assessment as any).requestDate);
      const deadline = new Date(startDate.getTime() + 20 * 7 * 24 * 60 * 60 * 1000); // 20 weeks
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      deadlines.push({
        type: 'EHCP_ASSESSMENT',
        studentId: assessment.studentId,
        studentName: `${(assessment as unknown as { student: { firstName: string; lastName: string } }).student.firstName} ${(assessment as unknown as { student: { firstName: string; lastName: string } }).student.lastName}`,
        deadline,
        daysRemaining,
        status: daysRemaining < 0 ? 'OVERDUE' : daysRemaining <= 14 ? 'AT_RISK' : 'ON_TRACK',
        description: `20-week assessment deadline`
      });
    });

    // Sort by days remaining
    return deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  // ========================================
  // ACTION ITEMS
  // ========================================

  /**
   * Get action items for SENCO
   */
  async getActionItems(
    schoolId: string,
    userId: string,
    filter?: { priority?: string; type?: string; status?: string }
  ): Promise<ActionItem[]> {
    const where: Prisma.ActionItemWhereInput = {
      schoolId,
      OR: [
        { assigneeId: userId },
        { assigneeId: null }
      ]
    } as any;

    if (filter?.priority) where.priority = filter.priority;
    if (filter?.type) (where as any).type = filter.type;
    if (filter?.status) where.status = filter.status;

    const items = await this.prisma.actionItem.findMany({
      where,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true }
        }
      } as any,
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' }
      ],
      take: 50
    } as any);

    return items.map(item => {
      const i = item as any;
      return {
        id: item.id,
        type: i.type as ActionItem['type'],
        priority: item.priority as ActionItem['priority'],
        title: item.title,
        description: item.description || '',
        studentId: i.studentId || undefined,
        studentName: i.studentId ? `${i.student?.firstName} ${i.student?.lastName}` : undefined,
        dueDate: item.dueDate || new Date(),
        status: item.status as ActionItem['status'],
        assignedTo: item.assigneeId || undefined,
        createdAt: item.createdAt
      };
    });
  }

  /**
   * Generate action items from compliance check
   */
  async generateActionItems(schoolId: string): Promise<number> {
    const compliance = await this.getComplianceStatus(schoolId);
    let itemsCreated = 0;

    // Create actions for overdue reviews
    for (const deadline of compliance.statutoryDeadlines) {
      if (deadline.status === 'OVERDUE' || deadline.status === 'AT_RISK') {
        const existing = await this.prisma.actionItem.findFirst({
          where: {
            schoolId,
            studentId: deadline.studentId,
            type: deadline.type === 'EHCP_ANNUAL_REVIEW' ? 'REVIEW_DUE' : 'EHCP_DEADLINE',
            status: { not: 'COMPLETED' }
          } as any
        });

        if (!existing) {
          await this.prisma.actionItem.create({
            data: {
              schoolId,
              studentId: deadline.studentId,
              type: deadline.type === 'EHCP_ANNUAL_REVIEW' ? 'REVIEW_DUE' : 'EHCP_DEADLINE',
              priority: deadline.status === 'OVERDUE' ? 'URGENT' : 'HIGH',
              title: `${deadline.type.replace(/_/g, ' ')} - ${deadline.studentName}`,
              description: deadline.description,
              dueDate: deadline.deadline,
              status: 'PENDING'
            } as any
          });
          itemsCreated++;
        }
      }
    }

    return itemsCreated;
  }

  /**
   * Update action item status
   */
  async updateActionItem(
    itemId: string,
    userId: string,
    data: { status?: string; notes?: string }
  ): Promise<ActionItem> {
    const item = await this.prisma.actionItem.update({
      where: { id: itemId },
      data: {
        status: data.status,
        notes: data.notes,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
        completedById: data.status === 'COMPLETED' ? userId : undefined,
        updatedAt: new Date()
      } as any,
      include: { student: { select: { firstName: true, lastName: true } } } as any
    } as any);

    const i = item as any;
    return {
      id: item.id,
      type: i.type as ActionItem['type'],
      priority: item.priority as ActionItem['priority'],
      title: item.title,
      description: item.description || '',
      studentId: i.studentId || undefined,
      studentName: i.studentId ? `${i.student?.firstName} ${i.student?.lastName}` : undefined,
      dueDate: item.dueDate || new Date(),
      status: item.status as ActionItem['status'],
      assignedTo: item.assigneeId || undefined,
      createdAt: item.createdAt
    };
  }

  // ========================================
  // STAFF & TRAINING
  // ========================================

  /**
   * Get staff training needs analysis
   */
  async getStaffTrainingNeeds(schoolId: string): Promise<StaffTrainingNeed[]> {
    const staff = await this.prisma.schoolStaff.findMany({
      where: { 
        schoolId,
        role: { in: ['TEACHER', 'TA', 'SENCO', 'HLTA'] }
      },
      include: { trainingRecords: { orderBy: { completedDate: 'desc' }, take: 5 }, assignedStudents: { include: { sendRegister: { select: { primaryNeed: true } } } } } as any } as any);

    return staff.map(member => {
      // Analyse needs based on assigned students
      const studentNeeds = new Set<string>();
      (member as unknown as { assignedStudents: Array<{ sendRegister: { primaryNeed: string } | null }> }).assignedStudents.forEach(student => {
        if (student.sendRegister?.primaryNeed) {
          studentNeeds.add(student.sendRegister.primaryNeed);
        }
      });

      // Check training coverage
      const completedTraining = new Set(
        (member as unknown as { trainingRecords: Array<{ area: string }> }).trainingRecords.map(t => t.area)
      );

      const trainingNeeds: StaffTrainingNeed['trainingNeeds'] = [];

      // Map student needs to training requirements
      const needToTraining: Record<string, { area: string; courses: string[] }> = {
        'ASD': { area: 'Autism Spectrum Conditions', courses: ['Autism Awareness', 'TEACCH Training', 'PECS Training'] },
        'SEMH': { area: 'Social, Emotional, Mental Health', courses: ['Trauma-Informed Practice', 'Emotion Coaching', 'Mental Health First Aid'] },
        'SpLD': { area: 'Specific Learning Difficulties', courses: ['Dyslexia Awareness', 'Structured Literacy', 'Dyscalculia Support'] },
        'SLCN': { area: 'Speech, Language, Communication', courses: ['Elklan Training', 'Makaton', 'Communication Strategies'] },
        'MLD': { area: 'Moderate Learning Difficulties', courses: ['Differentiation Strategies', 'Scaffolding Learning'] },
        'SLD': { area: 'Severe Learning Difficulties', courses: ['Multi-Sensory Learning', 'Intensive Interaction'] },
        'PD': { area: 'Physical Disability', courses: ['Moving and Handling', 'Accessibility Awareness'] },
        'VI': { area: 'Visual Impairment', courses: ['VI Awareness', 'Orientation and Mobility'] },
        'HI': { area: 'Hearing Impairment', courses: ['Deaf Awareness', 'BSL Level 1'] }
      };

      studentNeeds.forEach(need => {
        const training = needToTraining[need];
        if (training && !completedTraining.has(training.area)) {
          trainingNeeds.push({
            area: training.area,
            priority: 'ESSENTIAL',
            reason: `Working with students with ${need}`,
            suggestedCourses: training.courses
          });
        }
      });

      // Calculate CPD hours this year
      const yearStart = new Date();
      yearStart.setMonth(8); // September
      if (yearStart > new Date()) yearStart.setFullYear(yearStart.getFullYear() - 1);

      const cpdHours = (member as unknown as { trainingRecords: Array<{ completedDate: Date; durationHours: number }> }).trainingRecords
        .filter(t => new Date(t.completedDate) >= yearStart)
        .reduce((sum, t) => sum + (t.durationHours || 0), 0);

      return {
        staffId: member.id,
        staffName: member.name,
        role: member.role,
        trainingNeeds,
        lastTrainingDate: (member as unknown as { trainingRecords: Array<{ completedDate: Date }> }).trainingRecords[0]?.completedDate,
        cpdHoursThisYear: cpdHours
      };
    });
  }

  // ========================================
  // PARENT ENGAGEMENT
  // ========================================

  /**
   * Get parent engagement metrics
   */
  async getParentEngagementMetrics(schoolId: string): Promise<ParentEngagementMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get engagement data
    const [reviewAttendance, portalLogins, messageResponses, documentViews] = await Promise.all([
      (this.prisma.reviewMeeting as any).aggregate({
        where: { schoolId, date: { gte: thirtyDaysAgo } },
        _avg: { parentAttendance: true }
      }),
      (this.prisma.parentPortalSession as any).count({
        where: { schoolId, loginTime: { gte: thirtyDaysAgo } }
      }),
      (this.prisma.parentMessage as any).count({
        where: { 
          schoolId, 
          createdAt: { gte: thirtyDaysAgo },
          responseReceived: true
        }
      }),
      (this.prisma.documentView as any).count({
        where: { 
          schoolId,
          viewedAt: { gte: thirtyDaysAgo },
          viewerType: 'PARENT'
        }
      })
    ]);

    // Find low engagement students
    const students = await (this.prisma.sENDRegister as any).findMany({
      where: { schoolId, status: 'ACTIVE' } as any,
      include: {
        student: {
          include: {
            parentContacts: {
              orderBy: { date: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    const lowEngagementStudents = students
      .filter((s: any) => {
        const lastContact = (s as unknown as { student: { parentContacts: Array<{ date: Date }> } }).student.parentContacts[0]?.date;
        return !lastContact || new Date(lastContact) < thirtyDaysAgo;
      })
      .map((s: any) => ({
        studentId: s.studentId,
        studentName: `${(s as unknown as { student: { firstName: string; lastName: string } }).student.firstName} ${(s as unknown as { student: { firstName: string; lastName: string } }).student.lastName}`,
        lastParentContact: (s as unknown as { student: { parentContacts: Array<{ date: Date }> } }).student.parentContacts[0]?.date || new Date(0),
        engagementScore: this.calculateEngagementScore(s),
        recommendedAction: 'Schedule parent meeting or phone call'
      }))
      .sort((a: any, b: any) => a.engagementScore - b.engagementScore)
      .slice(0, 10);

    // Calculate overall engagement
    const overallEngagement = Math.round(
      ((reviewAttendance._avg.parentAttendance || 0) * 100 +
       Math.min((portalLogins / students.length) * 100, 100) +
       Math.min((messageResponses / students.length) * 100, 100)) / 3
    );

    return {
      overallEngagement,
      byType: {
        reviewAttendance: Math.round((reviewAttendance._avg.parentAttendance || 0) * 100),
        portalLogins,
        messageResponses,
        documentViews
      },
      lowEngagementStudents
    };
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private transformRegisterEntry(entry: unknown): SENDRegisterEntry {
    const e = entry as Record<string, unknown>;
    const student = e.student as Record<string, unknown>;
    const provisions = e.provisions as Array<Record<string, unknown>>;
    const outcomes = e.outcomes as Array<{ status: string }>;

    const onTrack = outcomes?.filter(o => o.status === 'ON_TRACK' || o.status === 'ACHIEVED').length || 0;

    return {
      id: e.id as string,
      studentId: e.studentId as string,
      student: {
        firstName: student.firstName as string,
        lastName: student.lastName as string,
        dateOfBirth: student.dateOfBirth as Date,
        yearGroup: student.yearGroup as string,
        classGroup: student.classGroup as string
      },
      sendStatus: e.sendStatus as SENDRegisterEntry['sendStatus'],
      primaryNeed: e.primaryNeed as string,
      secondaryNeeds: e.secondaryNeeds as string[] || [],
      needLevel: e.needLevel as SENDRegisterEntry['needLevel'],
      identifiedDate: e.identifiedDate as Date,
      lastReviewDate: e.lastReviewDate as Date | undefined,
      nextReviewDate: e.nextReviewDate as Date,
      ehcpStartDate: e.ehcpStartDate as Date | undefined,
      ehcpAnnualReviewDate: e.ehcpAnnualReviewDate as Date | undefined,
      keyWorker: e.keyWorkerId as string | undefined,
      interventions: e.interventions as string[] || [],
      provisions: provisions?.map(p => ({
        name: p.name as string,
        type: p.type as string,
        frequency: p.frequency as string,
        deliveredBy: p.deliveredBy as string,
        costPerWeek: p.costPerWeek as number | undefined
      })) || [],
      progressRAG: e.progressRAG as SENDRegisterEntry['progressRAG'],
      outcomesOnTrack: onTrack,
      outcomesTotal: outcomes?.length || 0,
      requiresUrgentAction: e.requiresUrgentAction as boolean,
      hasOverdueReview: new Date(e.nextReviewDate as Date) < new Date(),
      hasTransition: e.hasTransition as boolean,
      updatedAt: e.updatedAt as Date
    };
  }

  private calculateEngagementScore(_student: unknown): number {
    // Returns 0 until real engagement data (portal logins, parent contacts) is available
    return 0;
  }

  private async getWeeklyActivity(schoolId: string): Promise<DashboardMetrics['weeklyActivity']> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [reviews, parentMeetings, profMeetings, documents, interventions] = await Promise.all([
      (this.prisma.reviewMeeting as any).count({
        where: { schoolId, date: { gte: weekAgo } }
      }),
      (this.prisma.meeting as any).count({
        where: { schoolId, date: { gte: weekAgo }, type: 'PARENT' }
      }),
      (this.prisma.meeting as any).count({
        where: { schoolId, date: { gte: weekAgo }, type: { in: ['PROFESSIONAL', 'MULTI_AGENCY'] } }
      }),
      (this.prisma.document as any).count({
        where: { schoolId, updatedAt: { gte: weekAgo } }
      }),
      this.prisma.interventions.count({
        where: { schoolId, startDate: { gte: weekAgo } } as any
      })
    ]);

    return {
      reviewsCompleted: reviews,
      parentMeetings,
      professionalMeetings: profMeetings,
      documentsUpdated: documents,
      interventionsStarted: interventions
    };
  }

  private async getResourceSummary(schoolId: string): Promise<DashboardMetrics['resourceSummary']> {
    const [provisionCost, staffHours, externalHours] = await Promise.all([
      this.prisma.provisions.aggregate({
        where: { schoolId, status: 'ACTIVE' } as any,
        _sum: { costPerWeek: true }
      }),
      (this.prisma.staffAllocation as any).aggregate({
        where: { schoolId, status: 'ACTIVE' } as any,
        _sum: { hoursPerWeek: true }
      }),
      (this.prisma.externalSpecialist as any).aggregate({
        where: { schoolId, status: 'ACTIVE' } as any,
        _sum: { hoursPerWeek: true }
      })
    ]);

    // Get budget utilisation
    const budget = await (this.prisma.schoolBudget as any).findFirst({
      where: { schoolId, type: 'SEND', year: new Date().getFullYear() }
    });

    const totalCost = ((provisionCost._sum?.costPerWeek || 0)) * 38; // 38 school weeks
    const budgetUtilisation = budget?.amount ? (totalCost / budget.amount) * 100 : 0;

    return {
      totalProvisionCost: (provisionCost._sum?.costPerWeek || 0),
      staffHoursAllocated: staffHours._sum.hoursPerWeek || 0,
      externalSpecialistHours: externalHours._sum.hoursPerWeek || 0,
      budgetUtilisation: Math.round(budgetUtilisation)
    };
  }

  private async getTrends(_schoolId: string): Promise<DashboardMetrics['trends']> {
    // Get monthly data for last 6 months
    const months: TrendData[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const _monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      months.push({
        period: monthStart.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        value: 0,
        change: 0
      });
    }

    // Returns zero-value trends until real historical data queries are implemented
    return {
      newIdentifications: months.map(m => ({ ...m, value: 0 })),
      ehcpApplications: months.map(m => ({ ...m, value: 0 })),
      graduations: months.map(m => ({ ...m, value: 0 })),
      progressImprovement: months.map(m => ({ ...m, value: 0 }))
    };
  }

  private async createAuditEntry(
    registerId: string,
    action: string,
    userId: string,
    details: string
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'SEND_REGISTER',
        entityId: registerId,
        action,
        userId,
        details,
        timestamp: new Date()
      }
    });
  }
}



