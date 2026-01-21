# Role Model (Platform vs Tenant Administration)

This document defines administrative role boundaries for EdPsych Connect.

## Role Tiers

### Platform Owner Admin (SUPER_ADMIN)
- Purpose: Platform-wide governance and developer/system administration.
- Access: `/admin` (System Administration) and any platform-wide controls.
- Scope: All tenants, all data, audit and governance controls.
- Audience: Founder/owner or designated platform operators only.

### Platform Admin (ADMIN)
- Purpose: Operational administration within the platform UI, but not system-owner controls.
- Access: Admin studio views that relate to service operations, not developer/system configuration.
- Scope: Platform operations limited by policy; no owner-only dashboards.
- Audience: Internal operations team if delegated by owner.

### Tenant Admins (SCHOOL_ADMIN, LA_ADMIN, INSTITUTION_ADMIN)
- Purpose: Administration within a specific tenant or organization.
- Access: Tenant dashboards, LA workflows, institutional management within their tenant.
- Scope: Restricted to their tenant; cannot access platform-wide admin.
- Audience: School/LA/institutional administrators.

## Access Boundaries
- `/admin` (System Administration) is **SUPER_ADMIN only**.
- Tenant dashboards (e.g., LA, School, Institution) are limited to corresponding tenant roles.
- Platform admins must never see developer/system admin panels unless they are SUPER_ADMIN.

## Implementation Notes
- UI gating: `src/app/[locale]/admin/page.tsx` and `src/components/admin/AdminInterface.component.tsx`.
- Navigation gating: `src/config/navigation.ts` restricts `/admin` link to SUPERADMIN only.
- API enforcement should mirror UI boundaries (use `authenticateRequest` + role checks).

## Follow-up Actions
- Formalize distinct platform admin permissions if delegation is required.
- Align role definitions across authentication, UI navigation, and API middleware.
