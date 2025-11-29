/**
 * EdPsych Connect - Advanced Analytics and Reporting System
 * Comprehensive analytics, reporting, and data visualization
 */

export interface AnalyticsEvent {
  id: string;
  type: string;
  entityId?: string;
  tenantId?: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: {
    userAgent: string;
    ipAddress: string;
    referrer?: string;
    page: string;
    duration?: number;
  };
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'user-activity' | 'feature-usage' | 'performance' | 'engagement' | 'custom';
  filters: Record<string, any>;
  dimensions: string[];
  metrics: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'funnel';
  title: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dataSource: string;
  refreshInterval?: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  permissions: {
    view: string[];
    edit: string[];
    share: string[];
  };
  tenantId?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private metrics: Map<string, AnalyticsMetric> = new Map();
  private reports: Map<string, ReportConfig> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();

  private constructor() {
    this.initializeDefaultMetrics();
    this.initializeDefaultDashboards();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Event Tracking
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.events.push(analyticsEvent);

    // Process real-time metrics
    await this.processEventForMetrics(analyticsEvent);

    // Trigger real-time updates
    await this.triggerRealTimeUpdates(analyticsEvent);

    // Store event (in production, this would go to a database/queue)
    console.info('Analytics event tracked:', analyticsEvent);
  }

  async trackPageView(entityId: string, page: string, metadata: Partial<AnalyticsEvent['metadata']>): Promise<void> {
    await this.trackEvent({
      type: 'page_view',
      entityId,
      sessionId: this.getSessionId(),
      data: { page },
      metadata: {
        userAgent: navigator.userAgent,
        ipAddress: '0.0.0.0', // Would be populated by server
        page,
        ...metadata
      }
    });
  }

  async trackFeatureUsage(entityId: string, feature: string, action: string, data?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      type: 'feature_usage',
      entityId,
      sessionId: this.getSessionId(),
      data: { feature, action, ...data },
      metadata: {
        userAgent: navigator.userAgent,
        ipAddress: '0.0.0.0',
        page: window.location.pathname
      }
    });
  }

  async trackUserEngagement(entityId: string, engagementType: string, data?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      type: 'user_engagement',
      entityId,
      sessionId: this.getSessionId(),
      data: { engagementType, ...data },
      metadata: {
        userAgent: navigator.userAgent,
        ipAddress: '0.0.0.0',
        page: window.location.pathname
      }
    });
  }

  // Metrics Management
  private initializeDefaultMetrics(): void {
    const defaultMetrics: AnalyticsMetric[] = [
      {
        name: 'active_users',
        value: 0,
        unit: 'count',
        trend: 'stable',
        change: 0,
        period: '24h'
      },
      {
        name: 'page_views',
        value: 0,
        unit: 'count',
        trend: 'stable',
        change: 0,
        period: '24h'
      },
      {
        name: 'session_duration',
        value: 0,
        unit: 'seconds',
        trend: 'stable',
        change: 0,
        period: '24h'
      },
      {
        name: 'feature_adoption',
        value: 0,
        unit: 'percentage',
        trend: 'stable',
        change: 0,
        period: '24h'
      },
      {
        name: 'ai_requests',
        value: 0,
        unit: 'count',
        trend: 'stable',
        change: 0,
        period: '24h'
      }
    ];

    defaultMetrics.forEach(metric => {
      this.metrics.set(metric.name, metric);
    });
  }

  async getMetric(name: string, period: string = '24h'): Promise<AnalyticsMetric | null> {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    // In production, fetch real-time data from database
    // TODO: Use period parameter for time-based filtering
    console.info(`Getting metric ${name} for period ${period}`);
    return metric;
  }

  async getMetrics(names: string[], period: string = '24h'): Promise<AnalyticsMetric[]> {
    const metrics: AnalyticsMetric[] = [];
    for (const name of names) {
      const metric = await this.getMetric(name, period);
      if (metric) metrics.push(metric);
    }
    return metrics;
  }

  async updateMetric(name: string, value: number, period: string = '24h'): Promise<void> {
    const existingMetric = this.metrics.get(name);
    if (!existingMetric) return;

    const change = value - existingMetric.value;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    const updatedMetric: AnalyticsMetric = {
      ...existingMetric,
      value,
      trend,
      change,
      period
    };

    this.metrics.set(name, updatedMetric);
  }

  // Dashboard Management
  private initializeDefaultDashboards(): void {
    const defaultDashboard: Dashboard = {
      id: 'default',
      name: 'Executive Overview',
      description: 'High-level platform metrics and KPIs',
      widgets: [
        {
          id: 'active_users_widget',
          type: 'metric',
          title: 'Active Users',
          config: {
            metric: 'active_users',
            format: 'number',
            showTrend: true
          },
          position: { x: 0, y: 0, width: 4, height: 2 },
          dataSource: 'realtime'
        },
        {
          id: 'page_views_chart',
          type: 'chart',
          title: 'Page Views Over Time',
          config: {
            type: 'line',
            metric: 'page_views',
            timeRange: '7d'
          },
          position: { x: 4, y: 0, width: 8, height: 4 },
          dataSource: 'historical'
        },
        {
          id: 'feature_usage_table',
          type: 'table',
          title: 'Feature Usage',
          config: {
            columns: ['feature', 'usage_count', 'unique_users'],
            sortBy: 'usage_count',
            limit: 10
          },
          position: { x: 0, y: 2, width: 4, height: 4 },
          dataSource: 'aggregated'
        },
        {
          id: 'engagement_funnel',
          type: 'funnel',
          title: 'User Engagement Funnel',
          config: {
            steps: ['page_view', 'feature_usage', 'ai_interaction', 'report_generation']
          },
          position: { x: 0, y: 6, width: 12, height: 3 },
          dataSource: 'funnel'
        }
      ],
      permissions: {
        view: ['admin', 'manager'],
        edit: ['admin'],
        share: ['admin', 'manager']
      },
      isPublic: false,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.set('default', defaultDashboard);
  }

  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const dashboardId = this.generateDashboardId();
    const newDashboard: Dashboard = {
      ...dashboard,
      id: dashboardId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.set(dashboardId, newDashboard);
    return newDashboard;
  }

  async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardId} not found`);
    }

    const updatedDashboard = {
      ...dashboard,
      ...updates,
      updatedAt: new Date()
    };

    this.dashboards.set(dashboardId, updatedDashboard);
    return updatedDashboard;
  }

  getDashboard(dashboardId: string): Dashboard | null {
    return this.dashboards.get(dashboardId) || null;
  }

  getAllDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  async addWidgetToDashboard(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): Promise<Dashboard> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardId} not found`);
    }

    const widgetId = this.generateWidgetId();
    const newWidget: DashboardWidget = {
      ...widget,
      id: widgetId
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();

    this.dashboards.set(dashboardId, dashboard);
    return dashboard;
  }

  async removeWidgetFromDashboard(dashboardId: string, widgetId: string): Promise<Dashboard> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard ${dashboardId} not found`);
    }

    dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId);
    dashboard.updatedAt = new Date();

    this.dashboards.set(dashboardId, dashboard);
    return dashboard;
  }

  // Report Management
  async createReport(config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportConfig> {
    const reportId = this.generateReportId();
    const report: ReportConfig = {
      ...config,
      id: reportId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reports.set(reportId, report);

    // Schedule report if configured
    if (report.schedule) {
      await this.scheduleReport(report);
    }

    return report;
  }

  async generateReport(reportId: string): Promise<any> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    // Generate report data based on configuration
    const data = await this.generateReportData(report);

    return {
      id: reportId,
      name: report.name,
      type: report.type,
      data,
      generatedAt: new Date(),
      filters: report.filters,
      dateRange: report.dateRange
    };
  }

  async scheduleReport(report: ReportConfig): Promise<void> {
    if (!report.schedule) return;

    // In production, this would integrate with a job scheduler
    console.info(`Scheduling report ${report.id} with frequency: ${report.schedule.frequency}`);
  }

  // Data Analysis
  async getUserActivity(entityId: string, dateRange: { start: Date; end: Date }): Promise<AnalyticsEvent[]> {
    return this.events.filter(event =>
      event.entityId === entityId &&
      event.timestamp >= dateRange.start &&
      event.timestamp <= dateRange.end
    );
  }

  async getFeatureUsage(feature: string, dateRange: { start: Date; end: Date }): Promise<any> {
    const featureEvents = this.events.filter(event =>
      event.type === 'feature_usage' &&
      event.data.feature === feature &&
      event.timestamp >= dateRange.start &&
      event.timestamp <= dateRange.end
    );

    return {
      feature,
      totalUsage: featureEvents.length,
      uniqueUsers: new Set(featureEvents.map(e => e.entityId)).size,
      averageSessionDuration: this.calculateAverage(featureEvents.map(e => e.metadata.duration || 0)),
      usageByDay: this.groupByDay(featureEvents)
    };
  }

  async getEngagementMetrics(dateRange: { start: Date; end: Date }): Promise<any> {
    const engagementEvents = this.events.filter(event =>
      event.type === 'user_engagement' &&
      event.timestamp >= dateRange.start &&
      event.timestamp <= dateRange.end
    );

    return {
      totalEngagements: engagementEvents.length,
      engagementTypes: this.groupBy(engagementEvents, 'data.engagementType'),
      engagementTrend: this.calculateTrend(engagementEvents),
      topEngagedUsers: this.getTopUsers(engagementEvents)
    };
  }

  async getPerformanceMetrics(dateRange: { start: Date; end: Date }): Promise<any> {
    const performanceEvents = this.events.filter(event =>
      event.type === 'performance' &&
      event.timestamp >= dateRange.start &&
      event.timestamp <= dateRange.end
    );

    return {
      averagePageLoadTime: this.calculateAverage(performanceEvents.map(e => e.data.pageLoadTime || 0)),
      averageApiResponseTime: this.calculateAverage(performanceEvents.map(e => e.data.apiResponseTime || 0)),
      errorRate: this.calculateErrorRate(performanceEvents),
      performanceByPage: this.groupBy(performanceEvents, 'metadata.page')
    };
  }

  // Real-time Updates
  private async processEventForMetrics(event: AnalyticsEvent): Promise<void> {
    switch (event.type) {
      case 'page_view':
        await this.updateMetric('page_views', (await this.getMetric('page_views'))?.value || 0 + 1);
        break;
      case 'feature_usage':
        if (event.data.feature === 'ai') {
          await this.updateMetric('ai_requests', (await this.getMetric('ai_requests'))?.value || 0 + 1);
        }
        break;
      case 'user_engagement':
        // Update engagement metrics
        break;
    }
  }

  private async triggerRealTimeUpdates(event: AnalyticsEvent): Promise<void> {
    // Trigger WebSocket updates to connected dashboards
    // Update real-time widgets
    console.info('Triggering real-time updates for event:', event.type);
  }

  // Utility Methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDashboardId(): string {
    return `dash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWidgetId(): string {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    // In production, this would be managed by the session system
    return `session_${Date.now()}`;
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateTrend(events: AnalyticsEvent[]): 'up' | 'down' | 'stable' {
    if (events.length < 2) return 'stable';

    const recent = events.slice(-Math.ceil(events.length / 2));
    const older = events.slice(0, Math.floor(events.length / 2));

    const recentAvg = this.calculateAverage(recent.map(e => e.metadata.duration || 0));
    const olderAvg = this.calculateAverage(older.map(e => e.metadata.duration || 0));

    if (recentAvg > olderAvg * 1.1) return 'up';
    if (recentAvg < olderAvg * 0.9) return 'down';
    return 'stable';
  }

  private calculateErrorRate(events: AnalyticsEvent[]): number {
    const errors = events.filter(e => e.data.error).length;
    return events.length > 0 ? (errors / events.length) * 100 : 0;
  }

  private groupBy<T>(events: AnalyticsEvent[], key: string): Record<string, T[]> {
    return events.reduce((groups, event) => {
      const groupKey = this.getNestedValue(event, key);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(event as any);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private groupByDay(events: AnalyticsEvent[]): Record<string, number> {
    return events.reduce((groups, event) => {
      const day = event.timestamp.toISOString().split('T')[0];
      groups[day] = (groups[day] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private getTopUsers(events: AnalyticsEvent[]): Array<{ id: string; count: number }> {
    const userCounts = events.reduce((counts, event) => {
      counts[event.entityId || 'anonymous'] = (counts[event.entityId || 'anonymous'] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(userCounts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async generateReportData(report: ReportConfig): Promise<any> {
    // Generate report data based on report configuration
    // This would query the actual data sources
    console.info(`Generating report data for: ${report.name} (${report.type})`);
    return {
      summary: {
        reportType: report.type,
        dateRange: report.dateRange,
        filters: report.filters
      },
      details: [],
      charts: []
    };
  }

  // Public API
  async getRealtimeMetrics(): Promise<AnalyticsMetric[]> {
    return Array.from(this.metrics.values());
  }

  async exportData(format: 'csv' | 'json' | 'pdf', dateRange: { start: Date; end: Date }): Promise<any> {
    const events = this.events.filter(event =>
      event.timestamp >= dateRange.start &&
      event.timestamp <= dateRange.end
    );

    switch (format) {
      case 'json':
        return events;
      case 'csv':
        return this.convertToCSV(events);
      case 'pdf':
        return this.generatePDF(events);
      default:
        return events;
    }
  }

  private convertToCSV(events: AnalyticsEvent[]): string {
    if (events.length === 0) {
      return '';
    }

    // Define CSV columns
    const columns = [
      'id',
      'type',
      'entityId',
      'tenantId',
      'sessionId',
      'timestamp',
      'page',
      'duration',
      'userAgent',
      'referrer',
    ];

    // Helper to escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build header row
    const header = columns.join(',');

    // Build data rows
    const rows = events.map(event => {
      return columns.map(col => {
        switch (col) {
          case 'id':
            return escapeCSV(event.id);
          case 'type':
            return escapeCSV(event.type);
          case 'entityId':
            return escapeCSV(event.entityId);
          case 'tenantId':
            return escapeCSV(event.tenantId);
          case 'sessionId':
            return escapeCSV(event.sessionId);
          case 'timestamp':
            return escapeCSV(event.timestamp instanceof Date ? event.timestamp.toISOString() : event.timestamp);
          case 'page':
            return escapeCSV(event.metadata?.page);
          case 'duration':
            return escapeCSV(event.metadata?.duration);
          case 'userAgent':
            return escapeCSV(event.metadata?.userAgent);
          case 'referrer':
            return escapeCSV(event.metadata?.referrer);
          default:
            return '';
        }
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }

  private generatePDF(events: AnalyticsEvent[]): any {
    // Generate PDF report
    console.info(`Generating PDF report with ${events.length} events`);
    return {};
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Export types
// (Removed redundant re-exports of types already declared above)