/**
 * Intelligent Navigation & Support Service for EdPsych Connect World
 * Makes the platform effortless to use with AI-powered guidance
 */

import { type AIService as _AIService } from './ai-service';
import { Activity, Users, BookOpen, Settings } from 'lucide-react';

// ============================================================================
// STUDIO ARCHITECTURE (Navigator Map)
// ============================================================================
// The "Studios" are the top-level workspaces for different personas.
// This definition is the Single Source of Truth for Studio metadata.

export interface StudioDefinition {
  id: string;
  title: string;
  description: string;
  videoKey: string;
  icon: any; // Lucide Icon Component
  features: string[];
  ctaLink: string;
  ctaText: string;
  roles: string[]; // Access control
}

export const STUDIO_DEFINITIONS: Record<string, StudioDefinition> = {
  'clinical': {
    id: 'clinical',
    title: 'Clinical Studio',
    description: 'Comprehensive assessment, intervention, and case management for Educational Psychologists.',
    videoKey: 'clinical-studio-overview',
    icon: Activity,
    features: [
      'EHCP Management & Automation',
      'Clinical Assessment Suite',
      'Intervention Library',
      'Case File Management'
    ],
    ctaLink: '/ehcp',
    ctaText: 'Go to EHCP Dashboard',
    roles: ['ADMIN', 'SUPERADMIN', 'EP', 'EDUCATIONAL_PSYCHOLOGIST', 'SENCO', 'LAA']
  },
  'engagement': {
    id: 'engagement',
    title: 'Engagement Studio',
    description: 'Tools to boost student participation, track rewards, and manage gamified learning journeys.',
    videoKey: 'engagement-studio-overview',
    icon: Users,
    features: [
      'Gamification Zone',
      'Token Economy System',
      'Training Centre',
      'AI Companions (Beta)'
    ],
    ctaLink: '/gamification',
    ctaText: 'Enter Gamification Zone',
    roles: ['ADMIN', 'SUPERADMIN', 'TEACHER', 'STAFF', 'STUDENT']
  },
  'classroom': {
    id: 'classroom',
    title: 'Classroom Studio',
    description: 'Empowering teachers with behaviour tracking, progress monitoring, and peer networking.',
    videoKey: 'classroom-studio-overview',
    icon: BookOpen,
    features: [
      'Classroom Management',
      'Pupil Progress Tracking',
      'Behaviour Tracker',
      'Staff Community'
    ],
    ctaLink: '/teachers',
    ctaText: 'Manage Classroom',
    roles: ['ADMIN', 'SUPERADMIN', 'TEACHER', 'STAFF', 'SENCO']
  },
  'admin': {
    id: 'admin',
    title: 'Admin Studio',
    description: 'System-wide control, compliance, and institutional administration for LA and Superadmins.',
    videoKey: 'admin-studio-overview',
    icon: Settings,
    features: [
      'Institutional Management',
      'System Administration',
      'LA Dashboard',
      'Compliance & Audits'
    ],
    ctaLink: '/admin',
    ctaText: 'System Administration',
    roles: ['ADMIN', 'SUPERADMIN', 'LAA', 'LOCAL_AUTHORITY']
  }
};

export interface UserSession {
  id: string;
  userId: string;
  tenantId: string;
  userRole: string;
  currentPage: string;
  navigationPath: NavigationStep[];
  helpRequests: HelpRequest[];
  confusionSignals: ConfusionSignal[];
  lastActivity: Date;
  sessionStart: Date;
}

export interface NavigationStep {
  page: string;
  timestamp: Date;
  timeSpent: number;
  actions: string[];
  success: boolean;
}

export interface HelpRequest {
  id: string;
  type: 'navigation' | 'feature' | 'troubleshooting' | 'clarification';
  question: string;
  context: string;
  userRole: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
  satisfaction?: number;
}

export interface ConfusionSignal {
  type: 'hesitation' | 'backtracking' | 'repeated_actions' | 'error' | 'timeout';
  context: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export interface NavigationGuide {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
  targetAudience: string[];
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  action: string;
  visual: string;
  tips: string[];
  validation: string;
}

export interface SmartTip {
  id: string;
  trigger: string;
  content: string;
  type: 'navigation' | 'feature' | 'optimization' | 'reminder';
  relevance: number;
  action?: string;
}

export interface SupportWorkflow {
  id: string;
  trigger: string;
  steps: WorkflowStep[];
  escalation: EscalationRule[];
  successRate: number;
}

export interface WorkflowStep {
  id: string;
  type: 'information' | 'demonstration' | 'interactive' | 'validation';
  content: string;
  action?: string;
  validation?: string;
}

export interface EscalationRule {
  condition: string;
  action: 'human_support' | 'advanced_guide' | 'peer_support';
  priority: 'low' | 'medium' | 'high';
  timeframe: number; // minutes
}

export class NavigationService {
  private static instance: NavigationService;
  private userSessions: Map<string, UserSession> = new Map();
  private navigationGuides: Map<string, NavigationGuide> = new Map();
  private smartTips: SmartTip[] = [];
  private supportWorkflows: Map<string, SupportWorkflow> = new Map();

  private constructor() {
    this.initializeDefaultGuides();
    this.initializeSmartTips();
    this.initializeSupportWorkflows();
  }

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Start intelligent user session tracking
   */
  startUserSession(userId: string, tenantId: string, userRole: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: UserSession = {
      id: sessionId,
      userId,
      tenantId,
      userRole,
      currentPage: 'dashboard',
      navigationPath: [],
      helpRequests: [],
      confusionSignals: [],
      lastActivity: new Date(),
      sessionStart: new Date()
    };

    this.userSessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Track user navigation with intelligent insights
   */
  trackNavigation(sessionId: string, page: string, actions: string[]): void {
    const session = this.userSessions.get(sessionId);
    if (!session) return;

    const now = new Date();
    const timeSpent = session.navigationPath.length > 0
      ? now.getTime() - session.navigationPath[session.navigationPath.length - 1].timestamp.getTime()
      : 0;

    // Add previous step's time spent
    if (session.navigationPath.length > 0) {
      session.navigationPath[session.navigationPath.length - 1].timeSpent = timeSpent;
    }

    // Add new step
    session.navigationPath.push({
      page,
      timestamp: now,
      timeSpent: 0,
      actions,
      success: true
    });

    session.currentPage = page;
    session.lastActivity = now;

    // Analyze for confusion signals
    this.analyzeConfusionSignals(session);
  }

  /**
   * Provide intelligent navigation assistance
   */
  async getNavigationAssistance(
    sessionId: string,
    currentContext: string,
    userIntent?: string
  ): Promise<any> {
    const session = this.userSessions.get(sessionId);
    if (!session) return null;

    // Analyze user's current situation
    const userPattern = this.analyzeUserPattern(session);
    const relevantGuides = this.findRelevantGuides(session.userRole, currentContext, userPattern);
    const smartTips = this.getContextualTips(session, currentContext);

    return {
      suggestedActions: this.generateSuggestedActions(session, currentContext),
      quickGuides: relevantGuides.slice(0, 3),
      smartTips,
      nextSteps: this.predictNextSteps(session, userIntent),
      confidence: this.calculateAssistanceConfidence(session, userPattern)
    };
  }

  /**
   * Handle help request with intelligent resolution
   */
  async handleHelpRequest(
    sessionId: string,
    question: string,
    context: string
  ): Promise<any> {
    const session = this.userSessions.get(sessionId);
    if (!session) return null;

    const helpRequest: HelpRequest = {
      id: `help_${Date.now()}`,
      type: this.classifyHelpRequest(question),
      question,
      context,
      userRole: session.userRole,
      timestamp: new Date(),
      resolved: false
    };

    session.helpRequests.push(helpRequest);

    // Try to resolve automatically first
    const autoResolution = await this.attemptAutoResolution(helpRequest, session);

    if (autoResolution.success) {
      helpRequest.resolved = true;
      helpRequest.resolution = autoResolution.resolution;
      return autoResolution;
    }

    // Escalate to human support if needed
    return this.escalateToHumanSupport(helpRequest, session);
  }

  /**
   * Generate contextual smart tips
   */
  getContextualTips(session: UserSession, currentContext: string): SmartTip[] {
    const relevantTips = this.smartTips.filter(tip =>
      this.isTipRelevant(tip, session, currentContext)
    );

    return relevantTips
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  /**
   * Detect confusion signals and provide proactive help
   */
  detectConfusion(sessionId: string): any {
    const session = this.userSessions.get(sessionId);
    if (!session) return null;

    const recentSignals = session.confusionSignals.filter(
      signal => signal.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );

    if (recentSignals.length >= 3) {
      return {
        detected: true,
        severity: this.calculateConfusionSeverity(recentSignals),
        suggestions: this.generateConfusionInterventions(session, recentSignals),
        proactiveHelp: true
      };
    }

    return { detected: false };
  }

  /**
   * Provide workflow automation for common tasks
   */
  async executeWorkflow(
    sessionId: string,
    workflowType: string,
    parameters: any
  ): Promise<any> {
    const workflow = this.supportWorkflows.get(workflowType);
    if (!workflow) return { success: false, error: 'Workflow not found' };

    const session = this.userSessions.get(sessionId);
    if (!session) return { success: false, error: 'Session not found' };

    // Execute workflow steps
    const results: any[] = [];
    for (const step of workflow.steps) {
      const stepResult = await this.executeWorkflowStep(step, session, parameters);
      results.push(stepResult);

      if (!stepResult.success) {
        break;
      }
    }

    // Check escalation rules
    const shouldEscalate = this.checkEscalationRules(workflow, results);

    return {
      success: results.every(r => r.success),
      results,
      workflowCompleted: results.length === workflow.steps.length,
      needsEscalation: shouldEscalate,
      nextSteps: this.generateNextSteps(results, shouldEscalate)
    };
  }

  // Helper methods
  private analyzeUserPattern(session: UserSession): any {
    const recentSteps = session.navigationPath.slice(-10);

    return {
      timeSpent: recentSteps.reduce((total, step) => total + step.timeSpent, 0),
      pagesVisited: recentSteps.length,
      commonActions: this.extractCommonActions(recentSteps),
      efficiency: this.calculateNavigationEfficiency(recentSteps),
      confusionLevel: this.calculateConfusionLevel(session)
    };
  }

  private findRelevantGuides(userRole: string, context: string, pattern: any): NavigationGuide[] {
    return Array.from(this.navigationGuides.values()).filter(guide =>
      guide.targetAudience.includes(userRole) &&
      this.isGuideRelevant(guide, context, pattern)
    );
  }

  private generateSuggestedActions(session: UserSession, context: string): any[] {
    const actions = [
      {
        id: 'quick_setup',
        title: 'Complete Quick Setup',
        description: 'Finish your profile and preferences',
        action: 'navigate_to_setup',
        priority: 'high'
      },
      {
        id: 'explore_curriculum',
        title: 'Explore Curriculum Tools',
        description: 'Discover lesson planning and assessment features',
        action: 'navigate_to_curriculum',
        priority: 'medium'
      }
    ];

    return actions.filter(action => this.isActionRelevant(action, session, context));
  }

  private predictNextSteps(_session: UserSession, _intent?: string): any[] {
    // Predict likely next actions based on user behavior
    return [
      {
        action: 'view_dashboard',
        confidence: 0.8,
        reasoning: 'Most users check dashboard after login'
      }
    ];
  }

  private classifyHelpRequest(question: string): HelpRequest['type'] {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('navigate') || lowerQuestion.includes('find') || lowerQuestion.includes('go to')) {
      return 'navigation';
    }

    if (lowerQuestion.includes('how do') || lowerQuestion.includes('how to') || lowerQuestion.includes('use')) {
      return 'feature';
    }

    if (lowerQuestion.includes('not working') || lowerQuestion.includes('error') || lowerQuestion.includes('problem')) {
      return 'troubleshooting';
    }

    return 'clarification';
  }

  private async attemptAutoResolution(helpRequest: HelpRequest, session: UserSession): Promise<any> {
    // Try to resolve using AI and available guides
    const relevantGuide = this.findBestGuide(helpRequest, session);

    if (relevantGuide) {
      return {
        success: true,
        type: 'guided_resolution',
        resolution: `I found a quick guide that should help: "${relevantGuide.title}"`,
        guide: relevantGuide,
        confidence: 0.9
      };
    }

    // Try AI-powered resolution
    const aiResolution = await this.generateAIResolution(helpRequest, session);

    return aiResolution || {
      success: false,
      reason: 'Requires human assistance'
    };
  }

  private escalateToHumanSupport(helpRequest: HelpRequest, session: UserSession): any {
    return {
      success: false,
      escalated: true,
      priority: this.calculatePriority(helpRequest, session),
      estimatedWait: this.estimateWaitTime(helpRequest.type),
      reference: helpRequest.id
    };
  }

  private analyzeConfusionSignals(session: UserSession): void {
    const recentSteps = session.navigationPath.slice(-5);

    // Detect hesitation (long time on page)
    if (recentSteps.some(step => step.timeSpent > 300000)) { // 5 minutes
      session.confusionSignals.push({
        type: 'hesitation',
        context: session.currentPage,
        timestamp: new Date(),
        severity: 'medium',
        resolved: false
      });
    }

    // Detect backtracking
    if (recentSteps.length >= 3) {
      const recentPages = recentSteps.slice(-3).map(step => step.page);
      if (new Set(recentPages).size < recentPages.length) {
        session.confusionSignals.push({
          type: 'backtracking',
          context: session.currentPage,
          timestamp: new Date(),
          severity: 'low',
          resolved: false
        });
      }
    }
  }

  private calculateAssistanceConfidence(session: UserSession, pattern: any): number {
    // Higher confidence for experienced users with clear patterns
    const experience = session.navigationPath.length;
    const efficiency = pattern.efficiency;

    return Math.min(0.95, 0.5 + (experience * 0.1) + (efficiency * 0.3));
  }

  private isTipRelevant(tip: SmartTip, session: UserSession, context: string): boolean {
    // Check if tip trigger matches current context
    return context.toLowerCase().includes(tip.trigger.toLowerCase());
  }

  private calculateConfusionSeverity(signals: ConfusionSignal[]): 'low' | 'medium' | 'high' {
    const highSeverityCount = signals.filter(s => s.severity === 'high').length;
    if (highSeverityCount >= 2) return 'high';
    if (highSeverityCount >= 1) return 'medium';
    return 'low';
  }

  private generateConfusionInterventions(_session: UserSession, _signals: ConfusionSignal[]): any[] {
    return [
      {
        type: 'proactive_guide',
        title: 'Quick Start Guide',
        action: 'show_guide',
        urgency: 'medium'
      }
    ];
  }

  private async executeWorkflowStep(step: WorkflowStep, _session: UserSession, _parameters: any): Promise<any> {
    // Execute individual workflow step
    return {
      success: true,
      stepId: step.id,
      result: `Executed ${step.type} step`
    };
  }

  private checkEscalationRules(workflow: SupportWorkflow, results: any[]): boolean {
    // Check if workflow needs human escalation
    return results.some(result => !result.success);
  }

  private generateNextSteps(_results: any[], needsEscalation: boolean): any[] {
    if (needsEscalation) {
      return [
        {
          action: 'contact_support',
          title: 'Contact Support Team',
          description: 'Our team is ready to help you succeed'
        }
      ];
    }

    return [
      {
        action: 'continue_workflow',
        title: 'Continue Setup',
        description: 'You\'re doing great! Let\'s continue'
      }
    ];
  }

  private extractCommonActions(steps: NavigationStep[]): string[] {
    const actions = steps.flatMap(step => step.actions);
    return Array.from(new Set(actions));
  }

  private calculateNavigationEfficiency(steps: NavigationStep[]): number {
    const successfulSteps = steps.filter(step => step.success).length;
    return successfulSteps / steps.length;
  }

  private calculateConfusionLevel(session: UserSession): number {
    const recentSignals = session.confusionSignals.slice(-10);
    return recentSignals.length / 10;
  }

  private isGuideRelevant(guide: NavigationGuide, context: string, _pattern: any): boolean {
    return guide.tags.some(tag => context.toLowerCase().includes(tag.toLowerCase()));
  }

  private isActionRelevant(_action: any, _session: UserSession, _context: string): boolean {
    return true; // Simplified for now
  }

  private findBestGuide(helpRequest: HelpRequest, _session: UserSession): NavigationGuide | null {
    const relevantGuides = Array.from(this.navigationGuides.values()).filter(guide =>
      guide.tags.some(tag => helpRequest.question.toLowerCase().includes(tag.toLowerCase()))
    );

    return relevantGuides[0] || null;
  }

  private async generateAIResolution(_helpRequest: HelpRequest, _session: UserSession): Promise<any> {
    // Generate AI-powered resolution
    return {
      success: true,
      type: 'ai_resolution',
      resolution: 'Based on your question, here\'s what you need to do...',
      confidence: 0.8
    };
  }

  private calculatePriority(helpRequest: HelpRequest, session: UserSession): 'low' | 'medium' | 'high' {
    if (helpRequest.type === 'troubleshooting') return 'high';
    if (session.confusionSignals.length > 5) return 'high';
    return 'medium';
  }

  private estimateWaitTime(type: HelpRequest['type']): number {
    const waitTimes = {
      navigation: 2,
      feature: 5,
      troubleshooting: 1,
      clarification: 3
    };
    return waitTimes[type] || 5;
  }

  private initializeDefaultGuides(): void {
    const defaultGuides: NavigationGuide[] = [
      {
        id: 'getting_started',
        title: 'Getting Started with EdPsych Connect',
        description: 'Complete guide to setting up your account and getting the most from the platform',
        steps: [
          {
            id: 'step_1',
            title: 'Complete Your Profile',
            description: 'Add your details and preferences',
            action: 'navigate_to_profile',
            visual: 'profile_setup',
            tips: ['Use a clear profile photo', 'Add your subject specialisms'],
            validation: 'Profile completeness > 80%'
          }
        ],
        targetAudience: ['teacher', 'parent', 'administrator'],
        estimatedTime: 15,
        difficulty: 'beginner',
        tags: ['setup', 'profile', 'getting_started']
      }
    ];

    defaultGuides.forEach(guide => {
      this.navigationGuides.set(guide.id, guide);
    });
  }

  private initializeSmartTips(): void {
    this.smartTips = [
      {
        id: 'curriculum_tip',
        trigger: 'curriculum',
        content: '💡 Pro tip: Use our lesson planner to save hours of preparation time each week!',
        type: 'optimization',
        relevance: 0.9
      },
      {
        id: 'assessment_tip',
        trigger: 'assessment',
        content: '🎯 Did you know? Our assessment tools can grade work and provide feedback instantly!',
        type: 'feature',
        relevance: 0.8
      }
    ];
  }

  private initializeSupportWorkflows(): void {
    const workflows: SupportWorkflow[] = [
      {
        id: 'new_user_setup',
        trigger: 'first_login',
        steps: [
          {
            id: 'welcome',
            type: 'information',
            content: 'Welcome to EdPsych Connect! Let\'s get you set up for success.'
          },
          {
            id: 'profile_setup',
            type: 'interactive',
            content: 'Complete your profile to personalise your experience',
            action: 'show_profile_form'
          }
        ],
        escalation: [
          {
            condition: 'profile_incomplete_after_10_minutes',
            action: 'human_support',
            priority: 'medium',
            timeframe: 10
          }
        ],
        successRate: 0.95
      }
    ];

    workflows.forEach(workflow => {
      this.supportWorkflows.set(workflow.id, workflow);
    });
  }
}
