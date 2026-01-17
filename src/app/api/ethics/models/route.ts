/**
 * Ethics Model Registry API
 * Manage AI model registry entries
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const models = await prisma.aIModel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            fairnessEvaluations: {
              orderBy: { evaluatedAt: 'desc' },
              take: 1
            },
            transparencyReport: true
          }
        }
      }
    });

    return NextResponse.json({ models, count: models.length });
  } catch (_error) {
    console.error('Ethics model registry GET error:', _error);
    return NextResponse.json({ error: 'Failed to retrieve models' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, provider, description, status } = body;

    if (!name || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: name, provider' },
        { status: 400 }
      );
    }

    const model = await prisma.aIModel.create({
      data: {
        name,
        provider,
        description,
        status: status || 'active'
      }
    });

    return NextResponse.json({ success: true, model });
  } catch (_error) {
    console.error('Ethics model registry POST error:', _error);
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
  }
}
