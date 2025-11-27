/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { logPerformance } from '../lib/logger';

interface PerformanceMonitorProps {
  children: ReactNode;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  const renderStartTime = useRef<number>(0);
  const componentMountTime = useRef<number>(0);

  useEffect(() => {
    // Initialize performance monitoring
    PerformanceMonitorService.init();

    // Track component mount time
    componentMountTime.current = performance.now();

    return () => {
      // Track component unmount time
      const unmountTime = performance.now();
      const totalTime = unmountTime - componentMountTime.current;

      logPerformance('Component Lifecycle', totalTime, {
        component: 'PerformanceMonitor',
        action: 'unmount'
      });
    };
  }, []);

  useEffect(() => {
    // Track render performance
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    if (renderTime > 16) { // More than one frame (16ms)
      logPerformance('Slow Render', renderTime, {
        component: 'PerformanceMonitor',
        threshold: '16ms'
      });
    }

    renderStartTime.current = performance.now();
  });

  return <>{children}</>;
};

export class PerformanceMonitorService {
  private static initialized = false;
  private static observer: PerformanceObserver | null = null;

  static init() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.initialized = true;

    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          logPerformance('Largest Contentful Paint', lastEntry.startTime, {
            element: (lastEntry as any).element?.tagName || 'unknown'
          });
        });

        this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Monitor First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            logPerformance('First Input Delay', entry.processingStart - entry.startTime, {
              inputType: entry.name
            });
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID PerformanceObserver not supported:', error);
      }
    }

    // Monitor Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;

      try {
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          logPerformance('Cumulative Layout Shift', clsValue, {
            final: entries.length === 0
          });
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS PerformanceObserver not supported:', error);
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        logPerformance('Memory Usage', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });

        // Check again in 30 seconds
        setTimeout(checkMemory, 30000);
      };

      checkMemory();
    }

    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          logPerformance('Page Load Time', navigation.loadEventEnd - navigation.fetchStart, {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstByte: navigation.responseStart - navigation.fetchStart
          });
        }
      }, 0);
    });
  }

  static destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.initialized = false;
  }
}