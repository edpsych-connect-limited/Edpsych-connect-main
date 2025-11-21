/**
 * AI Cost Management Service
 * Monitors and controls AI service costs with intelligent budgeting and rate limiting
 */
import logger from '../lib/logger';
import { aiAnalytics } from './ai-analytics';

export interface CostBudget {
  daily: number;
  monthly: number;
  perUserDaily: number;
  perUserMonthly: number;
}

export interface CostLimits {
  maxDailyCost: number;
  maxMonthlyCost: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxCostPerRequest: number;
}

export interface RateLimitTier {
  name: string;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxDailyCost: number;
  priority: number;
}

export interface CostAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class AICostManager {
  private static instance: AICostManager;

  // Default budgets (in USD)
  private defaultBudget: CostBudget = {
    daily: 50,
    monthly: 1500,
    perUserDaily: 5,
    perUserMonthly: 150
  };

  // Rate limiting tiers
  private rateLimitTiers: RateLimitTier[] = [
    {
      name: 'free',
      maxRequestsPerMinute: 5,
      maxRequestsPerHour: 50,
      maxDailyCost: 1,
      priority: 1
    },
    {
      name: 'standard',
      maxRequestsPerMinute: 20,
      maxRequestsPerHour: 200,
      maxDailyCost: 10,
      priority: 2
    },
    {
      name: 'professional',
      maxRequestsPerMinute: 50,
      maxRequestsPerHour: 500,
      maxDailyCost: 25,
      priority: 3
    },
    {
      name: 'enterprise',
      maxRequestsPerMinute: 100,
      maxRequestsPerHour: 1000,
      maxDailyCost: 50,
      priority: 4
    }
  ];

  private costAlerts: CostAlert[] = [];
  private userRequestCounts: Map<string, { count: number; resetTime: Date }> = new Map();
  private serviceCosts: Map<string, number> = new Map();

  private constructor() {
    // Initialize cleanup interval
    setInterval(() => this.cleanup(), 60000); // Clean up every minute
  }

  static getInstance(): AICostManager {
    if (!AICostManager.instance) {
      AICostManager.instance = new AICostManager();
    }
    return AICostManager.instance;
  }

  /**
   * Check if a request can proceed based on cost and rate limits
   */
  async canMakeRequest(
    id: string,
    service: string,
    estimatedCost: number = 0.001,
    subscriptionTier: string = 'standard'
  ): Promise<{
    allowed: boolean;
    reason?: string;
    waitTime?: number;
    estimatedTotalCost?: number;
  }> {
    try {
      // Get user's current usage
      const userUsage = this.getUserUsage(id);
      const tier = this.getTierLimits(subscriptionTier);

      // Check rate limits
      if (userUsage.requestsThisMinute >= tier.maxRequestsPerMinute) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded (requests per minute)',
          waitTime: 60 - (Date.now() - userUsage.minuteStart.getTime()) / 1000
        };
      }

      if (userUsage.requestsThisHour >= tier.maxRequestsPerHour) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded (requests per hour)',
          waitTime: 3600 - (Date.now() - userUsage.hourStart.getTime()) / 1000
        };
      }

      // Check cost limits
      const currentDailyCost = await this.getCurrentDailyCost(id);
      const currentMonthlyCost = await this.getCurrentMonthlyCost(id);

      if (currentDailyCost + estimatedCost > tier.maxDailyCost) {
        return {
          allowed: false,
          reason: 'Daily cost limit exceeded',
          estimatedTotalCost: currentDailyCost + estimatedCost
        };
      }

      if (currentMonthlyCost + estimatedCost > this.defaultBudget.monthly) {
        return {
          allowed: false,
          reason: 'Monthly cost limit exceeded',
          estimatedTotalCost: currentMonthlyCost + estimatedCost
        };
      }

      // Check per-user limits
      if (currentDailyCost + estimatedCost > this.defaultBudget.perUserDaily) {
        return {
          allowed: false,
          reason: 'Per-user daily limit exceeded',
          estimatedTotalCost: currentDailyCost + estimatedCost
        };
      }

      // Check global daily budget
      const globalDailyCost = await this.getGlobalDailyCost();
      if (globalDailyCost + estimatedCost > this.defaultBudget.daily) {
        return {
          allowed: false,
          reason: 'Global daily budget exceeded',
          estimatedTotalCost: globalDailyCost + estimatedCost
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error checking cost limits:', error as Error);
      // Allow request on error to avoid blocking legitimate usage
      return { allowed: true };
    }
  }

  /**
   * Record a completed AI request with its actual cost
   */
  async recordRequest(
    id: string,
    service: string,
    operation: string,
    actualCost: number,
    duration: number,
    success: boolean
  ): Promise<void> {
    try {
      // Update user request counts
      this.updateUserUsage(id);

      // Track cost by service
      const currentServiceCost = this.serviceCosts.get(service) || 0;
      this.serviceCosts.set(service, currentServiceCost + actualCost);

      // Create cost alert if needed
      await this.checkAndCreateAlerts(id, service, actualCost);

      // Track analytics event
      await aiAnalytics.trackEvent({
        service: service,
        operation: operation,
        duration: duration,
        success: success,
        cost: actualCost,
        id: id,
        metadata: {
          subscriptionTier: this.getUserTier(id),
          costCategory: this.categorizeCost(actualCost)
        }
      });

    } catch (error) {
      logger.error('Error recording AI request:', error as Error);
    }
  }

  /**
   * Get current cost metrics for a user
   */
  async getUserCostMetrics(id: string): Promise<{
    dailyCost: number;
    monthlyCost: number;
    requestsToday: number;
    requestsThisMonth: number;
    averageCostPerRequest: number;
    estimatedMonthlyTotal: number;
  }> {
    // This would typically query a database
    // For now, return mock data based on analytics
    const userEvents = aiAnalytics['events']?.filter(event =>
      event.id === id
    ) || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEvents = userEvents.filter(event => event.timestamp >= today);
    const monthEvents = userEvents.filter(event => event.timestamp >= thisMonth);

    const dailyCost = todayEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
    const monthlyCost = monthEvents.reduce((sum, event) => sum + (event.cost || 0), 0);

    return {
      dailyCost,
      monthlyCost,
      requestsToday: todayEvents.length,
      requestsThisMonth: monthEvents.length,
      averageCostPerRequest: monthEvents.length > 0 ? monthlyCost / monthEvents.length : 0,
      estimatedMonthlyTotal: monthlyCost + (dailyCost * (30 - today.getDate()))
    };
  }

  /**
   * Get global cost metrics
   */
  async getGlobalCostMetrics(): Promise<{
    totalDailyCost: number;
    totalMonthlyCost: number;
    totalRequestsToday: number;
    averageCostPerRequest: number;
    topUsersByCost: Array<{ id: string; cost: number }>;
    topServicesByCost: Array<{ service: string; cost: number }>;
  }> {
    const costMetrics = aiAnalytics.getCostMetrics('day');
    const performanceMetrics = aiAnalytics.getPerformanceMetrics('day');

    // Get top users by cost
    const userCosts: Record<string, number> = {};
    aiAnalytics['events']?.forEach(event => {
      if (event.id && event.cost) {
        userCosts[event.id] = (userCosts[event.id] || 0) + event.cost;
      }
    });

    const topUsersByCost = Object.entries(userCosts)
      .map(([id, cost]) => ({ id, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // Get top services by cost
    const topServicesByCost = Object.entries(costMetrics.costByService)
      .map(([service, cost]) => ({ service, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    return {
      totalDailyCost: costMetrics.dailyCost,
      totalMonthlyCost: costMetrics.monthlyCost,
      totalRequestsToday: performanceMetrics.totalRequests,
      averageCostPerRequest: costMetrics.averageCostPerRequest,
      topUsersByCost,
      topServicesByCost
    };
  }

  /**
   * Get cost alerts for monitoring
   */
  getCostAlerts(): CostAlert[] {
    return this.costAlerts.slice(-50); // Return last 50 alerts
  }

  /**
   * Set budget limits
   */
  setBudget(budget: Partial<CostBudget>): void {
    this.defaultBudget = { ...this.defaultBudget, ...budget };
  }

  /**
   * Get current budget
   */
  getBudget(): CostBudget {
    return { ...this.defaultBudget };
  }

  /**
   * Get rate limiting tiers
   */
  getRateLimitTiers(): RateLimitTier[] {
    return [...this.rateLimitTiers];
  }

  // Private helper methods

  private getUserUsage(id: string): {
    requestsThisMinute: number;
    requestsThisHour: number;
    minuteStart: Date;
    hourStart: Date;
  } {
    const now = new Date();
    const minuteStart = new Date(now.getTime() - (now.getTime() % (60 * 1000)));
    const hourStart = new Date(now.getTime() - (now.getTime() % (60 * 60 * 1000)));

    const userData = this.userRequestCounts.get(id) || {
      count: 0,
      resetTime: minuteStart
    };

    // Reset if new minute
    if (userData.resetTime < minuteStart) {
      userData.count = 0;
      userData.resetTime = minuteStart;
    }

    return {
      requestsThisMinute: userData.count,
      requestsThisHour: userData.count, // Simplified for this implementation
      minuteStart,
      hourStart
    };
  }

  private updateUserUsage(id: string): void {
    const userData = this.userRequestCounts.get(id) || {
      count: 0,
      resetTime: new Date()
    };

    userData.count++;
    this.userRequestCounts.set(id, userData);
  }

  private getTierLimits(tierName: string): RateLimitTier {
    return this.rateLimitTiers.find(tier => tier.name === tierName) || this.rateLimitTiers[0];
  }

  private getUserTier(_id: string): string {
    // This would typically query user subscription data
    // For now, return default tier
    return 'standard';
  }

  private async getCurrentDailyCost(id: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userEvents = aiAnalytics['events']?.filter(event =>
      event.id === id && event.timestamp >= today
    ) || [];

    return userEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
  }

  private async getCurrentMonthlyCost(id: string): Promise<number> {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const userEvents = aiAnalytics['events']?.filter(event =>
      event.id === id && event.timestamp >= thisMonth
    ) || [];

    return userEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
  }

  private async getGlobalDailyCost(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allEvents = aiAnalytics['events']?.filter(event =>
      event.timestamp >= today
    ) || [];

    return allEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
  }

  private categorizeCost(cost: number): string {
    if (cost < 0.001) return 'very_low';
    if (cost < 0.01) return 'low';
    if (cost < 0.1) return 'medium';
    if (cost < 1) return 'high';
    return 'very_high';
  }

  private async checkAndCreateAlerts(id: string, service: string, cost: number): Promise<void> {
    const userMetrics = await this.getUserCostMetrics(id);
    const globalMetrics = await this.getGlobalCostMetrics();

    // Check for high cost per request
    if (cost > 0.1) {
      this.costAlerts.push({
        id: `high_cost_${Date.now()}`,
        type: 'warning',
        message: `High cost request: $${cost.toFixed(4)} for ${service}`,
        timestamp: new Date(),
        metadata: { id, service, cost }
      });
    }

    // Check for user approaching daily limit
    if (userMetrics.dailyCost > this.defaultBudget.perUserDaily * 0.8) {
      this.costAlerts.push({
        id: `user_daily_limit_${id}_${Date.now()}`,
        type: 'warning',
        message: `User ${id} approaching daily limit: $${userMetrics.dailyCost.toFixed(2)}/${this.defaultBudget.perUserDaily}`,
        timestamp: new Date(),
        metadata: { id, dailyCost: userMetrics.dailyCost }
      });
    }

    // Check for global daily budget
    if (globalMetrics.totalDailyCost > this.defaultBudget.daily * 0.9) {
      this.costAlerts.push({
        id: `global_budget_warning_${Date.now()}`,
        type: 'error',
        message: `Global daily budget nearly exhausted: $${globalMetrics.totalDailyCost.toFixed(2)}/${this.defaultBudget.daily}`,
        timestamp: new Date(),
        metadata: { globalDailyCost: globalMetrics.totalDailyCost }
      });
    }
  }

  private cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Clean up old alerts
    this.costAlerts = this.costAlerts.filter(alert => alert.timestamp >= oneHourAgo);

    // Clean up old user request counts
    for (const [id, data] of this.userRequestCounts.entries()) {
      if (data.resetTime < oneHourAgo) {
        this.userRequestCounts.delete(id);
      }
    }
  }
}

// Export singleton instance
export const aiCostManager = AICostManager.getInstance();