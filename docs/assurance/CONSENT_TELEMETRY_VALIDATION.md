# Consent and Telemetry Validation

Status key: [ ] pending, [~] in progress, [x] done

Owner: Project Lead (Codex)
Last updated: 2026-01-25

## Consent controls
- [x] Cookie consent context and storage
  - Evidence: `src/contexts/CookieConsentContext.tsx`, `src/utils/cookies.ts`
- [x] Consent UI and settings management
  - Evidence: `src/components/privacy/CookieBanner.tsx`, `src/components/privacy/CookieSettings.tsx`, `src/components/providers/CookieConsentProvider.tsx`, `src/app/[locale]/settings/page.tsx`
- [x] GDPR consent handling and audit logging
  - Evidence: `src/middleware/gdpr-compliance.ts`, `src/lib/gdpr-compliance.ts`

## Telemetry gating
- [x] Analytics initialized only when consent is granted
  - Evidence: `src/components/providers/CookieConsentClientWrapper.tsx`, `src/components/AnalyticsScript.tsx`
- [x] Consent-aware telemetry hooks for core workflows
  - Evidence: `src/lib/analytics/evidence-telemetry.ts`, `src/lib/analytics/AnalyticsProvider.tsx`

## Validation notes
- Cookie consent data stored under `edpsych_cookie_consent`.
- Analytics/marketing trackers require explicit consent before initialization.
