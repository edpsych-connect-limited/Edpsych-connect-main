import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const products = [
  {
    name: 'EdPsych Connect - Pro',
    description: 'For Independent Educational Psychologists',
    metadata: { tier: 'PRO' },
    prices: [
      {
        unit_amount: 4900, // £49.00
        currency: 'gbp',
        recurring: { interval: 'month' },
      }
    ]
  },
  {
    name: 'EdPsych Connect - Institutional',
    description: 'For Schools and Small MATs',
    metadata: { tier: 'INSTITUTIONAL' },
    prices: [
      {
        unit_amount: 49900, // £499.00
        currency: 'gbp',
        recurring: { interval: 'year' },
      }
    ]
  },
  {
    name: 'EdPsych Connect - LA Enterprise',
    description: 'For Local Authorities and Large MATs',
    metadata: { tier: 'LA_ENTERPRISE' },
    prices: [
      {
        unit_amount: 2500000, // £25,000.00
        currency: 'gbp',
        recurring: { interval: 'year' },
      }
    ]
  }
];

async function sync() {
  // Dynamic import to ensure env vars are loaded first
  const { stripe } = await import('../src/lib/stripe');

  console.log('🔄 Starting Stripe Product Sync...');

  for (const productData of products) {
    console.log(`Checking product: ${productData.name}`);

    // Check if product exists by metadata
    const existingProducts = await stripe.products.search({
      query: `metadata['tier']:'${productData.metadata.tier}'`,
    });

    let productId;

    if (existingProducts.data.length > 0) {
      console.log(`   ✅ Product exists: ${existingProducts.data[0].id}`);
      productId = existingProducts.data[0].id;
      // Update product details if needed
      await stripe.products.update(productId, {
        name: productData.name,
        description: productData.description,
      });
    } else {
      console.log(`   🆕 Creating product: ${productData.name}`);
      const newProduct = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: productData.metadata,
      });
      productId = newProduct.id;
      console.log(`   ✅ Created product: ${productId}`);
    }

    // Sync Prices
    for (const priceData of productData.prices) {
      // Check if price exists for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 100,
      });

      const existingPrice = prices.data.find(p => 
        p.unit_amount === priceData.unit_amount && 
        p.currency === priceData.currency && 
        p.recurring?.interval === priceData.recurring.interval
      );

      if (existingPrice) {
        console.log(`   ✅ Price exists: ${existingPrice.id} (£${priceData.unit_amount/100}/${priceData.recurring.interval})`);
      } else {
        console.log(`   🆕 Creating price: £${priceData.unit_amount/100}/${priceData.recurring.interval}`);
        const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: priceData.unit_amount,
          currency: priceData.currency,
          recurring: priceData.recurring as any,
        });
        console.log(`   ✅ Created price: ${newPrice.id}`);
      }
    }
  }

  console.log('🎉 Stripe Sync Completed!');
}

sync().catch(console.error);
