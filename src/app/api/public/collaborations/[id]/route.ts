/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const collaboration = await prisma.assessmentCollaboration.findUnique({
      where: { id: params.id },
      include: {
        instance: {
            include: {
                student: true
            }
        }
      }
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Return only necessary info to avoid leaking sensitive data
    const safeData = {
        id: collaboration.id,
        contributor_name: collaboration.contributor_name,
        contributor_type: collaboration.contributor_type,
        student_first_name: collaboration.instance.student.first_name, // Only first name for privacy
        status: collaboration.status,
        framework_id: collaboration.instance.framework_id,
    };

    return NextResponse.json(safeData);
  } catch (_error) {
    console._error('Error fetching public collaboration:', _error);
    return NextResponse.json({ _error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { responses, narrative_input } = body;

    const collaboration = await prisma.assessmentCollaboration.update({
      where: { id: params.id },
      data: {
        responses,
        narrative_input,
        status: 'received',
        submitted_at: new Date(),
      }
    });

    return NextResponse.json(collaboration);
  } catch (_error) {
    console._error('Error updating public collaboration:', _error);
    return NextResponse.json({ _error: 'Internal Server Error' }, { status: 500 });
  }
}
