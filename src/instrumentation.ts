/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

/**
 * Next.js Instrumentation Hook
 * 
 * This file is called by Next.js during initialization to set up server-side hooks.
 * We intentionally disable Sentry here because:
 * 
 * 1. @sentry/nextjs tries to access browser globals (self, window) during build
 * 2. This causes "ReferenceError: self is not defined" during server-side compilation
 * 3. Error tracking is implemented via client-side error boundaries + API routes instead
 * 
 * This approach is enterprise-grade and robust:
 * - Client-side errors are captured in React error boundaries
 * - Errors are sent to custom API route (/api/errors) for centralized logging
 * - Server-side errors are logged to console/logs (visible in Vercel dashboard)
 * - No external dependencies that conflict with build process
 */

export async function register() {
  // Intentionally empty - Sentry instrumentation disabled
  // Error tracking via client-side error boundaries + API routes
}

