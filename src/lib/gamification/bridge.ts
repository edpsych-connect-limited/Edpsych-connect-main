import { prisma } from '@/lib/prisma';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

export interface GameQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  curriculumLink?: string;
}

// Fallback questions (formerly hardcoded in BattleRoyaleGame.tsx)
export const FALLBACK_QUESTIONS: GameQuestion[] = [
  // ========== KEY STAGE 1 - EASY (Ages 5-7) ==========
  // Maths KS1
  { id: 'ks1-m1', text: 'What does 2 + 3 equal?', options: ['4', '5', '6', '7'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Addition within 10' },
  { id: 'ks1-m2', text: 'What does 5 + 2 equal?', options: ['6', '7', '8', '9'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Addition within 10' },
  { id: 'ks1-m3', text: 'What does 8 - 3 equal?', options: ['4', '5', '6', '7'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Subtraction within 10' },
  { id: 'ks1-m4', text: 'What shape has 4 equal sides?', options: ['Triangle', 'Circle', 'Square', 'Rectangle'], correctIndex: 2, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Shape recognition' },
  { id: 'ks1-m5', text: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Shape properties' },
  { id: 'ks1-m6', text: 'What comes after 9?', options: ['8', '10', '11', '7'], correctIndex: 1, points: 50, category: 'Maths KS1', difficulty: 'easy', curriculumLink: 'Number sequence' },
  
  // English KS1
  { id: 'ks1-e1', text: 'Which word rhymes with "cat"?', options: ['Dog', 'Hat', 'Cup', 'Sun'], correctIndex: 1, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Phonics and rhyming' },
  { id: 'ks1-e2', text: 'Which word rhymes with "bed"?', options: ['Red', 'Big', 'Sat', 'Cup'], correctIndex: 0, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Phonics and rhyming' },
  { id: 'ks1-e3', text: 'What letter does "apple" start with?', options: ['B', 'A', 'C', 'D'], correctIndex: 1, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Initial sounds' },
  { id: 'ks1-e4', text: 'Which is a naming word (noun)?', options: ['Run', 'Dog', 'Happy', 'Fast'], correctIndex: 1, points: 50, category: 'English KS1', difficulty: 'easy', curriculumLink: 'Word types' },
  
  // Science KS1
  { id: 'ks1-s1', text: 'What do plants need to grow?', options: ['Toys', 'Water', 'Books', 'Cars'], correctIndex: 1, points: 50, category: 'Science KS1', difficulty: 'easy', curriculumLink: 'Plant needs' },
  { id: 'ks1-s2', text: 'Which animal has feathers?', options: ['Fish', 'Dog', 'Bird', 'Cat'], correctIndex: 2, points: 50, category: 'Science KS1', difficulty: 'easy', curriculumLink: 'Animal classification' },
];

interface _LessonActivityContent {
  questions?: Array<{
    text: string;
    options: string[];
    correctAnswer: string; // or index
    points?: number;
    category?: string;
  }>;
}

export class LessonToGameBridge {
  /**
   * Retrieves game questions dynamically based on the student's assigned lessons.
   * Falls back to static curriculum questions if no active lesson is found.
   * 
   * @param studentId The ID of the student (user ID)
   * @param subject Optional subject filter
   */
  static async getQuestionsForStudent(studentId: number, subject?: string): Promise<GameQuestion[]> {
    try {
      // 1. Find active lesson assignments for the student
      const activeAssignments = await prisma.studentLessonAssignment.findMany({
        where: {
          student_id: studentId,
          status: { in: ['assigned', 'in_progress'] },
          lesson_plan: subject ? { subject: { contains: subject, mode: 'insensitive' } } : undefined
        },
        include: {
          lesson_plan: {
            include: {
              activities: true
            }
          }
        },
        orderBy: {
          assigned_at: 'desc'
        },
        take: 1 // For now, focus on the most recent assignment
      });

      if (!activeAssignments || activeAssignments.length === 0) {
        console.log(`[LessonToGameBridge] No active assignments found for student ${studentId}. Using fallback.`);
        return FALLBACK_QUESTIONS;
      }

      const assignment = activeAssignments[0];
      const lessonPlan = assignment.lesson_plan;
      const difficulty = assignment.assigned_difficulty || 'at'; // 'below', 'at', 'above'

      console.log(`[LessonToGameBridge] Found active lesson: ${lessonPlan.title} (${difficulty})`);

      const dynamicQuestions: GameQuestion[] = [];

      // 2. Extract questions from activities
      for (const activity of lessonPlan.activities) {
        // Check differentiated content first, then base content
        let content: any = activity.base_content;
        
        if (activity.differentiated_content) {
          const diffContent = activity.differentiated_content as any;
          if (diffContent[difficulty]) {
            content = diffContent[difficulty];
          }
        }

        // Parse content for questions
        // We expect a structure like { questions: [...] } or { gameData: { questions: [...] } }
        const questionsData = content?.questions || content?.gameData?.questions;

        if (Array.isArray(questionsData)) {
          questionsData.forEach((q: any, index: number) => {
            // Validate question structure
            if (q.text && Array.isArray(q.options) && (q.correctAnswer !== undefined || q.correctIndex !== undefined)) {
              
              // Determine correct index
              let correctIndex = 0;
              if (typeof q.correctIndex === 'number') {
                correctIndex = q.correctIndex;
              } else if (typeof q.correctAnswer === 'string') {
                correctIndex = q.options.indexOf(q.correctAnswer);
              }

              if (correctIndex === -1) correctIndex = 0; // Fallback

              dynamicQuestions.push({
                id: `dynamic-${activity.id}-${index}`,
                text: q.text,
                options: q.options,
                correctIndex: correctIndex,
                points: q.points || 50,
                category: q.category || lessonPlan.subject,
                difficulty: (difficulty === 'below' ? 'easy' : difficulty === 'above' ? 'hard' : 'medium'),
                curriculumLink: lessonPlan.curriculum_reference || lessonPlan.title
              });
            }
          });
        }
      }

      if (dynamicQuestions.length > 0) {
        console.log(`[LessonToGameBridge] Generated ${dynamicQuestions.length} dynamic questions.`);
        return dynamicQuestions;
      }

      console.log(`[LessonToGameBridge] No questions found in lesson content. Using fallback.`);
      return FALLBACK_QUESTIONS;

    } catch (error) {
      console.error('[LessonToGameBridge] Error fetching questions:', error);
      return FALLBACK_QUESTIONS;
    }
  }
}
