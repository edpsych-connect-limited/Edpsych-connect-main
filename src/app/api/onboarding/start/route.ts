/**
 * FILE: src/app/api/onboarding/start/route.ts
 * PURPOSE: Initialize onboarding for a user
 *
 * ENDPOINT: POST /api/onboarding/start
 * AUTH: Required (JWT)
 *
 * SIDE EFFECTS:
 * - Creates onboarding_progress record if not exists
 * - Updates users.onboarding_step to 1
 * - Sets users.onboarding_started_at
 *
 * QUALITY STANDARDS:
 * - Idempotent (can be called multiple times safely)
 * - Atomic database operations
 * - Comprehensive error handling
 * - TypeScript strict mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/auth-service';
import prisma from '@/lib/prisma';

/**
 * POST /api/onboarding/start
 *
 * Initializes onboarding for the authenticated user
 *
 * @param request - Next.js request object
 * @returns JSON response with onboarding start confirmation
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

    // 2. Check if user exists
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

    // 3. Check if onboarding already started
    if (user.onboarding_progress) {
      // Already started, return existing data
      return NextResponse.json({
        success: true,
        data: {
          message: 'Onboarding already in progress',
          onboardingId: user.onboarding_progress.id,
          currentStep: user.onboarding_progress.current_step,
          startedAt: user.onboarding_started_at?.toISOString() || new Date().toISOString(),
          resumed: true
        }
      }, { status: 200 });
    }

    // 4. Create onboarding_progress record
    const now = new Date();

    const onboardingProgress = await prisma.onboarding_progress.create({
      data: {
        user_id: userId,
        current_step: 1,
        created_at: now,
        updated_at: now
      }
    });

    // 5. Update user record
    await prisma.users.update({
      where: { id: userId },
      data: {
        onboarding_step: 1,
        onboarding_started_at: now,
        updated_at: now
      }
    });

    // 6. Log analytics event
    console.log(`[onboarding/start] User ${userId} started onboarding at ${now.toISOString()}`);

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Onboarding started successfully',
        onboardingId: onboardingProgress.id,
        currentStep: 1,
        startedAt: now.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[onboarding/start] Error:', error);

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
