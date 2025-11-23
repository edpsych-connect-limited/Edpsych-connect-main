import { aiService, AIRequest } from '@/lib/ai-integration';

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

    } catch (error) {
      console.error('Orchestrator Service Error:', error);
      // Fallback mock response if AI fails
      return this.getFallbackResponse(request);
    }
  }

  /**
   * Get system status metrics
   */
  getSystemStatus() {
    // In a real system, this would query the actual agent fleet status
    // For now, we simulate a healthy system
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      orchestrator: {
        status: 'operational',
        totalAgents: 24,
        activeAgents: Math.floor(Math.random() * 10) + 5, // Simulate activity
        queueStatus: {
          pending: Math.floor(Math.random() * 5),
          active: Math.floor(Math.random() * 3),
          total: 150 + Math.floor(Math.random() * 50),
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
        active: 12,
        health: this.getAgentHealth(),
      },
      recentActivity: this.getRecentActivity(),
    };
  }

  private getAgentHealth() {
    const agents = aiService.getAvailableAgents();
    // Return a subset of agents with simulated metrics
    return agents.slice(0, 8).map(agentId => ({
      agentId,
      name: aiService.getAgentConfig(agentId)?.name || agentId,
      status: Math.random() > 0.9 ? 'busy' : 'operational',
      loadFactor: Math.random() * 0.8,
      performanceMetrics: {
        averageResponseTime: 200 + Math.random() * 500,
        successRate: 0.95 + Math.random() * 0.05,
        totalTasksProcessed: 50 + Math.floor(Math.random() * 1000),
        currentQueueSize: Math.floor(Math.random() * 3),
      },
      lastSeen: new Date().toISOString(),
    }));
  }

  private getRecentActivity() {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `act_${Date.now()}_${i}`,
      requestType: ['tutoring', 'assessment', 'report_generation'][Math.floor(Math.random() * 3)],
      studentId: `student_${Math.floor(Math.random() * 100)}`,
      strategy: ['direct_instruction', 'scaffolding', 'inquiry_based'][Math.floor(Math.random() * 3)],
      processingTime: 500 + Math.floor(Math.random() * 1500),
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
    }));
  }

  private getFallbackResponse(request: TutoringRequest): TutoringResponse {
    return {
      personalisedExplanation: `(Fallback) Here is a simplified explanation of ${request.topic} for your ${request.preferredLearningStyle} learning style.`,
      interactiveExercise: {
        type: 'multiple_choice',
        question: `What is a key concept of ${request.topic}?`,
        options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
        correctAnswer: 'Concept A',
        explanation: 'Concept A is correct because...'
      },
      nextSteps: ['Review the basics', 'Practice more exercises'],
      resources: [
        {
          type: 'video',
          title: `Introduction to ${request.topic}`,
          url: '#',
          description: 'A helpful video overview.'
        }
      ],
      masteryAssessment: {
        currentLevel: request.currentLevel,
        progressToNextLevel: 10,
        recommendedPracticeTime: 15
      },
      motivationalMessage: "Keep going! You're doing great."
    };
  }
}

export const orchestratorService = new OrchestratorService();
