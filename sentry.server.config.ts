import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1739f1ab3c214b6600646650f89e2643@o4509879738826752.ingest.de.sentry.io/4509879781883984",

  // Reduced trace sample rate for production performance
  // 10% of transactions will be traced (was 100%)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
