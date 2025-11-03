/**
 * FILE: src/app/api/onboarding/status/route.ts
 * PURPOSE: Get current onboarding status for logged-in user
 *
 * ENDPOINT: GET /api/onboarding/status
 * AUTH: Required (JWT)
 *
 * RETURNS:
 * - Current onboarding step
 * - Completion status for each step
 * - Progress percentage
 * - Time tracking data
 * - Resume capability
 *
 * QUALITY STANDARDS:
 * - Server-side authentication validation
 * - Database query optimization
 * - Error handling (4xx, 5xx)
 * - TypeScript strict mode
 * - Comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';

/**
 * GET /api/onboarding/status
 *
 * Retrieves the current onboarding status for the authenticated user
 *
 * @param request - Next.js request object
 * @returns JSON response with onboarding status or error
 */
export async function GET(request: NextRequest) {
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

    // 2. Fetch user with onboarding data
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        onboarding_progress: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Prepare response data
    const onboardingData = user.onboarding_progress;

    // Calculate steps completed
    const stepsCompleted: number[] = [];
    if (onboardingData?.step_1_welcome_completed) stepsCompleted.push(1);
    if (onboardingData?.step_2_role_selected) stepsCompleted.push(2);
    if (onboardingData?.step_3_profile_completed) stepsCompleted.push(3);
    if (onboardingData?.step_4_features_viewed && onboardingData.step_4_features_viewed.length > 0) stepsCompleted.push(4);
    if (onboardingData?.step_5_first_case_created || onboardingData?.step_5_first_assessment_done || onboardingData?.step_5_first_goal_set) stepsCompleted.push(5);
    if (onboardingData?.step_6_certificate_viewed || onboardingData?.step_6_tour_completed) stepsCompleted.push(6);

    // Calculate progress percentage
    const progressPercentage = Math.round((stepsCompleted.length / 6) * 100);

    // 4. Build response
    const response = {
      success: true,
      data: {
        userId: user.id,
        onboardingCompleted: user.onboarding_completed,
        currentStep: onboardingData?.current_step || 1,
        stepsCompleted,
        progressPercentage,
        progress: {
          step1: {
            completed: onboardingData?.step_1_welcome_completed || false,
            completedAt: onboardingData?.step_1_completed_at || null
          },
          step2: {
            completed: !!onboardingData?.step_2_role_selected,
            role: onboardingData?.step_2_role_selected || null,
            completedAt: onboardingData?.step_2_completed_at || null
          },
          step3: {
            completed: onboardingData?.step_3_profile_completed || false,
            photoUploaded: onboardingData?.step_3_photo_uploaded || false,
            hcpcProvided: onboardingData?.step_3_hcpc_provided || false,
            organizationProvided: onboardingData?.step_3_organization_provided || false,
            completedAt: onboardingData?.step_3_completed_at || null
          },
          step4: {
            completed: onboardingData?.step_4_features_viewed && onboardingData.step_4_features_viewed.length >= 3,
            featuresViewed: onboardingData?.step_4_features_viewed || [],
            demosTried: onboardingData?.step_4_demos_tried || [],
            completedAt: onboardingData?.step_4_completed_at || null
          },
          step5: {
            completed: onboardingData?.step_5_first_case_created && onboardingData?.step_5_first_assessment_done && onboardingData?.step_5_first_goal_set,
            caseCreated: onboardingData?.step_5_first_case_created || false,
            assessmentDone: onboardingData?.step_5_first_assessment_done || false,
            goalSet: onboardingData?.step_5_first_goal_set || false,
            completedAt: onboardingData?.step_5_completed_at || null
          },
          step6: {
            completed: onboardingData?.step_6_certificate_viewed || onboardingData?.step_6_tour_completed,
            certificateViewed: onboardingData?.step_6_certificate_viewed || false,
            tourCompleted: onboardingData?.step_6_tour_completed || false,
            callBooked: onboardingData?.step_6_call_booked || false,
            completedAt: onboardingData?.step_6_completed_at || null
          }
        },
        totalTimeSpentSeconds: onboardingData?.total_time_spent_seconds || 0,
        canResume: !!onboardingData && !user.onboarding_completed,
        stepsSkipped: onboardingData?.steps_skipped || [],
        timesRestarted: onboardingData?.times_restarted || 0
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[onboarding/status] Error:', error);

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
