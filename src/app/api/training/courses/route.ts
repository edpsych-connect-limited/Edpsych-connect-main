import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      status: 'published',
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: true,
          _count: {
            select: {
              modules: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.course.count({ where }),
    ]);

    const mappedCourses = courses.map(course => {
      const hours = Math.floor(course.duration / 60);
      const minutes = course.duration % 60;
      const durationString = hours > 0 
        ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
        : `${minutes}m`;

      return {
        id: course.id,
        title: course.title,
        description: course.description || '',
        category: course.category,
        duration: durationString,
        level: course.level,
        enrolled: false, // TODO: Check enrollment status if user is logged in
        progress: 0,
        imageUrl: course.imageUrl,
        instructor: course.instructor?.name || 'Unknown Instructor',
        rating: 0, // TODO: Calculate rating
        students: course._count.enrollments,
      };
    });

    return NextResponse.json({
      success: true,
      courses: mappedCourses,
      total,
    });
  } catch (error) {
    console.error('[Courses API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
