/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

export async function register() {
  // Sentry initialization is controlled via SENTRY_ENABLED environment variable
  // This prevents initialization during Next.js build which causes "self is not defined"
  // 
  // In production environment (Vercel), set SENTRY_ENABLED=true to activate error tracking
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_ENABLED === 'true') {
    try {
      await import('../sentry.server.config');
    } catch (error) {
      console.debug('Sentry initialization failed, continuing without error tracking');
    }
  }
}
