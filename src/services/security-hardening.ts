import { logger } from "@/lib/logger";
/**
 * Security Hardening Service
 * Comprehensive security implementation for production deployment
 */

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Cross-Origin-Embedder-Policy'?: string;
  'Cross-Origin-Opener-Policy'?: string;
  'Cross-Origin-Resource-Policy'?: string;
}

export interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableFrameOptions: boolean;
  enableContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  enableCORP: boolean;
  enableCOEP: boolean;
  enableCOOP: boolean;
  cspDirectives: Record<string, string[]>;
  allowedFrameDomains: string[];
  allowedImageDomains: string[];
  allowedScriptDomains: string[];
  allowedStyleDomains: string[];
  allowedFontDomains: string[];
  allowedConnectDomains: string[];
}

export interface SecurityAudit {
  timestamp: Date;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityVulnerability {
  id: string;
  type: 'xss' | 'csrf' | 'injection' | 'auth' | 'headers' | 'config' | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  impact: string;
  remediation: string;
  cwe?: string;
}

export class SecurityHardeningService {
  private static instance: SecurityHardeningService;

  private config: SecurityConfig = {
    enableCSP: true,
    enableHSTS: true,
    enableFrameOptions: true,
    enableContentTypeOptions: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true,
    enableCORP: true,
    enableCOEP: true,
    enableCOOP: true,
    cspDirectives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://trusted.cdn.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': ["'self'", 'https://api.example.com'],
      'frame-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    },
    allowedFrameDomains: [],
    allowedImageDomains: ['https:'],
    allowedScriptDomains: ["'self'", 'https://trusted.cdn.com'],
    allowedStyleDomains: ["'self'", 'https://fonts.googleapis.com'],
    allowedFontDomains: ["'self'", 'https://fonts.gstatic.com'],
    allowedConnectDomains: ["'self'", 'https://api.example.com']
  };

  private vulnerabilities: SecurityVulnerability[] = [];

  private constructor() {
    this.initializeSecurityHeaders();
    this.performInitialAudit();
  }

  static getInstance(): SecurityHardeningService {
    if (!SecurityHardeningService.instance) {
      SecurityHardeningService.instance = new SecurityHardeningService();
    }
    return SecurityHardeningService.instance;
  }

  /**
   * Generate security headers for HTTP responses
   */
  generateSecurityHeaders(): SecurityHeaders {
    const headers: SecurityHeaders = {};

    if (this.config.enableCSP) {
      headers['Content-Security-Policy'] = this.buildCSPHeader();
    }

    if (this.config.enableHSTS) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    if (this.config.enableFrameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    if (this.config.enableContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    if (this.config.enableReferrerPolicy) {
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    if (this.config.enablePermissionsPolicy) {
      headers['Permissions-Policy'] = this.buildPermissionsPolicy();
    }

    if (this.config.enableCORP) {
      headers['Cross-Origin-Resource-Policy'] = 'same-origin';
    }

    if (this.config.enableCOEP) {
      headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    }

    if (this.config.enableCOOP) {
      headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    }

    return headers;
  }

  /**
   * Build Content Security Policy header
   */
  private buildCSPHeader(): string {
    const directives = Object.entries(this.config.cspDirectives)
      .map(([directive, values]) => `${directive} ${values.join(' ')}`)
      .join('; ');

    return directives + ';';
  }

  /**
   * Build Permissions Policy header
   */
  private buildPermissionsPolicy(): string {
    const permissions = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'encrypted-media=()',
      'fullscreen=()',
      'picture-in-picture=()'
    ];

    return permissions.join(', ');
  }

  /**
   * Initialize security headers in Next.js
   */
  initializeSecurityHeaders(): void {
    // This would be called in _document.tsx or middleware.ts
    const headers = this.generateSecurityHeaders();

    // Log security headers for debugging
    logger.info('Security headers initialized:', headers);
  }

  /**
   * Perform security audit
   */
  async performSecurityAudit(): Promise<SecurityAudit> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const recommendations: string[] = [];

    // Check for common vulnerabilities
    vulnerabilities.push(...this.checkCommonVulnerabilities());
    recommendations.push(...this.generateSecurityRecommendations());

    const score = this.calculateSecurityScore(vulnerabilities);
    const riskLevel = this.determineRiskLevel(vulnerabilities);

    const audit: SecurityAudit = {
      timestamp: new Date(),
      vulnerabilities,
      recommendations,
      score,
      riskLevel
    };

    // Store vulnerabilities for tracking
    this.vulnerabilities = vulnerabilities;

    // Log audit results
    logger.info('Security audit completed:', {
      score,
      riskLevel,
      vulnerabilityCount: vulnerabilities.length
    });

    return audit;
  }

  /**
   * Check for common security vulnerabilities
   */
  private checkCommonVulnerabilities(): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check CSP configuration
    if (!this.config.enableCSP) {
      vulnerabilities.push({
        id: 'CSP-001',
        type: 'headers',
        severity: 'high',
        description: 'Content Security Policy is disabled',
        location: 'Security Configuration',
        impact: 'Vulnerable to XSS attacks',
        remediation: 'Enable CSP with appropriate directives',
        cwe: 'CWE-79'
      });
    }

    // Check HSTS configuration
    if (!this.config.enableHSTS) {
      vulnerabilities.push({
        id: 'HSTS-001',
        type: 'headers',
        severity: 'medium',
        description: 'HTTP Strict Transport Security is disabled',
        location: 'Security Configuration',
        impact: 'Vulnerable to protocol downgrade attacks',
        remediation: 'Enable HSTS with appropriate max-age',
        cwe: 'CWE-319'
      });
    }

    // Check for unsafe CSP directives
    const cspDirectives = this.config.cspDirectives;
    if (cspDirectives['script-src']?.includes("'unsafe-inline'")) {
      vulnerabilities.push({
        id: 'CSP-002',
        type: 'headers',
        severity: 'medium',
        description: 'CSP allows unsafe-inline scripts',
        location: 'CSP Configuration',
        impact: 'Potential XSS vulnerability',
        remediation: 'Remove unsafe-inline from script-src directive',
        cwe: 'CWE-79'
      });
    }

    if (cspDirectives['script-src']?.includes("'unsafe-eval'")) {
      vulnerabilities.push({
        id: 'CSP-003',
        type: 'headers',
        severity: 'medium',
        description: 'CSP allows unsafe-eval',
        location: 'CSP Configuration',
        impact: 'Potential code injection vulnerability',
        remediation: 'Remove unsafe-eval from script-src directive',
        cwe: 'CWE-95'
      });
    }

    // Check frame options
    if (!this.config.enableFrameOptions) {
      vulnerabilities.push({
        id: 'FRAME-001',
        type: 'headers',
        severity: 'medium',
        description: 'X-Frame-Options header is disabled',
        location: 'Security Configuration',
        impact: 'Vulnerable to clickjacking attacks',
        remediation: 'Enable X-Frame-Options header',
        cwe: 'CWE-1021'
      });
    }

    return vulnerabilities;
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    recommendations.push('Implement Content Security Policy (CSP) with strict directives');
    recommendations.push('Enable HTTP Strict Transport Security (HSTS)');
    recommendations.push('Set secure cookie flags (HttpOnly, Secure, SameSite)');
    recommendations.push('Implement rate limiting for API endpoints');
    recommendations.push('Use HTTPS for all resources and external links');
    recommendations.push('Implement CSRF protection for state-changing operations');
    recommendations.push('Regularly update dependencies to patch known vulnerabilities');
    recommendations.push('Implement security headers middleware');
    recommendations.push('Use parameterized queries to prevent SQL injection');
    recommendations.push('Implement proper input validation and sanitization');
    recommendations.push('Set up security monitoring and alerting');
    recommendations.push('Conduct regular security audits and penetration testing');

    return recommendations;
  }

  /**
   * Calculate security score based on vulnerabilities
   */
  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    if (vulnerabilities.length === 0) return 100;

    const severityWeights = {
      critical: 25,
      high: 15,
      medium: 7,
      low: 3
    };

    const totalWeight = vulnerabilities.reduce((sum, vuln) => {
      return sum + severityWeights[vuln.severity];
    }, 0);

    const maxPossibleScore = 100;
    const score = Math.max(0, maxPossibleScore - totalWeight);

    return Math.round(score);
  }

  /**
   * Determine overall risk level
   */
  private determineRiskLevel(vulnerabilities: SecurityVulnerability[]): 'low' | 'medium' | 'high' | 'critical' {
    const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
    const hasHigh = vulnerabilities.some(v => v.severity === 'high');
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;

    if (hasCritical) return 'critical';
    if (hasHigh && highCount > 2) return 'high';
    if (hasHigh || mediumCount > 5) return 'medium';
    return 'low';
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };

    // Re-initialize headers with new config
    this.initializeSecurityHeaders();

    logger.info('Security configuration updated');
  }

  /**
   * Get current security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Get security vulnerabilities
   */
  getVulnerabilities(): SecurityVulnerability[] {
    return [...this.vulnerabilities];
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate and sanitize HTML content
   */
  sanitizeHTML(html: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Generate secure random tokens
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if running in secure context
   */
  isSecureContext(): boolean {
    return typeof window !== 'undefined' &&
           (window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1');
  }

  /**
   * Perform initial security audit
   */
  private async performInitialAudit(): Promise<void> {
    try {
      const audit = await this.performSecurityAudit();

      if (audit.riskLevel === 'critical' || audit.riskLevel === 'high') {
        logger.error('Critical security issues detected:', audit);
      } else if (audit.riskLevel === 'medium') {
        logger.warn('Security improvements recommended:', audit);
      } else {
        logger.info('Security audit completed successfully:', audit);
      }
    } catch (_error) {
      logger._error('Error performing initial security audit:', _error as Error);
    }
  }
}

// Export singleton instance
export const securityHardening = SecurityHardeningService.getInstance();