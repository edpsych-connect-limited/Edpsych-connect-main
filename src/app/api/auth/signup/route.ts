/**
 * User Signup API Endpoint
 *
 * This endpoint handles new user registration, creates accounts,
 * and prepares for email verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Request validation schema
const SignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organization: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = SignupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, organization, role, phone } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Account already exists',
          message: 'An account with this email address already exists. Please login or use password reset.'
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine user tier (start with free/trial)
    const fullName = `${firstName} ${lastName}`.trim();

    // First create a tenant for the user
    const tenant = await prisma.tenants.create({
      data: {
        tenant_name: organization || `${fullName}'s Account`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create user account linked to tenant
    const newUser = await prisma.users.create({
      data: {
        tenant_id: tenant.id,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        role: role,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Remove sensitive information before returning
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenant_id,
    };

    // TODO: Send verification email (Phase 2)
    // await sendVerificationEmail(email, firstName, verificationToken);

    // TODO: Log signup event for analytics
    // await logEvent('user_signup', { userId: newUser.id, role, organization });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email for verification.',
      user: userResponse,
    }, { status: 201 });

  } catch (error) {
    console.error('Signup API Error:', error);

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            error: 'Email already registered',
            message: 'This email address is already registered.'
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Account creation failed',
        message: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint - Check if email is available
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Email already registered' : 'Email available'
    });

  } catch (error) {
    console.error('Email Check Error:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
