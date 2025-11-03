/**
 * FILE: src/app/api/onboarding/restart/route.ts
 * PURPOSE: Restart onboarding flow (for users who want to revisit)
 *
 * ENDPOINT: POST /api/onboarding/restart
 * AUTH: Required (JWT)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-service';
import prisma from '@/lib/prismaSafe';

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
    const now = new Date();

    // Fetch user with onboarding progress
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { onboarding_progress: true }
    });

    if (!user || !user.onboarding_progress) {
      return NextResponse.json(
        { success: false, error: 'Onboarding not found. Call /api/onboarding/start first' },
        { status: 404 }
      );
    }

    const progress = user.onboarding_progress;

    // Update database - reset to step 1 but preserve previous data for analytics
    await prisma.onboarding_progress.update({
      where: { user_id: userId },
      data: {
        current_step: 1,
        times_restarted: progress.times_restarted + 1,
        updated_at: now
      }
    });

    // Update user
    await prisma.users.update({
      where: { id: userId },
      data: {
        onboarding_step: 1,
        onboarding_completed: false, // Allow them to complete again
        updated_at: now
      }
    });

    // Log analytics
    console.log(`[onboarding/restart] User ${userId} restarted onboarding. Times restarted: ${progress.times_restarted + 1}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Onboarding restarted',
        currentStep: 1,
        timesRestarted: progress.times_restarted + 1,
        previousProgress: {
          stepsCompleted: [
            progress.step_1_welcome_completed,
            !!progress.step_2_role_selected,
            progress.step_3_profile_completed,
            progress.step_4_features_viewed.length > 0,
            progress.step_5_first_case_created && progress.step_5_first_assessment_done && progress.step_5_first_goal_set,
            progress.step_6_certificate_viewed || progress.step_6_tour_completed
          ].filter(Boolean).length,
          timeSpent: progress.total_time_spent_seconds
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[onboarding/restart] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
