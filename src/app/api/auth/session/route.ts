import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/session
 * Returns the current user session information
 * This is an alias for /api/auth/me for compatibility
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session from request
    const session = await authService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          session: null,
        },
        { status: 200 } // Return 200 with null session instead of 401
      );
    }

    // Return session information
    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: session.id,
          email: session.email,
          name: session.name,
          role: session.role,
          organization: session.organization,
          permissions: session.permissions,
          subscriptionTier: session.subscriptionTier,
        },
        expires: session.exp ? new Date(session.exp * 1000).toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        session: null,
        error: 'Session check failed',
      },
      { status: 200 }
    );
  }
}
