# Vercel Symlink Collision - Resolution Strategy

**Status**: Configuration-based solutions exhausted. Ready for API Route Consolidation.

## Issue Summary
Vercel build fails with: `EEXIST: file already exists, symlink 'assessments/[id].func' -> '/vercel/output/functions/api/status.func'`

**Root Cause**: With 40+ dynamic API routes, Vercel's `@vercel/next` optimizer incorrectly identifies route collisions and attempts to create symlinks, causing file system collisions.

## Solutions Attempted (11 attempts, all failed)
- Build configs in `vercel.json`
- Explicit framework declaration
- Custom builders
- Route segment configs
- Standalone mode
- Rewrite rules
- .vercelignore patterns

**Result**: All configuration approaches fail because Vercel's project settings (stored server-side) override `vercel.json`.

## Recommended Solution: API Route Consolidation

Instead of 40+ separate route files, consolidate into logical handler groups:

```
Before (40+ functions):
/api/assessments/route.ts
/api/assessments/[id]/route.ts
/api/assessments/collaborations/route.ts
...40 more files

After (8 functions):
/api/assessments/route.ts (handles all assessments/* routing)
/api/auth/route.ts (handles all auth/* routing)
/api/students/route.ts (handles all students/* routing)
...etc
```

## Implementation Pattern

Each consolidated handler uses a router pattern:
```typescript
export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  if (path.includes('/collaborations/')) {
    return handleCollaborations(req);
  } else if (path.includes('/instances/')) {
    return handleInstances(req);
  } else {
    return handleAssessments(req);
  }
}
```

## Route Consolidation Map

```
GROUP 1: Authentication
- /api/auth/* → Single handler

GROUP 2: Assessments & Collaborations  
- /api/assessments/* → Single handler

GROUP 3: Students & Progress
- /api/students/* → Single handler
- /api/progress/* → Single handler

GROUP 4: Training & Certificates
- /api/training/* → Single handler

GROUP 5: Subscription & Billing
- /api/subscription/* → Single handler

GROUP 6: Content & EHCP
- /api/ehcp/* → Single handler
- /api/cases/* → Single handler

GROUP 7: AI & Automation
- /api/ai/* → Single handler
- /api/automation/* → Single handler

GROUP 8: Utilities
- /api/webhooks/* → Single handler
- /api/cron/* → Single handler
- /api/health/* → Single handler
- /api/status/* → Single handler
... (health checks, status endpoints)
```

## Benefits

✅ Eliminates Vercel symlink collisions (fewer functions = no optimization)
✅ Improves code organization (centralized routing logic)
✅ Enterprise pattern (used by Stripe, Auth0, Supabase)
✅ Better performance (less function orchestration overhead)
✅ Easier to maintain (single router per domain)

## Estimated Effort
- **Time**: 2-3 hours refactoring
- **Risk**: Low (straightforward refactoring, tests can validate)
- **Quality**: High (consolidation improves architecture)

## Next Steps

1. Create consolidated route files following the map above
2. Move business logic from individual routes into their handlers
3. Update imports to point to new consolidated routes
4. Test all endpoints
5. Deploy and verify

## Alternative Solutions (if consolidation not desired)

- **Cloudflare Pages**: Better dynamic route handling (~1 day migration)
- **AWS Lambda/API Gateway**: No symlink optimization (~1-2 days)
- **Railway/Render**: Drop-in Vercel replacement (~1 day)

## Decision Required

- ✅ Proceed with API Route Consolidation (2-3 hours, stays on Vercel)
- 🔄 Migrate to Cloudflare Pages (1 day, better route handling)
- 🔄 Switch to different host (1-2 days)
