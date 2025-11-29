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
  Department,
  DepartmentType,
  UserRole
} from './types';

export interface CreateDepartmentInput {
  name: string;
  type: DepartmentType;
  institutionId: string;
  parentDepartmentId?: string;
  description?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  type?: DepartmentType;
  description?: string;
  parentDepartmentId?: string | null;
  isActive?: boolean;
}

export interface DepartmentQueryOptions {
  institutionId?: string;
  parentDepartmentId?: string | null;
  type?: DepartmentType[];
  includeInactive?: boolean;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Service for managing departments within institutions
 */
export class DepartmentService {
  /**
   * Create a new department
   */
  async createDepartment(data: CreateDepartmentInput, userId: string): Promise<Department> {
    try {
      this.validateDepartmentInput(data);
      
      // Check if institution exists
      const institution = await prisma.institution.findUnique({
        where: { id: data.institutionId },
      });
      
      if (!institution) {
        throw new NotFoundError(`Institution with ID ${data.institutionId} not found`);
      }
      
      // If parent department is specified, check if it exists and belongs to the institution
      if (data.parentDepartmentId) {
        const parentDepartment = await prisma.department.findUnique({
          where: { id: data.parentDepartmentId },
        });
        
        if (!parentDepartment) {
          throw new NotFoundError(`Parent department with ID ${data.parentDepartmentId} not found`);
        }
        
        if (parentDepartment.institutionId !== data.institutionId) {
          throw new ValidationError('Parent department must belong to the same institution');
        }
      }
      
      // Verify user has permission to create departments for this institution
      await this.verifyInstitutionAccess(data.institutionId, userId);
      
      // Generate a unique ID for the department
      const departmentId = generateId('dept');
      
      // Create the department
      const department = await prisma.department.create({
        data: {
          id: departmentId,
          name: data.name,
          type: data.type,
          institutionId: data.institutionId,
          parentDepartmentId: data.parentDepartmentId || null,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      // Log the creation
      await this.logAuditEvent({
        action: 'DEPARTMENT_CREATED',
        entityType: 'Department',
        entityId: department.id,
        description: `Department "${department.name}" created for institution ${data.institutionId}`,
        performedById: userId,
      });
      
      return department as Department;
    } catch (error) {
      logger.error('Error creating department', { error, data });
      throw error;
    }
  }

  /**
   * Get a department by ID
   */
  async getDepartmentById(departmentId: string, userId: string): Promise<Department> {
    try {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
          parentDepartment: {
            select: {
              id: true,
              name: true,
            },
          },
          childDepartments: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          _count: {
            select: {
              users: true,
              managers: true,
            },
          },
        },
      });
      
      if (!department) {
        throw new NotFoundError(`Department with ID ${departmentId} not found`);
      }
      
      // Verify user has access to view this department
      await this.verifyDepartmentAccess(department.institutionId, userId);
      
      return department as unknown as Department;
    } catch (error) {
      logger.error('Error fetching department', { error, departmentId });
      throw error;
    }
  }

  /**
   * Get a list of departments with filtering, sorting, and pagination
   */
  async getDepartments(options: DepartmentQueryOptions, userId: string): Promise<{ data: Department[]; total: number; page: number; limit: number }> {
    try {
      // Default values
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {};
      
      // Only include active departments by default
      if (!options.includeInactive) {
        where.isActive = true;
      }
      
      // Filter by institution if provided
      if (options.institutionId) {
        where.institutionId = options.institutionId;
        
        // Verify user has access to this institution
        await this.verifyInstitutionAccess(options.institutionId, userId);
      }
      
      // Filter by parent department if provided
      if (options.parentDepartmentId !== undefined) {
        where.parentDepartmentId = options.parentDepartmentId;
      }
      
      // Filter by type if provided
      if (options.type && options.type.length > 0) {
        where.type = { in: options.type };
      }
      
      // Search term
      if (options.searchTerm) {
        where.OR = [
          { name: { contains: options.searchTerm, mode: 'insensitive' } },
          { description: { contains: options.searchTerm, mode: 'insensitive' } },
        ];
      }
      
      // Get departments
      const departments = await prisma.department.findMany({
        where,
        include: {
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
          parentDepartment: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              users: true,
              childDepartments: true,
            },
          },
        },
        orderBy: options.sortBy
          ? { [options.sortBy]: options.sortDirection || 'asc' }
          : { name: 'asc' },
        skip,
        take: limit,
      });
      
      // Get total count
      const total = await prisma.department.count({ where });
      
      return {
        data: departments as unknown as Department[],
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error fetching departments', { error, options });
      throw error;
    }
  }

  /**
   * Get department hierarchy for an institution
   */
  async getDepartmentHierarchy(institutionId: string, userId: string): Promise<any> {
    try {
      // Verify user has access to this institution
      await this.verifyInstitutionAccess(institutionId, userId);
      
      // Get all top-level departments (no parent)
      const topLevelDepartments = await prisma.department.findMany({
        where: {
          institutionId,
          parentDepartmentId: null,
          isActive: true,
        },
        include: {
          childDepartments: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
      
      // Recursively build the hierarchy
      const hierarchy = await this.buildDepartmentHierarchy(topLevelDepartments);
      
      return hierarchy;
    } catch (error) {
      logger.error('Error fetching department hierarchy', { error, institutionId });
      throw error;
    }
  }

  /**
   * Update a department
   */
  async updateDepartment(departmentId: string, data: UpdateDepartmentInput, userId: string): Promise<Department> {
    try {
      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
          institution: true,
        },
      });
      
      if (!department) {
        throw new NotFoundError(`Department with ID ${departmentId} not found`);
      }
      
      // Verify user has permission to update this department
      await this.verifyDepartmentUpdateAccess(department.institutionId, userId);
      
      // If changing parent, validate the new parent is valid
      if (data.parentDepartmentId !== undefined) {
        if (data.parentDepartmentId === departmentId) {
          throw new ValidationError('Department cannot be its own parent');
        }
        
        if (data.parentDepartmentId) {
          // Check if new parent exists and is in the same institution
          const parentDepartment = await prisma.department.findUnique({
            where: { id: data.parentDepartmentId },
          });
          
          if (!parentDepartment) {
            throw new NotFoundError(`Parent department with ID ${data.parentDepartmentId} not found`);
          }
          
          if (parentDepartment.institutionId !== department.institutionId) {
            throw new ValidationError('Parent department must belong to the same institution');
          }
          
          // Check for circular reference
          const wouldCreateCircular = await this.wouldCreateCircularReference(departmentId, data.parentDepartmentId);
          if (wouldCreateCircular) {
            throw new ValidationError('Cannot create circular reference in department hierarchy');
          }
        }
      }
      
      // Update the department
      const updatedDepartment = await prisma.department.update({
        where: { id: departmentId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      
      // Log the update
      await this.logAuditEvent({
        action: 'DEPARTMENT_UPDATED',
        entityType: 'Department',
        entityId: departmentId,
        description: `Department "${updatedDepartment.name}" updated`,
        performedById: userId,
        metadata: { updatedFields: Object.keys(data) },
      });
      
      return updatedDepartment as Department;
    } catch (error) {
      logger.error('Error updating department', { error, departmentId, data });
      throw error;
    }
  }

  /**
   * Deactivate a department
   */
  async deactivateDepartment(departmentId: string, userId: string, reason?: string): Promise<Department> {
    try {
      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      
      if (!department) {
        throw new NotFoundError(`Department with ID ${departmentId} not found`);
      }
      
      // Verify user has permission to deactivate this department
      await this.verifyDepartmentAdminAccess(department.institutionId, userId);
      
      // Deactivate the department
      const updatedDepartment = await prisma.department.update({
        where: { id: departmentId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
      
      // Log the deactivation
      await this.logAuditEvent({
        action: 'DEPARTMENT_DEACTIVATED',
        entityType: 'Department',
        entityId: departmentId,
        description: `Department "${updatedDepartment.name}" deactivated`,
        performedById: userId,
        metadata: { reason },
      });
      
      return updatedDepartment as Department;
    } catch (error) {
      logger.error('Error deactivating department', { error, departmentId });
      throw error;
    }
  }

  /**
   * Reactivate a department
   */
  async reactivateDepartment(departmentId: string, userId: string): Promise<Department> {
    try {
      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      
      if (!department) {
        throw new NotFoundError(`Department with ID ${departmentId} not found`);
      }
      
      // Verify user has permission to reactivate this department
      await this.verifyDepartmentAdminAccess(department.institutionId, userId);
      
      // Reactivate the department
      const updatedDepartment = await prisma.department.update({
        where: { id: departmentId },
        data: {
          isActive: true,
          updatedAt: new Date(),
        },
      });
      
      // Log the reactivation
      await this.logAuditEvent({
        action: 'DEPARTMENT_REACTIVATED',
        entityType: 'Department',
        entityId: departmentId,
        description: `Department "${updatedDepartment.name}" reactivated`,
        performedById: userId,
      });
      
      return updatedDepartment as Department;
    } catch (error) {
      logger.error('Error reactivating department', { error, departmentId });
      throw error;
    }
  }

  /**
   * Add a manager to a department
   */
  async addDepartmentManager(departmentId: string, managerId: string, userId: string): Promise<void> {
    try {
      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      
      if (!department) {
        throw new NotFoundError(`Department with ID ${departmentId} not found`);
      }
      
      // Verify the user making the request has admin permissions for this department
      await this.verifyDepartmentAdminAccess(department.institutionId, userId);
      
      // Parse managerId to Int since users table uses Int IDs
      const managerIdInt = parseInt(managerId);
      if (isNaN(managerIdInt)) {
        throw new ValidationError(`Invalid manager ID: ${managerId}`);
      }

      // Check if the user to be added exists
      const manager = await prisma.users.findUnique({
        where: { id: managerIdInt },
      });

      if (!manager) {
        throw new NotFoundError(`User with ID ${managerId} not found`);
      }

      // Add the user as a manager using the join table
      await prisma.departmentManager.create({
        data: {
          departmentId,
          userId: managerIdInt,
          assignedBy: userId,
        },
      });
      
      // Log the action
      await this.logAuditEvent({
        action: 'DEPARTMENT_MANAGER_ADDED',
        entityType: 'Department',
        entityId: departmentId,
        description: `User added as manager for department "${department.name}"`,
        performedById: userId,
        metadata: { managerId },
      });
    } catch (error) {
      logger.error('Error adding department manager', { error, departmentId, managerId });
      throw error;
    }
  }

  /**
   * Remove a manager from a department
   */
  async removeDepartmentManager(departmentId: string, managerId: string, userId: string): Promise<void> {
    try {
      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      
      if (!department) {
        throw new NotFoundError(`Department with ID ${departmentId} not found`);
      }
      
      // Verify the user making the request has admin permissions for this department
      await this.verifyDepartmentAdminAccess(department.institutionId, userId);

      // Parse managerId to Int since users table uses Int IDs
      const managerIdInt = parseInt(managerId);
      if (isNaN(managerIdInt)) {
        throw new ValidationError(`Invalid manager ID: ${managerId}`);
      }

      // Prevent removing the last manager
      const managerCount = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { _count: { select: { managers: true } } },
      });

      if (managerCount?._count.managers === 1) {
        throw new ValidationError('Cannot remove the last department manager');
      }

      // Remove the user as a manager using the join table
      await prisma.departmentManager.deleteMany({
        where: {
          departmentId,
          userId: managerIdInt,
        },
      });
      
      // Log the action
      await this.logAuditEvent({
        action: 'DEPARTMENT_MANAGER_REMOVED',
        entityType: 'Department',
        entityId: departmentId,
        description: `User removed as manager from department "${department.name}"`,
        performedById: userId,
        metadata: { managerId },
      });
    } catch (error) {
      logger.error('Error removing department manager', { error, departmentId, managerId });
      throw error;
    }
  }

  // Private methods

  /**
   * Recursively build department hierarchy
   */
  private async buildDepartmentHierarchy(departments: any[]): Promise<any[]> {
    const result = [];
    
    for (const department of departments) {
      // Clone department without circular references
      const departmentNode: any = {
        id: department.id,
        name: department.name,
        type: department.type,
        children: [],
      };
      
      // Recursively process child departments if they exist
      if (department.childDepartments && department.childDepartments.length > 0) {
        departmentNode.children = await this.buildDepartmentHierarchy(department.childDepartments);
      }
      
      result.push(departmentNode);
    }
    
    return result;
  }

  /**
   * Check if setting a new parent would create a circular reference
   */
  private async wouldCreateCircularReference(id: string, newParentId: string): Promise<boolean> {
    // If id is in the ancestry of newParentId, it would create a circular reference
    let currentId = newParentId;
    const visited = new Set<string>();
    
    while (currentId) {
      // Prevent infinite loops
      if (visited.has(currentId)) {
        return true;
      }
      visited.add(currentId);
      
      if (currentId === id) {
        return true;
      }
      
      // Get the parent of the current department
      const current = await prisma.department.findUnique({
        where: { id: currentId },
        select: { parentDepartmentId: true },
      });
      
      // If no parent, break the loop
      if (!current || !current.parentDepartmentId) {
        break;
      }
      
      currentId = current.parentDepartmentId;
    }
    
    return false;
  }

  /**
   * Validate department input data
   */
  private validateDepartmentInput(data: CreateDepartmentInput | UpdateDepartmentInput): void {
    // Validate name
    if ('name' in data && (!data.name || data.name.trim().length < 2)) {
      throw new ValidationError('Department name must be at least 2 characters');
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
    metadata?: any;
  }): Promise<void> {
    try {
      // Extract institutionId from metadata if available, or try to find it from the entity
      let institutionId = data.metadata?.institutionId;
      
      if (!institutionId && data.entityType === 'Department') {
        const dept = await prisma.department.findUnique({
          where: { id: data.entityId },
          select: { institutionId: true }
        });
        if (dept) institutionId = dept.institutionId;
      }

      await prisma.auditLog.create({
        data: {
          userId: data.performedById,
          user_id_int: parseInt(data.performedById) || 0,
          tenant_id: 0, // Default to 0 as Institution uses UUIDs
          institutionId: institutionId, // Use the dedicated institutionId field
          action: data.action,
          resource: data.entityType,
          details: {
            entityId: data.entityId,
            description: data.description,
            institutionId: institutionId,
            metadata: data.metadata || {},
          },
        },
      });
    } catch (error) {
      logger.error('Error logging audit event', { error, data });
      // Don't throw, just log the error
    }
  }

  /**
   * Verify that a user has access to an institution
   * Uses InstitutionAdmin, DepartmentMember, and DepartmentManager join tables
   */
  private async verifyInstitutionAccess(institutionId: string, userId: string): Promise<void> {
    // Check if user is a system admin
    const isAdmin = await this.isSystemAdmin(userId);
    if (isAdmin) return;

    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Check if user is an institution admin using InstitutionAdmin join table
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

    // If none of the above checks passed, deny access
    throw new AccessDeniedError('You do not have permission to access this institution');
  }

  /**
   * Verify that a user has access to a department
   */
  private async verifyDepartmentAccess(institutionId: string, userId: string): Promise<void> {
    // Check if user is a system admin
    const isAdmin = await this.isSystemAdmin(userId);
    if (isAdmin) return;
    
    // Check institution access
    await this.verifyInstitutionAccess(institutionId, userId);
  }

  /**
   * Verify that a user has admin access to a department
   * Uses InstitutionAdmin join table for proper permission checking
   */
  private async verifyDepartmentAdminAccess(institutionId: string, userId: string): Promise<void> {
    // Check if user is a system admin
    const isAdmin = await this.isSystemAdmin(userId);
    if (isAdmin) return;

    // Parse userId to Int since users table uses Int IDs
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      throw new ValidationError(`Invalid user ID: ${userId}`);
    }

    // Check if user is an institution admin using InstitutionAdmin join table
    const institutionAdmin = await prisma.institutionAdmin.findUnique({
      where: {
        institutionId_userId: {
          institutionId,
          userId: userIdInt,
        },
      },
    });

    if (!institutionAdmin) {
      throw new AccessDeniedError('You do not have admin permission for this institution');
    }
  }

  /**
   * Verify that a user has permission to update a department
   */
  private async verifyDepartmentUpdateAccess(institutionId: string, userId: string): Promise<void> {
    // Same as admin access for now
    await this.verifyDepartmentAdminAccess(institutionId, userId);
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
export const departmentService = new DepartmentService();