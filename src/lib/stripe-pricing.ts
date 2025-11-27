/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { stripe } from './stripe';

export interface PricingTier {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  metadata: Record<string, string>;
}

export async function getStripePrices(): Promise<PricingTier[]> {
  try {
    // List all active products
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    const pricingTiers: PricingTier[] = [];

    for (const product of products.data) {
      // Only include products with 'tier' metadata
      if (!product.metadata.tier) continue;

      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 1, // Assuming one main price per product for now
      });

      if (prices.data.length > 0) {
        const price = prices.data[0];
        pricingTiers.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          interval: price.recurring?.interval || 'one-time',
          metadata: product.metadata,
        });
      }
    }

    // Sort by price to ensure correct order (Free -> Pro -> Institutional -> Enterprise)
    return pricingTiers.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error('Error fetching Stripe prices:', error);
    return [];
  }
}
