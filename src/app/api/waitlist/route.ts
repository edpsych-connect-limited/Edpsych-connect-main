/**
 * Waitlist API Endpoint
 *
 * This endpoint manages waitlist signups from the landing page,
 * saving leads to the database and preparing for email notification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email/email-service';
import { authenticateRequest, isAdminRole } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// Request validation schema
const WaitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  organization: z.string().optional(),
  role: z.string().optional(),
  organizationType: z.enum(['school', 'trust', 'authority', 'private', 'other']).optional(),
  source: z.string().optional(), // Track where the signup came from
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = WaitlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { email, name, organization, role, organizationType, source } = validation.data;

    // Check if email already exists
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email }
    });

    if (existingEntry) {
      // Update existing entry instead of creating duplicate
      const updated = await prisma.waitlist.update({
        where: { email },
        data: {
          name: name || existingEntry.name,
          organization: organization || existingEntry.organization,
          role: role || existingEntry.role,
          organization_type: organizationType || existingEntry.organization_type,
          updated_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Thank you! We\'ve updated your waitlist information.',
        alreadyRegistered: true,
        data: {
          id: updated.id,
          email: updated.email,
          status: updated.status,
        },
      });
    }

    // Determine priority based on organization type
    const priority = determinePriority(organizationType, organization);

    // Create new waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        name: name || null,
        organization: organization || null,
        role: role || null,
        organization_type: organizationType || null,
        status: 'pending',
        priority,
        beta_access: false,
        referral_source: source || 'landing',
        notes: null,
        last_contacted_at: null,
        converted_at: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      },
    });

    // Send welcome email via email service
    await emailService.sendWaitlistConfirmationEmail(email, name);

    // Notify admin via email
    await emailService.notifyAdminNewWaitlistSignup(waitlistEntry);

    return NextResponse.json({
      success: true,
      message: 'Thank you for joining our waitlist! We\'ll be in touch soon with exclusive early access.',
      data: {
        id: waitlistEntry.id,
        email: waitlistEntry.email,
        priority: waitlistEntry.priority,
      },
    });

  } catch (_error) {
    console.error('Waitlist API Error:', _error);

    // Check for specific database errors
    if (_error instanceof Error) {
      if (_error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            error: 'Email already registered',
            message: 'This email is already on our waitlist.'
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'An unexpected _error occurred',
        message: 'Please try again later or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Retrieve waitlist statistics (admin only, add auth later)
 */
export async function GET(_req: NextRequest) {
  try {
    const authResult = await authenticateRequest(_req);
    if (!authResult.success) {
      return authResult.response;
    }

    if (!isAdminRole(authResult.session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const totalCount = await prisma.waitlist.count();
    const pendingCount = await prisma.waitlist.count({
      where: { status: 'pending' }
    });
    const contactedCount = await prisma.waitlist.count({
      where: { status: 'contacted' }
    });
    const convertedCount = await prisma.waitlist.count({
      where: { status: 'converted' }
    });

    const recentSignups = await prisma.waitlist.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        organization: true,
        role: true,
        status: true,
        priority: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      statistics: {
        total: totalCount,
        pending: pendingCount,
        contacted: contactedCount,
        converted: convertedCount,
      },
      recentSignups,
    });

  } catch (_error) {
    console.error('Waitlist GET Error:', _error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve waitlist data'
      },
      { status: 500 }
    );
  }
}

/**
 * Determine priority level based on organization type and presence
 */
function determinePriority(
  organizationType?: string,
  organization?: string
): string {
  // High priority: Multi-academy trusts, local authorities
  if (organizationType === 'trust' || organizationType === 'authority') {
    return 'high';
  }

  // Medium priority: Schools with organization names
  if (organizationType === 'school' && organization) {
    return 'medium';
  }

  // Low priority: Individuals, no organization
  return 'low';
}
