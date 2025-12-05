/**
 * Golden Thread Coherence Analysis API Routes
 * 
 * API endpoints for EHCP coherence analysis.
 * Validates and ensures the "golden thread" between needs, provisions, and outcomes.
 * 
 * Zero Gap Project - Sprint 5
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGoldenThreadService } from '@/lib/ehcp/golden-thread.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - Get coherence analysis
// ============================================================================

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'analysis';
    const ehcpId = searchParams.get('ehcpId');

    const service = createGoldenThreadService(tenantId);

    switch (type) {
      case 'analysis': {
        if (!ehcpId) {
          return NextResponse.json(
            { error: 'ehcpId is required for analysis' },
            { status: 400 }
          );
        }

        // Check if we have cached analysis
        const cached = await service.getLatestAnalysis(ehcpId);
        
        if (cached) {
          // Return cached if less than 1 hour old
          const ageMs = Date.now() - new Date(cached.analysisDate).getTime();
          if (ageMs < 60 * 60 * 1000) {
            return NextResponse.json({
              ...cached,
              cached: true,
            });
          }
        }

        // Run fresh analysis
        const analysis = await service.analyseCoherence(ehcpId);
        return NextResponse.json({
          ...analysis,
          cached: false,
        });
      }

      case 'summary': {
        // Get summary across all EHCPs
        const summary = await service.getCoherenceSummary();
        return NextResponse.json(summary);
      }

      case 'cached': {
        if (!ehcpId) {
          return NextResponse.json(
            { error: 'ehcpId is required' },
            { status: 400 }
          );
        }

        const cached = await service.getLatestAnalysis(ehcpId);
        if (!cached) {
          return NextResponse.json(
            { error: 'No cached analysis found' },
            { status: 404 }
          );
        }
        return NextResponse.json(cached);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: analysis, summary, cached' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[GoldenThread API] GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch coherence analysis';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Trigger new analysis
// ============================================================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const tenantId = user.tenantId;

    // Only professionals can trigger analysis
    const allowedRoles = ['admin', 'la_admin', 'school_admin', 'senco', 'teacher', 'educational_psychologist'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ehcpId, forceRefresh = false } = body;

    if (!ehcpId) {
      return NextResponse.json(
        { error: 'ehcpId is required' },
        { status: 400 }
      );
    }

    const service = createGoldenThreadService(tenantId);

    // Check for recent analysis unless force refresh
    if (!forceRefresh) {
      const cached = await service.getLatestAnalysis(ehcpId);
      if (cached) {
        const ageMs = Date.now() - new Date(cached.analysisDate).getTime();
        if (ageMs < 15 * 60 * 1000) { // 15 minutes
          return NextResponse.json({
            message: 'Recent analysis exists',
            analysis: cached,
            cached: true,
          });
        }
      }
    }

    // Run analysis
    const analysis = await service.analyseCoherence(ehcpId);

    return NextResponse.json({
      success: true,
      message: 'Coherence analysis completed',
      analysis,
      cached: false,
    });

  } catch (error) {
    logger.error('[GoldenThread API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to run coherence analysis';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
