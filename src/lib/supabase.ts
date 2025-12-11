/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// EdPsych Connect World - Supabase Client Configuration
// DEPRECATED: This file is no longer used
// Updated: Neon Postgres Integration
// Environment: PRODUCTION
// Compliance: GDPR, ISO 27001, SOC 2

/**
 * ⚠️  DEPRECATED: This Supabase client is NOT used in production
 *
 * The EdPsych Connect World platform uses Neon Postgres, not Supabase.
 * This file is kept for reference only.
 *
 * Current Database Setup:
 * - Neon Postgres (primary database)
 * - Redis (caching and session management)
 *
 * See: apps/web/src/lib/auth.ts for the current authentication implementation
 */

// This file is intentionally left empty to prevent accidental usage
// All authentication is handled through Railway Postgres in auth.ts

console.warn('⚠️  WARNING: supabase.ts is deprecated. Use Railway Postgres instead.');
