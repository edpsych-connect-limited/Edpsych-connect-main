/**
 * FILE: src/app/api/students/[id]/profile/route.ts
 * PURPOSE: Auto-built student profile management with teacher override capabilities
 *
 * This route provides access to the auto-generated student profile, including:
 * - Learning styles and preferences
 * - Strengths and struggle areas
 * - Behavioral patterns
 * - Readiness indicators
 * - Profile confidence scores
 *
 * Teachers can manually adjust any auto-detected fields while maintaining full audit trail.
 *
 * @route GET /api/students/[id]/profile - Retrieve student profile
 * @route PATCH /api/students/[id]/profile - Update profile with manual overrides
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * Profile response structure
 */
interface StudentProfileResponse {
  profileId: string;
  studentId: string;
  studentName: string;
  confidenceScore: number;
  lastUpdated: Date;
  dataSources: {
    assessments: number;
    lessons: number;
    interventions: number;
    manualAdjustments: number;
  };
  learningProfile: {
    primaryLearningStyle: string | null;
    secondaryLearningStyle: string | null;
    readingLevel: string | null;
    mathLevel: string | null;
    processingSpeed: string | null;
    workingMemory: string | null;
  };
  strengths: string[];
  struggles: string[];
  behavioralPatterns: {
    attentionSpan: string | null;
    socialInteraction: string | null;
    emotionalRegulation: string | null;
    motivationTriggers: string[];
  };
  readinessIndicators: {
    independentWork: number;
    groupWork: number;
    verbalTasks: number;
    writtenTasks: number;
    practicalTasks: number;
  };
  sendSupport: {
    hasEhcp: boolean;
    primaryNeed: string | null;
    supportLevel: string | null;
    accommodations: string[];
  };
  lastAssessmentDate: Date | null;
  lastLessonDate: Date | null;
  lastInterventionDate: Date | null;
}

/**
 * Profile update schema for validation
 */
const profileUpdateSchema = z.object({
  learningProfile: z.object({
    primaryLearningStyle: z.string().nullable().optional(),
    secondaryLearningStyle: z.string().nullable().optional(),
    readingLevel: z.string().nullable().optional(),
    mathLevel: z.string().nullable().optional(),
    processingSpeed: z.string().nullable().optional(),
    workingMemory: z.string().nullable().optional(),
  }).optional(),
  strengths: z.array(z.string()).optional(),
  struggles: z.array(z.string()).optional(),
  behavioralPatterns: z.object({
    attentionSpan: z.string().nullable().optional(),
    socialInteraction: z.string().nullable().optional(),
    emotionalRegulation: z.string().nullable().optional(),
    motivationTriggers: z.array(z.string()).optional(),
  }).optional(),
  accommodations: z.array(z.string()).optional(),
  manualAdjustmentReason: z.string().min(10, 'Please provide reason for manual adjustment (min 10 characters)'),
});

/**
 * GET /api/students/[id]/profile
 *
 * Retrieves the auto-built student profile with comprehensive learning data,
 * readiness indicators, and confidence scores.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing student ID
 * @returns Complete student profile with metadata
 *
 * @example
 * curl -X GET \
 *   http://localhost:3000/api/students/student_123/profile \
 *   -H "Authorization: Bearer {token}"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<StudentProfileResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Student Profile API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = params;
    const tenantId = session.tenant_id;
    const userId = session.user_id;

    console.log(`[Student Profile API] GET request - Student: ${studentId}, User: ${userId}, Tenant: ${tenantId}`);

    // Verify student belongs to tenant
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        has_ehcp: true,
        primary_send_need: true,
      },
    });

    if (!student) {
      console.warn(`[Student Profile API] Student not found or access denied - Student: ${studentId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Student not found or access denied'
      }, { status: 404 });
    }

    // Fetch or create student profile
    let profile = await prisma.studentProfile.findUnique({
      where: {
        student_id: studentId,
      },
    });

    // If no profile exists, create initial one
    if (!profile) {
      console.log(`[Student Profile API] Creating initial profile for student: ${studentId}`);
      profile = await prisma.studentProfile.create({
        data: {
          student_id: studentId,
          confidence_score: 0.0,
          data_sources: {
            assessments: 0,
            lessons: 0,
            interventions: 0,
            manualAdjustments: 0,
          },
          learning_profile: {},
          strengths: [],
          struggles: [],
          behavioral_patterns: {},
          readiness_indicators: {},
        },
      });
    }

    // Count data sources
    const [assessmentCount, lessonCount, interventionCount, manualAdjustmentCount] = await Promise.all([
      prisma.assessment.count({
        where: { student_id: studentId },
      }),
      prisma.studentLessonAssignment.count({
        where: { student_id: studentId },
      }),
      prisma.intervention.count({
        where: { student_id: studentId },
      }),
      prisma.automatedAction.count({
        where: {
          student_id: studentId,
          action_type: 'profile_manual_adjustment',
        },
      }),
    ]);

    // Get last activity dates
    const [lastAssessment, lastLesson, lastIntervention] = await Promise.all([
      prisma.assessment.findFirst({
        where: { student_id: studentId },
        orderBy: { completed_at: 'desc' },
        select: { completed_at: true },
      }),
      prisma.studentLessonAssignment.findFirst({
        where: { student_id: studentId },
        orderBy: { assigned_date: 'desc' },
        select: { assigned_date: true },
      }),
      prisma.intervention.findFirst({
        where: { student_id: studentId },
        orderBy: { start_date: 'desc' },
        select: { start_date: true },
      }),
    ]);

    // Parse profile data (stored as JSON)
    const learningProfile = profile.learning_profile as any || {};
    const behavioralPatterns = profile.behavioral_patterns as any || {};
    const readinessIndicators = profile.readiness_indicators as any || {};

    // Build response
    const response: StudentProfileResponse = {
      profileId: profile.id,
      studentId: student.id,
      studentName: `${student.first_name} ${student.last_name}`,
      confidenceScore: profile.confidence_score,
      lastUpdated: profile.updated_at,
      dataSources: {
        assessments: assessmentCount,
        lessons: lessonCount,
        interventions: interventionCount,
        manualAdjustments: manualAdjustmentCount,
      },
      learningProfile: {
        primaryLearningStyle: learningProfile.primaryLearningStyle || null,
        secondaryLearningStyle: learningProfile.secondaryLearningStyle || null,
        readingLevel: learningProfile.readingLevel || null,
        mathLevel: learningProfile.mathLevel || null,
        processingSpeed: learningProfile.processingSpeed || null,
        workingMemory: learningProfile.workingMemory || null,
      },
      strengths: Array.isArray(profile.strengths) ? profile.strengths as string[] : [],
      struggles: Array.isArray(profile.struggles) ? profile.struggles as string[] : [],
      behavioralPatterns: {
        attentionSpan: behavioralPatterns.attentionSpan || null,
        socialInteraction: behavioralPatterns.socialInteraction || null,
        emotionalRegulation: behavioralPatterns.emotionalRegulation || null,
        motivationTriggers: Array.isArray(behavioralPatterns.motivationTriggers)
          ? behavioralPatterns.motivationTriggers
          : [],
      },
      readinessIndicators: {
        independentWork: readinessIndicators.independentWork || 50,
        groupWork: readinessIndicators.groupWork || 50,
        verbalTasks: readinessIndicators.verbalTasks || 50,
        writtenTasks: readinessIndicators.writtenTasks || 50,
        practicalTasks: readinessIndicators.practicalTasks || 50,
      },
      sendSupport: {
        hasEhcp: student.has_ehcp || false,
        primaryNeed: student.primary_send_need || null,
        supportLevel: learningProfile.supportLevel || null,
        accommodations: Array.isArray(learningProfile.accommodations)
          ? learningProfile.accommodations
          : [],
      },
      lastAssessmentDate: lastAssessment?.completed_at || null,
      lastLessonDate: lastLesson?.assigned_date || null,
      lastInterventionDate: lastIntervention?.start_date || null,
    };

    // Log data access for GDPR audit trail
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        student_id: studentId,
        access_type: 'student_profile_view',
        data_accessed: 'Student profile with learning data',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    console.log(`[Student Profile API] Profile retrieved successfully - Student: ${studentId}, Confidence: ${profile.confidence_score}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Student Profile API] Error retrieving profile:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PATCH /api/students/[id]/profile
 *
 * Allows teachers to manually adjust auto-detected profile fields.
 * All manual adjustments are logged for audit trail and affect confidence scores.
 *
 * @param request - Next.js request object with update payload
 * @param params - Route parameters containing student ID
 * @returns Updated student profile
 *
 * @example
 * curl -X PATCH \
 *   http://localhost:3000/api/students/student_123/profile \
 *   -H "Authorization: Bearer {token}" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "learningProfile": {
 *       "primaryLearningStyle": "visual",
 *       "readingLevel": "Year 4"
 *     },
 *     "strengths": ["Creative thinking", "Visual spatial skills"],
 *     "struggles": ["Written expression", "Time management"],
 *     "manualAdjustmentReason": "Based on recent classroom observations and parent feedback"
 *   }'
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<StudentProfileResponse | { error: string; message?: string; errors?: any }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Student Profile API] Unauthorized update attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = params;
    const tenantId = session.tenant_id;
    const userId = session.user_id;

    // Verify role (only teachers and admin can update profiles)
    if (!['teacher', 'admin', 'head_teacher'].includes(session.role)) {
      console.warn(`[Student Profile API] Insufficient permissions - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Insufficient permissions. Only teachers and administrators can update profiles.'
      }, { status: 403 });
    }

    console.log(`[Student Profile API] PATCH request - Student: ${studentId}, User: ${userId}, Tenant: ${tenantId}`);

    // Verify student belongs to tenant
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenant_id: tenantId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        has_ehcp: true,
        primary_send_need: true,
      },
    });

    if (!student) {
      console.warn(`[Student Profile API] Student not found for update - Student: ${studentId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Student not found or access denied'
      }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      console.warn(`[Student Profile API] Validation failed:`, validation.error.errors);
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.error.errors
      }, { status: 400 });
    }

    const updates = validation.data;

    // Get current profile
    const currentProfile = await prisma.studentProfile.findUnique({
      where: { student_id: studentId },
    });

    if (!currentProfile) {
      console.error(`[Student Profile API] Profile not found for student: ${studentId}`);
      return NextResponse.json({
        error: 'Student profile not found. Please generate profile first.'
      }, { status: 404 });
    }

    // Merge updates with existing data
    const currentLearningProfile = currentProfile.learning_profile as any || {};
    const currentBehavioralPatterns = currentProfile.behavioral_patterns as any || {};

    const updatedLearningProfile = {
      ...currentLearningProfile,
      ...(updates.learningProfile || {}),
    };

    const updatedBehavioralPatterns = {
      ...currentBehavioralPatterns,
      ...(updates.behavioralPatterns || {}),
    };

    const updatedStrengths = updates.strengths || currentProfile.strengths;
    const updatedStruggles = updates.struggles || currentProfile.struggles;

    // Calculate new confidence score
    // Manual adjustments slightly increase confidence
    const dataSourceCounts = currentProfile.data_sources as any || {};
    const manualAdjustmentCount = (dataSourceCounts.manualAdjustments || 0) + 1;

    const newConfidenceScore = Math.min(
      currentProfile.confidence_score + 0.05, // Small boost from teacher input
      1.0
    );

    // Update profile
    const updatedProfile = await prisma.studentProfile.update({
      where: { student_id: studentId },
      data: {
        learning_profile: updatedLearningProfile,
        behavioral_patterns: updatedBehavioralPatterns,
        strengths: updatedStrengths,
        struggles: updatedStruggles,
        confidence_score: newConfidenceScore,
        data_sources: {
          ...dataSourceCounts,
          manualAdjustments: manualAdjustmentCount,
        },
        updated_at: new Date(),
      },
    });

    // Log manual adjustment for audit trail
    await prisma.automatedAction.create({
      data: {
        tenant_id: tenantId,
        student_id: studentId,
        action_type: 'profile_manual_adjustment',
        trigger_reason: updates.manualAdjustmentReason,
        action_taken: JSON.stringify({
          updatedFields: Object.keys(updates).filter(k => k !== 'manualAdjustmentReason'),
          previousConfidence: currentProfile.confidence_score,
          newConfidence: newConfidenceScore,
        }),
        success: true,
        executed_by: userId,
        executed_at: new Date(),
      },
    });

    // Log data modification for GDPR audit trail
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        student_id: studentId,
        access_type: 'student_profile_update',
        data_accessed: 'Student profile manual adjustment',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    console.log(`[Student Profile API] Profile updated successfully - Student: ${studentId}, New Confidence: ${newConfidenceScore}`);

    // Return updated profile (reuse GET logic structure)
    const response: StudentProfileResponse = {
      profileId: updatedProfile.id,
      studentId: student.id,
      studentName: `${student.first_name} ${student.last_name}`,
      confidenceScore: updatedProfile.confidence_score,
      lastUpdated: updatedProfile.updated_at,
      dataSources: {
        assessments: (updatedProfile.data_sources as any)?.assessments || 0,
        lessons: (updatedProfile.data_sources as any)?.lessons || 0,
        interventions: (updatedProfile.data_sources as any)?.interventions || 0,
        manualAdjustments: manualAdjustmentCount,
      },
      learningProfile: {
        primaryLearningStyle: updatedLearningProfile.primaryLearningStyle || null,
        secondaryLearningStyle: updatedLearningProfile.secondaryLearningStyle || null,
        readingLevel: updatedLearningProfile.readingLevel || null,
        mathLevel: updatedLearningProfile.mathLevel || null,
        processingSpeed: updatedLearningProfile.processingSpeed || null,
        workingMemory: updatedLearningProfile.workingMemory || null,
      },
      strengths: Array.isArray(updatedStrengths) ? updatedStrengths as string[] : [],
      struggles: Array.isArray(updatedStruggles) ? updatedStruggles as string[] : [],
      behavioralPatterns: {
        attentionSpan: updatedBehavioralPatterns.attentionSpan || null,
        socialInteraction: updatedBehavioralPatterns.socialInteraction || null,
        emotionalRegulation: updatedBehavioralPatterns.emotionalRegulation || null,
        motivationTriggers: Array.isArray(updatedBehavioralPatterns.motivationTriggers)
          ? updatedBehavioralPatterns.motivationTriggers
          : [],
      },
      readinessIndicators: {
        independentWork: (updatedProfile.readiness_indicators as any)?.independentWork || 50,
        groupWork: (updatedProfile.readiness_indicators as any)?.groupWork || 50,
        verbalTasks: (updatedProfile.readiness_indicators as any)?.verbalTasks || 50,
        writtenTasks: (updatedProfile.readiness_indicators as any)?.writtenTasks || 50,
        practicalTasks: (updatedProfile.readiness_indicators as any)?.practicalTasks || 50,
      },
      sendSupport: {
        hasEhcp: student.has_ehcp || false,
        primaryNeed: student.primary_send_need || null,
        supportLevel: updatedLearningProfile.supportLevel || null,
        accommodations: Array.isArray(updatedLearningProfile.accommodations)
          ? updatedLearningProfile.accommodations
          : [],
      },
      lastAssessmentDate: null, // Not recalculated on update
      lastLessonDate: null,
      lastInterventionDate: null,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Student Profile API] Error updating profile:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
