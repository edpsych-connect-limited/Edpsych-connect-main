# Next-intl Configuration Fix

## Problem
The Vercel deployment was failing with the error:
```
Error: Couldn't find next-intl config file. Please follow the instructions at https://next-intl.dev/docs/getting-started/app-router
```

## Root Cause
The `next.config.mjs` was using `createNextIntlPlugin('./src/i18n.ts')` with a custom path parameter. While this works in some environments, next-intl v4+ strongly prefers the default convention where config files are at:
- `./src/i18n/request.ts` (when using a `src` directory)
- `./i18n/request.ts` (when not using a `src` directory)

When using the default path, you call the plugin as `createNextIntlPlugin()` without any parameters.

## Solution
1. Created `src/i18n/request.ts` at the expected default location
2. Updated `next.config.mjs` to use `createNextIntlPlugin()` without path parameter
3. Added error handling for missing locale files with fallback to English

## File Structure
```
src/
├── i18n/
│   └── request.ts          # Next-intl request configuration (NEW)
├── i18n.ts                 # Legacy config (kept for compatibility)
├── navigation.ts           # Routing configuration
└── messages/
    ├── en.json             # English translations
    └── cy.json             # Welsh translations
```

## Configuration Files

### src/i18n/request.ts
This file exports a `getRequestConfig` function that:
- Resolves the locale from the request (using `requestLocale` parameter)
- Validates the locale against supported locales (`en`, `cy`)
- Loads the appropriate message file dynamically
- Includes error handling with fallback to English

### src/navigation.ts
This file defines:
- Supported locales: `['en', 'cy']`
- Default locale: `'en'`
- Locale prefix: `'always'` (URLs always include locale, e.g., `/en/dashboard`)
- Navigation helpers (Link, redirect, usePathname, useRouter)

## Testing
To test the configuration locally:
```bash
npm run build
```

The build should complete without "Couldn't find next-intl config file" errors.

## Vercel Deployment
On Vercel, the deployment will now:
1. Find the config file at the default location `src/i18n/request.ts`
2. Load translations for each locale
3. Apply locale routing to all pages under `app/[locale]/`

## References
- [Next-intl v4 Documentation](https://next-intl.dev/docs/getting-started/app-router)
- [Next-intl GitHub - Issue #1309](https://github.com/amannn/next-intl/issues/1309)
- [Stack Overflow - Fix for "Couldn't find next-intl config file"](https://stackoverflow.com/questions/79631566/)
