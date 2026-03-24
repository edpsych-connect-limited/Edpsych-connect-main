import authService from '@/lib/auth/auth-service';
/**
 * SEN2 Returns API Routes
 * 
 * Production-ready API endpoints for managing Local Authority SEN2 statutory returns.
 * These endpoints provide full CRUD operations for SEN2 data extraction, validation,
 * and export in DfE-compliant formats.
 * 
 * Zero Gap Project - Sprint 1
 */

import { NextRequest, NextResponse } from 'next/server';


import { createSEN2Service } from '@/lib/ehcp/sen2-returns.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET - List all SEN2 returns or get a specific one
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const returnId = searchParams.get('id');

    const sen2Service = createSEN2Service(tenantId);

    if (returnId) {
      // Get specific return with full details
      const sen2Return = await sen2Service.getSEN2Return(returnId);
      
      if (!sen2Return) {
        return NextResponse.json({ error: 'SEN2 return not found' }, { status: 404 });
      }

      return NextResponse.json(sen2Return);
    }

    // Get all returns
    const returns = await sen2Service.getAllReturns();
    return NextResponse.json(returns);

  } catch (error) {
    logger.error('[SEN2 API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEN2 returns' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Generate a new SEN2 return
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;
    const userId = user.id;

    // Verify user has LA admin permissions
    if (!['la_admin', 'admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only LA administrators can generate SEN2 returns.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { collectionYear, referenceDate, includePreviousYear } = body;

    if (!collectionYear || !referenceDate) {
      return NextResponse.json(
        { error: 'Collection year and reference date are required' },
        { status: 400 }
      );
    }

    const sen2Service = createSEN2Service(tenantId);

    const returnId = await sen2Service.generateSEN2Return({
      tenantId,
      collectionYear: parseInt(collectionYear, 10),
      referenceDate: new Date(referenceDate),
      preparedById: parseInt(userId, 10),
      includePreviousYear: includePreviousYear !== false,
    });

    // Get the full return data
    const sen2Return = await sen2Service.getSEN2Return(returnId);

    return NextResponse.json({
      success: true,
      message: 'SEN2 return generated successfully',
      data: sen2Return,
    }, { status: 201 });

  } catch (error) {
    logger.error('[SEN2 API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate SEN2 return';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update/Submit a SEN2 return
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session as any;
    const tenantId = user.tenantId;
    const userId = parseInt(user.id, 10);

    const body = await request.json();
    const { returnId, action } = body;

    if (!returnId) {
      return NextResponse.json(
        { error: 'Return ID is required' },
        { status: 400 }
      );
    }

    const sen2Service = createSEN2Service(tenantId);

    switch (action) {
      case 'validate': {
        const validationResults = await sen2Service.runValidation(returnId);
        return NextResponse.json({
          success: true,
          validationResults,
          hasErrors: validationResults.some(r => r.status === 'error'),
          hasWarnings: validationResults.some(r => r.status === 'warning'),
        });
      }

      case 'submit': {
        await sen2Service.submitReturn(returnId, userId);
        return NextResponse.json({
          success: true,
          message: 'SEN2 return submitted successfully',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "validate" or "submit".' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('[SEN2 API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update SEN2 return';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
