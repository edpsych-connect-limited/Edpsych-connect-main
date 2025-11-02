import { PrismaClient } from '@prisma/client';
import { ValidationError, AccessDeniedError } from './errors';

/**
 * Service for managing permissions related to institutional management
 */
export class PermissionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Check if a user can create institutions
   * Only system admins can create institutions
   */
  async canCreateInstitutions(userId: string): Promise<boolean> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Get the user
    const user = await this.prisma.users.findUnique({
      where: { id: userIdInt },
      select: { role: true } // users model has 'role' not 'roles'
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Check if user has admin role
    const hasRequiredRole = user.role?.toUpperCase().includes('ADMIN') ?? false;

    return hasRequiredRole;
  }

  /**
   * Check if a user can manage an institution
   * Uses InstitutionAdmin join table for proper permission checking
   */
  async canManageInstitution(userId: string, institutionId: string): Promise<boolean> {
    if (!userId || !institutionId) {
      throw new ValidationError('User ID and Institution ID are required');
    }

    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Get the user
    const user = await this.prisma.users.findUnique({
      where: { id: userIdInt },
      select: { role: true }
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // System admins can manage all institutions
    const isAdmin = user.role?.toUpperCase().includes('ADMIN') ?? false;
    if (isAdmin) {
      return true;
    }

    // Check InstitutionAdmin join table for institution-specific admin permissions
    const institutionAdmin = await this.prisma.institutionAdmin.findUnique({
      where: {
        institutionId_userId: {
          institutionId,
          userId: userIdInt,
        },
      },
    });

    return institutionAdmin !== null;
  }

  /**
   * Check if a user can view an institution
   * Uses InstitutionAdmin and DepartmentMember join tables for proper permission checking
   */
  async canViewInstitution(userId: string, institutionId: string): Promise<boolean> {
    if (!userId || !institutionId) {
      throw new ValidationError('User ID and Institution ID are required');
    }

    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Get the user
    const user = await this.prisma.users.findUnique({
      where: { id: userIdInt },
      select: { role: true }
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // System admins can view all institutions
    const isAdmin = user.role?.toUpperCase().includes('ADMIN') ?? false;
    if (isAdmin) {
      return true;
    }

    // Check if user is an institution admin
    const institutionAdmin = await this.prisma.institutionAdmin.findUnique({
      where: {
        institutionId_userId: {
          institutionId,
          userId: userIdInt,
        },
      },
    });

    if (institutionAdmin) {
      return true;
    }

    // Check if user is a member of any department in this institution
    const departmentMembership = await this.prisma.departmentMember.findFirst({
      where: {
        userId: userIdInt,
        department: {
          institutionId,
        },
      },
    });

    if (departmentMembership) {
      return true;
    }

    // Check if user is a manager of any department in this institution
    const departmentManagement = await this.prisma.departmentManager.findFirst({
      where: {
        userId: userIdInt,
        department: {
          institutionId,
        },
      },
    });

    return departmentManagement !== null;
  }

  /**
   * Check if a user can manage departments in an institution
   */
  async canManageInstitutionDepartments(userId: string, institutionId: string): Promise<boolean> {
    return this.canManageInstitution(userId, institutionId);
  }

  /**
   * Check if a user can view departments in an institution
   */
  async canViewInstitutionDepartments(userId: string, institutionId: string): Promise<boolean> {
    return this.canViewInstitution(userId, institutionId);
  }

  /**
   * Check if a user can manage contacts in an institution
   */
  async canManageInstitutionContacts(userId: string, institutionId: string): Promise<boolean> {
    return this.canManageInstitution(userId, institutionId);
  }

  /**
   * Check if a user can view contacts in an institution
   */
  async canViewInstitutionContacts(userId: string, institutionId: string): Promise<boolean> {
    return this.canViewInstitution(userId, institutionId);
  }

  /**
   * Check if a user can manage subscriptions for an institution
   */
  async canManageInstitutionSubscriptions(userId: string, institutionId: string): Promise<boolean> {
    if (!userId || !institutionId) {
      throw new ValidationError('User ID and Institution ID are required');
    }

    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Get the user
    const user = await this.prisma.users.findUnique({
      where: { id: userIdInt },
      select: { role: true }
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Only admins can manage subscriptions
    const isAdmin = user.role?.toUpperCase().includes('ADMIN') ?? false;

    return isAdmin;
  }

  /**
   * Check if a user can view subscriptions for an institution
   */
  async canViewInstitutionSubscriptions(userId: string, institutionId: string): Promise<boolean> {
    return this.canManageInstitution(userId, institutionId);
  }
}

// Create and export instance
const prisma = new PrismaClient();
export const permissionService = new PermissionService(prisma);