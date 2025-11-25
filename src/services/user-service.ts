import { User, UserSubscription, UserRole } from '../types/auth';
import { logger } from '../lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * User creation options
 */
interface CreateUserOptions {
  email: string;
  displayName?: string;
  photoURL?: string;
  metadata?: Record<string, any>;
  subscription?: Partial<UserSubscription>;
  roles?: UserRole[];
  organizationId?: string;
}

/**
 * User update options
 */
interface UpdateUserOptions {
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  metadata?: Record<string, any>;
  subscription?: Partial<UserSubscription>;
  roles?: UserRole[];
  organizationId?: string;
}

/**
 * Service for user management operations
 */
export class UserService {
  /**
   * Create a new user
   * 
   * @param options User creation options
   * @returns Promise resolving to the created user
   */
  static async createUser(options: CreateUserOptions): Promise<User> {
    try {
      const primaryRole = options.roles?.[0] || 'student';
      const tenantId = options.organizationId ? parseInt(options.organizationId) : 1; // Default to 1 if not provided

      const newUser = await prisma.users.create({
        data: {
          email: options.email,
          name: options.displayName || '',
          role: primaryRole,
          password_hash: 'placeholder_hash', // Should be handled by auth provider
          tenant_id: isNaN(tenantId) ? 1 : tenantId,
          isEmailVerified: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        include: { 
          tenants: {
            include: {
              subscriptions: {
                where: { is_active: true },
                orderBy: { end_date: 'desc' },
                take: 1
              }
            }
          }
        }
      });
      
      logger.info(`Created user: ${newUser.id}, ${newUser.email}`);
      
      return this.mapPrismaUserToAuthUser(newUser);
    } catch (error) {
      logger.error('Error creating user:', error as Error);
      throw error;
    }
  }
  
  /**
   * Get a user by ID
   * 
   * @param id User ID
   * @returns Promise resolving to the user or null if not found
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) return null;

      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { 
          tenants: {
            include: {
              subscriptions: {
                where: { is_active: true },
                orderBy: { end_date: 'desc' },
                take: 1
              }
            }
          }
        }
      });
      
      return user ? this.mapPrismaUserToAuthUser(user) : null;
    } catch (error) {
      logger.error('Error getting user by ID:', error as Error);
      return null;
    }
  }
  
  /**
   * Get a user by email
   * 
   * @param email User email
   * @returns Promise resolving to the user or null if not found
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.users.findUnique({
        where: { email },
        include: { 
          tenants: {
            include: {
              subscriptions: {
                where: { is_active: true },
                orderBy: { end_date: 'desc' },
                take: 1
              }
            }
          }
        }
      });
      
      return user ? this.mapPrismaUserToAuthUser(user) : null;
    } catch (error) {
      logger.error('Error getting user by email:', error as Error);
      return null;
    }
  }
  
  /**
   * Update a user
   * 
   * @param id User ID
   * @param options Update options
   * @returns Promise resolving to the updated user
   */
  static async updateUser(id: string, options: UpdateUserOptions): Promise<User> {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) throw new Error(`Invalid user ID: ${id}`);

      const data: any = {};
      if (options.displayName !== undefined) data.name = options.displayName;
      if (options.emailVerified !== undefined) data.isEmailVerified = options.emailVerified;
      if (options.roles !== undefined && options.roles.length > 0) data.role = options.roles[0];
      if (options.organizationId !== undefined) data.tenant_id = parseInt(options.organizationId);

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data,
        include: { 
          tenants: {
            include: {
              subscriptions: {
                where: { is_active: true },
                orderBy: { end_date: 'desc' },
                take: 1
              }
            }
          }
        }
      });
      
      logger.info(`Updated user: ${id}`);
      
      return this.mapPrismaUserToAuthUser(updatedUser);
    } catch (error) {
      logger.error('Error updating user:', error as Error);
      throw error;
    }
  }
  
  /**
   * Update a user's subscription
   * 
   * @param id User ID
   * @param subscription Subscription data
   * @returns Promise resolving to the updated user
   */
  static async updateUserSubscription(
    id: string,
    subscription: Partial<UserSubscription>
  ): Promise<User> {
    // Subscription is managed at tenant level or separate table usually.
    // For now, we just return the user as we don't have a direct user subscription field in users table
    // except via relations which are complex to update here without more context.
    // We will log it.
    logger.warn(`updateUserSubscription called for ${id} but not fully implemented in DB layer yet.`);
    return this.getUserById(id) as Promise<User>;
  }
  
  /**
   * Delete a user
   * 
   * @param id User ID
   * @returns Promise resolving to true if deletion was successful
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) return false;

      await prisma.users.delete({
        where: { id: userId }
      });
      
      logger.info(`Deleted user: ${id}`);
      
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error as Error);
      return false;
    }
  }

  private static mapPrismaUserToAuthUser(user: any): User {
    const activeSubscription = user.tenants?.subscriptions?.[0];
    
    let subscription: UserSubscription | undefined;
    
    if (activeSubscription) {
      subscription = {
        tier: activeSubscription.tier,
        subscriptionId: activeSubscription.id.toString(),
        startDate: activeSubscription.start_date,
        endDate: activeSubscription.end_date,
        status: activeSubscription.is_active ? 'active' : 'past_due',
        inTrial: activeSubscription.tier === 'TRAINEE' || activeSubscription.tier === 'FREE', // Simplified logic
        cancelAtPeriodEnd: false,
        metadata: {}
      };
    }

    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.name,
      photoURL: undefined,
      emailVerified: user.isEmailVerified,
      createdAt: user.created_at,
      lastSignIn: user.last_login,
      metadata: {},
      subscription,
      roles: [user.role as UserRole],
      organizationId: user.tenant_id.toString()
    };
  }
}

// Export individual functions for convenience
export const createUser = UserService.createUser;
export const getUserById = UserService.getUserById;
export const getUserByEmail = UserService.getUserByEmail;
export const updateUser = UserService.updateUser;
export const updateUserSubscription = UserService.updateUserSubscription;
export const deleteUser = UserService.deleteUser;