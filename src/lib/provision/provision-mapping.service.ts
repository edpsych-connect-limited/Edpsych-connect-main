/**
 * Provision Mapping Service
 * 
 * Comprehensive provision mapping for SEND support including:
 * - Wave model provision tracking (Universal, Targeted, Specialist)
 * - Cost analysis and budget management
 * - Staff allocation tracking
 * - Intervention effectiveness monitoring
 * - Gap analysis and coverage reports
 * - External specialist management
 * - Funding stream tracking (Element 1, 2, 3, High Needs)
 * 
 * Aligned with SEND Code of Practice and funding requirements
 * 
 * @module ProvisionMappingService
 * @version 1.0.0
 */

import { PrismaClient, Prisma } from '@prisma/client';

// Types
interface Provision {
  id: string;
  schoolId: string;
  
  // Provision details
  name: string;
  description: string;
  category: 'INTERVENTION' | 'RESOURCE' | 'STAFFING' | 'EQUIPMENT' | 'EXTERNAL' | 'TRAINING' | 'ENVIRONMENT';
  type: string; // Specific type within category
  wave: 'UNIVERSAL' | 'TARGETED' | 'SPECIALIST';
  
  // Target group
  targetNeeds: string[];
  targetYearGroups: string[];
  maxCapacity?: number;
  currentEnrolment: number;
  
  // Delivery
  deliveredBy: string;
  deliveryFormat: 'INDIVIDUAL' | 'SMALL_GROUP' | 'CLASS' | 'WHOLE_SCHOOL';
  frequency: string;
  duration: string;
  sessionsPerWeek: number;
  minutesPerSession: number;
  
  // Timing
  startDate: Date;
  endDate?: Date;
  termTime: boolean;
  
  // Cost
  fundingSource: 'ELEMENT_1' | 'ELEMENT_2' | 'ELEMENT_3' | 'HIGH_NEEDS' | 'PP' | 'CATCH_UP' | 'SCHOOL_BUDGET' | 'EXTERNAL';
  costPerSession?: number;
  costPerWeek?: number;
  totalAnnualCost?: number;
  staffCost?: number;
  resourceCost?: number;
  
  // Evidence base
  evidenceBase: 'STRONG' | 'MODERATE' | 'LIMITED' | 'EMERGING' | 'SCHOOL_BASED';
  evidenceSource?: string;
  effectivenessRating?: number;
  
  // Status
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DISCONTINUED';
  
  // Metadata
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProvisionAllocation {
  id: string;
  provisionId: string;
  studentId: string;
  
  // Allocation details
  startDate: Date;
  endDate?: Date;
  sessionsAllocated: number;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Rationale
  reason: string;
  linkedOutcomes: string[];
  linkedEHCPSections?: string[];
  
  // Progress
  sessionsAttended: number;
  attendanceRate: number;
  progressNotes: ProgressNote[];
  
  // Review
  reviewDate: Date;
  exitCriteria: string;
  status: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'GRADUATED';
  exitReason?: string;
  
  createdAt: Date;
}

interface ProgressNote {
  date: Date;
  note: string;
  recordedBy: string;
  rating?: number;
}

interface ProvisionMap {
  id: string;
  schoolId: string;
  name: string;
  academicYear: string;
  term: 'AUTUMN' | 'SPRING' | 'SUMMER' | 'ANNUAL';
  
  // Summary
  totalProvisions: number;
  totalStudentsSupported: number;
  totalWeeklyCost: number;
  totalAnnualCost: number;
  
  // By wave
  universalProvisions: number;
  targetedProvisions: number;
  specialistProvisions: number;
  
  // By need type
  provisionsByNeed: Record<string, number>;
  
  // Coverage
  coverageByYearGroup: Record<string, { students: number; provisions: number }>;
  gapAnalysis: GapAnalysisItem[];
  
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

interface GapAnalysisItem {
  needType: string;
  yearGroup: string;
  studentsWithNeed: number;
  studentsWithProvision: number;
  gapPercentage: number;
  recommendation: string;
}

interface StaffAllocation {
  id: string;
  schoolId: string;
  staffId: string;
  staffName: string;
  role: string;
  
  // Allocation
  hoursPerWeek: number;
  allocatedTo: {
    provisionId: string;
    provisionName: string;
    hoursPerWeek: number;
    students: string[];
  }[];
  
  // Cost
  hourlyRate: number;
  weeklyCoat: number;
  fundingSources: string[];
  
  // Capacity
  maxHours: number;
  utilisationRate: number;
  
  status: 'ACTIVE' | 'ON_LEAVE' | 'LEFT';
}

interface BudgetSummary {
  schoolId: string;
  academicYear: string;
  
  // Funding received
  element1: number;
  element2: number;
  element3: number;
  highNeedsTopUp: number;
  pupilPremium: number;
  catchUpFunding: number;
  other: number;
  totalFunding: number;
  
  // Expenditure
  staffing: number;
  interventions: number;
  resources: number;
  externalServices: number;
  equipment: number;
  training: number;
  totalExpenditure: number;
  
  // Balance
  remaining: number;
  projectedYearEnd: number;
  
  // Per pupil
  averageCostPerSENStudent: number;
  averageCostPerEHCP: number;
}

interface ProvisionEffectiveness {
  provisionId: string;
  provisionName: string;
  
  // Usage
  totalStudents: number;
  completedStudents: number;
  
  // Outcomes
  averageProgressGain: number;
  studentsAchievingTarget: number;
  achievementRate: number;
  
  // Efficiency
  costPerStudent: number;
  costPerProgressPoint: number;
  
  // Comparison
  comparedToAverage: 'ABOVE' | 'AVERAGE' | 'BELOW';
  recommendation: 'EXPAND' | 'MAINTAIN' | 'REVIEW' | 'DISCONTINUE';
}

interface CreateProvisionData {
  name: string;
  description: string;
  category: Provision['category'];
  type: string;
  wave: Provision['wave'];
  targetNeeds: string[];
  targetYearGroups: string[];
  deliveredBy: string;
  deliveryFormat: Provision['deliveryFormat'];
  frequency: string;
  sessionsPerWeek: number;
  minutesPerSession: number;
  fundingSource: Provision['fundingSource'];
  costPerSession?: number;
  evidenceBase: Provision['evidenceBase'];
  startDate: Date;
}

interface ProvisionFilters {
  category?: string;
  wave?: string;
  targetNeed?: string;
  yearGroup?: string;
  status?: string;
  fundingSource?: string;
}

export class ProvisionMappingService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  // ========================================
  // PROVISION MANAGEMENT
  // ========================================

  /**
   * Create new provision
   */
  async createProvision(schoolId: string, data: CreateProvisionData, createdById: string): Promise<Provision> {
    // Calculate costs
    const costPerWeek = data.costPerSession 
      ? data.costPerSession * data.sessionsPerWeek 
      : undefined;
    const totalAnnualCost = costPerWeek ? costPerWeek * 38 : undefined; // 38 school weeks

    const provision = await this.prisma.provision.create({
      data: {
        schoolId,
        name: data.name,
        description: data.description,
        category: data.category,
        type: data.type,
        wave: data.wave,
        targetNeeds: data.targetNeeds,
        targetYearGroups: data.targetYearGroups,
        currentEnrolment: 0,
        deliveredBy: data.deliveredBy,
        deliveryFormat: data.deliveryFormat,
        frequency: data.frequency,
        duration: `${data.minutesPerSession} minutes`,
        sessionsPerWeek: data.sessionsPerWeek,
        minutesPerSession: data.minutesPerSession,
        startDate: data.startDate,
        termTime: true,
        fundingSource: data.fundingSource,
        costPerSession: data.costPerSession,
        costPerWeek,
        totalAnnualCost,
        evidenceBase: data.evidenceBase,
        status: 'ACTIVE',
        createdById
      }
    });

    return provision as unknown as Provision;
  }

  /**
   * Get provision by ID
   */
  async getProvision(provisionId: string): Promise<Provision | null> {
    const provision = await this.prisma.provision.findUnique({
      where: { id: provisionId },
      include: {
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: { firstName: true, lastName: true, yearGroup: true }
            }
          }
        }
      }
    });

    return provision as unknown as Provision;
  }

  /**
   * Get provisions with filters
   */
  async getProvisions(
    schoolId: string,
    filters: ProvisionFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ provisions: Provision[]; total: number }> {
    const where: Prisma.ProvisionWhereInput = { schoolId };

    if (filters.category) where.category = filters.category;
    if (filters.wave) where.wave = filters.wave;
    if (filters.status) where.status = filters.status;
    if (filters.fundingSource) where.fundingSource = filters.fundingSource;
    if (filters.targetNeed) where.targetNeeds = { has: filters.targetNeed };
    if (filters.yearGroup) where.targetYearGroups = { has: filters.yearGroup };

    const [provisions, total] = await Promise.all([
      this.prisma.provision.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { wave: 'asc' },
          { name: 'asc' }
        ]
      }),
      this.prisma.provision.count({ where })
    ]);

    return {
      provisions: provisions as unknown as Provision[],
      total
    };
  }

  /**
   * Update provision
   */
  async updateProvision(provisionId: string, data: Partial<CreateProvisionData>): Promise<Provision> {
    const provision = await this.prisma.provision.update({
      where: { id: provisionId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return provision as unknown as Provision;
  }

  // ========================================
  // STUDENT ALLOCATION
  // ========================================

  /**
   * Allocate student to provision
   */
  async allocateStudent(
    provisionId: string,
    studentId: string,
    data: {
      reason: string;
      linkedOutcomes?: string[];
      linkedEHCPSections?: string[];
      sessionsAllocated: number;
      priorityLevel: ProvisionAllocation['priorityLevel'];
      reviewDate: Date;
      exitCriteria: string;
    }
  ): Promise<ProvisionAllocation> {
    const allocation = await this.prisma.provisionAllocation.create({
      data: {
        provisionId,
        studentId,
        startDate: new Date(),
        sessionsAllocated: data.sessionsAllocated,
        priorityLevel: data.priorityLevel,
        reason: data.reason,
        linkedOutcomes: data.linkedOutcomes || [],
        linkedEHCPSections: data.linkedEHCPSections || [],
        sessionsAttended: 0,
        attendanceRate: 0,
        progressNotes: [] as unknown as Prisma.JsonValue,
        reviewDate: data.reviewDate,
        exitCriteria: data.exitCriteria,
        status: 'ACTIVE'
      }
    });

    // Update provision enrolment count
    await this.prisma.provision.update({
      where: { id: provisionId },
      data: { currentEnrolment: { increment: 1 } }
    });

    return allocation as unknown as ProvisionAllocation;
  }

  /**
   * Get student's provisions
   */
  async getStudentProvisions(studentId: string): Promise<{
    current: ProvisionAllocation[];
    historical: ProvisionAllocation[];
  }> {
    const allocations = await this.prisma.provisionAllocation.findMany({
      where: { studentId },
      include: {
        provision: {
          select: {
            id: true,
            name: true,
            category: true,
            wave: true,
            deliveredBy: true,
            frequency: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    const current = allocations.filter(a => a.status === 'ACTIVE');
    const historical = allocations.filter(a => a.status !== 'ACTIVE');

    return {
      current: current as unknown as ProvisionAllocation[],
      historical: historical as unknown as ProvisionAllocation[]
    };
  }

  /**
   * Record progress for allocation
   */
  async recordProgress(
    allocationId: string,
    data: {
      note: string;
      rating?: number;
      sessionAttended: boolean;
    },
    recordedBy: string
  ): Promise<ProvisionAllocation> {
    const allocation = await this.prisma.provisionAllocation.findUnique({
      where: { id: allocationId }
    });

    if (!allocation) throw new Error('Allocation not found');

    const progressNotes = allocation.progressNotes as unknown as ProgressNote[] || [];
    progressNotes.push({
      date: new Date(),
      note: data.note,
      recordedBy,
      rating: data.rating
    });

    const sessionsAttended = allocation.sessionsAttended + (data.sessionAttended ? 1 : 0);
    const totalSessions = allocation.sessionsAllocated;
    const attendanceRate = totalSessions > 0 
      ? Math.round((sessionsAttended / totalSessions) * 100) 
      : 0;

    const updated = await this.prisma.provisionAllocation.update({
      where: { id: allocationId },
      data: {
        progressNotes: progressNotes as unknown as Prisma.JsonValue,
        sessionsAttended,
        attendanceRate
      }
    });

    return updated as unknown as ProvisionAllocation;
  }

  /**
   * Exit student from provision
   */
  async exitFromProvision(
    allocationId: string,
    data: {
      status: 'COMPLETED' | 'WITHDRAWN' | 'GRADUATED';
      reason: string;
    }
  ): Promise<ProvisionAllocation> {
    const allocation = await this.prisma.provisionAllocation.findUnique({
      where: { id: allocationId }
    });

    if (!allocation) throw new Error('Allocation not found');

    const updated = await this.prisma.provisionAllocation.update({
      where: { id: allocationId },
      data: {
        status: data.status,
        exitReason: data.reason,
        endDate: new Date()
      }
    });

    // Update provision enrolment count
    await this.prisma.provision.update({
      where: { id: allocation.provisionId },
      data: { currentEnrolment: { decrement: 1 } }
    });

    return updated as unknown as ProvisionAllocation;
  }

  // ========================================
  // PROVISION MAP
  // ========================================

  /**
   * Generate provision map
   */
  async generateProvisionMap(schoolId: string, academicYear: string, term: ProvisionMap['term']): Promise<ProvisionMap> {
    // Get all active provisions
    const provisions = await this.prisma.provision.findMany({
      where: { schoolId, status: 'ACTIVE' },
      include: {
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: { yearGroup: true },
              include: {
                sendRegister: {
                  select: { primaryNeed: true }
                }
              }
            }
          }
        }
      }
    });

    // Calculate summaries
    const totalWeeklyCost = provisions.reduce((sum, p) => sum + (p.costPerWeek || 0), 0);
    const totalAnnualCost = provisions.reduce((sum, p) => sum + (p.totalAnnualCost || 0), 0);
    
    const studentsSupported = new Set<string>();
    provisions.forEach(p => {
      (p as unknown as { allocations: { studentId: string }[] }).allocations.forEach(a => studentsSupported.add(a.studentId));
    });

    // Group by wave
    const universalProvisions = provisions.filter(p => p.wave === 'UNIVERSAL').length;
    const targetedProvisions = provisions.filter(p => p.wave === 'TARGETED').length;
    const specialistProvisions = provisions.filter(p => p.wave === 'SPECIALIST').length;

    // Group by need type
    const provisionsByNeed: Record<string, number> = {};
    provisions.forEach(p => {
      (p.targetNeeds as string[]).forEach(need => {
        provisionsByNeed[need] = (provisionsByNeed[need] || 0) + 1;
      });
    });

    // Coverage by year group
    const coverageByYearGroup: Record<string, { students: number; provisions: number }> = {};
    provisions.forEach(p => {
      (p.targetYearGroups as string[]).forEach(yg => {
        if (!coverageByYearGroup[yg]) {
          coverageByYearGroup[yg] = { students: 0, provisions: 0 };
        }
        coverageByYearGroup[yg].provisions++;
        
        const studentsInYG = (p as unknown as { allocations: { student: { yearGroup: string } }[] }).allocations
          .filter(a => a.student.yearGroup === yg).length;
        coverageByYearGroup[yg].students += studentsInYG;
      });
    });

    // Gap analysis
    const gapAnalysis = await this.performGapAnalysis(schoolId, provisions);

    // Create or update provision map
    const map = await this.prisma.provisionMap.upsert({
      where: {
        schoolId_academicYear_term: { schoolId, academicYear, term }
      },
      create: {
        schoolId,
        name: `Provision Map ${academicYear} ${term}`,
        academicYear,
        term,
        totalProvisions: provisions.length,
        totalStudentsSupported: studentsSupported.size,
        totalWeeklyCost,
        totalAnnualCost,
        universalProvisions,
        targetedProvisions,
        specialistProvisions,
        provisionsByNeed: provisionsByNeed as unknown as Prisma.JsonValue,
        coverageByYearGroup: coverageByYearGroup as unknown as Prisma.JsonValue,
        gapAnalysis: gapAnalysis as unknown as Prisma.JsonValue,
        status: 'ACTIVE'
      },
      update: {
        totalProvisions: provisions.length,
        totalStudentsSupported: studentsSupported.size,
        totalWeeklyCost,
        totalAnnualCost,
        universalProvisions,
        targetedProvisions,
        specialistProvisions,
        provisionsByNeed: provisionsByNeed as unknown as Prisma.JsonValue,
        coverageByYearGroup: coverageByYearGroup as unknown as Prisma.JsonValue,
        gapAnalysis: gapAnalysis as unknown as Prisma.JsonValue,
        updatedAt: new Date()
      }
    });

    return map as unknown as ProvisionMap;
  }

  /**
   * Get provision map
   */
  async getProvisionMap(schoolId: string, academicYear?: string): Promise<ProvisionMap | null> {
    const year = academicYear || this.getAcademicYear(new Date());
    
    const map = await this.prisma.provisionMap.findFirst({
      where: { schoolId, academicYear: year, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' }
    });

    return map as unknown as ProvisionMap;
  }

  // ========================================
  // STAFF ALLOCATION
  // ========================================

  /**
   * Get staff allocations
   */
  async getStaffAllocations(schoolId: string): Promise<StaffAllocation[]> {
    const staff = await this.prisma.schoolStaff.findMany({
      where: { 
        schoolId,
        role: { in: ['TA', 'HLTA', 'LSA', '1:1_SUPPORT'] },
        status: 'ACTIVE'
      },
      include: {
        provisionAllocations: {
          where: { status: 'ACTIVE' },
          include: {
            provision: {
              select: { id: true, name: true }
            },
            students: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    return staff.map(s => {
      const allocatedTo = (s as unknown as { 
        provisionAllocations: Array<{
          provision: { id: string; name: string };
          hoursPerWeek: number;
          students: Array<{ id: string }>;
        }>;
      }).provisionAllocations.map(pa => ({
        provisionId: pa.provision.id,
        provisionName: pa.provision.name,
        hoursPerWeek: pa.hoursPerWeek,
        students: pa.students.map(st => st.id)
      }));

      const totalAllocated = allocatedTo.reduce((sum, a) => sum + a.hoursPerWeek, 0);
      const maxHours = (s as unknown as { contractedHours: number }).contractedHours || 30;

      return {
        id: s.id,
        schoolId: s.schoolId,
        staffId: s.id,
        staffName: s.name,
        role: s.role,
        hoursPerWeek: totalAllocated,
        allocatedTo,
        hourlyRate: (s as unknown as { hourlyRate: number }).hourlyRate || 15,
        weeklyCoat: totalAllocated * ((s as unknown as { hourlyRate: number }).hourlyRate || 15),
        fundingSources: ['ELEMENT_2'],
        maxHours,
        utilisationRate: Math.round((totalAllocated / maxHours) * 100),
        status: s.status as StaffAllocation['status']
      };
    });
  }

  // ========================================
  // BUDGET & COSTS
  // ========================================

  /**
   * Get budget summary
   */
  async getBudgetSummary(schoolId: string, academicYear?: string): Promise<BudgetSummary> {
    const year = academicYear || this.getAcademicYear(new Date());

    // Get budget allocations
    const budgets = await this.prisma.schoolBudget.findMany({
      where: { schoolId, year: parseInt(year.split('-')[0]) }
    });

    // Get provisions for expenditure
    const provisions = await this.prisma.provision.findMany({
      where: { schoolId, status: 'ACTIVE' }
    });

    // Calculate funding
    const funding: Record<string, number> = {
      element1: 0,
      element2: 0,
      element3: 0,
      highNeedsTopUp: 0,
      pupilPremium: 0,
      catchUpFunding: 0,
      other: 0
    };

    budgets.forEach(b => {
      const type = (b.type as string).toLowerCase();
      if (type.includes('element_1') || type.includes('element1')) funding.element1 += b.amount;
      else if (type.includes('element_2') || type.includes('element2')) funding.element2 += b.amount;
      else if (type.includes('element_3') || type.includes('element3')) funding.element3 += b.amount;
      else if (type.includes('high_needs')) funding.highNeedsTopUp += b.amount;
      else if (type.includes('pupil_premium') || type.includes('pp')) funding.pupilPremium += b.amount;
      else if (type.includes('catch_up')) funding.catchUpFunding += b.amount;
      else funding.other += b.amount;
    });

    const totalFunding = Object.values(funding).reduce((a, b) => a + b, 0);

    // Calculate expenditure
    const expenditure: Record<string, number> = {
      staffing: 0,
      interventions: 0,
      resources: 0,
      externalServices: 0,
      equipment: 0,
      training: 0
    };

    provisions.forEach(p => {
      const cost = (p.totalAnnualCost || 0);
      switch (p.category) {
        case 'STAFFING':
          expenditure.staffing += cost;
          break;
        case 'INTERVENTION':
          expenditure.interventions += cost;
          break;
        case 'RESOURCE':
          expenditure.resources += cost;
          break;
        case 'EXTERNAL':
          expenditure.externalServices += cost;
          break;
        case 'EQUIPMENT':
          expenditure.equipment += cost;
          break;
        case 'TRAINING':
          expenditure.training += cost;
          break;
      }
    });

    const totalExpenditure = Object.values(expenditure).reduce((a, b) => a + b, 0);

    // Get student counts
    const senCount = await this.prisma.sENDRegister.count({
      where: { schoolId, status: 'ACTIVE' }
    });
    const ehcpCount = await this.prisma.sENDRegister.count({
      where: { schoolId, status: 'ACTIVE', sendStatus: 'EHCP' }
    });

    return {
      schoolId,
      academicYear: year,
      ...funding,
      totalFunding,
      ...expenditure,
      totalExpenditure,
      remaining: totalFunding - totalExpenditure,
      projectedYearEnd: totalFunding - (totalExpenditure * 1.1), // 10% contingency
      averageCostPerSENStudent: senCount > 0 ? Math.round(totalExpenditure / senCount) : 0,
      averageCostPerEHCP: ehcpCount > 0 ? Math.round(totalExpenditure / ehcpCount) : 0
    };
  }

  // ========================================
  // EFFECTIVENESS ANALYSIS
  // ========================================

  /**
   * Get provision effectiveness analysis
   */
  async getProvisionEffectiveness(schoolId: string): Promise<ProvisionEffectiveness[]> {
    const provisions = await this.prisma.provision.findMany({
      where: { schoolId },
      include: {
        allocations: {
          include: {
            student: {
              include: {
                outcomes: {
                  where: { status: { not: 'DISCONTINUED' } }
                }
              }
            }
          }
        }
      }
    });

    return provisions.map(provision => {
      const allocations = provision.allocations as unknown as {
        status: string;
        studentId: string;
        student: {
          outcomes: Array<{
            linkedProvisions: string[];
            progressPercentage: number;
            status: string;
          }>;
        };
      }[];

      const totalStudents = allocations.length;
      const completedStudents = allocations.filter(a => 
        a.status === 'COMPLETED' || a.status === 'GRADUATED'
      ).length;

      // Calculate progress for linked outcomes
      let totalProgress = 0;
      let studentsAchievingTarget = 0;
      let linkedOutcomeCount = 0;

      allocations.forEach(alloc => {
        const linkedOutcomes = alloc.student.outcomes.filter(o =>
          o.linkedProvisions?.includes(provision.id)
        );
        
        linkedOutcomes.forEach(outcome => {
          totalProgress += outcome.progressPercentage || 0;
          linkedOutcomeCount++;
          if (outcome.status === 'ACHIEVED' || outcome.progressPercentage >= 100) {
            studentsAchievingTarget++;
          }
        });
      });

      const averageProgressGain = linkedOutcomeCount > 0 
        ? Math.round(totalProgress / linkedOutcomeCount) 
        : 0;
      const achievementRate = totalStudents > 0 
        ? Math.round((studentsAchievingTarget / totalStudents) * 100) 
        : 0;
      const costPerStudent = totalStudents > 0 && provision.totalAnnualCost
        ? Math.round(provision.totalAnnualCost / totalStudents)
        : 0;
      const costPerProgressPoint = averageProgressGain > 0 && costPerStudent > 0
        ? Math.round(costPerStudent / averageProgressGain)
        : 0;

      // Determine recommendation
      let recommendation: ProvisionEffectiveness['recommendation'] = 'MAINTAIN';
      let comparedToAverage: ProvisionEffectiveness['comparedToAverage'] = 'AVERAGE';

      if (achievementRate >= 75 && costPerProgressPoint < 100) {
        recommendation = 'EXPAND';
        comparedToAverage = 'ABOVE';
      } else if (achievementRate >= 50) {
        recommendation = 'MAINTAIN';
        comparedToAverage = 'AVERAGE';
      } else if (achievementRate >= 25) {
        recommendation = 'REVIEW';
        comparedToAverage = 'BELOW';
      } else {
        recommendation = 'DISCONTINUE';
        comparedToAverage = 'BELOW';
      }

      return {
        provisionId: provision.id,
        provisionName: provision.name,
        totalStudents,
        completedStudents,
        averageProgressGain,
        studentsAchievingTarget,
        achievementRate,
        costPerStudent,
        costPerProgressPoint,
        comparedToAverage,
        recommendation
      };
    });
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private async performGapAnalysis(schoolId: string, provisions: unknown[]): Promise<GapAnalysisItem[]> {
    // Get all SEN students by need type and year group
    const students = await this.prisma.sENDRegister.findMany({
      where: { schoolId, status: 'ACTIVE' },
      include: {
        student: { select: { yearGroup: true } }
      }
    });

    const needsByYearGroup: Record<string, Record<string, number>> = {};
    const provisionsByYearGroup: Record<string, Record<string, number>> = {};

    // Count students by need and year group
    students.forEach(s => {
      const yg = (s as unknown as { student: { yearGroup: string } }).student.yearGroup;
      const need = s.primaryNeed;
      
      if (!needsByYearGroup[yg]) needsByYearGroup[yg] = {};
      needsByYearGroup[yg][need] = (needsByYearGroup[yg][need] || 0) + 1;
    });

    // Count provisions covering each need/year group
    (provisions as Provision[]).forEach(p => {
      (p.targetYearGroups as string[]).forEach(yg => {
        if (!provisionsByYearGroup[yg]) provisionsByYearGroup[yg] = {};
        (p.targetNeeds as string[]).forEach(need => {
          provisionsByYearGroup[yg][need] = (provisionsByYearGroup[yg][need] || 0) + 1;
        });
      });
    });

    // Identify gaps
    const gaps: GapAnalysisItem[] = [];
    
    Object.entries(needsByYearGroup).forEach(([yg, needs]) => {
      Object.entries(needs).forEach(([need, count]) => {
        const provisionsAvailable = provisionsByYearGroup[yg]?.[need] || 0;
        const gapPercentage = provisionsAvailable > 0 
          ? Math.max(0, Math.round(((count - provisionsAvailable) / count) * 100))
          : 100;

        if (gapPercentage > 25) {
          gaps.push({
            needType: need,
            yearGroup: yg,
            studentsWithNeed: count,
            studentsWithProvision: Math.min(count, provisionsAvailable),
            gapPercentage,
            recommendation: gapPercentage > 75 
              ? 'Urgent: Add provision for this need type'
              : 'Consider expanding provision capacity'
          });
        }
      });
    });

    return gaps.sort((a, b) => b.gapPercentage - a.gapPercentage);
  }

  private getAcademicYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (month >= 8) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  }
}
