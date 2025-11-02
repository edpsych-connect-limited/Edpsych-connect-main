/**
 * Authentication API - Token Refresh Route
 * Handles token refresh requests
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Refresh token is required'
        },
        { status: 400 }
      );
    }

    // Verify the refresh token
    const session = await authService.verifyToken(refreshToken);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid refresh token'
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
          role: session.role
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}