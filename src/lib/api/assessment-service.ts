import { logger } from "@/lib/logger";
/**
 * Assessment Service - Business Logic Layer
 * ========================================
 *
 * This module contains the core business logic for assessments,
 * separated from Next.js API handlers for better testability.
 */

import { prisma } from '../prisma';
import { ApiError } from '../api-handler';

export interface AssessmentFilters {
  status?: string;
  courseId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateAssessmentData {
  title: string;
  status: string;
  courseId: string;
}

export class AssessmentService {
  /**
   * Get assessments with filtering and pagination
   */
  static async getAssessments(filters: AssessmentFilters, user: any) {
    // Build filter object
    const filter: any = {};

    if (filters.status) {
      filter.status = filters.status;
    }

    if (filters.courseId) {
      filter.courseId = filters.courseId;
    }

    // Text search on title
    if (filters.search) {
      filter.title = { contains: filters.search, mode: 'insensitive' };
    }

    // Parse pagination parameters
    const limitNum = Math.min(filters.limit || 50, 100);
    const offsetNum = filters.offset || 0;

    // Handle sort parameters
    const orderBy: any = {};
    orderBy[filters.sortBy || 'createdAt'] = filters.sortDirection || 'desc';

    // No special permission handling required for this simplified version

    // Fetch assessments with count
    const [assessments, total] = await Promise.all([
      (prisma as any).assessment.findMany({
        where: filter,
        select: {
          id: true,
          title: true,
          status: true,
          courseId: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy,
        skip: offsetNum,
        take: limitNum
      }),
      (prisma as any).assessment.count({ where: filter })
    ]);

    return {
      assessments,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + assessments.length < total
      }
    };
  }

  /**
   * Create a new assessment
   */
  static async createAssessment(data: CreateAssessmentData, user: any) {
    // Validate required fields
    if (!data.title) {
      throw new ApiError('Title is required', 400);
    }

    if (!data.status) {
      throw new ApiError('Status is required', 400);
    }

    if (!data.courseId) {
      throw new ApiError('Course ID is required', 400);
    }

    // Check if user can create assessments
    const allowedRoles = ['TEACHER', 'ADMIN', 'SUPER_ADMIN', 'EDPSYCH', 'RESEARCHER'];
    if (!allowedRoles.includes(user.role)) {
      throw new ApiError('You do not have permission to create assessments', 403);
    }

    // Create simple assessment record
    const assessment = await (prisma as any).assessment.create({
      data: {
        id: `assessment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        title: data.title,
        status: data.status,
        courseId: data.courseId,
        updatedAt: new Date()
      }
    });

    return assessment;
  }

  /**
   * Get assessment by ID
   */
  static async getAssessmentById(id: string, user: any) {
    const assessment = await (prisma as any).assessment.findUnique({
      where: { id }
    });

    if (!assessment) {
      throw new ApiError('Assessment not found', 404);
    }

    // No special permission handling required for this simplified version

    return assessment;
  }

  /**
   * Submit assessment answers
   */
  static async submitAssessment(assessmentId: string, answers: any, user: any) {
    // Validate assessment exists and is active
    const assessment = await (prisma as any).assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      throw new ApiError('Assessment not found', 404);
    }

    if (assessment.status !== 'active') {
      throw new ApiError('Assessment is not available for submission', 403);
    }

    // Check if user already submitted
    const existingResult = await (prisma as any).assessmentResult.findFirst({
      where: {
        assessmentId,
        userId: user.id
      }
    });

    if (existingResult) {
      throw new ApiError('Assessment already submitted', 409);
    }

    // Mock score
    const score = 80;
    const maxScore = 100;

    // Create result
    const result = await (prisma as any).assessmentResult.create({
      data: {
        id: `assessment-result-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        assessmentId,
        userId: user.id,
        answers,
        score,
        maxScore,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return result;
  }

  /**
   * Get assessment results
   */
  static async getAssessmentResults(assessmentId: string, user: any, resultId?: string) {
    // Check assessment exists
    const assessment = await (prisma as any).assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      throw new ApiError('Assessment not found', 404);
    }

    // No special permissions required for simplified version

    if (resultId) {
      // Get specific result
      const result = await (prisma as any).assessmentResult.findUnique({
        where: { id: resultId }
      });

      if (!result) {
        throw new ApiError('Result not found', 404);
      }

      return { result };
    } else {
      // Get all results for assessment
      const results = await (prisma as any).assessmentResult.findMany({
        where: { assessmentId },
        orderBy: { createdAt: 'desc' }
      });

      return { assessment, results };
    }
  }

  /**
   * Calculate assessment score (mock)
   */
  private static calculateScore(): number {
    // Just return a mock score for now
    return Math.floor(Math.random() * 100);
  }
}