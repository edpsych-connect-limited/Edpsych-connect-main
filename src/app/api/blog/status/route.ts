import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lastPost = await (prisma as any).blogPost.findFirst({
      where: { is_published: true },
      orderBy: [{ published_at: 'desc' }, { created_at: 'desc' }],
      select: { published_at: true, created_at: true },
    });

    const since = new Date();
    since.setDate(since.getDate() - 7);

    const postsLast7Days = await (prisma as any).blogPost.count({
      where: {
        is_published: true,
        published_at: { gte: since },
      },
    });

    const lastPublishedAt = lastPost?.published_at || lastPost?.created_at || null;

    return NextResponse.json({
      lastPublishedAt,
      postsLast7Days,
    });
  } catch (error) {
    console.error('Failed to load blog status:', error);
    return NextResponse.json({ error: 'Failed to load blog status' }, { status: 500 });
  }
}
