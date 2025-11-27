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
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { checkRateLimit, getClientIP, RATE_LIMITS, createRateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';


const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
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

    // Find user with tenant information
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenants: true,
        professionals: true,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const accessToken = jwt.sign(
      {
        id: user.id.toString(), // Changed from userId to id to match authService
        userId: user.id, // Keep for backward compatibility
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenant_id, // Changed from tenantId to tenant_id to match authService
        tenantId: user.tenant_id, // Keep for backward compatibility
        permissions: user.permissions,
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
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
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Prepare user data for response
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

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
