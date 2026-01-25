/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomInt } from 'crypto';
import { checkRateLimit, createRateLimitHeaders, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { getRedisClient } from '@/cache/redis-client';
import { EmailService } from '@/lib/email/email-service';

export const dynamic = 'force-dynamic';

const MfaResendSchema = z.object({
  token: z.string().min(10, 'Token is required'),
});

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.MFA_RESEND);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json();
    const validation = MfaResendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token } = validation.data;
    const redis = getRedisClient();
    const payload = await redis.get(`mfa:login:${token}`);

    if (!payload) {
      return NextResponse.json(
        { error: 'MFA session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    const stored = JSON.parse(payload) as {
      userId: number;
      email: string;
      role: string;
      tenantId: number;
      code: string;
      createdAt: string;
    };

    const mfaCode = randomInt(100000, 999999).toString();
    await redis.set(
      `mfa:login:${token}`,
      JSON.stringify({
        ...stored,
        code: mfaCode,
        createdAt: new Date().toISOString(),
      }),
      5 * 60
    );

    await redis.del(`mfa:login:${token}:attempts`);

    const emailService = EmailService.getInstance();
    const delivered = await emailService.sendMfaCodeEmail(stored.email, mfaCode);

    if (!delivered) {
      return NextResponse.json(
        { error: 'MFA delivery failed. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code resent',
      data: {
        mfaExpiresIn: 5 * 60,
      },
    });
  } catch (_error) {
    console.error('MFA resend error', _error);
    return NextResponse.json(
      { error: 'Failed to resend MFA code' },
      { status: 500 }
    );
  }
}
