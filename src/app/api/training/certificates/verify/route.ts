/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * Certificate verification endpoint.
 * Looks up a CPD certificate by verification code.
 *
 * TODO: When CPD certificate issuance is implemented, query the database here.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code || !code.trim()) {
    return NextResponse.json(
      { valid: false, error: 'Verification code is required.' },
      { status: 400 }
    );
  }

  // Certificate issuance not yet implemented — no certificates exist in the system.
  return NextResponse.json(
    { valid: false, error: 'Certificate not found. Please check the verification code and try again.' },
    { status: 404 }
  );
}
