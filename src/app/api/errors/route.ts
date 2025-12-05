/**
 * Error Reporting API Route
 * 
 * This route receives client-side errors from React error boundaries and logging
 * and stores them in a centralized location for later analysis.
 * 
 * Enterprise-grade error tracking without external dependencies that conflict with build.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface ErrorReport {
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  url?: string;
  userAgent?: string;
  timestamp?: number;
}

/**
 * POST /api/errors
 * 
 * Receives error reports from client-side error boundaries and sends them to:
 * 1. Application logs (visible in Vercel dashboard)
 * 2. Console for debugging
 * 3. Can be extended to send to external service if needed
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ErrorReport;

    // Validate request
    if (!body.message) {
      return NextResponse.json(
        { error: 'message field is required' },
        { status: 400 }
      );
    }

    // Log the error (visible in Vercel dashboard and local logs)
    const logEntry = {
      timestamp: body.timestamp || Date.now(),
      type: body.type || 'error',
      message: body.message,
      url: body.url,
      userAgent: body.userAgent,
      context: body.context,
      stack: body.stack,
    };

    // Log to console (Vercel captures this and makes it available in dashboard)
    if (body.type === 'error') {
      console.error('🚨 Client Error Report:', JSON.stringify(logEntry, null, 2));
    } else if (body.type === 'warning') {
      console.warn('⚠️ Client Warning Report:', JSON.stringify(logEntry, null, 2));
    } else {
      console.log('ℹ️ Client Info Report:', JSON.stringify(logEntry, null, 2));
    }

    // TODO: In production, send to external service
    // Examples:
    // - Send to Slack channel for critical errors
    // - Send to database for analytics
    // - Send to external error tracking service (without Sentry dependency)
    // - Send to email on critical errors

    return NextResponse.json(
      {
        success: true,
        message: 'Error report received and logged',
        logId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Failed to process error report:', error);
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/errors - Health check
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Error reporting endpoint is running',
      description: 'POST error reports to this endpoint for centralized logging',
    },
    { status: 200 }
  );
}
