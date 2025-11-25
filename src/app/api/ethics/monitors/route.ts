/**
 * Ethics Monitors API
 * Manage ethics monitoring configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

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

    const { searchParams } = new URL(request.url);
    const enabled = searchParams.get('enabled');
    const severity = searchParams.get('severity');

    const whereClause: any = {};
    if (enabled !== null) {
      whereClause.enabled = enabled === 'true';
    }
    if (severity) whereClause.severity = severity;

    const monitors = await prisma.ethicsMonitor.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      monitors,
      count: monitors.length,
      categories: ['fairness', 'privacy', 'transparency', 'compliance']
    });
  } catch (error) {
    console.error('Ethics Monitors API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve monitors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, metrics, thresholds, frequency, severity } = body;

    if (!name || !description || !metrics || !thresholds) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, metrics, thresholds' },
        { status: 400 }
      );
    }

    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Metrics must be a non-empty array' },
        { status: 400 }
      );
    }

    const newMonitor = await prisma.ethicsMonitor.create({
        data: {
            name,
            description,
            metrics,
            thresholds,
            enabled: true,
            frequency: frequency || 'daily',
            severity: severity || 'medium',
            tags: [],
            lastRunAt: null
        }
    });

    return NextResponse.json({
      success: true,
      monitor: newMonitor,
      message: 'Monitor created successfully'
    });
  } catch (error) {
    console.error('Create monitor error:', error);
    return NextResponse.json(
      { error: 'Failed to create monitor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, enabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    await prisma.ethicsMonitor.update({
        where: { id },
        data: { enabled }
    });

    return NextResponse.json({
      success: true,
      message: `Monitor ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Update monitor error:', error);
    return NextResponse.json(
      { error: 'Failed to update monitor' },
      { status: 500 }
    );
  }
}
