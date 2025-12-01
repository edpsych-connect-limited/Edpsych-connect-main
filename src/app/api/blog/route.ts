/**
 * Blog API
 * Browse posts, search, filter by category/tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/blog
// Browse blog posts with filtering and search
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'categories', 'tags', 'posts', 'search', 'featured'
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Get all categories
    if (type === 'categories') {
      const categories = await prisma.blogCategory.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: { is_published: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({ categories });
    }

    // Get all tags
    if (type === 'tags') {
      const tags = await prisma.blogTag.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: { post: { is_published: true } },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({ tags });
    }

    // Search posts
    if (type === 'search' && query) {
      const posts = await prisma.blogPost.findMany({
        where: {
          is_published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { keywords: { has: query.toLowerCase() } },
          ],
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [{ is_featured: 'desc' }, { published_at: 'desc' }],
        take: limit,
        skip,
      });

      const total = await prisma.blogPost.count({
        where: {
          is_published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { keywords: { has: query.toLowerCase() } },
          ],
        },
      });

      return NextResponse.json({
        posts,
        query,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Get featured posts
    if (type === 'featured') {
      const featured = await prisma.blogPost.findMany({
        where: {
          is_published: true,
          is_featured: true,
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [{ published_at: 'desc' }],
        take: 3,
      });

      return NextResponse.json({ featured });
    }

    // Get posts with optional filtering
    const where: any = { is_published: true };

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [{ is_featured: 'desc' }, { published_at: 'desc' }],
        take: limit,
        skip,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (_error) {
    console.error('Failed to fetch blog posts:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
