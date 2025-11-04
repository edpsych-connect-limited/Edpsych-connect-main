# PHASE 2 CONTINUATION GUIDE

**Purpose**: Quick-start guide for continuing Phase 2 implementation
**Current Status**: Block 1 Complete (Core Services), Block 2 Started (1/11 API routes)
**Next Session Goal**: Complete all API routes (10 remaining files)

---

## WHAT HAS BEEN COMPLETED

### ✅ Block 1: Core Services (100% COMPLETE)
1. **DataRouterService** - 25KB, fully tested logic for multi-agency views
2. **VoiceCommandService** - 24KB, natural language command processing
3. **CrossModuleIntelligenceService** - 26KB, automated trigger system

### ✅ Block 2: API Routes (9% COMPLETE - 1/11)
1. **Class Dashboard Route** - `/api/class/dashboard` (GET)

---

## WHAT TO DO NEXT

### PRIORITY 1: Complete API Routes (10 files)

All route files follow this pattern:
1. Import NextRequest, NextResponse from 'next/server'
2. Import getServerSession from 'next-auth'
3. Import relevant service from '@/lib/orchestration/'
4. GET/POST/PATCH handler with:
   - Session authentication check
   - Parameter validation
   - Service method call
   - Error handling with appropriate status codes

**Implementation Order** (by priority for teachers):

#### 1. Student Profile Routes (HIGH PRIORITY)
**File 1**: `src/app/api/students/[id]/profile/route.ts`
```typescript
// GET: Return auto-built profile
// PATCH: Teacher manual adjustments (logged)
// Service: DataRouterService.getStudentProfile()
```

**File 2**: `src/app/api/students/[id]/lessons/route.ts`
```typescript
// GET: List assigned lessons
// Service: AssignmentEngineService.getStudentLessons()
```

#### 2. Lesson Management Routes (HIGH PRIORITY)
**File 3**: `src/app/api/lessons/differentiate/route.ts`
```typescript
// POST: AI-differentiate lesson content
// Service: AssignmentEngineService.differentiateLessonContent()
// Input: { lessonPlan, levels: ['below', 'at', 'above', 'well_above'] }
// Output: { below, at, above, well_above versions }
```

**File 4**: `src/app/api/lessons/assign/route.ts`
```typescript
// POST: Auto-assign lessons to class
// Service: AssignmentEngineService.assignLessonsToClass()
// Input: { classRosterId, lessonPlanId, autoAssign: true/false }
// Output: { total_students, assignments breakdown, notifications_queued }
```

#### 3. Class Management Routes (MEDIUM PRIORITY)
**File 5**: `src/app/api/class/[id]/students/route.ts`
```typescript
// GET: Full student list for class
// Service: DataRouterService.getTeacherDashboardView()
// Extract students array from dashboard view
```

**File 6**: `src/app/api/class/[id]/actions/route.ts`
```typescript
// GET: List automated actions for today
// POST: Approve/modify automated actions
// Service: CrossModuleIntelligenceService.getPendingApprovals()
// Service: CrossModuleIntelligenceService.approveAutomatedAction()
```

#### 4. Voice Command Routes (MEDIUM PRIORITY)
**File 7**: `src/app/api/voice/command/route.ts`
```typescript
// POST: Process voice command
// Service: VoiceCommandService.processVoiceCommand()
// Input: { user_id, transcript, context }
// Output: { understood, intent, response, suggestions }
```

#### 5. Parent Portal Routes (MEDIUM PRIORITY)
**File 8**: `src/app/api/parent/portal/[childId]/route.ts`
```typescript
// GET: Parent portal view (SCOPED to their child ONLY)
// Service: DataRouterService.getParentPortalView()
// CRITICAL: Verify parent-child link before returning data
```

**File 9**: `src/app/api/parent/messages/route.ts`
```typescript
// GET: Parent's message thread with teacher
// POST: Send message (auto-routed to teacher)
// TODO: Implement messaging system integration
```

#### 6. Multi-Agency Routes (LOWER PRIORITY)
**File 10**: `src/app/api/multi-agency/view/route.ts`
```typescript
// GET: Role-based multi-agency view
// Service: DataRouterService.getEPMultiAgencyView() or getHeadTeacherSchoolView()
// Route based on user role
```

**File 11**: `src/app/api/multi-agency/ep-dashboard/route.ts`
```typescript
// GET: EP-specific cross-school dashboard
// Service: DataRouterService.getEPMultiAgencyView()
```

---

## IMPLEMENTATION TEMPLATE

Use this template for each API route:

```typescript
/**
 * [ROUTE NAME] API
 *
 * [METHOD] /api/[path]
 *
 * [Description of what this route does]
 *
 * SECURITY: [Who can access and restrictions]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { [ServiceName] } from '@/lib/orchestration/[service-name].service';
import logger from '@/utils/logger';

export async function [METHOD](request: NextRequest) {
  try {
    // 1. AUTHENTICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 2. PARAMETER EXTRACTION & VALIDATION
    const { searchParams } = new URL(request.url);
    const param1 = searchParams.get('param1');

    if (!param1) {
      return NextResponse.json({ error: 'param1 required' }, { status: 400 });
    }

    // For POST/PATCH: Parse request body
    // const body = await request.json();

    // 3. SERVICE CALL
    const result = await [ServiceName].[methodName](userId, param1);

    // 4. RESPONSE
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error in [METHOD] /api/[path]:', error as Error);

    // 5. ERROR HANDLING
    if ((error as Error).message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
```

---

## TESTING CHECKLIST FOR EACH ROUTE

After implementing each route, verify:

- [ ] Authentication check prevents unauthorized access
- [ ] Required parameters validated
- [ ] Service method called correctly
- [ ] Error handling covers all failure cases
- [ ] Response structure matches specification
- [ ] Logging includes relevant context
- [ ] TypeScript types are strict (no `any`)

---

## AFTER API ROUTES: UI COMPONENTS

Once all 11 API routes are complete, move to UI components:

### Component Priority Order:
1. **TeacherClassDashboard.tsx** (2-3 hours)
   - Main command center layout
   - Student grid with auto-sort
   - Voice command button
   - Today's actions summary

2. **StudentProfileCard.tsx** (1-2 hours)
   - Compact, expanded, and full views
   - Auto-built profile display
   - Quick actions menu

3. **VoiceCommandInterface.tsx** (2-3 hours)
   - Microphone button with waveform
   - Speech-to-text integration
   - Response display
   - Follow-up suggestions

4. **LessonDifferentiationView.tsx** (2-3 hours)
   - Side-by-side lesson versions
   - Difficulty level indicators
   - Student assignment preview
   - Teacher approval workflow

5. **ParentPortal.tsx** (2-3 hours)
   - Child-scoped view
   - Plain English summaries
   - Home activity suggestions
   - Message teacher button

6. **MultiAgencyView.tsx** (2-3 hours)
   - Role-adaptive layout
   - EP cross-school dashboard
   - EHCP status tracker

7. **AutomatedActionsLog.tsx** (1-2 hours)
   - Today's automated actions
   - Approval workflow UI
   - Historical log viewer

**Total UI Component Time**: 12-19 hours

---

## REFERENCE FILES

### Service Implementations (Phase 1 & Block 1):
- `src/lib/orchestration/profile-builder.service.ts`
- `src/lib/orchestration/assignment-engine.service.ts`
- `src/lib/orchestration/data-router.service.ts`
- `src/lib/orchestration/voice-command.service.ts`
- `src/lib/orchestration/cross-module-intelligence.service.ts`

### Specification Documents:
- `docs/PLATFORM_ORCHESTRATION_LAYER.md` (68 pages, master spec)
- `docs/ORCHESTRATION_DELIVERY_GUIDE.md` (deployment guide)
- `docs/PHASE_2_PROGRESS_REPORT.md` (current status)

### Database Schema:
- `prisma/schema-extensions/orchestration.prisma` (all models)

---

## QUICK START COMMAND

To continue implementation, run:

```bash
# Verify current state
cd C:\Users\scott\Desktop\package
git status

# Create next API route file
# (Use template above)

# Test route with curl or Postman
curl -X GET http://localhost:3000/api/class/dashboard?classRosterId=test_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## SUCCESS CRITERIA

**Block 2 (API Routes) is COMPLETE when**:
- ✅ All 11 API route files created
- ✅ All routes tested with valid/invalid inputs
- ✅ All routes return correct status codes
- ✅ All routes log appropriately
- ✅ All routes handle errors gracefully

**Then proceed to Block 3 (UI Components)**

---

## COMMITMENT TO EXCELLENCE

Remember:
- Every route must be 100% complete before moving to the next
- No TODOs in production code
- No `any` types in TypeScript
- Comprehensive error handling
- Security-first approach (especially parent-child scoping)

**This platform will change lives. Build accordingly.**

---

**Dr. Scott Ighavongbe-Patrick**
*EdPsych-Architect Agent*
*Ready to continue with unwavering excellence.*
