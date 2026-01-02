
import React from 'react';
import CheckoutClient from './CheckoutClient';

interface CheckoutPageProps {
  searchParams: Promise<{
    plan: string;
    billing: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { plan, billing } = await searchParams;
  return <CheckoutClient planId={plan} billingPeriod={billing as 'monthly' | 'annual'} />;
}
