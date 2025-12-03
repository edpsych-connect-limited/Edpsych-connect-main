/**
 * User Onboarding API
 * Handles onboarding progress tracking and completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/user/onboarding
// Get current onboarding status
// ============================================================================

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: {
        onboarding_completed: true,
        onboarding_step: true,
        onboarding_started_at: true,
        onboarding_completed_at: true,
        onboarding_skipped: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ onboarding: user });
  } catch (_error) {
    console.error('Failed to fetch onboarding status:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/user/onboarding
// Update onboarding progress
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { onboarding_step, onboarding_started_at } = data;

    const user = await prisma.users.update({
      where: { email: session.user.email },
      data: {
        onboarding_step: onboarding_step !== undefined ? onboarding_step : undefined,
        onboarding_started_at: onboarding_started_at ? new Date(onboarding_started_at) : undefined,
        updated_at: new Date(),
      },
      select: {
        onboarding_completed: true,
        onboarding_step: true,
        onboarding_started_at: true,
      },
    });

    return NextResponse.json({ success: true, onboarding: user });
  } catch (_error) {
    console.error('Failed to update onboarding progress:', _error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/user/onboarding
// Complete or skip onboarding
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      onboarding_completed,
      onboarding_completed_at,
      onboarding_skipped,
      // role,
      // organization_type,
      // primary_focus,
      // preferred_features,
      // experience_level,
      // goals,
    } = data;

    // Update user with onboarding completion and preferences
    const updateData: any = {
      updated_at: new Date(),
    };

    if (onboarding_completed) {
      updateData.onboarding_completed = true;
      updateData.onboarding_completed_at = onboarding_completed_at ? new Date(onboarding_completed_at) : new Date();
      updateData.onboarding_step = 5; // Completed all steps
    }

    if (onboarding_skipped) {
      updateData.onboarding_skipped = true;
    }

    // TODO: Store user preferences in a separate UserPreferences table
    // For now, we could store them in a JSON field if needed

    const user = await prisma.users.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        onboarding_completed: true,
        onboarding_step: true,
        onboarding_skipped: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: onboarding_skipped
        ? 'Onboarding skipped successfully'
        : 'Onboarding completed successfully',
      user,
    });
  } catch (_error) {
    console.error('Failed to complete onboarding:', _error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
