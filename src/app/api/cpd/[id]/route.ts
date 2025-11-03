/**
 * FILE: src/app/api/cpd/[id]/route.ts
 * PURPOSE: Individual CPD entry management
 *
 * ENDPOINTS:
 * - GET: Retrieve single CPD entry
 * - PATCH: Update CPD entry
 * - DELETE: Delete CPD entry
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Retrieve CPD Entry
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.id;
    const entryId = params.id;

    const entry = await (prisma as any).cPDEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'CPD entry not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (entry.userId !== userId.toString()) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      entry,
    });

  } catch (error: any) {
    console.error('[CPD API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve CPD entry',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: Update CPD Entry
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.id;
    const entryId = params.id;
    const body = await request.json();

    // Check if entry exists and user owns it
    const existingEntry = await (prisma as any).cPDEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'CPD entry not found' },
        { status: 404 }
      );
    }

    if (existingEntry.userId !== userId.toString()) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate hours if provided
    if (body.hours !== undefined) {
      if (body.hours <= 0 || body.hours > 24) {
        return NextResponse.json(
          { success: false, error: 'Hours must be between 0 and 24' },
          { status: 400 }
        );
      }
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = [
        'Formal Training',
        'Self-Directed Learning',
        'Professional Practice',
        'Research & Publication',
        'Conference & Seminars',
        'Peer Learning',
        'Work-Based Learning',
        'Other',
      ];

      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.activity !== undefined) updateData.activity = body.activity;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.hours !== undefined) updateData.hours = parseFloat(body.hours);
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.certificate !== undefined) updateData.certificate = body.certificate;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Update entry
    const updatedEntry = await (prisma as any).cPDEntry.update({
      where: { id: entryId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
      message: 'CPD entry updated successfully',
    });

  } catch (error: any) {
    console.error('[CPD API] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update CPD entry',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE: Delete CPD Entry
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.id;
    const entryId = params.id;

    // Check if entry exists and user owns it
    const existingEntry = await (prisma as any).cPDEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: 'CPD entry not found' },
        { status: 404 }
      );
    }

    if (existingEntry.userId !== userId.toString()) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete entry
    await (prisma as any).cPDEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({
      success: true,
      message: 'CPD entry deleted successfully',
    });

  } catch (error: any) {
    console.error('[CPD API] DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete CPD entry',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
