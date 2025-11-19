/**
 * Consolidated Authentication API Routes
 * 
 * This handler consolidates all auth endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/logout
 * - GET /api/auth/me
 * - POST /api/auth/refresh
 * - POST /api/auth/signup
 * - GET /api/auth/signup?email=...
 * 
 * This consolidation reduces Vercel function count to prevent symlink collisions.
 * Implementation: route-based dispatch using URL pathname matching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import authService from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

const prismaInstance = new PrismaClient();

// Request validation schemas
const SignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organization: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Routes dispatcher - determines which handler to call based on pathname and method
 */
async function routeRequest(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);
  const method = request.method;

  // Extract action from pathname: /api/auth/login -> "login"
  const pathParts = pathname.split('/').filter(Boolean);
  const action = pathParts[pathParts.length - 1];

  // Route: POST /api/auth/login
  if (action === 'login' && method === 'POST') {
    return handleLogin(request);
  }

  // Route: POST /api/auth/logout
  if (action === 'logout' && method === 'POST') {
    return handleLogout(request);
  }

  // Route: GET /api/auth/me
  if (action === 'me' && method === 'GET') {
    return handleGetMe(request);
  }

  // Route: POST /api/auth/refresh
  if (action === 'refresh' && method === 'POST') {
    return handleRefresh(request);
  }

  // Route: POST /api/auth/signup
  if (action === 'signup' && method === 'POST') {
    return handleSignup(request);
  }

  // Route: GET /api/auth/signup?email=...
  if (action === 'signup' && method === 'GET') {
    return handleCheckEmailAvailability(request);
  }

  // Route: GET /api/auth (root endpoint)
  if (action === 'auth' && method === 'GET') {
    return NextResponse.json(
      { success: true, message: 'Auth API is available' },
      { status: 200 }
    );
  }

  // Route: OPTIONS for CORS
  if (method === 'OPTIONS') {
    return NextResponse.json({}, { status: 200 });
  }

  // Unknown route
  return NextResponse.json(
    { error: 'Not found', message: `Unknown auth endpoint: ${action}` },
    { status: 404 }
  );
}

/**
 * Handler: POST /api/auth/login
 */
async function handleLogin(request: NextRequest) {
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
    const user = await prismaInstance.users.findUnique({
      where: { email },
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
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
        permissions: user.permissions,
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Update last login
    await prismaInstance.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
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
      user: userData,
    });

    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prismaInstance.$disconnect();
  }
}

/**
 * Handler: POST /api/auth/logout
 */
async function handleLogout(request: NextRequest) {
  try {
    // Clear authentication cookie
    authService.clearAuthCookie();

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handler: GET /api/auth/me
 */
async function handleGetMe(request: NextRequest) {
  try {
    // Get user session from request
    const session = await authService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Return user session information
    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        organization: session.organization,
        permissions: session.permissions,
        subscriptionTier: session.subscriptionTier,
        sessionId: session.sessionId,
      },
    });
  } catch (error) {
    console.error('User verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handler: POST /api/auth/refresh
 */
async function handleRefresh(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RefreshSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { refreshToken } = validation.data;

    // Verify the refresh token
    const session = await authService.verifyToken(refreshToken);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid refresh token',
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const newToken = await authService.generateToken(session);

    // Set the new token in cookies
    authService.setAuthCookie(newToken);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newToken,
        user: {
          id: session.id,
          email: session.email,
          name: session.name,
          role: session.role,
        },
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handler: POST /api/auth/signup
 */
async function handleSignup(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SignupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, organization, role, phone } =
      validation.data;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Account already exists',
          message:
            'An account with this email address already exists. Please login or use password reset.',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine user tier (start with free/trial)
    const fullName = `${firstName} ${lastName}`.trim();

    // Generate a unique subdomain for the tenant
    const subdomain = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // First create a tenant for the user
    const tenant = await prisma.tenants.create({
      data: {
        name: organization || `${fullName}'s Account`,
        subdomain: subdomain,
        tenant_type: organization ? 'SCHOOL' : 'INDIVIDUAL',
        status: 'trial',
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

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email for verification.',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup API Error:', error);

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            error: 'Email already registered',
            message: 'This email address is already registered.',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Account creation failed',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * Handler: GET /api/auth/signup?email=...
 */
async function handleCheckEmailAvailability(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? 'Email already registered'
        : 'Email available',
    });
  } catch (error) {
    console.error('Email Check Error:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}

/**
 * Main API handler - dispatches to appropriate handler based on URL and method
 */
export async function POST(request: NextRequest) {
  return routeRequest(request);
}

export async function GET(request: NextRequest) {
  return routeRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  return routeRequest(request);
}
