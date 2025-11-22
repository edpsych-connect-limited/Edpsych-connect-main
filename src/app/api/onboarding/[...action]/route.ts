/**
 * Consolidated Onboarding API Routes
 * 
 * Consolidates all onboarding endpoints:
 * - GET /api/onboarding/status - get current step
 * - POST /api/onboarding/start - start onboarding
 * - POST /api/onboarding/update-step - update step
 * - POST /api/onboarding/skip-step - skip step
 * - POST /api/onboarding/restart - restart flow
 * - POST /api/onboarding/complete - complete onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return routeOnboardingRequest(request);
}

export async function POST(request: NextRequest) {
  return routeOnboardingRequest(request);
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

async function routeOnboardingRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/').filter(Boolean).slice(2);
    const action = segments[0];

    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.id);

    switch (action) {
      case 'status':
        return handleGetStatus(userId);
      case 'start':
        return handleStart(userId);
      case 'update-step':
        return handleUpdateStep(request, userId);
      case 'skip-step':
        return handleSkipStep(request, userId);
      case 'restart':
        return handleRestart(userId);
      case 'complete':
        return handleComplete(request, userId);
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('[Onboarding] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGetStatus(userId: number): Promise<NextResponse> {
  const progress = await prisma.onboarding_progress.findUnique({
    where: { user_id: userId },
  });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { onboarding_completed: true }
  });

  if (!progress) {
    return NextResponse.json({
      success: true,
      data: {
        userId,
        onboardingCompleted: user?.onboarding_completed || false,
        currentStep: 1,
        stepsCompleted: [],
        stepsSkipped: [],
        progressPercentage: 0,
        progress: {
          step1: { completed: false, completedAt: null },
          step2: { completed: false, completedAt: null, role: null },
          step3: { completed: false, completedAt: null, photoUploaded: false, hcpcProvided: false, organizationProvided: false },
          step4: { completed: false, completedAt: null, featuresViewed: [], demosTried: [] },
          step5: { completed: false, completedAt: null, caseCreated: false, assessmentDone: false, goalSet: false },
          step6: { completed: false, completedAt: null, certificateViewed: false, tourCompleted: false, callBooked: false },
        },
        totalTimeSpentSeconds: 0,
        canResume: false,
        timesRestarted: 0,
      }
    });
  }

  // Map database model to API response
  const stepsCompleted: number[] = [];
  if (progress.step_1_welcome_completed) stepsCompleted.push(1);
  if (progress.step_2_role_selected) stepsCompleted.push(2); // Assuming selection means completion
  if (progress.step_3_profile_completed) stepsCompleted.push(3);
  if (progress.step_4_completed_at) stepsCompleted.push(4);
  if (progress.step_5_completed_at) stepsCompleted.push(5);
  if (progress.step_6_completed_at) stepsCompleted.push(6);

  return NextResponse.json({
    success: true,
    data: {
      userId,
      onboardingCompleted: user?.onboarding_completed || false,
      currentStep: progress.current_step,
      stepsCompleted,
      stepsSkipped: progress.steps_skipped,
      progressPercentage: Math.round((stepsCompleted.length / 6) * 100),
      progress: {
        step1: { 
          completed: progress.step_1_welcome_completed, 
          completedAt: progress.step_1_completed_at?.toISOString() || null 
        },
        step2: { 
          completed: !!progress.step_2_role_selected, 
          completedAt: progress.step_2_completed_at?.toISOString() || null,
          role: progress.step_2_role_selected 
        },
        step3: { 
          completed: progress.step_3_profile_completed, 
          completedAt: progress.step_3_completed_at?.toISOString() || null,
          photoUploaded: progress.step_3_photo_uploaded,
          hcpcProvided: progress.step_3_hcpc_provided,
          organizationProvided: progress.step_3_organization_provided
        },
        step4: { 
          completed: !!progress.step_4_completed_at, 
          completedAt: progress.step_4_completed_at?.toISOString() || null,
          featuresViewed: progress.step_4_features_viewed,
          demosTried: progress.step_4_demos_tried
        },
        step5: { 
          completed: !!progress.step_5_completed_at, 
          completedAt: progress.step_5_completed_at?.toISOString() || null,
          caseCreated: progress.step_5_first_case_created,
          assessmentDone: progress.step_5_first_assessment_done,
          goalSet: progress.step_5_first_goal_set
        },
        step6: { 
          completed: !!progress.step_6_completed_at, 
          completedAt: progress.step_6_completed_at?.toISOString() || null,
          certificateViewed: progress.step_6_certificate_viewed,
          tourCompleted: progress.step_6_tour_completed,
          callBooked: progress.step_6_call_booked
        },
      },
      totalTimeSpentSeconds: progress.total_time_spent_seconds,
      canResume: true,
      timesRestarted: progress.times_restarted,
    }
  });
}

async function handleStart(userId: number): Promise<NextResponse> {
  // Check if exists
  const existing = await prisma.onboarding_progress.findUnique({
    where: { user_id: userId }
  });

  if (!existing) {
    await prisma.onboarding_progress.create({
      data: {
        user_id: userId,
        current_step: 1,
      }
    });

    await prisma.users.update({
      where: { id: userId },
      data: { onboarding_started_at: new Date() }
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      message: 'Onboarding started',
      currentStep: existing ? existing.current_step : 1,
    }
  });
}

async function handleUpdateStep(request: NextRequest, userId: number): Promise<NextResponse> {
  const body = await request.json();
  const { step, data, completed, timeSpentSeconds } = body;

  // Prepare update data
  const updateData: any = {
    total_time_spent_seconds: { increment: timeSpentSeconds || 0 },
    updated_at: new Date(),
  };

  if (completed) {
    updateData.current_step = Math.min(step + 1, 6);
  }

  // Map step-specific data
  switch (step) {
    case 1:
      if (data.videoWatched) updateData.video_watched = true;
      if (data.videoWatchPercentage) updateData.video_watch_percentage = data.videoWatchPercentage;
      if (completed) {
        updateData.step_1_welcome_completed = true;
        updateData.step_1_completed_at = new Date();
      }
      break;
    case 2:
      if (data.roleSelected) updateData.step_2_role_selected = data.roleSelected;
      if (completed) {
        updateData.step_2_completed_at = new Date();
      }
      break;
    case 3:
      if (data.photoUploaded) updateData.step_3_photo_uploaded = true;
      if (data.hcpcProvided) updateData.step_3_hcpc_provided = true;
      if (data.organizationProvided) updateData.step_3_organization_provided = true;
      if (completed) {
        updateData.step_3_profile_completed = true;
        updateData.step_3_completed_at = new Date();
      }
      break;
    case 4:
      // For arrays, we need to fetch first or use push if supported (Prisma push is atomic)
      // But here we might just replace or append logic needs to be careful.
      // Prisma supports push for string arrays.
      if (data.featureViewed) {
        updateData.step_4_features_viewed = { push: data.featureViewed };
      }
      if (data.demoTried) {
        updateData.step_4_demos_tried = { push: data.demoTried };
      }
      if (completed) {
        updateData.step_4_completed_at = new Date();
      }
      break;
    case 5:
      if (data.caseCreated) updateData.step_5_first_case_created = true;
      if (data.assessmentDone) updateData.step_5_first_assessment_done = true;
      if (data.goalSet) updateData.step_5_first_goal_set = true;
      if (completed) {
        updateData.step_5_completed_at = new Date();
      }
      break;
    case 6:
      if (data.certificateViewed) updateData.step_6_certificate_viewed = true;
      if (data.tourCompleted) updateData.step_6_tour_completed = true;
      if (data.callBooked) updateData.step_6_call_booked = true;
      if (completed) {
        updateData.step_6_completed_at = new Date();
      }
      break;
  }

  const updated = await prisma.onboarding_progress.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      current_step: 1,
      ...updateData
    },
    update: updateData
  });

  return NextResponse.json({
    success: true,
    data: {
      message: 'Step updated',
      currentStep: updated.current_step,
      nextStep: completed ? Math.min(step + 1, 6) : null,
    }
  });
}

async function handleSkipStep(request: NextRequest, userId: number): Promise<NextResponse> {
  const body = await request.json();
  const { step } = body;

  const updated = await prisma.onboarding_progress.update({
    where: { user_id: userId },
    data: {
      steps_skipped: { push: step },
      current_step: Math.min(step + 1, 6),
      updated_at: new Date(),
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      message: 'Step skipped',
      nextStep: updated.current_step,
    }
  });
}

async function handleRestart(userId: number): Promise<NextResponse> {
  // Reset progress but keep some history if needed
  // For now, we'll just reset the flags and current step
  await prisma.onboarding_progress.update({
    where: { user_id: userId },
    data: {
      current_step: 1,
      step_1_welcome_completed: false,
      step_2_role_selected: null,
      step_3_profile_completed: false,
      step_4_features_viewed: [],
      step_5_first_case_created: false,
      step_5_first_assessment_done: false,
      step_5_first_goal_set: false,
      step_6_certificate_viewed: false,
      times_restarted: { increment: 1 },
      updated_at: new Date(),
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      message: 'Onboarding restarted',
      currentStep: 1,
    }
  });
}

async function handleComplete(request: NextRequest, userId: number): Promise<NextResponse> {
  // Mark user as completed
  await prisma.users.update({
    where: { id: userId },
    data: {
      onboarding_completed: true,
      onboarding_completed_at: new Date(),
      onboarding_step: 6
    }
  });

  await prisma.onboarding_progress.update({
    where: { user_id: userId },
    data: {
      completed_at: new Date(),
      current_step: 6, // Ensure it stays at end
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      message: 'Onboarding completed',
    }
  });
}
