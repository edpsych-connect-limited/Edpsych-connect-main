/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const id = params.id;

    const instance = await prisma.assessmentInstance.findUnique({
      where: { id },
      include: {
        domain_observations: true,
        collaborations: true,
        framework: {
            include: {
                domains: true
            }
        }
      }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Transform data to match what the wizard expects
    const domains: Record<string, any> = {};
    instance.domain_observations.forEach(obs => {
        domains[obs.domain_id] = obs;
    });

    const responseData = {
        assessment: {
            ...instance,
            domains
        }
    };

    return NextResponse.json(responseData);
  } catch (_error) {
    console.error('Error fetching assessment instance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
