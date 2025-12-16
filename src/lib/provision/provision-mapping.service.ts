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
 * 
 * Note: This service contains stub implementations with unused parameters
 * that will be implemented in future sprints.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Prisma } from '@prisma/client';
import type { DbClient } from '@/lib/prisma';
import { prisma as defaultPrisma } from '@/lib/prisma';

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
  private prisma: DbClient;

  constructor(prismaClient?: DbClient) {
    this.prisma = prismaClient || defaultPrisma;
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

    const provision = await this.prisma.provisions.create({
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
        duration: data.minutesPerSession,
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
      } as any
    });

    return provision as unknown as Provision;
  }

  /**
   * Get provision by ID
   */
  async getProvision(provisionId: string): Promise<Provision | null> {
    const provision = await this.prisma.provisions.findUnique({
      where: { id: provisionId },
      include: { 
        allocations: { 
          include: { 
            student: { 
              include: { 
                outcomes: { 
                  where: { status: { not: 'ACHIEVED' } } 
                } 
              } 
            } 
          } 
        } 
      } as any 
    } as any);

    return provision as unknown as Provision;
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


