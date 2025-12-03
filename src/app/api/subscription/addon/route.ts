/**
 * Add-On Subscription API Route
 * Handles adding premium add-ons to existing subscriptions via Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
    })
  : null;

// Add-on price IDs (these should be created via stripe-setup-2025.ts)
const ADDON_PRICES: Record<string, { monthly: string; annual: string; name: string }> = {
  ADDON_AI_POWER: {
    name: 'AI Power Pack',
    monthly: process.env.STRIPE_PRICE_ADDON_AI_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ADDON_AI_ANNUAL || '',
  },
  ADDON_EHCP_ACCELERATOR: {
    name: 'EHCP Accelerator',
    monthly: process.env.STRIPE_PRICE_ADDON_EHCP_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ADDON_EHCP_ANNUAL || '',
  },
  ADDON_CPD_UNLIMITED: {
    name: 'CPD Library Unlimited',
    monthly: process.env.STRIPE_PRICE_ADDON_CPD_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ADDON_CPD_ANNUAL || '',
  },
  ADDON_API_ACCESS: {
    name: 'API Access',
    monthly: process.env.STRIPE_PRICE_ADDON_API_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ADDON_API_ANNUAL || '',
  },
  ADDON_WHITE_LABEL: {
    name: 'White Label',
    monthly: process.env.STRIPE_PRICE_ADDON_WHITE_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ADDON_WHITE_ANNUAL || '',
  },
  ADDON_PRIORITY_SUPPORT: {
    name: 'Priority Support',
    monthly: process.env.STRIPE_PRICE_ADDON_SUPPORT_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ADDON_SUPPORT_ANNUAL || '',
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check Stripe configuration
    if (!stripe) {
      console.error('Stripe not configured');
      return NextResponse.json(
        { success: false, message: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { addonId, billingPeriod } = body;

    // Validate addon
    const addonConfig = ADDON_PRICES[addonId];
    if (!addonConfig) {
      return NextResponse.json(
        { success: false, message: 'Invalid add-on selected' },
        { status: 400 }
      );
    }

    // Get the appropriate price ID
    const priceId = billingPeriod === 'annual' ? addonConfig.annual : addonConfig.monthly;
    
    // If no price ID configured, create checkout session with inline price
    // This allows the system to work even before stripe-setup-2025.ts is run
    const addonPrices: Record<string, { monthly: number; annual: number }> = {
      ADDON_AI_POWER: { monthly: 4999, annual: 49990 },
      ADDON_EHCP_ACCELERATOR: { monthly: 7999, annual: 79990 },
      ADDON_CPD_UNLIMITED: { monthly: 2999, annual: 29990 },
      ADDON_API_ACCESS: { monthly: 19999, annual: 199990 },
      ADDON_WHITE_LABEL: { monthly: 49999, annual: 499990 },
      ADDON_PRIORITY_SUPPORT: { monthly: 9999, annual: 99990 },
    };

    const prices = addonPrices[addonId];
    const unitAmount = billingPeriod === 'annual' ? prices.annual : prices.monthly;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email,
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: `EdPsych Connect - ${addonConfig.name}`,
                  description: `${addonConfig.name} add-on subscription`,
                },
                unit_amount: unitAmount,
                recurring: {
                  interval: billingPeriod === 'annual' ? 'year' : 'month',
                },
              },
              quantity: 1,
            },
          ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://edpsychconnect.com'}/subscription?addon_success=${addonId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://edpsychconnect.com'}/subscription/addon?id=${addonId}&cancelled=true`,
      metadata: {
        userId: session.user.email,
        addonId: addonId,
        billingPeriod: billingPeriod,
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Add-on subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process subscription',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return available add-ons with their prices
  const addons = Object.entries(ADDON_PRICES).map(([id, config]) => ({
    id,
    name: config.name,
    hasPrices: !!(config.monthly || config.annual),
  }));

  return NextResponse.json({
    success: true,
    addons,
  });
}
