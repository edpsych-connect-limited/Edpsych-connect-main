/**
 * Ethics Incidents API
 * Manage ethics incidents and resolutions
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};
    if (status) {
      if (status === 'active') {
        whereClause.status = { in: ['open', 'investigating', 'mitigating'] };
      } else {
        whereClause.status = status;
      }
    }
    if (severity) whereClause.severity = severity;

    const incidents = await prisma.ethicsIncident.findMany({
        where: whereClause,
        take: limit,
        orderBy: { detectedAt: 'desc' }
    });

    const summary = {
        total: await prisma.ethicsIncident.count(),
        open: await prisma.ethicsIncident.count({ where: { status: 'open' } }),
        investigating: await prisma.ethicsIncident.count({ where: { status: 'investigating' } }),
        resolved: await prisma.ethicsIncident.count({ where: { status: 'resolved' } })
    };

    return NextResponse.json({
      incidents,
      count: incidents.length,
      summary
    });
  } catch (_error) {
    console.error('Ethics Incidents API error:', _error);
    return NextResponse.json(
      { error: 'Failed to retrieve incidents' },
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
    const { action, incidentId, ...data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create':
        const { title, description, severity, monitorId, metricId } = data;
        if (!title || !description) {
          return NextResponse.json(
            { error: 'Missing required fields: title, description' },
            { status: 400 }
          );
        }

        const newIncident = await prisma.ethicsIncident.create({
            data: {
                title,
                description,
                monitorId: monitorId || null,
                metricId: metricId || null,
                metricValue: null,
                thresholdValue: null,
                detectedAt: new Date(),
                status: 'open',
                severity: severity || 'medium',
                assignedToId: null,
                resolutionSteps: [],
                tags: []
            }
        });

        return NextResponse.json({
          success: true,
          incident: newIncident,
          message: 'Incident created successfully'
        });

      case 'assign':
        if (!incidentId || !data.assignedTo) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, assignedTo' },
            { status: 400 }
          );
        }

        await prisma.ethicsIncident.update({
            where: { id: incidentId },
            data: { assignedToId: parseInt(data.assignedTo) || undefined }
        });

        return NextResponse.json({
          success: true,
          message: 'Incident assigned successfully'
        });

      case 'add_resolution_step':
        if (!incidentId || !data.description) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, description' },
            { status: 400 }
          );
        }

        const incidentS = await prisma.ethicsIncident.findUnique({ where: { id: incidentId } });
        if (!incidentS) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        const currentSteps = (incidentS.resolutionSteps as any[]) || [];
        currentSteps.push({
            description: data.description,
            status: 'completed',
            createdAt: new Date(),
            completedAt: new Date()
        });
        await prisma.ethicsIncident.update({
            where: { id: incidentId },
            data: { resolutionSteps: currentSteps }
        });

        return NextResponse.json({
          success: true,
          message: 'Resolution step added successfully'
        });

      case 'update_status':
        if (!incidentId || !data.status) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, status' },
            { status: 400 }
          );
        }

        await prisma.ethicsIncident.update({
            where: { id: incidentId },
            data: { status: data.status }
        });

        return NextResponse.json({
          success: true,
          message: 'Incident status updated successfully'
        });

      case 'resolve':
        if (!incidentId) {
          return NextResponse.json(
            { error: 'Missing required field: incidentId' },
            { status: 400 }
          );
        }

        await prisma.ethicsIncident.update({
            where: { id: incidentId },
            data: { status: 'resolved', resolvedAt: new Date() }
        });

        return NextResponse.json({
          success: true,
          message: 'Incident resolved successfully'
        });

      case 'dismiss':
        if (!incidentId || !data.reason) {
          return NextResponse.json(
            { error: 'Missing required fields: incidentId, reason' },
            { status: 400 }
          );
        }

        await prisma.ethicsIncident.update({
            where: { id: incidentId },
            data: { status: 'dismissed', resolvedAt: new Date() }
        });

        return NextResponse.json({
          success: true,
          message: 'Incident dismissed successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (_error) {
    console.error('Incident action error:', _error);
    return NextResponse.json(
      { error: 'Failed to perform incident action' },
      { status: 500 }
    );
  }
}
