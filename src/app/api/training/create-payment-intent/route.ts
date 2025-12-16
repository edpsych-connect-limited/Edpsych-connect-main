/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      const nextAuthSecret = process.env.NEXTAUTH_SECRET;
      if (!nextAuthSecret) {
        return NextResponse.json(
          { error: 'Server misconfiguration: NEXTAUTH_SECRET is not set' },
          { status: 500 }
        );
      }

      decoded = jwt.verify(token, nextAuthSecret);
    } catch (_err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
        return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    // 2. Parse Body
    const body = await request.json();
    const { product_id, discount_code } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 3. Fetch Product
    const product = await prisma.trainingProduct.findUnique({
      where: { id: product_id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 4. Calculate Price
    let amount = product.price_gbp * 100; // Convert to pence
    let discountAmount = 0;

    // Validate discount code (simple implementation)
    if (discount_code) {
      // TODO: Implement proper discount code lookup from DB
      // For now, check hardcoded or simple logic
      if (discount_code === 'BETA2025') {
         discountAmount = Math.round(amount * 0.20); // 20% off
      }
    }
    
    const finalAmount = Math.max(50, amount - discountAmount); // Minimum 50p

    const stripe = getStripe();

    // 5. Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'gbp',
      metadata: {
        userId: userId.toString(),
        productId: product_id,
        discountCode: discount_code || ''
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 6. Create Purchase Record
    const purchase = await prisma.trainingPurchase.create({
      data: {
        user_id: parseInt(userId),
        email: decoded.email,
        product_id: product.id,
        product_name: product.name,
        product_type: product.type,
        amount_paid_pence: finalAmount,
        currency: 'GBP',
        discount_code: discount_code,
        discount_amount_pence: discountAmount,
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending',
        status: 'pending'
      }
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      purchase_id: purchase.id
    });

  } catch (error: any) {
    console.error('Payment intent error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
