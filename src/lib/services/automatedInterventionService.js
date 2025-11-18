/**
 * Automated Intervention Service
 *
 * This service provides comprehensive automated intervention capabilities:
 * - Intelligent intervention triggering based on predictive analytics
 * - Personalised intervention strategies
 * - Intervention effectiveness tracking
 * - Automated follow-up and escalation
 * - Multi-channel intervention delivery
 * - Intervention analytics and optimisation
 */

class AutomatedInterventionService {
  constructor(options = {}) {
    this.options = {
      enableAutoTriggering: options.enableAutoTriggering || true,
      interventionCooldown: options.interventionCooldown || 7 * 24 * 60 * 60 * 1000, // 7 days
      maxInterventionsPerStudent: options.maxInterventionsPerStudent || 5,
      effectivenessTrackingPeriod: options.effectivenessTrackingPeriod || 30, // days
      escalationThreshold: options.escalationThreshold || 0.7,
      ...options
    };

    this.interventions = new Map();
    this.interventionTemplates = new Map();
    this.effectivenessData = new Map();
    this.activeInterventions = new Map();

    this._initialize();
  }

  /**
   * Initialise the automated intervention service
   */
  async _initialize() {
    try {
      // Load intervention templates
      await this._loadInterventionTemplates();

      // Set up intervention monitoring
      this._setupInterventionMonitoring();

      // Schedule effectiveness analysis
      this._scheduleEffectivenessAnalysis();

      logger.info('Automated intervention service initialised');
    } catch (error) {
      logger.error('Error initialising automated intervention service:', error);
    }
  }

  /**
   * Trigger intervention for student
   *
   * @param {string} studentId - Student identifier
   * @param {Object} triggerData - Intervention trigger data
   * @returns {Promise<Object>} Intervention result
   */
  async triggerIntervention(studentId, triggerData) {
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
        deliveryMethod: scheduledIntervention.deliveryMethod,
        scheduledFor: scheduledIntervention.scheduledFor,
        expectedImpact: scheduledIntervention.expectedImpact
      };
    } catch (error) {
      logger.error('Error triggering intervention:', error);
      throw error;
    }
  }

  /**
   * Create custom intervention
   *
   * @param {Object} interventionConfig - Intervention configuration
   * @returns {Promise<string>} Intervention template ID
   */
  async createInterventionTemplate(interventionConfig) {
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

      const templateId = `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const template = {
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

  /**
   * Deliver intervention
   *
   * @param {string} interventionId - Intervention identifier
   * @returns {Promise<Object>} Delivery result
   */
  async deliverIntervention(interventionId) {
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
        deliveryMethod: intervention.deliveryMethod,
        actionsExecuted: deliveryResult.actionsExecuted,
        followUpScheduled: intervention.followUpRequired
      };
    } catch (error) {
      logger.error('Error delivering intervention:', error);
      throw error;
    }
  }

  /**
   * Track intervention effectiveness
   *
   * @param {string} interventionId - Intervention identifier
   * @param {Object} outcomeData - Outcome data
   * @returns {Promise<Object>} Effectiveness analysis
   */
  async trackInterventionEffectiveness(interventionId, outcomeData) {
    try {
      const intervention = this.interventions.get(interventionId);
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

  /**
   * Get intervention analytics
   *
   * @param {Object} filters - Analytics filters
   * @returns {Promise<Object>} Intervention analytics
   */
  async getInterventionAnalytics(filters = {}) {
    try {
      const {
        timeRange = 30 // days
      } = filters;

      const analytics = {
        generatedAt: new Date().toISOString(),
        timeRange,
        summary: {
          totalInterventions: 0,
          successfulInterventions: 0,
          averageEffectiveness: 0,
          interventionTypes: {}
        },
        trends: {},
        effectiveness: {},
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

  /**
   * Optimise intervention strategies
   *
   * @param {Object} optimisationConfig - Optimisation configuration
   * @returns {Promise<Object>} Optimisation results
   */
  async optimiseInterventionStrategies(optimisationConfig = {}) {
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

      const result = {
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

  /**
   * Load intervention templates
   *
   * @private
   */
  async _loadInterventionTemplates() {
    try {
      // Load default intervention templates
      const defaultTemplates = [
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

  /**
   * Set up intervention monitoring
   *
   * @private
   */
  _setupInterventionMonitoring() {
    // Monitor active interventions and their progress
    setInterval(() => {
      this._monitorActiveInterventions();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Schedule effectiveness analysis
   *
   * @private
   */
  _scheduleEffectivenessAnalysis() {
    // Analyse intervention effectiveness periodically
    setInterval(async () => {
      try {
        await this._analyseInterventionEffectiveness();
      } catch (error) {
        logger.error('Scheduled effectiveness analysis failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Check intervention eligibility
   *
   * @private
   * @param {string} studentId - Student identifier
   * @returns {Promise<Object>} Eligibility result
   */
  async _checkInterventionEligibility(studentId) {
    const studentInterventions = this.interventions.get(studentId) || [];
    const recentInterventions = studentInterventions.filter(
      intervention => new Date(intervention.createdAt) > new Date(Date.now() - this.options.interventionCooldown)
    );

    if (recentInterventions.length >= this.options.maxInterventionsPerStudent) {
      const lastIntervention = recentInterventions.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      return {
        eligible: false,
        reason: 'intervention_cooldown',
        nextEligibleDate: new Date(new Date(lastIntervention.createdAt).getTime() + this.options.interventionCooldown).toISOString()
      };
    }

    return { eligible: true };
  }

  /**
   * Select appropriate intervention
   *
   * @private
   * @param {string} studentId - Student identifier
   * @param {string} type - Intervention type
   * @param {string} riskLevel - Risk level
   * @param {Array} factors - Risk factors
   * @param {Object} context - Context data
   * @returns {Promise<Object>} Selected intervention
   */
  async _selectIntervention(studentId, type, riskLevel, factors, context) {
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

  /**
   * Personalise intervention
   *
   * @private
   * @param {Object} intervention - Base intervention
   * @param {string} studentId - Student identifier
   * @param {Object} context - Context data
   * @returns {Promise<Object>} Personalised intervention
   */
  async _personaliseIntervention(intervention, studentId, context) {
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

  /**
   * Schedule intervention delivery
   *
   * @private
   * @param {Object} intervention - Intervention to schedule
   * @param {string} studentId - Student identifier
   * @returns {Promise<Object>} Scheduled intervention
   */
  async _scheduleIntervention(intervention, studentId) {
    const scheduledIntervention = {
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

  /**
   * Record intervention
   *
   * @private
   * @param {Object} intervention - Intervention to record
   */
  async _recordIntervention(intervention) {
    const studentId = intervention.studentId;

    if (!this.interventions.has(studentId)) {
      this.interventions.set(studentId, []);
    }

    this.interventions.get(studentId).push(intervention);

    // Update template usage
    const template = this.interventionTemplates.get(intervention.templateId);
    if (template) {
      template.usageCount++;
    }
  }

  /**
   * Execute intervention actions
   *
   * @private
   * @param {Object} intervention - Intervention to execute
   * @returns {Promise<Object>} Execution result
   */
  async _executeInterventionActions(intervention) {
    const results = {
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
      } catch (error) {
        results.errors.push(error.message);
        results.success = false;
      }
    }

    return results;
  }

  /**
   * Execute individual action
   *
   * @private
   * @param {Object} action - Action to execute
   * @param {Object} intervention - Parent intervention
   * @returns {Promise<Object>} Action result
   */
  async _executeAction(action, _intervention) {
    // This would execute the actual action (send email, create notification, etc.)
    // For demonstration, simulate execution
    return {
      action: action.type,
      success: Math.random() > 0.1, // 90% success rate
      executedAt: new Date().toISOString(),
      details: `Executed ${action.type} action`
    };
  }

  /**
   * Schedule follow-up
   *
   * @private
   * @param {Object} intervention - Intervention requiring follow-up
   */
  async _scheduleFollowUp(intervention) {
    // Schedule follow-up intervention or check
    const followUp = {
      type: 'follow_up',
      studentId: intervention.studentId,
      parentInterventionId: intervention.id,
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
      actions: [{ type: 'check_progress', priority: 'low' }]
    };

    await this._scheduleIntervention(followUp, intervention.studentId);
  }

  /**
   * Record intervention delivery
   *
   * @private
   * @param {Object} intervention - Delivered intervention
   * @param {Object} deliveryResult - Delivery result
   */
  async _recordInterventionDelivery(intervention, _deliveryResult) {
    // Update intervention record with delivery details
    intervention.deliveryRecorded = true;
    intervention.deliveryTimestamp = new Date().toISOString();
  }

  /**
   * Analyse intervention outcomes
   *
   * @private
   * @param {Object} intervention - Intervention data
   * @param {Object} outcomeData - Outcome data
   * @returns {Object} Effectiveness analysis
   */
  _analyseInterventionOutcomes(intervention, outcomeData) {
    // Calculate effectiveness based on outcome data
    const effectiveness = {
      success: outcomeData.improved || false,
      impact: outcomeData.impact || 0,
      duration: outcomeData.duration || 0,
      factors: outcomeData.factors || []
    };

    return effectiveness;
  }

  /**
   * Update effectiveness data
   *
   * @private
   * @param {Object} intervention - Intervention data
   * @param {Object} effectiveness - Effectiveness data
   */
  async _updateEffectivenessData(intervention, effectiveness) {
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

  /**
   * Generate effectiveness insights
   *
   * @private
   * @param {Object} intervention - Intervention data
   * @param {Object} effectiveness - Effectiveness data
   * @returns {Array} Effectiveness insights
   */
  _generateEffectivenessInsights(intervention, effectiveness) {
    const insights = [];

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

  /**
   * Generate effectiveness recommendations
   *
   * @private
   * @param {Object} effectiveness - Effectiveness data
   * @returns {Array} Recommendations
   */
  _generateEffectivenessRecommendations(effectiveness) {
    const recommendations = [];

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

  /**
   * Get relevant interventions
   *
   * @private
   * @param {Object} filters - Filter criteria
   * @param {number} timeRange - Time range in days
   * @returns {Array} Relevant interventions
   */
  _getRelevantInterventions(filters, timeRange) {
    const cutoffDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    const allInterventions = [];

    for (const studentInterventions of this.interventions.values()) {
      allInterventions.push(...studentInterventions.filter(
        intervention => new Date(intervention.createdAt) > cutoffDate
      ));
    }

    return allInterventions;
  }

  /**
   * Calculate intervention summary
   *
   * @private
   * @param {Array} interventions - Intervention data
   * @returns {Object} Intervention summary
   */
  _calculateInterventionSummary(interventions) {
    const summary = {
      totalInterventions: interventions.length,
      successfulInterventions: interventions.filter(i => i.status === 'successful').length,
      averageEffectiveness: 0,
      interventionTypes: {}
    };

    // Calculate average effectiveness
    const effectivenessValues = interventions
      .filter(i => i.effectiveness)
      .map(i => i.effectiveness);

    if (effectivenessValues.length > 0) {
      summary.averageEffectiveness = effectivenessValues.reduce((sum, val) => sum + val, 0) / effectivenessValues.length;
    }

    // Count intervention types
    interventions.forEach(intervention => {
      summary.interventionTypes[intervention.type] = (summary.interventionTypes[intervention.type] || 0) + 1;
    });

    return summary;
  }

  /**
   * Analyse intervention trends
   *
   * @private
   * @param {Array} interventions - Intervention data
   * @param {number} timeRange - Time range in days
   * @returns {Object} Intervention trends
   */
  _analyseInterventionTrends(interventions, _timeRange) {
    // Group interventions by time periods
    const trends = {
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

  /**
   * Calculate effectiveness metrics
   *
   * @private
   * @param {Array} interventions - Intervention data
   * @returns {Object} Effectiveness metrics
   */
  _calculateEffectivenessMetrics(interventions) {
    const metrics = {
      successRate: 0,
      averageImpact: 0,
      byType: {},
      byRiskLevel: {}
    };

    const successful = interventions.filter(i => i.status === 'successful');
    metrics.successRate = interventions.length > 0 ? successful.length / interventions.length : 0;

    const impacts = interventions.filter(i => i.impact).map(i => i.impact);
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

  /**
   * Generate intervention recommendations
   *
   * @private
   * @param {Object} analytics - Intervention analytics
   * @returns {Array} Recommendations
   */
  _generateInterventionRecommendations(analytics) {
    const recommendations = [];

    if (analytics.summary.successRate < 0.7) {
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

  /**
   * Monitor active interventions
   *
   * @private
   */
  async _monitorActiveInterventions() {
    const now = new Date();

    for (const [interventionId, intervention] of this.activeInterventions) {
      // Check if intervention is overdue
      if (intervention.scheduledFor && new Date(intervention.scheduledFor) < now && intervention.status === 'scheduled') {
        logger.warn(`Intervention ${interventionId} is overdue`);
        // Could trigger escalation or retry logic here
      }

      // Check for interventions that need follow-up
      if (intervention.deliveredAt && intervention.status === 'delivered') {
        const daysSinceDelivery = (now - new Date(intervention.deliveredAt)) / (24 * 60 * 60 * 1000);
        if (daysSinceDelivery > 7 && !intervention.followUpCompleted) {
          await this._scheduleFollowUp(intervention);
        }
      }
    }
  }

  /**
   * Analyse intervention effectiveness
   *
   * @private
   */
  async _analyseInterventionEffectiveness() {
    // Analyse overall intervention effectiveness
    const analytics = await this.getInterventionAnalytics({ timeRange: 30 });

    logger.info('Intervention effectiveness analysis:', {
      successRate: analytics.summary.successRate,
      totalInterventions: analytics.summary.totalInterventions,
      averageEffectiveness: analytics.summary.averageEffectiveness
    });
  }

  /**
   * Matches intervention criteria
   *
   * @private
   * @param {Object} template - Intervention template
   * @param {string} type - Intervention type
   * @param {string} riskLevel - Risk level
   * @param {Array} factors - Risk factors
   * @returns {boolean} Whether template matches
   */
  _matchesInterventionCriteria(template, type, riskLevel, factors) {
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

  /**
   * Select best template
   *
   * @private
   * @param {Array} templates - Matching templates
   * @param {string} studentId - Student identifier
   * @param {Object} context - Context data
   * @returns {Object} Best template
   */
  async _selectBestTemplate(templates, _studentId, _context) {
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

  /**
   * Calculate expected impact
   *
   * @private
   * @param {Object} template - Intervention template
   * @param {string} riskLevel - Risk level
   * @returns {number} Expected impact
   */
  _calculateExpectedImpact(template, riskLevel) {
    const baseImpact = template.effectiveness.averageImpact || 0.5;
    const riskMultiplier = riskLevel === 'high' ? 1.2 : riskLevel === 'medium' ? 1.0 : 0.8;

    return Math.min(1, baseImpact * riskMultiplier);
  }

  /**
   * Shutdown the automated intervention service
   */
  async shutdown() {
    logger.info('Automated intervention service shut down');
  }
}

module.exports = AutomatedInterventionService;