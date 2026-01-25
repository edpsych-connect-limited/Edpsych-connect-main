/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '';
const enabled = Boolean(dsn) && (process.env.SENTRY_ENABLED ? process.env.SENTRY_ENABLED === 'true' : true);
const rawSampleRate = process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1';
const tracesSampleRate = Number(rawSampleRate);
const environment = process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV;

Sentry.init({
  dsn,
  environment,
  enabled,
  tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
});
