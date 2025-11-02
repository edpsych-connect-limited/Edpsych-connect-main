/**
 * Training Products API
 * List and manage CPD training products
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authorizeRequest, Permission } from '@/lib/middleware/auth';
import { apiRateLimit } from '@/lib/middleware/rate-limit';

const prisma = new PrismaClient();

/**
 * GET /api/training/products
 * List all active training products
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await apiRateLimit(request);
    if (!rateLimitResult.allowed && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // No authentication required for browsing products

    const products = await prisma.trainingProduct.findMany({
      where: { status: 'active' },
      orderBy: [
        { is_featured: 'desc' },
        { sort_order: 'asc' },
        { created_at: 'desc' },
      ],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('[Training Products API] Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
