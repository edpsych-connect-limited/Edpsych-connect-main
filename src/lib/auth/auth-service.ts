/**
 * Authentication Service
 * 
 * Comprehensive authentication service for EdPsych Connect platform,
 * supporting multiple authentication methods and role-based access.
 */

import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

// Types
export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'educator' | 'researcher' | 'student';
  organization?: string;
  permissions: string[];
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  sessionId: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: UserSession;
  error?: string;
  token?: string;
}

// Constants
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only'
);

const TOKEN_EXPIRY = '8h';
const COOKIE_NAME = 'edpsych_auth_token';

/**
 * Authenticate a user with email and password
 * @param email User email
 * @param password User password
 * @returns Authentication result with user session and token
 */
const authService = {
  authenticateUser,
  generateToken,
  verifyToken,
  getSessionFromRequest,
  getSession,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  hasPermissions,
  requirePermissions
};

export default authService;

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    // In production, this would verify against a database
    // For now, implement a simple demo authentication
    
    // Demo accounts for testing
    const demoUsers = [
      {
        id: 'admin-1',
        email: 'admin@edpsych-connect.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin' as const,
        permissions: ['manage_users', 'view_analytics', 'manage_content'],
        subscriptionTier: 'enterprise' as const
      },
      {
        id: 'teacher-1',
        email: 'teacher@edpsych-connect.com',
        password: 'teacher123',
        name: 'Teacher User',
        role: 'educator' as const,
        organization: 'Sample School',
        permissions: ['create_resources', 'view_resources'],
        subscriptionTier: 'premium' as const
      }
    ];
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    // Create user session
    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      permissions: user.permissions,
      subscriptionTier: user.subscriptionTier,
      sessionId: nanoid(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 // 8 hours
    };
    
    // Generate JWT token
    const token = await generateToken(session);
    
    return {
      success: true,
      user: session,
      token
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Generate JWT token for user session
 * @param session User session data
 * @returns JWT token string
 */
export async function generateToken(session: UserSession): Promise<string> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setJti(nanoid())
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Verify JWT token and return user session
 * @param token JWT token string
 * @returns User session if token is valid
 */
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });

    return payload as unknown as UserSession;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Get current user session from request
 * @param req Next.js request object
 * @returns User session if authenticated, null otherwise
 */
export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return await verifyToken(token);
}

/**
 * Get current user session from server component
 * @returns User session if authenticated, null otherwise
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return await verifyToken(token);
}

/**
 * Set authentication cookie
 * @param token JWT token string
 */
export function setAuthCookie(token: string): void {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/'
  });
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(): void {
  cookies().delete(COOKIE_NAME);
}

/**
 * Require authentication for a route
 * Redirects to login page if not authenticated
 */
export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return session;
}

/**
 * Check if user has required permissions
 * @param session User session
 * @param requiredPermissions List of required permissions
 * @returns True if user has all required permissions
 */
export function hasPermissions(session: UserSession, requiredPermissions: string[]): boolean {
  if (!session || !session.permissions) return false;
  
  return requiredPermissions.every(perm => session.permissions.includes(perm));
}

/**
 * Require specific permissions for a route
 * Redirects to unauthorized page if permissions are insufficient
 * @param requiredPermissions List of required permissions
 */
export async function requirePermissions(requiredPermissions: string[]): Promise<UserSession> {
  const session = await requireAuth();
  
  if (!hasPermissions(session, requiredPermissions)) {
    redirect('/unauthorized');
  }
  
  return session;
}