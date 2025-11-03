/**
 * FILE: src/app/api/onboarding/update-step/route.ts
 * PURPOSE: Update progress for a specific onboarding step
 *
 * ENDPOINT: POST /api/onboarding/update-step
 * AUTH: Required (JWT)
 *
 * REQUEST BODY:
 * {
 *   step: 1-6,
 *   data: { step-specific data },
 *   completed?: boolean,
 *   timeSpentSeconds?: number
 * }
 *
 * QUALITY STANDARDS:
 * - Validates step number (1-6)
 * - Step-specific data validation
 * - Atomic database updates
 * - Progress tracking
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';

interface UpdateStepData {
  // Step 1 (Welcome)
  videoWatched?: boolean;
  videoWatchPercentage?: number;

  // Step 2 (Role Selection)
  roleSelected?: string;

  // Step 3 (Profile Setup)
  photoUploaded?: boolean;
  hcpcProvided?: boolean;
  organizationProvided?: boolean;

  // Step 4 (Feature Tour)
  featureViewed?: string;
  demoTried?: string;

  // Step 5 (Quick Wins)
  caseCreated?: boolean;
  assessmentDone?: boolean;
  goalSet?: boolean;

  // Step 6 (Completion)
  certificateViewed?: boolean;
  tourCompleted?: boolean;
  callBooked?: boolean;
}

interface RequestBody {
  step: number;
  data: UpdateStepData;
  completed?: boolean;
  timeSpentSeconds?: number;
}

/**
 * Validates step number
 */
function validateStep(step: number): boolean {
  return Number.isInteger(step) && step >= 1 && step <= 6;
}

/**
 * Calculates next step number
 */
function getNextStep(currentStep: number, completed: boolean): number | null {
  if (!completed) return null;
  return currentStep < 6 ? currentStep + 1 : null;
}

/**
 * Calculates overall progress percentage
 */
function calculateProgress(stepsCompleted: number[]): number {
  return Math.round((stepsCompleted.length / 6) * 100);
}

/**
 * POST /api/onboarding/update-step
 *
 * Updates progress for a specific onboarding step
 *
 * @param request - Next.js request object with update data
 * @returns JSON response with updated progress
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await verifyAuth(request);

    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // 2. Parse request body
    const body: RequestBody = await request.json();
    const { step, data, completed = false, timeSpentSeconds = 0 } = body;

    // 3. Validate step number
    if (!validateStep(step)) {
      return NextResponse.json(
        { success: false, error: 'Invalid step number. Must be 1-6' },
        { status: 400 }
      );
    }

    // 4. Fetch user with onboarding progress
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { onboarding_progress: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.onboarding_progress) {
      return NextResponse.json(
        { success: false, error: 'Onboarding not started. Call /api/onboarding/start first' },
        { status: 400 }
      );
    }

    const progress = user.onboarding_progress;
    const now = new Date();

    // 5. Build update data based on step
    const updateData: any = {
      updated_at: now,
      total_time_spent_seconds: progress.total_time_spent_seconds + timeSpentSeconds
    };

    // Update time_per_step JSON
    const timePerStep = (progress.time_per_step as any) || {};
    timePerStep[step.toString()] = (timePerStep[step.toString()] || 0) + timeSpentSeconds;
    updateData.time_per_step = timePerStep;

    // Step-specific updates
    switch (step) {
      case 1:
        if (data.videoWatched !== undefined) {
          updateData.video_watched = data.videoWatched;
        }
        if (data.videoWatchPercentage !== undefined) {
          updateData.video_watch_percentage = Math.max(
            progress.video_watch_percentage,
            data.videoWatchPercentage
          );
        }
        if (completed) {
          updateData.step_1_welcome_completed = true;
          updateData.step_1_completed_at = now;
          updateData.current_step = 2;
        }
        break;

      case 2:
        if (data.roleSelected) {
          updateData.step_2_role_selected = data.roleSelected;
        }
        if (completed) {
          if (!updateData.step_2_role_selected && !progress.step_2_role_selected) {
            return NextResponse.json(
              { success: false, error: 'Role must be selected before completing step 2' },
              { status: 400 }
            );
          }
          updateData.step_2_completed_at = now;
          updateData.current_step = 3;
        }
        break;

      case 3:
        if (data.photoUploaded !== undefined) {
          updateData.step_3_photo_uploaded = data.photoUploaded;
        }
        if (data.hcpcProvided !== undefined) {
          updateData.step_3_hcpc_provided = data.hcpcProvided;
        }
        if (data.organizationProvided !== undefined) {
          updateData.step_3_organization_provided = data.organizationProvided;
        }
        if (completed) {
          updateData.step_3_profile_completed = true;
          updateData.step_3_completed_at = now;
          updateData.current_step = 4;
        }
        break;

      case 4:
        if (data.featureViewed) {
          const featuresViewed = [...(progress.step_4_features_viewed || [])];
          if (!featuresViewed.includes(data.featureViewed)) {
            featuresViewed.push(data.featureViewed);
          }
          updateData.step_4_features_viewed = featuresViewed;
        }
        if (data.demoTried) {
          const demosTried = [...(progress.step_4_demos_tried || [])];
          if (!demosTried.includes(data.demoTried)) {
            demosTried.push(data.demoTried);
          }
          updateData.step_4_demos_tried = demosTried;
        }
        if (completed) {
          const featuresViewed = updateData.step_4_features_viewed || progress.step_4_features_viewed || [];
          if (featuresViewed.length < 1) {
            return NextResponse.json(
              { success: false, error: 'At least 1 feature must be viewed before completing step 4' },
              { status: 400 }
            );
          }
          updateData.step_4_completed_at = now;
          updateData.current_step = 5;
        }
        break;

      case 5:
        if (data.caseCreated !== undefined) {
          updateData.step_5_first_case_created = data.caseCreated;
        }
        if (data.assessmentDone !== undefined) {
          updateData.step_5_first_assessment_done = data.assessmentDone;
        }
        if (data.goalSet !== undefined) {
          updateData.step_5_first_goal_set = data.goalSet;
        }
        if (completed) {
          const caseCreated = updateData.step_5_first_case_created ?? progress.step_5_first_case_created;
          const assessmentDone = updateData.step_5_first_assessment_done ?? progress.step_5_first_assessment_done;
          const goalSet = updateData.step_5_first_goal_set ?? progress.step_5_first_goal_set;

          if (!(caseCreated && assessmentDone && goalSet)) {
            return NextResponse.json(
              { success: false, error: 'All 3 quick wins must be completed before completing step 5' },
              { status: 400 }
            );
          }
          updateData.step_5_completed_at = now;
          updateData.current_step = 6;
        }
        break;

      case 6:
        if (data.certificateViewed !== undefined) {
          updateData.step_6_certificate_viewed = data.certificateViewed;
        }
        if (data.tourCompleted !== undefined) {
          updateData.step_6_tour_completed = data.tourCompleted;
        }
        if (data.callBooked !== undefined) {
          updateData.step_6_call_booked = data.callBooked;
        }
        if (completed) {
          updateData.step_6_completed_at = now;
          updateData.completed_at = now;
          // Don't advance current_step beyond 6
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid step number' },
          { status: 400 }
        );
    }

    // 6. Update database
    const updatedProgress = await prisma.onboarding_progress.update({
      where: { user_id: userId },
      data: updateData
    });

    // 7. Update user record if step completed
    if (completed) {
      await prisma.users.update({
        where: { id: userId },
        data: {
          onboarding_step: updateData.current_step || progress.current_step,
          updated_at: now
        }
      });
    }

    // 8. Calculate response data
    const nextStep = getNextStep(step, completed);
    const stepsCompleted: number[] = [];

    if (updatedProgress.step_1_welcome_completed) stepsCompleted.push(1);
    if (updatedProgress.step_2_role_selected) stepsCompleted.push(2);
    if (updatedProgress.step_3_profile_completed) stepsCompleted.push(3);
    if (updatedProgress.step_4_features_viewed.length > 0) stepsCompleted.push(4);
    if (updatedProgress.step_5_first_case_created && updatedProgress.step_5_first_assessment_done && updatedProgress.step_5_first_goal_set) stepsCompleted.push(5);
    if (updatedProgress.step_6_certificate_viewed || updatedProgress.step_6_tour_completed) stepsCompleted.push(6);

    const overallProgress = calculateProgress(stepsCompleted);

    // 9. Log analytics event
    console.log(`[onboarding/update-step] User ${userId} updated step ${step}. Completed: ${completed}`);

    // 10. Return success response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Step updated successfully',
        currentStep: updatedProgress.current_step,
        stepCompleted: completed,
        nextStep,
        overallProgress,
        stepsCompleted
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[onboarding/update-step] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
