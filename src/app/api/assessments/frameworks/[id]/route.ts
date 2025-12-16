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

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await authService.getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    let framework;
    
    // Check if id is a UUID (simple regex check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      framework = await prisma.assessmentFramework.findUnique({
        where: { id },
        include: {
          domains: {
            orderBy: {
              order_index: 'asc',
            },
          },
        },
      });
    } else {
      // Try finding by abbreviation (e.g., 'ECCA')
      // Handle 'ecca-v1' by stripping version if needed, or just exact match if abbreviation is 'ECCA'
      // Assuming abbreviation in DB is 'ECCA'
      const abbreviation = id.split('-')[0].toUpperCase();
      
      framework = await prisma.assessmentFramework.findUnique({
        where: { abbreviation },
        include: {
          domains: {
            orderBy: {
              order_index: 'asc',
            },
          },
        },
      });
    }

    if (!framework) {
      return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
    }

    return NextResponse.json({ framework });
  } catch (_error) {
    console.error('Error fetching framework:', _error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
