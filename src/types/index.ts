// Export all types
export * from './Challenge';

export const SubscriptionTier = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  ESSENTIAL: 'ESSENTIAL',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
  RESEARCHER: 'RESEARCHER',
  PSYCHOLOGIST: 'PSYCHOLOGIST',
  CUSTOM: 'CUSTOM'
} as const;

export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

export const BillingCycle = {
  MONTHLY: 'MONTHLY',
  ANNUALLY: 'ANNUALLY',
  TERMLY: 'TERMLY'
} as const;

export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle];

export const UserType = {
  SCHOOL_USER: 'SCHOOL_USER',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  INDIVIDUAL_USER: 'INDIVIDUAL_USER',
  PSYCHOLOGIST_USER: 'PSYCHOLOGIST_USER',
  RESEARCHER_USER: 'RESEARCHER_USER'
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

export const UserRole = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  CANCELLED: 'CANCELLED',
  PAST_DUE: 'PAST_DUE',
  UNPAID: 'UNPAID',
  TRIALING: 'TRIALING',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',
  TRIAL: 'TRIAL'
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  userType: UserType;
  billingCycle?: BillingCycle;
  currentPeriodEnd?: string;
  quantity?: number;
  amount?: number;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  features?: string[];
}
