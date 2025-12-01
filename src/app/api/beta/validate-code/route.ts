/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIP, RATE_LIMITS, createRateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/beta/validate-code
 * Validate a beta access code
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.BETA_CODE);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { valid: false, error: 'Too many attempts. Please try again later.' },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Beta code is required' },
        { status: 400 }
      );
    }

    // Check database for valid code
    const betaCode = await prisma.betaAccessCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    // Fallback hardcoded codes for backwards compatibility
    const fallbackCodes = ['BETA2025', 'EDPSYCH-BETA', 'FOUNDER-ACCESS', 'EP-BETA-UK'];

    if (!betaCode) {
      // Check fallback codes
      if (fallbackCodes.includes(code.toUpperCase())) {
        return NextResponse.json({
          valid: true,
          code: code.toUpperCase(),
          type: 'fallback',
          message: 'Beta code validated (legacy)',
        });
      }

      return NextResponse.json(
        { valid: false, error: 'Invalid beta access code' },
        { status: 404 }
      );
    }

    // Check if expired
    if (betaCode.expiresAt && new Date() > betaCode.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'This beta code has expired' },
        { status: 410 }
      );
    }

    // Check if uses exhausted
    if (betaCode.maxUses > 0 && betaCode.current_uses >= betaCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: 'This beta code has reached its usage limit' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: betaCode.code,
      type: 'database',
      features: betaCode.features,
      role: betaCode.role,
      message: 'Beta code validated successfully',
    });
  } catch (_error) {
    console.error('Beta code validation error:', _error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate beta code' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/beta/validate-code
 * Record beta code usage after successful login
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, email } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Beta code is required' },
        { status: 400 }
      );
    }

    // Find and update the beta code
    const betaCode = await prisma.betaAccessCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!betaCode) {
      // Fallback codes don't need database tracking
      return NextResponse.json({
        success: true,
        message: 'Legacy code usage recorded',
      });
    }

    // Update usage count
    await prisma.betaAccessCode.update({
      where: { code: code.toUpperCase() },
      data: {
        current_uses: { increment: 1 },
        remainingUses: { decrement: 1 },
        usedBy: email || userId || 'anonymous',
        usedAt: new Date(),
      },
    });

    // Record usage in audit log
    await prisma.betaAccessCodeUsage.create({
      data: {
        accessCodeId: betaCode.id,
        userId: userId?.toString(),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { email },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Beta code usage recorded',
      remainingUses: betaCode.remainingUses - 1,
    });
  } catch (_error) {
    console.error('Beta code usage recording error:', _error);
    return NextResponse.json(
      { success: false, error: 'Failed to record usage' },
      { status: 500 }
    );
  }
}
