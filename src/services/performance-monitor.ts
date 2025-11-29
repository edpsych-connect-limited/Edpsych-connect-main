import { logger } from "@/lib/logger";
/**
 * Performance Monitoring Service
 * Comprehensive performance tracking and optimization for production deployment
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  category: 'navigation' | 'paint' | 'interaction' | 'resource' | 'custom';
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  pageLoadTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  timeToInteractive: number;
  resources: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
  customMetrics: PerformanceMetric[];
  recommendations: string[];
}

export interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  enableCDN: boolean;
  maxImageSize: number;
  minifyAssets: boolean;
  enableServiceWorker: boolean;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private config: OptimizationConfig = {
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enableCaching: true,
    enableCompression: true,
    enableCDN: false,
    maxImageSize: 1024 * 1024, // 1MB
    minifyAssets: true,
    enableServiceWorker: true
  };

  private constructor() {
    this.initializePerformanceObservers();
    this.initializeWebVitalsTracking();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance observers for various metrics
   */
  private initializePerformanceObservers(): void {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.trackNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (_error) {
        logger.error('Error initializing navigation observer:', error as Error);
      }

      // Paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.trackPaintMetrics(entry as PerformancePaintTiming);
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (_error) {
        logger.error('Error initializing paint observer:', error as Error);
      }

      // Resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.trackResourceMetrics(entry as PerformanceResourceTiming);
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (_error) {
        logger.error('Error initializing resource observer:', error as Error);
      }

      // Layout shift
      try {
        const layoutObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.trackLayoutShiftMetrics(entry as any);
          });
        });
        layoutObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutObserver);
      } catch (_error) {
        logger.error('Error initializing layout observer:', error as Error);
      }
    }
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitalsTracking(): void {
    // Track Core Web Vitals
    this.trackWebVital('LCP', 'largest-contentful-paint');
    this.trackWebVital('FID', 'first-input');
    this.trackWebVital('CLS', 'layout-shift');
    this.trackWebVital('TTI', 'time-to-interactive');
    this.trackWebVital('TBT', 'total-blocking-time');
  }

  /**
   * Track navigation timing metrics
   */
  private trackNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: 'pageLoadTime',
        value: entry.loadEventEnd - entry.fetchStart,
        category: 'navigation' as const
      },
      {
        name: 'domContentLoaded',
        value: entry.domContentLoadedEventEnd - entry.fetchStart,
        category: 'navigation' as const
      },
      {
        name: 'firstByte',
        value: entry.responseStart - entry.fetchStart,
        category: 'navigation' as const
      },
      {
        name: 'domInteractive',
        value: entry.domInteractive - entry.fetchStart,
        category: 'navigation' as const
      }
    ];

    metrics.forEach(metric => {
      this.recordMetric(metric);
    });
  }

  /**
   * Track paint timing metrics
   */
  private trackPaintMetrics(entry: PerformancePaintTiming): void {
    const metrics = [
      {
        name: entry.name === 'first-paint' ? 'firstPaint' : 'firstContentfulPaint',
        value: entry.startTime,
        category: 'paint' as const
      }
    ];

    metrics.forEach(metric => {
      this.recordMetric(metric);
    });
  }

  /**
   * Track resource loading metrics
   */
  private trackResourceMetrics(entry: PerformanceResourceTiming): void {
    if (entry.duration > 1000) { // Only track slow resources
      this.recordMetric({
        name: `slowResource:${entry.name}`,
        value: entry.duration,
        category: 'resource',
        metadata: {
          resourceType: entry.initiatorType,
          resourceSize: entry.transferSize,
          resourceUrl: entry.name
        }
      });
    }
  }

  /**
   * Track layout shift metrics
   */
  private trackLayoutShiftMetrics(entry: any): void {
    if (entry.value > 0.1) { // Only track significant layout shifts
      this.recordMetric({
        name: 'layoutShift',
        value: entry.value,
        category: 'interaction',
        metadata: {
          hadRecentInput: entry.hadRecentInput,
          sources: entry.sources
        }
      });
    }
  }

  /**
   * Track Web Vitals metrics
   */
  private trackWebVital(name: string, eventType: string): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric({
              name: name,
              value: entry.startTime || (entry as any).value || 0,
              category: 'custom',
              metadata: {
                webVital: true,
                rating: this.getWebVitalRating(name, entry.startTime || (entry as any).value || 0)
              }
            });
          });
        });
        observer.observe({ entryTypes: [eventType] });
        this.observers.push(observer);
      } catch (_error) {
        logger.error(`Error tracking ${name}:`, error as Error);
      }
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);

    // Keep only recent metrics (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp >= oneDayAgo);

    // Log significant performance issues
    if (this.isPerformanceIssue(metric)) {
      logger.warn('Performance issue detected:', metric);
    }
  }

  /**
   * Check if a metric indicates a performance issue
   */
  private isPerformanceIssue(metric: Omit<PerformanceMetric, 'timestamp'>): boolean {
    const thresholds = {
      pageLoadTime: 3000, // 3 seconds
      firstPaint: 2000, // 2 seconds
      firstContentfulPaint: 2500, // 2.5 seconds
      largestContentfulPaint: 4000, // 4 seconds
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.25, // 0.25 CLS
      totalBlockingTime: 500, // 500ms
      layoutShift: 0.1 // 0.1 CLS
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    return threshold !== undefined && metric.value > threshold;
  }

  /**
   * Get Web Vital rating
   */
  private getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const ratings = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTI: { good: 3800, poor: 7300 },
      TBT: { good: 300, poor: 600 }
    };

    const rating = ratings[name as keyof typeof ratings];
    if (!rating) return 'good';

    if (value <= rating.good) return 'good';
    if (value <= rating.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Generate comprehensive performance report
   */
  async generateReport(): Promise<PerformanceReport> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const firstPaint = paintEntries.find(e => e.name === 'first-paint')?.startTime || 0;
    const firstContentfulPaint = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;

    // Get LCP from largest contentful paint entries
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const largestContentfulPaint = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;

    // Calculate custom metrics
    const customMetrics = this.metrics.filter(m => m.category === 'custom');

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    const report: PerformanceReport = {
      pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      firstPaint,
      firstContentfulPaint,
      largestContentfulPaint,
      firstInputDelay: 0, // Would need to be measured separately
      cumulativeLayoutShift: 0, // Would need to be calculated from layout shifts
      totalBlockingTime: 0, // Would need to be calculated from long tasks
      timeToInteractive: 0, // Would need to be measured separately
      resources: resourceEntries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        type: entry.initiatorType || 'unknown'
      })),
      customMetrics,
      recommendations
    };

    return report;
  }

  /**
   * Generate performance optimization recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analyze metrics for issues
    const slowResources = this.metrics.filter(m =>
      m.name.startsWith('slowResource:') && m.value > 2000
    );

    const highLayoutShifts = this.metrics.filter(m =>
      m.name === 'layoutShift' && m.value > 0.1
    );

    const slowPageLoads = this.metrics.filter(m =>
      m.name === 'pageLoadTime' && m.value > 3000
    );

    if (slowResources.length > 0) {
      recommendations.push('Optimize slow-loading resources (images, fonts, scripts)');
      recommendations.push('Implement resource preloading for critical assets');
      recommendations.push('Consider using a CDN for static assets');
    }

    if (highLayoutShifts.length > 0) {
      recommendations.push('Fix layout shift issues by reserving space for images');
      recommendations.push('Use font-display: swap for web fonts');
      recommendations.push('Avoid inserting content above existing content');
    }

    if (slowPageLoads.length > 0) {
      recommendations.push('Implement code splitting to reduce initial bundle size');
      recommendations.push('Enable compression (gzip/brotli) for text assets');
      recommendations.push('Optimize images and use modern formats (WebP, AVIF)');
    }

    // General recommendations
    recommendations.push('Implement service worker for caching');
    recommendations.push('Use image optimization and lazy loading');
    recommendations.push('Minify CSS, JavaScript, and HTML');
    recommendations.push('Enable HTTP/2 or HTTP/3');

    return recommendations;
  }

  /**
   * Get performance optimization configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Update optimization configuration
   */
  updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Clean up observers and resources
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }

  /**
   * Export performance data for analysis
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'name', 'value', 'category', 'metadata'];
      const rows = this.metrics.map(metric => [
        metric.timestamp.toISOString(),
        metric.name,
        metric.value.toString(),
        metric.category,
        JSON.stringify(metric.metadata || {})
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.metrics, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();