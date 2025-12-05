/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// COMPLETELY DISABLED: Instrumentation causes "self is not defined" during build
// The Sentry SDK in sentry.server.config.ts has dependencies that reference browser globals
// during the build process, causing the build to fail.
//
// Error tracking will be re-enabled post-launch with proper build infrastructure.
// 
// export async function register() {
//   if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_ENABLED === 'true') {
//     try {
//       await import('../sentry.server.config');
//     } catch (error) {
//       console.debug('Sentry initialization failed, continuing without error tracking');
//     }
//   }
// }
