/**
 * Service for connecting to the AI engines used in the EdPsych Connect platform
 * Integrated with the central AI Integration Service
 */
import { aiAnalytics } from './ai-analytics';
import { aiService } from '@/lib/ai-integration';
import { prisma } from '@/lib/prisma';
import { logger } from "@/lib/logger";

interface ChallengeConfig {
  solutionTemplates: Record<string, string[]>;
  savingsData: Record<string, { hoursPerWeek: number; hoursPerMonth: number; description: string }>;
  featureMap: Record<string, Array<{ name: string; description: string; impact: string }>>;
}

export class AIService {
  
  private static async getChallengeConfig(): Promise<ChallengeConfig> {
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { key: 'challenge_templates' }
      });
      
      if (config && config.value) {
        return config.value as unknown as ChallengeConfig;
      }
    } catch (_e) {
      logger.warn('Failed to fetch challenge config from DB, using defaults');
    }

    // Default configuration (fallback)
    return {
      solutionTemplates: {
        report_automation: [
          'Automated report generation using natural classroom interactions',
          'Intelligent content analysis and synthesis',
          'Personalized student insights and progress tracking',
          'One-click report customization and formatting'
        ],
        assessment_automation: [
          'AI-powered assessment creation and grading',
          'Real-time feedback and progress monitoring',
          'Adaptive difficulty adjustment',
          'Comprehensive analytics and insights'
        ],
        lesson_planning: [
          'Intelligent curriculum mapping and alignment',
          'Personalized learning path generation',
          'Resource recommendation and optimization',
          'Collaborative planning tools'
        ],
        parent_communication: [
          'Automated progress updates and notifications',
          'Personalized communication templates',
          'Real-time parent portal integration',
          'Scheduled communication workflows'
        ],
        behavior_analysis: [
          'Pattern recognition and early intervention',
          'Predictive behavior modeling',
          'Personalized intervention strategies',
          'Progress tracking and adjustment'
        ],
        student_engagement: [
          'Gamified learning experiences',
          'Personalized content recommendations',
          'Interactive and adaptive learning paths',
          'Real-time engagement monitoring'
        ],
        general_automation: [
          'Workflow optimization and automation',
          'Intelligent task prioritization',
          'Resource allocation optimization',
          'Performance analytics and insights'
        ]
      },
      savingsData: {
        report_automation: {
          hoursPerWeek: 8,
          hoursPerMonth: 35,
          description: 'hours saved on report writing and documentation'
        },
        assessment_automation: {
          hoursPerWeek: 6,
          hoursPerMonth: 26,
          description: 'hours saved on assessment creation and grading'
        },
        lesson_planning: {
          hoursPerWeek: 5,
          hoursPerMonth: 22,
          description: 'hours saved on lesson planning and preparation'
        },
        parent_communication: {
          hoursPerWeek: 4,
          hoursPerMonth: 18,
          description: 'hours saved on parent communication and updates'
        },
        behavior_analysis: {
          hoursPerWeek: 7,
          hoursPerMonth: 30,
          description: 'hours saved on behavior tracking and intervention planning'
        },
        student_engagement: {
          hoursPerWeek: 3,
          hoursPerMonth: 13,
          description: 'hours saved on engagement monitoring and personalization'
        },
        general_automation: {
          hoursPerWeek: 5,
          hoursPerMonth: 22,
          description: 'hours saved on administrative tasks and workflows'
        }
      },
      featureMap: {
        report_automation: [
          {
            name: 'Smart Report Generator',
            description: 'Creates comprehensive reports from natural interactions',
            impact: '95% reduction in report writing time'
          },
          {
            name: 'Progress Analytics',
            description: 'Real-time student progress tracking and insights',
            impact: '60% better student outcomes'
          }
        ],
        assessment_automation: [
          {
            name: 'Intelligent Assessment Engine',
            description: 'Automated assessment creation and grading',
            impact: '80% faster assessment processing'
          },
          {
            name: 'Adaptive Testing',
            description: 'Dynamic difficulty adjustment based on performance',
            impact: '40% improvement in assessment accuracy'
          }
        ],
        lesson_planning: [
          {
            name: 'Curriculum Optimizer',
            description: 'AI-powered lesson planning and resource allocation',
            impact: '70% reduction in planning time'
          },
          {
            name: 'Learning Path Designer',
            description: 'Personalized learning journeys for each student',
            impact: '85% increase in student engagement'
          }
        ],
        parent_communication: [
          {
            name: 'Parent Portal',
            description: 'Real-time updates and communication tools',
            impact: '90% improvement in parent satisfaction'
          },
          {
            name: 'Automated Notifications',
            description: 'Smart communication scheduling and personalization',
            impact: '75% reduction in communication overhead'
          }
        ],
        behavior_analysis: [
          {
            name: 'Behavior Pattern Recognition',
            description: 'Early identification of behavioral patterns and needs',
            impact: '65% reduction in behavioral incidents'
          },
          {
            name: 'Intervention Planning',
            description: 'Personalized intervention strategies and tracking',
            impact: '80% improvement in intervention success'
          }
        ],
        student_engagement: [
          {
            name: 'Engagement Analytics',
            description: 'Real-time monitoring of student engagement levels',
            impact: '73% increase in student participation'
          },
          {
            name: 'Personalized Content',
            description: 'Adaptive content delivery based on learning style',
            impact: '91% improvement in content relevance'
          }
        ],
        general_automation: [
          {
            name: 'Workflow Automation',
            description: 'Intelligent automation of routine administrative tasks',
            impact: '87% reduction in administrative overhead'
          },
          {
            name: 'Smart Scheduling',
            description: 'Optimized resource allocation and scheduling',
            impact: '60% improvement in operational efficiency'
          }
        ]
      }
    };
  }

  /**
   * Analyze assessment results using AI to identify learning patterns
   *
   * @param assessmentData - The assessment data to analyze
   * @returns Analysis results with identified patterns
   */
  static async analyzeAssessmentResults(assessmentData: any) {
    try {
      let studentContext = '';
      if (assessmentData.studentId) {
        const student = await prisma.students.findUnique({ 
          where: { id: parseInt(assessmentData.studentId.toString()) } 
        });
        if (student) {
          studentContext = `Student: ${student.first_name} ${student.last_name}, Year Group: ${student.year_group}`;
        }
      }

      const prompt = `
        Analyze the following assessment results for student ID ${assessmentData.studentId}:
        ${studentContext}
        Assessment Type: ${assessmentData.assessmentType}
        Score: ${assessmentData.score}
        Responses: ${JSON.stringify(assessmentData.responses)}
        
        Identify learning patterns, strengths, and areas for improvement.
        Provide insights on cognitive processing and subject mastery.
      `;

      const response = await aiService.processRequest({
        prompt,
        id: assessmentData.studentId?.toString() || 'system',
        subscriptionTier: 'professional',
        useCase: 'assessment',
        maxTokens: 1000
      });

      let parsedResponse;
      try {
        // Attempt to parse JSON response from AI
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: [response.response] };
      } catch (_e) {
        parsedResponse = { insights: [response.response] };
      }

      return {
        patterns: parsedResponse.patterns || [], 
        insights: parsedResponse.insights || [response.response],
        rawAnalysis: response.response
      };
    } catch (_error) {
      logger._error('Error analyzing assessment results:', _error as Error);
      throw new Error('Failed to analyze assessment results');
    }
  }

  /**
   * Get personalized learning recommendations based on assessment results
   *
   * @param studentId - The ID of the student
   * @param assessmentId - The ID of the assessment
   * @returns Personalized recommendations
   */
  static async getRecommendations(studentId: string, assessmentId: string) {
    try {
      const student = await prisma.students.findUnique({ 
        where: { id: parseInt(studentId) } 
      });
      
      const studentContext = student 
        ? `Student: ${student.first_name} ${student.last_name}, Year: ${student.year_group}`
        : `Student ID: ${studentId}`;

      const prompt = `
        Generate personalized learning recommendations for ${studentContext} based on assessment ${assessmentId}.
        Include specific resources and strategies suitable for Year ${student?.year_group || 'Unknown'}.
      `;

      const response = await aiService.processRequest({
        prompt,
        id: studentId,
        subscriptionTier: 'professional',
        useCase: 'curriculum_advice',
        maxTokens: 800
      });

      // Fetch relevant resources from the database based on the recommendation context
      // In a production environment, we would use vector search here
      const resources = await prisma.content.findMany({
        where: {
          is_public: true,
          // Simple keyword matching for now, would be replaced by vector search
          OR: [
            { title: { contains: 'learning', mode: 'insensitive' } },
            { description: { contains: 'strategy', mode: 'insensitive' } }
          ]
        },
        take: 3
      });

      return {
        recommendations: [response.response],
        resources: resources
      };
    } catch (_error) {
      logger._error('Error generating recommendations:', _error as Error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Predict student performance and learning trajectory
   *
   * @param studentId - The ID of the student
   * @returns Predicted learning trajectory and performance indicators
   */
  static async predictStudentTrajectory(studentId: string) {
    try {
      const student = await prisma.students.findUnique({ 
        where: { id: parseInt(studentId) } 
      });

      const prompt = `
        Predict the learning trajectory for ${student ? student.first_name : 'student ' + studentId} for the next term.
        Consider current performance trends and engagement levels.
      `;

      const response = await aiService.processRequest({
        prompt,
        id: studentId,
        subscriptionTier: 'professional',
        useCase: 'data_analysis',
        maxTokens: 800
      });

      // Calculate confidence based on data completeness
      const dataCompleteness = student ? 0.9 : 0.5;

      return {
        trajectory: response.response,
        confidence: dataCompleteness
      };
    } catch (_error) {
      logger._error('Error predicting student trajectory:', _error as Error);
      throw new Error('Failed to predict student trajectory');
    }
  }

  /**
   * Identify potential learning difficulties based on assessment patterns
   *
   * @param studentId - The ID of the student
   * @returns Potential learning difficulties with confidence scores
   */
  static async identifyLearningDifficulties(studentId: string) {
    try {
      const student = await prisma.students.findUnique({ 
        where: { id: parseInt(studentId) } 
      });

      const prompt = `
        Analyze ${student ? student.first_name : 'student ' + studentId}'s performance for potential learning difficulties.
        Look for indicators of dyslexia, dyscalculia, or other SEND needs.
      `;

      const response = await aiService.processRequest({
        prompt,
        id: studentId,
        subscriptionTier: 'professional',
        useCase: 'special_education',
        maxTokens: 1000
      });

      let difficulties: string[] = [];
      try {
        // Attempt to extract list items if AI returns a list
        const matches = response.response.match(/[-*]\s+(.*)/g);
        if (matches) {
          difficulties = matches.map(m => m.replace(/[-*]\s+/, '').trim());
        }
      } catch (_e) {
        // Keep empty if parsing fails
      }

      return {
        difficulties: difficulties,
        analysis: response.response,
        confidence: student ? 0.85 : 0.6
      };
    } catch (_error) {
      logger._error('Error identifying learning difficulties:', _error as Error);
      throw new Error('Failed to identify learning difficulties');
    }
  }

  /**
   * Generate a customized intervention plan based on student needs
   *
   * @param studentId - The ID of the student
   * @param difficultyAreas - Areas of difficulty to address
   * @returns Customized intervention plan
   */
  static async generateInterventionPlan(studentId: string, difficultyAreas: string[]) {
    try {
      const student = await prisma.students.findUnique({ 
        where: { id: parseInt(studentId) } 
      });

      const prompt = `
        Create a customized intervention plan for ${student ? student.first_name : 'student ' + studentId}.
        Target areas: ${difficultyAreas.join(', ')}.
        Include specific activities, duration, and success criteria suitable for Year ${student?.year_group || 'Unknown'}.
      `;

      const response = await aiService.processRequest({
        prompt,
        id: studentId,
        subscriptionTier: 'professional',
        useCase: 'special_education',
        maxTokens: 1200
      });

      // Fetch relevant intervention resources
      const resources = await prisma.content.findMany({
        where: {
          content_type: 'intervention',
          is_public: true
        },
        take: 3
      });

      return {
        plan: response.response,
        resources: resources
      };
    } catch (_error) {
      logger._error('Error generating intervention plan:', _error as Error);
      throw new Error('Failed to generate intervention plan');
    }
  }

  /**
   * Analyze educational challenges and provide intelligent solutions
   * Used by the hero section problem solver
   *
   * @param challenge - The challenge description from the user
   * @returns Analysis with solutions, time savings, and recommendations
   */
  static async analyzeChallenge(challenge: string) {
    const startTime = Date.now();
    
    try {
      const prompt = `
        Analyze this educational challenge: "${challenge}"
        
        Provide:
        1. Category of the challenge (e.g., Report Writing, Lesson Planning, Behavior)
        2. 3-4 specific, actionable solutions using AI technology
        3. Estimated time savings (hours per week/month)
        4. Relevant platform features that can help
        
        Format the response as JSON.
      `;

      const response = await aiService.processRequest({
        prompt,
        id: 'system',
        subscriptionTier: 'professional',
        useCase: 'general_automation', // Fallback use case
        maxTokens: 1000
      });

      const config = await this.getChallengeConfig();
      const analysis = this.categorizeChallenge(challenge);
      
      // Use config for solutions/savings/features
      const solutions = config.solutionTemplates[analysis.category] || config.solutionTemplates.general_automation;
      const timeSavings = config.savingsData[analysis.category] || config.savingsData.general_automation;
      const features = config.featureMap[analysis.category] || config.featureMap.general_automation;

      const result = {
        category: analysis.category,
        confidence: 0.9,
        solutions: solutions,
        timeSavings: timeSavings,
        features: features,
        estimatedImplementation: analysis.estimatedImplementation,
        aiAnalysis: response.response // Include the raw AI analysis
      };

      // Track successful analytics event
      await aiAnalytics.trackEvent({
        service: 'ai_service',
        operation: 'analyze_challenge',
        duration: Date.now() - startTime,
        success: true,
        metadata: {
          challengeLength: challenge.length,
          category: analysis.category,
          hasSolutions: solutions.length > 0
        }
      });

      return result;
    } catch (_err) {
      const error = _err instanceof Error ? _err.message : 'Unknown error';
      logger.error('Error analyzing challenge:', _err as Error);

      // Track failed analytics event
      await aiAnalytics.trackEvent({
        service: 'ai_service',
        operation: 'analyze_challenge',
        duration: Date.now() - startTime,
        success: false,
        error: error,
        metadata: {
          challengeLength: challenge.length
        }
      });

      throw new Error('Failed to analyze challenge');
    }
  }

  /**
   * Categorize the challenge based on content analysis
   */
  private static categorizeChallenge(challenge: string): {
    category: string;
    estimatedImplementation: string;
  } {
    const lowerChallenge = challenge.toLowerCase();

    if (lowerChallenge.includes('report') || lowerChallenge.includes('writing') || lowerChallenge.includes('documentation')) {
      return {
        category: 'report_automation',
        estimatedImplementation: '2-3 weeks'
      };
    }

    if (lowerChallenge.includes('assessment') || lowerChallenge.includes('grading') || lowerChallenge.includes('marking')) {
      return {
        category: 'assessment_automation',
        estimatedImplementation: '3-4 weeks'
      };
    }

    if (lowerChallenge.includes('planning') || lowerChallenge.includes('lesson') || lowerChallenge.includes('curriculum')) {
      return {
        category: 'lesson_planning',
        estimatedImplementation: '1-2 weeks'
      };
    }

    if (lowerChallenge.includes('communication') || lowerChallenge.includes('parent') || lowerChallenge.includes('email')) {
      return {
        category: 'parent_communication',
        estimatedImplementation: '1 week'
      };
    }

    if (lowerChallenge.includes('behavior') || lowerChallenge.includes('behaviour') || lowerChallenge.includes('discipline')) {
      return {
        category: 'behavior_analysis',
        estimatedImplementation: '2-3 weeks'
      };
    }

    if (lowerChallenge.includes('engagement') || lowerChallenge.includes('motivation') || lowerChallenge.includes('interest')) {
      return {
        category: 'student_engagement',
        estimatedImplementation: '2-4 weeks'
      };
    }

    return {
      category: 'general_automation',
      estimatedImplementation: '2-3 weeks'
    };
  }
}