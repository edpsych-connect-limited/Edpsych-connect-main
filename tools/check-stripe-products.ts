/**
 * Check Stripe Products
 * Verifies add-on products exist with correct pricing
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
});

async function checkProducts() {
  console.log('=== STRIPE PRODUCT CHECK ===\n');
  
  try {
    const products = await stripe.products.list({ limit: 100 });
    console.log('Total products found:', products.data.length);
    
    const addonKeywords = ['AI Power', 'EHCP', 'CPD', 'API Access', 'White Label', 'Priority Support'];
    const addons = products.data.filter(p => addonKeywords.some(k => p.name.includes(k)));
    
    console.log('\n=== ADD-ON PRODUCTS ===');
    if (addons.length === 0) {
      console.log('❌ NO ADD-ON PRODUCTS FOUND IN STRIPE');
      console.log('\n👉 Run: npx tsx tools/stripe-setup-2025.ts to create them\n');
    } else {
      for (const addon of addons) {
        console.log('✅', addon.name, '-', addon.id);
        
        // Get prices
        const prices = await stripe.prices.list({ product: addon.id, limit: 10 });
        for (const price of prices.data) {
          const amount = (price.unit_amount! / 100).toFixed(2);
          const interval = price.recurring?.interval || 'one-time';
          console.log(`   £${amount}/${interval}`);
        }
      }
    }
    
    // Check for subscription products
    const subKeywords = ['Teacher', 'School', 'MAT', 'LA ', 'Trainee', 'Individual EP', 'Parent'];
    const subs = products.data.filter(p => subKeywords.some(k => p.name.includes(k)));
    
    console.log('\n=== SUBSCRIPTION PRODUCTS ===');
    console.log('Found', subs.length, 'subscription products');
    subs.slice(0, 10).forEach(p => console.log('  •', p.name));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();
