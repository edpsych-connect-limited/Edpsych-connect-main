import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { id },
      include: {
        instance: {
          include: {
            framework: {
              include: {
                domains: {
                  orderBy: {
                    order_index: 'asc',
                  },
                },
              },
            },
            student: true,
          },
        },
      },
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (collaboration.status === 'received') {
       return NextResponse.json({ error: 'Form already submitted' }, { status: 409 });
    }

    // Construct the response object expected by the frontend
    const formData = {
      collaboration_id: collaboration.id,
      contributor_type: collaboration.contributor_type,
      contributor_name: collaboration.contributor_name,
      relationship_to_child: collaboration.relationship_to_child,
      framework_name: collaboration.instance.framework.name,
      framework_domains: collaboration.instance.framework.domains.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
      })),
      existing_responses: collaboration.responses || {},
      existing_narrative: collaboration.narrative_input,
      status: collaboration.status,
    };

    return NextResponse.json({ formData });

  } catch (error) {
    console.error('Error fetching collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const body = await request.json();
    const { responses, narrative_input, observation_context } = body;

    const collaboration = await prisma.assessmentCollaboration.update({
      where: { id },
      data: {
        responses,
        narrative_input,
        observation_context,
        status: 'received',
        submitted_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, collaboration });

  } catch (error) {
    console.error('Error submitting collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const body = await request.json();
    const { responses, narrative_input, observation_context } = body;

    const collaboration = await prisma.assessmentCollaboration.update({
      where: { id },
      data: {
        responses,
        narrative_input,
        observation_context,
        // Status remains 'pending'
      },
    });

    return NextResponse.json({ success: true, collaboration });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
