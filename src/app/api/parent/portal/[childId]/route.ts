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
import prisma from '@/lib/prisma';

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

    // Verify user is a parent
    if (session.role !== 'parent') {
      console.warn(`[Parent Portal API] Non-parent access attempt - User: ${userId}, Role: ${session.role}`);
      return NextResponse.json({
        error: 'Access denied. This endpoint is only available to parents.'
      }, { status: 403 });
    }

    console.log(`[Parent Portal API] GET request - Child: ${childId}, Parent: ${userId}, Tenant: ${tenantId}`);

    // CRITICAL SECURITY CHECK: Verify parent-child relationship
    const parentChildLink = await prisma.parentChildLink.findFirst({
      where: {
        parent_user_id: userId,
        student_id: childId,
        is_active: true,
      },
    });

    if (!parentChildLink) {
      console.warn(`[Parent Portal API] SECURITY VIOLATION - Parent ${userId} attempted to access child ${childId} without relationship`);

      // Log security violation
      await prisma.dataAccessLog.create({
        data: {
          user_id: userId,
          tenant_id: tenantId,
          student_id: childId,
          access_type: 'unauthorized_parent_access_attempt',
          data_accessed: 'BLOCKED: Attempted to access unrelated child data',
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return NextResponse.json({
        error: 'Access denied. You do not have permission to view this child\'s information.'
      }, { status: 403 });
    }

    // Fetch child data
    const student = await prisma.student.findFirst({
      where: {
        id: childId,
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
      console.warn(`[Parent Portal API] Student not found - Child: ${childId}, Tenant: ${tenantId}`);
      return NextResponse.json({
        error: 'Child information not found'
      }, { status: 404 });
    }

    // Fetch parent name
    const parentUser = await prisma.user.findFirst({
      where: { id: userId },
      select: { first_name: true, last_name: true },
    });

    const parentName = parentUser
      ? `${parentUser.first_name} ${parentUser.last_name}`
      : 'Parent';

    // Fetch student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { student_id: childId },
    });

    // Fetch recent lessons (last 10)
    const recentLessons = await prisma.studentLessonAssignment.findMany({
      where: {
        student_id: childId,
        completion_status: 'completed',
      },
      orderBy: { completed_date: 'desc' },
      take: 10,
    });

    // Fetch teacher information
    const classEnrollment = await prisma.classRosterStudent.findFirst({
      where: { student_id: childId },
      include: {
        class_roster: {
          include: {
            teacher: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    const teacherName = classEnrollment?.class_roster.teacher
      ? `${classEnrollment.class_roster.teacher.first_name} ${classEnrollment.class_roster.teacher.last_name}`
      : 'Class Teacher';

    // Fetch message count
    const unreadMessages = await prisma.message.count({
      where: {
        recipient_id: userId,
        is_read: false,
      },
    });

    const lastMessage = await prisma.message.findFirst({
      where: {
        OR: [
          { sender_id: userId },
          { recipient_id: userId },
        ],
      },
      orderBy: { sent_at: 'desc' },
    });

    // Build progress summary in plain English
    const learningProfile = profile?.learning_profile as any || {};
    const strengths = profile?.strengths as string[] || [];
    const struggles = profile?.struggles as string[] || [];

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
      if ((lesson.success_rate || 0) >= 80) {
        recentAchievements.push(`Excellent work in ${lesson.subject}: ${lesson.lesson_title}`);
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
      subject: lesson.subject,
      title: lesson.lesson_title,
      completedDate: lesson.completed_date,
      successLevel: getSuccessLevel(lesson.success_rate),
      teacherComment: lesson.teacher_feedback,
    }));

    // Strengths and support (plain English)
    const strengthsTranslated = strengths.map(s =>
      translateToParentFriendly(s.toLowerCase().replace(/ /g, '_'))
    );

    const workingOn = struggles.slice(0, 3).map(s =>
      `Developing ${translateToParentFriendly(s.toLowerCase().replace(/ /g, '_'))}`
    );

    const supportProvided: string[] = [];
    if (student.has_ehcp) {
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
        student_id: childId,
        completion_status: { in: ['not_started', 'in_progress'] },
        due_date: { not: null },
      },
      orderBy: { due_date: 'asc' },
      take: 3,
    });

    const upcomingMilestones = upcomingLessons.map(lesson => ({
      type: 'Lesson',
      description: `${lesson.subject}: ${lesson.lesson_title}`,
      date: lesson.due_date,
    }));

    // Build response
    const response: ParentPortalResponse = {
      childId: student.id,
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
        lastMessageDate: lastMessage?.sent_at || null,
        unreadMessages,
      },
      lastUpdated: new Date(),
    };

    // Log data access for GDPR audit trail
    await prisma.dataAccessLog.create({
      data: {
        user_id: userId,
        tenant_id: tenantId,
        student_id: childId,
        access_type: 'parent_portal_view',
        data_accessed: 'Parent accessed child progress summary',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    console.log(`[Parent Portal API] Parent ${parentName} accessed child ${student.first_name} ${student.last_name} progress`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Parent Portal API] Error retrieving child progress:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
