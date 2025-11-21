import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Find user with valid token
    const user = await prisma.users.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Expiry must be in the future
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
