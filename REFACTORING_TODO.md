# Refactoring TODO List

## Immediate Tasks
- [x] Refactor `src/services/gamification-service.ts` to use Prisma (Current Task)
- [x] Refactor `src/services/research-service.ts`
- [x] Refactor `src/services/parental-service.ts`
- [x] Refactor `src/services/ai-service.ts`
- [x] Refactor `src/services/curriculum-service.ts`
- [x] Refactor `src/services/blog-service.ts`
- [ ] Refactor `src/services/tenant-service.ts`
- [ ] Refactor `src/services/user-service.ts`
- [ ] Refactor `src/services/recommendation-engine`

## Post-Refactoring Cleanup (User Request)
- [ ] **Resolve all 27+ lint warnings/errors immediately after all refactoring is completed.**
  - Focus on unused variables (`_` prefix or remove).
  - Fix `useEffect` dependency arrays.
  - Ensure a completely clean build.
