# Vendor/Subprocessor Audit (Internal)

Purpose: maintain an accurate **subprocessor register** and ensure contracts/DPAs match actual technical data flows.

Guiding principle: **Only assert what is evidenced.** Where facts depend on account configuration (region, data residency, SCC/IDTA, etc.), mark **TBD** and assign an action.

## What counts as a “vendor/subprocessor” here

Include any third party that may process:

- Personal data (incl. special category data about children)
- Authentication/session data
- Usage telemetry, logs, traces
- Payments/customer billing data
- Content (uploads, generated assets)

## Vendor register (evidence-backed)

Legend:

- **Status**: Active | Optional/Conditional | Disabled/Not in use | Legacy/Unconfirmed
- **Transfer mechanism**: UK IDTA / UK Addendum to SCCs / Adequacy / N/A / TBD

> NOTE: “Region(s)” must be confirmed in the vendor console (project settings) and contract/DPA.

| Vendor | Status | Purpose | Data categories (typical) | Region(s) | Transfer mechanism | Contract/DPA location | Security assurance (TBD ok) | Evidence pointers |
|---|---|---|---|---|---|---|---|---|
| Vercel | Active | Hosting + edge runtime for Next.js app and API routes | Account identifiers, session cookies, request metadata, application logs (may include user identifiers if logged) | TBD (often US by default) | TBD (IDTA/Addendum if non-UK) | TBD (procurement/contracts) | TBD (vendor attestation) | `src/lib/security/ip-protection.ts`; `src/BUILD_TRIGGER.ts`; `src/instrumentation.ts` (logging in Vercel dashboard); `src/app/[locale]/layout.tsx` (CSP includes `cdn.vercel-insights.com`) |
| Neon (PostgreSQL) | Active | Primary relational database backing Prisma | Platform application data stored in Postgres (may include special category data depending on feature usage) | TBD (project region) | TBD (depends on region) | TBD | TBD | `.env.example` (`DATABASE_URL`); `src/components/landing/legacy/NeonCommentSection.tsx` (`@neondatabase/serverless`) |
| Prisma (ORM/runtime library) | Active | Data access layer to Postgres | N/A (library), but mediates DB access | N/A | N/A | N/A | N/A | `src/lib/prisma.ts`; widespread `@prisma/client` imports |
| Stripe | Active | Payments + subscriptions + webhooks | Billing identifiers, customer email, payment metadata, subscription status; (payment card details handled by Stripe) | TBD (account config) | TBD | TBD | PCI DSS (Stripe) (confirm version) | `.env.example` (`STRIPE_SECRET_KEY`, publishable key); `src/lib/stripe.ts`; `src/app/api/webhooks/stripe/route.ts` |
| Twilio SendGrid (SMTP) | Active | Transactional email delivery | Recipient email, email contents (reset links, notifications) | TBD | TBD | TBD | TBD | `.env.example` (`SENDGRID_API_KEY`, SMTP host); `src/lib/email/email-service.ts` |
| Cloudinary | Active | Video storage/CDN delivery for training videos | Media assets; IP/device/network metadata from CDN delivery; (optional: upload metadata) | TBD (account config) | TBD | TBD | TBD | `.env.example` (`CLOUDINARY_*`); `src/lib/cloudinary.ts`; `src/lib/training/heygen-video-urls.ts` (Cloudinary URLs) |
| HeyGen | Optional/Conditional | AI video generation + streaming avatar API + embeds | If enabled: prompts/inputs for avatar generation; streaming session metadata; end-user IP/device via embed | TBD | TBD | TBD | TBD | `.env.example` (`HEYGEN_API_KEY`); `src/app/api/video/heygen-token/route.ts`; `src/app/api/video/heygen-url/route.ts`; `src/components/video/StreamingAvatar.tsx` |
| Upstash (Vercel KV) | Optional/Conditional | Edge-friendly Redis (HTTP) for caching/rate limiting | Cache keys/values (could include pseudonymous identifiers depending on usage) | TBD | TBD | TBD | TBD | `.env.example` (`KV_REST_API_URL/TOKEN`, `UPSTASH_REDIS_REST_*`); `src/cache/redis-client.ts`; `src/lib/ai-integration.ts` (Redis.fromEnv) |
| Redis (self-managed or provider) | Optional/Conditional | TCP Redis cache fallback if `REDIS_URL` provided | Cache keys/values | TBD | TBD | TBD | TBD | `.env.example` (`REDIS_URL`); `src/cache/redis-client.ts` |
| AWS (CloudWatch) | Optional/Conditional | Metrics + alarms (operational monitoring) | Operational metrics; may include aggregate usage metrics; avoid sending PII | `AWS_REGION` (default `eu-west-2`) | N/A if UK/EU; otherwise TBD | TBD | TBD | `.env.example` (`ENABLE_CLOUDWATCH`, AWS creds); `src/services/monitoring/cloudwatch-client.ts` |
| Sentry | Disabled/Not in use (currently) | Error monitoring (intended) | Error traces, stack traces, request metadata (potentially personal data if not scrubbed) | TBD | TBD | TBD | TBD | `src/instrumentation.ts` (disabled); `src/utils/monitoring.ts` (optional) |
| Anthropic (Claude) | Optional/Conditional | AI assistance (assessment support, content generation) | Prompts/context (risk of personal/special category data unless redacted) | TBD | TBD | TBD | TBD | `.env.example` (`CLAUDE_API_KEY`, `ENABLE_AI`); `src/lib/ai-integration.ts` (Anthropic SDK) |
| OpenAI | Optional/Conditional | AI assistance (OpenAI models) | Prompts/context (risk of personal/special category data unless redacted) | TBD | TBD | TBD | TBD | `.env.example` (`OPENAI_API_KEY`, `OPENAI_MODEL`, `ENABLE_AI`); `src/lib/ai-integration.ts` (OpenAI SDK) |
| Google (Gemini API via OpenAI-compatible base URL) | Optional/Conditional | AI assistance (Gemini) | Prompts/context (risk of personal/special category data unless redacted) | TBD | TBD | TBD | TBD | `.env.example` (`GEMINI_API_KEY`); `src/lib/ai-integration.ts` (baseURL `generativelanguage.googleapis.com`) |
| xAI | Optional/Conditional | AI assistance (xAI) | Prompts/context (risk of personal/special category data unless redacted) | TBD | TBD | TBD | TBD | `.env.example` (`XAI_API_KEY`); `src/lib/ai-integration.ts` (baseURL `api.x.ai`) |
| Google Analytics | Optional/Conditional | Web analytics (if enabled) | Online identifiers, usage telemetry | TBD | TBD | TBD | TBD | `.env.example` (`NEXT_PUBLIC_GA_MEASUREMENT_ID`); `src/app/[locale]/layout.tsx` (CSP allows `cdn.vercel-insights.com` and connects to Vercel endpoints) |
| MongoDB (provider TBD) | Legacy/Unconfirmed | Referenced by secrets manager + Mongoose models; not proven connected at runtime in this repo | Would include application data stored in MongoDB if enabled | TBD | TBD | TBD | TBD | `src/lib/secrets-manager-real.ts` (Mongo creds); `src/payment/models/*.ts` (Mongoose models) |

## Immediate audit actions (to turn TBDs into evidence)

1. **Confirm hosting regions** (Vercel project settings) and record the region(s) and data residency options in use.
2. **Confirm database region** (Neon project region) and whether any read replicas exist.
3. For each active vendor, attach:
	- The signed DPA (or link in contract system)
	- Subprocessor list (if vendor provides one)
	- Transfer mechanism evidence (IDTA/Addendum/adequacy)
4. Validate “optional/conditional” vendors:
	- If not used in production, remove from privacy disclosures and/or disable at build/runtime.
	- If used, ensure DPAs exist and disclosures match reality.

Last updated: 2025-12-15
