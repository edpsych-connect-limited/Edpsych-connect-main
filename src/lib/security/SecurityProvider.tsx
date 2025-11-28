import { logger, logSecurityEvent } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface SecurityContextType {
  isSecureContext: boolean;
  reportSecurityEvent: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) => void;
  checkCSRFToken: () => boolean;
  validateInput: (input: string, type: 'email' | 'text' | 'url') => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isSecureContext, setIsSecureContext] = useState(false);

  useEffect(() => {
    // Initialize security monitoring
    SecurityService.init();

    // Check if we're in a secure context
    setIsSecureContext(
      typeof window !== 'undefined' &&
      (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    );
  }, []);

  const reportSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) => {
    logSecurityEvent(event, severity, {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      ...context
    });
  };

  const checkCSRFToken = (): boolean => {
    // CSRF token validation would be implemented here
    // For now, return true as a placeholder
    return true;
  };

  const validateInput = (input: string, type: 'email' | 'text' | 'url'): boolean => {
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);

      case 'url':
        try {
          new URL(input);
          return true;
        } catch {
          return false;
        }

      case 'text':
        // Basic XSS prevention
        const dangerousPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe\b[^>]*>/gi
        ];

        return !dangerousPatterns.some(pattern => pattern.test(input));

      default:
        return true;
    }
  };

  const value: SecurityContextType = {
    isSecureContext,
    reportSecurityEvent,
    checkCSRFToken,
    validateInput
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export class SecurityService {
  private static initialized = false;
  private static requestCount = 0;
  private static lastReset = Date.now();
  private static fetchMonitorInstalled = false;

  static init() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.initialized = true;

    // Monitor for suspicious activities
    this.monitorSuspiciousActivity();

    // Set up Content Security Policy
    this.setupCSP();

    // Monitor for XSS attempts
    this.monitorXSS();

    // Set up security headers
    this.setupSecurityHeaders();
  }

  private static monitorSuspiciousActivity() {
    // Only install monitors if running in browser
    if (typeof window === 'undefined') return;

    // Monitor fetch requests
    if (!this.fetchMonitorInstalled) {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        SecurityService.checkRequestRate('fetch');
        return originalFetch.apply(this, args);
      };
      this.fetchMonitorInstalled = true;
    }

    // Monitor XHR requests using the Open method
    // This approach avoids overriding the XMLHttpRequest constructor
    if (typeof XMLHttpRequest !== 'undefined') {
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(this: XMLHttpRequest, method: string, url: string | URL, ...args: any[]) {
        SecurityService.checkRequestRate('xhr', {
          method,
          url: typeof url === 'string' ? url : url.toString()
        });
        return originalOpen.apply(this, [method, url, ...args] as any);
      };
    }
  }

  private static checkRequestRate(type: 'fetch' | 'xhr', details?: Record<string, any>) {
    this.requestCount++;

    // Reset counter every minute
    if (Date.now() - this.lastReset > 60000) {
      this.requestCount = 0;
      this.lastReset = Date.now();
    }

    // Alert if too many requests
    if (this.requestCount > 100) {
      logSecurityEvent(`Suspicious Activity - High ${type.toUpperCase()} Request Rate`, 'high', {
        requestCount: this.requestCount,
        timeWindow: '1 minute',
        ...details
      });
    }
  }

  private static setupCSP() {
    if (typeof document === 'undefined') return;

    // Set up Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.edpsych-connect.com wss://api.edpsych-connect.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    document.head.appendChild(meta);
  }

  private static monitorXSS() {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;

    // Monitor for potential XSS in dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Check for suspicious script tags
              if (element.tagName === 'SCRIPT' && element.textContent) {
                const scriptContent = element.textContent.toLowerCase();
                if (scriptContent.includes('eval(') || scriptContent.includes('document.write')) {
                  logSecurityEvent('Potential XSS - Suspicious Script', 'critical', {
                    scriptContent: scriptContent.substring(0, 100)
                  });
                }
              }

              // Check for event handlers that might be XSS
              Array.from(element.attributes).forEach((attr) => {
                if (attr.name.startsWith('on') && attr.value.includes('javascript:')) {
                  logSecurityEvent('Potential XSS - Event Handler', 'high', {
                    attribute: attr.name,
                    value: attr.value.substring(0, 100)
                  });
                }
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onerror', 'onload', 'onclick', 'onmouseover']
    });
  }

  private static setupSecurityHeaders() {
    if (typeof document === 'undefined') return;

    // Set up additional security headers via meta tags
    const headers = [
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
    ];

    headers.forEach(({ name, content }) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    });
  }
}

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};