import { logger as _logger, logUserAction } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { ReactNode, createContext, useContext, useEffect } from 'react';

interface AnalyticsContextType {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string, properties?: Record<string, any>) => void;
  trackUserAction: (action: string, properties?: Record<string, any>) => void;
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize analytics
    AnalyticsTracker.init();
  }, []);

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    // Track custom events
    logUserAction(`Event: ${event}`, undefined, {
      event,
      properties,
      timestamp: new Date().toISOString()
    });
  };

  const trackPageView = (page: string, properties?: Record<string, any>) => {
    // Track page views
    logUserAction(`Page View: ${page}`, undefined, {
      page,
      properties,
      timestamp: new Date().toISOString(),
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });
  };

  const trackUserAction = (action: string, properties?: Record<string, any>) => {
    // Track user actions
    logUserAction(action, undefined, {
      action,
      properties,
      timestamp: new Date().toISOString()
    });
  };

  const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) => {
    // Track performance metrics
    logUserAction(`Performance: ${metric}`, undefined, {
      metric,
      value,
      properties,
      timestamp: new Date().toISOString()
    });
  };

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackPerformance
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export class AnalyticsTracker {
  private static initialized = false;
  private static sessionId: string;

  static init() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.initialized = true;
    this.sessionId = this.generateSessionId();

    // Track session start
    this.trackSessionStart();

    // Set up automatic page view tracking
    this.setupPageTracking();

    // Set up error tracking
    this.setupErrorTracking();

    // Set up performance tracking
    this.setupPerformanceTracking();

    // Set up user interaction tracking
    this.setupInteractionTracking();
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static trackSessionStart() {
    logUserAction('Session Started', undefined, {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  private static setupPageTracking() {
    // Track initial page load
    this.trackPageView(window.location.pathname);

    // Track page changes (for SPA)
    let currentPage = window.location.pathname;

    const observer = new MutationObserver(() => {
      const newPage = window.location.pathname;
      if (newPage !== currentPage) {
        currentPage = newPage;
        this.trackPageView(newPage);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Track browser navigation
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });
  }

  private static setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      logUserAction('JavaScript Error', undefined, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logUserAction('Unhandled Promise Rejection', undefined, {
        reason: event.reason?.toString(),
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });
    });
  }

  private static setupPerformanceTracking() {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          logUserAction('LCP Measured', undefined, {
            value: lastEntry.startTime,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
          });
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (_error) {
        console.warn('LCP tracking not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            logUserAction('FID Measured', undefined, {
              value: entry.processingStart - entry.startTime,
              inputType: entry.name,
              sessionId: this.sessionId,
              timestamp: new Date().toISOString()
            });
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (_error) {
        console.warn('FID tracking not supported:', error);
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          logUserAction('CLS Measured', undefined, {
            value: clsValue,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
          });
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (_error) {
        console.warn('CLS tracking not supported:', error);
      }
    }
  }

  private static setupInteractionTracking() {
    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button') as HTMLButtonElement;

        logUserAction('Button Clicked', undefined, {
          buttonText: button.textContent?.trim() || button.getAttribute('aria-label') || 'Unknown',
          buttonId: button.id || button.getAttribute('data-testid') || 'Unknown',
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;

      logUserAction('Form Submitted', undefined, {
        formId: form.id || form.getAttribute('data-testid') || 'Unknown',
        formAction: form.action,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });
    });

    // Track link clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;

      if (link && link.href) {
        logUserAction('Link Clicked', undefined, {
          linkText: link.textContent?.trim() || 'Unknown',
          linkHref: link.href,
          isExternal: link.hostname !== window.location.hostname,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  private static trackPageView(page: string) {
    logUserAction(`Page View: ${page}`, undefined, {
      page,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};