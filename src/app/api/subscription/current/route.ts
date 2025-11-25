import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Calculate usage
    const [casesCount, interventionsCount, assessmentsCount] = await Promise.all([
      prisma.cases.count({ where: { tenant_id: tenant.id } }),
      prisma.interventions.count({ where: { tenant_id: tenant.id } }),
      prisma.assessments.count({ where: { tenant_id: tenant.id } }),
    ]);

    // Mock storage usage for now as we don't track file sizes in DB yet
    // In a real scenario, we would sum up attachment sizes
    const storageUsedMb = 125; 
    
    // Mock AI assessments used for now
    const aiAssessmentsUsed = 5;

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
      storage_used_mb: storageUsedMb,
      ai_assessments_used: aiAssessmentsUsed,
    };

    return NextResponse.json({
      subscription: subscriptionData,
      usage: usageData,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
