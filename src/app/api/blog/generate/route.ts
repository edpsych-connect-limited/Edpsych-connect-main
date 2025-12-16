import { logger } from "@/lib/logger";
/**
 * FILE: src/app/api/blog/generate/route.ts
 * PURPOSE: Autonomous blog generation endpoint (triggered by cron)
 *
 * SCHEDULE: Daily at 12:00 PM UTC
 * AUTH: Internal only (cron secret required)
 *
 * PROCESS:
 * 1. Scrape educational content from multiple sources
 * 2. Analyze trending topics
 * 3. Generate comprehensive blog post using AI
 * 4. Store in database
 * 5. Notify administrators
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import { blogPostGenerator } from '@/lib/blog/post-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for Vercel Pro

// ============================================================================
// POST: Generate Daily Blog Post
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logger.error('[Blog Generate] CRON_SECRET not configured');
      return NextResponse.json({ success: false, error: 'Cron not configured' }, { status: 503 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.error('[Blog Generate] Unauthorized cron attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.debug('[Blog Generate] Starting automated blog generation...');

    // Generate blog post
    const post = await blogPostGenerator.generateDailyPost();

    logger.debug('[Blog Generate] Post generated:', post.title);

    // 1. Find or create category
    const categorySlug = post.category.toLowerCase().replace(/ /g, '-');
    let category = await (prisma as any).blogCategory.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) {
      category = await (prisma as any).blogCategory.create({
        data: {
          name: post.category,
          slug: categorySlug,
          description: `Articles about ${post.category}`,
          is_active: true
        }
      });
    }

    // 2. Prepare content with extra metadata
    const enrichedContent = `${post.content}\n\n## Metadata\n\n**CPD Value:** ${post.cpdValue}\n**Target Audience:** ${post.targetAudience.join(', ')}\n\n**Sources:**\n${post.sources.map((s: any) => `- [${s.title}](${s.url})`).join('\n')}`;

    // 3. Store in database
    const savedPost = await (prisma as any).blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: enrichedContent,
        author_name: post.author,
        category_id: category.id,
        reading_time: post.readingTime,
        published_at: post.publishedAt,
        is_published: true,
        is_featured: post.featured,
        keywords: post.tags,
        views: 0,
      },
    });

    logger.debug('[Blog Generate] Post saved to database:', savedPost.id);

    // Send notification to admin (optional)
    await notifyAdmin(post);

    return NextResponse.json({
      success: true,
      post: {
        id: savedPost.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
      },
      message: 'Blog post generated and published successfully',
    });

  } catch (error: any) {
    logger.error('[Blog Generate] Error:', error);

    // Log error to database for monitoring
    try {
      await (prisma as any).systemLog.create({
        data: {
          level: 'error',
          component: 'blog_generator',
          message: 'Failed to generate daily blog post',
          details: error.message,
          timestamp: new Date(),
        },
      });
    } catch (logError) {
      logger.error('[Blog Generate] Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate blog post',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET: Manual trigger (admin only, for testing)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ success: false, error: 'Cron not configured' }, { status: 503 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Forward to POST handler
    return POST(request);

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate blog post',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function notifyAdmin(post: any): Promise<void> {
  try {
    // In production, would send email or Slack notification
    logger.debug('[Blog Generate] Admin notification:', {
      title: post.title,
      category: post.category,
      cpdValue: post.cpdValue,
      targetAudience: post.targetAudience,
    });

    // Could integrate with email service or Slack API
    // await sendEmail({
    //   to: 'admin@edpsychconnect.com',
    //   subject: `New Blog Post: ${post.title}`,
    //   body: `A new blog post has been automatically generated and published.\n\nTitle: ${post.title}\nCategory: ${post.category}\nCPD Value: ${post.cpdValue}`,
    // });
  } catch (_error) {
    console.error('[Blog Generate] Failed to send admin notification:', _error);
    // Don't throw - notification failure shouldn't block post generation
  }
}
