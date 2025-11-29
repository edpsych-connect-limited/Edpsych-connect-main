'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  role?: string;
  isOnboarded?: boolean;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  hasRole: (role: string) => boolean;
  token: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage key
const SESSION_KEY = 'edpsych_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from API
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: data.user.role,
            roles: data.user.roles || (data.user.role ? [data.user.role] : []),
            isOnboarded: data.user.isOnboarded,
            organizationId: data.user.organizationId,
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from existing session
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Restore token from session storage if available
          const storedSession = sessionStorage.getItem(SESSION_KEY);
          if (storedSession) {
            try {
              const session = JSON.parse(storedSession);
              setToken(session.token || null);
            } catch {
              // Invalid stored session, clear it
              sessionStorage.removeItem(SESSION_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || data.message || 'Login failed. Please check your credentials.' 
        };
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role,
          roles: data.user.roles || (data.user.role ? [data.user.role] : []),
          isOnboarded: data.user.isOnboarded,
          organizationId: data.user.organizationId,
        };
        
        setUser(userData);
        
        // Store token if provided
        if (data.token) {
          setToken(data.token);
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: data.token }));
        }
        
        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API fails
    } finally {
      // Always clear client-side state
      setUser(null);
      setToken(null);
      sessionStorage.removeItem(SESSION_KEY);
      setLoading(false);
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const refreshUser = async () => {
    const currentUser = await fetchCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    // Check both roles array and single role
    if (user.roles?.includes(role)) return true;
    if (user.role === role) return true;
    // Also check case-insensitive
    if (user.roles?.some(r => r.toLowerCase() === role.toLowerCase())) return true;
    if (user.role?.toLowerCase() === role.toLowerCase()) return true;
    return false;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout, 
        loading, 
        hasRole, 
        token,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}