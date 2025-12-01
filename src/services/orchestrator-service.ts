/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { aiService, AIRequest } from '@/lib/ai-integration';
import { prisma } from '@/lib/prisma';

export interface TutoringRequest {
  studentId: string;
  subject: string;
  topic: string;
  currentLevel: 'foundation' | 'developing' | 'secure' | 'mastery';
  learningObjectives: string[];
  timeAvailable: number;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinaesthetic' | 'reading';
  specialEducationalNeeds?: string[];
}

export interface TutoringResponse {
  personalisedExplanation: string;
  interactiveExercise: {
    type: 'multiple_choice' | 'fill_blank' | 'matching' | 'sequencing';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  };
  nextSteps: string[];
  resources: {
    type: 'video' | 'diagram' | 'worksheet' | 'interactive';
    title: string;
    url: string;
    description: string;
  }[];
  masteryAssessment: {
    currentLevel: string;
    progressToNextLevel: number;
    recommendedPracticeTime: number;
  };
  motivationalMessage: string;
}

class OrchestratorService {
  /**
   * Process a tutoring request using the AI agents
   */
  async processTutoringRequest(request: TutoringRequest): Promise<TutoringResponse> {
    const systemPrompt = `You are an expert AI Tutor specializing in ${request.subject}. 
    Your goal is to provide a personalized learning experience for a student at the '${request.currentLevel}' level.
    The student prefers a '${request.preferredLearningStyle}' learning style.
    
    You MUST return a valid JSON object matching this structure exactly:
    {
      "personalisedExplanation": "string",
      "interactiveExercise": {
        "type": "multiple_choice" | "fill_blank" | "matching" | "sequencing",
        "question": "string",
        "options": ["string"] (optional),
        "correctAnswer": "string",
        "explanation": "string"
      },
      "nextSteps": ["string"],
      "resources": [{ "type": "string", "title": "string", "url": "string", "description": "string" }],
      "masteryAssessment": {
        "currentLevel": "string",
        "progressToNextLevel": number (0-100),
        "recommendedPracticeTime": number (minutes)
      },
      "motivationalMessage": "string"
    }
    
    Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON string.`;

    const userPrompt = `Topic: ${request.topic}
    Learning Objectives: ${request.learningObjectives.join(', ')}
    Time Available: ${request.timeAvailable} minutes
    Special Needs: ${request.specialEducationalNeeds?.join(', ') || 'None'}
    
    Please generate the tutoring content.`;

    try {
      // Use the 'lessonPlanner' agent as a base, but override with our specific needs via prompt
      // In a real scenario, we might create a dedicated 'tutor' agent in ai-integration.ts
      const aiRequest: AIRequest = {
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        id: request.studentId,
        subscriptionTier: 'standard', // Default
        useCase: 'lesson_planning', // Closest match
        maxTokens: 2000,
        temperature: 0.7,
      };

      const response = await aiService.processRequest(aiRequest);
      
      // Clean up response if it contains markdown code blocks
      let cleanResponse = response.response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '');
      }

      const parsedResponse = JSON.parse(cleanResponse) as TutoringResponse;
      return parsedResponse;

    } catch (_error) {
      console._error('Orchestrator Service Error:', _error);
      // Fallback mock response if AI fails
      return this.getFallbackResponse(request);
    }
  }

  /**
   * Get system status metrics
   */
  async getSystemStatus() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    // Get real metrics from DB
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Count active agents (unique models used in last 5 mins)
    // Note: groupBy is not fully supported in all prisma versions/adapters in the same way, 
    // but assuming standard usage. If fails, we'll use findMany distinct.
    const activeAgentsEvents = await prisma.analyticsEvent.findMany({
      where: { timestamp: { gte: fiveMinutesAgo } },
      distinct: ['model'],
      select: { model: true }
    });

    const recentActivityCount = await prisma.analyticsEvent.count({
      where: { timestamp: { gte: fiveMinutesAgo } }
    });

    const agentHealth = await this.getAgentHealth();
    const recentActivity = await this.getRecentActivity();

    return {
      orchestrator: {
        status: 'operational',
        totalAgents: 24,
        activeAgents: activeAgentsEvents.length,
        queueStatus: {
          pending: 0,
          active: 0,
          total: recentActivityCount,
        },
        systemInfo: {
          uptime,
          memory: memoryUsage,
          nodeVersion: process.version,
          platform: process.platform,
        },
      },
      agents: {
        registered: 24,
        active: activeAgentsEvents.length,
        health: agentHealth,
      },
      recentActivity: recentActivity,
    };
  }

  private async getAgentHealth() {
    const agents = aiService.getAvailableAgents();
    const healthData = [];

    for (const agentId of agents) {
        // Get stats from DB
        const stats = await prisma.analyticsEvent.aggregate({
            where: { model: agentId },
            _avg: { latencyMs: true },
            _count: { id: true }
        });
        
        healthData.push({
            agentId,
            name: aiService.getAgentConfig(agentId)?.name || agentId,
            status: 'operational', // Default to operational if listed
            loadFactor: 0, // specific to queue
            performanceMetrics: {
                averageResponseTime: stats._avg.latencyMs || 0,
                successRate: 1, // Need to track errors to calc this
                totalTasksProcessed: stats._count.id,
                currentQueueSize: 0
            },
            lastSeen: new Date().toISOString()
        });
    }
    return healthData;
  }

  private async getRecentActivity() {
    const events = await prisma.analyticsEvent.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: { user: true }
    });
    
    return events.map(e => ({
        id: e.id,
        requestType: e.eventType,
        studentId: e.userId ? `student_${e.userId}` : 'system',
        strategy: 'ai_generated',
        processingTime: e.latencyMs || 0,
        timestamp: e.timestamp.toISOString()
    }));
  }

  private async getFallbackResponse(request: TutoringRequest): Promise<TutoringResponse> {
    // Try to fetch a relevant content piece from DB
    const content = await prisma.content.findFirst({
        where: { 
            OR: [
                { title: { contains: request.topic, mode: 'insensitive' } },
                { description: { contains: request.topic, mode: 'insensitive' } }
            ],
            content_type: 'lesson_plan'
        }
    });

    if (content && content.metadata) {
        // Assuming metadata contains the structured lesson
        // This is a simplification, in reality we'd need strict schema for metadata
        return content.metadata as unknown as TutoringResponse;
    }

    // If no content found, return a generated fallback (but still "connected" logic)
    return {
      personalisedExplanation: `(System) We are currently generating a personalized explanation for ${request.topic}. Please try again in a moment.`,
      interactiveExercise: {
        type: 'multiple_choice',
        question: `What is the main focus of ${request.topic}?`,
        options: ['Option A', 'Option B', 'Option C'],
        correctAnswer: 'Option A',
        explanation: 'Placeholder explanation.'
      },
      nextSteps: ['Review topic', 'Check back later'],
      resources: [],
      masteryAssessment: {
        currentLevel: request.currentLevel,
        progressToNextLevel: 0,
        recommendedPracticeTime: 10
      },
      motivationalMessage: "Learning takes time. Keep at it!"
    };
  }
}

export const orchestratorService = new OrchestratorService();
