import { logger } from '../../utils/logger';

interface InterventionOptions {
  enableAutoTriggering?: boolean;
  interventionCooldown?: number;
  maxInterventionsPerStudent?: number;
  effectivenessTrackingPeriod?: number;
  escalationThreshold?: number;
}

interface InterventionTrigger {
  type: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors?: string[];
  context?: Record<string, any>;
}

interface InterventionEligibility {
  eligible: boolean;
  reason?: string;
  nextEligibleDate?: string;
}

interface InterventionResult {
  triggered: boolean;
  interventionId?: string;
  type?: string;
  deliveryMethod?: string[];
  scheduledFor?: string;
  expectedImpact?: number;
  reason?: string;
  nextEligibleDate?: string;
}

interface InterventionAction {
  type: string;
  template?: string;
  priority?: string;
  message?: string;
  schedule?: string;
  materials?: string[];
  match?: string;
  content?: string;
  unlock?: string;
  connect?: string;
}

interface InterventionTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  triggerConditions: {
    riskLevel?: string;
    factors?: string[];
  };
  actions: InterventionAction[];
  deliveryMethods: string[];
  effectivenessMetrics: string[];
  targetAudience: string;
  priority: string;
  createdAt: string;
  usageCount: number;
  effectiveness: {
    triggered: number;
    successful: number;
    averageImpact: number;
  };
}

interface Intervention {
  id: string;
  templateId: string;
  studentId: string;
  type: string;
  status: 'scheduled' | 'delivered' | 'failed' | 'successful' | 'cancelled';
  actions: InterventionAction[];
  deliveryMethods: string[];
  priority: string;
  expectedImpact: number;
  scheduledFor: string;
  createdAt: string;
  deliveredAt?: string;
  deliveryResult?: InterventionDeliveryResult;
  followUpRequired?: boolean;
  followUpCompleted?: boolean;
  deliveryRecorded?: boolean;
  deliveryTimestamp?: string;
  effectiveness?: InterventionEffectiveness;
  riskLevel?: string;
  impact?: number;
  personalisedMessage?: string;
  recommendedActions?: InterventionAction[];
  context?: Record<string, any>;
}

interface InterventionDeliveryResult {
  success: boolean;
  interventionId: string;
  deliveryMethod: string[];
  actionsExecuted: any[];
  followUpScheduled: boolean;
  errors?: string[];
}

interface InterventionOutcome {
  improved?: boolean;
  impact?: number;
  duration?: number;
  factors?: string[];
}

interface InterventionEffectiveness {
  success: boolean;
  impact: number;
  duration: number;
  factors: string[];
}

interface InterventionAnalytics {
  generatedAt: string;
  timeRange: number;
  summary: {
    totalInterventions: number;
    successfulInterventions: number;
    averageEffectiveness: number;
    interventionTypes: Record<string, number>;
    successRate?: number;
  };
  trends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
  effectiveness: {
    successRate: number;
    averageImpact: number;
    byType: Record<string, { total: number; successful: number }>;
    byRiskLevel: Record<string, { total: number; successful: number }>;
  };
  recommendations: any[];
}

interface OptimisationConfig {
  timeHorizon?: number;
  optimisationGoals?: string[];
}

interface OptimisationResult {
  generatedAt: string;
  currentPerformance: InterventionAnalytics;
  opportunities: any[];
  optimisedStrategies: any[];
  expectedImprovements: any;
  implementationPlan: any;
}

export class AutomatedInterventionService {
  private options: Required<InterventionOptions>;
  private interventions: Map<string, Intervention[]>;
  private interventionTemplates: Map<string, InterventionTemplate>;
  private effectivenessData: Map<string, any>;
  private activeInterventions: Map<string, Intervention>;

  constructor(options: InterventionOptions = {}) {
    this.options = {
      enableAutoTriggering: options.enableAutoTriggering ?? true,
      interventionCooldown: options.interventionCooldown || 7 * 24 * 60 * 60 * 1000, // 7 days
      maxInterventionsPerStudent: options.maxInterventionsPerStudent || 5,
      effectivenessTrackingPeriod: options.effectivenessTrackingPeriod || 30, // days
      escalationThreshold: options.escalationThreshold || 0.7
    };

    this.interventions = new Map();
    this.interventionTemplates = new Map();
    this.effectivenessData = new Map();
    this.activeInterventions = new Map();

    this._initialize();
  }

  private async _initialize(): Promise<void> {
    try {
      await this._loadInterventionTemplates();
      this._setupInterventionMonitoring();
      this._scheduleEffectivenessAnalysis();
      logger.info('Automated intervention service initialised');
    } catch (error) {
      logger.error('Error initialising automated intervention service:', error);
    }
  }

  async triggerIntervention(studentId: string, triggerData: InterventionTrigger): Promise<InterventionResult> {
    try {
      const {
        type,
        riskLevel,
        factors = [],
        context = {}
      } = triggerData;

      // Check intervention eligibility
      const eligibility = await this._checkInterventionEligibility(studentId);
      if (!eligibility.eligible) {
        return {
          triggered: false,
          reason: eligibility.reason,
          nextEligibleDate: eligibility.nextEligibleDate
        };
      }

      // Select appropriate intervention
      const intervention = await this._selectIntervention(studentId, type, riskLevel, factors, context);

      // Personalise intervention
      const personalisedIntervention = await this._personaliseIntervention(intervention, studentId, context);

      // Schedule intervention delivery
      const scheduledIntervention = await this._scheduleIntervention(personalisedIntervention, studentId);

      // Record intervention
      await this._recordIntervention(scheduledIntervention);

      return {
        triggered: true,
        interventionId: scheduledIntervention.id,
        type: scheduledIntervention.type,
        deliveryMethod: scheduledIntervention.deliveryMethods,
        scheduledFor: scheduledIntervention.scheduledFor,
        expectedImpact: scheduledIntervention.expectedImpact
      };
    } catch (error) {
      logger.error('Error triggering intervention:', error);
      throw error;
    }
  }

  async createInterventionTemplate(interventionConfig: Partial<InterventionTemplate>): Promise<string> {
    try {
      const {
        name,
        type,
        description,
        triggerConditions,
        actions,
        deliveryMethods,
        effectivenessMetrics,
        targetAudience,
        priority
      } = interventionConfig;

      if (!name || !type || !description || !triggerConditions || !actions || !deliveryMethods || !effectivenessMetrics || !targetAudience || !priority) {
        throw new Error('Missing required intervention template fields');
      }

      const templateId = `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const template: InterventionTemplate = {
        id: templateId,
        name,
        type,
        description,
        triggerConditions,
        actions,
        deliveryMethods,
        effectivenessMetrics,
        targetAudience,
        priority,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        effectiveness: {
          triggered: 0,
          successful: 0,
          averageImpact: 0
        }
      };

      this.interventionTemplates.set(templateId, template);

      logger.info(`Created intervention template: ${templateId}`);
      return templateId;
    } catch (error) {
      logger.error('Error creating intervention template:', error);
      throw error;
    }
  }

  async deliverIntervention(interventionId: string): Promise<InterventionDeliveryResult> {
    try {
      const intervention = this.activeInterventions.get(interventionId);
      if (!intervention) {
        throw new Error(`Intervention not found: ${interventionId}`);
      }

      // Execute intervention actions
      const deliveryResult = await this._executeInterventionActions(intervention);

      // Update intervention status
      intervention.status = deliveryResult.success ? 'delivered' : 'failed';
      intervention.deliveredAt = new Date().toISOString();
      intervention.deliveryResult = deliveryResult;

      // Schedule follow-up if needed
      if (deliveryResult.success && intervention.followUpRequired) {
        await this._scheduleFollowUp(intervention);
      }

      // Record delivery
      await this._recordInterventionDelivery(intervention, deliveryResult);

      return {
        success: deliveryResult.success,
        interventionId,
        deliveryMethod: intervention.deliveryMethods,
        actionsExecuted: deliveryResult.actionsExecuted,
        followUpScheduled: !!intervention.followUpRequired
      };
    } catch (error) {
      logger.error('Error delivering intervention:', error);
      throw error;
    }
  }

  async trackInterventionEffectiveness(interventionId: string, outcomeData: InterventionOutcome): Promise<any> {
    try {
      // Find intervention in student records
      let intervention: Intervention | undefined;
      for (const studentInterventions of this.interventions.values()) {
        intervention = studentInterventions.find(i => i.id === interventionId);
        if (intervention) break;
      }

      if (!intervention) {
        throw new Error(`Intervention not found: ${interventionId}`);
      }

      // Analyse intervention outcomes
      const effectiveness = this._analyseInterventionOutcomes(intervention, outcomeData);

      // Update effectiveness data
      await this._updateEffectivenessData(intervention, effectiveness);

      // Generate insights
      const insights = this._generateEffectivenessInsights(intervention, effectiveness);

      return {
        interventionId,
        effectiveness,
        insights,
        recommendations: this._generateEffectivenessRecommendations(effectiveness)
      };
    } catch (error) {
      logger.error('Error tracking intervention effectiveness:', error);
      throw error;
    }
  }

  async getInterventionAnalytics(filters: { timeRange?: number } = {}): Promise<InterventionAnalytics> {
    try {
      const {
        timeRange = 30 // days
      } = filters;

      const analytics: InterventionAnalytics = {
        generatedAt: new Date().toISOString(),
        timeRange,
        summary: {
          totalInterventions: 0,
          successfulInterventions: 0,
          averageEffectiveness: 0,
          interventionTypes: {}
        },
        trends: {
          daily: {},
          weekly: {},
          monthly: {}
        },
        effectiveness: {
          successRate: 0,
          averageImpact: 0,
          byType: {},
          byRiskLevel: {}
        },
        recommendations: []
      };

      // Calculate summary metrics
      const relevantInterventions = this._getRelevantInterventions(filters, timeRange);
      analytics.summary = this._calculateInterventionSummary(relevantInterventions);

      // Analyse trends
      analytics.trends = this._analyseInterventionTrends(relevantInterventions, timeRange);

      // Calculate effectiveness metrics
      analytics.effectiveness = this._calculateEffectivenessMetrics(relevantInterventions);

      // Generate recommendations
      analytics.recommendations = this._generateInterventionRecommendations(analytics);

      return analytics;
    } catch (error) {
      logger.error('Error getting intervention analytics:', error);
      throw error;
    }
  }

  async optimiseInterventionStrategies(optimisationConfig: OptimisationConfig = {}): Promise<OptimisationResult> {
    try {
      const {
        timeHorizon = 90, // days
        optimisationGoals = ['maximise_impact', 'minimise_cost']
      } = optimisationConfig;

      // Analyse current intervention performance
      const currentPerformance = await this.getInterventionAnalytics({ timeRange: timeHorizon });

      // Identify optimisation opportunities
      const opportunities = this._identifyOptimisationOpportunities(currentPerformance);

      // Generate optimised strategies
      const optimisedStrategies = this._generateOptimisedStrategies(opportunities, optimisationGoals);

      // Calculate expected improvements
      const expectedImprovements = this._calculateExpectedImprovements(optimisedStrategies, currentPerformance);

      const result: OptimisationResult = {
        generatedAt: new Date().toISOString(),
        currentPerformance,
        opportunities,
        optimisedStrategies,
        expectedImprovements,
        implementationPlan: this._createImplementationPlan(optimisedStrategies)
      };

      return result;
    } catch (error) {
      logger.error('Error optimising intervention strategies:', error);
      throw error;
    }
  }

  private async _loadInterventionTemplates(): Promise<void> {
    try {
      // Load default intervention templates
      const defaultTemplates: Partial<InterventionTemplate>[] = [
        {
          name: 'Engagement Reminder',
          type: 'engagement',
          description: 'Send personalised reminder to increase engagement',
          triggerConditions: { riskLevel: 'medium', factors: ['low_login_frequency'] },
          actions: [
            { type: 'email', template: 'engagement_reminder', priority: 'normal' },
            { type: 'notification', message: 'Don\'t forget to continue your learning journey!' }
          ],
          deliveryMethods: ['email', 'in_app'],
          effectivenessMetrics: ['login_increase', 'completion_rate'],
          targetAudience: 'all_students',
          priority: 'medium'
        },
        {
          name: 'Academic Support Intervention',
          type: 'academic_support',
          description: 'Provide targeted academic support',
          triggerConditions: { riskLevel: 'high', factors: ['low_performance', 'missed_deadlines'] },
          actions: [
            { type: 'tutoring', schedule: 'immediate' },
            { type: 'resources', materials: ['study_guides', 'practice_exercises'] },
            { type: 'mentoring', match: 'subject_expert' }
          ],
          deliveryMethods: ['email', 'phone', 'in_person'],
          effectivenessMetrics: ['grade_improvement', 'completion_rate', 'engagement_increase'],
          targetAudience: 'at_risk_students',
          priority: 'high'
        },
        {
          name: 'Motivational Intervention',
          type: 'motivation',
          description: 'Boost student motivation and confidence',
          triggerConditions: { riskLevel: 'medium', factors: ['low_motivation', 'progress_plateau'] },
          actions: [
            { type: 'message', content: 'personalised_encouragement' },
            { type: 'achievement', unlock: 'badges_and_rewards' },
            { type: 'community', connect: 'peer_group' }
          ],
          deliveryMethods: ['in_app', 'email'],
          effectivenessMetrics: ['engagement_increase', 'progress_acceleration'],
          targetAudience: 'all_students',
          priority: 'medium'
        }
      ];

      for (const template of defaultTemplates) {
        await this.createInterventionTemplate(template);
      }

      logger.info(`Loaded ${defaultTemplates.length} intervention templates`);
    } catch (error) {
      logger.error('Error loading intervention templates:', error);
    }
  }

  private _setupInterventionMonitoring(): void {
    // Monitor active interventions and their progress
    setInterval(() => {
      this._monitorActiveInterventions();
    }, 60 * 60 * 1000); // Every hour
  }

  private _scheduleEffectivenessAnalysis(): void {
    // Analyse intervention effectiveness periodically
    setInterval(async () => {
      try {
        await this._analyseInterventionEffectiveness();
      } catch (error) {
        logger.error('Scheduled effectiveness analysis failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private async _checkInterventionEligibility(studentId: string): Promise<InterventionEligibility> {
    const studentInterventions = this.interventions.get(studentId) || [];
    const recentInterventions = studentInterventions.filter(
      intervention => new Date(intervention.createdAt).getTime() > Date.now() - this.options.interventionCooldown
    );

    if (recentInterventions.length >= this.options.maxInterventionsPerStudent) {
      const lastIntervention = recentInterventions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        eligible: false,
        reason: 'intervention_cooldown',
        nextEligibleDate: new Date(new Date(lastIntervention.createdAt).getTime() + this.options.interventionCooldown).toISOString()
      };
    }

    return { eligible: true };
  }

  private async _selectIntervention(studentId: string, type: string, riskLevel: string, factors: string[], context: any): Promise<any> {
    // Find matching templates
    const matchingTemplates = Array.from(this.interventionTemplates.values())
      .filter(template => this._matchesInterventionCriteria(template, type, riskLevel, factors));

    if (matchingTemplates.length === 0) {
      throw new Error('No suitable intervention template found');
    }

    // Select best template based on effectiveness and student history
    const selectedTemplate = await this._selectBestTemplate(matchingTemplates, studentId, context);

    return {
      templateId: selectedTemplate.id,
      type: selectedTemplate.type,
      actions: selectedTemplate.actions,
      deliveryMethods: selectedTemplate.deliveryMethods,
      priority: selectedTemplate.priority,
      expectedImpact: this._calculateExpectedImpact(selectedTemplate, riskLevel)
    };
  }

  private async _personaliseIntervention(intervention: any, studentId: string, context: any): Promise<Intervention> {
    // This would personalise the intervention based on student data
    // For demonstration, return the intervention with basic personalisation
    return {
      ...intervention,
      personalisedMessage: `Hi! We've noticed you might need some support with your learning journey.`,
      recommendedActions: intervention.actions,
      studentId,
      context
    };
  }

  private async _scheduleIntervention(intervention: Intervention, studentId: string): Promise<Intervention> {
    const scheduledIntervention: Intervention = {
      ...intervention,
      id: `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      status: 'scheduled',
      scheduledFor: new Date().toISOString(), // Immediate delivery
      createdAt: new Date().toISOString()
    };

    this.activeInterventions.set(scheduledIntervention.id, scheduledIntervention);

    return scheduledIntervention;
  }

  private async _recordIntervention(intervention: Intervention): Promise<void> {
    const studentId = intervention.studentId;

    if (!this.interventions.has(studentId)) {
      this.interventions.set(studentId, []);
    }

    this.interventions.get(studentId)!.push(intervention);

    // Update template usage
    const template = this.interventionTemplates.get(intervention.templateId);
    if (template) {
      template.usageCount++;
    }
  }

  private async _executeInterventionActions(intervention: Intervention): Promise<any> {
    const results: any = {
      success: true,
      actionsExecuted: [],
      errors: []
    };

    for (const action of intervention.actions) {
      try {
        const actionResult = await this._executeAction(action, intervention);
        results.actionsExecuted.push(actionResult);

        if (!actionResult.success) {
          results.errors.push(actionResult.error);
          results.success = false;
        }
      } catch (error: any) {
        results.errors.push(error.message);
        results.success = false;
      }
    }

    return results;
  }

  private async _executeAction(action: InterventionAction, _intervention: Intervention): Promise<any> {
    // This would execute the actual action (send email, create notification, etc.)
    // For demonstration, simulate execution
    return {
      action: action.type,
      success: Math.random() > 0.1, // 90% success rate
      executedAt: new Date().toISOString(),
      details: `Executed ${action.type} action`
    };
  }

  private async _scheduleFollowUp(intervention: Intervention): Promise<void> {
    // Schedule follow-up intervention or check
    const followUp: any = {
      type: 'follow_up',
      studentId: intervention.studentId,
      parentInterventionId: intervention.id,
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
      actions: [{ type: 'check_progress', priority: 'low' }]
    };

    await this._scheduleIntervention(followUp, intervention.studentId);
  }

  private async _recordInterventionDelivery(intervention: Intervention, _deliveryResult: any): Promise<void> {
    // Update intervention record with delivery details
    intervention.deliveryRecorded = true;
    intervention.deliveryTimestamp = new Date().toISOString();
  }

  private _analyseInterventionOutcomes(_intervention: Intervention, outcomeData: InterventionOutcome): InterventionEffectiveness {
    // Calculate effectiveness based on outcome data
    const effectiveness: InterventionEffectiveness = {
      success: outcomeData.improved || false,
      impact: outcomeData.impact || 0,
      duration: outcomeData.duration || 0,
      factors: outcomeData.factors || []
    };

    return effectiveness;
  }

  private async _updateEffectivenessData(intervention: Intervention, effectiveness: InterventionEffectiveness): Promise<void> {
    const templateId = intervention.templateId;
    const template = this.interventionTemplates.get(templateId);

    if (template) {
      template.effectiveness.triggered++;
      if (effectiveness.success) {
        template.effectiveness.successful++;
      }
      template.effectiveness.averageImpact =
        (template.effectiveness.averageImpact + effectiveness.impact) / 2;
    }
  }

  private _generateEffectivenessInsights(_intervention: Intervention, effectiveness: InterventionEffectiveness): string[] {
    const insights: string[] = [];

    if (effectiveness.success) {
      insights.push('Intervention successfully improved student outcomes');
    }

    if (effectiveness.impact > 0.5) {
      insights.push('High impact intervention - consider scaling this approach');
    }

    if (effectiveness.duration < 7) {
      insights.push('Quick results - intervention type effective for immediate impact');
    }

    return insights;
  }

  private _generateEffectivenessRecommendations(effectiveness: InterventionEffectiveness): any[] {
    const recommendations: any[] = [];

    if (!effectiveness.success) {
      recommendations.push({
        type: 'intervention_optimisation',
        priority: 'medium',
        title: 'Review Intervention Strategy',
        description: 'Consider alternative approaches or timing for this intervention type'
      });
    }

    if (effectiveness.impact < 0.3) {
      recommendations.push({
        type: 'impact_improvement',
        priority: 'high',
        title: 'Enhance Intervention Impact',
        description: 'Modify intervention to increase effectiveness and student engagement'
      });
    }

    return recommendations;
  }

  private _getRelevantInterventions(_filters: any, timeRange: number): Intervention[] {
    const cutoffDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    const allInterventions: Intervention[] = [];

    for (const studentInterventions of this.interventions.values()) {
      allInterventions.push(...studentInterventions.filter(
        intervention => new Date(intervention.createdAt) > cutoffDate
      ));
    }

    return allInterventions;
  }

  private _calculateInterventionSummary(interventions: Intervention[]): any {
    const summary: any = {
      totalInterventions: interventions.length,
      successfulInterventions: interventions.filter(i => i.status === 'successful').length,
      averageEffectiveness: 0,
      interventionTypes: {}
    };

    // Calculate average effectiveness
    const effectivenessValues = interventions
      .filter(i => i.effectiveness)
      .map(i => i.effectiveness!.impact); // Assuming impact is the metric

    if (effectivenessValues.length > 0) {
      summary.averageEffectiveness = effectivenessValues.reduce((sum, val) => sum + val, 0) / effectivenessValues.length;
    }

    // Count intervention types
    interventions.forEach(intervention => {
      summary.interventionTypes[intervention.type] = (summary.interventionTypes[intervention.type] || 0) + 1;
    });

    return summary;
  }

  private _analyseInterventionTrends(interventions: Intervention[], _timeRange: number): any {
    // Group interventions by time periods
    const trends: any = {
      daily: {},
      weekly: {},
      monthly: {}
    };

    interventions.forEach(intervention => {
      const date = new Date(intervention.createdAt);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay() + 1) / 7)}`;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      trends.daily[dayKey] = (trends.daily[dayKey] || 0) + 1;
      trends.weekly[weekKey] = (trends.weekly[weekKey] || 0) + 1;
      trends.monthly[monthKey] = (trends.monthly[monthKey] || 0) + 1;
    });

    return trends;
  }

  private _calculateEffectivenessMetrics(interventions: Intervention[]): any {
    const metrics: any = {
      successRate: 0,
      averageImpact: 0,
      byType: {},
      byRiskLevel: {}
    };

    const successful = interventions.filter(i => i.status === 'successful');
    metrics.successRate = interventions.length > 0 ? successful.length / interventions.length : 0;

    const impacts = interventions.filter(i => i.impact).map(i => i.impact!);
    metrics.averageImpact = impacts.length > 0 ? impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length : 0;

    // Calculate by type and risk level
    interventions.forEach(intervention => {
      if (!metrics.byType[intervention.type]) {
        metrics.byType[intervention.type] = { total: 0, successful: 0 };
      }
      metrics.byType[intervention.type].total++;
      if (intervention.status === 'successful') {
        metrics.byType[intervention.type].successful++;
      }

      if (intervention.riskLevel) {
        if (!metrics.byRiskLevel[intervention.riskLevel]) {
          metrics.byRiskLevel[intervention.riskLevel] = { total: 0, successful: 0 };
        }
        metrics.byRiskLevel[intervention.riskLevel].total++;
        if (intervention.status === 'successful') {
          metrics.byRiskLevel[intervention.riskLevel].successful++;
        }
      }
    });

    return metrics;
  }

  private _generateInterventionRecommendations(analytics: InterventionAnalytics): any[] {
    const recommendations: any[] = [];

    if (analytics.summary.successRate !== undefined && analytics.summary.successRate < 0.7) {
      recommendations.push({
        type: 'success_rate_improvement',
        priority: 'high',
        title: 'Improve Intervention Success Rate',
        description: 'Current success rate is below target. Review and optimise intervention strategies.'
      });
    }

    const lowPerformingTypes = Object.entries(analytics.effectiveness.byType)
      .filter(([, data]) => data.total > 5 && (data.successful / data.total) < 0.6)
      .map(([type]) => type);

    if (lowPerformingTypes.length > 0) {
      recommendations.push({
        type: 'intervention_type_optimisation',
        priority: 'medium',
        title: 'Optimise Low-Performing Intervention Types',
        description: `Review and improve: ${lowPerformingTypes.join(', ')}`,
        affectedTypes: lowPerformingTypes
      });
    }

    return recommendations;
  }

  private async _monitorActiveInterventions(): Promise<void> {
    const now = new Date();

    for (const [interventionId, intervention] of this.activeInterventions) {
      // Check if intervention is overdue
      if (intervention.scheduledFor && new Date(intervention.scheduledFor) < now && intervention.status === 'scheduled') {
        logger.warn(`Intervention ${interventionId} is overdue`);
        // Could trigger escalation or retry logic here
      }

      // Check for interventions that need follow-up
      if (intervention.deliveredAt && intervention.status === 'delivered') {
        const daysSinceDelivery = (now.getTime() - new Date(intervention.deliveredAt).getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceDelivery > 7 && !intervention.followUpCompleted) {
          await this._scheduleFollowUp(intervention);
        }
      }
    }
  }

  private async _analyseInterventionEffectiveness(): Promise<void> {
    // Analyse overall intervention effectiveness
    const analytics = await this.getInterventionAnalytics({ timeRange: 30 });

    logger.info('Intervention effectiveness analysis:', {
      successRate: analytics.summary.successRate,
      totalInterventions: analytics.summary.totalInterventions,
      averageEffectiveness: analytics.summary.averageEffectiveness
    });
  }

  private _matchesInterventionCriteria(template: InterventionTemplate, type: string, riskLevel: string, factors: string[]): boolean {
    if (template.type !== type) return false;

    if (template.triggerConditions.riskLevel && template.triggerConditions.riskLevel !== riskLevel) {
      return false;
    }

    if (template.triggerConditions.factors) {
      const hasMatchingFactor = template.triggerConditions.factors.some(
        factor => factors.includes(factor)
      );
      if (!hasMatchingFactor) return false;
    }

    return true;
  }

  private async _selectBestTemplate(templates: InterventionTemplate[], _studentId: string, _context: any): Promise<InterventionTemplate> {
    // Select template with highest effectiveness and lowest recent usage for this student
    return templates.sort((a, b) => {
      const aEffectiveness = a.effectiveness.successful / Math.max(a.effectiveness.triggered, 1);
      const bEffectiveness = b.effectiveness.successful / Math.max(b.effectiveness.triggered, 1);

      if (aEffectiveness !== bEffectiveness) {
        return bEffectiveness - aEffectiveness; // Higher effectiveness first
      }

      return b.priority.localeCompare(a.priority); // Higher priority first
    })[0];
  }

  private _calculateExpectedImpact(template: InterventionTemplate, riskLevel: string): number {
    const baseImpact = template.effectiveness.averageImpact || 0.5;
    const riskMultiplier = riskLevel === 'high' ? 1.2 : riskLevel === 'medium' ? 1.0 : 0.8;

    return Math.min(1, baseImpact * riskMultiplier);
  }

  // Placeholder methods for missing implementations
  private _identifyOptimisationOpportunities(_performance: any): any[] {
    return [];
  }

  private _generateOptimisedStrategies(_opportunities: any[], _goals: string[]): any[] {
    return [];
  }

  private _calculateExpectedImprovements(_strategies: any[], _performance: any): any {
    return {};
  }

  private _createImplementationPlan(_strategies: any[]): any {
    return {};
  }

  async shutdown(): Promise<void> {
    logger.info('Automated intervention service shut down');
  }
}
