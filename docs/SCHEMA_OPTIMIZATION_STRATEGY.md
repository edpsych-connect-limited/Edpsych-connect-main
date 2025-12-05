# Schema Optimization Strategy - OOM Fix

## Problem

**Root Cause**: Prisma schema file with 240+ models (6,700+ lines) exceeds Vercel build memory limits
- Previous attempts to fix OOM by removing files were unsuccessful
- The issue is not storage but **Prisma code generation memory consumption**
- Prisma's `prisma generate` command exhausts Node.js heap during build

## Solution: Prisma Schema Composition

Prisma 6.19.0+ supports **schema composition**, allowing splitting the monolithic schema into smaller, focused files.

### Benefits

1. **Reduced memory footprint** during code generation
2. **Logical organization** by domain
3. **Faster build times** (parallel processing possible in future)
4. **Easier maintenance** and developer experience

### Implementation Plan

#### Step 1: Enable Schema Composition
- Update `prisma.schema` to use `prismaSchemaFolder` 
- Create `prisma/schemas/` directory structure
- Move models into domain-specific files

#### Step 2: Domain Organization
```
prisma/
├── schemas/
│   ├── core.prisma              # Users, Tenants, Auth, Base models
│   ├── education.prisma         # Courses, Lessons, Assignments, Progress
│   ├── ehcp.prisma              # EHCP application, decisions, outcomes
│   ├── sen.prisma               # SEN2 return data, SEN details
│   ├── assessment.prisma        # Assessment frameworks, results, outcomes
│   ├── professional.prisma      # Professional network, connections, communities
│   ├── research.prisma          # Research studies, data, ethics
│   ├── features.prisma          # Gamification, AI, marketplace, etc.
│   ├── enums.prisma             # All enums (shared across all)
│   └── datasource.prisma        # Generator and datasource (shared)
├── schema.prisma                # Empty file (for compatibility)
└── schema.prisma.backup         # Backup of original
```

#### Step 3: Generated Code Impact
- Prisma will generate combined client from all files
- No API changes needed in application code
- Full backward compatibility maintained

## Expected Outcomes

- ✅ Vercel build succeeds without OOM
- ✅ Local development builds faster
- ✅ No application code changes required
- ✅ Type safety maintained
- ✅ All 120+ APIs remain functional

## Testing Plan

1. Run `npx prisma generate` locally (should be faster)
2. Verify Prisma client imports work
3. Run `npm run build` locally
4. Push to Vercel and monitor build
5. Verify all APIs functional

## Rollback Plan

If issues occur:
1. `schema.prisma.backup` contains original
2. Can revert to monolithic schema
3. No data migration needed (schema is identical)
