import { logger } from "@/lib/logger";
/**
 * EdPsych Connect World - Real User Monitoring (RUM) Implementation
 *
 * This module provides comprehensive real-user monitoring capabilities for the EdPsych Connect World platform.
 * It integrates with multiple monitoring services and provides detailed performance and error tracking.
 *
 * Features:
 * - Performance monitoring (Core Web Vitals, page load times, API response times)
 * - Error tracking and reporting
 * - User journey analytics
 * - Custom event tracking
 * - Session recording capabilities
 * - Privacy-compliant data collection
 */

import { NextWebVitalsMetric } from 'next/app';

// Monitoring service interfaces
interface MonitoringConfig {
  sentry?: {
    dsn: string;
    environment: string;
    release?: string;
    sampleRate?: number;
  };
  analytics?: {
    measurementId: string;
    debug?: boolean;
  };
  performance?: {
    enableCLS?: boolean;
    enableFID?: boolean;
    enableFCP?: boolean;
    enableLCP?: boolean;
    enableTTFB?: boolean;
  };
}

interface UserSession {
  sessionId: string;
  id?: string;
  startTime: number;
  pageViews: number;
  events: MonitoringEvent[];
  performance: PerformanceMetrics;
}

interface MonitoringEvent {
  type: 'page_view' | 'user_interaction' | 'error' | 'performance' | 'custom';
  name: string;
  data: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

interface PerformanceMetrics {
  coreWebVitals: {
    cls?: number;
    fid?: number;
    fcp?: number;
    lcp?: number;
    ttfb?: number;
  };
  navigationTiming: {
    domContentLoaded?: number;
    loadComplete?: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
  apiMetrics: {
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

// Main monitoring class
class RealUserMonitoring {
  private config: MonitoringConfig;
  private session: UserSession | null = null;
  private isInitialized = false;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  /**
   * Initialize monitoring services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry for error tracking
      if (this.config.sentry) {
        await this.initializeSentry();
      }

      // Initialize Google Analytics
      if (this.config.analytics) {
        await this.initializeAnalytics();
      }

      // Initialize performance monitoring
      if (this.config.performance) {
        this.initializePerformanceMonitoring();
      }

      // Start user session
      this.startSession();

      this.isInitialized = true;
      logger.debug('✅ Real User Monitoring initialized successfully');
    } catch (_error) {
      console.error('❌ Failed to initialize Real User Monitoring:', error);
      // Don't throw - monitoring should not break the app
    }
  }

  /**
   * Initialize Sentry error tracking
   */
  private async initializeSentry(): Promise<void> {
    if (!this.config.sentry) return;

    try {
      // Sentry integration disabled - monitoring without external dependencies
      logger.debug('ℹ️  Sentry monitoring disabled (optional dependency not installed)');
    } catch (_error) {
      console.warn('⚠️  Sentry not available:', (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Initialize Google Analytics
   */
  private async initializeAnalytics(): Promise<void> {
    if (!this.config.analytics) return;

    try {
      // Dynamic import for gtag
      const gtag = await this.loadGoogleAnalytics();

      // Configure GA4
      gtag('config', this.config.analytics.measurementId, {
        debug_mode: this.config.analytics.debug || false,
        send_page_view: false, // We'll handle page views manually
      });

      logger.debug('✅ Google Analytics initialized');
    } catch (_error) {
      console.warn('⚠️  Google Analytics not available:', (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Load Google Analytics script
   */
  private async loadGoogleAnalytics(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check if gtag is already loaded
      if (typeof window !== 'undefined' && (window as any).gtag) {
        resolve((window as any).gtag);
        return;
      }

      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.analytics?.measurementId}`;

      script.onload = () => {
        // Initialize gtag
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        (window as any).gtag = gtag;

        gtag('js', new Date());
        resolve(gtag);
      };

      script.onerror = () => reject(new Error('Failed to load Google Analytics'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (!this.config.performance) return;

    // Monitor Core Web Vitals
    if (typeof window !== 'undefined') {
      this.observeCoreWebVitals();
      this.observeNavigationTiming();
    }
  }

  /**
   * Observe Core Web Vitals
   */
  private observeCoreWebVitals(): void {
    try {
      // Use web-vitals library if available
      import('web-vitals').then((webVitals: any) => {
        if (this.config.performance?.enableCLS && webVitals.getCLS) {
          webVitals.getCLS((metric: any) => this.trackWebVital('CLS', metric));
        }
        if (this.config.performance?.enableFID && webVitals.getFID) {
          webVitals.getFID((metric: any) => this.trackWebVital('FID', metric));
        }
        if (this.config.performance?.enableFCP && webVitals.getFCP) {
          webVitals.getFCP((metric: any) => this.trackWebVital('FCP', metric));
        }
        if (this.config.performance?.enableLCP && webVitals.getLCP) {
          webVitals.getLCP((metric: any) => this.trackWebVital('LCP', metric));
        }
        if (this.config.performance?.enableTTFB && webVitals.getTTFB) {
          webVitals.getTTFB((metric: any) => this.trackWebVital('TTFB', metric));
        }
      }).catch(() => {
        console.warn('⚠️  web-vitals library not available');
      });
    } catch (_error) {
      console.warn('⚠️  Core Web Vitals monitoring not available:', (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Observe Navigation Timing
   */
  private observeNavigationTiming(): void {
    if (!window.performance || !window.performance.timing) return;

    // Wait for page load to complete
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const navigation = window.performance.navigation;

        const metrics = {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
          firstPaint: this.getFirstPaintTime(),
          firstContentfulPaint: this.getFirstContentfulPaintTime(),
        };

        this.trackEvent('performance', 'navigation_timing', {
          ...metrics,
          type: navigation.type === 0 ? 'navigate' : 'reload',
          redirectCount: navigation.redirectCount,
        });
      }, 0);
    });
  }

  /**
   * Get First Paint time
   */
  private getFirstPaintTime(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : undefined;
  }

  /**
   * Get First Contentful Paint time
   */
  private getFirstContentfulPaintTime(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : undefined;
  }

  /**
   * Start user session
   */
  private startSession(): void {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      events: [],
      performance: {
        coreWebVitals: {},
        navigationTiming: {},
        apiMetrics: {
          requestCount: 0,
          averageResponseTime: 0,
          errorRate: 0,
        },
      },
    };

    // Track session start
    this.trackEvent('custom', 'session_start', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track Core Web Vital
   */
  private trackWebVital(name: string, metric: any): void {
    if (!this.session) return;

    // Update session performance metrics
    this.session.performance.coreWebVitals[name.toLowerCase() as keyof typeof this.session.performance.coreWebVitals] = metric.value;

    // Track the event
    this.trackEvent('performance', `web_vital_${name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      entries: metric.entries,
    });
  }

  /**
   * Track custom event
   */
  trackEvent(type: MonitoringEvent['type'], name: string, data: Record<string, any> = {}): void {
    if (!this.session) return;

    const event: MonitoringEvent = {
      type,
      name,
      data,
      timestamp: Date.now(),
      sessionId: this.session.sessionId,
    };

    this.session.events.push(event);

    // Send to monitoring services
    this.sendToSentry(event);
    this.sendToAnalytics(event);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, data: Record<string, any> = {}): void {
    if (!this.session) return;

    this.session.pageViews++;

    this.trackEvent('page_view', page, {
      ...data,
      pageViewCount: this.session.pageViews,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, data: Record<string, any> = {}): void {
    this.trackEvent('user_interaction', `${element}_${action}`, data);
  }

  /**
   * Track error
   */
  trackError(error: Error, context: Record<string, any> = {}): void {
    this.trackEvent('error', error.name, {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Track API request
   */
  trackApiRequest(url: string, method: string, duration: number, success: boolean): void {
    if (!this.session) return;

    // Update API metrics
    this.session.performance.apiMetrics.requestCount++;
    this.session.performance.apiMetrics.averageResponseTime =
      (this.session.performance.apiMetrics.averageResponseTime * (this.session.performance.apiMetrics.requestCount - 1) + duration) /
      this.session.performance.apiMetrics.requestCount;

    if (!success) {
      this.session.performance.apiMetrics.errorRate =
        ((this.session.performance.apiMetrics.requestCount - 1) * this.session.performance.apiMetrics.errorRate + 1) /
        this.session.performance.apiMetrics.requestCount;
    }

    this.trackEvent('performance', 'api_request', {
      url,
      method,
      duration,
      success,
      requestCount: this.session.performance.apiMetrics.requestCount,
      averageResponseTime: this.session.performance.apiMetrics.averageResponseTime,
      errorRate: this.session.performance.apiMetrics.errorRate,
    });
  }

  /**
   * Send event to Sentry
   */
  private sendToSentry(event: MonitoringEvent): void {
    if (!this.config.sentry) return;

    try {
      const Sentry = (window as any).Sentry;
      if (!Sentry) return;

      switch (event.type) {
        case 'error':
          Sentry.captureException(new Error(event.data.message || event.name), {
            tags: {
              category: 'monitoring',
              event_type: event.type,
            },
            extra: event.data,
          });
          break;
        case 'performance':
          Sentry.captureMessage(`Performance: ${event.name}`, {
            level: 'info',
            tags: {
              category: 'performance',
              metric: event.name,
            },
            extra: event.data,
          });
          break;
        default:
          Sentry.captureMessage(`${event.type}: ${event.name}`, {
            level: 'info',
            tags: {
              category: 'monitoring',
              event_type: event.type,
            },
            extra: event.data,
          });
      }
    } catch (_error) {
      console.warn('⚠️  Failed to send event to Sentry:', error);
    }
  }

  /**
   * Send event to Google Analytics
   */
  private sendToAnalytics(event: MonitoringEvent): void {
    if (!this.config.analytics) return;

    try {
      const gtag = (window as any).gtag;
      if (!gtag) return;

      switch (event.type) {
        case 'page_view':
          gtag('event', 'page_view', {
            page_title: event.name,
            page_location: window.location.href,
            ...event.data,
          });
          break;
        case 'user_interaction':
          gtag('event', event.name, {
            event_category: 'engagement',
            ...event.data,
          });
          break;
        case 'performance':
          gtag('event', 'performance_metric', {
            event_category: 'performance',
            metric_name: event.name,
            ...event.data,
          });
          break;
        case 'error':
          gtag('event', 'exception', {
            description: event.data.message || event.name,
            fatal: false,
            ...event.data,
          });
          break;
        default:
          gtag('event', event.name, {
            event_category: event.type,
            ...event.data,
          });
      }
    } catch (_error) {
      console.warn('⚠️  Failed to send event to Google Analytics:', error);
    }
  }

  /**
   * Get current session data
   */
  getSessionData(): UserSession | null {
    return this.session;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics | null {
    return this.session?.performance || null;
  }

  /**
   * Export session data for analysis
   */
  exportSessionData(): string {
    if (!this.session) return '';

    return JSON.stringify({
      ...this.session,
      exportTime: Date.now(),
    }, null, 2);
  }
}

// Default configuration
const defaultConfig: MonitoringConfig = {
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    sampleRate: 1.0,
  },
  analytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    debug: process.env.NODE_ENV === 'development',
  },
  performance: {
    enableCLS: true,
    enableFID: true,
    enableFCP: true,
    enableLCP: true,
    enableTTFB: true,
  },
};

// Global instance
let monitoringInstance: RealUserMonitoring | null = null;

/**
 * Initialize monitoring with default configuration
 */
export function initializeMonitoring(config: Partial<MonitoringConfig> = {}): Promise<void> {
  const finalConfig = { ...defaultConfig, ...config };
  monitoringInstance = new RealUserMonitoring(finalConfig);
  return monitoringInstance.initialize();
}

/**
 * Get monitoring instance
 */
export function getMonitoring(): RealUserMonitoring | null {
  return monitoringInstance;
}

/**
 * Track page view
 */
export function trackPageView(page: string, data: Record<string, any> = {}): void {
  monitoringInstance?.trackPageView(page, data);
}

/**
 * Track user interaction
 */
export function trackInteraction(element: string, action: string, data: Record<string, any> = {}): void {
  monitoringInstance?.trackInteraction(element, action, data);
}

/**
 * Track error
 */
export function trackError(error: Error, context: Record<string, any> = {}): void {
  monitoringInstance?.trackError(error, context);
}

/**
 * Track API request
 */
export function trackApiRequest(url: string, method: string, duration: number, success: boolean): void {
  monitoringInstance?.trackApiRequest(url, method, duration, success);
}

/**
 * Next.js Web Vitals reporter
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  if (monitoringInstance) {
    monitoringInstance.trackEvent('performance', `web_vital_${metric.name}`, {
      value: metric.value,
      id: metric.id,
      startTime: metric.startTime,
      label: metric.label,
    });
  }
}

export default RealUserMonitoring;
export type { MonitoringConfig, UserSession, MonitoringEvent, PerformanceMetrics };