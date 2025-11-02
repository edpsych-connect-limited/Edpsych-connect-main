/**
 * EHCP Reviews API Endpoint
 * Task 3.1.4: Review Workflow - Annual Reviews
 *
 * GET /api/ehcp/[id]/reviews - Get all reviews for an EHCP
 * POST /api/ehcp/[id]/reviews - Schedule a new review
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET - Fetch all reviews for an EHCP
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ehcpId = params.id;
    if (!ehcpId) {
      return NextResponse.json({ error: 'Invalid EHCP ID' }, { status: 400 });
    }

    // Verify EHCP exists
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: ehcpId },
    });

    if (!ehcp) {
      return NextResponse.json({ error: 'EHCP not found' }, { status: 404 });
    }

    // Fetch reviews from EHCP plan_details
    const planDetails = ehcp.plan_details as any;
    const reviews = planDetails?.reviews || [];

    // Calculate status for each review
    const enrichedReviews = reviews.map((review: any) => {
      const scheduledDate = new Date(review.scheduled_date);
      const now = new Date();

      let status = review.status;
      if (!review.actual_date && scheduledDate < now) {
        status = 'overdue';
      }

      return {
        ...review,
        status,
      };
    });

    return NextResponse.json({
      success: true,
      reviews: enrichedReviews,
      count: enrichedReviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Schedule a new review
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ehcpId = params.id;
    if (!ehcpId) {
      return NextResponse.json({ error: 'Invalid EHCP ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const {
      review_type,
      scheduled_date,
      notes,
    } = body;

    // Validation
    if (!review_type || !scheduled_date) {
      return NextResponse.json(
        { error: 'Review type and scheduled date are required' },
        { status: 400 }
      );
    }

    if (!['annual', 'interim', 'emergency'].includes(review_type)) {
      return NextResponse.json(
        { error: 'Invalid review type' },
        { status: 400 }
      );
    }

    // Fetch existing EHCP
    const ehcp = await prisma.ehcps.findUnique({
      where: { id: ehcpId },
    });

    if (!ehcp) {
      return NextResponse.json({ error: 'EHCP not found' }, { status: 404 });
    }

    // Create new review object
    const newReview = {
      id: Date.now(), // Simple ID for now
      ehcp_id: ehcpId,
      review_type,
      scheduled_date,
      status: 'scheduled',
      outcomes: [],
      attendees: [],
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update EHCP with new review
    const planDetails = ehcp.plan_details as any || {};
    const reviews = planDetails.reviews || [];
    reviews.push(newReview);

    // Update the EHCP
    await prisma.ehcps.update({
      where: { id: ehcpId },
      data: {
        plan_details: {
          ...planDetails,
          reviews,
          next_review_date: scheduled_date,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review scheduled successfully',
      review: newReview,
    });
  } catch (error) {
    console.error('Error scheduling review:', error);
    return NextResponse.json(
      { error: 'Failed to schedule review', details: (error as Error).message },
      { status: 500 }
    );
  }
}
