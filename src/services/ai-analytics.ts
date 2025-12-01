import { logger } from "@/lib/logger";
/**
 * AI Analytics Service - Comprehensive monitoring and analytics for AI services
 * Tracks performance, costs, usage patterns, and provides intelligent caching
 */

export interface AIAnalyticsEvent {
  timestamp: Date;
  service: string;
  operation: string;
  duration: number;
  tokensUsed?: number;
  cost?: number;
  success: boolean;
  error?: string;
  id?: string;
  metadata?: Record<string, any>;
}

export interface AICostMetrics {
  totalCost: number;
  dailyCost: number;
  monthlyCost: number;
  costByService: Record<string, number>;
  costByOperation: Record<string, number>;
  averageCostPerRequest: number;
}

export interface AIPerformanceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  performanceByService: Record<string, {
    averageResponseTime: number;
    successRate: number;
    requestCount: number;
  }>;
  peakUsageHours: Array<{
    hour: number;
    requestCount: number;
  }>;
}

export interface AgentUsageMetrics {
  agentId: string;
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  cost: number;
  lastUsed: Date;
  usageByHour: Record<number, number>;
}

export class AIAnalyticsService {
  private static instance: AIAnalyticsService;
  private events: AIAnalyticsEvent[] = [];
  private maxEvents: number = 10000; // Keep last 10k events in memory
  private cache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();

  private constructor() {
    // Initialize with cleanup interval
    setInterval(() => this.cleanup(), 60000); // Clean up every minute
  }

  static getInstance(): AIAnalyticsService {
    if (!AIAnalyticsService.instance) {
      AIAnalyticsService.instance = new AIAnalyticsService();
    }
    return AIAnalyticsService.instance;
  }

  /**
   * Track an AI service event
   */
  async trackEvent(event: Omit<AIAnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const fullEvent: AIAnalyticsEvent = {
        ...event,
        timestamp: new Date()
      };

      this.events.push(fullEvent);

      // Keep only recent events in memory
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
      }

      // Log significant events
      if (event.duration > 10000) { // Log slow requests (>10s)
        logger.warn(`Slow AI request: ${event.service}.${event.operation} took ${event.duration}ms`);
      }

      if (!event.success && event.error) {
        logger.error(`AI service error: ${event.service}.${event.operation}`, {
          error: event.error,
          duration: event.duration
        });
      }

      // In production, you would also send to external monitoring service
      // await this.sendToMonitoringService(fullEvent);

    } catch (_error) {
      logger.error('Error tracking AI analytics event:', _error as Error);
    }
  }

  /**
   * Get comprehensive cost metrics
   */
  getCostMetrics(timeframe: 'day' | 'week' | 'month' = 'month'): AICostMetrics {
    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    const relevantEvents = this.events.filter(event =>
      event.timestamp >= cutoff && event.cost !== undefined
    );

    const totalCost = relevantEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
    const costByService: Record<string, number> = {};
    const costByOperation: Record<string, number> = {};

    relevantEvents.forEach(event => {
      if (event.service) {
        costByService[event.service] = (costByService[event.service] || 0) + (event.cost || 0);
      }
      if (event.operation) {
        costByOperation[event.operation] = (costByOperation[event.operation] || 0) + (event.cost || 0);
      }
    });

    return {
      totalCost,
      dailyCost: timeframe === 'day' ? totalCost : totalCost / 30,
      monthlyCost: totalCost,
      costByService,
      costByOperation,
      averageCostPerRequest: relevantEvents.length > 0 ? totalCost / relevantEvents.length : 0
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeframe: 'day' | 'week' | 'month' = 'day'): AIPerformanceMetrics {
    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    const relevantEvents = this.events.filter(event => event.timestamp >= cutoff);
    const successfulEvents = relevantEvents.filter(event => event.success);
    const failedEvents = relevantEvents.filter(event => !event.success);

    const totalDuration = successfulEvents.reduce((sum, event) => sum + event.duration, 0);
    const averageResponseTime = successfulEvents.length > 0 ? totalDuration / successfulEvents.length : 0;

    const performanceByService: Record<string, any> = {};
    const serviceGroups: Record<string, AIAnalyticsEvent[]> = {};

    relevantEvents.forEach(event => {
      if (!serviceGroups[event.service]) {
        serviceGroups[event.service] = [];
      }
      serviceGroups[event.service].push(event);
    });

    Object.entries(serviceGroups).forEach(([service, events]) => {
      const successful = events.filter(e => e.success);
      const totalDuration = successful.reduce((sum, e) => sum + e.duration, 0);

      performanceByService[service] = {
        averageResponseTime: successful.length > 0 ? totalDuration / successful.length : 0,
        successRate: events.length > 0 ? (successful.length / events.length) * 100 : 0,
        requestCount: events.length
      };
    });

    // Calculate peak usage hours
    const hourlyUsage: Record<number, number> = {};
    relevantEvents.forEach(event => {
      const hour = event.timestamp.getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });

    const peakUsageHours = Object.entries(hourlyUsage)
      .map(([hour, count]) => ({ hour: parseInt(hour), requestCount: count }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 5);

    return {
      totalRequests: relevantEvents.length,
      averageResponseTime,
      successRate: relevantEvents.length > 0 ? (successfulEvents.length / relevantEvents.length) * 100 : 0,
      errorRate: relevantEvents.length > 0 ? (failedEvents.length / relevantEvents.length) * 100 : 0,
      performanceByService,
      peakUsageHours
    };
  }

  /**
   * Get agent usage metrics for the 24 autonomous agents
   */
  getAgentUsageMetrics(timeframe: 'day' | 'week' | 'month' = 'day'): AgentUsageMetrics[] {
    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    const relevantEvents = this.events.filter(event =>
      event.timestamp >= cutoff && event.service?.startsWith('agent_')
    );

    const agentGroups: Record<string, AIAnalyticsEvent[]> = {};

    relevantEvents.forEach(event => {
      const agentId = event.service.replace('agent_', '');
      if (!agentGroups[agentId]) {
        agentGroups[agentId] = [];
      }
      agentGroups[agentId].push(event);
    });

    return Object.entries(agentGroups).map(([agentId, events]) => {
      const successful = events.filter(e => e.success);
      const totalDuration = successful.reduce((sum, e) => sum + e.duration, 0);
      const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0);

      const usageByHour: Record<number, number> = {};
      events.forEach(event => {
        const hour = event.timestamp.getHours();
        usageByHour[hour] = (usageByHour[hour] || 0) + 1;
      });

      return {
        agentId,
        totalRequests: events.length,
        averageResponseTime: successful.length > 0 ? totalDuration / successful.length : 0,
        successRate: events.length > 0 ? (successful.length / events.length) * 100 : 0,
        cost: totalCost,
        lastUsed: events.length > 0 ? events[events.length - 1].timestamp : new Date(),
        usageByHour
      };
    }).sort((a, b) => b.totalRequests - a.totalRequests);
  }

  /**
   * Intelligent caching system
   */
  async getCachedData(key: string, ttlMinutes: number = 30): Promise<any | null> {
    const cached = this.cache.get(key);

    if (cached && (Date.now() - cached.timestamp.getTime()) < (ttlMinutes * 60 * 1000)) {
      return cached.data;
    }

    return null;
  }

  async setCachedData(key: string, data: any, ttlMinutes: number = 30): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    hitRate: number;
    totalSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.entries());
    // const now = Date.now();

    return {
      totalEntries: entries.length,
      hitRate: 0, // Would need to track hits/misses for this
      totalSize: entries.length, // Simplified size calculation
      oldestEntry: entries.length > 0 ? entries[0][1].timestamp : null,
      newestEntry: entries.length > 0 ? entries[entries.length - 1][1].timestamp : null
    };
  }

  /**
   * Clean up old events and expired cache entries
   */
  private cleanup(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    this.events = this.events.filter(event => event.timestamp >= cutoff);

    // Clean up expired cache entries
    for (const [key, cached] of this.cache.entries()) {
      if ((Date.now() - cached.timestamp.getTime()) >= cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData(): {
    currentMetrics: AIPerformanceMetrics;
    costMetrics: AICostMetrics;
    agentMetrics: AgentUsageMetrics[];
    cacheStats: {
      totalEntries: number;
      hitRate: number;
      totalSize: number;
      oldestEntry: Date | null;
      newestEntry: Date | null;
    };
    recentErrors: AIAnalyticsEvent[];
  } {
    return {
      currentMetrics: this.getPerformanceMetrics('day'),
      costMetrics: this.getCostMetrics('day'),
      agentMetrics: this.getAgentUsageMetrics('day'),
      cacheStats: this.getCacheStats(),
      recentErrors: this.events
        .filter(event => !event.success)
        .slice(-10)
        .reverse()
    };
  }

  /**
   * Export analytics data for reporting
   */
  exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'service', 'operation', 'duration', 'success', 'cost', 'error'];
      const rows = this.events.map(event => [
        event.timestamp.toISOString(),
        event.service,
        event.operation,
        event.duration.toString(),
        event.success.toString(),
        (event.cost || 0).toString(),
        event.error || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.events, null, 2);
  }
}

// Export singleton instance
export const aiAnalytics = AIAnalyticsService.getInstance();
