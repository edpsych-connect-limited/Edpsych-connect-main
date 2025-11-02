/**
 * Authentication API - Logout Route
 * Handles user logout and token cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';

export async function POST(request: NextRequest) {
  try {
    // Clear authentication cookie
    authService.clearAuthCookie();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}