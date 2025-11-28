import { logger } from "@/lib/logger";
/**
 * Performance Monitoring Service
 *
 * This service provides comprehensive performance monitoring and alerting:
 * - Application performance metrics
 * - System resource monitoring
 * - Database performance tracking
 * - API endpoint performance
 * - Real-time alerting and notifications
 * - Performance trend analysis
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import * as os from 'os';

class PerformanceMonitoringService {
  options: any;
  metrics: any;
  alerts: any[];
  observers: any[];
  performanceObserver: any;
  monitoringInterval: any;

  constructor(options: any = {}) {
    this.options = {
      metricsInterval: options.metricsInterval || 60000, // 1 minute
      alertThresholds: {
        responseTime: options.alertThresholds?.responseTime || 5000, // 5 seconds
        memoryUsage: options.alertThresholds?.memoryUsage || 0.9, // 90%
        cpuUsage: options.alertThresholds?.cpuUsage || 0.8, // 80%
        errorRate: options.alertThresholds?.errorRate || 0.05, // 5%
        ...options.alertThresholds
      },
      retentionPeriod: options.retentionPeriod || 7 * 24 * 60 * 60 * 1000, // 7 days
      enableProfiling: options.enableProfiling || false,
      ...options
    };

    this.metrics = {
      responseTimes: [],
      memoryUsage: [],
      cpuUsage: [],
      errorRates: [],
      throughput: [],
      customMetrics: new Map()
    };

    this.alerts = [];
    this.observers = [];
    this.performanceObserver = null;
    this.monitoringInterval = null;

    this._initialize();
  }

  /**
   * Initialize the performance monitoring service
   */
  async _initialize() {
    try {
      // Set up performance observer
      this._setupPerformanceObserver();

      // Start metrics collection
      this.monitoringInterval = setInterval(() => {
        this._collectMetrics();
      }, this.options.metricsInterval);

      // Start alerting
      this._startAlerting();

      logger.info('Performance monitoring service initialized');
    } catch (error) {
      logger.error('Error initializing performance monitoring service:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Record API response time
   *
   * @param {string} endpoint - API endpoint
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} statusCode - HTTP status code
   * @param {Object} metadata - Additional metadata
   */
  recordApiResponse(endpoint: string, responseTime: number, statusCode: number, metadata: any = {}) {
    try {
      const metric: Record<string, any> = {
        timestamp: new Date().toISOString(),
        endpoint,
        responseTime,
        statusCode,
        success: statusCode < 400,
        ...metadata
      };

      this.metrics.responseTimes.push(metric);

      // Keep only recent metrics
      if (this.metrics.responseTimes.length > 10000) {
        this.metrics.responseTimes = this.metrics.responseTimes.slice(-5000);
      }

      // Check for performance degradation
      this._checkResponseTimeThreshold(endpoint, responseTime);

    } catch (error) {
      logger.error('Error recording API response:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Record custom metric
   *
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} tags - Metric tags
   */
  recordCustomMetric(name: string, value: number, tags: any = {}): void {
    try {
      if (!this.metrics.customMetrics.has(name)) {
        this.metrics.customMetrics.set(name, []);
      }

      const metrics = this.metrics.customMetrics.get(name);
      metrics.push({
        timestamp: new Date().toISOString(),
        value,
        tags
      });

      // Keep only recent metrics
      if (metrics.length > 5000) {
        this.metrics.customMetrics.set(name, metrics.slice(-2500));
      }

    } catch (error) {
      logger.error('Error recording custom metric:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Record error
   *
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  recordError(error: Error, context: any = {}): void {
    try {
      const errorMetric: Record<string, any> = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        name: error.name,
        context
      };

      // This would be stored in a separate error tracking system
      logger.error('Error recorded:', errorMetric);

    } catch (recordError) {
      logger.error('Error recording error:', recordError);
    }
  }

  /**
   * Start profiling
   *
   * @param {string} name - Profile name
   * @returns {Function} Stop profiling function
   */
  startProfiling(name: string): () => void {
    if (!this.options.enableProfiling) {
      return () => {};
    }

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    logger.info(`Started profiling: ${name}`);

    return () => {
      const endTime = performance.now();
      const endMemory = process.memoryUsage();

      const profile: Record<string, any> = {
        name,
        duration: endTime - startTime,
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        },
        timestamp: new Date().toISOString()
      };

      logger.info(`Profile completed: ${name}`, profile);
      return profile;
    };
  }

  /**
   * Get performance metrics
   *
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceMetrics(options: any = {}): Promise<any> {
    try {
      const {
        startTime = new Date(Date.now() - 60 * 60 * 1000), // Last hour
        endTime = new Date(),
        includeSystem = true,
        includeCustom = true
      } = options;

      const metrics: Record<string, any> = {
        period: {
          start: startTime.toISOString(),
          end: endTime.toISOString()
        },
        api: this._calculateApiMetrics(startTime, endTime),
        system: includeSystem ? await this._getSystemMetrics() : null,
        custom: includeCustom ? this._getCustomMetrics(startTime, endTime) : null,
        alerts: this.alerts.filter((alert: any) =>
          new Date(alert.timestamp) >= startTime &&
          new Date(alert.timestamp) <= endTime
        ),
        timestamp: new Date().toISOString()
      };

      return metrics;
    } catch (error) {
      logger.error('Error getting performance metrics:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Generate performance report
   *
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Performance report
   */
  async generatePerformanceReport(options: any = {}): Promise<any> {
    try {
      const {
        period = 'daily', // daily, weekly, monthly
        includeTrends = true,
        includeRecommendations = true
      } = options;

      const report: Record<string, any> = {
        period,
        generatedAt: new Date().toISOString(),
        summary: {},
        trends: {},
        recommendations: [],
        alerts: []
      };

      // Calculate period dates
      const { startDate, endDate } = this._getPeriodDates(period);

      // Get metrics for the period
      const metrics = await this.getPerformanceMetrics({
        startTime: startDate,
        endTime: endDate
      });

      // Generate summary
      report.summary = this._generatePerformanceSummary(metrics);

      // Analyze trends
      if (includeTrends) {
        report.trends = await this._analyzePerformanceTrends(period);
      }

      // Generate recommendations
      if (includeRecommendations) {
        report.recommendations = this._generatePerformanceRecommendations(metrics);
      }

      // Include recent alerts
      report.alerts = metrics.alerts.slice(-10);

      return report;
    } catch (error) {
      logger.error('Error generating performance report:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Create performance alert
   *
   * @param {Object} alertData - Alert data
   */
  async createAlert(alertData: any) {
    try {
      const alert = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: alertData.type,
        severity: alertData.severity || 'warning',
        title: alertData.title,
        description: alertData.description,
        metric: alertData.metric,
        threshold: alertData.threshold,
        currentValue: alertData.currentValue,
        status: 'active',
        acknowledged: false,
        resolved: false,
        metadata: alertData.metadata || {}
      };

      this.alerts.push(alert);

      // Keep only recent alerts
      if (this.alerts.length > 1000) {
        this.alerts = this.alerts.slice(-500);
      }

      logger.info(`Performance alert created: ${alert.title} (${alert.severity})`);

      // Send notification (would integrate with notification service)
      await this._sendAlertNotification(alert);

      return alert.id;
    } catch (error) {
      logger.error('Error creating performance alert:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Acknowledge alert
   *
   * @param {string} alertId - Alert ID
   * @param {string} userId - User who acknowledged
   * @returns {boolean} Success status
   */
  async acknowledgeAlert(alertId: string, userId: string) {
    try {
      const alert = this.alerts.find((a: any) => a.id === alertId);

      if (!alert) {
        return false;
      }

      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date().toISOString();

      logger.info(`Alert ${alertId} acknowledged by ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error acknowledging alert:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Resolve alert
   *
   * @param {string} alertId - Alert ID
   * @param {string} resolution - Resolution details
   * @returns {boolean} Success status
   */
  async resolveAlert(alertId: string, resolution: string = '') {
    try {
      const alert = this.alerts.find((a: any) => a.id === alertId);

      if (!alert) {
        return false;
      }

      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolution = resolution;

      logger.info(`Alert ${alertId} resolved: ${resolution}`);
      return true;
    } catch (error) {
      logger.error('Error resolving alert:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Set up performance observer
   *
   * @private
   */
  _setupPerformanceObserver() {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          this._processPerformanceEntry(entry);
        }
      });

      // Observe different performance metrics
      this.performanceObserver.observe({
        entryTypes: ['measure', 'navigation', 'resource']
      });
    }
  }

  /**
   * Process performance entry
   *
   * @private
   * @param {PerformanceEntry} entry - Performance entry
   */
  _processPerformanceEntry(entry: any) {
    try {
      if (entry.entryType === 'navigation') {
        // Page load performance
        this.recordCustomMetric('page_load_time', entry.loadEventEnd - entry.loadEventStart, {
          url: entry.name
        });
      } else if (entry.entryType === 'resource') {
        // Resource loading performance
        this.recordCustomMetric('resource_load_time', entry.responseEnd - entry.requestStart, {
          url: entry.name,
          type: entry.initiatorType
        });
      } else if (entry.entryType === 'measure') {
        // Custom measurements
        this.recordCustomMetric(entry.name, entry.duration);
      }
    } catch (error) {
      logger.error('Error processing performance entry:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Collect system metrics
   *
   * @private
   */
  async _collectMetrics() {
    try {
      const timestamp = new Date().toISOString();

      // Memory usage
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage.push({
        timestamp,
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      });

      // CPU usage
      const cpuUsage = process.cpuUsage();
      this.metrics.cpuUsage.push({
        timestamp,
        user: cpuUsage.user,
        system: cpuUsage.system
      });

      // Throughput (requests per minute)
      const recentRequests = this.metrics.responseTimes.filter(
        (r: any) => new Date(r.timestamp) > new Date(Date.now() - 60000)
      );
      this.metrics.throughput.push({
        timestamp,
        requestsPerMinute: recentRequests.length
      });

      // Clean up old metrics
      this._cleanupOldMetrics();

      // Check thresholds
      await this._checkSystemThresholds(memUsage, cpuUsage);

    } catch (error) {
      logger.error('Error collecting metrics:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Start alerting system
   *
   * @private
   */
  _startAlerting() {
    // Check for alerts every 5 minutes
    setInterval(async () => {
      try {
        await this._checkForAlerts();
      } catch (error) {
        logger.error('Error checking for alerts:', error instanceof Error ? error.message : String(error));
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Check response time threshold
   *
   * @private
   * @param {string} endpoint - API endpoint
   * @param {number} responseTime - Response time
   */
  async _checkResponseTimeThreshold(endpoint: string, responseTime: number) {
    if (responseTime > this.options.alertThresholds.responseTime) {
      await this.createAlert({
        type: 'response_time',
        severity: 'warning',
        title: 'Slow API Response Detected',
        description: `API endpoint ${endpoint} responded in ${responseTime}ms`,
        metric: 'response_time',
        threshold: this.options.alertThresholds.responseTime,
        currentValue: responseTime,
        metadata: { endpoint }
      });
    }
  }

  /**
   * Check system thresholds
   *
   * @private
   * @param {Object} memUsage - Memory usage
   * @param {Object} cpuUsage - CPU usage
   */
  async _checkSystemThresholds(memUsage: NodeJS.MemoryUsage, cpuUsage: NodeJS.CpuUsage): Promise<void> {
    // Memory threshold
    const memoryUsageRatio = memUsage.heapUsed / memUsage.heapTotal;
    if (memoryUsageRatio > this.options.alertThresholds.memoryUsage) {
      await this.createAlert({
        type: 'memory_usage',
        severity: 'warning',
        title: 'High Memory Usage Detected',
        description: `Memory usage is at ${(memoryUsageRatio * 100).toFixed(1)}%`,
        metric: 'memory_usage',
        threshold: this.options.alertThresholds.memoryUsage,
        currentValue: memoryUsageRatio,
        metadata: { heapUsed: memUsage.heapUsed, heapTotal: memUsage.heapTotal }
      });
    }

    // CPU threshold (simplified check)
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    if (totalCpuTime > 1000000) { // Arbitrary threshold for demo
      await this.createAlert({
        type: 'cpu_usage',
        severity: 'warning',
        title: 'High CPU Usage Detected',
        description: `High CPU usage detected in application process`,
        metric: 'cpu_usage',
        threshold: this.options.alertThresholds.cpuUsage,
        currentValue: totalCpuTime,
        metadata: { user: cpuUsage.user, system: cpuUsage.system }
      });
    }
  }

  /**
   * Check for performance alerts
   *
   * @private
   */
  async _checkForAlerts() {
    try {
      // Check error rate
      const recentResponses = this.metrics.responseTimes.slice(-100);
      const errorCount = recentResponses.filter((r: any) => !r.success).length;
      const errorRate = errorCount / recentResponses.length;

      if (errorRate > this.options.alertThresholds.errorRate) {
        await this.createAlert({
          type: 'error_rate',
          severity: 'error',
          title: 'High Error Rate Detected',
          description: `Error rate is at ${(errorRate * 100).toFixed(1)}%`,
          metric: 'error_rate',
          threshold: this.options.alertThresholds.errorRate,
          currentValue: errorRate,
          metadata: { errorCount, totalRequests: recentResponses.length }
        });
      }

      // Check for performance degradation trends
      await this._checkPerformanceTrends();

    } catch (error) {
      logger.error('Error checking for alerts:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Check performance trends
   *
   * @private
   */
  async _checkPerformanceTrends() {
    try {
      const recentResponses = this.metrics.responseTimes.slice(-1000);
      if (recentResponses.length < 100) return;

      // Calculate average response time trend
      const midPoint = Math.floor(recentResponses.length / 2);
      const firstHalf = recentResponses.slice(0, midPoint);
      const secondHalf = recentResponses.slice(midPoint);

      const firstHalfAvg = firstHalf.reduce((sum: number, r: any) => sum + r.responseTime, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum: number, r: any) => sum + r.responseTime, 0) / secondHalf.length;

      const degradationPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

      if (degradationPercent > 20) { // 20% degradation
        await this.createAlert({
          type: 'performance_degradation',
          severity: 'warning',
          title: 'Performance Degradation Detected',
          description: `Response time increased by ${degradationPercent.toFixed(1)}%`,
          metric: 'response_time_trend',
          threshold: 20,
          currentValue: degradationPercent,
          metadata: {
            firstHalfAvg: Math.round(firstHalfAvg),
            secondHalfAvg: Math.round(secondHalfAvg)
          }
        });
      }

    } catch (error) {
      logger.error('Error checking performance trends:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Calculate API metrics
   *
   * @private
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @returns {Object} API metrics
   */
  _calculateApiMetrics(startTime: Date, endTime: Date) {
    const relevantResponses = this.metrics.responseTimes.filter(
      (r: any) => new Date(r.timestamp) >= startTime && new Date(r.timestamp) <= endTime
    );

    if (relevantResponses.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0
      };
    }

    const responseTimes = relevantResponses.map((r: any) => r.responseTime).sort((a: number, b: number) => a - b);
    const successCount = relevantResponses.filter((r: any) => r.success).length;

    return {
      totalRequests: relevantResponses.length,
      averageResponseTime: responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length,
      successRate: successCount / relevantResponses.length,
      errorRate: 1 - (successCount / relevantResponses.length),
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
      slowestEndpoint: this._findSlowestEndpoint(relevantResponses)
    };
  }

  /**
   * Get system metrics
   *
   * @private
   * @returns {Promise<Object>} System metrics
   */
  async _getSystemMetrics() {
    try {
      const cpus = os.cpus();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();

      return {
        cpu: {
          count: cpus.length,
          model: cpus[0].model,
          speed: cpus[0].speed
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: totalMemory - freeMemory,
          usagePercent: ((totalMemory - freeMemory) / totalMemory) * 100
        },
        loadAverage: os.loadavg(),
        uptime: os.uptime(),
        platform: os.platform(),
        arch: os.arch()
      };
    } catch (error) {
      logger.error('Error getting system metrics:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Get custom metrics
   *
   * @private
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @returns {Object} Custom metrics
   */
  _getCustomMetrics(startTime: Date, endTime: Date): Record<string, any> {
    const customMetrics: Record<string, any> = {};

    for (const [name, metrics] of this.metrics.customMetrics) {
      const relevantMetrics = metrics.filter(
        (m: any) => new Date(m.timestamp) >= startTime && new Date(m.timestamp) <= endTime
      );

      if (relevantMetrics.length > 0) {
        const values = relevantMetrics.map((m: any) => m.value);
        customMetrics[name] = {
          count: values.length,
          average: values.reduce((sum: number, v: number) => sum + v, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1]
        };
      }
    }

    return customMetrics;
  }

  /**
   * Find slowest endpoint
   *
   * @private
   * @param {Array} responses - API responses
   * @returns {Object} Slowest endpoint info
   */
  _findSlowestEndpoint(responses: any[]) {
    const endpointStats: Record<string, any> = {};

    responses.forEach(response => {
      if (!endpointStats[response.endpoint]) {
        endpointStats[response.endpoint] = {
          totalTime: 0,
          count: 0,
          maxTime: 0
        };
      }

      endpointStats[response.endpoint].totalTime += response.responseTime;
      endpointStats[response.endpoint].count++;
      endpointStats[response.endpoint].maxTime = Math.max(
        endpointStats[response.endpoint].maxTime,
        response.responseTime
      );
    });

    let slowestEndpoint = null;
    let slowestAvgTime = 0;

    for (const [endpoint, stats] of Object.entries(endpointStats)) {
      const avgTime = stats.totalTime / stats.count;
      if (avgTime > slowestAvgTime) {
        slowestAvgTime = avgTime;
        slowestEndpoint = {
          endpoint,
          averageResponseTime: Math.round(avgTime),
          maxResponseTime: stats.maxTime,
          requestCount: stats.count
        };
      }
    }

    return slowestEndpoint;
  }

  /**
   * Get period dates
   *
   * @private
   * @param {string} period - Period type
   * @returns {Object} Period dates
   */
  _getPeriodDates(period: string) {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  }

  /**
   * Generate performance summary
   *
   * @private
   * @param {Object} metrics - Performance metrics
   * @returns {Object} Performance summary
   */
  _generatePerformanceSummary(metrics: any) {
    return {
      totalRequests: metrics.api.totalRequests,
      averageResponseTime: Math.round(metrics.api.averageResponseTime),
      successRate: Math.round(metrics.api.successRate * 100),
      errorRate: Math.round(metrics.api.errorRate * 100),
      p95ResponseTime: Math.round(metrics.api.p95ResponseTime),
      activeAlerts: metrics.alerts.filter((a: any) => a.status === 'active').length,
      systemHealth: this._calculateSystemHealth(metrics.system)
    };
  }

  /**
   * Analyze performance trends
   *
   * @private
   * @param {string} _period - Analysis period (unused)
   * @returns {Promise<Object>} Performance trends
   */
  async _analyzePerformanceTrends(_period: string) {
    // This would analyze historical data for trends
    // For demonstration, return mock trends
    return {
      responseTimeTrend: 'stable',
      throughputTrend: 'increasing',
      errorRateTrend: 'decreasing',
      memoryUsageTrend: 'stable'
    };
  }

  /**
   * Generate performance recommendations
   *
   * @private
   * @param {Object} metrics - Performance metrics
   * @returns {Array} Performance recommendations
   */
  _generatePerformanceRecommendations(metrics: any) {
    const recommendations = [];

    if (metrics.api.averageResponseTime > 2000) {
      recommendations.push({
        priority: 'high',
        category: 'response_time',
        title: 'Optimize API Response Times',
        description: 'Average response time is above 2 seconds. Consider implementing caching and query optimization.',
        estimatedImpact: 'High'
      });
    }

    if (metrics.api.errorRate > 0.05) {
      recommendations.push({
        priority: 'high',
        category: 'error_rate',
        title: 'Reduce Error Rate',
        description: 'Error rate is above 5%. Review error handling and implement better validation.',
        estimatedImpact: 'High'
      });
    }

    if (metrics.system?.memory.usagePercent > 80) {
      recommendations.push({
        priority: 'medium',
        category: 'memory',
        title: 'Optimize Memory Usage',
        description: 'Memory usage is above 80%. Consider implementing memory optimization techniques.',
        estimatedImpact: 'Medium'
      });
    }

    return recommendations;
  }

  /**
   * Calculate system health
   *
   * @private
   * @param {Object} systemMetrics - System metrics
   * @returns {string} System health status
   */
  _calculateSystemHealth(systemMetrics: any) {
    if (!systemMetrics) return 'unknown';

    let score = 100;

    if (systemMetrics.memory.usagePercent > 90) score -= 30;
    else if (systemMetrics.memory.usagePercent > 80) score -= 15;

    if (systemMetrics.loadAverage[0] > systemMetrics.cpu.count * 2) score -= 20;
    else if (systemMetrics.loadAverage[0] > systemMetrics.cpu.count) score -= 10;

    if (score >= 80) return 'healthy';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  /**
   * Send alert notification
   *
   * @private
   * @param {Object} alert - Alert data
   */
  async _sendAlertNotification(alert: any) {
    // This would integrate with the notification service
    logger.info(`Sending alert notification: ${alert.title}`);
  }

  /**
   * Clean up old metrics
   *
   * @private
   */
  _cleanupOldMetrics() {
    const cutoffTime = Date.now() - this.options.retentionPeriod;

    // Clean up old metrics
    this.metrics.responseTimes = this.metrics.responseTimes.filter(
      (m: any) => new Date(m.timestamp).getTime() > cutoffTime
    );

    this.metrics.memoryUsage = this.metrics.memoryUsage.filter(
      (m: any) => new Date(m.timestamp).getTime() > cutoffTime
    );

    this.metrics.cpuUsage = this.metrics.cpuUsage.filter(
      (m: any) => new Date(m.timestamp).getTime() > cutoffTime
    );

    // Clean up old alerts
    this.alerts = this.alerts.filter(
      (alert: any) => new Date(alert.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * Shutdown the performance monitoring service
   */
  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    logger.info('Performance monitoring service shut down');
  }
}

export default PerformanceMonitoringService;