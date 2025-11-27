/**
 * Beta Registration API
 * 
 * Handles beta tester registration with invite codes
 * 
 * @copyright EdPsych Connect Limited 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIP, RATE_LIMITS, createRateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Validation schema
const BetaRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  betaCode: z.string().min(1, 'Beta access code is required'),
  role: z.enum(['TEACHER', 'SENCO', 'EP', 'PARENT', 'RESEARCHER', 'ADMIN']).optional(),
  organizationName: z.string().optional(),
  acceptedTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
  acceptedBetaTerms: z.boolean().refine(val => val === true, 'You must accept the beta terms'),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.BETA);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const body = await request.json();
    const validation = BetaRegistrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid registration data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, betaCode, role, organizationName } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Validate beta code
    const betaAccessCode = await prisma.betaAccessCode.findUnique({
      where: { code: betaCode.toUpperCase() },
    });

    if (!betaAccessCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid beta access code' },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (betaAccessCode.expiresAt && new Date() > betaAccessCode.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'This beta access code has expired' },
        { status: 400 }
      );
    }

    // Check if code is active
    if (!betaAccessCode.isActive) {
      return NextResponse.json(
        { success: false, error: 'This beta access code is no longer active' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (betaAccessCode.maxUses && betaAccessCode.usedCount >= betaAccessCode.maxUses) {
      return NextResponse.json(
        { success: false, error: 'This beta access code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check role restriction
    const userRole = role || 'TEACHER';
    if (betaAccessCode.roleRestriction && betaAccessCode.roleRestriction !== userRole) {
      return NextResponse.json(
        { 
          success: false, 
          error: `This beta code is restricted to ${betaAccessCode.roleRestriction} accounts only` 
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get or create default tenant for beta users
    let tenant = await prisma.tenants.findFirst({
      where: { subdomain: 'beta' },
    });

    if (!tenant) {
      tenant = await prisma.tenants.create({
        data: {
          name: 'Beta Programme',
          subdomain: 'beta',
          tenant_type: 'SCHOOL',
          is_active: true,
          settings: {},
        },
      });
    }

    // Create user
    const user = await prisma.users.create({
      data: {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role: userRole,
        tenant_id: tenant.id,
        is_active: true,
        isEmailVerified: false,
        onboarding_completed: false,
        // Beta fields - will be added after migration
        // beta_tester: true,
        // beta_code_used: betaCode.toUpperCase(),
        // beta_joined_at: new Date(),
        permissions: [],
        metadata: {
          registeredAt: new Date().toISOString(),
          registrationSource: 'beta-registration',
          betaCodeUsed: betaCode.toUpperCase(),
          organizationName: organizationName || null,
          isBetaTester: true,
        },
      },
    });

    // Increment beta code usage
    await prisma.betaAccessCode.update({
      where: { id: betaAccessCode.id },
      data: {
        usedCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    // Log the registration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        action: 'BETA_REGISTRATION',
        resource: 'user',
        resourceId: user.id.toString(),
        details: {
          betaCode: betaCode.toUpperCase(),
          role: userRole,
        },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Beta registration successful! Welcome to EdPsych Connect World.',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isBetaTester: true,
      },
    });

  } catch (error) {
    console.error('Beta registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
