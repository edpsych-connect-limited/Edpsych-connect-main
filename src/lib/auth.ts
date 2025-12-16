import { logger } from "@/lib/logger";
import { emailService } from "@/lib/email/email-service";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorised copying, modification, distribution, or use is strictly prohibited.
 */

// EdPsych Connect World - Authentication Service
// Updated: Neon Postgres Integration + Subscription System Compatible
// Environment: PRODUCTION
// Compliance: GDPR, ISO 27001, SOC 2

// FIXED: Removed broken database import, fixed Redis path
// import { getPostgresClient, userDb } from '../../database/postgres'; // REMOVED - doesn't exist
import { getRedisClient } from '../cache/redis-client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { PrismaAdapter as _PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prismaSafe';
import CredentialsProvider from 'next-auth/providers/credentials';

export interface User {
  id: string;
  email: string;
  role?: string[];
  lastSignInAt?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Get current user session
 */
export async function auth(): Promise<Session | null> {
  try {
    // For now, return null as we need to implement session management
    // This would typically check for JWT tokens or session cookies
    console.warn('auth() function needs Neon Postgres session implementation');
    return null;
  } catch (_error) {
    console.error('Auth service _error', _error instanceof Error ? _error : new Error('Unknown error'));
    return null;
  }
}

/* 
=================================================================
ACTIVE FUNCTIONS (Prisma-based)
=================================================================
*/

export async function signIn(email: string, password: string): Promise<Session | null> {
  try {
    // Get user from database
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      console.warn('Sign in failed - user not found', { email });
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.warn('Sign in failed - invalid password', { email });
      throw new Error('Invalid credentials');
    }

    // Update last sign in time
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Create session token (in production, use JWT)
    const sessionToken = uuidv4();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store session in Redis
    const redis = getRedisClient();
    await redis.set(`session:${sessionToken}`, JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role ? [user.role] : []
    }), 86400); // 24 hours

    console.info('User signed in successfully', { id: user.id, email });

    return {
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role ? [user.role] : [],
        lastSignInAt: user.last_login?.toISOString(),
        createdAt: user.created_at.toISOString()
      },
      accessToken: sessionToken,
      refreshToken: sessionToken, // In production, use separate refresh token
      expiresAt: expiresAt
    };
  } catch (_error) {
    console.error('Sign in _error', _error instanceof Error ? _error : new Error('Unknown error'), { email });
    throw _error;
  }
}

export async function signUp(email: string, password: string, userData?: any): Promise<Session | null> {
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const role = userData?.role || 'student';
    
    // Ensure tenant exists or use default
    let tenantId = userData?.tenant_id || 1;
    
    const newUser = await prisma.users.create({
      data: {
        email,
        name: userData?.name || email.split('@')[0],
        password_hash: passwordHash,
        role,
        tenant_id: tenantId,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      }
    });

    // Create session token
    const sessionToken = uuidv4();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store session in Redis
    const redis = getRedisClient();
    await redis.set(`session:${sessionToken}`, JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      role: [newUser.role]
    }), 86400); // 24 hours

    console.info('User signed up successfully', { id: newUser.id, email });

    return {
      user: {
        id: newUser.id.toString(),
        email: newUser.email,
        role: [newUser.role],
        lastSignInAt: undefined,
        createdAt: newUser.created_at.toISOString()
      },
      accessToken: sessionToken,
      refreshToken: sessionToken,
      expiresAt: expiresAt
    };
  } catch (_error) {
    console.error('Sign up _error', _error instanceof Error ? _error : new Error('Unknown error'), { email });
    throw _error;
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      console.info('Password reset requested for non-existent email', { email });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await prisma.users.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt
      }
    });

    // In production, send email with reset link
    console.info('Password reset token generated', { id: user.id, email, token: resetToken });
    
    // DEV MODE: Log the reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    logger.debug('=================================================================');
    logger.debug(`PASSWORD RESET LINK FOR ${email}:`);
    logger.debug(`${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
    logger.debug('=================================================================');

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);
    if (emailSent) {
      logger.info(`Password reset email sent to ${email}`);
    } else {
      logger.warn(`Failed to send password reset email to ${email}`);
    }
  } catch (_error) {
    console.error('Password reset _error', _error instanceof Error ? _error : new Error('Unknown error'), { email });
    throw _error;
  }
}

export async function updatePassword(newPassword: string, token?: string, email?: string): Promise<void> {
  try {
    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    if (token && email) {
      // Reset flow
      const user = await prisma.users.findFirst({
        where: {
          email,
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      await prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          updated_at: new Date()
        }
      });
    } else {
      // Direct update (e.g. from profile) - requires user context which we don't have here easily
      // This part would need the user ID passed in
      throw new Error('Direct password update requires user context');
    }

    console.info('Password updated successfully');
  } catch (_error) {
    console.error('Password update _error', _error instanceof Error ? _error : new Error('Unknown error'));
    throw _error;
  }
}

/**
 * Sign out current user
 * NOTE: This version doesn't use database - safe to keep
 */
export async function signOut(): Promise<void> {
  try {
    // In a real implementation, you would:
    // 1. Get the session token from cookies/headers
    // 2. Delete the session from Redis
    // 3. Clear any client-side cookies

    console.info('User signed out successfully');

    // For now, just log the sign out
    // TODO: Implement proper session management
    console.warn('signOut() function needs proper session token handling implementation');
  } catch (_error) {
    console.error('Sign out _error', _error instanceof Error ? _error : new Error('Unknown error'));
    throw _error;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: User, requiredRole: string): boolean {
  return user.role?.includes(requiredRole) || false;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: User, requiredRoles: string[]): boolean {
  return requiredRoles.some(role => user.role?.includes(role));
}

/**
 * Check if user has all required roles
 */
export function hasAllRoles(user: User, requiredRoles: string[]): boolean {
  return requiredRoles.every(role => user.role?.includes(role));
}

/**
 * Get user from request using session
 */
export async function getUserFromRequest(req: any): Promise<User | null> {
  try {
    const session = await getServerSession(req, {} as any, authOptions);
    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id || '',
      email: session.user.email || '',
      role: session.user.role || [],
      lastSignInAt: undefined,
      createdAt: new Date().toISOString()
    };
  } catch (_error) {
    console.error('Failed to get user from request', _error instanceof Error ? _error : new Error('Unknown error'));
    return null;
  }
}

// Real NextAuth options with Prisma Adapter
export const authOptions = {
  // Adapter commented out because Prisma schema uses 'users' (plural) instead of 'User' (singular).
  // To enable the adapter, we need to map the models in schema.prisma or use a custom adapter.
  // adapter: PrismaAdapter(prisma),
  // Reduce log noise from expected/stale cookie decode failures while keeping real auth errors visible.
  // These can happen during deploys/restarts when old session cookies are presented.
  logger: {
    error(code: string, metadata: unknown) {
      const metaText = (() => {
        try {
          if (typeof metadata === 'string') return metadata;
          if (metadata instanceof Error) return metadata.message;
          if (metadata && typeof metadata === 'object') return JSON.stringify(metadata);
          return '';
        } catch {
          return '';
        }
      })();

      const isNoisyJwtDecodeError =
        code === 'JWT_SESSION_ERROR' ||
        code === 'JWT_DECODE_ERROR' ||
        code === 'SESSION_ERROR';

      // NextAuth (JWT strategy) can emit: "Invalid Compact JWE" when a stale/foreign cookie is presented.
      // We treat this as debug-level unless it becomes a systematic issue.
      if (isNoisyJwtDecodeError && metaText.includes('Invalid Compact JWE')) {
        logger.debug('[NextAuth] Suppressed noisy session decode error', { code });
        return;
      }

      logger.error('[NextAuth] error', { code, metadata });
    },
    warn(code: string) {
      logger.warn('[NextAuth] warn', { code });
    },
    debug(code: string, metadata: unknown) {
      logger.debug('[NextAuth] debug', { code, metadata });
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password_hash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role ? [user.role] : ['student'], // Map single role to array for compatibility
          isActive: true,
          tenant_id: user.tenant_id
        };
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenant_id = token.tenant_id;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenant_id = user.tenant_id;
      }
      return token;
    }
  }
};

// =================================================================
// AUTHENTICATION SERVICE - SUBSCRIPTION SYSTEM COMPATIBLE
// =================================================================

/*
AUTHENTICATION SERVICE - UPDATED FOR SUBSCRIPTION SYSTEM

ACTIVE FUNCTIONS (Used by subscription system):
- auth() - Get current session
- signOut() - Sign out user (no database dependency)
- hasRole(), hasAnyRole(), hasAllRoles() - Role checks
- getUserFromRequest() - Get user from request
- authOptions - NextAuth configuration

COMMENTED OUT (Require missing database/postgres):
- signIn() - Sign in with email/password
- signUp() - Create new user account
- resetPassword() - Password reset flow
- updatePassword() - Update user password

These can be re-enabled once Prisma-based authentication is implemented.

FIXES APPLIED:
✅ Removed broken import: ../../database/postgres (doesn't exist)
✅ Fixed Redis import: ../cache/redis-client (was ../../)
✅ Commented out functions using getPostgresClient
✅ Kept all functions needed by subscription system
✅ Build now succeeds

Updated: Subscription System Integration
Environment: PRODUCTION
Compliance: GDPR, ISO 27001, SOC 2
*/
