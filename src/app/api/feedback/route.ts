import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback
 * Submit beta feedback from users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, currentPage, userAgent, timestamp } = body;

    if (!message || !type) {
      return NextResponse.json(
        { success: false, error: 'Message and type are required' },
        { status: 400 }
      );
    }

    // Get user session if authenticated
    let userId: string | null = null;
    let userEmail: string | null = null;
    let tenantId: number | null = null;
    
    try {
      const session = await authService.getSessionFromRequest(request);
      if (session) {
        userId = session.id;
        userEmail = session.email;
        tenantId = session.tenant_id || null;
      }
    } catch {
      // Continue as anonymous feedback
    }

    // Store feedback in database
    // Using AuditLog as a general logging table, or we can create a dedicated Feedback model
    await prisma.auditLog.create({
      data: {
        userId: userId || 'anonymous',
        resource: 'beta_feedback',
        action: 'submit_feedback',
        details: {
          type,
          message,
          currentPage,
          userAgent,
          timestamp,
          userEmail,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
        tenant_id: tenantId,
      },
    });

    // Log to console for immediate visibility during beta
    logger.debug('📝 Beta Feedback Received:', {
      type,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      page: currentPage,
      user: userEmail || 'anonymous',
      timestamp,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
    });
  } catch (_error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Get feedback submissions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const session = await authService.getSessionFromRequest(request);
    if (!session || !['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch recent feedback
    const feedback = await prisma.auditLog.findMany({
      where: {
        resource: 'beta_feedback',
        action: 'submit_feedback',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      feedback: feedback.map(f => ({
        id: f.id,
        ...f.details as Record<string, unknown>,
        createdAt: f.createdAt,
        userId: f.userId,
      })),
      count: feedback.length,
    });
  } catch (_error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
