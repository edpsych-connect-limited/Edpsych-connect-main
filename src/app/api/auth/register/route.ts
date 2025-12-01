/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { signUp } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, tenant_id } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const session = await signUp(email, password, { name, role, tenant_id });

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
