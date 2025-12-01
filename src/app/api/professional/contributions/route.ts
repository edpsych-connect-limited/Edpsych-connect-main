/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Professional Contribution Portal API
 * -------------------------------------
 * Enables Educational Psychologists, Health Professionals, Social Workers,
 * and other specialists to view their assigned EHCP cases and submit
 * their statutory advice contributions.
 * 
 * UK SEND Code of Practice 2015 Requirements:
 * - EP advice must include: cognitive profile, learning needs, outcomes, provision
 * - Health advice must include: relevant medical/health needs, health provision
 * - Social care advice must include: social care needs, provision requirements
 * - All advice must be received within 6 weeks of request (by Week 14)
 * 
 * This is the zero-touch interface for multi-agency collaboration.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/professional/contributions
 * List all EHCP contribution requests assigned to the current professional
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const sortBy = searchParams.get('sort') || 'deadline';
    const sortOrder = searchParams.get('order') || 'asc';

    // Build filter
    const where: any = {
      contributor_id: user.id,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    // Fetch contributions assigned to this professional
    const contributions = await prisma.eHCPContribution.findMany({
      where,
      include: {
        application: {
          include: {
            school_tenant: {
              select: {
                id: true,
                name: true,
              },
            },
            la_tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy === 'deadline' ? 'due_date' : sortBy === 'priority' ? 'status' : 'requested_at']: sortOrder,
      },
    });

    // Categorise contributions
    const now = new Date();
    const categorised = {
      pending: contributions.filter(c => c.status === 'draft' && new Date(c.due_date) > now),
      in_progress: contributions.filter(c => c.status === 'submitted' && !c.accepted_at),
      overdue: contributions.filter(c => 
        (c.status === 'draft') && new Date(c.due_date) < now
      ),
      submitted: contributions.filter(c => c.status === 'submitted'),
      revision_requested: contributions.filter(c => c.status === 'revision_requested'),
      accepted: contributions.filter(c => c.status === 'accepted'),
    };

    // Calculate statistics
    const stats = {
      total: contributions.length,
      pending: categorised.pending.length,
      in_progress: categorised.in_progress.length,
      overdue: categorised.overdue.length,
      submitted: categorised.submitted.length,
      revision_requested: categorised.revision_requested.length,
      accepted: categorised.accepted.length,
      completion_rate: contributions.length > 0 
        ? Math.round((categorised.accepted.length / contributions.length) * 100) 
        : 0,
    };

    // Add urgency indicators
    const urgentCases = contributions.filter(c => {
      if (c.status === 'accepted' || c.status === 'submitted') return false;
      const daysToDeadline = Math.floor((new Date(c.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysToDeadline <= 7;
    });

    return NextResponse.json({
      contributions,
      categorised,
      statistics: stats,
      urgent_count: urgentCases.length,
      urgent_cases: urgentCases.map(c => ({
        id: c.id,
        child_name: c.application.child_name,
        school: c.application.school_tenant?.name || 'Unknown',
        deadline: c.due_date,
        days_remaining: Math.floor((new Date(c.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      professional: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('Error fetching professional contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
