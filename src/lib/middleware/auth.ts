/**
 * Enterprise-grade authentication and authorization middleware
 * Enforces session-based access control on all API routes
 *
 * @module middleware/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '../auth/auth-service';
import { auditLogger, getIpAddress, getUserAgent, getRequestId } from '../security/audit-logger';
import { AuditEventType, AuditSeverity } from '../security/audit-logger';
import { setTenantContext } from '@/lib/db/tenant-context';
import { getPrismaForTenant } from '@/lib/prisma';
import { normalizeRole, normalizeTenantId } from '../auth/types';

/**
 * Permission types for role-based access control
 */
export enum Permission {
  // User permissions
  VIEW_OWN_DATA = 'VIEW_OWN_DATA',
  EDIT_OWN_PROFILE = 'EDIT_OWN_PROFILE',

  // EHCP permissions
  VIEW_EHCP = 'VIEW_EHCP',
  CREATE_EHCP = 'CREATE_EHCP',
  EDIT_EHCP = 'EDIT_EHCP',
  DELETE_EHCP = 'DELETE_EHCP',
  EXPORT_EHCP = 'EXPORT_EHCP',

  // Assessment permissions
  VIEW_ASSESSMENTS = 'VIEW_ASSESSMENTS',
  CREATE_ASSESSMENTS = 'CREATE_ASSESSMENTS',
  EDIT_ASSESSMENTS = 'EDIT_ASSESSMENTS',
  SUBMIT_ASSESSMENTS = 'SUBMIT_ASSESSMENTS',

  // Intervention permissions
  VIEW_INTERVENTIONS = 'VIEW_INTERVENTIONS',
  CREATE_INTERVENTIONS = 'CREATE_INTERVENTIONS',
  EDIT_INTERVENTIONS = 'EDIT_INTERVENTIONS',

  // Student data permissions
  VIEW_STUDENT_DATA = 'VIEW_STUDENT_DATA',
  EDIT_STUDENT_DATA = 'EDIT_STUDENT_DATA',
  VIEW_ALL_STUDENTS = 'VIEW_ALL_STUDENTS',

  // Institution Admin permissions
  MANAGE_INSTITUTION = 'MANAGE_INSTITUTION',
  VIEW_INSTITUTION_USERS = 'VIEW_INSTITUTION_USERS',
  INVITE_USERS = 'INVITE_USERS',
  MANAGE_DEPARTMENTS = 'MANAGE_DEPARTMENTS',
  VIEW_INSTITUTION_REPORTS = 'VIEW_INSTITUTION_REPORTS',
  CREATE_REPORTS = 'CREATE_REPORTS',
  GENERATE_REPORTS = 'GENERATE_REPORTS',

  // Department Manager permissions
  MANAGE_DEPARTMENT = 'MANAGE_DEPARTMENT',
  VIEW_DEPARTMENT_USERS = 'VIEW_DEPARTMENT_USERS',
  VIEW_DEPARTMENT_REPORTS = 'VIEW_DEPARTMENT_REPORTS',

  // System Admin permissions
  MANAGE_ALL_INSTITUTIONS = 'MANAGE_ALL_INSTITUTIONS',
  MANAGE_ALL_USERS = 'MANAGE_ALL_USERS',
  VIEW_SYSTEM_LOGS = 'VIEW_SYSTEM_LOGS',
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
  VIEW_ALL_DATA = 'VIEW_ALL_DATA',
}

/**
 * Role to permissions mapping
 */
const FULL_CORRIDOR_PERMISSIONS: Permission[] = [
  Permission.VIEW_OWN_DATA,
  Permission.EDIT_OWN_PROFILE,
  Permission.VIEW_EHCP,
  Permission.CREATE_EHCP,
  Permission.EDIT_EHCP,
  Permission.DELETE_EHCP,
  Permission.EXPORT_EHCP,
  Permission.VIEW_ASSESSMENTS,
  Permission.CREATE_ASSESSMENTS,
  Permission.EDIT_ASSESSMENTS,
  Permission.SUBMIT_ASSESSMENTS,
  Permission.VIEW_INTERVENTIONS,
  Permission.CREATE_INTERVENTIONS,
  Permission.EDIT_INTERVENTIONS,
  Permission.VIEW_STUDENT_DATA,
  Permission.EDIT_STUDENT_DATA,
  Permission.VIEW_ALL_STUDENTS,
  Permission.MANAGE_INSTITUTION,
  Permission.VIEW_INSTITUTION_USERS,
  Permission.INVITE_USERS,
  Permission.MANAGE_DEPARTMENTS,
  Permission.VIEW_INSTITUTION_REPORTS,
  Permission.CREATE_REPORTS,
  Permission.GENERATE_REPORTS,
  Permission.MANAGE_ALL_INSTITUTIONS,
  Permission.MANAGE_ALL_USERS,
  Permission.VIEW_SYSTEM_LOGS,
  Permission.MANAGE_SYSTEM_SETTINGS,
  Permission.VIEW_ALL_DATA,
];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [...FULL_CORRIDOR_PERMISSIONS],
  SCHOOL_ADMIN: [
    Permission.VIEW_OWN_DATA,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_EHCP,
    Permission.CREATE_EHCP,
    Permission.EDIT_EHCP,
    Permission.DELETE_EHCP,
    Permission.EXPORT_EHCP,
    Permission.VIEW_ASSESSMENTS,
    Permission.CREATE_ASSESSMENTS,
    Permission.EDIT_ASSESSMENTS,
    Permission.SUBMIT_ASSESSMENTS,
    Permission.VIEW_INTERVENTIONS,
    Permission.CREATE_INTERVENTIONS,
    Permission.EDIT_INTERVENTIONS,
    Permission.VIEW_ALL_STUDENTS,
    Permission.MANAGE_INSTITUTION,
    Permission.VIEW_INSTITUTION_USERS,
    Permission.INVITE_USERS,
    Permission.MANAGE_DEPARTMENTS,
    Permission.VIEW_INSTITUTION_REPORTS,
    Permission.CREATE_REPORTS,
    Permission.GENERATE_REPORTS,
  ],
  SENCO: [
    Permission.VIEW_OWN_DATA,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_EHCP,
    Permission.CREATE_EHCP,
    Permission.EDIT_EHCP,
    Permission.EXPORT_EHCP,
    Permission.VIEW_ASSESSMENTS,
    Permission.CREATE_ASSESSMENTS,
    Permission.EDIT_ASSESSMENTS,
    Permission.SUBMIT_ASSESSMENTS,
    Permission.VIEW_INTERVENTIONS,
    Permission.CREATE_INTERVENTIONS,
    Permission.EDIT_INTERVENTIONS,
    Permission.VIEW_STUDENT_DATA,
    Permission.EDIT_STUDENT_DATA,
    Permission.VIEW_INSTITUTION_REPORTS,
    Permission.CREATE_REPORTS,
    Permission.GENERATE_REPORTS,
  ],
  EP: [
    Permission.VIEW_OWN_DATA,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_EHCP,
    Permission.CREATE_EHCP,
    Permission.EDIT_EHCP,
    Permission.EXPORT_EHCP,
    Permission.VIEW_ASSESSMENTS,
    Permission.CREATE_ASSESSMENTS,
    Permission.EDIT_ASSESSMENTS,
    Permission.SUBMIT_ASSESSMENTS,
    Permission.VIEW_INTERVENTIONS,
    Permission.CREATE_INTERVENTIONS,
    Permission.EDIT_INTERVENTIONS,
    Permission.VIEW_STUDENT_DATA,
    Permission.EDIT_STUDENT_DATA,
    Permission.VIEW_INSTITUTION_REPORTS,
    Permission.CREATE_REPORTS,
    Permission.GENERATE_REPORTS,
  ],
  TEACHER: [
    Permission.VIEW_OWN_DATA,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_EHCP,
    Permission.VIEW_ASSESSMENTS,
    Permission.VIEW_INTERVENTIONS,
    Permission.VIEW_STUDENT_DATA,
  ],
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(userRole: string | null | undefined, permission: Permission): boolean {
  const normalizedRole = normalizeRole(userRole);
  if (!normalizedRole) return false;

  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];

  return permissions.includes(permission);
}

export function isAdminRole(userRole: string | null | undefined): boolean {
  return normalizeRole(userRole) === 'SUPER_ADMIN';
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRole: string | null | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userRole: string | null | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Authenticate request and return session
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  success: true;
  session: {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
      tenant_id?: number;
      permissions?: string[];
      onboardingCompleted?: boolean;
      onboardingSkipped?: boolean;
    };
  };
} | {
  success: false;
  response: NextResponse;
}> {
  const verifiedSession = await authService.getSessionFromRequest(request);

  if (!verifiedSession) {
    const ipAddress = getIpAddress(request);
    const userAgent = getUserAgent(request);
    const requestId = getRequestId(request);

    // Log unauthorized access attempt
    await auditLogger.log({
      eventType: AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      severity: AuditSeverity.WARNING,
      performedBy: 'anonymous',
      details: {
        url: request.url,
        method: request.method,
      },
      ipAddress,
      userAgent,
      requestId,
      success: false,
      errorMessage: 'No valid session',
    });

    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
    };
  }

  const normalizedRole = normalizeRole(verifiedSession.role);
  if (!normalizedRole) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unsupported role for Phase 1 corridor.' },
        { status: 403 }
      ),
    };
  }

  const session = {
    user: {
      id: verifiedSession.id,
      email: verifiedSession.email,
      role: normalizedRole,
      name: verifiedSession.name,
      tenant_id: normalizeTenantId(verifiedSession.tenant_id),
      permissions: verifiedSession.permissions,
      onboardingCompleted: verifiedSession.onboardingCompleted,
      onboardingSkipped: verifiedSession.onboardingSkipped,
    },
  };

  // Establish request-scoped tenant context so downstream DB calls can route correctly.
  try {
    const tenantId = session.user.tenant_id;
    const tenantPrisma = tenantId ? await getPrismaForTenant(tenantId) : undefined;
    setTenantContext({
      tenantId,
      userId: session.user.id,
      prisma: tenantPrisma as any,
    });
  } catch (_error) {
    setTenantContext({
      tenantId: session.user.tenant_id,
      userId: session.user.id,
    });
  }

  return {
    success: true,
    session,
  };
}

/**
 * Authorize request based on required permission
 */
export async function authorizeRequest(
  request: NextRequest,
  requiredPermission: Permission
): Promise<{
  success: true;
  session: {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
      tenant_id?: number;
    };
  };
} | {
  success: false;
  response: NextResponse;
}> {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return authResult;
  }

  const { session } = authResult;

  // Check if user has required permission
  if (!hasPermission(session.user.role, requiredPermission)) {
    const ipAddress = getIpAddress(request);
    const userAgent = getUserAgent(request);
    const requestId = getRequestId(request);

    // Log access denied event
    await auditLogger.log({
      eventType: AuditEventType.ACCESS_DENIED,
      severity: AuditSeverity.WARNING,
      performedBy: session.user.id,
      performedByEmail: session.user.email,
      details: {
        url: request.url,
        method: request.method,
        requiredPermission,
        userRole: session.user.role,
      },
      ipAddress,
      userAgent,
      requestId,
      success: false,
      errorMessage: 'Insufficient permissions',
    });

    return {
      success: false,
      response: NextResponse.json(
        { error: 'Access denied. You do not have permission to perform this action.' },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    session,
  };
}

/**
 * Check if user can access another user's data
 */
export function canAccessUserData(
  requestingUserId: string,
  requestingUserRole: string,
  targetUserId: string
): boolean {
  // User can always access their own data
  if (requestingUserId === targetUserId) {
    return true;
  }

  // System admins can access all data
  if (hasPermission(requestingUserRole, Permission.VIEW_ALL_DATA)) {
    return true;
  }

  // TODO: Add institutional hierarchy checks
  // Institution admins should be able to access users in their institution
  // Department managers should be able to access users in their department

  return false;
}

/**
 * Check if user can access data from a specific tenant
 * CRITICAL: Enforces multi-tenancy isolation
 *
 * @param userTenantId - The tenant ID of the user making the request
 * @param targetTenantId - The tenant ID of the data being accessed
 * @param userRole - The role of the user
 * @returns true if user can access the tenant's data, false otherwise
 */
export function canAccessTenant(
  userTenantId: number | string | null | undefined,
  targetTenantId: number | string | null | undefined,
  userRole: string
): boolean {
  // Normalize IDs to numbers for comparison
  const normalizedUserTenantId = typeof userTenantId === 'string' ? parseInt(userTenantId) : userTenantId;
  const normalizedTargetTenantId = typeof targetTenantId === 'string' ? parseInt(targetTenantId) : targetTenantId;

  // System admins can access all tenants
  if (hasPermission(userRole, Permission.VIEW_ALL_DATA)) {
    return true;
  }

  // User must have a tenant ID
  if (!normalizedUserTenantId) {
    return false;
  }

  // User can only access their own tenant's data
  return normalizedUserTenantId === normalizedTargetTenantId;
}

/**
 * Middleware wrapper for authenticated routes
 */
export function withAuth(
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return (authResult as { success: false; response: NextResponse }).response;
    }

    return handler(request, (authResult as { success: true; session: any }).session);
  };
}

/**
 * Middleware wrapper for authorized routes
 */
export function withPermission(
  requiredPermission: Permission,
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const authResult = await authorizeRequest(request, requiredPermission);

    if (!authResult.success) {
      return (authResult as { success: false; response: NextResponse }).response;
    }

    return handler(request, (authResult as { success: true; session: any }).session);
  };
}
