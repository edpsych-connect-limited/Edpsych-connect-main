import { logger } from "@/lib/logger";
/**
 * 🎬 LIVING DEMONSTRATIONS SYSTEM
 * Real-time AI capability demonstrations that show the "invisible brain" in action
 *
 * This system provides interactive demos where visitors can see AI agents
 * actually working and generating real educational content.
 */

import { aiService } from './core';

interface DemoSession {
  id: string;
  type: 'lesson-planning' | 'report-writing' | 'behavior-analysis' | 'parent-communication';
  status: 'idle' | 'generating' | 'complete' | 'error';
  input: any;
  output: any;
  progress: number;
  startTime: Date;
  endTime?: Date;
}

interface DemoTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  inputSchema: any;
  exampleInput: any;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export class LivingDemonstrationsSystem {
  private activeDemos: Map<string, DemoSession> = new Map();
  private demoTemplates: DemoTemplate[] = [];
  private demoHistory: any[] = [];

  constructor() {
    this.initializeDemoTemplates();
    logger.debug('🎬 Living Demonstrations System initialized');
  }

  /**
   * Start a new demonstration
   */
  async startDemo(type: string, input: any, sessionId?: string): Promise<string> {
    const demoId = sessionId || `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const demoSession: DemoSession = {
      id: demoId,
      type: type as any,
      status: 'generating',
      input,
      output: null,
      progress: 0,
      startTime: new Date()
    };

    this.activeDemos.set(demoId, demoSession);

    // Start the demo generation
    this.runDemo(demoSession);

    logger.debug(`🎬 Started ${type} demo: ${demoId}`);
    return demoId;
  }

  /**
   * Get demo status and progress
   */
  getDemoStatus(demoId: string): DemoSession | null {
    return this.activeDemos.get(demoId) || null;
  }

  /**
   * Get available demo templates
   */
  getDemoTemplates(): DemoTemplate[] {
    return this.demoTemplates;
  }

  /**
   * Get demo history for analytics
   */
  getDemoHistory(limit: number = 10): any[] {
    return this.demoHistory.slice(-limit);
  }

  /**
   * Run the actual demonstration
   */
  private async runDemo(demoSession: DemoSession): Promise<void> {
    try {
      // Update progress
      this.updateDemoProgress(demoSession.id, 25);

      // Generate content based on demo type
      const output = await this.generateDemoContent(demoSession.type, demoSession.input);

      // Update progress
      this.updateDemoProgress(demoSession.id, 75);

      // Complete the demo
      demoSession.output = output;
      demoSession.status = 'complete';
      demoSession.progress = 100;
      demoSession.endTime = new Date();

      // Store in history
      this.demoHistory.push({
        id: demoSession.id,
        type: demoSession.type,
        duration: demoSession.endTime.getTime() - demoSession.startTime.getTime(),
        success: true,
        timestamp: new Date()
      });

      logger.debug(`✅ Demo completed: ${demoSession.type} in ${demoSession.endTime.getTime() - demoSession.startTime.getTime()}ms`);

    } catch (_error) {
      console.error(`❌ Demo failed: ${demoSession.type}`, error);

      demoSession.status = 'error';
      demoSession.output = { error: error instanceof Error ? error.message : String(error) };

      // Store failed demo in history
      this.demoHistory.push({
        id: demoSession.id,
        type: demoSession.type,
        duration: Date.now() - demoSession.startTime.getTime(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
    }
  }

  /**
   * Generate demo content based on type
   */
  private async generateDemoContent(type: string, input: any): Promise<any> {
    switch (type) {
      case 'lesson-planning':
        return await this.generateLessonPlanDemo(input);
      case 'report-writing':
        return await this.generateReportWritingDemo(input);
      case 'behavior-analysis':
        return await this.generateBehaviorAnalysisDemo(input);
      case 'parent-communication':
        return await this.generateParentCommunicationDemo(input);
      default:
        throw new Error(`Unknown demo type: ${type}`);
    }
  }

  /**
   * Generate lesson planning demo
   */
  private async generateLessonPlanDemo(input: any): Promise<any> {
    const prompt = `
      Create a sample lesson plan for:

      Subject: ${input.subject || 'Mathematics'}
      Year Group: ${input.yearGroup || 'Year 5'}
      Topic: ${input.topic || 'Fractions'}
      Duration: ${input.duration || '60'} minutes
      Learning Objectives: ${input.objectives || 'Understand equivalent fractions, Add and subtract fractions with the same denominator'}

      Generate a complete, engaging lesson plan that includes:
      1. Starter activity (10 minutes)
      2. Main teaching with differentiation (30 minutes)
      3. Interactive activities (15 minutes)
      4. Plenary assessment (5 minutes)
      5. Extension tasks
      6. Resources needed

      Make it creative, aligned with UK curriculum, and suitable for mixed-ability classes.
    `;

    const response = await aiService.generateResponse({
      prompt,
      id: 'demo-user',
      subscriptionTier: 'enterprise',
      useCase: 'lesson_planning',
      maxTokens: 1200,
      temperature: 0.7
    });

    return {
      lessonPlan: response.content,
      metadata: {
        subject: input.subject,
        yearGroup: input.yearGroup,
        topic: input.topic,
        duration: input.duration,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate report writing demo
   */
  private async generateReportWritingDemo(input: any): Promise<any> {
    const prompt = `
      Write a sample student report for:

      Student Name: ${input.studentName || 'Alex Johnson'}
      Subject: ${input.subject || 'Mathematics'}
      Year Group: ${input.yearGroup || 'Year 6'}
      Reporting Period: ${input.period || 'Autumn Term'}

      Student Context:
      - Current Level: ${input.currentLevel || 'Working at expected standard'}
      - Strengths: ${input.strengths || 'Excellent problem-solving skills, strong number bonds'}
      - Areas for Development: ${input.areasForDevelopment || 'Needs to show working out more clearly'}
      - Attitude: ${input.attitude || 'Enthusiastic and engaged in lessons'}

      Write a professional, encouraging report that:
      - Highlights achievements and progress
      - Provides specific next steps
      - Uses positive, supportive language
      - Is suitable for parents to read
      - Is approximately 200-300 words
    `;

    const response = await aiService.generateResponse({
      prompt,
      id: 'demo-user',
      subscriptionTier: 'enterprise',
      useCase: 'report_writing',
      maxTokens: 800,
      temperature: 0.6
    });

    return {
      studentReport: response.content,
      metadata: {
        studentName: input.studentName,
        subject: input.subject,
        yearGroup: input.yearGroup,
        period: input.period,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate behavior analysis demo
   */
  private async generateBehaviorAnalysisDemo(input: any): Promise<any> {
    const prompt = `
      Analyze this student's behavior pattern and provide recommendations:

      Student: ${input.studentName || 'Jamie Smith'}
      Year Group: ${input.yearGroup || 'Year 8'}
      Subject: ${input.subject || 'General classroom behavior'}

      Behavior Incidents (last 2 weeks):
      ${input.incidents || `
      - Monday: Called out in class 3 times, distracted peers
      - Wednesday: Refused to complete homework, argued with teacher
      - Friday: Arrived late, disrupted lesson start
      `}

      Positive Behaviors:
      ${input.positiveBehaviors || `
      - Helps classmates with work
      - Shows enthusiasm for practical activities
      - Good attendance record
      `}

      Provide a comprehensive behavior analysis that includes:
      1. Pattern identification and triggers
      2. Underlying causes analysis
      3. Evidence-based intervention strategies
      4. Support recommendations
      5. Monitoring plan
    `;

    const response = await aiService.generateResponse({
      prompt,
      id: 'demo-user',
      subscriptionTier: 'enterprise',
      useCase: 'behavior_analysis',
      maxTokens: 1000,
      temperature: 0.5
    });

    return {
      behaviorAnalysis: response.content,
      metadata: {
        studentName: input.studentName,
        yearGroup: input.yearGroup,
        subject: input.subject,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate parent communication demo
   */
  private async generateParentCommunicationDemo(input: any): Promise<any> {
    const prompt = `
      Write a professional email to parents about:

      Purpose: ${input.purpose || 'Student progress update'}
      Student Name: ${input.studentName || 'Emma Davis'}
      Subject: ${input.subject || 'Mathematics'}

      Key Points to Cover:
      ${input.keyPoints || `
      - Excellent progress in problem-solving
      - Needs improvement in showing working out
      - Homework completion has been inconsistent
      - Very positive attitude in lessons
      `}

      Tone: ${input.tone || 'Encouraging and supportive'}

      Write a professional email that:
      - Starts with positive news
      - Addresses areas for development constructively
      - Provides specific next steps
      - Invites parent involvement
      - Ends on an encouraging note
      - Is suitable for parent-teacher communication
    `;

    const response = await aiService.generateResponse({
      prompt,
      id: 'demo-user',
      subscriptionTier: 'enterprise',
      useCase: 'parent_communication',
      maxTokens: 600,
      temperature: 0.6
    });

    return {
      parentEmail: response.content,
      metadata: {
        studentName: input.studentName,
        subject: input.subject,
        purpose: input.purpose,
        tone: input.tone,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Update demo progress
   */
  private updateDemoProgress(demoId: string, progress: number): void {
    const demo = this.activeDemos.get(demoId);
    if (demo) {
      demo.progress = progress;
      this.activeDemos.set(demoId, demo);
    }
  }

  /**
   * Initialize demo templates
   */
  private initializeDemoTemplates(): void {
    this.demoTemplates = [
      {
        id: 'fractions-lesson',
        title: 'Interactive Fractions Lesson Plan',
        description: 'See how AI generates a complete, differentiated lesson plan for teaching fractions',
        category: 'Lesson Planning',
        inputSchema: {
          subject: 'string',
          yearGroup: 'string',
          topic: 'string',
          duration: 'number'
        },
        exampleInput: {
          subject: 'Mathematics',
          yearGroup: 'Year 5',
          topic: 'Equivalent Fractions',
          duration: 60
        },
        estimatedTime: 3000,
        difficulty: 'intermediate'
      },
      {
        id: 'student-report',
        title: 'AI-Generated Student Report',
        description: 'Watch AI create a professional, personalized student report with specific feedback',
        category: 'Report Writing',
        inputSchema: {
          studentName: 'string',
          subject: 'string',
          yearGroup: 'string',
          period: 'string'
        },
        exampleInput: {
          studentName: 'Alex Johnson',
          subject: 'English',
          yearGroup: 'Year 6',
          period: 'Spring Term'
        },
        estimatedTime: 2500,
        difficulty: 'intermediate'
      },
      {
        id: 'behavior-analysis',
        title: 'Behavior Pattern Analysis',
        description: 'See how AI analyzes behavior patterns and suggests evidence-based interventions',
        category: 'Behavior Analysis',
        inputSchema: {
          studentName: 'string',
          yearGroup: 'string',
          subject: 'string'
        },
        exampleInput: {
          studentName: 'Jamie Smith',
          yearGroup: 'Year 8',
          subject: 'General classroom behavior'
        },
        estimatedTime: 4000,
        difficulty: 'advanced'
      },
      {
        id: 'parent-email',
        title: 'Parent Communication Email',
        description: 'Watch AI generate a professional parent email with the right tone and structure',
        category: 'Communication',
        inputSchema: {
          studentName: 'string',
          subject: 'string',
          purpose: 'string',
          tone: 'string'
        },
        exampleInput: {
          studentName: 'Emma Davis',
          subject: 'Mathematics',
          purpose: 'Progress update',
          tone: 'Encouraging'
        },
        estimatedTime: 2000,
        difficulty: 'beginner'
      }
    ];
  }

  /**
   * Get demo statistics
   */
  getDemoStats(): any {
    const totalDemos = this.demoHistory.length;
    const successfulDemos = this.demoHistory.filter(d => d.success).length;
    const averageDuration = this.demoHistory
      .filter(d => d.success)
      .reduce((sum, d) => sum + d.duration, 0) / Math.max(successfulDemos, 1);

    const demosByType = this.demoHistory.reduce((acc, demo) => {
      acc[demo.type] = (acc[demo.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDemos,
      successfulDemos,
      successRate: totalDemos > 0 ? (successfulDemos / totalDemos) * 100 : 0,
      averageDuration,
      demosByType,
      activeDemos: this.activeDemos.size
    };
  }

  /**
   * Clean up old demo sessions
   */
  cleanupOldDemos(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [demoId, demo] of Array.from(this.activeDemos.entries())) {
      if (demo.startTime.getTime() < cutoffTime) {
        this.activeDemos.delete(demoId);
      }
    }

    // Keep only last 1000 demos in history
    if (this.demoHistory.length > 1000) {
      this.demoHistory = this.demoHistory.slice(-1000);
    }
  }
}

// Export singleton instance
export const livingDemos = new LivingDemonstrationsSystem();