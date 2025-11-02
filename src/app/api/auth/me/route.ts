/**
 * Authentication API - User Verification Route
 * Returns current authenticated user information
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user session from request
    const session = await authService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated'
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
        sessionId: session.sessionId
      }
    });

  } catch (error) {
    console.error('User verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}