import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
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
