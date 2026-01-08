'use server';

import { stripeConnectService } from '@/services/stripe-connect-service';
import { prisma } from '@/lib/prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Server misconfiguration: missing JWT secret');
    }

    const payload = jwt.verify(token.value, secret) as any;
    return payload; // { id, email, name, role, ... }
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

export async function getStripeConnectStatus() {
  const user = await getAuthenticatedUser();
  const userId = parseInt(user.id);

  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
    select: { stripeConnectAccountId: true }
  });

  if (!dbUser?.stripeConnectAccountId) {
    return { connected: false };
  }

  try {
    const status = await stripeConnectService.getAccountStatus(dbUser.stripeConnectAccountId);
    return { 
      connected: true, 
      accountId: dbUser.stripeConnectAccountId,
      status 
    };
  } catch (error) {
    console.error('Failed to fetch Stripe status:', error);
    return { connected: true, accountId: dbUser.stripeConnectAccountId, error: 'Failed to fetch status' };
  }
}

export async function createStripeConnectOnboarding() {
  const user = await getAuthenticatedUser();
  const userId = parseInt(user.id);

  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
    select: { email: true, name: true }
  });

  if (!dbUser) throw new Error('User not found');

  const accountId = await stripeConnectService.createConnectedAccount(
    userId,
    dbUser.email,
    dbUser.name
  );

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnUrl = `${origin}/settings?tab=payouts&status=success`;
  const refreshUrl = `${origin}/settings?tab=payouts&status=refresh`;

  const onboardingUrl = await stripeConnectService.createAccountLink(
    accountId,
    returnUrl,
    refreshUrl
  );

  return onboardingUrl;
}

export async function getStripeDashboardLink() {
  const user = await getAuthenticatedUser();
  const userId = parseInt(user.id);

  const dbUser = await prisma.users.findUnique({
    where: { id: userId },
    select: { stripeConnectAccountId: true }
  });

  if (!dbUser?.stripeConnectAccountId) {
    throw new Error('No Stripe account connected');
  }

  const url = await stripeConnectService.createLoginLink(dbUser.stripeConnectAccountId);
  return url;
}
