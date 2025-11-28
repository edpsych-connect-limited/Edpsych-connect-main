import { logger } from "@/lib/logger";
/**
 * User role types for the platform
 */
export type UserRole = 
  | 'student'
  | 'parent'
  | 'teacher' 
  | 'school_admin'
  | 'edpsych'
  | 'researcher'
  | 'beta_tester'
  | 'admin';

/**
 * Subscription status types
 */
export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

/**
 * User subscription information
 */
export interface UserSubscription {
  tier: string;
  subscriptionId?: string;
  startDate: Date;
  endDate?: Date;
  status: SubscriptionStatus;
  inTrial?: boolean;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, any>;
  features?: string[];
  limits?: Record<string, number>;
}

/**
 * User interface representing authenticated users
 */
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  lastSignIn?: Date;
  metadata?: Record<string, any>;
  subscription?: UserSubscription;
  roles?: UserRole[];
  organizationId?: string;
}

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  name?: string;
  roles?: UserRole[];
  subscription?: {
    tier: string;
    status: SubscriptionStatus;
  };
  organizationId?: string;
  iat: number;
  exp: number;
}