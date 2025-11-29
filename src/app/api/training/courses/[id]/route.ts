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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authService.getSessionFromRequest(request);
    const userId = session?.id;

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        instructor: true,
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
            quizzes: {
              include: {
                questions: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
        enrollments: userId ? {
          where: { userId: parseInt(userId) },
        } : false,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled
    const enrollment = course.enrollments?.[0];
    const isEnrolled = !!enrollment;
    const progress = enrollment?.progress || 0;

    // Format duration
    const hours = Math.floor(course.duration / 60);
    const minutes = course.duration % 60;
    const durationString = hours > 0 
      ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
      : `${minutes}m`;

    // Map to expected interface
    const mappedCourse = {
      id: course.id,
      title: course.title,
      subtitle: course.title, // Placeholder
      description: course.description || '',
      longDescription: course.description || '',
      category: course.category,
      duration: durationString,
      durationMinutes: course.duration, // Added for CoursePlayer
      level: course.level,
      enrolled: isEnrolled,
      progress: progress,
      imageUrl: course.imageUrl,
      instructor: {
        name: course.instructor?.name || 'Unknown Instructor',
        title: course.instructor?.title || '',
        bio: course.instructor?.bio || '',
        imageUrl: course.instructor?.imageUrl,
        credentials: '', // Placeholder
      },
      rating: 0,
      totalStudents: course._count.enrollments,
      reviews: course._count.reviews,
      learningObjectives: [
        'Understand the core concepts',
        'Apply knowledge in real-world scenarios',
        'Evaluate different approaches'
      ],
      learning_outcomes: [ // Added for CoursePlayer
        'Understand the core concepts',
        'Apply knowledge in real-world scenarios',
        'Evaluate different approaches'
      ],
      prerequisites: [],
      target_audience: [], // Added for CoursePlayer
      modules: course.modules.map((m, mIdx) => ({
        id: m.id,
        module_number: mIdx + 1, // Added for CoursePlayer
        title: m.title,
        description: m.description || '', // Added for CoursePlayer
        duration: '0m',
        duration_minutes: 0, // Added for CoursePlayer (TODO: sum lessons)
        lessons: m.lessons.map((l, lIdx) => ({
          id: l.id,
          lesson_number: lIdx + 1, // Added for CoursePlayer
          title: l.title,
          duration: l.duration ? `${l.duration}m` : '5m',
          duration_minutes: l.duration || 5, // Added for CoursePlayer
          completed: false,
          type: l.videoUrl ? 'video' : 'reading',
          content_url: l.videoUrl, // Added for CoursePlayer
          content_text: l.content, // Added for CoursePlayer
          merits_earned: 10, // Placeholder
          resources: [], // Placeholder
        })),
        quiz: m.quizzes?.[0] ? {
          id: m.quizzes[0].id,
          title: m.quizzes[0].title,
          questions: m.quizzes[0].questions.map((q: any) => ({
            id: q.id,
            question: q.questionText,
            type: q.questionType as any,
            options: q.options as string[] | undefined,
            correct_answer: q.correctAnswer,
            explanation: q.explanation || '',
            points: q.points,
          })),
          passing_score: m.quizzes[0].passingScore,
          merits_perfect_score: 20, // Default
        } : undefined,
      })),
      relatedCourses: [],
      cpdHours: course.cpdHours,
      cpd_hours: course.cpdHours, // Added for CoursePlayer
      certificateAvailable: course.cpdHours > 0,
      certificate_available: course.cpdHours > 0, // Added for CoursePlayer
      total_merits: 100, // Placeholder
      badge_awarded: 'Course Completer', // Placeholder
    };

    return NextResponse.json(mappedCourse);
  } catch (_error) {
    console.error('[Course Detail API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}
