import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import prisma from '@/lib/prismaSafe';
import { blogPostGenerator } from '@/lib/blog/post-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const activeUser = authResult.session.user;
  const ownerEmail = (process.env.BLOG_AUTOMATION_OWNER_EMAIL || '').toLowerCase();
  if (!ownerEmail || (activeUser.email || '').toLowerCase() !== ownerEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const post = await blogPostGenerator.generateDailyPost();

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

    const enrichedContent = `${post.content}\n\n## Metadata\n\n**CPD Value:** ${post.cpdValue}\n**Target Audience:** ${post.targetAudience.join(', ')}\n\n**Sources:**\n${post.sources.map((s: any) => `- [${s.title}](${s.url})`).join('\n')}`;

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

    return NextResponse.json({
      success: true,
      post: {
        id: savedPost.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
      },
    });
  } catch (error: any) {
    console.error('[Admin Blog Generate] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post', details: error?.message },
      { status: 500 }
    );
  }
}
