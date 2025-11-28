import { logger } from "@/lib/logger";
/**
 * EdPsych Connect World - Intellectual Property Protection Layer
 * 
 * This module implements multiple layers of protection to safeguard
 * the proprietary algorithms, assessment frameworks, and business logic
 * that represent significant R&D investment.
 * 
 * Copyright © 2025 EdPsych Connect Limited. All Rights Reserved.
 * Company No: 14989115 | HCPC: PYL042340
 * 
 * CONFIDENTIAL AND PROPRIETARY
 * This code contains trade secrets and proprietary information.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================================================
// CODE OBFUSCATION & FINGERPRINTING
// ============================================================================

/**
 * Generate a unique fingerprint for tracking unauthorized usage
 */
export function generateInstanceFingerprint(): string {
  const components = [
    process.env.VERCEL_URL || 'local',
    process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    new Date().toISOString().split('T')[0],
  ];
  
  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 16);
}

/**
 * Watermark embedded in API responses for tracking
 */
export function embedWatermark(data: Record<string, unknown>): Record<string, unknown> {
  const watermark = {
    _meta: {
      provider: 'EdPsych Connect Limited',
      license: 'proprietary',
      instance: generateInstanceFingerprint(),
      timestamp: Date.now(),
    },
  };
  
  return { ...data, ...watermark };
}

// ============================================================================
// REQUEST VALIDATION & ANTI-SCRAPING
// ============================================================================

interface RequestValidationResult {
  valid: boolean;
  reason?: string;
  riskScore: number;
}

/**
 * Validate request origin and detect potential scraping attempts
 */
export function validateRequestOrigin(request: NextRequest): RequestValidationResult {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent') || '';
  
  let riskScore = 0;
  const reasons: string[] = [];
  
  // Check for missing headers (potential API scraping)
  if (!origin && !referer) {
    riskScore += 30;
    reasons.push('missing_origin');
  }
  
  // Check for known bot patterns
  const botPatterns = [
    /curl/i,
    /wget/i,
    /python-requests/i,
    /scrapy/i,
    /puppeteer/i,
    /headless/i,
    /phantom/i,
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    riskScore += 50;
    reasons.push('bot_detected');
  }
  
  // Check for empty user agent
  if (!userAgent || userAgent.length < 10) {
    riskScore += 40;
    reasons.push('suspicious_user_agent');
  }
  
  // Allowed origins
  const allowedOrigins = [
    'https://www.edpsychconnect.com',
    'https://edpsychconnect.com',
    'https://edpsych-connect-limited.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    riskScore += 60;
    reasons.push('unauthorized_origin');
  }
  
  return {
    valid: riskScore < 50,
    reason: reasons.join(', '),
    riskScore,
  };
}

// ============================================================================
// API RESPONSE PROTECTION
// ============================================================================

/**
 * Protect sensitive API responses from bulk extraction
 */
export function protectApiResponse(
  data: unknown,
  options: {
    addWatermark?: boolean;
    rateLimit?: boolean;
    obfuscate?: boolean;
  } = {}
): unknown {
  const { addWatermark = true, obfuscate = false } = options;
  
  let result = data;
  
  // Add ownership watermark
  if (addWatermark && typeof data === 'object' && data !== null) {
    result = embedWatermark(data as Record<string, unknown>);
  }
  
  // Obfuscate sensitive field names (for highly proprietary data)
  if (obfuscate && typeof result === 'object' && result !== null) {
    result = obfuscateFields(result as Record<string, unknown>);
  }
  
  return result;
}

/**
 * Obfuscate sensitive field names to prevent easy replication
 */
function obfuscateFields(obj: Record<string, unknown>): Record<string, unknown> {
  // This is a placeholder - in production, you'd use a consistent
  // obfuscation mapping that your frontend knows how to decode
  return obj;
}

// ============================================================================
// LICENSE VALIDATION
// ============================================================================

interface LicenseInfo {
  valid: boolean;
  type: 'beta' | 'trial' | 'standard' | 'enterprise' | 'invalid';
  expiresAt?: Date;
  features: string[];
  maxUsers?: number;
}

/**
 * Validate deployment license
 */
export function validateLicense(): LicenseInfo {
  const licenseKey = process.env.EDPSYCH_LICENSE_KEY;
  
  // Beta period - all features enabled
  if (!licenseKey || licenseKey === 'BETA_2025') {
    return {
      valid: true,
      type: 'beta',
      expiresAt: new Date('2025-12-31'),
      features: ['all'],
      maxUsers: 1000,
    };
  }
  
  // In production, this would validate against a license server
  return {
    valid: true,
    type: 'standard',
    features: ['core', 'assessments', 'reports'],
  };
}

// ============================================================================
// DEPLOYMENT VERIFICATION
// ============================================================================

/**
 * Verify this is an authorized deployment
 */
export function verifyDeployment(): boolean {
  const authorizedDomains = [
    'edpsychconnect.com',
    'www.edpsychconnect.com',
    'edpsych-connect-limited.vercel.app',
    'localhost',
  ];
  
  const currentDomain = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL || 'localhost';
  
  return authorizedDomains.some(domain => currentDomain.includes(domain));
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Add security headers to protect against various attacks
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
    'X-Powered-By': 'EdPsych Connect Limited',
    'X-Copyright': '© 2025 EdPsych Connect Limited. All Rights Reserved.',
  };
}

// ============================================================================
// AUDIT TRAIL FOR IP VIOLATIONS
// ============================================================================

interface IPViolationLog {
  timestamp: Date;
  type: 'scraping_attempt' | 'unauthorized_access' | 'license_violation' | 'rate_limit_exceeded';
  ipAddress: string;
  userAgent: string;
  path: string;
  details: Record<string, unknown>;
}

const violationLogs: IPViolationLog[] = [];

/**
 * Log potential IP violation for legal evidence
 */
export function logIPViolation(
  request: NextRequest,
  type: IPViolationLog['type'],
  details: Record<string, unknown> = {}
): void {
  const violation: IPViolationLog = {
    timestamp: new Date(),
    type,
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    path: request.nextUrl.pathname,
    details,
  };
  
  violationLogs.push(violation);
  
  // In production, this would send to a secure logging service
  console.warn('🚨 IP Violation Detected:', JSON.stringify(violation));
}

/**
 * Get violation logs (admin only)
 */
export function getViolationLogs(): IPViolationLog[] {
  return [...violationLogs];
}

// ============================================================================
// EXPORT PROTECTION MIDDLEWARE
// ============================================================================

/**
 * Middleware to protect API routes
 */
export function withIPProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Verify deployment
    if (!verifyDeployment()) {
      logIPViolation(request, 'license_violation', {
        reason: 'unauthorized_deployment',
      });
      return NextResponse.json(
        { error: 'Unauthorized deployment detected' },
        { status: 403 }
      );
    }
    
    // Validate request origin
    const validation = validateRequestOrigin(request);
    if (!validation.valid) {
      logIPViolation(request, 'scraping_attempt', {
        riskScore: validation.riskScore,
        reason: validation.reason,
      });
      
      // Don't immediately block - just log and add delay
      await new Promise(resolve => setTimeout(resolve, validation.riskScore * 10));
    }
    
    // Execute handler
    const response = await handler(request);
    
    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  };
}
