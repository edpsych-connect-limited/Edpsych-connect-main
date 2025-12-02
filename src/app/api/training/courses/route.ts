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
import { 
  COURSE_CATALOG, 
  getCoursesByCategory, 
  getCourseStatistics,
  type Course 
} from '@/lib/training/course-catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await authService.getSessionFromRequest(request);
    const userId = session?.id ? parseInt(session.id) : undefined;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use comprehensive course catalog (10+ courses with full module structure)
    let courses = [...COURSE_CATALOG];

    // Filter by category
    if (category && category !== 'All' && category !== 'all') {
      courses = getCoursesByCategory(category as any);
    }

    // Filter by search query
    if (search) {
      courses = courses.filter((course) =>
        course.title.toLowerCase().includes(search) ||
        course.description.toLowerCase().includes(search) ||
        course.subtitle.toLowerCase().includes(search)
      );
    }

    // Get user enrollments from database if authenticated
    let userEnrollments: Map<string, { progress: number; status: string }> = new Map();
    if (userId) {
      try {
        const enrollments = await prisma.enrollments.findMany({
          where: { user_id: userId },
          select: { course_id: true, progress: true, status: true },
        });
        enrollments.forEach((e) => {
          userEnrollments.set(e.course_id, { progress: e.progress || 0, status: e.status || 'enrolled' });
        });
      } catch (_e) {
        // Database connection might not be available, continue without enrollments
      }
    }

    // Apply pagination
    const total = courses.length;
    const paginatedCourses = courses.slice(offset, offset + limit);

    // Map courses to API response format
    const mappedCourses = paginatedCourses.map((course: Course) => {
      const enrollment = userEnrollments.get(course.id);
      const hours = Math.floor(course.duration_minutes / 60);
      const minutes = course.duration_minutes % 60;
      const durationString = hours > 0 
        ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
        : `${minutes}m`;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        subtitle: course.subtitle,
        category: course.category,
        duration: durationString,
        cpd_hours: course.cpd_hours,
        level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
        enrolled: !!enrollment,
        progress: enrollment?.progress || 0,
        imageUrl: course.image_url || null,
        instructor: course.instructor.name,
        instructorTitle: course.instructor.title,
        instructorCredentials: course.instructor.credentials,
        rating: 4.8 + (Math.random() * 0.2), // Simulated rating 4.8-5.0
        students: Math.floor(150 + (course.popularity_score * 50)), // Based on popularity
        modules: course.modules.length,
        learning_outcomes: course.learning_outcomes,
        target_audience: course.target_audience,
        prerequisites: course.prerequisites,
        certificate_available: course.certificate_available,
        total_merits: course.total_merits,
        featured: course.featured,
      };
    });

    const stats = getCourseStatistics();

    return NextResponse.json({
      success: true,
      courses: mappedCourses,
      total,
      stats: {
        total_courses: stats.total_courses,
        total_cpd_hours: stats.total_cpd_hours,
        total_merits: stats.total_merits,
      },
    });
  } catch (_error) {
    console.error('[Courses API] Error:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
