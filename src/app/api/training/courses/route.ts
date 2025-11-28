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
    const userId = session?.id ? parseInt(session.id) : undefined;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};

    if (category && category !== 'All') {
      where.title = { contains: category }; // Simplified category filter as category field might not exist on courses
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Define interface for the query result
    interface CourseWithRelations {
      id: string;
      title: string;
      description: string;
      created_at: Date;
      updated_at: Date;
      enrollments: { progress: number; status: string }[];
      // reviews: { rating: number }[]; // Commented out as reviews relation is not in schema
      _count?: {
        enrollments: number;
        // reviews: number;
      };
    }

    const [courses, total] = await Promise.all([
      prisma.courses.findMany({
        where,
        include: {
          enrollments: userId ? {
            where: { user_id: userId },
            select: { progress: true, status: true }
          } : false,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.courses.count({ where }),
    ]);

    const mappedCourses = (courses as unknown as CourseWithRelations[]).map(course => {
      // Mock duration as it's not in schema
      const duration = 60; 
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      const durationString = hours > 0 
        ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
        : `${minutes}m`;

      // Mock rating as reviews are not in schema
      const avgRating = 4.5;

      // Check enrollment
      const enrollment = course.enrollments?.[0];

      return {
        id: course.id,
        title: course.title,
        description: course.description || '',
        category: 'General', // Default category
        duration: durationString,
        level: 'Intermediate', // Default level
        enrolled: !!enrollment,
        progress: enrollment?.progress || 0,
        imageUrl: null, // No image in schema
        instructor: 'EdPsych Team', // Default instructor
        rating: avgRating,
        students: course._count?.enrollments || 0,
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
