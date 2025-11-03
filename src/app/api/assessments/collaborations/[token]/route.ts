/**
 * Collaboration Token API
 * Handles form access and submission via secure token
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ============================================================================
// GET /api/assessments/collaborations/[token]
// Get collaboration form data (no auth required - token-based)
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find collaboration by token
    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { invitation_token: token },
      include: {
        instance: {
          include: {
            framework: {
              include: {
                domains: true,
              },
            },
          },
        },
      },
    });

    if (!collaboration) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (collaboration.token_expires_at && collaboration.token_expires_at < new Date()) {
      return NextResponse.json(
        { error: 'This invitation link has expired' },
        { status: 410 }
      );
    }

    // Check if already submitted
    if (collaboration.status === 'received') {
      return NextResponse.json(
        {
          error: 'This form has already been submitted',
          submitted_at: collaboration.submitted_at,
        },
        { status: 409 }
      );
    }

    // Return safe data for form rendering (don't expose sensitive instance data)
    const formData = {
      collaboration_id: collaboration.id,
      contributor_type: collaboration.contributor_type,
      contributor_name: collaboration.contributor_name,
      relationship_to_child: collaboration.relationship_to_child,
      framework_name: collaboration.instance.framework?.name || 'Assessment Framework',
      framework_domains: collaboration.instance.framework?.domains.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
      })) || [],
      existing_responses: collaboration.responses,
      existing_narrative: collaboration.narrative_input,
      status: collaboration.status,
    };

    return NextResponse.json({ formData });
  } catch (error) {
    console.error('Failed to fetch collaboration form:', error);
    return NextResponse.json(
      { error: 'Failed to load form' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/assessments/collaborations/[token]
// Submit collaboration form responses
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const data = await request.json();

    // Find collaboration by token
    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { invitation_token: token },
    });

    if (!collaboration) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (collaboration.token_expires_at && collaboration.token_expires_at < new Date()) {
      return NextResponse.json(
        { error: 'This invitation link has expired' },
        { status: 410 }
      );
    }

    // Check if already submitted
    if (collaboration.status === 'received') {
      return NextResponse.json(
        { error: 'This form has already been submitted' },
        { status: 409 }
      );
    }

    // Validate responses
    const { responses, narrative_input, observation_context } = data;

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least some responses' },
        { status: 400 }
      );
    }

    // Update collaboration with submitted data
    const updated = await prisma.assessmentCollaboration.update({
      where: { id: collaboration.id },
      data: {
        responses,
        narrative_input: narrative_input || null,
        observation_context: observation_context || null,
        status: 'received',
        submitted_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your input. Your responses have been submitted successfully.',
      collaboration: updated,
    });
  } catch (error) {
    console.error('Failed to submit collaboration:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/assessments/collaborations/[token]
// Save draft responses (partial save)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const data = await request.json();

    // Find collaboration by token
    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { invitation_token: token },
    });

    if (!collaboration) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (collaboration.token_expires_at && collaboration.token_expires_at < new Date()) {
      return NextResponse.json(
        { error: 'This invitation link has expired' },
        { status: 410 }
      );
    }

    // Check if already submitted
    if (collaboration.status === 'received') {
      return NextResponse.json(
        { error: 'This form has already been submitted and cannot be edited' },
        { status: 409 }
      );
    }

    // Update with draft data
    const { responses, narrative_input, observation_context } = data;

    const updated = await prisma.assessmentCollaboration.update({
      where: { id: collaboration.id },
      data: {
        responses: responses || collaboration.responses,
        narrative_input: narrative_input !== undefined ? narrative_input : collaboration.narrative_input,
        observation_context: observation_context !== undefined ? observation_context : collaboration.observation_context,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully',
      collaboration: updated,
    });
  } catch (error) {
    console.error('Failed to save draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
