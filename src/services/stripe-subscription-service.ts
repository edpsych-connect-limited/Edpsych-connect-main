import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma/client";
import { logger } from "@/lib/logger";

export class StripeSubscriptionService {

  /**
   * Get existing Stripe Customer ID or create a new one for the Tenant
   */
  async getOrCreateCustomer(tenantId: number, email: string, name: string): Promise<string> {
    const stripe = getStripe();
    
    // Find latest subscription to get customer ID
    const sub = await prisma.subscriptions.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    });

    if (sub?.stripe_customer_id) {
      return sub.stripe_customer_id;
    }

    logger.info("Creating Stripe Customer for Tenant", { tenantId });

    // Create Customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenantId: tenantId.toString()
      }
    });

    return customer.id;
  }

  /**
   * Initiate a Checkout Session for a Subscription
   */
  async createCheckoutSession(
    tenantId: number,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    userEmail: string
  ) {
    const stripe = getStripe();
    
    const tenant = await prisma.tenants.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error("Tenant not found");

    const customerId = await this.getOrCreateCustomer(tenantId, userEmail, tenant.name);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
            tenantId: tenantId.toString()
        }
      },
      metadata: {
          tenantId: tenantId.toString()
      }
    });

    logger.info("Created functionality checkout session", { tenantId, sessionId: session.id });

    return session.url;
  }

  /**
   * Create a Customer Portal session for managing subscription
   */
  async createPortalSession(tenantId: number, returnUrl: string) {
      const stripe = getStripe();
      
      const sub = await prisma.subscriptions.findFirst({
        where: { tenant_id: tenantId },
        orderBy: { created_at: 'desc' }
      });
      
      if (!sub?.stripe_customer_id) {
          throw new Error("No billing account found for this tenant");
      }

      const session = await stripe.billingPortal.sessions.create({
          customer: sub.stripe_customer_id,
          return_url: returnUrl,
      });

      return session.url;
  }
}

export const stripeSubscriptionService = new StripeSubscriptionService();
