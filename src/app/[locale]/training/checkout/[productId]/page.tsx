/**
 * Training Checkout Page
 * Stripe-integrated payment for CPD courses
 */

import React from 'react';
import CheckoutClient from './CheckoutClient';

interface CheckoutPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { productId } = await params;
  return <CheckoutClient productId={productId} />;
}

