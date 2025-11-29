import { UserRole } from '@edpsych-connect-world/auth';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      id?: string;
      organizationId?: string;
      permissions?: string[];
      isActive: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    expires: string;
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    role: UserRole;
    id?: string;
    organizationId?: string;
    yearGroup?: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
      bio?: string;
    };
    permissions?: string[];
    isActive: boolean;
    lastLoginAt?: Date;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string;
    role: UserRole;
    id?: string;
    organizationId?: string;
    permissions?: string[];
    isActive: boolean;
  }
}