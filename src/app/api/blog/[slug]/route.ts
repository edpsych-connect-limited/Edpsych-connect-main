/**
 * Blog Post Detail API
 * Get individual post, track views, handle comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET /api/blog/[slug]
// Get post details and increment view count
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const post = await prisma.blogPost.findUnique({
      where: { slug, is_published: true },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          where: { is_approved: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    // Get related posts from same category
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        is_published: true,
        category_id: post.category_id,
        id: { not: post.id },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
        reading_time: true,
        category: true,
      },
      take: 3,
      orderBy: { views: 'desc' },
    });

    return NextResponse.json({
      post: {
        ...post,
        views: post.views + 1, // Return incremented count
      },
      relatedPosts,
    });
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/blog/[slug]
// Submit a comment
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { content, author_name, author_email } = await request.json();

    if (!content || !author_name || !author_email) {
      return NextResponse.json(
        { error: 'Content, name, and email are required' },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create comment (pending approval)
    const comment = await prisma.blogComment.create({
      data: {
        post_id: post.id,
        content,
        author_name,
        author_email,
        is_approved: false, // Requires manual approval
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Comment submitted and awaiting approval',
      comment: {
        id: comment.id,
        content: comment.content,
        author_name: comment.author_name,
        created_at: comment.created_at,
      },
    });
  } catch (error) {
    console.error('Failed to submit comment:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    );
  }
}
