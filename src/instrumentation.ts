/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

export async function register() {
  // Only initialize Sentry in Node.js runtime, NOT during build
  // process.env.NEXT_RUNTIME is 'nodejs' for server/build context
  // Check for Node.js explicitly and avoid loading in build context
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'development') {
    try {
      // Defer Sentry initialization to avoid blocking build
      if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { default: initSentry } = await import('../sentry.server.config');
        // Server config initializes Sentry if DSN is present
      }
    } catch (error) {
      // Sentry initialization is not critical - log and continue
      console.debug('Sentry initialization deferred or skipped');
    }
  }
}
