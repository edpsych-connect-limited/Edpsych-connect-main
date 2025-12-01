/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        tenants: {
          include: {
            subscriptions: {
              where: { is_active: true },
              orderBy: { created_at: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user || !user.tenants) {
      return new NextResponse('User or Tenant not found', { status: 404 });
    }

    const tenant = user.tenants;
    const subscription = tenant.subscriptions[0];

    // Calculate usage from database
    const [
      casesCount, 
      interventionsCount, 
      assessmentsCount,
      attachmentsCount,
      aiEventsCount,
    ] = await Promise.all([
      prisma.cases.count({ where: { tenant_id: tenant.id } }),
      prisma.interventions.count({ where: { tenant_id: tenant.id } }),
      prisma.assessments.count({ where: { tenant_id: tenant.id } }),
      // Count attachments for storage estimate
      prisma.attachments.count({ where: { tenant_id: tenant.id } }),
      // Count AI assessment events for this user
      prisma.analyticsEvent.count({
        where: {
          userId: user.id,
          eventType: { in: ['completion', 'assessment'] },
        },
      }),
    ]);

    // Estimate storage: assume average file size of 2MB per attachment
    // This is a reasonable estimate until file_size tracking is added
    const estimatedStorageMb = attachmentsCount * 2;
    
    // AI assessments used from analytics events
    const aiAssessmentsUsed = aiEventsCount;

    // Default to a free trial if no subscription found
    const subscriptionData = subscription ? {
      id: subscription.id,
      plan_id: subscription.tier.toLowerCase().replace('_', '-'), // Map enum to plan ID
      status: subscription.is_active ? 'active' : 'expired',
      billing_period: 'monthly', // Default, should be in DB
      current_period_start: subscription.start_date.toISOString(),
      current_period_end: subscription.end_date.toISOString(),
      cancel_at_period_end: false, // Should be in DB
      stripe_subscription_id: subscription.stripe_subscription_id,
      trial_end: null, // Should be in DB
    } : {
      id: 0,
      plan_id: 'free',
      status: 'trial',
      billing_period: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const usageData = {
      cases_count: casesCount,
      interventions_count: interventionsCount,
      assessments_count: assessmentsCount,
      attachments_count: attachmentsCount,
      storage_used_mb: estimatedStorageMb,
      ai_assessments_used: aiAssessmentsUsed,
      data_source: 'database',
    };

    return NextResponse.json({
      subscription: subscriptionData,
      usage: usageData,
    });
  } catch (_error) {
    console._error('Error fetching subscription:', _error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
