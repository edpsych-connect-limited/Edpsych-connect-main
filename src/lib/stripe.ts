/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not defined');
}

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

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-10-29.clover' as Stripe.LatestApiVersion, // Latest Stripe API version
});

// Export the Stripe constructor for type checking
export { Stripe };
