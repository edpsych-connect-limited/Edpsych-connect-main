/**
 * Type definitions for the institutional management module
 */

// Institution Types
export enum InstitutionSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  VERY_LARGE = 'VERY_LARGE'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface InstitutionBase {
  name: string;
  type: string;
  size: string;
  address?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email: string;
  website?: string;
  logoUrl?: string;
  notes?: string;
  tags?: string[];
  customFields?: any;
  isActive: boolean;
  verificationStatus: string;
  verifiedAt?: Date | null;
  createdBy?: string | null;
}

export interface Institution extends InstitutionBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InstitutionSubscription {
  id: string;
  institutionId: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface CreateInstitutionInput extends InstitutionBase {
  primaryContactFirstName: string;
  primaryContactLastName: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  primaryContactRole?: string;
}

export interface UpdateInstitutionInput extends Partial<InstitutionBase> {
  id: string;
}

export interface InstitutionFilter {
  type?: string;
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
  verificationStatus?: VerificationStatus;
  search?: string;
  country?: string;
  state?: string;
}

// Department Types
export enum DepartmentType {
  ACADEMIC = 'ACADEMIC',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  RESEARCH = 'RESEARCH',
  SUPPORT = 'SUPPORT',
  SPECIAL = 'SPECIAL'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST'
}

export interface DepartmentBase {
  name: string;
  description?: string;
  type: string;
  parentDepartmentId?: string | null;
  headOfDepartmentId?: string | null;
  isActive: boolean;
  status: string;
}

export interface Department extends DepartmentBase {
  id: string;
  institutionId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateDepartmentInput extends DepartmentBase {
  institutionId: string;
  type: DepartmentType;
}

export interface UpdateDepartmentInput extends Partial<DepartmentBase> {
  id: string;
}

export interface DepartmentFilter {
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  parentDepartmentId?: string | null;
}

// Contact Types
export interface ContactBase {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimaryContact?: boolean;
  jobTitle?: string;
  notes?: string;
  id?: string;
  institutionId: string;
  departmentId?: string | null;
  isActive: boolean;
}

export interface CreateContactInput extends ContactBase {
  institutionId: string;
}

export interface UpdateContactInput extends Partial<ContactBase> {
  id: string;
}

export interface ContactFilter {
  role?: string;
  isPrimary?: boolean;
  id?: string;
  search?: string;
}

// Subscription Types
export interface SubscriptionBase {
  plan: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  startDate: Date;
  endDate: Date;
  licenseCount: number;
  price: number;
  status: SubscriptionStatus;
  paymentMethod: 'CREDIT_CARD' | 'INVOICE' | 'BANK_TRANSFER' | 'OTHER';
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  notes?: string;
  autoRenew: boolean;
  discountPercentage?: number;
  discountCode?: string;
}

export interface CreateSubscriptionInput extends Omit<SubscriptionBase, 'startDate' | 'endDate' | 'price'> {
  institutionId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateSubscriptionInput extends Partial<SubscriptionBase> {
  id: string;
}

export interface SubscriptionFilter {
  status?: SubscriptionStatus;
  plan?: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  autoRenew?: boolean;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  timestamp: Date;
  actionType: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  institutionId: string;
  institutionName?: string;
  details: any;
}

// User Activity Types
export interface UserActivity {
  id: string;
  userId: string;
  actionType: string;
  contentType: string;
  contentId: string;
  createdAt: Date;
  duration?: number;
  completionPercentage?: number;
  metadata?: any;
  institutionId?: string;
}

export interface UserInterest {
  id: string;
  userId: string;
  category: string;
  topic: string;
  strengthScore: number;
  lastUpdated: Date;
}

// Content Types
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  contentType: string;
  tags?: string[];
  url: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  authorId?: string;
  isPublic: boolean;
  metadata?: any;
}

// Professional Development Types
export interface ProfessionalDevelopmentRecommendation {
  id: string;
  title: string;
  description: string;
  contentType: string;
  relevanceScore: number;
  tags: string[];
  url: string;
  imageUrl?: string;
  source: string;
}

// Permission Types
export interface UserPermission {
  id: string;
  permission: string;
  resource: string;
  resourceId?: string;
  granted: boolean;
}

// Reference tables for SQL Server compatibility
export interface ReferenceType {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export type InstitutionType = ReferenceType;
export type ContactRole = ReferenceType;
export type PaymentMethod = ReferenceType;
export type BillingCycle = ReferenceType;

// Subscription Plan Enum
export enum SubscriptionPlan {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM'
}
