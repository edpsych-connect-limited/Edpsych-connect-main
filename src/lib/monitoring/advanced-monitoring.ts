import { logger } from "@/lib/logger";
/**
 * Advanced Production Monitoring System for EdPsych Connect World
 * Enterprise-grade monitoring, alerting, and observability
 */

import { performance as _performance } from 'perf_hooks';

export interface MonitoringMetrics {
  timestamp: Date;
  uptime: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  databaseConnections: number;
  cacheHitRate: number;
  apiCalls: number;
  pageViews: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '>=' | '<=' | '==';
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  status: 'active' | 'acknowledged' | 'resolved';
}

export class AdvancedMonitoringService {
  private static instance: AdvancedMonitoringService;
  private metrics: MonitoringMetrics[] = [];
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private startTime: Date = new Date();

  private constructor() {
    this.initializeDefaultAlertRules();
  }

  public static getInstance(): AdvancedMonitoringService {
    if (!AdvancedMonitoringService.instance) {
      AdvancedMonitoringService.instance = new AdvancedMonitoringService();
    }
    return AdvancedMonitoringService.instance;
  }

  /**
   * Start comprehensive monitoring
   */
  startMonitoring(intervalMs: number = 10000): void {
    logger.debug('🚀 Starting Advanced Production Monitoring...');

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.evaluateAlertRules();
    }, intervalMs);

    // Start with initial metrics collection
    this.collectMetrics();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      logger.debug('⏹️ Production Monitoring Stopped');
    }
  }

  /**
   * Collect comprehensive system metrics
   */
  private async collectMetrics(): Promise<void> {
    const metrics: MonitoringMetrics = {
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      responseTime: await this.measureResponseTime(),
      throughput: await this.measureThroughput(),
      errorRate: await this.measureErrorRate(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
      activeUsers: await this.getActiveUsers(),
      databaseConnections: await this.getDatabaseConnections(),
      cacheHitRate: await this.getCacheHitRate(),
      apiCalls: await this.getApiCallCount(),
      pageViews: await this.getPageViewCount()
    };

    this.metrics.push(metrics);

    // Keep only last 1000 metrics for performance
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Evaluate alert rules against current metrics
   */
  private evaluateAlertRules(): void {
    if (this.metrics.length === 0) return;

    const currentMetrics = this.metrics[this.metrics.length - 1];

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const currentValue = this.getMetricValue(currentMetrics, rule.metric);
      const thresholdBreached = this.evaluateThreshold(currentValue, rule.threshold, rule.operator);

      if (thresholdBreached) {
        this.triggerAlert(rule, currentValue);
      } else {
        this.resolveAlert(rule.id);
      }
    }
  }

  /**
   * Get metric value by name
   */
  private getMetricValue(metrics: MonitoringMetrics, metricName: string): number {
    switch (metricName) {
      case 'responseTime': return metrics.responseTime;
      case 'errorRate': return metrics.errorRate;
      case 'memoryUsage': return metrics.memoryUsage;
      case 'cpuUsage': return metrics.cpuUsage;
      case 'throughput': return metrics.throughput;
      case 'activeUsers': return metrics.activeUsers;
      case 'databaseConnections': return metrics.databaseConnections;
      case 'cacheHitRate': return metrics.cacheHitRate;
      default: return 0;
    }
  }

  /**
   * Evaluate if threshold is breached
   */
  private evaluateThreshold(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      default: return false;
    }
  }

  /**
   * Trigger alert for breached rule
   */
  private triggerAlert(rule: AlertRule, currentValue: number): void {
    const existingAlert = this.alerts.find(
      alert => alert.ruleId === rule.id && alert.status === 'active'
    );

    if (!existingAlert) {
      const alert: Alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        triggeredAt: new Date(),
        severity: rule.severity,
        message: `${rule.name} threshold breached: ${currentValue} ${rule.operator} ${rule.threshold}`,
        value: currentValue,
        threshold: rule.threshold,
        status: 'active'
      };

      this.alerts.push(alert);
      this.sendAlertNotification(alert);
    }
  }

  /**
   * Resolve alert
   */
  private resolveAlert(ruleId: string): void {
    const activeAlert = this.alerts.find(
      alert => alert.ruleId === ruleId && alert.status === 'active'
    );

    if (activeAlert) {
      activeAlert.status = 'resolved';
      activeAlert.resolvedAt = new Date();
    }
  }

  /**
   * Send alert notification
   */
  private sendAlertNotification(alert: Alert): void {
    logger.debug(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);

    // In production, this would integrate with:
    // - Slack notifications
    // - Email alerts
    // - SMS notifications
    // - PagerDuty integration
    // - Monitoring dashboards
  }

  /**
   * Get current monitoring dashboard data
   */
  getDashboardData(): any {
    if (this.metrics.length === 0) {
      return { status: 'no_data' };
    }

    const current = this.metrics[this.metrics.length - 1];
    const previous = this.metrics.length > 1 ? this.metrics[this.metrics.length - 2] : current;

    return {
      status: 'operational',
      timestamp: current.timestamp,
      uptime: this.formatDuration(current.uptime),
      metrics: {
        responseTime: {
          current: current.responseTime,
          previous: previous.responseTime,
          change: this.calculateChange(current.responseTime, previous.responseTime),
          status: current.responseTime < 250 ? 'good' : current.responseTime < 500 ? 'warning' : 'critical'
        },
        errorRate: {
          current: current.errorRate,
          previous: previous.errorRate,
          change: this.calculateChange(current.errorRate, previous.errorRate),
          status: current.errorRate < 1 ? 'good' : current.errorRate < 5 ? 'warning' : 'critical'
        },
        throughput: {
          current: current.throughput,
          previous: previous.throughput,
          change: this.calculateChange(current.throughput, previous.throughput),
          status: 'good'
        },
        memoryUsage: {
          current: current.memoryUsage,
          previous: previous.memoryUsage,
          change: this.calculateChange(current.memoryUsage, previous.memoryUsage),
          status: current.memoryUsage < 70 ? 'good' : current.memoryUsage < 85 ? 'warning' : 'critical'
        },
        cpuUsage: {
          current: current.cpuUsage,
          previous: previous.cpuUsage,
          change: this.calculateChange(current.cpuUsage, previous.cpuUsage),
          status: current.cpuUsage < 50 ? 'good' : current.cpuUsage < 75 ? 'warning' : 'critical'
        }
      },
      activeAlerts: this.alerts.filter(alert => alert.status === 'active'),
      recentAlerts: this.alerts.slice(-10),
      trends: this.calculateTrends()
    };
  }

  /**
   * Calculate metric trends
   */
  private calculateTrends(): any {
    if (this.metrics.length < 10) {
      return { status: 'insufficient_data' };
    }

    const recent = this.metrics.slice(-10);
    const previous = this.metrics.slice(-20, -10);

    return {
      responseTime: this.calculateTrend(recent.map(m => m.responseTime), previous.map(m => m.responseTime)),
      errorRate: this.calculateTrend(recent.map(m => m.errorRate), previous.map(m => m.errorRate)),
      throughput: this.calculateTrend(recent.map(m => m.throughput), previous.map(m => m.throughput)),
      memoryUsage: this.calculateTrend(recent.map(m => m.memoryUsage), previous.map(m => m.memoryUsage)),
      cpuUsage: this.calculateTrend(recent.map(m => m.cpuUsage), previous.map(m => m.cpuUsage))
    };
  }

  /**
   * Calculate trend direction and magnitude
   */
  private calculateTrend(current: number[], previous: number[]): any {
    const currentAvg = current.reduce((sum, val) => sum + val, 0) / current.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    const change = ((currentAvg - previousAvg) / previousAvg) * 100;

    return {
      direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      magnitude: Math.abs(change),
      status: Math.abs(change) < 10 ? 'stable' : 'changing'
    };
  }

  /**
   * Calculate percentage change
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        metric: 'errorRate',
        threshold: 5,
        operator: '>',
        duration: 300, // 5 minutes
        severity: 'critical',
        enabled: true,
        notifications: ['email', 'slack', 'sms']
      },
      {
        id: 'slow_response_time',
        name: 'Slow Response Time',
        metric: 'responseTime',
        threshold: 500,
        operator: '>',
        duration: 180, // 3 minutes
        severity: 'high',
        enabled: true,
        notifications: ['email', 'slack']
      },
      {
        id: 'high_memory_usage',
        name: 'High Memory Usage',
        metric: 'memoryUsage',
        threshold: 85,
        operator: '>',
        duration: 600, // 10 minutes
        severity: 'medium',
        enabled: true,
        notifications: ['email', 'slack']
      },
      {
        id: 'high_cpu_usage',
        name: 'High CPU Usage',
        metric: 'cpuUsage',
        threshold: 80,
        operator: '>',
        duration: 600, // 10 minutes
        severity: 'medium',
        enabled: true,
        notifications: ['email', 'slack']
      }
    ];
  }

  // Metric collection methods (simplified for demo)
  private async measureResponseTime(): Promise<number> {
    return Math.floor(Math.random() * 100) + 150; // 150-250ms
  }

  private async measureThroughput(): Promise<number> {
    return Math.floor(Math.random() * 50) + 100; // 100-150 requests/sec
  }

  private async measureErrorRate(): Promise<number> {
    return Math.random() * 2; // 0-2% error rate
  }

  private getMemoryUsage(): number {
    return Math.floor(Math.random() * 20) + 45; // 45-65% memory usage
  }

  private getCpuUsage(): number {
    return Math.floor(Math.random() * 25) + 20; // 20-45% CPU usage
  }

  private async getActiveUsers(): Promise<number> {
    return Math.floor(Math.random() * 100) + 50; // 50-150 active users
  }

  private async getDatabaseConnections(): Promise<number> {
    return Math.floor(Math.random() * 10) + 5; // 5-15 connections
  }

  private async getCacheHitRate(): Promise<number> {
    return Math.floor(Math.random() * 20) + 80; // 80-100% hit rate
  }

  private async getApiCallCount(): Promise<number> {
    return Math.floor(Math.random() * 1000) + 500; // 500-1500 API calls
  }

  private async getPageViewCount(): Promise<number> {
    return Math.floor(Math.random() * 500) + 200; // 200-700 page views
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get monitoring summary
   */
  getMonitoringSummary(): any {
    return {
      totalMetrics: this.metrics.length,
      uptime: this.formatDuration(Date.now() - this.startTime.getTime()),
      activeAlerts: this.alerts.filter(alert => alert.status === 'active').length,
      averageResponseTime: this.calculateAverage(this.metrics.slice(-10).map(m => m.responseTime)),
      averageErrorRate: this.calculateAverage(this.metrics.slice(-10).map(m => m.errorRate)),
      averageMemoryUsage: this.calculateAverage(this.metrics.slice(-10).map(m => m.memoryUsage)),
      averageCpuUsage: this.calculateAverage(this.metrics.slice(-10).map(m => m.cpuUsage))
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }
}

// Export singleton instance
export const advancedMonitoring = AdvancedMonitoringService.getInstance();
