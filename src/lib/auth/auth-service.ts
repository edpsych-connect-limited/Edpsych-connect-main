import { logger } from "@/lib/logger";
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
import prisma from '@/lib/prismaSafe';
import bcrypt from 'bcryptjs';

// Types
export interface UserSession {
  id: string;
  user_id?: string; // Backwards compatibility alias for id
  email: string;
  name: string;
  role: 'admin' | 'educator' | 'researcher' | 'student';
  organization?: string;
  permissions: string[];
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  sessionId: string;
  tenant_id?: number; // Multi-tenancy support
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
  process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret-key'
);

const TOKEN_EXPIRY = '8h';
const COOKIE_NAME = 'auth-token';

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
  requirePermissions,
  verifyAuth
};

export default authService;

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Find user in database
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        tenants: {
          include: {
            subscriptions: {
              where: { is_active: true },
              take: 1
            }
          }
        }
      }
    });
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Determine subscription tier from tenant
    let subscriptionTier: 'free' | 'premium' | 'enterprise' = 'free';
    const activeSubscription = user.tenants?.subscriptions?.[0];
    
    if (activeSubscription) {
      const tier = activeSubscription.tier;
      if (tier === 'ENTERPRISE_CUSTOM' || tier === 'LA_TIER3') {
        subscriptionTier = 'enterprise';
      } else if (tier !== 'FREE') {
        subscriptionTier = 'premium';
      }
    }
    
    // Create user session
    const session: UserSession = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: (user.role as any) || 'student', // Cast to any to satisfy strict union type
      organization: user.tenants?.name,
      permissions: user.permissions,
      subscriptionTier: subscriptionTier,
      sessionId: nanoid(),
      tenant_id: user.tenant_id,
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
  } catch (_error) {
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
    logger.debug('[AuthService] Verifying token:', token.substring(0, 20) + '...');
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
    logger.debug('[AuthService] Token verified successfully');
    return payload as unknown as UserSession;
  } catch (_error) {
    console.error('[AuthService] Token verification error:', error);
    return null;
  }
}

/**
 * Get current user session from request
 * @param req Next.js request object
 * @returns User session if authenticated, null otherwise
 */
export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  let token = req.cookies.get(COOKIE_NAME)?.value;
  
  // If no cookie, check Authorization header
  if (!token) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
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

/**
 * Lightweight authentication verification for API routes
 * Returns authentication status and user data in a simplified format
 *
 * @param request Next.js request object
 * @returns Authentication result with isValid flag and user data
 *
 * @example
 * ```typescript
 * const authResult = await verifyAuth(request);
 * if (!authResult.isValid) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * const userId = authResult.user.id;
 * ```
 */
export interface VerifyAuthResult {
  isValid: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    tenant_id?: number;
  };
  error?: string;
}

export async function verifyAuth(request: NextRequest): Promise<VerifyAuthResult> {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return {
        isValid: false,
        error: 'No valid session found'
      };
    }

    // Map session to expected format
    // Note: This converts string IDs to numbers for database compatibility
    return {
      isValid: true,
      user: {
        id: parseInt(session.id),
        email: session.email,
        name: session.name,
        role: session.role,
        tenant_id: session.tenant_id
      }
    };
  } catch (_error) {
    console.error('[verifyAuth] Authentication error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}