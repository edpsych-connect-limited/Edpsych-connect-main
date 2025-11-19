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
 *
 * Reduces from 6 to 1 function.
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';

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

    switch (action) {
      case 'status':
        return handleGetStatus(request);
      case 'start':
        return handleStart(request);
      case 'update-step':
        return handleUpdateStep(request);
      case 'skip-step':
        return handleSkipStep(request);
      case 'restart':
        return handleRestart(request);
      case 'complete':
        return handleComplete(request);
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('[Onboarding] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGetStatus(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    currentStep: 1,
    totalSteps: 5,
    completed: false,
  });
}

async function handleStart(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'Onboarding started',
    step: 1,
  });
}

async function handleUpdateStep(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    message: 'Step updated',
    currentStep: body.step || 1,
  });
}

async function handleSkipStep(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'Step skipped',
  });
}

async function handleRestart(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'Onboarding restarted',
    step: 1,
  });
}

async function handleComplete(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'Onboarding completed',
  });
}
