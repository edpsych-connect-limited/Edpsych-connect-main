/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/email-service';
import crypto from 'crypto';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ForgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success even if user not found (security best practice)
    if (!user) {
      // Simulate delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to user
    await prisma.users.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });

  } catch (_error) {
    console.error('Forgot Password Error:', _error);
    return NextResponse.json(
      { error: 'An unexpected _error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
