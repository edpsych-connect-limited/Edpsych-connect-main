/**
 * FILE: src/app/api/onboarding/skip-step/route.ts
 * PURPOSE: Skip a step in the onboarding flow (with tracking)
 *
 * ENDPOINT: POST /api/onboarding/skip-step
 * AUTH: Required (JWT)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';

interface RequestBody {
  step: number; // 1-6
  reason?: string; // Optional reason for analytics
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const body: RequestBody = await request.json();
    const { step, reason } = body;

    // Validate step
    if (!Number.isInteger(step) || step < 1 || step > 6) {
      return NextResponse.json(
        { success: false, error: 'Invalid step number. Must be 1-6' },
        { status: 400 }
      );
    }

    // Fetch user with onboarding progress
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { onboarding_progress: true }
    });

    if (!user || !user.onboarding_progress) {
      return NextResponse.json(
        { success: false, error: 'Onboarding not found' },
        { status: 404 }
      );
    }

    const progress = user.onboarding_progress;
    const now = new Date();

    // Add step to skipped array if not already there
    const stepsSkipped = [...progress.steps_skipped];
    if (!stepsSkipped.includes(step)) {
      stepsSkipped.push(step);
    }

    // Calculate next step
    const nextStep = step < 6 ? step + 1 : 6;

    // Update database
    await prisma.onboarding_progress.update({
      where: { user_id: userId },
      data: {
        steps_skipped: stepsSkipped,
        current_step: nextStep,
        updated_at: now
      }
    });

    // Update user
    await prisma.users.update({
      where: { id: userId },
      data: {
        onboarding_step: nextStep,
        updated_at: now
      }
    });

    // Calculate progress
    const stepsCompleted = [
      progress.step_1_welcome_completed,
      !!progress.step_2_role_selected,
      progress.step_3_profile_completed,
      progress.step_4_features_viewed.length > 0,
      progress.step_5_first_case_created && progress.step_5_first_assessment_done && progress.step_5_first_goal_set,
      progress.step_6_certificate_viewed || progress.step_6_tour_completed
    ].filter(Boolean).length;

    const currentProgress = Math.round((stepsCompleted / 6) * 100);

    // Log analytics
    console.log(`[onboarding/skip-step] User ${userId} skipped step ${step}. Reason: ${reason || 'not provided'}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Step skipped',
        skippedStep: step,
        nextStep,
        currentProgress,
        totalStepsSkipped: stepsSkipped.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[onboarding/skip-step] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
