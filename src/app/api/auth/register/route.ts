/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { signUp } from '@/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS, createRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting - Security: Prevent mass account creation
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.REGISTRATION);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password, name, role, tenant_id } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (role) {
      const normalizedRole = String(role).trim().toUpperCase();
      const allowedRoles = ['TEACHER', 'SENCO', 'EP', 'PARENT', 'RESEARCHER', 'STUDENT'];
      if (!allowedRoles.includes(normalizedRole)) {
        return NextResponse.json(
          { error: 'Invalid role selection' },
          { status: 400 }
        );
      }
      body.role = normalizedRole;
    }

    const session = await signUp(email, password, { name, role: body.role, tenant_id });

    return NextResponse.json({
      message: 'User registered successfully',
      user: session?.user
    });
  } catch (_error) {
    console.error('Registration error:', _error);
    const message = _error instanceof Error ? _error.message : 'Registration failed';
    
    if (message === 'User already exists') {
      return NextResponse.json(
        { error: message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
