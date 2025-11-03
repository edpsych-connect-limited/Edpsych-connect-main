/**
 * FILE: src/app/api/onboarding/complete/route.ts
 * PURPOSE: Mark entire onboarding as complete
 *
 * ENDPOINT: POST /api/onboarding/complete
 * AUTH: Required (JWT)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-service';
import prisma from '@/lib/prismaSafe';

interface RequestBody {
  feedbackRating?: number; // 1-5
  feedbackComment?: string;
  nextAction?: string;
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
    const now = new Date();

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

    // Calculate stats
    const stepsCompleted = [
      progress.step_1_welcome_completed,
      !!progress.step_2_role_selected,
      progress.step_3_profile_completed,
      progress.step_4_features_viewed.length > 0,
      progress.step_5_first_case_created && progress.step_5_first_assessment_done && progress.step_5_first_goal_set,
      progress.step_6_certificate_viewed || progress.step_6_tour_completed
    ].filter(Boolean).length;

    const stepsSkipped = progress.steps_skipped.length;

    // Update onboarding_progress
    await prisma.onboarding_progress.update({
      where: { user_id: userId },
      data: {
        completed_at: now,
        updated_at: now
      }
    });

    // Update user
    await prisma.users.update({
      where: { id: userId },
      data: {
        onboarding_completed: true,
        onboarding_completed_at: now,
        onboarding_step: 6,
        updated_at: now
      }
    });

    console.log(`[onboarding/complete] User ${userId} completed onboarding`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Onboarding completed!',
        completedAt: now.toISOString(),
        totalTimeSpent: progress.total_time_spent_seconds,
        stepsCompleted,
        stepsSkipped,
        certificateUrl: `/api/onboarding/certificate/${userId}`,
        nextSteps: {
          recommended: body.nextAction || 'dashboard',
          actions: [
            { label: 'Go to Dashboard', url: '/dashboard', icon: 'Home' },
            { label: 'Start First Assessment', url: '/assessments/new', icon: 'Brain' },
            { label: 'Browse Interventions', url: '/interventions/library', icon: 'Target' },
            { label: 'View Training Courses', url: '/training/marketplace', icon: 'GraduationCap' }
          ]
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[onboarding/complete] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
