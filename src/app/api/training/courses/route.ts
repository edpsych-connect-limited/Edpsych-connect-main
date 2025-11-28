/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    const userId = session?.id;

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
          enrollments: userId ? {
            where: { userId: userId },
            select: { progress: true, status: true }
          } : false,
          reviews: {
            select: { rating: true }
          }
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

      // Calculate average rating
      const totalRating = course.reviews.reduce((acc, review) => acc + review.rating, 0);
      const avgRating = course.reviews.length > 0 
        ? Math.round((totalRating / course.reviews.length) * 10) / 10 
        : 0;

      // Check enrollment
      const enrollment = course.enrollments?.[0];

      return {
        id: course.id,
        title: course.title,
        description: course.description || '',
        category: course.category,
        duration: durationString,
        level: course.level,
        enrolled: !!enrollment,
        progress: enrollment?.progress || 0,
        imageUrl: course.imageUrl,
        instructor: course.instructor?.name || 'Unknown Instructor',
        rating: avgRating,
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
