/**
 * Developers of Tomorrow - Coding Curriculum API Routes
 * 
 * Production-ready API endpoints for managing the UK National Curriculum-aligned
 * coding education system.
 * 
 * Zero Gap Project - Sprint 2
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCOTService } from '@/lib/coding/coders-of-tomorrow.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - List curricula, lessons, or exercises
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
    const type = searchParams.get('type') || 'curricula';
    const keyStage = searchParams.get('keyStage');
    const curriculumId = searchParams.get('curriculumId');
    const lessonId = searchParams.get('lessonId');
    const exerciseId = searchParams.get('exerciseId');

    const cotService = createCOTService(tenantId);

    switch (type) {
      case 'curricula': {
        if (keyStage) {
          const curricula = await cotService.getCurriculaByKeyStage(keyStage);
          return NextResponse.json(curricula);
        }
        const allCurricula = await cotService.getAllCurricula();
        return NextResponse.json(allCurricula);
      }

      case 'lessons': {
        if (!curriculumId) {
          return NextResponse.json(
            { error: 'curriculumId is required for lessons' },
            { status: 400 }
          );
        }
        const lessons = await cotService.getLessonsForCurriculum(curriculumId);
        return NextResponse.json(lessons);
      }

      case 'lesson': {
        if (!lessonId) {
          return NextResponse.json(
            { error: 'lessonId is required' },
            { status: 400 }
          );
        }
        const lesson = await cotService.getLesson(lessonId);
        if (!lesson) {
          return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }
        return NextResponse.json(lesson);
      }

      case 'exercise': {
        if (!exerciseId) {
          return NextResponse.json(
            { error: 'exerciseId is required' },
            { status: 400 }
          );
        }
        const exercise = await cotService.getExercise(exerciseId);
        if (!exercise) {
          return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
        }
        return NextResponse.json(exercise);
      }

      case 'leaderboard': {
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const leaderboard = await cotService.getLeaderboard(curriculumId || undefined, limit);
        return NextResponse.json(leaderboard);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: curricula, lessons, lesson, exercise, leaderboard' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[COT API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coding curriculum data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create curriculum, lesson, or exercise
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
    const userId = parseInt(user.id, 10);

    // Verify user has teacher or admin permissions
    if (!['teacher', 'admin', 'super_admin', 'curriculum_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only teachers and administrators can create curriculum content.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    const cotService = createCOTService(tenantId, userId);

    switch (type) {
      case 'curriculum': {
        const curriculumId = await cotService.createCurriculum({
          name: data.name,
          description: data.description,
          keyStage: data.keyStage,
          yearGroups: data.yearGroups,
          ageRangeMin: data.ageRangeMin,
          ageRangeMax: data.ageRangeMax,
          ncObjectives: data.ncObjectives,
          prerequisiteId: data.prerequisiteId,
        });

        return NextResponse.json({
          success: true,
          message: 'Curriculum created successfully',
          id: curriculumId,
        }, { status: 201 });
      }

      case 'lesson': {
        const lessonId = await cotService.createLesson({
          curriculumId: data.curriculumId,
          title: data.title,
          description: data.description,
          learningObjectives: data.learningObjectives,
          lessonNumber: data.lessonNumber,
          durationMinutes: data.durationMinutes,
          language: data.language,
          skillAreas: data.skillAreas,
          baseDifficulty: data.baseDifficulty,
          teacherNotes: data.teacherNotes,
          resourcesUrls: data.resourcesUrls,
          videoUrl: data.videoUrl,
        });

        return NextResponse.json({
          success: true,
          message: 'Lesson created successfully',
          id: lessonId,
        }, { status: 201 });
      }

      case 'exercise': {
        const exerciseId = await cotService.createExercise({
          lessonId: data.lessonId,
          title: data.title,
          instructions: data.instructions,
          exerciseNumber: data.exerciseNumber,
          exerciseType: data.exerciseType,
          difficulty: data.difficulty,
          starterCode: data.starterCode,
          solutionCode: data.solutionCode,
          testCases: data.testCases,
          hints: data.hints,
          maxPoints: data.maxPoints,
          hasAudioInstructions: data.hasAudioInstructions,
          hasVisualSupports: data.hasVisualSupports,
          hasSimplifiedVersion: data.hasSimplifiedVersion,
        });

        return NextResponse.json({
          success: true,
          message: 'Exercise created successfully',
          id: exerciseId,
        }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: curriculum, lesson, exercise' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[COT API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create curriculum content';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Publish curriculum or update content
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
    const userId = parseInt(user.id, 10);

    const body = await request.json();
    const { action, curriculumId } = body;

    const cotService = createCOTService(tenantId, userId);

    switch (action) {
      case 'publish': {
        if (!curriculumId) {
          return NextResponse.json(
            { error: 'curriculumId is required' },
            { status: 400 }
          );
        }
        await cotService.publishCurriculum(curriculumId);
        return NextResponse.json({
          success: true,
          message: 'Curriculum published successfully',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: publish' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[COT API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update curriculum content';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
