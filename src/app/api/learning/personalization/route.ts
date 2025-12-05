/**
 * Lesson Personalization API Routes
 * 
 * API endpoints for the adaptive learning personalization system.
 * Manages student profiles, generates personalized content, and tracks effectiveness.
 * 
 * Zero Gap Project - Sprint 3
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPersonalizationEngine } from '@/lib/engines/lesson-personalization.engine';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - Get student profile or personalized lesson
// ============================================================================

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'profile';
    const studentId = searchParams.get('studentId');
    const lessonId = searchParams.get('lessonId');

    // Determine target student
    const targetStudentId = studentId 
      ? parseInt(studentId, 10) 
      : user.studentId 
        ? parseInt(user.studentId, 10) 
        : null;

    if (!targetStudentId && type !== 'analytics') {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check permissions
    if (user.role === 'student' && user.studentId !== targetStudentId) {
      return NextResponse.json(
        { error: 'You can only view your own profile' },
        { status: 403 }
      );
    }

    const engine = createPersonalizationEngine(tenantId);

    switch (type) {
      case 'profile': {
        const profile = await engine.getStudentProfile(targetStudentId!);
        if (!profile) {
          return NextResponse.json(
            { error: 'Profile not found', needsSetup: true },
            { status: 404 }
          );
        }
        return NextResponse.json(profile);
      }

      case 'personalized': {
        if (!lessonId) {
          return NextResponse.json(
            { error: 'lessonId is required for personalized content' },
            { status: 400 }
          );
        }
        const content = await engine.generatePersonalizedLesson(lessonId, targetStudentId!);
        return NextResponse.json(content);
      }

      case 'analytics': {
        if (!targetStudentId) {
          return NextResponse.json(
            { error: 'studentId is required for analytics' },
            { status: 400 }
          );
        }
        const analytics = await engine.getAdaptationAnalytics(targetStudentId);
        return NextResponse.json(analytics);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: profile, personalized, analytics' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[Personalization API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalization data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create or update student profile
// ============================================================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    const body = await request.json();
    const { studentId, profile } = body;

    // Determine target student
    const targetStudentId = studentId 
      ? parseInt(studentId, 10) 
      : user.studentId 
        ? parseInt(user.studentId, 10) 
        : null;

    if (!targetStudentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check permissions - students can update their own profile, teachers/admins can update any
    if (user.role === 'student' && user.studentId !== targetStudentId) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }

    const engine = createPersonalizationEngine(tenantId);

    const profileId = await engine.upsertStudentProfile({
      studentId: targetStudentId,
      tenantId,
      ...profile,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      profileId,
    });

  } catch (error) {
    logger.error('[Personalization API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save profile';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update effectiveness rating
// ============================================================================

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    const body = await request.json();
    const { studentId, lessonId, rating, feedback } = body;

    if (!studentId || !lessonId || rating === undefined) {
      return NextResponse.json(
        { error: 'studentId, lessonId, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const engine = createPersonalizationEngine(tenantId);

    await engine.updateEffectivenessRating(
      parseInt(studentId, 10),
      lessonId,
      rating,
      feedback
    );

    return NextResponse.json({
      success: true,
      message: 'Effectiveness rating updated',
    });

  } catch (error) {
    logger.error('[Personalization API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update rating';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
