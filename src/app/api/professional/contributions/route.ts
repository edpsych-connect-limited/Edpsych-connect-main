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
    const contributions = await prisma.ehcp_contributions.findMany({
      where,
      include: {
        application: {
          include: {
            child: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                date_of_birth: true,
                year_group: true,
              },
            },
            school_tenant: {
              select: {
                id: true,
                name: true,
                urn: true,
              },
            },
            la_tenant: {
              select: {
                id: true,
                name: true,
                la_code: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy === 'deadline' ? 'deadline' : sortBy === 'priority' ? 'priority' : 'created_at']: sortOrder,
      },
    });

    // Categorise contributions
    const now = new Date();
    const categorised = {
      pending: contributions.filter(c => c.status === 'REQUESTED' && new Date(c.deadline) > now),
      in_progress: contributions.filter(c => c.status === 'IN_PROGRESS'),
      overdue: contributions.filter(c => 
        (c.status === 'REQUESTED' || c.status === 'IN_PROGRESS') && new Date(c.deadline) < now
      ),
      submitted: contributions.filter(c => c.status === 'SUBMITTED'),
      revision_requested: contributions.filter(c => c.status === 'REVISION_REQUESTED'),
      accepted: contributions.filter(c => c.status === 'ACCEPTED'),
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
      if (c.status === 'ACCEPTED' || c.status === 'SUBMITTED') return false;
      const daysToDeadline = Math.floor((new Date(c.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysToDeadline <= 7;
    });

    return NextResponse.json({
      contributions,
      categorised,
      statistics: stats,
      urgent_count: urgentCases.length,
      urgent_cases: urgentCases.map(c => ({
        id: c.id,
        child_name: `${c.application.child.first_name} ${c.application.child.last_name}`,
        school: c.application.school_tenant.name,
        deadline: c.deadline,
        days_remaining: Math.floor((new Date(c.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      professional: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error fetching professional contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
