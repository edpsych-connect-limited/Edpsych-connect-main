// COMPLETELY DISABLED: Sentry SDK causes "self is not defined" during Next.js build
// The @sentry/nextjs package has dependencies that try to access browser globals
// during server-side compilation, breaking the build process.
//
// To re-enable Sentry error tracking post-launch:
// 1. Use @sentry/nextjs with proper dynamic imports in error boundaries only
// 2. OR implement Sentry via API route that doesn't get bundled into server build
// 3. Ensure SENTRY_ENABLED=false during build, true only at runtime
//
// Current approach: Completely disable to unblock production deployment

// import * as Sentry from "@sentry/nextjs";
// 
// // Only initialize Sentry if explicitly enabled via environment variable
// // This prevents SDK loading errors during build
// const shouldInitSentry = process.env.SENTRY_ENABLED === 'true';
// 
// if (shouldInitSentry) {
//   Sentry.init({
//     dsn: "https://1739f1ab3c214b6600646650f89e2643@o4509879738826752.ingest.de.sentry.io/4509879781883984",
// 
//     // Adjust this value in production, or use tracesSampler for greater control
//     tracesSampleRate: 1,
// 
//     // Setting this option to true will print useful information to the console while you're setting up Sentry.
//     debug: false,
//   });
// }
