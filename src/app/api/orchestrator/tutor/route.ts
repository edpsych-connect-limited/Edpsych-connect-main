import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orchestratorService } from '@/services/orchestrator-service';
import { z } from 'zod';

// Schema for the tutoring request
const tutoringRequestSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  currentLevel: z.enum(['foundation', 'developing', 'secure', 'mastery']),
  learningObjectives: z.array(z.string()).min(1, "At least one learning objective is required"),
  timeAvailable: z.number().min(5).max(120),
  preferredLearningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading_writing']),
  specialEducationalNeeds: z.array(z.string()).optional(),
  previousKnowledge: z.string().optional(),
  studentInterests: z.array(z.string()).optional(),
  isDemo: z.boolean().optional(),
});

// Demo response for unauthenticated users - production quality
const generateDemoResponse = (subject: string, topic: string, level: string, learningStyle: string) => ({
  personalisedExplanation: generateExplanation(subject, topic, level, learningStyle),
  interactiveExercise: generateExercise(subject, topic, level),
  nextSteps: generateNextSteps(subject, topic, level),
  resources: generateResources(subject, topic),
  masteryAssessment: {
    currentLevel: level === 'foundation' ? 'Foundation' : level === 'developing' ? 'Developing' : level === 'secure' ? 'Secure' : 'Mastery',
    progressToNextLevel: Math.floor(Math.random() * 30) + 40, // 40-70%
    recommendedPracticeTime: 20,
  },
  motivationalMessage: generateMotivation(level),
});

function generateExplanation(subject: string, topic: string, level: string, learningStyle: string): string {
  const styleIntro: Record<string, string> = {
    visual: '📊 Let me show you this concept visually.',
    auditory: '🎧 Listen carefully as we explore this together.',
    kinesthetic: '🤲 Let\'s learn by doing! Try this hands-on approach.',
    reading_writing: '📚 Here\'s a detailed explanation to read through.',
  };

  const levelContent: Record<string, string> = {
    foundation: 'We\'ll start with the basics and build from there.',
    developing: 'You\'ve got the foundations - let\'s deepen your understanding.',
    secure: 'Great progress! Let\'s explore some more advanced applications.',
    mastery: 'You\'re ready for expert-level content and real-world challenges.',
  };

  return `${styleIntro[learningStyle] || styleIntro.visual}\n\n**Understanding ${topic} in ${subject}**\n\n${levelContent[level] || levelContent.developing}\n\n${getTopicContent(subject, topic)}\n\n💡 **Key Point:** Remember, learning is a journey. Take your time with each concept before moving on.`;
}

function getTopicContent(subject: string, topic: string): string {
  // Subject-specific content
  const subjectContent: Record<string, string> = {
    Mathematics: `In ${topic}, we focus on building numerical fluency and problem-solving skills. This involves understanding patterns, relationships, and logical reasoning. Practice is key - the more problems you solve, the more confident you'll become.`,
    English: `${topic} in English develops your communication and comprehension abilities. Whether it's reading, writing, or speaking, these skills interconnect. Focus on understanding context and expressing ideas clearly.`,
    Science: `${topic} helps us understand how the world works through observation and experimentation. Scientific thinking involves asking questions, testing hypotheses, and analysing results. Curiosity is your greatest tool!`,
    History: `Studying ${topic} in History helps us understand how past events shaped our present. We analyse primary sources, consider different perspectives, and draw connections across time periods.`,
    Geography: `${topic} in Geography explores how humans interact with their environment. From physical features to human systems, we study patterns and processes that shape our world.`,
  };
  
  return subjectContent[subject] || `${topic} is a fascinating area of ${subject}. Understanding the core concepts will help you build a strong foundation for more advanced learning.`;
}

function generateExercise(subject: string, topic: string, level: string): {
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'sequencing';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
} {
  const exercises: Record<string, any> = {
    Mathematics: {
      type: 'multiple_choice' as const,
      question: `If you have ${level === 'foundation' ? '5 apples and get 3 more' : level === 'developing' ? 'a rectangle with length 6cm and width 4cm' : '3x + 7 = 22'}, what is the ${level === 'foundation' ? 'total' : level === 'developing' ? 'area' : 'value of x'}?`,
      options: level === 'foundation' ? ['6', '7', '8', '9'] : level === 'developing' ? ['10 cm²', '20 cm²', '24 cm²', '30 cm²'] : ['3', '5', '7', '15'],
      correctAnswer: level === 'foundation' ? '8' : level === 'developing' ? '24 cm²' : '5',
      explanation: level === 'foundation' ? '5 + 3 = 8. When we add, we combine the groups together!' : level === 'developing' ? 'Area = length × width = 6 × 4 = 24 cm²' : 'Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5',
    },
    English: {
      type: 'multiple_choice' as const,
      question: `In the sentence "The ${level === 'foundation' ? 'cat sat on the mat' : 'mysterious stranger arrived at midnight'}", what is the ${level === 'foundation' ? 'verb' : 'subject'}?`,
      options: level === 'foundation' ? ['cat', 'sat', 'mat', 'on'] : ['mysterious', 'stranger', 'arrived', 'midnight'],
      correctAnswer: level === 'foundation' ? 'sat' : 'stranger',
      explanation: level === 'foundation' ? 'A verb is an action word. "Sat" tells us what the cat did.' : 'The subject is who or what the sentence is about. The stranger is performing the action.',
    },
    Science: {
      type: 'multiple_choice' as const,
      question: `What happens to water when it is heated to 100°C?`,
      options: ['It freezes', 'It boils and becomes steam', 'It stays the same', 'It becomes ice'],
      correctAnswer: 'It boils and becomes steam',
      explanation: 'At 100°C, water reaches its boiling point and changes from a liquid to a gas (steam). This is called evaporation.',
    },
  };
  
  return exercises[subject] || exercises.English;
}

function generateNextSteps(subject: string, topic: string, level: string): string[] {
  return [
    `Review the key concepts from ${topic}`,
    `Complete 3-5 practice problems to reinforce learning`,
    level === 'mastery' ? 'Challenge yourself with extension activities' : 'Move to the next section when comfortable',
    'Use the spaced repetition technique for better retention',
    `Discuss ${topic} with a peer or teacher to deepen understanding`,
  ];
}

function generateResources(subject: string, topic: string): Array<{
  type: 'video' | 'diagram' | 'worksheet' | 'interactive';
  title: string;
  url: string;
  description: string;
}> {
  return [
    {
      type: 'video' as const,
      title: `Understanding ${topic}`,
      url: `/training/courses`,
      description: `A comprehensive video explanation of ${topic} concepts in ${subject}`,
    },
    {
      type: 'interactive' as const,
      title: 'Practice Problems',
      url: `/training/courses`,
      description: 'Interactive exercises to test your understanding',
    },
    {
      type: 'worksheet' as const,
      title: `${topic} Worksheet`,
      url: `/training/courses`,
      description: 'Printable worksheet for additional practice',
    },
  ];
}

function generateMotivation(level: string): string {
  const messages: Record<string, string> = {
    foundation: '🌱 Every expert was once a beginner. You\'re taking the first steps on an exciting journey!',
    developing: '📈 You\'re making excellent progress! Keep building on what you\'ve learned.',
    secure: '💪 Your hard work is paying off! You\'re developing strong skills.',
    mastery: '🏆 Outstanding work! You\'re ready to tackle advanced challenges and help others learn.',
  };
  return messages[level] || messages.developing;
}

export async function POST(req: Request) {
  try {
    // 1. Parse and Validate Request Body first
    const body = await req.json();
    
    // Validate against schema
    const validationResult = tutoringRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const requestData = validationResult.data;

    // 2. Authentication Check - allow demo mode for unauthenticated users
    const session = await getServerSession(authOptions);
    
    // If demo mode requested or no session, return demo response
    if (requestData.isDemo || !session || !session.user) {
      logger.info('[Orchestrator] Demo tutoring request processed');
      return NextResponse.json({ 
        result: generateDemoResponse(
          requestData.subject, 
          requestData.topic, 
          requestData.currentLevel,
          requestData.preferredLearningStyle
        ),
        isDemo: true 
      });
    }

    const userId = session.user.id;

    // Map learning style
    let learningStyle: 'visual' | 'auditory' | 'kinaesthetic' | 'reading';
    switch (requestData.preferredLearningStyle) {
      case 'reading_writing':
        learningStyle = 'reading';
        break;
      case 'kinesthetic':
        learningStyle = 'kinaesthetic';
        break;
      default:
        learningStyle = requestData.preferredLearningStyle as 'visual' | 'auditory';
    }

    // 3. Delegate to Service
    const result = await orchestratorService.processTutoringRequest({
      studentId: userId,
      subject: requestData.subject,
      topic: requestData.topic,
      currentLevel: requestData.currentLevel,
      learningObjectives: requestData.learningObjectives,
      timeAvailable: requestData.timeAvailable,
      preferredLearningStyle: learningStyle,
      specialEducationalNeeds: requestData.specialEducationalNeeds
    });

    return NextResponse.json({ result });

  } catch (_error) {
    logger.error('[Orchestrator] Error processing tutor request:', _error as Error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: _error instanceof Error ? _error.message : String(_error) },
      { status: 500 }
    );
  }
}

