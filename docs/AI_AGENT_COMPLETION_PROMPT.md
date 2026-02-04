# AI Agent Task Completion Prompt

## Overview
This document provides detailed instructions for an AI agent to complete the remaining verification and deployment tasks for the next-intl configuration fix that was implemented to resolve Vercel deployment failures.

---

## STEP 1: Clone the Repository

**IMPORTANT**: You will need to clone the repository to your local desktop/workspace first.

```bash
# Clone the repository
git clone https://github.com/edpsych-connect-limited/Edpsych-connect-main.git

# Navigate to the repository
cd Edpsych-connect-main

# Checkout the fix branch
git checkout copilot/fix-next-intl-config-detection

# Install dependencies (skip Cypress binary to avoid network issues)
CYPRESS_INSTALL_BINARY=0 npm install
```

---

## STEP 2: Understand What Was Completed

### Problem That Was Fixed
Vercel deployment was failing with the error:
```
Error: Couldn't find next-intl config file. Please follow the instructions at https://next-intl.dev/docs/getting-started/app-router
```

This caused **500 errors on ALL pages** including:
- `/` (homepage)
- `/en` (English homepage)
- `/en/login` (login page)
- `/en/admin` (admin page)
- `/cy` (Welsh homepage)
- `/favicon.ico` (even the favicon!)

### Root Cause
The `next.config.mjs` was using `createNextIntlPlugin('./src/i18n.ts')` with a custom path parameter. next-intl v4+ expects the configuration file at a specific default location (`src/i18n/request.ts`) without explicit path parameters.

### Changes That Were Implemented

#### 1. Created `src/i18n/request.ts` (NEW FILE)
```typescript
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  if (!locale || !['en', 'cy'].includes(locale)) {
    locale = 'en';
  }
 
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}":`, error);
    const fallbackMessages = (await import('../messages/en.json')).default;
    return {
      locale: 'en',
      messages: fallbackMessages
    };
  }
});
```

#### 2. Updated `next.config.mjs` (1 LINE CHANGE)
```javascript
// BEFORE:
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// AFTER:
const withNextIntl = createNextIntlPlugin();
```

#### 3. Enhanced `src/i18n.ts` (ADDED ERROR HANDLING)
Added try-catch blocks with fallback to English if locale files are missing.

#### 4. Created Documentation
Added `docs/NEXT_INTL_FIX.md` explaining the fix.

### Files Changed Summary
```
next.config.mjs          - 1 line changed (removed path parameter)
src/i18n.ts              - Added error handling (16 lines)
src/i18n/request.ts      - NEW file (36 lines)
docs/NEXT_INTL_FIX.md    - NEW documentation (66 lines)
```

---

## STEP 3: Your Tasks (What Needs to Be Completed)

### Task 1: Verify the Changes Locally

1. **Verify the files exist:**
```bash
# Check that the new config file was created
ls -la src/i18n/request.ts

# Check that message files exist
ls -la src/messages/en.json
ls -la src/messages/cy.json

# View the next.config.mjs change
grep -A 2 "createNextIntlPlugin" next.config.mjs
```

2. **Test the configuration:**
```bash
# Run a test build (this may take several minutes)
# Note: The build might fail due to missing external resources (fonts, etc.)
# but it should NOT fail with "Couldn't find next-intl config file"
NODE_ENV=production npm run build

# Look for these in the output:
# ✅ GOOD: No "Couldn't find next-intl config file" error
# ✅ GOOD: next-intl plugin loads successfully
# ⚠️  OK: Warnings about Google Fonts or external resources (not our concern)
# ❌ BAD: Any errors specifically about next-intl configuration
```

### Task 2: Create a Pull Request (if not already created)

1. **Check if PR exists:**
   - Go to: https://github.com/edpsych-connect-limited/Edpsych-connect-main/pulls
   - Look for a PR from branch `copilot/fix-next-intl-config-detection`

2. **If PR doesn't exist, create one:**
   - Click "New pull request"
   - Base: `main` (or `master`)
   - Compare: `copilot/fix-next-intl-config-detection`
   - Title: **"Fix next-intl config detection for Vercel deployment"**
   - Description: Use the template below

**PR Description Template:**
```markdown
## Problem
Vercel deployment failing with "Couldn't find next-intl config file" causing 500 errors on all pages.

## Root Cause
- `next.config.mjs` used `createNextIntlPlugin('./src/i18n.ts')` with custom path
- next-intl v4+ expects config at default location `src/i18n/request.ts`
- Vercel build process couldn't resolve custom path

## Solution
1. ✅ Created `src/i18n/request.ts` at default expected location
2. ✅ Updated `next.config.mjs` to use `createNextIntlPlugin()` without path parameter
3. ✅ Added error handling with fallback to English
4. ✅ Maintained backward compatibility with existing `src/i18n.ts`

## Changes
- `next.config.mjs`: Removed path parameter (1 line)
- `src/i18n/request.ts`: NEW - Config at default location (36 lines)
- `src/i18n.ts`: Added error handling (16 lines)
- `docs/NEXT_INTL_FIX.md`: NEW - Documentation (66 lines)

## Testing
- ✅ Config files verified at correct locations
- ✅ Message files (en.json, cy.json) validated
- ✅ Code review passed
- ✅ Security check passed
- ⏳ Awaiting Vercel deployment verification

## Expected Outcome
After merge and Vercel deployment:
- ✅ Build completes without config errors
- ✅ All pages load without 500 errors
- ✅ English (`/en/*`) routes work
- ✅ Welsh (`/cy/*`) routes work
- ✅ Translations load correctly

## References
- [next-intl v4 Documentation](https://next-intl.dev/docs/getting-started/app-router)
- [GitHub Issue #1309](https://github.com/amannn/next-intl/issues/1309)
- [Stack Overflow Solution](https://stackoverflow.com/questions/79631566/)
```

### Task 3: Merge the Pull Request

**Prerequisites:**
- All checks must pass (if any CI/CD is configured)
- Code review approval (if required)
- You have merge permissions on the repository

**Steps:**
1. Review the changes one final time in the PR interface
2. Click "Merge pull request"
3. Choose merge method:
   - **Recommended**: "Squash and merge" (keeps history clean)
   - Alternative: "Merge commit" (preserves all commits)
4. Confirm the merge
5. Delete the branch after merge (optional but recommended)

### Task 4: Verify Vercel Deployment

After merging, Vercel should automatically deploy. Monitor the deployment:

1. **Check Vercel Build Logs:**
   - Go to Vercel dashboard
   - Find the latest deployment
   - Open build logs
   - **Look for:** No "Couldn't find next-intl config file" errors
   - **Confirm:** Build completes successfully

2. **Test Production URLs:**

**Critical Tests (MUST PASS):**
```bash
# Test root redirect
curl -I https://edpsychconnect.com/
# Should: Redirect to /en (302 or 307)

# Test English homepage
curl -I https://edpsychconnect.com/en
# Should: Return 200 OK (NOT 500!)

# Test Welsh homepage
curl -I https://edpsychconnect.com/cy
# Should: Return 200 OK (NOT 500!)

# Test English login
curl -I https://edpsychconnect.com/en/login
# Should: Return 200 OK (NOT 500!)

# Test favicon
curl -I https://edpsychconnect.com/favicon.ico
# Should: Return 200 OK (NOT 500!)
```

**Browser Testing:**
- Visit https://edpsychconnect.com/ → Should redirect to /en
- Visit https://edpsychconnect.com/en → Should show English homepage
- Visit https://edpsychconnect.com/cy → Should show Welsh homepage
- Visit https://edpsychconnect.com/en/login → Should show login page
- Visit https://edpsychconnect.com/en/admin → Should show admin page (with auth)

3. **Check Vercel Function Logs:**
   - Open Vercel dashboard → Your project → Logs
   - Filter by last 1 hour
   - **Look for:** No "Couldn't find next-intl config file" errors
   - **Look for:** No 500 errors on locale routes
   - **Confirm:** Locale detection working correctly

4. **Verify Translations:**
   - English pages show English text
   - Welsh pages show Welsh (Cymraeg) text
   - Fallback to English works if translation missing

---

## STEP 4: Troubleshooting

### If "Config file not found" error STILL appears after deployment:

**Diagnostic Steps:**
1. Check Vercel build output for the exact error message
2. Verify `src/i18n/request.ts` was deployed:
   ```bash
   # In Vercel deployment output, look for:
   # "Building..."
   # Files should include src/i18n/request.ts
   ```
3. Check if `.vercelignore` is blocking the file:
   ```bash
   cat .vercelignore
   # Should NOT contain: src/i18n/
   ```
4. Review Vercel environment variables (shouldn't affect this, but check)

**Potential Fixes:**
- Clear Vercel build cache and redeploy
- Check if `src/i18n/request.ts` has correct exports
- Verify `next-intl` version in `package.json` is 4.5.8 or higher
- Ensure `next.config.mjs` is using ESM import syntax correctly

### If 500 errors persist:

**Check Vercel Function Logs for:**
- Import/module resolution errors
- Locale detection failures
- Message file loading errors

**Verify:**
- Message files (`src/messages/*.json`) are valid JSON
- No syntax errors in `src/i18n/request.ts`
- Middleware is properly configured in `middleware.ts`

### If translations don't load:

**Check:**
- Browser console for import errors
- Network tab for failed JSON requests
- Locale parameter is being passed correctly
- Message files match the expected structure

---

## STEP 5: Success Criteria Checklist

Mark each item as complete ✅ or note issues ❌:

### Pre-Deployment
- [ ] `src/i18n/request.ts` file exists and is correct
- [ ] `next.config.mjs` uses `createNextIntlPlugin()` without path
- [ ] `src/messages/en.json` exists and is valid JSON
- [ ] `src/messages/cy.json` exists and is valid JSON
- [ ] Local build completes without "config file not found" error
- [ ] Pull request created with proper description
- [ ] Pull request reviewed and approved (if required)
- [ ] Pull request merged successfully

### Post-Deployment (Vercel)
- [ ] Vercel build completes without errors
- [ ] No "Couldn't find next-intl config file" in build logs
- [ ] `https://edpsychconnect.com/` redirects to `/en`
- [ ] `https://edpsychconnect.com/en` returns 200 (NOT 500)
- [ ] `https://edpsychconnect.com/cy` returns 200 (NOT 500)
- [ ] `/en/login` page loads correctly
- [ ] `/en/admin` page loads correctly
- [ ] `/favicon.ico` loads correctly
- [ ] No 500 errors in Vercel function logs
- [ ] English translations display correctly
- [ ] Welsh translations display correctly
- [ ] Locale switching works (if implemented)

### Verification Complete
- [ ] All public routes accessible without 500 errors
- [ ] All locale routes (`/en/*`, `/cy/*`) working
- [ ] No next-intl errors in production logs
- [ ] Performance is acceptable (no significant degradation)
- [ ] Documentation updated (already done)

---

## STEP 6: Final Report

After completing all tasks, create a summary report:

### Template:
```markdown
# Next-intl Fix - Completion Report

**Date:** [Current Date]
**Status:** [✅ Complete / ⚠️ Partial / ❌ Failed]

## Tasks Completed
- [x] Verified changes locally
- [x] Created/reviewed pull request
- [x] Merged pull request
- [x] Verified Vercel deployment
- [x] Tested production URLs
- [x] Checked Vercel logs
- [x] Verified translations

## Test Results

### Build Status
- Vercel build: [✅ Success / ❌ Failed]
- Build time: [X minutes]
- Config error: [✅ Resolved / ❌ Still present]

### Production URL Tests
- `/` → `/en` redirect: [✅ Working / ❌ Failed]
- `/en` page load: [✅ 200 OK / ❌ 500 Error]
- `/cy` page load: [✅ 200 OK / ❌ 500 Error]
- `/en/login`: [✅ 200 OK / ❌ 500 Error]
- `/en/admin`: [✅ 200 OK / ❌ 500 Error]
- `/favicon.ico`: [✅ 200 OK / ❌ 500 Error]

### Translation Verification
- English translations: [✅ Working / ❌ Issues]
- Welsh translations: [✅ Working / ❌ Issues]
- Fallback behavior: [✅ Working / ❌ Issues]

## Issues Encountered
[List any issues and their resolutions]

## Recommendations
[Any suggestions for follow-up work or improvements]

## Conclusion
[Summary statement about the fix status]
```

---

## Additional Context

### Technology Stack
- **Next.js**: 16.1.1
- **next-intl**: 4.5.8
- **Node.js**: 20.x
- **Deployment**: Vercel
- **Supported Locales**: English (en), Welsh (cy)

### Repository Information
- **GitHub**: https://github.com/edpsych-connect-limited/Edpsych-connect-main
- **Branch**: `copilot/fix-next-intl-config-detection`
- **Production**: https://edpsychconnect.com/
- **Staging**: https://www.edpsychconnect.com/

### Key Files
```
next.config.mjs                      - Next.js configuration with plugins
src/i18n/request.ts                  - NEW: next-intl request config (default location)
src/i18n.ts                          - Legacy i18n config (kept for compatibility)
src/navigation.ts                    - Routing configuration
src/messages/en.json                 - English translations
src/messages/cy.json                 - Welsh translations
src/proxy.ts                         - Middleware proxy with locale handling
middleware.ts                        - Next.js middleware
docs/NEXT_INTL_FIX.md               - Documentation of the fix
```

### Important Notes
1. **Minimal Changes**: Only 4 files were modified/created
2. **Backward Compatible**: Original `src/i18n.ts` kept intact
3. **Defensive Coding**: Error handling added with fallbacks
4. **No Breaking Changes**: Should not affect any other functionality
5. **SEO-Friendly**: Locale prefix in URLs (`/en/*`, `/cy/*`)

### Support Resources
- [next-intl Documentation](https://next-intl.dev/)
- [Next.js i18n Guide](https://nextjs.org/docs/app/guides/internationalization)
- [GitHub Issue #1309](https://github.com/amannn/next-intl/issues/1309)

---

## Questions or Issues?

If you encounter any problems or need clarification:

1. **Check the documentation**: `docs/NEXT_INTL_FIX.md`
2. **Review error logs**: Vercel dashboard → Logs
3. **Verify file contents**: Compare with this prompt
4. **Test locally first**: Before investigating production issues
5. **Check next-intl version**: Should be 4.5.8+

---

## End of Prompt

This prompt provides all the information needed to complete the verification and deployment of the next-intl configuration fix. Follow the steps in order, check off items as you complete them, and create the final report when done.

**Good luck! 🚀**
