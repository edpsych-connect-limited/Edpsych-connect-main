/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

// Define types matching the Prisma schema
export enum SubscriptionTier {
  ESSENTIAL = 'ESSENTIAL',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  RESEARCHER = 'RESEARCHER',
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  CUSTOM = 'CUSTOM'
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  TERMLY = 'TERMLY',
  ANNUALLY = 'ANNUALLY'
}

export enum UserType {
  SCHOOL_USER = 'SCHOOL_USER',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  PSYCHOLOGIST_USER = 'PSYCHOLOGIST_USER',
  RESEARCHER_USER = 'RESEARCHER_USER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }

  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: '2025-10-29.clover' as Stripe.LatestApiVersion, // Latest Stripe API version
  });

  return stripeClient;
}

// Export the Stripe constructor for type checking
export { Stripe };
