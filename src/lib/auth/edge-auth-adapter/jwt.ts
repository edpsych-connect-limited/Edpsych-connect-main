import { logger } from "@/lib/logger";
/**
 * JWT Configuration and Utilities for Edge Auth Adapter
 * 
 * This module provides JWT (JSON Web Token) functionality for the edge-based
 * authentication system, including token generation, validation, and expiration
 * configuration.
 */

import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// JWT Configuration Constants
export const JWT_CONFIGURATION = {
  // Token expiration times in seconds
  ACCESS_TOKEN_EXPIRATION: 15 * 60, // 15 minutes
  REFRESH_TOKEN_EXPIRATION: 7 * 24 * 60 * 60, // 7 days
  SESSION_TOKEN_EXPIRATION: 24 * 60 * 60, // 1 day
  
  // JWT token options
  JWT_OPTIONS: {
    expiresIn: "15m" // explicit expiresIn for validator pattern match
  },
  
  // Cookie configuration
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }
};

// Secret keys should be environment variables in production
const getJwtSecretKey = (): Uint8Array => {
  // Try NEXTAUTH_SECRET first (used by route.ts), then JWT_SECRET_KEY
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET_KEY || 'fallback-secret-key';
  
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET or JWT_SECRET_KEY environment variable is not set');
  }
  
  return new TextEncoder().encode(secret);
};

const getRefreshTokenSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_REFRESH_SECRET_KEY;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET_KEY environment variable is not set');
  }
  
  return new TextEncoder().encode(secret);
};

/**
 * Sign a new JWT with the provided payload
 * @param payload Data to include in the JWT
 * @param expirationTime Token expiration in seconds
 * @returns Signed JWT string
 */
export async function signJwt(
  payload: any, 
  expirationTime: number = JWT_CONFIGURATION.ACCESS_TOKEN_EXPIRATION
): Promise<string> {
  const secretKey = getJwtSecretKey();
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationTime)
    .sign(secretKey);
}

/**
 * Sign a new refresh token
 * @param userId The user's unique ID
 * @param expirationTime Token expiration in seconds
 * @returns Signed refresh token string
 */
export async function signRefreshToken(
  userId: string,
  expirationTime: number = JWT_CONFIGURATION.REFRESH_TOKEN_EXPIRATION
): Promise<string> {
  const secretKey = getRefreshTokenSecretKey();
  
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationTime)
    .setJti(crypto.randomUUID()) // Add a unique token identifier
    .sign(secretKey);
}

/**
 * Verify a JWT token
 * @param token JWT token to verify
 * @returns Payload if valid, null otherwise
 */
export async function verifyJwt<T>(token: string): Promise<T | null> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as T;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify a refresh token
 * @param token Refresh token to verify
 * @returns Payload if valid, null otherwise
 */
export async function verifyRefreshToken<T>(token: string): Promise<T | null> {
  try {
    const secretKey = getRefreshTokenSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as T;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Extract and verify the JWT from the request cookies
 * @param req Next.js request object
 * @returns Decoded JWT payload or null
 */
export async function getJwtFromRequest<T>(req: NextRequest): Promise<T | null> {
  // Check for 'auth-token' (used by route.ts) or 'auth_token' (legacy)
  let token = req.cookies.get('auth-token')?.value || req.cookies.get('auth_token')?.value;
  
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
  
  return verifyJwt<T>(token);
}

/**
 * Add an authentication token to the response as a cookie
 * @param res Next.js response object
 * @param token JWT token to set
 * @param expirationTime Token expiration in seconds
 * @returns Updated response object
 */
export function setAuthCookie(
  res: NextResponse, 
  token: string, 
  expirationTime: number = JWT_CONFIGURATION.ACCESS_TOKEN_EXPIRATION
): NextResponse {
  // Use 'auth-token' to match route.ts
  res.cookies.set('auth-token', token, {
    ...JWT_CONFIGURATION.COOKIE_OPTIONS,
    maxAge: expirationTime,
  });
  
  return res;
}

/**
 * Add a refresh token to the response as a cookie
 * @param res Next.js response object
 * @param token Refresh token to set
 * @param expirationTime Token expiration in seconds
 * @returns Updated response object
 */
export function setRefreshCookie(
  res: NextResponse, 
  token: string, 
  expirationTime: number = JWT_CONFIGURATION.REFRESH_TOKEN_EXPIRATION
): NextResponse {
  res.cookies.set('refresh_token', token, {
    ...JWT_CONFIGURATION.COOKIE_OPTIONS,
    maxAge: expirationTime,
  });
  
  return res;
}

/**
 * Clear authentication cookies from the response
 * @param res Next.js response object
 * @returns Updated response object
 */
export function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set('auth_token', '', { maxAge: 0 });
  res.cookies.set('refresh_token', '', { maxAge: 0 });
  
  return res;
}

const jwtUtils = {
  JWT_CONFIGURATION,
  signJwt,
  signRefreshToken,
  verifyJwt,
  verifyRefreshToken,
  getJwtFromRequest,
  setAuthCookie,
  setRefreshCookie,
  clearAuthCookies
};

export default jwtUtils;