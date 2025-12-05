/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// DISABLED: Sentry client instrumentation causes "self is not defined" during build
// The Sentry SDK tries to access browser globals during server-side build/SSR
// This file is kept for reference but not imported.
// 
// Sentry initialization should happen lazily via error boundary components only,
// NOT at module load time.
//
// To re-enable, set up Sentry in app/[locale]/error.tsx and app/global-error.tsx
// only, with proper dynamic imports wrapped in client components.
