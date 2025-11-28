import { logger } from "@/lib/logger";
/**
 * Institution Service
 * 
 * This service handles the management of institutions participating in the
 * cross-institutional data sharing platform, including registration, verification,
 * and compliance tracking.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Institution,
  InstitutionCreationParams,
  InstitutionType,
  VerificationStatus,
  ComplianceFramework,
  InstitutionContact,
  ComplianceCertification,
  DataGovernancePolicy,
  createInstitution
} from '../models/institution';
import { DataAccessService } from '../../data-lake/services/data-access-service';
import { GovernanceService } from '../../governance/services/governance-service';
import { EventBusService } from '../../shared/services/event-bus';
import { LoggingService } from '../../shared/services/logging-service';
import { NotificationService } from '../../shared/services/notification-service';

/**
 * Error types for the institution service
 */
export enum InstitutionErrorType {
  NOT_FOUND = 'institution_not_found',
  ALREADY_EXISTS = 'institution_already_exists',
  INVALID_INPUT = 'invalid_input',
  VERIFICATION_FAILED = 'verification_failed',
  UNAUTHORIZED = 'unauthorized',
  COMPLIANCE_REQUIRED = 'compliance_required',
  INTERNAL_ERROR = 'internal_error'
}

/**
 * Custom error class for institution service errors
 */
export class InstitutionError extends Error {
  constructor(
    public type: InstitutionErrorType,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'InstitutionError';
  }
}

/**
 * Handles operations related to institutions in the data sharing platform
 */
export class InstitutionService {
  constructor(
    private dataAccessService: DataAccessService,
    private governanceService: GovernanceService,
    private eventBus: EventBusService,
    private loggingService: LoggingService,
    private notificationService: NotificationService
  ) {}

  /**
   * Register a new institution in the data sharing platform
   */
  async registerInstitution(
    params: InstitutionCreationParams,
    userId: string
  ): Promise<Institution> {
    try {
      // Check if an institution with the same name already exists
      const existingInstitution = await this.dataAccessService.getInstitutionByName(params.name);
      if (existingInstitution) {
        throw new InstitutionError(
          InstitutionErrorType.ALREADY_EXISTS,
          `Institution with name '${params.name}' already exists`,
          { name: params.name }
        );
      }

      // Validate input
      this.validateInstitutionInput(params);

      // Create institution record
      const institution = createInstitution(params, userId);

      // Register with governance service
      await this.governanceService.registerOrganization({
        id: institution.id,
        name: institution.name,
        type: institution.type,
        registrationNumber: institution.registrationNumber,
        country: institution.address.country
      });
      
      // Save to data store
      await this.dataAccessService.saveInstitution(institution);
      
      // Emit event
      this.eventBus.emit('institution-registered', {
        id: institution.id,
        name: institution.name,
        type: institution.type,
        userId: userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution registered: ${institution.name}`,
        context: {
          institutionId: institution.id,
          userId: userId
        }
      });
      
      // Send notifications
      await this.notificationService.sendNotification(
        userId,
        'Institution Registration Submitted',
        `Your institution '${institution.name}' has been registered and is pending verification.`
      );

      // Notify administrators about new institution registration
      await this.notifyAdminsOfNewInstitution(institution);

      return institution;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to register institution',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionName: params.name,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to register institution',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Retrieve an institution by ID
   */
  async getInstitutionById(userId: string, institutionId: string
  ): Promise<Institution> {
    try {
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Log access
      this.loggingService.log({
        level: 'info',
        message: `Institution retrieved: ${institution.name}`,
        context: {
          institutionId: institutionId,
          userId: userId
        }
      });
      
      return institution;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to retrieve institution',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to retrieve institution',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Search for institutions based on various criteria
   */
  async searchInstitutions(
    params: {
      name?: string;
      type?: InstitutionType;
      country?: string;
      verificationStatus?: VerificationStatus;
      hasEthicsCommittee?: boolean;
      hasDataProtectionOfficer?: boolean;
      complianceFramework?: ComplianceFramework;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    },
    userId: string
  ): Promise<{
    institutions: Institution[];
    total: number;
  }> {
    try {
      const result = await this.dataAccessService.searchInstitutions(params);
      
      // Log search
      this.loggingService.log({
        level: 'info',
        message: 'Institutions search performed',
        context: {
          searchParams: params,
          resultCount: result.institutions.length,
          userId
        }
      });
      
      return result;
    } catch (error) {
      this.loggingService.log({
        level: 'error',
        message: 'Failed to search institutions',
        context: {
          error: error instanceof Error ? error.message : String(error),
          searchParams: params,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to search institutions',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Update an institution's details
   */
  async updateInstitution(userId: string, updates: Partial<Institution>, institutionId: string
  ): Promise<Institution> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Validate if the user is authorized to update this institution
      await this.validateUserCanEditInstitution(userId, institutionId);
      
      // Protect certain fields from being updated
      const protectedFields = ['id', 'createdBy', 'registrationDate', 'verificationStatus', 'verificationDate', 'verifiedBy'];
      
      for (const field of protectedFields) {
        if (field in updates) {
          delete updates[field as keyof Institution];
        }
      }
      
      // Merge updates
      const updatedInstitution = {
        ...institution,
        ...updates,
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(updatedInstitution);
      
      // Emit event
      this.eventBus.emit('institution-updated', {
        institutionId: institutionId,
        name: updatedInstitution.name,
        type: updatedInstitution.type,
        userId: userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution updated: ${updatedInstitution.name}`,
        context: {
          institutionId,
          updatedFields: Object.keys(updates),
          userId
        }
      });
      
      return updatedInstitution;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to update institution',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          updates: Object.keys(updates),
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to update institution',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Verify an institution
   */
  async verifyInstitution(
    institutionId: string,
    verifierUserId: string,
    verificationNotes?: string
  ): Promise<Institution> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Verify the user has admin permissions to verify institutions
      await this.validateUserIsAdmin(verifierUserId);
      
      // Update verification status
      const verifiedInstitution = {
        ...institution,
        verificationStatus: VerificationStatus.VERIFIED,
        verificationDate: new Date(),
        verifiedBy: verifierUserId,
        lastUpdated: new Date(),
        updatedBy: verifierUserId
      };
      
      // Save verified institution
      await this.dataAccessService.updateInstitution(verifiedInstitution);
      
      // Update governance record
      await this.governanceService.updateOrganizationStatus(institutionId, 'verified');
      
      // Emit event
      this.eventBus.emit('institution-verified', {
        institutionId,
        name: verifiedInstitution.name,
        verifiedBy: verifierUserId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution verified: ${verifiedInstitution.name}`,
        context: {
          institutionId,
          verifierUserId,
          verificationNotes
        }
      });
      
      // Notify institution contacts
      for (const contact of institution.contacts) {
        await this.notificationService.sendNotification(
          contact.id,
          'Institution Verification Approved',
          `Your institution '${institution.name}' has been verified and can now participate in data sharing.`
        );
      }
      
      return verifiedInstitution;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to verify institution',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          verifierUserId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to verify institution',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Reject an institution verification
   */
  async rejectInstitution(
    institutionId: string,
    reviewerUserId: string,
    rejectionReason: string
  ): Promise<Institution> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Verify the user has admin permissions
      await this.validateUserIsAdmin(reviewerUserId);
      
      // Update verification status
      const rejectedInstitution = {
        ...institution,
        verificationStatus: VerificationStatus.REJECTED,
        lastUpdated: new Date(),
        updatedBy: reviewerUserId
      };
      
      // Save rejected institution
      await this.dataAccessService.updateInstitution(rejectedInstitution);
      
      // Update governance record
      await this.governanceService.updateOrganizationStatus(institutionId, 'rejected', {
        reason: rejectionReason
      });
      
      // Emit event
      this.eventBus.emit('institution-rejected', {
        institutionId,
        name: rejectedInstitution.name,
        rejectedBy: reviewerUserId,
        reason: rejectionReason
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution rejected: ${rejectedInstitution.name}`,
        context: {
          institutionId,
          reviewerUserId,
          rejectionReason
        }
      });
      
      // Notify institution contacts
      for (const contact of institution.contacts) {
        await this.notificationService.sendNotification(
          contact.id,
          'Institution Verification Rejected',
          `Your institution '${institution.name}' verification has been rejected. Reason: ${rejectionReason}`
        );
      }
      
      return rejectedInstitution;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to reject institution',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          reviewerUserId,
          rejectionReason
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to reject institution',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Add a contact to an institution
   */
  async addInstitutionContact(userId: string, contact: Omit<InstitutionContact, 'id'>, institutionId: string
  ): Promise<InstitutionContact> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Validate if the user is authorized to update this institution
      await this.validateUserCanEditInstitution(userId, institutionId);
      
      // Create new contact with ID
      const newContact: InstitutionContact = {
        ...contact,
        id: uuidv4()
      };
      
      // If this is set as primary, update other contacts
      if (newContact.isPrimary) {
        institution.contacts = institution.contacts.map(c => ({
          ...c,
          isPrimary: false
        }));
      }
      
      // Add the new contact
      const updatedInstitution = {
        ...institution,
        contacts: [...institution.contacts, newContact],
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(updatedInstitution);
      
      // Emit event
      this.eventBus.emit('institution-contact-added', {
        institutionId: institutionId,
        contactId: newContact.id,
        contactName: newContact.name,
        contactEmail: newContact.email,
        isPrimary: newContact.isPrimary,
        isDPO: newContact.isDPO,
        userId: userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution contact added: ${newContact.name}`,
        context: {
          institutionId: institutionId,
          contactId: newContact.id,
          userId: userId
        }
      });
      
      return newContact;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to add institution contact',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          contactName: contact.name,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to add institution contact',
        {
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Update an institution contact
   */
  async updateInstitutionContact(userId: string, contactId: string,
    updates: Partial<InstitutionContact>, institutionId: string
  ): Promise<InstitutionContact> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Validate if the user is authorized to update this institution
      await this.validateUserCanEditInstitution(userId, institutionId);
      
      // Find the contact to update
      const contactIndex = institution.contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Contact with ID '${contactId}' not found in institution`,
          { institutionId, contactId }
        );
      }
      
      const currentContact = institution.contacts[contactIndex];
      
      // Create updated contact
      const updatedContact = {
        ...currentContact,
        ...updates
      };
      
      // If this is set as primary, update other contacts
      const updatedContacts = [...institution.contacts];
      updatedContacts[contactIndex] = updatedContact;
      
      if (updatedContact.isPrimary) {
        for (let i = 0; i < updatedContacts.length; i++) {
          if (i !== contactIndex) {
            updatedContacts[i] = {
              ...updatedContacts[i],
              isPrimary: false
            };
          }
        }
      }
      
      // Update the institution
      const updatedInstitution = {
        ...institution,
        contacts: updatedContacts,
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(updatedInstitution);
      
      // Emit event
      this.eventBus.emit('institution-contact-updated', {
        institutionId,
        contactId,
        updates: Object.keys(updates),
        userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution contact updated: ${updatedContact.name}`,
        context: {
          institutionId,
          contactId,
          updatedFields: Object.keys(updates),
          userId
        }
      });
      
      return updatedContact;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to update institution contact',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          contactId,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to update institution contact',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Remove an institution contact
   */
  async removeInstitutionContact(userId: string, contactId: string, institutionId: string
  ): Promise<void> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Validate if the user is authorized to update this institution
      await this.validateUserCanEditInstitution(userId, institutionId);
      
      // Find the contact to remove
      const contactIndex = institution.contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Contact with ID '${contactId}' not found in institution`,
          { institutionId, contactId }
        );
      }
      
      const contactToRemove = institution.contacts[contactIndex];
      
      // Ensure we're not removing the last contact
      if (institution.contacts.length === 1) {
        throw new InstitutionError(
          InstitutionErrorType.INVALID_INPUT,
          'Cannot remove the last contact from an institution',
          { institutionId }
        );
      }
      
      // Ensure we're not removing the primary contact without setting a new one
      if (contactToRemove.isPrimary) {
        throw new InstitutionError(
          InstitutionErrorType.INVALID_INPUT,
          'Cannot remove the primary contact. Set another contact as primary first.',
          { institutionId, contactId }
        );
      }
      
      // Remove the contact
      const updatedContacts = institution.contacts.filter(c => c.id !== contactId);
      
      // Update the institution
      const updatedInstitution = {
        ...institution,
        contacts: updatedContacts,
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(updatedInstitution);
      
      // Emit event
      this.eventBus.emit('institution-contact-removed', {
        institutionId,
        contactId,
        contactName: contactToRemove.name,
        userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution contact removed: ${contactToRemove.name}`,
        context: {
          institutionId,
          contactId,
          userId
        }
      });
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to remove institution contact',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          contactId,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to remove institution contact',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Add a compliance certification to an institution
   */
  async addComplianceCertification(userId: string, certification: Omit<ComplianceCertification, 'id' | 'verificationStatus' | 'verifiedBy' | 'verificationDate'>, institutionId: string
  ): Promise<ComplianceCertification> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Validate if the user is authorized to update this institution
      await this.validateUserCanEditInstitution(userId, institutionId);
      
      // Create new certification with ID
      const newCertification: ComplianceCertification = {
        ...certification,
        id: uuidv4(),
        verificationStatus: VerificationStatus.PENDING
      };
      
      // Add the new certification
      const updatedInstitution = {
        ...institution,
        complianceCertifications: [...institution.complianceCertifications, newCertification],
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(updatedInstitution);
      
      // Emit event
      this.eventBus.emit('institution-certification-added', {
        institutionId,
        certificationId: newCertification.id,
        framework: newCertification.framework,
        userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution compliance certification added: ${newCertification.framework}`,
        context: {
          institutionId,
          certificationId: newCertification.id,
          framework: newCertification.framework,
          userId
        }
      });
      
      // Notify administrators about new certification
      await this.notifyAdminsOfNewCertification(institution, newCertification);
      
      return newCertification;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to add compliance certification',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          framework: certification.framework,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to add compliance certification',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Verify a compliance certification
   */
  async verifyComplianceCertification(
    institutionId: string,
    certificationId: string,
    verifierUserId: string,
    verificationNotes?: string
  ): Promise<ComplianceCertification> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Verify the user has admin permissions
      await this.validateUserIsAdmin(verifierUserId);
      
      // Find the certification to verify
      const certificationIndex = institution.complianceCertifications.findIndex(c => c.id === certificationId);
      
      if (certificationIndex === -1) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Certification with ID '${certificationId}' not found in institution`,
          { institutionId, certificationId }
        );
      }
      
      const currentCertification = institution.complianceCertifications[certificationIndex];
      
      // Update the certification
      const verifiedCertification: ComplianceCertification = {
        ...currentCertification,
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedBy: verifierUserId,
        verificationDate: new Date()
      };
      
      // Update the certifications array
      const updatedCertifications = [...institution.complianceCertifications];
      updatedCertifications[certificationIndex] = verifiedCertification;
      
      // Update the institution
      const updatedInstitution = {
        ...institution,
        complianceCertifications: updatedCertifications,
        lastUpdated: new Date(),
        updatedBy: verifierUserId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(updatedInstitution);
      
      // Emit event
      this.eventBus.emit('institution-certification-verified', {
        institutionId,
        certificationId,
        framework: verifiedCertification.framework,
        verifierUserId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution compliance certification verified: ${verifiedCertification.framework}`,
        context: {
          institutionId,
          certificationId,
          verifierUserId,
          verificationNotes
        }
      });
      
      // Notify institution contacts
      for (const contact of institution.contacts) {
        await this.notificationService.sendNotification(
          contact.id,
          'Compliance Certification Verified',
          `The ${verifiedCertification.framework} compliance certification for '${institution.name}' has been verified.`
        );
      }
      
      return verifiedCertification;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to verify compliance certification',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          certificationId,
          verifierUserId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to verify compliance certification',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Add a data governance policy to an institution
   */
  async addDataGovernancePolicy(userId: string, policy: Omit<DataGovernancePolicy, 'id'>, institutionId: string
  ): Promise<DataGovernancePolicy> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Validate if the user is authorized to update this institution
      await this.validateUserCanEditInstitution(userId, institutionId);
      
      // Create new policy with ID
      const newPolicy: DataGovernancePolicy = {
        ...policy,
        id: uuidv4()
      };
      
      // Add the new policy
      const updatedInstitution = {
        ...institution,
        dataGovernancePolicies: [...institution.dataGovernancePolicies, newPolicy],
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(updatedInstitution);
      
      // Emit event
      this.eventBus.emit('institution-policy-added', {
        institutionId,
        policyId: newPolicy.id,
        title: newPolicy.title,
        userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution data governance policy added: ${newPolicy.title}`,
        context: {
          institutionId,
          policyId: newPolicy.id,
          userId
        }
      });
      
      return newPolicy;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to add data governance policy',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          policyTitle: policy.title,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to add data governance policy',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Deactivate an institution
   */
  async deactivateInstitution(userId: string, reason: string, institutionId: string
  ): Promise<Institution> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Verify the user has admin permissions
      await this.validateUserIsAdmin(userId);
      
      // Update the institution
      const deactivatedInstitution = {
        ...institution,
        isActive: false,
        deactivationReason: reason,
        deactivationDate: new Date(),
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(deactivatedInstitution);
      
      // Update governance record
      await this.governanceService.updateOrganizationStatus(institutionId, 'inactive', {
        reason
      });
      
      // Emit event
      this.eventBus.emit('institution-deactivated', {
        institutionId,
        name: institution.name,
        reason,
        deactivatedBy: userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution deactivated: ${institution.name}`,
        context: {
          institutionId,
          reason,
          userId
        }
      });
      
      // Notify institution contacts
      for (const contact of institution.contacts) {
        await this.notificationService.sendNotification(
          contact.id,
          'Institution Deactivated',
          `Your institution '${institution.name}' has been deactivated. Reason: ${reason}`
        );
      }
      
      return deactivatedInstitution;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to deactivate institution',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          reason,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to deactivate institution',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  /**
   * Reactivate an institution
   */
  async reactivateInstitution(userId: string, institutionId: string
  ): Promise<Institution> {
    try {
      // Get the current institution
      const institution = await this.dataAccessService.getInstitutionById(institutionId);
      
      if (!institution) {
        throw new InstitutionError(
          InstitutionErrorType.NOT_FOUND,
          `Institution with ID '${institutionId}' not found`,
          { institutionId }
        );
      }
      
      // Verify the user has admin permissions
      await this.validateUserIsAdmin(userId);
      
      // Ensure the institution is currently inactive
      if (institution.isActive) {
        throw new InstitutionError(
          InstitutionErrorType.INVALID_INPUT,
          'Institution is already active',
          { institutionId }
        );
      }
      
      // Update the institution
      const reactivatedInstitution = {
        ...institution,
        isActive: true,
        deactivationReason: undefined,
        deactivationDate: undefined,
        lastUpdated: new Date(),
        updatedBy: userId
      };
      
      // Save updated institution
      await this.dataAccessService.updateInstitution(reactivatedInstitution);
      
      // Update governance record
      await this.governanceService.updateOrganizationStatus(institutionId, 'active');
      
      // Emit event
      this.eventBus.emit('institution-reactivated', {
        institutionId,
        name: institution.name,
        reactivatedBy: userId
      });
      
      // Log the operation
      this.loggingService.log({
        level: 'info',
        message: `Institution reactivated: ${institution.name}`,
        context: {
          institutionId,
          userId
        }
      });
      
      // Notify institution contacts
      for (const contact of institution.contacts) {
        await this.notificationService.sendNotification(
          contact.id,
          'Institution Reactivated',
          `Your institution '${institution.name}' has been reactivated and can now participate in data sharing.`
        );
      }
      
      return reactivatedInstitution;
    } catch (error) {
      if (error instanceof InstitutionError) {
        throw error;
      }
      
      this.loggingService.log({
        level: 'error',
        message: 'Failed to reactivate institution',
        context: {
          error: error instanceof Error ? error.message : String(error),
          institutionId,
          userId
        }
      });
      
      throw new InstitutionError(
        InstitutionErrorType.INTERNAL_ERROR,
        'Failed to reactivate institution',
        { 
          cause: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  // Helper methods
  
  /**
   * Validate institution input
   */
  private validateInstitutionInput(params: InstitutionCreationParams): void {
    // Basic validation
    if (!params.name || params.name.trim().length === 0) {
      throw new InstitutionError(
        InstitutionErrorType.INVALID_INPUT,
        'Institution name is required',
        { field: 'name' }
      );
    }
    
    if (!params.type) {
      throw new InstitutionError(
        InstitutionErrorType.INVALID_INPUT,
        'Institution type is required',
        { field: 'type' }
      );
    }
    
    if (!params.website || params.website.trim().length === 0) {
      throw new InstitutionError(
        InstitutionErrorType.INVALID_INPUT,
        'Institution website is required',
        { field: 'website' }
      );
    }
    
    // Validate address
    if (!params.address || !params.address.street || !params.address.city ||
        !params.address.postalCode || !params.address.country) {
      throw new InstitutionError(
        InstitutionErrorType.INVALID_INPUT,
        'Complete institution address is required',
        { field: 'address' }
      );
    }
    
    // Validate primary contact
    if (!params.primaryContact || !params.primaryContact.name || 
        !params.primaryContact.title || !params.primaryContact.email) {
      throw new InstitutionError(
        InstitutionErrorType.INVALID_INPUT,
        'Complete primary contact information is required',
        { field: 'primaryContact' }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.primaryContact.email)) {
      throw new InstitutionError(
        InstitutionErrorType.INVALID_INPUT,
        'Invalid email format for primary contact',
        { field: 'primaryContact.email', value: params.primaryContact.email }
      );
    }
    
    // Validate website URL format
    try {
      new URL(params.website.startsWith('http') ? params.website : `https://${params.website}`);
    } catch (error) {
      throw new InstitutionError(
        InstitutionErrorType.INVALID_INPUT,
        'Invalid website URL format',
        { field: 'website', value: params.website }
      );
    }
  }
  
  /**
   * Validate if user can edit an institution
   */
  private async validateUserCanEditInstitution(userId: string, institutionId: string): Promise<void> {
    // This is a placeholder - in a real implementation, this would check if the user
    // is either an admin or associated with the institution
    const canEdit = await this.governanceService.checkUserPermission(
      userId,
      'institution:edit',
      { institutionId }
    );
    
    if (!canEdit) {
      throw new InstitutionError(
        InstitutionErrorType.UNAUTHORIZED,
        'User is not authorized to edit this institution',
        { userId, institutionId }
      );
    }
  }
  
  /**
   * Validate if user has admin permissions
   */
  private async validateUserIsAdmin(userId: string): Promise<void> {
    const isAdmin = await this.governanceService.checkUserPermission(
      userId,
      'institution:admin'
    );
    
    if (!isAdmin) {
      throw new InstitutionError(
        InstitutionErrorType.UNAUTHORIZED,
        'User does not have administrative permissions',
        { userId }
      );
    }
  }
  
  /**
   * Notify administrators about a new institution registration
   */
  private async notifyAdminsOfNewInstitution(institution: Institution): Promise<void> {
    // Get admin users
    const adminUsers = await this.governanceService.getUsersWithPermission('institution:admin');
    
    // Send notifications
    for (const adminId of adminUsers) {
      await this.notificationService.sendNotification(
        adminId,
        'New Institution Registration',
        `A new institution '${institution.name}' has registered and requires verification.`
      );
    }
  }
  
  /**
   * Notify administrators about a new compliance certification
   */
  private async notifyAdminsOfNewCertification(
    institution: Institution,
    certification: ComplianceCertification
  ): Promise<void> {
    // Get admin users
    const adminUsers = await this.governanceService.getUsersWithPermission('certification:verify');
    
    // Send notifications
    for (const adminId of adminUsers) {
      await this.notificationService.sendNotification(
        adminId,
        'New Compliance Certification',
        `Institution '${institution.name}' has submitted a new ${certification.framework} compliance certification for verification.`
      );
    }
  }
}