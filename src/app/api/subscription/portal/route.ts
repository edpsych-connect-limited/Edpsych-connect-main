import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { StripeSubscriptionService } from '@/services/stripe-subscription-service';
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

const subscriptionService = new StripeSubscriptionService();

export async function POST(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the return URL from the request or default to the subscription page
    const { returnUrl } = await request.json().catch(() => ({}));
    const actualReturnUrl = returnUrl || `${request.nextUrl.origin}/subscription`;

    // We assume the user belongs to a tenant (user.tenantId)
    // If your auth strategy stores tenantId differently, adjust here.
    // Based on previous context, user object usually has tenantId.
    // However, authService.getSessionFromRequest might return a limited user object.
    
    // Let's verify we have a valid tenantId.
    // If session.user.tenantId is missing, we might need to fetch the user profile.
    
    // Safety check: currently checking strict type of session.user
    // If tenantId is not on the type, we might need to fetch it or cast it if we know it's there.
    
    // Assuming session.user has tenantId or we need to look it up.
    // Let's fetch the full user to be safe if tenantId is missing from session
    let tenantId = session.tenant_id;

    if (!tenantId) {
        // Fallback: fetch user from DB if needed, but usually session has it.
        // For now, logging error if missing.
        logger.error("User session missing tenantId", { userId: session.id });
         return NextResponse.json(
            { success: false, error: 'User tenant information missing' },
            { status: 400 }
        );
    }

    const portalUrl = await subscriptionService.createPortalSession(
        Number(tenantId),
        actualReturnUrl
    );

    return NextResponse.json({ success: true, url: portalUrl });
  } catch (error: any) {
    logger.error("Failed to create portal session", { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
