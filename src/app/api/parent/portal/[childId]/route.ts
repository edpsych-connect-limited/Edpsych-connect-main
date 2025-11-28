import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/parent/portal/[childId]/route.ts
 * PURPOSE: Scoped parent portal view providing access to their child's data only
 *
 * This route provides parents with secure, privacy-protected access to their
 * child's educational progress, achievements, and support information.
 *
 * Critical Security Features:
 * - Strict parent-child relationship verification
 * - No data leakage from other students
 * - Education jargon translated to plain English
 * - Celebration-focused presentation
 * - Complete GDPR audit logging
 *
 * @route GET /api/parent/portal/[childId] - Parent view of their child's progress
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Parent portal response structure
 */
interface ParentPortalResponse {
  childId: string;
  childName: string;
  parentName: string;
  progressSummary: {
    overallMessage: string; // Plain English summary
    recentAchievements: string[];
    currentFocus: string;
    areasOfGrowth: string[];
  };
  recentLessons: {
    subject: string;
    title: string;
    completedDate: Date | null;
    successLevel: 'excellent' | 'good' | 'satisfactory' | 'needs_support';
    teacherComment: string | null;
  }[];
  strengthsAndSupport: {
    strengths: string[]; // In plain English
    workingOn: string[]; // Framed positively
    supportProvided: string[];
  };
  homeReinforcement: {
    suggestedActivities: string[];
    practiceAreas: string[];
    celebrationHighlights: string[];
  };
  upcomingMilestones: {
    type: string;
    description: string;
    date: Date | null;
  }[];
  teacherContact: {
    teacherName: string;
    lastMessageDate: Date | null;
    unreadMessages: number;
  };
  lastUpdated: Date;
}

/**
 * Translates education jargon to parent-friendly language
 */
function translateToParentFriendly(educationalTerm: string): string {
  const translations: Record<string, string> = {
    // Learning styles
    'visual_learner': 'learns best by seeing and observing',
    'auditory_learner': 'learns best by listening and discussing',
    'kinesthetic_learner': 'learns best through hands-on activities',

    // SEND terminology
    'working_memory_deficit': 'sometimes needs reminders for multi-step tasks',
    'processing_speed_delay': 'takes their time to think things through carefully',
    'attention_difficulties': 'working on maintaining focus',
    'social_communication_needs': 'developing social skills',

    // Academic levels
    'below_age_related_expectations': 'making steady progress at their own pace',
    'working_towards_expected': 'developing skills with good support',
    'at_age_related_expectations': 'working at the expected level for their age',
    'exceeding_expectations': 'excelling and ready for additional challenges',

    // Interventions
    'phonics_intervention': 'extra support with reading sounds and blending',
    'numeracy_intervention': 'additional help with number skills',
    'social_skills_group': 'small group activities to build friendships',
    'emotional_regulation': 'strategies to manage feelings',
  };

  return translations[educationalTerm] || educationalTerm;
}

/**
 * Converts success rate to parent-friendly level
 */
function getSuccessLevel(successRate: number | null): 'excellent' | 'good' | 'satisfactory' | 'needs_support' {
  if (successRate === null) return 'satisfactory';
  if (successRate >= 85) return 'excellent';
  if (successRate >= 70) return 'good';
  if (successRate >= 55) return 'satisfactory';
  return 'needs_support';
}

/**
 * GET /api/parent/portal/[childId]
 *
 * Provides parents with secure access to their child's educational progress,
 * presented in plain English with celebration-focused framing.
 *
 * CRITICAL SECURITY: Verifies parent-child relationship before returning any data.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing child (student) ID
 * @returns Parent-friendly view of child's progress
 *
 * @example
 * curl -X GET \
 *   http://localhost:3000/api/parent/portal/student_123 \
 *   -H "Authorization: Bearer {parent_token}"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
): Promise<NextResponse<ParentPortalResponse | { error: string; message?: string }>> {
  try {
    // Authentication
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      console.warn('[Parent Portal API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { childId } = params;
    const tenantId = session.tenant_id;
    const userId = session.user_id;

    // Note: Parent role functionality - 'parent' role will be added to the role type in the future
    // For now, authentication is sufficient (proper parent-child verification happens below)

    logger.debug(`[Parent Portal API] GET request - Child: ${childId}, Parent: ${userId}, Tenant: ${tenantId}`);

    // CRITICAL SECURITY CHECK: Verify parent-child relationship
    const parentChildLink = await prisma.parentChildLink.findFirst({
      where: {
        parent_id: typeof userId === 'string' ? parseInt(userId) : userId,
        child_id: parseInt(childId),
      },
    });

    if (!parentChildLink) {
      console.warn(`[Parent Portal API] SECURITY VIOLATION - Parent ${userId} attempted to access child ${childId} without relationship`);

      // Log security violation
      await prisma.auditLog.create({
        data: {
          userId: userId?.toString() || 'unknown',
          user_id_int: typeof userId === 'string' ? parseInt(userId) : userId,
          tenant_id: tenantId || 0,
          action: 'unauthorized_parent_access_attempt',
          resource: 'student',
          details: {
            entityId: childId,
            description: 'BLOCKED: Attempted to access unrelated child data',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        },
      });

      return NextResponse.json({
        error: 'Access denied. You do not have permission to view this child\'s information.'
      }, { status: 403 });
    }

    // Fetch child data
    const student = await prisma.students.findFirst({
      where: {
        id: parseInt(childId),
        tenant_id: tenantId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        sen_status: true,
        year_group: true,
      },
    });

    if (!student) {
      console.warn(`[Parent Portal API] Student not found - Child: ${childId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Child information not found'
      }, { status: 404 });
    }

    // Fetch parent name
    const parentUser = await prisma.users.findFirst({
      where: { id: typeof userId === 'string' ? parseInt(userId) : userId },
      select: { firstName: true, lastName: true },
    });

    const parentName = parentUser
      ? `${parentUser.firstName} ${parentUser.lastName}`
      : 'Parent';

    // Fetch student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { student_id: parseInt(childId) },
    });

    // Fetch recent lessons (last 10)
    const recentLessons = await prisma.studentLessonAssignment.findMany({
      where: {
        student_id: parseInt(childId),
        status: 'completed',
      },
      include: {
        lesson_plan: {
          select: {
            title: true,
            subject: true,
          },
        },
      },
      orderBy: { completed_at: 'desc' },
      take: 10,
    });

    // Fetch teacher information
    // Note: Teacher assignment would come from ClassRoster in a full implementation
    // For now, we'll use a placeholder since the relation isn't set up yet
    const teacherName = 'Class Teacher';

    // Fetch message count
    const unreadMessages = await prisma.parentTeacherMessage.count({
      where: {
        receiverId: typeof userId === 'string' ? parseInt(userId) : userId,
        readAt: null,
      },
    });

    const lastMessage = await prisma.parentTeacherMessage.findFirst({
      where: {
        OR: [
          { senderId: typeof userId === 'string' ? parseInt(userId) : userId },
          { receiverId: typeof userId === 'string' ? parseInt(userId) : userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build progress summary in plain English
    const learningProfile = profile?.learning_style as any || {};
    const strengths = profile?.current_strengths as string[] || [];
    const struggles = profile?.current_struggles as string[] || [];

    // Calculate average success rate
    const completedWithRates = recentLessons.filter(l => l.success_rate !== null);
    const averageSuccessRate = completedWithRates.length > 0
      ? completedWithRates.reduce((sum, l) => sum + (l.success_rate || 0), 0) / completedWithRates.length
      : 0;

    // Generate overall message
    let overallMessage = '';
    if (averageSuccessRate >= 80) {
      overallMessage = `${student.first_name} is doing brilliantly! They're making excellent progress and showing great enthusiasm for learning.`;
    } else if (averageSuccessRate >= 65) {
      overallMessage = `${student.first_name} is making good, steady progress. They're working hard and developing their skills well.`;
    } else if (averageSuccessRate >= 50) {
      overallMessage = `${student.first_name} is working at their own pace with support. We're helping them build confidence and skills step by step.`;
    } else {
      overallMessage = `${student.first_name} is receiving extra support to help them succeed. We're working closely with them to build their confidence and skills.`;
    }

    // Identify recent achievements
    const recentAchievements: string[] = [];
    recentLessons.slice(0, 3).forEach(lesson => {
      if ((lesson.success_rate || 0) >= 0.80) {
        recentAchievements.push(`Excellent work in ${lesson.lesson_plan.subject}: ${lesson.lesson_plan.title}`);
      }
    });

    if (recentAchievements.length === 0) {
      recentAchievements.push(`Completed ${recentLessons.length} lessons with dedication`);
    }

    // Current focus
    const currentFocus = struggles.length > 0
      ? `Building confidence with ${struggles[0]?.toLowerCase()}`
      : `Continuing to develop across all subjects`;

    // Areas of growth (framed positively)
    const areasOfGrowth = struggles.slice(0, 3).map(struggle =>
      `Working on: ${translateToParentFriendly(struggle.toLowerCase().replace(/ /g, '_'))}`
    );

    // Map recent lessons to parent-friendly format
    const recentLessonsFormatted = recentLessons.slice(0, 5).map(lesson => ({
      subject: lesson.lesson_plan.subject,
      title: lesson.lesson_plan.title,
      completedDate: lesson.completed_at,
      successLevel: getSuccessLevel(lesson.success_rate),
      teacherComment: null, // Teacher feedback would come from a separate feedback system
    }));

    // Strengths and support (plain English)
    const strengthsTranslated = strengths.map(s =>
      translateToParentFriendly(s.toLowerCase().replace(/ /g, '_'))
    );

    const workingOn = struggles.slice(0, 3).map(s =>
      `Developing ${translateToParentFriendly(s.toLowerCase().replace(/ /g, '_'))}`
    );

    const supportProvided: string[] = [];
    if (student.sen_status && student.sen_status !== 'None') {
      supportProvided.push('Tailored support plan in place');
    }
    if (learningProfile.accommodations) {
      supportProvided.push('Classroom adjustments to support learning');
    }
    supportProvided.push('Regular progress monitoring');

    // Home reinforcement suggestions
    const suggestedActivities: string[] = [
      'Read together for 10-15 minutes daily',
      'Practice counting and number games',
      'Encourage questions and curiosity',
    ];

    const practiceAreas = struggles.slice(0, 2).map(s =>
      `Gentle practice with ${s.toLowerCase()}`
    );

    const celebrationHighlights = recentAchievements.slice(0, 2);

    // Upcoming milestones
    const upcomingLessons = await prisma.studentLessonAssignment.findMany({
      where: {
        student_id: parseInt(childId),
        status: { in: ['assigned', 'started'] },
      },
      include: {
        lesson_plan: {
          select: {
            title: true,
            subject: true,
            scheduled_for: true,
          },
        },
      },
      orderBy: { assigned_at: 'asc' },
      take: 3,
    });

    const upcomingMilestones = upcomingLessons.map(lesson => ({
      type: 'Lesson',
      description: `${lesson.lesson_plan.subject}: ${lesson.lesson_plan.title}`,
      date: lesson.lesson_plan.scheduled_for,
    }));

    // Build response
    const response: ParentPortalResponse = {
      childId: student.id.toString(),
      childName: `${student.first_name} ${student.last_name}`,
      parentName,
      progressSummary: {
        overallMessage,
        recentAchievements,
        currentFocus,
        areasOfGrowth,
      },
      recentLessons: recentLessonsFormatted,
      strengthsAndSupport: {
        strengths: strengthsTranslated.length > 0 ? strengthsTranslated : ['Unique learner with their own strengths'],
        workingOn: workingOn.length > 0 ? workingOn : ['Continuing to grow across all areas'],
        supportProvided,
      },
      homeReinforcement: {
        suggestedActivities,
        practiceAreas,
        celebrationHighlights,
      },
      upcomingMilestones,
      teacherContact: {
        teacherName,
        lastMessageDate: lastMessage?.createdAt || null,
        unreadMessages,
      },
      lastUpdated: new Date(),
    };

    // Log data access for GDPR audit trail
    await prisma.auditLog.create({
      data: {
        userId: userId?.toString() || 'unknown',
        user_id_int: typeof userId === 'string' ? parseInt(userId) : userId,
        tenant_id: tenantId || 0,
        action: 'parent_portal_view',
        resource: 'student',
        details: {
          entityId: childId,
          description: 'Parent accessed child progress summary',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      },
    });

    logger.debug(`[Parent Portal API] Parent ${parentName} accessed child ${student.first_name} ${student.last_name} progress`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Parent Portal API] Error retrieving child progress:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
