import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma/client";
import { logger } from "@/lib/logger";

export class StripeConnectService {
  
  /**
   * Create a Stripe Connect account for a professional
   */
  async createConnectedAccount(userId: number, email: string, name: string) {
    const stripe = getStripe();
    
    // 1. Check if user already has an account
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { stripeConnectAccountId: true }
    });

    if (user?.stripeConnectAccountId) {
      return user.stripeConnectAccountId;
    }

    logger.info("Creating Stripe Connect Express account for user", { userId });

    // 2. Create Connect Account (Express)
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'GB', // Default to GB for this phase
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || undefined,
        email: email
      },
      metadata: {
        userId: userId.toString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });

    // 3. Save to DB
    await prisma.users.update({
      where: { id: userId },
      data: { stripeConnectAccountId: account.id }
    });

    logger.info("Stripe Connect account created", { userId, accountId: account.id });

    return account.id;
  }

  /**
   * Create an Account Link for onboarding
   */
  async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
    const stripe = getStripe();
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Create a Login Link for the Express Dashboard
   */
  async createLoginLink(accountId: string) {
    const stripe = getStripe();
    
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }
  
  /**
   * Get account status
   */
  async getAccountStatus(accountId: string) {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(accountId);
    
    return {
      isEnabled: account.charges_enabled && account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled
    };
  }
}

export const stripeConnectService = new StripeConnectService();
