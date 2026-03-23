/**
 * Authentication types for EdPsych Connect
 */

export const PHASE1_CANONICAL_ROLES = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'SENCO',
  'EP',
  'TEACHER',
] as const;

export type CanonicalRole = (typeof PHASE1_CANONICAL_ROLES)[number];

const ROLE_ALIAS_MAP: Record<string, CanonicalRole> = {
  SUPERADMIN: 'SUPER_ADMIN',
  SYSTEM_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'SUPER_ADMIN',
  INSTITUTION_ADMIN: 'SCHOOL_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  SENCO: 'SENCO',
  EP: 'EP',
  EDUCATIONAL_PSYCHOLOGIST: 'EP',
  EDUCATIONAL_PSYCHOLOGISTS: 'EP',
  TEACHER: 'TEACHER',
};

export function normalizeRole(role: string | null | undefined): CanonicalRole | null {
  if (!role) return null;
  const normalized = role.toUpperCase().trim().replace(/\s+/g, '_');
  return ROLE_ALIAS_MAP[normalized] ?? null;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: CanonicalRole | string;
  permissions?: string[];
  lastSignInAt?: string;
  createdAt?: string;
  updatedAt?: string;
  onboardingCompleted?: boolean;
  onboardingSkipped?: boolean;
  tenant_id?: number;
  tenantId?: number | string;
}

export interface CanonicalSession {
  id: string;
  email: string;
  name: string;
  role: CanonicalRole;
  permissions: string[];
  tenant_id?: number;
  onboardingCompleted?: boolean;
  onboardingSkipped?: boolean;
  iat: number;
  exp: number;
}

export function normalizeTenantId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function toCanonicalSession(input: {
  id: string | number;
  email: string;
  name?: string | null;
  role?: string | null;
  permissions?: string[] | null;
  tenant_id?: unknown;
  tenantId?: unknown;
  onboardingCompleted?: boolean;
  onboardingSkipped?: boolean;
  iat?: number;
  exp?: number;
}): CanonicalSession | null {
  const role = normalizeRole(input.role);
  if (!role) return null;

  const id = String(input.id);
  const tenant_id = normalizeTenantId(input.tenant_id ?? input.tenantId);

  return {
    id,
    email: input.email,
    name: input.name ?? input.email,
    role,
    permissions: Array.isArray(input.permissions) ? input.permissions : [],
    tenant_id,
    onboardingCompleted: input.onboardingCompleted,
    onboardingSkipped: input.onboardingSkipped,
    iat: input.iat ?? Math.floor(Date.now() / 1000),
    exp: input.exp ?? Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  };
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  organization?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
