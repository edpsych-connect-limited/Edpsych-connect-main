import { prisma } from '../../lib/prisma';
import {
  ValidationError,
  NotFoundError,
  AccessDeniedError
} from './errors';
import { permissionService } from './permission-service';
import { auditLogService } from './audit-log-service';

// Types for contact operations
export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimaryContact?: boolean;
  departmentId?: string;
  jobTitle?: string;
  notes?: string;
}

export interface ContactFilter {
  departmentId?: string;
  role?: string;
  isPrimary?: boolean;
  search?: string;
}

export interface PrimaryContactOptions {
  role?: string;
  removeExistingPrimary?: boolean;
}

/**
 * Service for managing institutional contacts
 */
export class ContactService {
  private prisma: any;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  /**
   * Create a new contact for an institution
   */
  async createContact(userId: string, data: ContactInput, institutionId: string) {
    // Validate inputs
    if (!institutionId) {
      throw new ValidationError('Institution ID is required');
    }

    if (!data.firstName || !data.firstName.trim()) {
      throw new ValidationError('First name is required');
    }

    if (!data.lastName || !data.lastName.trim()) {
      throw new ValidationError('Last name is required');
    }

    if (!data.email || !data.email.trim()) {
      throw new ValidationError('Email is required');
    }

    // Check permission
    const canManageContacts = await permissionService.canManageInstitutionContacts(
      userId,
      institutionId
    );

    if (!canManageContacts) {
      throw new AccessDeniedError('You do not have permission to manage contacts for this institution');
    }

    // Check if institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution) {
      throw new NotFoundError(`Institution with ID ${institutionId} not found`);
    }

    // Check if department exists if provided
    if (data.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: data.departmentId,
          institutionId: institutionId
        }
      });

      if (!department) {
        throw new NotFoundError(`Department with ID ${data.departmentId} not found in this institution`);
      }
    }

    // Create the contact
    const contact = await this.prisma.institutionContact.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        role: data.role?.trim() || null,
        isPrimaryContact: data.isPrimaryContact || false,
        jobTitle: data.jobTitle?.trim() || null,
        notes: data.notes?.trim() || null,
        institutionId: institutionId
      }
    });

    // Log the activity
    await auditLogService.logActivity(
      'contact_created',
      userId,
      institutionId,
      {
        contactId: contact.id,
        contactName: `${contact.firstName} ${contact.lastName}`
      }
    );

    return contact;
  }

  /**
   * Get contacts for an institution with optional filtering
   */
  async getContactsByInstitution(userId: string, institutionId: string, filter?: ContactFilter) {
    // Check permission
    const canViewContacts = await permissionService.canViewInstitutionContacts(
      userId,
      institutionId
    );

    if (!canViewContacts) {
      throw new AccessDeniedError('You do not have permission to view contacts for this institution');
    }

    // Build filter conditions
    const whereConditions: any = {
      institutionId: institutionId
    };

    if (filter?.departmentId) {
      whereConditions.departmentId = filter.departmentId;
    }

    if (filter?.role) {
      whereConditions.role = filter.role;
    }

    if (filter?.isPrimary !== undefined) {
      whereConditions.isPrimaryContact = filter.isPrimary;
    }

    if (filter?.search) {
      whereConditions.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { jobTitle: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    // Retrieve contacts
    const contacts = await this.prisma.institutionContact.findMany({
      where: whereConditions,
      orderBy: [
        { isPrimaryContact: 'desc' },
        { firstName: 'asc' }
      ]
    });

    return contacts;
  }

  /**
   * Get all primary contacts for an institution, optionally filtered by role
   */
  async getPrimaryContactsByInstitution(userId: string, institutionId: string, options?: { role?: string }) {
    // Check permission
    const canViewContacts = await permissionService.canViewInstitutionContacts(
      userId,
      institutionId
    );

    if (!canViewContacts) {
      throw new AccessDeniedError('You do not have permission to view contacts for this institution');
    }

    // Build query conditions
    const whereConditions: any = {
      institutionId: institutionId,
      isPrimaryContact: true
    };

    // Add role filter if provided
    if (options?.role) {
      whereConditions.role = options.role;
    }

    // Retrieve primary contacts
    const primaryContacts = await this.prisma.institutionContact.findMany({
      where: whereConditions,
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' }
      ]
    });

    return primaryContacts;
  }

  /**
   * Get a contact by ID
   */
  async getContactById(userId: string, contactId: string) {
    if (!contactId) {
      throw new ValidationError('Contact ID is required');
    }

    // Get the contact
    const contact = await this.prisma.institutionContact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      throw new NotFoundError(`Contact with ID ${contactId} not found`);
    }

    // Check permission
    const canViewContacts = await permissionService.canViewInstitutionContacts(
      userId,
      contact.institutionId
    );

    if (!canViewContacts) {
      throw new AccessDeniedError('You do not have permission to view this contact');
    }

    return contact;
  }

  /**
   * Update a contact
   */
  async updateContact(userId: string, data: Partial<ContactInput>, contactId: string) {
    if (!contactId) {
      throw new ValidationError('Contact ID is required');
    }

    // Get the existing contact
    const existingContact = await this.prisma.institutionContact.findUnique({
      where: { id: contactId }
    });

    if (!existingContact) {
      throw new NotFoundError(`Contact with ID ${contactId} not found`);
    }

    // Check permission
    const canManageContacts = await permissionService.canManageInstitutionContacts(
      userId,
      existingContact.institutionId
    );

    if (!canManageContacts) {
      throw new AccessDeniedError('You do not have permission to update this contact');
    }

    // Check if department exists if provided
    if (data.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: data.departmentId,
          institutionId: existingContact.institutionId
        }
      });

      if (!department) {
        throw new NotFoundError(`Department with ID ${data.departmentId} not found in this institution`);
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (data.firstName !== undefined) {
      if (!data.firstName.trim()) {
        throw new ValidationError('First name cannot be empty');
      }
      updateData.firstName = data.firstName.trim();
    }

    if (data.lastName !== undefined) {
      if (!data.lastName.trim()) {
        throw new ValidationError('Last name cannot be empty');
      }
      updateData.lastName = data.lastName.trim();
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        throw new ValidationError('Email cannot be empty');
      }
      updateData.email = data.email.trim();
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone.trim();
    }

    if (data.role !== undefined) {
      updateData.role = data.role.trim() || ""; // Provide empty string as default
    }

    if (data.isPrimaryContact !== undefined) {
      updateData.isPrimaryContact = data.isPrimaryContact;
    }

    if (data.jobTitle !== undefined) {
      updateData.jobTitle = data.jobTitle.trim() || null;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes.trim() || null;
    }

    if (data.departmentId !== undefined) {
      updateData.departmentId = data.departmentId || null;
    }

    // Update the contact
    const updatedContact = await this.prisma.institutionContact.update({
      where: { id: contactId },
      data: updateData
    });

    // Log the activity
    await auditLogService.logActivity(
      'contact_updated',
      userId,
      existingContact.institutionId,
      {
        contactId: updatedContact.id,
        contactName: `${updatedContact.firstName} ${updatedContact.lastName}`
      }
    );

    return updatedContact;
  }

  /**
   * Delete a contact
   */
  async deleteContact(userId: string, contactId: string) {
    if (!contactId) {
      throw new ValidationError('Contact ID is required');
    }

    // Get the existing contact
    const existingContact = await this.prisma.institutionContact.findUnique({
      where: { id: contactId }
    });

    if (!existingContact) {
      throw new NotFoundError(`Contact with ID ${contactId} not found`);
    }

    // Check permission
    const canManageContacts = await permissionService.canManageInstitutionContacts(
      userId,
      existingContact.institutionId
    );

    if (!canManageContacts) {
      throw new AccessDeniedError('You do not have permission to delete this contact');
    }

    // Delete the contact
    await this.prisma.institutionContact.delete({
      where: { id: contactId }
    });

    // Log the activity
    await auditLogService.logActivity(
      'contact_deleted',
      userId,
      existingContact.institutionId,
      {
        contactId: contactId,
        contactName: `${existingContact.firstName} ${existingContact.lastName}`
      }
    );

    return true;
  }

  /**
   * Designate a contact as primary for an institution, optionally for a specific role
   */
  async designateAsPrimaryContact(
    contactId: string,
    institutionId: string,
    options: PrimaryContactOptions = {},
    userId: string
  ) {
    if (!contactId) {
      throw new ValidationError('Contact ID is required');
    }

    if (!institutionId) {
      throw new ValidationError('Institution ID is required');
    }

    // Check permission
    const canManageContacts = await permissionService.canManageInstitutionContacts(
      userId,
      institutionId
    );

    if (!canManageContacts) {
      throw new AccessDeniedError('You do not have permission to manage contacts for this institution');
    }

    // Get the contact
    const contact = await this.prisma.institutionContact.findFirst({
      where: {
        id: contactId,
        institutionId: institutionId
      }
    });

    if (!contact) {
      throw new NotFoundError(`Contact with ID ${contactId} not found in institution ${institutionId}`);
    }

    // Start a transaction
    return await this.prisma.$transaction(async (prisma: any) => {
      // If removeExistingPrimary is true, remove primary designation from other contacts with same role
      if (options.removeExistingPrimary) {
        const whereConditions: any = {
          institutionId: institutionId,
          isPrimaryContact: true,
          id: { not: contactId }
        };

        // If role is specified, only remove primary status from contacts with same role
        if (options.role) {
          whereConditions.role = options.role;
        }

        await prisma.institutionContact.updateMany({
          where: whereConditions,
          data: {
            isPrimaryContact: false
          }
        });
      }

      // Update the contact role if provided
      const updateData: any = {
        isPrimaryContact: true
      };

      if (options.role) {
        updateData.role = options.role;
      }

      // Update the contact
      const updatedContact = await prisma.institutionContact.update({
        where: { id: contactId },
        data: updateData
      });

      // Log the activity
      await auditLogService.logActivity(
        'contact_designated_primary',
        userId,
        institutionId,
        {
          contactId: updatedContact.id,
          contactName: `${updatedContact.firstName} ${updatedContact.lastName}`,
          role: updatedContact.role
        }
      );

      return updatedContact;
    });
  }
}

// Create and export instance
export const contactService = new ContactService(prisma);