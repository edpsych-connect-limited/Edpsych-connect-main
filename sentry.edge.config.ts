import * as Sentry from "@sentry/nextjs";

// Skip Sentry initialization during Next.js build process
// Only initialize in runtime for edge functions
if (process.env.NEXT_PHASE === undefined) {
  Sentry.init({
    dsn: "https://1739f1ab3c214b6600646650f89e2643@o4509879738826752.ingest.de.sentry.io/4509879781883984",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
