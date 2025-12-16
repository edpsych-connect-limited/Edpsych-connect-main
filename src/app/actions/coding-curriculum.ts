
'use server';

import { prisma } from '@/lib/prisma';

export async function getCodingCurriculum() {
  try {
    // Find the specific lesson plan we seeded
    const lessonPlan = await prisma.lessonPlan.findFirst({
      where: {
        title: 'Developers of Tomorrow Curriculum',
        subject: 'Computing'
      },
      include: {
        activities: {
          orderBy: {
            sequence_order: 'asc'
          }
        }
      }
    });

    if (!lessonPlan) {
      return null;
    }

    // Transform the data to match the frontend component's expected format
    const levels = lessonPlan.activities.map(activity => {
      const content = activity.base_content as any;
      return {
        id: activity.sequence_order, // Use sequence_order as the ID for the UI
        title: activity.title,
        type: content.type,
        description: content.description,
        xp: content.xp,
        cognitiveLoad: content.cognitiveLoad,
        skills: content.skills,
        unlocked: content.unlocked
      };
    });

    const videos = (lessonPlan.base_content as any).videos || [];

    return {
      levels,
      videos
    };
  } catch (error) {
    console.error('Error fetching coding curriculum:', error);
    return null;
  }
}
