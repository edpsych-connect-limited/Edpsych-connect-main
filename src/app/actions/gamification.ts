'use server'

import { LessonToGameBridge, GameQuestion } from '@/lib/gamification/bridge';

/**
 * Server Action to fetch game questions for a student.
 * This acts as the secure gateway between the client-side game and the server-side bridge.
 */
export async function getStudentQuestions(studentId: number = 1, subject?: string): Promise<GameQuestion[]> {
  // In a production environment, we would extract the studentId from the secure session.
  // For the Beta/Audit phase, we allow passing it or default to the test user (ID 1).
  
  try {
    const questions = await LessonToGameBridge.getQuestionsForStudent(studentId, subject);
    return questions;
  } catch (error) {
    console.error('Failed to fetch student questions:', error);
    // Return fallback questions in case of critical failure to keep the game running
    return LessonToGameBridge.getQuestionsForStudent(0); // 0 will trigger fallback
  }
}
