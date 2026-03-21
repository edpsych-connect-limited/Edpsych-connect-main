/**
 * Legacy onboarding endpoint.
 *
 * Phase 1 corridor uses the consolidated `/api/onboarding/[...action]` backend.
 * This route is intentionally quarantined to prevent session drift and duplicate logic.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEPRECATION_MESSAGE = 'Deprecated onboarding endpoint. Use /api/onboarding/[action] for Phase 1 onboarding flows.';

function deprecatedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: DEPRECATION_MESSAGE,
    },
    { status: 410 }
  );
}

export async function GET(_request: NextRequest) {
  return deprecatedResponse();
}

export async function PUT(_request: NextRequest) {
  return deprecatedResponse();
}

export async function POST(_request: NextRequest) {
  return deprecatedResponse();
}
