/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { checkRateLimit, createRateLimitHeaders, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { getRedisClient } from '@/cache/redis-client';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';

export const dynamic = 'force-dynamic';

const MfaVerifySchema = z.object({
  token: z.string().min(10, 'Token is required'),
  code: z.string().regex(/^\d{6}$/, 'Invalid code'),
});

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.MFA_VERIFY);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json();
    const validation = MfaVerifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token, code } = validation.data;
    const redis = getRedisClient();
    const payload = await redis.get(`mfa:login:${token}`);

    if (!payload) {
      return NextResponse.json(
        { error: 'MFA session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    const attemptKey = `mfa:login:${token}:attempts`;
    const attemptRaw = await redis.get(attemptKey);
    const attempts = attemptRaw ? parseInt(attemptRaw, 10) : 0;

    if (attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts. Please sign in again.' },
        { status: 429 }
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

    if (stored.code !== code) {
      await redis.set(attemptKey, String(attempts + 1), 5 * 60);
      return NextResponse.json(
        { error: 'Invalid verification code.' },
        { status: 401 }
      );
    }

    await redis.del(`mfa:login:${token}`);
    await redis.del(attemptKey);

    const user = await prisma.users.findUnique({
      where: { id: stored.userId },
      include: {
        tenants: true,
        professionals: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('NEXTAUTH_SECRET is not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const accessToken = jwt.sign(
      {
        id: user.id.toString(),
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenant_id,
        tenantId: user.tenant_id,
        permissions: user.permissions,
      },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    AuditLogger.log({
      userId: user.id,
      tenantId: user.tenant_id,
      action: 'LOGIN',
      resource: 'auth',
      details: { method: 'password+mfa' },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || undefined,
    });

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      tenantId: user.tenant_id,
      tenant: {
        id: user.tenants.id,
        name: user.tenants.name,
        subdomain: user.tenants.subdomain,
        tenantType: user.tenants.tenant_type,
      },
      isEmailVerified: user.isEmailVerified,
      onboardingCompleted: user.onboarding_completed,
      onboardingSkipped: user.onboarding_skipped,
      professional: user.professionals
        ? {
            id: user.professionals.id,
            type: user.professionals.professional_type,
            specialisation: user.professionals.specialisation,
            qualifications: user.professionals.qualifications,
          }
        : null,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });

    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    if (user.tenant_id) {
      await recordEvidenceEvent({
        tenantId: user.tenant_id,
        userId: user.id,
        traceId,
        requestId: traceId,
        eventType: 'auth_login',
        workflowType: 'auth',
        actionType: 'login',
        status: 'ok',
        durationMs: Date.now() - startedAt,
        evidenceType: 'measured',
        metadata: {
          mfa: true,
          role: user.role,
        },
      });
    }

    return response;
  } catch (_error) {
    console.error('MFA verification error', _error);
    return NextResponse.json(
      { error: 'Failed to verify MFA code' },
      { status: 500 }
    );
  }
}
