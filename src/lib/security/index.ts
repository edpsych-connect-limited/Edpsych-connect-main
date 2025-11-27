/**
 * EdPsych Connect World - Security Module
 * 
 * Comprehensive security utilities for protecting the platform,
 * intellectual property, and user data.
 * 
 * @copyright EdPsych Connect Limited 2025
 */

// IP Protection - Anti-scraping, watermarking, license validation
export {
  withIPProtection,
  validateRequestOrigin,
  embedWatermark,
  getSecurityHeaders,
  logSecurityViolation,
  type SecurityViolation,
  type WatermarkData,
  type IPProtectionConfig,
} from './ip-protection';

// Legal Notice - Copyright, attribution, contact info
export {
  LEGAL_NOTICE,
  getCopyrightNotice,
  getLegalAttribution,
} from './legal-notice';

// Rate Limiting - From parent lib directory
export {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
  createRateLimitHeaders,
} from '../rate-limit';
