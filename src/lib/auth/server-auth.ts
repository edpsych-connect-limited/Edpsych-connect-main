/**
 * Server-side Authentication Service
 * Enterprise-grade authentication with multi-tenant support
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    preferences: Record<string, any>;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    loginCount: number;
    isActive: boolean;
    requiresPasswordChange: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: {
    branding: {
      logo: string;
      primaryColor: string;
      secondaryColor: string;
    };
    features: Record<string, boolean>;
    limits: {
      maxUsers: number;
      maxStorage: number;
      maxApiCalls: number;
    };
  };
  status: 'active' | 'suspended' | 'trial' | 'expired';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    subscriptionEndsAt?: Date;
  };
}

class ServerAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  // In production, this would be a database connection
  private users: Map<string, User> = new Map();
  private tenants: Map<string, Tenant> = new Map();
  private refreshTokens: Map<string, { userId: string; tenantId: string; expiresAt: Date }> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default tenant
    const defaultTenant: Tenant = {
      id: 'default',
      name: 'EdPsych Connect World',
      domain: 'edpsychconnect.app',
      settings: {
        branding: {
          logo: '/logo.png',
          primaryColor: '#0070f3',
          secondaryColor: '#7928ca'
        },
        features: {
          assessments: true,
          reports: true,
          analytics: true,
          multiTenant: false
        },
        limits: {
          maxUsers: 1000,
          maxStorage: 1000000,
          maxApiCalls: 100000
        }
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    this.tenants.set('default', defaultTenant);

    // Create default admin user
    const hashedPassword = bcrypt.hashSync('admin123', 12);
    const adminUser: User = {
      id: 'admin-001',
      email: 'admin@edpsychconnect.app',
      tenantId: 'default',
      roles: ['admin', 'superuser'],
      permissions: ['*'],
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        preferences: {}
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        loginCount: 0,
        isActive: true,
        requiresPasswordChange: false
      }
    };

    this.users.set('admin@edpsychconnect.app', adminUser);
  }

  /**
   * Authenticate user credentials
   */
  async authenticateUser(email: string, password: string, tenantId?: string): Promise<{ user: User; tokens: AuthTokens } | null> {
    try {
      const user = this.users.get(email);
      if (!user) {
        return null;
      }

      // Check if user belongs to the requested tenant
      if (tenantId && user.tenantId !== tenantId) {
        return null;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, 'hashed_password_placeholder'); // In real implementation, store hashed password
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      user.metadata.lastLoginAt = new Date();
      user.metadata.loginCount++;
      user.metadata.updatedAt = new Date();

      // Generate tokens
      const tokens = this.generateTokens(user);

      return { user, tokens };
    } catch (_error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: User): AuthTokens {
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
      permissions: user.permissions,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4()
    };

    const refreshTokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4()
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      this.JWT_SECRET,
      {
        expiresIn: this.JWT_EXPIRES_IN,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      this.JWT_REFRESH_SECRET,
      {
        expiresIn: this.JWT_REFRESH_EXPIRES_IN,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      tenantId: user.tenantId,
      expiresAt: refreshTokenExpiry
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      if (decoded.type !== 'refresh') {
        return null;
      }

      // Check if refresh token exists and is valid
      const storedToken = this.refreshTokens.get(refreshToken);
      if (!storedToken || storedToken.expiresAt < new Date()) {
        return null;
      }

      // Get user
      const user = this.users.get(decoded.sub);
      if (!user) {
        return null;
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Remove old refresh token
      this.refreshTokens.delete(refreshToken);

      return tokens;
    } catch (_error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      if (decoded.type !== 'access') {
        return null;
      }

      const user = this.users.get(decoded.sub);
      if (!user) {
        return null;
      }

      return user;
    } catch (_error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Create secure HTTP-only cookies
   */
  createAuthCookies(tokens: AuthTokens): { accessToken: string; refreshToken: string } {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      domain: '.edpsychconnect.com'
    };

    const accessTokenCookie = `accessToken=${tokens.accessToken}; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}; Max-Age=${tokens.expiresIn}`;

    const refreshTokenCookie = `refreshToken=${tokens.refreshToken}; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}; Max-Age=${7 * 24 * 60 * 60}`; // 7 days

    return {
      accessToken: accessTokenCookie,
      refreshToken: refreshTokenCookie
    };
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(): string {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/'
    };

    return `accessToken=; refreshToken=; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}; Max-Age=0`;
  }

  /**
   * Get tenant information
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(user: User, permission: string): Promise<boolean> {
    if (user.permissions.includes('*')) {
      return true;
    }

    if (user.roles.includes('admin') || user.roles.includes('superuser')) {
      return true;
    }

    return user.permissions.includes(permission);
  }

  /**
   * Check if user has role
   */
  async hasRole(user: User, role: string): Promise<boolean> {
    return user.roles.includes(role);
  }

  /**
   * Get user from request
   */
  async getUserFromRequest(request: NextRequest): Promise<User | null> {
    try {
      const token = request.cookies.get('accessToken')?.value;
      if (!token) {
        return null;
      }

      return await this.verifyToken(token);
    } catch (_error) {
      console.error('Error getting user from request:', error);
      return null;
    }
  }

  /**
   * Create API response with authentication
   */
  createAuthResponse(user: User, tokens: AuthTokens, options: { status?: number; data?: any } = {}): NextResponse {
    const cookies = this.createAuthCookies(tokens);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        roles: user.roles,
        profile: user.profile
      },
      ...options.data
    }, { status: options.status || 200 });

    response.headers.set('Set-Cookie', [cookies.accessToken, cookies.refreshToken].join(', '));

    return response;
  }

  /**
   * Create logout response
   */
  createLogoutResponse(): NextResponse {
    const clearCookie = this.clearAuthCookies();

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.headers.set('Set-Cookie', clearCookie);

    return response;
  }
}

// Export singleton instance
export const serverAuth = new ServerAuthService();
export default serverAuth;