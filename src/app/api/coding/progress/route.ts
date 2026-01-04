/**
 * Developers of Tomorrow - Student Progress API Routes
 * 
 * API endpoints for student code submissions, progress tracking, and achievements.
 * 
 * Zero Gap Project - Sprint 2
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCOTService } from '@/lib/coding/coders-of-tomorrow.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - Get student progress or submissions
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
    const type = searchParams.get('type') || 'progress';
    const studentId = searchParams.get('studentId');
    const exerciseId = searchParams.get('exerciseId');

    // For student users, they can only see their own progress
    // For teachers/admins, they can see any student's progress
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

    // Check permissions
    if (user.role === 'student' && user.studentId !== targetStudentId) {
      return NextResponse.json(
        { error: 'You can only view your own progress' },
        { status: 403 }
      );
    }

    const cotService = createCOTService(tenantId);

    switch (type) {
      case 'progress': {
        const progress = await cotService.getStudentProgress(targetStudentId);
        return NextResponse.json(progress);
      }

      case 'submissions': {
        const submissions = await cotService.getStudentSubmissions(
          targetStudentId, 
          exerciseId || undefined
        );
        return NextResponse.json(submissions);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: progress, submissions' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[COT Progress API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student progress' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Submit code for an exercise
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
    const { exerciseId, code, timeSpentSeconds, studentId } = body;

    if (!exerciseId || !code) {
      return NextResponse.json(
        { error: 'exerciseId and code are required' },
        { status: 400 }
      );
    }

    // Determine which student is submitting
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

    // Check permissions - students can only submit for themselves
    if (user.role === 'student' && user.studentId !== targetStudentId) {
      return NextResponse.json(
        { error: 'You can only submit your own code' },
        { status: 403 }
      );
    }

    const cotService = createCOTService(tenantId);

    const result = await cotService.submitExercise(
      exerciseId,
      targetStudentId,
      code,
      timeSpentSeconds
    );

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    logger.error('[COT Progress API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit code';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
