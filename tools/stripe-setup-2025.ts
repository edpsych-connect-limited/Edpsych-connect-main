/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * STRIPE PRODUCT SETUP SCRIPT - December 2025
 * 
 * This script creates/updates all Stripe products and prices.
 * Run this script to set up the complete pricing structure in Stripe.
 * 
 * USAGE:
 * 1. Ensure STRIPE_SECRET_KEY is set in .env or environment
 * 2. Run: npx tsx tools/stripe-setup-2025.ts
 * 
 * IMPORTANT: This will create NEW products. Archive old products in Stripe Dashboard.
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Check for Stripe key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error('');
  console.error('Please ensure one of the following:');
  console.error('1. STRIPE_SECRET_KEY is set in your .env or .env.local file');
  console.error('2. Or run with: STRIPE_SECRET_KEY=sk_test_xxx npx tsx tools/stripe-setup-2025.ts');
  console.error('');
  console.error('You can find your Stripe secret key at:');
  console.error('https://dashboard.stripe.com/apikeys');
  process.exit(1);
}

console.log('🔑 Stripe key loaded successfully');
console.log(`   Using key: ${stripeKey.substring(0, 8)}...${stripeKey.substring(stripeKey.length - 4)}`);
console.log('');

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
});

// ============================================================================
// PRODUCT DEFINITIONS
// ============================================================================

interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  priceMonthlyPence: number;
  priceAnnualPence: number;
  metadata: Record<string, string>;
}

const PRODUCTS: ProductDefinition[] = [
  // INDIVIDUAL PROFESSIONALS
  {
    id: 'PARENT_PLUS',
    name: 'EdPsych Connect - Parent Plus',
    description: 'Enhanced parent access with progress tracking and resources',
    priceMonthlyPence: 999,
    priceAnnualPence: 9900,
    metadata: { tier: 'PARENT_PLUS', target: 'individual', category: 'parent' }
  },
  {
    id: 'TEACHER_INDIVIDUAL',
    name: 'EdPsych Connect - Teacher Individual',
    description: 'Complete toolkit for classroom teachers and SENCOs',
    priceMonthlyPence: 2900,
    priceAnnualPence: 29000,
    metadata: { tier: 'TEACHER_INDIVIDUAL', target: 'individual', category: 'teacher' }
  },
  {
    id: 'TRAINEE_EP',
    name: 'EdPsych Connect - Trainee EP',
    description: 'Discounted rate for verified EP trainees',
    priceMonthlyPence: 1900,
    priceAnnualPence: 19000,
    metadata: { tier: 'TRAINEE_EP', target: 'individual', category: 'ep' }
  },
  {
    id: 'INDIVIDUAL_EP',
    name: 'EdPsych Connect - Individual EP',
    description: 'Everything an independent EP needs to run a modern practice',
    priceMonthlyPence: 7900,
    priceAnnualPence: 79000,
    metadata: { tier: 'INDIVIDUAL_EP', target: 'individual', category: 'ep' }
  },
  
  // SCHOOLS
  {
    id: 'SCHOOL_STARTER',
    name: 'EdPsych Connect - School Starter',
    description: 'Perfect for primary schools with up to 200 pupils',
    priceMonthlyPence: 14900,
    priceAnnualPence: 149000,
    metadata: { tier: 'SCHOOL_STARTER', target: 'school', maxStudents: '200' }
  },
  {
    id: 'SCHOOL_STANDARD',
    name: 'EdPsych Connect - School Standard',
    description: 'For medium schools with 200-500 pupils',
    priceMonthlyPence: 29900,
    priceAnnualPence: 299000,
    metadata: { tier: 'SCHOOL_STANDARD', target: 'school', maxStudents: '500' }
  },
  {
    id: 'SCHOOL_PREMIUM',
    name: 'EdPsych Connect - School Premium',
    description: 'For secondary schools with 500+ pupils',
    priceMonthlyPence: 49900,
    priceAnnualPence: 499000,
    metadata: { tier: 'SCHOOL_PREMIUM', target: 'school', maxStudents: '1500' }
  },
  {
    id: 'SCHOOL_SPECIAL',
    name: 'EdPsych Connect - Special School',
    description: 'Enhanced features for special schools and PRUs',
    priceMonthlyPence: 59900,
    priceAnnualPence: 599000,
    metadata: { tier: 'SCHOOL_SPECIAL', target: 'school', category: 'special' }
  },
  
  // MULTI-ACADEMY TRUSTS
  {
    id: 'MAT_SMALL',
    name: 'EdPsych Connect - MAT Small',
    description: 'For MATs with 2-5 schools',
    priceMonthlyPence: 79900,
    priceAnnualPence: 799000,
    metadata: { tier: 'MAT_SMALL', target: 'mat', maxSchools: '5' }
  },
  {
    id: 'MAT_MEDIUM',
    name: 'EdPsych Connect - MAT Medium',
    description: 'For MATs with 6-15 schools',
    priceMonthlyPence: 149900,
    priceAnnualPence: 1499000,
    metadata: { tier: 'MAT_MEDIUM', target: 'mat', maxSchools: '15' }
  },
  {
    id: 'MAT_LARGE',
    name: 'EdPsych Connect - MAT Large',
    description: 'For MATs with 16-30 schools',
    priceMonthlyPence: 249900,
    priceAnnualPence: 2499000,
    metadata: { tier: 'MAT_LARGE', target: 'mat', maxSchools: '30' }
  },
  {
    id: 'MAT_ENTERPRISE',
    name: 'EdPsych Connect - MAT Enterprise',
    description: 'For MATs with 31+ schools',
    priceMonthlyPence: 399900,
    priceAnnualPence: 3999000,
    metadata: { tier: 'MAT_ENTERPRISE', target: 'mat', maxSchools: '100' }
  },
  
  // LOCAL AUTHORITIES
  {
    id: 'LA_ESSENTIALS',
    name: 'EdPsych Connect - LA Essentials',
    description: 'For LAs with up to 50 maintained schools',
    priceMonthlyPence: 349900,
    priceAnnualPence: 3499000,
    metadata: { tier: 'LA_ESSENTIALS', target: 'la', maxSchools: '50' }
  },
  {
    id: 'LA_PROFESSIONAL',
    name: 'EdPsych Connect - LA Professional',
    description: 'For LAs with 50-150 maintained schools',
    priceMonthlyPence: 699900,
    priceAnnualPence: 6999000,
    metadata: { tier: 'LA_PROFESSIONAL', target: 'la', maxSchools: '150' }
  },
  {
    id: 'LA_ENTERPRISE',
    name: 'EdPsych Connect - LA Enterprise',
    description: 'For LAs with 150-300 maintained schools',
    priceMonthlyPence: 1499900,
    priceAnnualPence: 14999000,
    metadata: { tier: 'LA_ENTERPRISE', target: 'la', maxSchools: '300' }
  },
  {
    id: 'LA_METROPOLITAN',
    name: 'EdPsych Connect - LA Metropolitan',
    description: 'For LAs with 300+ maintained schools',
    priceMonthlyPence: 2999900,
    priceAnnualPence: 29999000,
    metadata: { tier: 'LA_METROPOLITAN', target: 'la', maxSchools: 'unlimited' }
  },
  
  // RESEARCH
  {
    id: 'RESEARCH_INDIVIDUAL',
    name: 'EdPsych Connect - Research Individual',
    description: 'For doctoral and independent researchers',
    priceMonthlyPence: 3900,
    priceAnnualPence: 39000,
    metadata: { tier: 'RESEARCH_INDIVIDUAL', target: 'research' }
  },
  {
    id: 'RESEARCH_TEAM',
    name: 'EdPsych Connect - Research Team',
    description: 'For university research groups',
    priceMonthlyPence: 19900,
    priceAnnualPence: 199000,
    metadata: { tier: 'RESEARCH_TEAM', target: 'research' }
  },
  {
    id: 'RESEARCH_INSTITUTION',
    name: 'EdPsych Connect - Research Institution',
    description: 'University-wide license',
    priceMonthlyPence: 99900,
    priceAnnualPence: 999000,
    metadata: { tier: 'RESEARCH_INSTITUTION', target: 'research' }
  }
];

// ADD-ONS
const ADD_ONS: ProductDefinition[] = [
  {
    id: 'ADDON_AI_POWER',
    name: 'EdPsych Connect - AI Power Pack',
    description: '500 additional AI calls per month',
    priceMonthlyPence: 2900,
    priceAnnualPence: 29000,
    metadata: { type: 'addon', category: 'ai' }
  },
  {
    id: 'ADDON_EHCP_ACCELERATOR',
    name: 'EdPsych Connect - EHCP Accelerator',
    description: 'Advanced EHCP tools and templates',
    priceMonthlyPence: 4900,
    priceAnnualPence: 49000,
    metadata: { type: 'addon', category: 'ehcp' }
  },
  {
    id: 'ADDON_CPD_UNLIMITED',
    name: 'EdPsych Connect - CPD Library Unlimited',
    description: 'Unlimited access to all CPD courses',
    priceMonthlyPence: 9900,
    priceAnnualPence: 99000,
    metadata: { type: 'addon', category: 'cpd' }
  },
  {
    id: 'ADDON_API_ACCESS',
    name: 'EdPsych Connect - API Access',
    description: 'Developer API for custom integrations',
    priceMonthlyPence: 19900,
    priceAnnualPence: 199000,
    metadata: { type: 'addon', category: 'api' }
  },
  {
    id: 'ADDON_WHITE_LABEL',
    name: 'EdPsych Connect - White Label',
    description: 'Remove EdPsych Connect branding',
    priceMonthlyPence: 49900,
    priceAnnualPence: 499000,
    metadata: { type: 'addon', category: 'branding' }
  },
  {
    id: 'ADDON_PRIORITY_SUPPORT',
    name: 'EdPsych Connect - Priority Support',
    description: '4-hour response SLA',
    priceMonthlyPence: 7900,
    priceAnnualPence: 79000,
    metadata: { type: 'addon', category: 'support' }
  }
];

// ONE-TIME PURCHASES
interface OneTimeProduct {
  id: string;
  name: string;
  description: string;
  pricePence: number;
  metadata: Record<string, string>;
}

const ONE_TIME_PRODUCTS: OneTimeProduct[] = [
  {
    id: 'ONBOARD_SCHOOL',
    name: 'EdPsych Connect - School Onboarding',
    description: 'Training, setup, data migration support',
    pricePence: 49900,
    metadata: { type: 'onetime', category: 'onboarding' }
  },
  {
    id: 'ONBOARD_MAT',
    name: 'EdPsych Connect - MAT Onboarding',
    description: 'Multi-school onboarding with training',
    pricePence: 199900,
    metadata: { type: 'onetime', category: 'onboarding' }
  },
  {
    id: 'ONBOARD_LA',
    name: 'EdPsych Connect - LA Onboarding',
    description: 'Full LA-wide implementation',
    pricePence: 499900,
    metadata: { type: 'onetime', category: 'onboarding' }
  },
  {
    id: 'INTEGRATION_SIMS',
    name: 'EdPsych Connect - SIMS Integration',
    description: 'Custom integration with SIMS MIS',
    pricePence: 249900,
    metadata: { type: 'onetime', category: 'integration' }
  },
  {
    id: 'INTEGRATION_ARBOR',
    name: 'EdPsych Connect - Arbor Integration',
    description: 'Custom integration with Arbor MIS',
    pricePence: 249900,
    metadata: { type: 'onetime', category: 'integration' }
  }
];

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting EdPsych Connect Stripe Setup - December 2025\n');
  console.log('📦 Creating/updating products and prices...\n');
  
  const results: { products: string[], prices: string[] } = { products: [], prices: [] };
  
  // Process subscription products
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📋 SUBSCRIPTION PRODUCTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const product of PRODUCTS) {
    try {
      console.log(`📦 Processing: ${product.name}`);
      
      // Check if product exists
      const existingProducts = await stripe.products.search({
        query: `metadata['tier']:'${product.id}'`,
      });
      
      let stripeProduct: Stripe.Product;
      
      if (existingProducts.data.length > 0) {
        // Update existing product
        stripeProduct = await stripe.products.update(existingProducts.data[0].id, {
          name: product.name,
          description: product.description,
          metadata: product.metadata,
        });
        console.log(`   ✅ Updated product: ${stripeProduct.id}`);
      } else {
        // Create new product
        stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          metadata: product.metadata,
        });
        console.log(`   ✅ Created product: ${stripeProduct.id}`);
      }
      
      results.products.push(`${product.id}: ${stripeProduct.id}`);
      
      // Create/update prices if not zero
      if (product.priceMonthlyPence > 0) {
        // Monthly price
        const monthlyPrices = await stripe.prices.search({
          query: `product:'${stripeProduct.id}' AND metadata['interval']:'month'`,
        });
        
        if (monthlyPrices.data.length === 0) {
          const monthlyPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: product.priceMonthlyPence,
            currency: 'gbp',
            recurring: { interval: 'month' },
            metadata: { interval: 'month', tier: product.id },
          });
          console.log(`   💰 Monthly price: £${product.priceMonthlyPence / 100} (${monthlyPrice.id})`);
          results.prices.push(`${product.id}_monthly: ${monthlyPrice.id}`);
        } else {
          console.log(`   💰 Monthly price exists: ${monthlyPrices.data[0].id}`);
          results.prices.push(`${product.id}_monthly: ${monthlyPrices.data[0].id}`);
        }
        
        // Annual price
        const annualPrices = await stripe.prices.search({
          query: `product:'${stripeProduct.id}' AND metadata['interval']:'year'`,
        });
        
        if (annualPrices.data.length === 0) {
          const annualPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: product.priceAnnualPence,
            currency: 'gbp',
            recurring: { interval: 'year' },
            metadata: { interval: 'year', tier: product.id },
          });
          console.log(`   💰 Annual price: £${product.priceAnnualPence / 100} (${annualPrice.id})`);
          results.prices.push(`${product.id}_annual: ${annualPrice.id}`);
        } else {
          console.log(`   💰 Annual price exists: ${annualPrices.data[0].id}`);
          results.prices.push(`${product.id}_annual: ${annualPrices.data[0].id}`);
        }
      }
      
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error processing ${product.name}:`, error);
    }
  }
  
  // Process add-ons
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 ADD-ON PRODUCTS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const addon of ADD_ONS) {
    try {
      console.log(`🔧 Processing: ${addon.name}`);
      
      const existingProducts = await stripe.products.search({
        query: `metadata['type']:'addon' AND name~'${addon.id}'`,
      });
      
      let stripeProduct: Stripe.Product;
      
      if (existingProducts.data.length > 0) {
        stripeProduct = await stripe.products.update(existingProducts.data[0].id, {
          name: addon.name,
          description: addon.description,
          metadata: addon.metadata,
        });
        console.log(`   ✅ Updated addon: ${stripeProduct.id}`);
      } else {
        stripeProduct = await stripe.products.create({
          name: addon.name,
          description: addon.description,
          metadata: { ...addon.metadata, addon_id: addon.id },
        });
        console.log(`   ✅ Created addon: ${stripeProduct.id}`);
      }
      
      // Create prices
      if (addon.priceMonthlyPence > 0) {
        const monthlyPrices = await stripe.prices.search({
          query: `product:'${stripeProduct.id}' AND metadata['interval']:'month'`,
        });
        
        if (monthlyPrices.data.length === 0) {
          await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: addon.priceMonthlyPence,
            currency: 'gbp',
            recurring: { interval: 'month' },
            metadata: { interval: 'month', addon_id: addon.id },
          });
          console.log(`   💰 Monthly: £${addon.priceMonthlyPence / 100}`);
        }
      }
      
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error processing ${addon.name}:`, error);
    }
  }
  
  // Process one-time purchases
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🛒 ONE-TIME PURCHASES');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  for (const oneTime of ONE_TIME_PRODUCTS) {
    try {
      console.log(`🛒 Processing: ${oneTime.name}`);
      
      // One-time products don't have recurring prices
      const stripeProduct = await stripe.products.create({
        name: oneTime.name,
        description: oneTime.description,
        metadata: { ...oneTime.metadata, onetime_id: oneTime.id },
      });
      
      await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: oneTime.pricePence,
        currency: 'gbp',
        metadata: { onetime_id: oneTime.id },
      });
      
      console.log(`   ✅ Created: ${stripeProduct.id} - £${oneTime.pricePence / 100}`);
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error processing ${oneTime.name}:`, error);
    }
  }
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`✅ Products created/updated: ${results.products.length}`);
  console.log(`✅ Prices created/updated: ${results.prices.length}`);
  console.log('\n🎉 Stripe setup complete!\n');
  
  console.log('📋 PRODUCT IDS (update stripe-config.ts with these):');
  console.log('─────────────────────────────────────────────────────');
  results.products.forEach(p => console.log(`  ${p}`));
  
  console.log('\n📋 PRICE IDS:');
  console.log('─────────────────────────────────────────────────────');
  results.prices.forEach(p => console.log(`  ${p}`));
  
  console.log('\n⚠️  IMPORTANT NEXT STEPS:');
  console.log('1. Update src/lib/stripe-config.ts with the new product/price IDs');
  console.log('2. Update webhook URL in Stripe Dashboard to: https://edpsych-connect-limited.vercel.app/api/webhooks/stripe');
  console.log('3. Archive old products in Stripe Dashboard');
  console.log('4. Test subscription flow in test mode');
}

main().catch(console.error);
