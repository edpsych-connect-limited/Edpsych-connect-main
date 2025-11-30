import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError, AccessDeniedError } from './errors';
import { generateId } from '../../utils/id-generator';
import { 
  InstitutionSubscription,
  SubscriptionPlan,
  SubscriptionStatus
} from './types';

// Business rules for volume discount tiers
const VOLUME_DISCOUNT_TIERS = [
  { minLicenses: 1, maxLicenses: 9, discountPercentage: 0 },
  { minLicenses: 10, maxLicenses: 49, discountPercentage: 10 },
  { minLicenses: 50, maxLicenses: 99, discountPercentage: 15 },
  { minLicenses: 100, maxLicenses: 499, discountPercentage: 20 },
  { minLicenses: 500, maxLicenses: 999, discountPercentage: 25 },
  { minLicenses: 1000, maxLicenses: null, discountPercentage: 30 }
];

// Base prices for plans
const BASE_PRICES = {
  [SubscriptionPlan.BASIC]: 9.99,
  [SubscriptionPlan.STANDARD]: 19.99,
  [SubscriptionPlan.PROFESSIONAL]: 39.99,
  [SubscriptionPlan.ENTERPRISE]: 79.99,
  [SubscriptionPlan.CUSTOM]: 0 // Custom pricing is negotiated
};

export interface CreateSubscriptionInput {
  id: string; // Institution ID
  plan: SubscriptionPlan;
  licenseCount: number;
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  paymentMethod?: string;
  notes?: string;
  customDiscount?: number; // Optional override for calculated discount
  customPricePerLicense?: number; // Optional override for base price
}

export interface UpdateSubscriptionInput {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  licenseCount?: number;
  endDate?: Date;
  renewalDate?: Date;
  paymentMethod?: string;
  notes?: string;
  customDiscount?: number;
  customPricePerLicense?: number;
  cancelReason?: string;
}

export interface SubscriptionQueryOptions {
  id?: string; // Institution ID
  status?: SubscriptionStatus[];
  plan?: SubscriptionPlan[];
  isActive?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  minLicenseCount?: number;
  maxLicenseCount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Service for managing institution subscriptions
 */
export class SubscriptionService {
  /**
   * Create a new subscription
   */
  async createSubscription(data: CreateSubscriptionInput, userId: string): Promise<InstitutionSubscription> {
    try {
      // Validate input
      this.validateSubscriptionInput(data);
      
      // Check if institution exists
      const institution = await prisma.institution.findUnique({
        where: { id: data.id },
      });
      
      if (!institution) {
        throw new NotFoundError(`Institution with ID ${data.id} not found`);
      }
      
      // Verify user has permission to create subscriptions for this institution
      await this.verifyInstitutionAdminAccess(data.id, userId);
      
      // Calculate pricing
      const { pricePerLicense: _pricePerLicense, totalPrice, discountApplied } = this.calculatePricing(
        data.plan,
        data.licenseCount,
        data.customDiscount,
        data.customPricePerLicense
      );
      
      // Generate a unique ID for the subscription
      const subscriptionId = generateId('sub');
      
      // Create the subscription
      const subscription = await prisma.institutionSubscription.create({
        data: {
          id: subscriptionId,
          institutionId: data.id,
          plan: data.plan,
          status: SubscriptionStatus.ACTIVE,
          startDate: data.startDate,
          endDate: data.endDate,
          licenseCount: data.licenseCount,
          price: totalPrice, // Storing total price in 'price' field
          paymentMethod: data.paymentMethod || 'Invoice',
          notes: data.notes,
          discountPercentage: discountApplied,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      // Log the creation
      await this.logAuditEvent({
        action: 'SUBSCRIPTION_CREATED',
        entityType: 'InstitutionSubscription',
        entityId: subscription.id,
        description: `Subscription created for institution ${data.id}`,
        performedById: userId,
        institutionId: data.id,
        subscriptionId: subscription.id,
        metadata: { 
          plan: data.plan, 
          licenseCount: data.licenseCount,
          totalPrice
        },
      });
      
      return subscription as unknown as InstitutionSubscription;
    } catch (_error) {
      logger.error('Error creating subscription', { error, data });
      throw error;
    }
  }

  /**
   * Get a subscription by ID
   */
  async getSubscriptionById(userId: string, subscriptionId: string): Promise<InstitutionSubscription> {
    try {
      const subscription = await prisma.institutionSubscription.findUnique({
        where: { id: subscriptionId },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      if (!subscription) {
        throw new NotFoundError(`Subscription with ID ${subscriptionId} not found`);
      }
      
      // Verify user has access to view this subscription
      await this.verifySubscriptionAccess(subscription.institutionId, userId);
      
      return subscription as unknown as InstitutionSubscription;
    } catch (_error) {
      logger.error('Error fetching subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Get subscriptions with filtering, sorting, and pagination
   */
  async getSubscriptions(options: SubscriptionQueryOptions, userId: string): Promise<{ data: InstitutionSubscription[]; total: number; page: number; limit: number }> {
    try {
      // Default values
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {};
      
      // Filter by institution if provided
      if (options.id) {
        where.institutionId = options.id;
        // Verify access to this institution
        await this.verifySubscriptionAccess(options.id, userId);
      } else {
        // For listing all subscriptions, verify admin access
        await this.verifyAdminAccess(userId);
      }
      
      // Filter by status
      if (options.status && options.status.length > 0) {
        where.status = { in: options.status };
      }
      
      // Filter by plan
      if (options.plan && options.plan.length > 0) {
        where.plan = { in: options.plan };
      }
      
      // Filter by active status (based on dates and status field)
      if (options.isActive) {
        const now = new Date();
        where.status = 'ACTIVE';
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      }
      
      // Date range filters
      if (options.startDateFrom || options.startDateTo) {
        where.startDate = {};
        if (options.startDateFrom) where.startDate.gte = options.startDateFrom;
        if (options.startDateTo) where.startDate.lte = options.startDateTo;
      }
      
      if (options.endDateFrom || options.endDateTo) {
        where.endDate = {};
        if (options.endDateFrom) where.endDate.gte = options.endDateFrom;
        if (options.endDateTo) where.endDate.lte = options.endDateTo;
      }
      
      // License count filters
      if (options.minLicenseCount || options.maxLicenseCount) {
        where.licenseCount = {};
        if (options.minLicenseCount) where.licenseCount.gte = options.minLicenseCount;
        if (options.maxLicenseCount) where.licenseCount.lte = options.maxLicenseCount;
      }
      
      // Get subscriptions
      const subscriptions = await prisma.institutionSubscription.findMany({
        where,
        include: {
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: options.sortBy
          ? { [options.sortBy]: options.sortDirection || 'asc' }
          : { createdAt: 'desc' },
        skip,
        take: limit,
      });
      
      // Get total count
      const total = await prisma.institutionSubscription.count({ where });
      
      return {
        data: subscriptions as unknown as InstitutionSubscription[],
        total,
        page,
        limit,
      };
    } catch (_error) {
      logger.error('Error fetching subscriptions', { error, options });
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(userId: string, data: UpdateSubscriptionInput, subscriptionId: string): Promise<InstitutionSubscription> {
    try {
      // Get the subscription
      const subscription = await prisma.institutionSubscription.findUnique({
        where: { id: subscriptionId },
      });
      
      if (!subscription) {
        throw new NotFoundError(`Subscription with ID ${subscriptionId} not found`);
      }
      
      // Verify user has permission to update this subscription
      await this.verifySubscriptionUpdateAccess(subscription.institutionId, userId);
      
      // Calculate new pricing if license count or plan changed
      let totalPrice = subscription.price;
      let discountApplied = subscription.discountPercentage || 0;
      
      if (data.licenseCount || data.plan) {
        const plan = (data.plan || subscription.plan) as SubscriptionPlan;
        const licenseCount = data.licenseCount || subscription.licenseCount;
        
        const pricing = this.calculatePricing(
          plan,
          licenseCount,
          data.customDiscount !== undefined ? data.customDiscount : (subscription.discountPercentage || 0),
          data.customPricePerLicense // We don't store pricePerLicense in DB, so we can't default to existing
        );
        
        totalPrice = pricing.totalPrice;
        discountApplied = pricing.discountApplied;
      }
      
      // Handle subscription cancellation
      if (data.status === SubscriptionStatus.CANCELLED && subscription.status !== SubscriptionStatus.CANCELLED) {
        if (!data.cancelReason) {
          throw new ValidationError('Cancel reason is required when cancelling a subscription');
        }
      }
      
      // Update the subscription
      const updatedSubscription = await prisma.institutionSubscription.update({
        where: { id: subscriptionId },
        data: {
          plan: data.plan,
          status: data.status,
          licenseCount: data.licenseCount,
          endDate: data.endDate,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          price: totalPrice,
          discountPercentage: discountApplied,
          updatedAt: new Date(),
        },
      });
      
      // Log the update
      await this.logAuditEvent({
        action: 'SUBSCRIPTION_UPDATED',
        entityType: 'InstitutionSubscription',
        entityId: subscriptionId,
        description: `Subscription updated for institution ${subscription.institutionId}`,
        performedById: userId,
        institutionId: subscription.institutionId,
        subscriptionId: subscriptionId,
        metadata: { 
          updatedFields: Object.keys(data),
          newPlan: data.plan,
          newLicenseCount: data.licenseCount,
          newStatus: data.status,
          newTotalPrice: totalPrice
        },
      });
      
      return updatedSubscription as unknown as InstitutionSubscription;
    } catch (_error) {
      logger.error('Error updating subscription', { error, subscriptionId, data });
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, reason: string, subscriptionId: string): Promise<InstitutionSubscription> {
    try {
      // Get the subscription
      const subscription = await prisma.institutionSubscription.findUnique({
        where: { id: subscriptionId },
      });
      
      if (!subscription) {
        throw new NotFoundError(`Subscription with ID ${subscriptionId} not found`);
      }
      
      // Verify user has permission to cancel this subscription
      await this.verifySubscriptionUpdateAccess(subscription.institutionId, userId);
      
      // Cannot cancel an already cancelled subscription
      if (subscription.status === SubscriptionStatus.CANCELLED) {
        throw new ValidationError('Subscription is already cancelled');
      }
      
      // Update the subscription
      const updatedSubscription = await prisma.institutionSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELLED,
          notes: reason ? `${subscription.notes ? subscription.notes + '\n' : ''}Cancellation reason (${new Date().toISOString()}): ${reason}` : subscription.notes,
          updatedAt: new Date(),
        },
      });
      
      // Log the cancellation
      await this.logAuditEvent({
        action: 'SUBSCRIPTION_CANCELLED',
        entityType: 'InstitutionSubscription',
        entityId: subscriptionId,
        description: `Subscription cancelled for institution ${subscription.institutionId}`,
        performedById: userId,
        institutionId: subscription.institutionId,
        subscriptionId: subscriptionId,
        metadata: { reason },
      });
      
      return updatedSubscription as unknown as InstitutionSubscription;
    } catch (_error) {
      logger.error('Error cancelling subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(userId: string, subscriptionId: string, notes?: string): Promise<InstitutionSubscription> {
    try {
      // Get the subscription
      const subscription = await prisma.institutionSubscription.findUnique({
        where: { id: subscriptionId },
      });
      
      if (!subscription) {
        throw new NotFoundError(`Subscription with ID ${subscriptionId} not found`);
      }
      
      // Verify user has permission to reactivate this subscription
      await this.verifySubscriptionUpdateAccess(subscription.institutionId, userId);
      
      // Cannot reactivate an active subscription
      if (subscription.status === SubscriptionStatus.ACTIVE) {
        throw new ValidationError('Subscription is already active');
      }
      
      // Update the subscription
      const updatedSubscription = await prisma.institutionSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          notes: notes ? `${subscription.notes ? subscription.notes + '\n' : ''}Reactivation note (${new Date().toISOString()}): ${notes}` : subscription.notes,
          updatedAt: new Date(),
        },
      });
      
      // Log the reactivation
      await this.logAuditEvent({
        action: 'SUBSCRIPTION_REACTIVATED',
        entityType: 'InstitutionSubscription',
        entityId: subscriptionId,
        description: `Subscription reactivated for institution ${subscription.institutionId}`,
        performedById: userId,
        institutionId: subscription.institutionId,
        subscriptionId: subscriptionId,
        metadata: { notes },
      });
      
      return updatedSubscription as unknown as InstitutionSubscription;
    } catch (_error) {
      logger.error('Error reactivating subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Adjust license count for a subscription
   */
  async adjustLicenseCount(userId: string, newLicenseCount: number, subscriptionId: string, notes?: string): Promise<InstitutionSubscription> {
    try {
      // Get the subscription
      const subscription = await prisma.institutionSubscription.findUnique({
        where: { id: subscriptionId },
      });
      
      if (!subscription) {
        throw new NotFoundError(`Subscription with ID ${subscriptionId} not found`);
      }
      
      // Verify user has permission to update this subscription
      await this.verifySubscriptionUpdateAccess(subscription.institutionId, userId);
      
      // Validate the new license count
      if (newLicenseCount < 1) {
        throw new ValidationError('License count must be at least 1');
      }
      
      // Calculate new pricing
      const { totalPrice, discountApplied } = this.calculatePricing(
        subscription.plan as SubscriptionPlan,
        newLicenseCount,
        subscription.discountPercentage || 0
      );
      
      // Update the subscription
      const updatedSubscription = await prisma.institutionSubscription.update({
        where: { id: subscriptionId },
        data: {
          licenseCount: newLicenseCount,
          price: totalPrice,
          discountPercentage: discountApplied,
          notes: notes ? `${subscription.notes ? subscription.notes + '\n' : ''}License adjustment (${new Date().toISOString()}): ${notes}` : subscription.notes,
          updatedAt: new Date(),
        },
      });
      
      // Log the license adjustment
      await this.logAuditEvent({
        action: 'SUBSCRIPTION_LICENSE_ADJUSTED',
        entityType: 'InstitutionSubscription',
        entityId: subscriptionId,
        description: `Subscription license count adjusted for institution ${subscription.institutionId}`,
        performedById: userId,
        institutionId: subscription.institutionId,
        subscriptionId: subscriptionId,
        metadata: { 
          previousLicenseCount: subscription.licenseCount,
          newLicenseCount,
          previousTotalPrice: subscription.price,
          newTotalPrice: totalPrice,
          notes
        },
      });
      
      return updatedSubscription as unknown as InstitutionSubscription;
    } catch (_error) {
      logger.error('Error adjusting license count', { error, subscriptionId, newLicenseCount });
      throw error;
    }
  }

  /**
   * Get available volume discount tiers
   */
  async getVolumeDiscountTiers(_userId: string): Promise<any[]> {
    return VOLUME_DISCOUNT_TIERS;
  }

  /**
   * Get pricing for a plan and license count
   */
  calculatePricing(
    plan: SubscriptionPlan,
    licenseCount: number,
    customDiscount?: number,
    customPricePerLicense?: number
  ): { pricePerLicense: number, totalPrice: number, discountApplied: number } {
    // Get base price for the plan
    const basePrice = customPricePerLicense !== undefined ? customPricePerLicense : BASE_PRICES[plan];
    
    // Determine discount percentage based on license count
    let discountPercentage = 0;
    
    // If custom discount is provided, use it
    if (customDiscount !== undefined) {
      discountPercentage = customDiscount;
    } else {
      // Find applicable discount tier
      for (const tier of VOLUME_DISCOUNT_TIERS) {
        if (
          licenseCount >= tier.minLicenses && 
          (tier.maxLicenses === null || licenseCount <= tier.maxLicenses)
        ) {
          discountPercentage = tier.discountPercentage;
          break;
        }
      }
    }
    
    // Calculate price per license after discount
    const pricePerLicense = basePrice * (1 - (discountPercentage / 100));
    
    // Calculate total price
    const totalPrice = pricePerLicense * licenseCount;
    
    return {
      pricePerLicense,
      totalPrice,
      discountApplied: discountPercentage,
    };
  }

  // Private methods

  /**
   * Validate subscription input data
   */
  private validateSubscriptionInput(data: CreateSubscriptionInput | UpdateSubscriptionInput): void {
    // Validate license count
    if ('licenseCount' in data && data.licenseCount !== undefined) {
      if (data.licenseCount < 1) {
        throw new ValidationError('License count must be at least 1');
      }
    }
    
    // Validate dates
    if ('startDate' in data && data.startDate && 'endDate' in data && data.endDate) {
      if (data.startDate >= data.endDate) {
        throw new ValidationError('Start date must be before end date');
      }
    }
    
    // Validate discount
    if ('customDiscount' in data && data.customDiscount !== undefined) {
      if (data.customDiscount < 0 || data.customDiscount > 100) {
        throw new ValidationError('Custom discount must be between 0 and 100');
      }
    }
    
    // Validate price
    if ('customPricePerLicense' in data && data.customPricePerLicense !== undefined) {
      if (data.customPricePerLicense < 0) {
        throw new ValidationError('Custom price per license cannot be negative');
      }
    }
  }

  /**
   * Log an audit event
   */
  private async logAuditEvent(data: {
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    performedById: string;
    institutionId?: string;
    subscriptionId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.performedById,
          user_id_int: parseInt(data.performedById) || 0,
          tenant_id: 0, // Default to 0 as Institution uses UUIDs
          institutionId: data.institutionId, // Use the dedicated institutionId field
          action: data.action,
          resource: data.entityType,
          details: {
            entityId: data.entityId,
            description: data.description,
            institutionId: data.institutionId,
            subscriptionId: data.subscriptionId,
            metadata: data.metadata,
          },
        },
      });
    } catch (_error) {
      logger.error('Error logging audit event', { error, data });
      // Don't throw, just log the error
    }
  }

  /**
   * Verify that a user has access to view subscription information for an institution
   */
  private async verifySubscriptionAccess(institutionId: string, userId: string): Promise<void> {
    // Check if user is a system admin
    const isAdmin = await this.isSystemAdmin(userId);
    if (isAdmin) return;
    
    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Check if user is an institution admin
    const institutionAdmin = await prisma.institutionAdmin.findUnique({
      where: {
        institutionId_userId: {
          institutionId,
          userId: userIdInt,
        },
      },
    });

    if (institutionAdmin) return;

    // Check if user is a member of any department in this institution
    const departmentMembership = await prisma.departmentMember.findFirst({
      where: {
        userId: userIdInt,
        department: {
          institutionId,
        },
      },
    });

    if (departmentMembership) return;

    // Check if user is a manager of any department in this institution
    const departmentManagement = await prisma.departmentManager.findFirst({
      where: {
        userId: userIdInt,
        department: {
          institutionId,
        },
      },
    });

    if (departmentManagement) return;

    throw new AccessDeniedError('You do not have permission to access subscriptions for this institution');
  }

  /**
   * Verify that a user has admin access to an institution's subscriptions
   */
  private async verifySubscriptionUpdateAccess(institutionId: string, userId: string): Promise<void> {
    // Check if user is a system admin
    const isAdmin = await this.isSystemAdmin(userId);
    if (isAdmin) return;
    
    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Check if user is an admin of the institution
    const institutionAdmin = await prisma.institutionAdmin.findUnique({
      where: {
        institutionId_userId: {
          institutionId,
          userId: userIdInt,
        },
      },
    });
    
    if (!institutionAdmin) {
      throw new AccessDeniedError('You do not have admin permission for this institution\'s subscriptions');
    }
  }

  /**
   * Verify that a user has admin access to an institution
   */
  private async verifyInstitutionAdminAccess(institutionId: string, userId: string): Promise<void> {
    // Same as subscription update access
    await this.verifySubscriptionUpdateAccess(institutionId, userId);
  }

  /**
   * Verify that a user has system admin permissions
   */
  private async verifyAdminAccess(userId: string): Promise<void> {
    const isAdmin = await this.isSystemAdmin(userId);
    
    if (!isAdmin) {
      throw new AccessDeniedError('You do not have admin permission');
    }
  }

  /**
   * Check if a user is a system admin
   */
  private async isSystemAdmin(userId: string): Promise<boolean> {
    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return false; // Invalid ID is not admin
    }

    const user = await prisma.users.findUnique({
      where: { id: userIdInt },
      select: { role: true }, // users model has 'role' not 'roles'
    });

    // Check if user has ADMIN or SUPER_ADMIN role
    return user?.role?.toUpperCase().includes('ADMIN') ?? false;
  }
}

// Export a singleton instance
export const subscriptionService = new SubscriptionService();