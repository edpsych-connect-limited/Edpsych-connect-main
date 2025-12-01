/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/help/categories
 * Returns all help categories with article counts
 */
export async function GET() {
  try {
    const categories = await prisma.helpCategory.findMany({
      where: {
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        order_index: true,
        _count: {
          select: {
            articles: {
              where: {
                is_published: true,
              },
            },
          },
        },
      },
      orderBy: {
        order_index: 'asc',
      },
    });

    // Transform the response to include article count at top level
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      orderIndex: category.order_index,
      articleCount: category._count.articles,
    }));

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
      total: formattedCategories.length,
    });
  } catch (_error) {
    console._error('Help categories _error:', _error);
    return NextResponse.json(
      {
        success: false,
        _error: 'Failed to fetch help categories',
        categories: [],
      },
      { status: 500 }
    );
  }
}
