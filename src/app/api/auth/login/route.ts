/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomInt, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { checkRateLimit, getClientIP, RATE_LIMITS, createRateLimitHeaders } from '@/lib/rate-limit';
import { createEvidenceTraceId, recordEvidenceEvent } from '@/lib/analytics/evidence-telemetry';
import { getRedisClient } from '@/cache/redis-client';
import { EmailService } from '@/lib/email/email-service';
import { normalizeRole, normalizeTenantId } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';


const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const PRIVILEGED_ROLES = new Set([
  'SYSTEM_ADMIN',
  'SUPER_ADMIN',
  'SUPERADMIN',
  'ADMIN',
  'INSTITUTION_ADMIN',
  'DEPARTMENT_MANAGER',
  'LA_ADMIN',
  'LA_MANAGER',
]);

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const traceId = createEvidenceTraceId();
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.LOGIN);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    console.log('[DEBUG] Login attempt:', email);

    // Find user with tenant information
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenants: true,
        professionals: true,
      },
    });

    console.log('[DEBUG] User found:', user ? 'yes' : 'no');

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      console.log('[DEBUG] User inactive');
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('[DEBUG] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const rawNormalizedRole = (user.role || '').toUpperCase();
    const canonicalRole = normalizeRole(user.role);

    if (!canonicalRole) {
      return NextResponse.json(
        { error: 'Unsupported role for Phase 1 corridor' },
        { status: 403 }
      );
    }

    const requiresMfa = PRIVILEGED_ROLES.has(rawNormalizedRole);

    if (requiresMfa) {
      const mfaCode = randomInt(100000, 999999).toString();
      const mfaToken = randomUUID();
      const redis = getRedisClient();

      await redis.set(
        `mfa:login:${mfaToken}`,
        JSON.stringify({
          userId: user.id,
          email: user.email,
          role: canonicalRole,
          tenantId: normalizeTenantId(user.tenant_id),
          tenant_id: normalizeTenantId(user.tenant_id),
          code: mfaCode,
          createdAt: new Date().toISOString(),
        }),
        5 * 60
      );

      const emailService = EmailService.getInstance();
      const delivered = await emailService.sendMfaCodeEmail(user.email, mfaCode);

      if (!delivered) {
        return NextResponse.json(
          { error: 'MFA delivery failed. Please contact support.' },
          { status: 500 }
        );
      }

      AuditLogger.log({
        userId: user.id,
        tenantId: user.tenant_id,
        action: 'MFA_CHALLENGE',
        resource: 'auth',
        details: { method: 'email-otp' },
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({
        success: true,
        message: 'MFA required',
        data: {
          mfaRequired: true,
          mfaToken,
          mfaExpiresIn: 5 * 60,
        },
      });
    }

    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('NEXTAUTH_SECRET is not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Create JWT token
    const accessToken = jwt.sign(
      {
        id: user.id.toString(), // Changed from userId to id to match authService
        userId: user.id, // Keep for backward compatibility
        email: user.email,
        name: user.name,
        role: canonicalRole,
        tenant_id: normalizeTenantId(user.tenant_id),
        tenantId: normalizeTenantId(user.tenant_id),
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

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Log audit event
    AuditLogger.log({
      userId: user.id,
      tenantId: user.tenant_id,
      action: 'LOGIN',
      resource: 'auth',
      details: { method: 'password' },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Prepare user data for response
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: canonicalRole,
      permissions: user.permissions,
      tenantId: normalizeTenantId(user.tenant_id),
      tenant_id: normalizeTenantId(user.tenant_id),
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

    // Return success with token and user data
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });

    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
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
          role: user.role,
        },
      });
    }

    return response;
  } catch (error: unknown) {
    // Avoid leaking internals; return a stable, user-safe message.
    // Map common Prisma connectivity failures to 503 so monitoring + clients can react appropriately.
    const maybeCode = (error as { code?: unknown } | null)?.code;
    const code = typeof maybeCode === 'string' ? maybeCode : undefined;

    console.error('Login error:', error);

    if (code === 'P1000' || code === 'P1001') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
