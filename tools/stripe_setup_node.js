import Stripe from 'stripe';
// import { PrismaClient } from '@prisma/client';

// TIER_DEFINITIONS copied from src/lib/featureGate.ts because we can't easily import TS in JS script without build step
const TIER_DEFINITIONS = [
  {
    id: 'FREE',
    name: 'Free Tier',
    description: 'For students and trial users',
    priceMonthly: 0,
    priceAnnual: 0,
  },
  {
    id: 'TRAINEE',
    name: 'Trainee EP',
    description: 'Discounted for verified trainees',
    priceMonthly: 1000,
    priceAnnual: 10000,
  },
  {
    id: 'EP_INDEPENDENT',
    name: 'Independent EP',
    description: 'Full suite for independent practitioners',
    priceMonthly: 3000,
    priceAnnual: 30000,
  },
  {
    id: 'EP_GROUP_SMALL',
    name: 'EP Group (Small)',
    description: 'For small practices',
    priceMonthly: 8000,
    priceAnnual: 80000,
  },
  {
    id: 'EP_GROUP_LARGE',
    name: 'EP Group (Large)',
    description: 'For larger practices',
    priceMonthly: 15000,
    priceAnnual: 150000,
  },
  {
    id: 'SCHOOL_SMALL',
    name: 'School (Small)',
    description: 'For small schools',
    priceMonthly: 5000,
    priceAnnual: 50000,
  },
  {
    id: 'SCHOOL_LARGE',
    name: 'School (Large)',
    description: 'For larger schools',
    priceMonthly: 15000,
    priceAnnual: 150000,
  },
  {
    id: 'MAT_SMALL',
    name: 'MAT (Small)',
    description: 'For small Multi-Academy Trusts',
    priceMonthly: 25000,
    priceAnnual: 250000,
  },
  {
    id: 'MAT_LARGE',
    name: 'MAT (Large)',
    description: 'For large Multi-Academy Trusts',
    priceMonthly: 50000,
    priceAnnual: 500000,
  },
  {
    id: 'LA_TIER1',
    name: 'Local Authority (Tier 1)',
    description: 'Entry level for LAs',
    priceMonthly: 50000,
    priceAnnual: 500000,
  },
  {
    id: 'LA_TIER2',
    name: 'Local Authority (Tier 2)',
    description: 'Mid level for LAs',
    priceMonthly: 100000,
    priceAnnual: 1000000,
  },
  {
    id: 'LA_TIER3',
    name: 'Local Authority (Tier 3)',
    description: 'Full suite for LAs',
    priceMonthly: 200000,
    priceAnnual: 2000000,
  },
  {
    id: 'RESEARCH_INDIVIDUAL',
    name: 'Researcher (Individual)',
    description: 'For individual researchers',
    priceMonthly: 2000,
    priceAnnual: 20000,
  },
  {
    id: 'RESEARCH_INSTITUTION',
    name: 'Research Institution',
    description: 'For research institutions',
    priceMonthly: 20000,
    priceAnnual: 200000,
  },
  {
    id: 'ENTERPRISE_CUSTOM',
    name: 'Enterprise Custom',
    description: 'Custom solution',
    priceMonthly: 0,
    priceAnnual: 0,
  }
];

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  });

  console.log('Starting Stripe setup...');

  for (const tier of TIER_DEFINITIONS) {
    console.log(`Processing tier: ${tier.name} (${tier.id})`);

    // Check if product exists
    const products = await stripe.products.search({
      query: `metadata['tier']:'${tier.id}'`,
    });

    let product;
    if (products.data.length > 0) {
      console.log(`  Product already exists: ${products.data[0].id}`);
      product = products.data[0];
    } else {
      console.log(`  Creating product...`);
      product = await stripe.products.create({
        name: tier.name,
        description: tier.description,
        metadata: {
          tier: tier.id,
        },
      });
      console.log(`  Created product: ${product.id}`);
    }

    // Create prices if not free and not custom
    if (tier.priceMonthly > 0) {
      // Monthly
      const pricesMonthly = await stripe.prices.search({
        query: `product:'${product.id}' AND metadata['interval']:'month'`,
      });

      if (pricesMonthly.data.length === 0) {
        console.log(`  Creating monthly price (£${tier.priceMonthly / 100})...`);
        await stripe.prices.create({
          product: product.id,
          unit_amount: tier.priceMonthly,
          currency: 'gbp',
          recurring: { interval: 'month' },
          metadata: { interval: 'month', tier: tier.id },
        });
      } else {
        console.log(`  Monthly price exists.`);
      }

      // Annual
      const pricesAnnual = await stripe.prices.search({
        query: `product:'${product.id}' AND metadata['interval']:'year'`,
      });

      if (pricesAnnual.data.length === 0) {
        console.log(`  Creating annual price (£${tier.priceAnnual / 100})...`);
        await stripe.prices.create({
          product: product.id,
          unit_amount: tier.priceAnnual,
          currency: 'gbp',
          recurring: { interval: 'year' },
          metadata: { interval: 'year', tier: tier.id },
        });
      } else {
        console.log(`  Annual price exists.`);
      }
    }
  }

  console.log('Stripe setup complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
