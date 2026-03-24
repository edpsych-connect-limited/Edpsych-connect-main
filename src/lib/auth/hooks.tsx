/**
 * Enterprise-Grade Authentication Provider
 * EdPsych Connect World - Core Authentication System
 *
 * Features:
 * - Universal authentication (works for all user roles)
 * - Synchronous storage operations (no race conditions)
 * - Role hierarchy system (SUPER_ADMIN = god-mode)
 * - Permission-based access control
 * - Automatic token refresh
 * - Comprehensive error handling
 * - Production-grade logging
 * - React best practices (useEffect for side effects)
 *
 * @module auth/hooks
 * @version 2.0 - Production Ready
 * @author Dr. Scott Ighavongbe-Patrick
 */

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, PasswordUpdateRequest, normalizeRole, normalizeTenantId } from './types';
import { secureStore, secureRetrieve, secureRemove as _secureRemove, clearAuthStorage } from '../../utils/encryption';
import { logger } from "@/lib/logger";

/**
 * Authentication Context Type Definition
 */
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Last auth-related error message suitable for displaying in UI (cleared on successful actions). */
  authError: string | null;
  /** Clear any previously-set auth error. */
  clearAuthError: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  verifyMfa: (token: string, code: string) => Promise<boolean>;
  resendMfa: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (userData: any) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  completeReset: (token: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  changePassword: (data: PasswordUpdateRequest) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Wraps your app and provides authentication context to all children
 *
 * @param children - React children components
 * @returns Provider component with auth context
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook for components to access authentication context
 * Must be used within an AuthProvider
 *
 * @returns Authentication context object
 * @throws Error if used outside AuthProvider
 *
 * @example
 * const { user, login, logout, hasRole } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provider hook that creates the auth object and handles state
 * Internal implementation - use useAuth() hook instead
 */
function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const clearAuthError = () => setAuthError(null);
  const getLocalePrefix = () => {
    if (typeof window === 'undefined') return '';
    const segment = window.location.pathname.split('/')[1];
    return (segment === 'en' || segment === 'cy') ? `/${segment}` : '';
  };

  const normalizeAuthUser = useCallback((input: any): AuthUser | null => {
    if (!input || !input.id || !input.email) return null;

    const normalizedRole = normalizeRole(input.role);
    if (!normalizedRole) return null;

    return {
      id: String(input.id),
      email: String(input.email),
      name: input.name ? String(input.name) : String(input.email),
      role: normalizedRole,
      permissions: Array.isArray(input.permissions) ? input.permissions.filter((p: unknown): p is string => typeof p === 'string') : [],
      onboardingCompleted: typeof input.onboardingCompleted === 'boolean' ? input.onboardingCompleted : undefined,
      onboardingSkipped: typeof input.onboardingSkipped === 'boolean' ? input.onboardingSkipped : undefined,
      tenant_id: normalizeTenantId(input.tenant_id ?? input.tenantId),
      tenantId: normalizeTenantId(input.tenant_id ?? input.tenantId),
      organization: input.organization ? String(input.organization) : undefined,
    };
  }, []);

  const syncUserFromServer = useCallback(async (): Promise<AuthUser | null> => {
    logger.info('ANALYZE Syncing authentication state from server session...');

    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || !data?.authenticated || !data?.session?.user) {
      logger.info('FAIL No authenticated server session found');
      clearAuthStorage();
      setUser(null);
      return null;
    }

    const normalizedUser = normalizeAuthUser(data.session.user);
    if (!normalizedUser) {
      logger.warn('WARNING Server session could not be normalized into canonical client auth state');
      clearAuthStorage();
      setUser(null);
      return null;
    }

    try {
      secureStore('userData', normalizedUser);
    } catch (storageError) {
      logger.warn('WARNING Failed to refresh cached userData from server session:', storageError);
    }

    setUser(normalizedUser);
    logger.info('OK Authentication state synced from server session', {
      email: normalizedUser.email,
      role: normalizedUser.role,
      userId: normalizedUser.id,
    });

    return normalizedUser;
  }, [normalizeAuthUser]);

  /**
   * Check authentication status on mount
   * Server session is authoritative; local storage is cache only.
   */
  useEffect(() => {
    if (isInitialized) return;

    const checkAuth = async () => {
      try {
        setIsLoading(true);
        await syncUserFromServer();
      } catch (_error) {
        logger.error('FAIL Authentication check failed:', _error);
        clearAuthStorage();
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        logger.info('OK Authentication check complete');
      }
    };

    checkAuth();
  }, [isInitialized, syncUserFromServer]);

  /**
   * Log in a user with email and password
   * Works identically for all user roles (SUPER_ADMIN, ADMIN, TEACHER, STUDENT, PARENT)
   *
   * @param email - User email address
   * @param password - User password
   * @param rememberMe - Whether to persist session
   * @returns Promise<boolean> - True if login successful
   */
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);
      logger.info(' Starting login process:', { email });

      // Validate inputs
      if (!email || !password) {
        logger.error('FAIL Login failed: Email and password are required');
        setAuthError('Email and password are required');
        return false;
      }

      // Call authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data?.error || data?.message || 'Login failed';
        logger.error('FAIL Login failed:', message);
        setAuthError(message);
        return false;
      }

      logger.info('OK Login API successful');

      if (data?.data?.mfaRequired && data?.data?.mfaToken) {
        secureStore('mfaToken', data.data.mfaToken);
        secureStore('mfaEmail', email);
        setAuthError(null);
        router.push(`${getLocalePrefix()}/mfa`);
        return true;
      }

      // Store tokens for compatibility; server cookie/session remains authoritative.
      try {
        secureStore('accessToken', data.data.accessToken);
        logger.info('OK Stored accessToken');

        secureStore('refreshToken', data.data.refreshToken);
        logger.info('OK Stored refreshToken');

        _secureRemove('mfaToken');
        _secureRemove('mfaEmail');
      } catch (storageError) {
        logger.error('FAIL Failed to store auth data:', storageError);
        return false;
      }

      const syncedUser = await syncUserFromServer();
      if (!syncedUser) {
        setAuthError('Login completed but session could not be verified. Please try again.');
        return false;
      }

      setAuthError(null);
      logger.info('OK Login successful:', {
        userId: syncedUser.id,
        email: syncedUser.email,
        role: syncedUser.role
      });

      return true;
    } catch (_error) {
      logger.error('FAIL Login error:', _error);
      setAuthError('Network error. Please check your connection and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify MFA code for privileged users
   *
   * @param token - MFA token from login response
   * @param code - 6-digit verification code
   * @returns Promise<boolean> - True if verification succeeds
   */
  const verifyMfa = async (token: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, code }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data?.error || data?.message || 'Verification failed';
        logger.error('FAIL MFA verification failed:', message);
        setAuthError(message);
        return false;
      }

      try {
        secureStore('accessToken', data.data.accessToken);
        secureStore('refreshToken', data.data.refreshToken);
        _secureRemove('mfaToken');
        _secureRemove('mfaEmail');
      } catch (storageError) {
        logger.error('FAIL Failed to store MFA auth data:', storageError);
        return false;
      }

      const syncedUser = await syncUserFromServer();
      if (!syncedUser) {
        setAuthError('Verification completed but session could not be verified. Please try again.');
        return false;
      }

      setAuthError(null);
      return true;
    } catch (_error) {
      logger.error('FAIL MFA verification error:', _error);
      setAuthError('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend MFA code
   *
   * @param token - MFA token from login response
   * @returns Promise<boolean> - True if resend succeeds
   */
  const resendMfa = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await fetch('/api/auth/mfa/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = data?.error || data?.message || 'Resend failed';
        logger.error('FAIL MFA resend failed:', message);
        setAuthError(message);
        return false;
      }

      setAuthError(null);
      return true;
    } catch (_error) {
      logger.error('FAIL MFA resend error:', _error);
      setAuthError('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up a new user
   *
   * @param userData - User registration data
   * @returns Promise<boolean> - True if signup successful
   */
  const signup = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      logger.info(' Starting signup process');

      // Basic validation
      if (!userData.email || !userData.password) {
        logger.error('FAIL Signup failed: Email and password are required');
        return false;
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        logger.error('FAIL Signup failed:', data.message || 'Unknown error');
        return false;
      }

      // Store tokens for compatibility; server cookie/session remains authoritative.
      secureStore('accessToken', data.data.accessToken);
      secureStore('refreshToken', data.data.refreshToken);

      const syncedUser = await syncUserFromServer();
      if (!syncedUser) {
        logger.error('FAIL Signup completed but session could not be verified');
        return false;
      }

      logger.info('OK Signup successful:', {
        userId: syncedUser.id,
        email: syncedUser.email
      });
      return true;
    } catch (_error) {
      logger.error('FAIL Signup error:', _error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out the current user
   * Clears local storage and optionally invalidates token on server
   *
   * @returns Promise<void>
   */
  const logout = async (): Promise<void> => {
    try {
      // Attempt to invalidate session on server (don't block on failure)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (_error) {
        // Log but don't prevent logout
        logger.warn('WARNING Server logout failed, continuing with local logout:', _error);
      }

      // Clear all authentication data
      clearAuthStorage();

      // Update state
      setUser(null);

      // Redirect to login page
      logger.info('OK User logged out successfully');
      router.push('/login');
    } catch (_error) {
      logger.error('FAIL Logout error:', _error);
      // Still try to clear local state
      clearAuthStorage();
      setUser(null);
      router.push('/login');
    }
  };

  /**
   * Refresh the access token using the refresh token
   *
   * @returns Promise<boolean> - True if refresh successful
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = secureRetrieve('refreshToken');

      if (!storedRefreshToken) {
        logger.error('FAIL Token refresh failed: No refresh token found');
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        logger.error('FAIL Token refresh failed:', data.message || 'Unknown error');
        // Clear tokens on refresh failure
        clearAuthStorage();
        setUser(null);
        return false;
      }

      // Update tokens
      secureStore('accessToken', data.data.accessToken);
      if (data.data.refreshToken) {
        secureStore('refreshToken', data.data.refreshToken);
      }

      const syncedUser = await syncUserFromServer();
      if (!syncedUser) {
        logger.error('FAIL Token refresh completed but session could not be verified');
        return false;
      }

      logger.info('OK Token refreshed successfully');
      return true;
    } catch (_error) {
      logger.error('FAIL Token refresh error:', _error);
      clearAuthStorage();
      setUser(null);
      return false;
    }
  };

  /**
   * Request a password reset email
   *
   * @param email - User email address
   * @returns Promise<boolean> - True if request successful
   */
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      if (!email) {
        logger.error('FAIL Password reset failed: Email is required');
        return false;
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // The API returns { message: ... } on success, not necessarily { success: true }
      if (response.ok) {
        logger.info('OK Password reset email sent');
        return true;
      }

      logger.error('FAIL Password reset request failed:', data.error || 'Unknown error');
      return false;
    } catch (_error) {
      logger.error('FAIL Password reset request error:', _error);
      return false;
    }
  };

  /**
   * Complete a password reset using a token
   *
   * @param token - Reset token from email
   * @param password - New password
   * @param confirmPassword - Password confirmation
   * @returns Promise<boolean> - True if reset successful
   */
  const completeReset = async (
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<boolean> => {
    try {
      // Validate inputs
      if (!token || !password || !confirmPassword) {
        logger.error('FAIL Password reset failed: All fields are required');
        return false;
      }

      if (password !== confirmPassword) {
        logger.error('FAIL Password reset failed: Passwords do not match');
        return false;
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        logger.info('OK Password reset completed successfully');
        return true;
      }

      logger.error('FAIL Password reset completion failed:', data.error || 'Unknown error');
      return false;
    } catch (_error) {
      logger.error('FAIL Password reset completion error:', _error);
      return false;
    }
  };

  /**
   * Change password for authenticated user
   *
   * @param data - Password update request data
   * @returns Promise<boolean> - True if change successful
   */
  const changePassword = async (data: PasswordUpdateRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        logger.info('OK Password changed successfully');

        // If requires re-authentication, log out
        if (responseData.requireReAuthentication) {
          logger.info('INFO Re-authentication required, logging out');
          await logout();
        }
        return true;
      }

      logger.error('FAIL Password change failed:', responseData.message || 'Unknown error');
      return false;
    } catch (_error) {
      logger.error('FAIL Password change error:', _error);
      return false;
    }
  };

  /**
   * Check if user has a specific permission
   * Supports both single permission and array of permissions
   *
   * @param permission - Permission string to check
   * @returns boolean - True if user has the permission
   *
   * @example
   * if (hasPermission('users.create')) {
   *   // User can create users
   * }
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // If no permissions array, deny access
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    // Check for ALL_ACCESS permission (god-mode)
    if (user.permissions.includes('ALL_ACCESS')) {
      return true;
    }

    // Check for specific permission
    return user.permissions.includes(permission);
  };

  /**
   * Check if user has a specific role
   * Handles role hierarchy and normalization for flexible role checking
   *
   * Role Hierarchy:
   * - SUPER_ADMIN (100): God-mode access to everything
   * - ADMIN (90): Full administrative access
   * - MANAGER (70): Management-level access
   * - TEACHER/STAFF (50): Standard user access
   * - STUDENT/PARENT (30): Limited access
   * - GUEST (10): Minimal access
   *
   * @param role - The role to check (case-insensitive, flexible formatting)
   * @returns boolean - True if user has the role or higher privilege
   *
   * @example
   * // SUPER_ADMIN user
   * hasRole('admin') -> true (god-mode grants all)
   * hasRole('teacher') -> true (100 >= 50)
   *
   * // TEACHER user
   * hasRole('teacher') -> true (exact match)
   * hasRole('student') -> true (50 >= 30, can help students)
   * hasRole('admin') -> false (50 < 90, correctly denied)
   */
  const hasRole = (role: string): boolean => {
    if (!user || !user.role) return false;

    // Normalize function: uppercase and remove underscores/spaces/hyphens
    const normalize = (str: string) => str.toUpperCase().replace(/[_\s-]/g, '');

    const normalizedUserRole = normalize(user.role);
    const normalizedCheckRole = normalize(role);

    // SUPER_ADMIN has god-mode access to EVERYTHING
    if (normalizedUserRole === 'SUPERADMIN') return true;

    // Define role hierarchy with numeric levels
    const roleHierarchy: Record<string, number> = {
      'SUPERADMIN': 100,
      'SYSTEMADMIN': 100,
      'ADMIN': 90,
      'INSTITUTIONADMIN': 80,
      'SCHOOLADMIN': 80,
      'LAADMIN': 80,
      'MANAGER': 70,
      'LAMANAGER': 70,
      'LACASEWORKER': 60,
      'SENCO': 60,
      'EP': 60,
      'EDUCATIONALPSYCHOLOGIST': 60,
      'RESEARCHER': 50,
      'TEACHER': 50,
      'STAFF': 50,
      'PARENT': 30,
      'STUDENT': 30,
      'GUEST': 10,
    };

    // Get hierarchy levels
    const userLevel = roleHierarchy[normalizedUserRole] || 0;
    const checkLevel = roleHierarchy[normalizedCheckRole] || 0;

    // If user's level is higher or equal to required level, grant access
    if (userLevel >= checkLevel) return true;

    // Fallback: Exact match after normalization
    return normalizedUserRole === normalizedCheckRole;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authError,
    clearAuthError,
    login,
    logout,
    signup,
    refreshToken,
    resetPassword,
    completeReset,
    changePassword,
    hasPermission,
    hasRole,
    verifyMfa,
    resendMfa,
  };
}

/**
 * Higher-order component to protect routes requiring authentication
 *
 * @param Component - The component to protect
 * @param requiredPermission - Optional permission required to access the component
 * @param requiredRole - Optional role required to access the component
 * @returns Protected component with authentication checks
 *
 * @example
 * export default withAuth(AdminDashboard, undefined, 'admin');
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string,
  requiredRole?: string
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, hasPermission, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Wait for loading to complete
      if (isLoading) return;

      // If not loading and no user, redirect to login
      if (!user) {
        logger.warn('WARNING Unauthenticated access attempt, redirecting to login');
        router.push('/login');
        return;
      }

      // If user exists but lacks required permissions/roles, redirect to home
      if (
        user &&
        ((requiredPermission && !hasPermission(requiredPermission)) ||
          (requiredRole && !hasRole(requiredRole)))
      ) {
        logger.warn('WARNING Unauthorized access attempt:', {
          userId: user.id,
          requiredPermission,
          requiredRole,
          userRole: user.role,
        });
        router.push('/');
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoading, router, hasPermission, hasRole]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    // No user - will redirect in useEffect
    if (!user) {
      return null;
    }

    // Check permissions/roles
    if (
      (requiredPermission && !hasPermission(requiredPermission)) ||
      (requiredRole && !hasRole(requiredRole))
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    // All checks passed, render component
    return <Component {...props} />;
  };
}
