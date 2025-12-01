/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = parseInt(session.id);

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ progress: 0, state: null });
    }

    return NextResponse.json({
      progress: enrollment.progress,
      timeSpent: enrollment.timeSpent,
      state: enrollment.data,
    });
  } catch (_error) {
    console.error('Error fetching progress:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = parseInt(session.id);

    const body = await request.json();
    const { courseId, progress, timeSpent, state } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Update or create enrollment
    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        progress,
        timeSpent,
        data: state, // Save the detailed state
        lastAccessedAt: new Date(),
        // If progress is 100, mark as completed if not already
        ...(progress === 100 ? { status: 'completed', completedAt: new Date() } : {}),
      },
      create: {
        userId,
        courseId,
        progress,
        timeSpent,
        data: state,
        lastAccessedAt: new Date(),
        status: progress === 100 ? 'completed' : 'active',
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    return NextResponse.json(enrollment);
  } catch (_error) {
    console.error('Error saving progress:', _error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}
