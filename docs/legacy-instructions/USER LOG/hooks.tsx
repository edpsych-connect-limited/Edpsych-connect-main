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

import { useState, useEffect, useContext, createContext } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, PasswordUpdateRequest } from './types';
import { secureStore, secureRetrieve, secureRemove, clearAuthStorage } from '../../utils/encryption';
import { logger } from '../../utils/logger';

/**
 * Authentication Context Type Definition
 */
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
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
  const router = useRouter();

  /**
   * Check authentication status on mount
   * Loads stored tokens and user data from storage
   */
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized) return;

    const checkAuth = () => {
      try {
        logger.info('🔍 Checking authentication status...');
        setIsLoading(true);

        // Check for stored access token (synchronous)
        const storedToken = secureRetrieve('accessToken');
        
        if (!storedToken) {
          logger.info('❌ No access token found');
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        logger.info('✅ Access token found');

        // Get stored user data (synchronous)
        const userData = secureRetrieve('userData');

        // Validate user data
        if (userData && userData.id) {
          logger.info('✅ User data loaded:', { 
            email: userData.email, 
            role: userData.role,
            userId: userData.id 
          });
          setUser(userData);
        } else {
          logger.warn('⚠️ Token exists but no valid user data');
          // Clear invalid tokens
          clearAuthStorage();
          setUser(null);
        }
      } catch (error) {
        logger.error('❌ Authentication check failed:', error);
        setUser(null);
        clearAuthStorage();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        logger.info('✅ Authentication check complete');
      }
    };

    // Run authentication check immediately
    checkAuth();
  }, [isInitialized]);

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
      logger.info('🔐 Starting login process:', { email });

      // Validate inputs
      if (!email || !password) {
        logger.error('❌ Login failed: Email and password are required');
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
        logger.error('❌ Login failed:', data.message || 'Unknown error');
        return false;
      }

      logger.info('✅ Login API successful');

      // Store tokens and user data (synchronous - works for ALL users)
      try {
        secureStore('accessToken', data.data.accessToken);
        logger.info('✅ Stored accessToken');
        
        secureStore('refreshToken', data.data.refreshToken);
        logger.info('✅ Stored refreshToken');
        
        secureStore('userData', data.data.user);
        logger.info('✅ Stored userData');
      } catch (storageError) {
        logger.error('❌ Failed to store auth data:', storageError);
        return false;
      }

      // Update state with user data
      setUser(data.data.user);
      logger.info('✅ Login successful:', { 
        userId: data.data.user.id, 
        email: data.data.user.email,
        role: data.data.user.role 
      });
      
      return true;
    } catch (error) {
      logger.error('❌ Login error:', error);
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
      logger.info('📝 Starting signup process');

      // Basic validation
      if (!userData.email || !userData.password) {
        logger.error('❌ Signup failed: Email and password are required');
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
        logger.error('❌ Signup failed:', data.message || 'Unknown error');
        return false;
      }

      // Store tokens and user data
      secureStore('accessToken', data.data.accessToken);
      secureStore('refreshToken', data.data.refreshToken);
      secureStore('userData', data.data.user);

      // Update state
      setUser(data.data.user);

      logger.info('✅ Signup successful:', { 
        userId: data.data.user.id, 
        email: data.data.user.email 
      });
      return true;
    } catch (error) {
      logger.error('❌ Signup error:', error);
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
      const token = secureRetrieve('accessToken');

      // Attempt to invalidate token on server (don't block on failure)
      if (token) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          // Log but don't prevent logout
          logger.warn('⚠️ Server logout failed, continuing with local logout:', error);
        }
      }

      // Clear all authentication data
      clearAuthStorage();

      // Update state
      setUser(null);

      // Redirect to login page
      logger.info('✅ User logged out successfully');
      router.push('/login');
    } catch (error) {
      logger.error('❌ Logout error:', error);
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
        logger.error('❌ Token refresh failed: No refresh token found');
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
        logger.error('❌ Token refresh failed:', data.message || 'Unknown error');
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

      logger.info('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      logger.error('❌ Token refresh error:', error);
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
        logger.error('❌ Password reset failed: Email is required');
        return false;
      }

      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        logger.info('✅ Password reset email sent');
        return true;
      }

      logger.error('❌ Password reset request failed:', data.message || 'Unknown error');
      return false;
    } catch (error) {
      logger.error('❌ Password reset request error:', error);
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
        logger.error('❌ Password reset failed: All fields are required');
        return false;
      }

      if (password !== confirmPassword) {
        logger.error('❌ Password reset failed: Passwords do not match');
        return false;
      }

      const response = await fetch('/api/auth/password/reset', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        logger.info('✅ Password reset completed successfully');
        return true;
      }

      logger.error('❌ Password reset completion failed:', data.message || 'Unknown error');
      return false;
    } catch (error) {
      logger.error('❌ Password reset completion error:', error);
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
      const token = secureRetrieve('accessToken');

      if (!token) {
        logger.error('❌ Password change failed: Not authenticated');
        return false;
      }

      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        logger.info('✅ Password changed successfully');
        
        // If requires re-authentication, log out
        if (responseData.requireReAuthentication) {
          logger.info('ℹ️ Re-authentication required, logging out');
          await logout();
        }
        return true;
      }

      logger.error('❌ Password change failed:', responseData.message || 'Unknown error');
      return false;
    } catch (error) {
      logger.error('❌ Password change error:', error);
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
   * hasRole('admin') → true (god-mode grants all)
   * hasRole('teacher') → true (100 >= 50)
   * 
   * // TEACHER user
   * hasRole('teacher') → true (exact match)
   * hasRole('student') → true (50 >= 30, can help students)
   * hasRole('admin') → false (50 < 90, correctly denied)
   */
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    // Normalize function: uppercase and remove underscores/spaces/hyphens
    const normalize = (str: string) => str.toUpperCase().replace(/[_\s-]/g, '');
    
    const normalizedUserRole = normalize(user.role);
    const normalizedCheckRole = normalize(role);
    
    // SUPER_ADMIN has god-mode access to EVERYTHING
    if (normalizedUserRole === 'SUPERADMIN') return true;
    
    // Define role hierarchy with numeric levels
    const roleHierarchy: Record<string, number> = {
      'SUPERADMIN': 100,
      'ADMIN': 90,
      'MANAGER': 70,
      'TEACHER': 50,
      'STAFF': 50,
      'STUDENT': 30,
      'PARENT': 30,
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
    login,
    logout,
    signup,
    refreshToken,
    resetPassword,
    completeReset,
    changePassword,
    hasPermission,
    hasRole,
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
        logger.warn('⚠️ Unauthenticated access attempt, redirecting to login');
        router.push('/login');
        return;
      }

      // If user exists but lacks required permissions/roles, redirect to home
      if (
        user &&
        ((requiredPermission && !hasPermission(requiredPermission)) ||
          (requiredRole && !hasRole(requiredRole)))
      ) {
        logger.warn('⚠️ Unauthorized access attempt:', {
          userId: user.id,
          requiredPermission,
          requiredRole,
          userRole: user.role,
        });
        router.push('/');
      }
    }, [user, isLoading, router, hasPermission, hasRole, requiredPermission, requiredRole]);

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
            <p className="text-gray-600">You don’t have permission to access this page.</p>
          </div>
        </div>
      );
    }

    // All checks passed, render component
    return <Component {...props} />;
  };
}
