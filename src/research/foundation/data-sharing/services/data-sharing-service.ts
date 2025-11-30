import { logger as _logger } from "@/lib/logger";
/**
 * Data Sharing Service
 * 
 * This service handles the management of cross-institutional data sharing,
 * including agreements, requests, and access grants.
 */

import { 
   
  DataSharingAgreement, 
  DataSharingRequest, 
  DataAccessGrant,
  DataAccessLevel, 
  DataUsagePurpose,
  AgreementStatus,
  SharingRequestStatus,
  LegalBasis,
  createDataSharingAgreement,
  createDataSharingRequest
} from '../models/data-sharing';
import { Institution, VerificationStatus } from '../models/institution';
import { InstitutionService } from './institution-service';
import { DataAccessService } from '../../data-lake/services/data-access-service';
import { GovernanceService } from '../../governance/services/governance-service';
import { EventBusService } from '../../shared/services/event-bus';
import { LoggingService } from '../../shared/services/logging-service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Status for data access grants
 */
export enum GrantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

/**
 * Days of week type for time restrictions
 */
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/**
 * Data Sharing Service error types
 */
export type DataSharingErrorType = 
  | 'INVALID_INSTITUTION' 
  | 'INSUFFICIENT_COMPLIANCE' 
  | 'UNAUTHORIZED_ACCESS'
  | 'AGREEMENT_VIOLATION'
  | 'EXPIRED_AGREEMENT'
  | 'EXPIRED_CERTIFICATION'
  | 'INVALID_REQUEST'
  | 'INVALID_DATASET'
  | 'INVALID_ACCESS_LEVEL'
  | 'GOVERNANCE_VIOLATION';

/**
 * Data Sharing Service error
 */
export class DataSharingError extends Error {
  constructor(
    public type: DataSharingErrorType,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DataSharingError';
  }
}

/**
 * Create a data access grant
 */
export function createDataAccessGrant(
  params: {
    requestId: string;
    agreementId: string;
    datasetIds: string[];
    accessLevel: DataAccessLevel;
    purpose: DataUsagePurpose;
    status: GrantStatus;
    approverId: string;
    approverNotes?: string;
    expiryDate: Date;
    accessibleFields?: string[];
    ipRestrictions?: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      timezone: string;
      allowedDays: DayOfWeek[];
    };
    usageConditions?: string[];
  }
): DataAccessGrant {
  const now = new Date();
  
  return {
    id: uuidv4(),
    requestId: params.requestId,
    grantedBy: params.approverId,
    grantDate: now,
    expiryDate: params.expiryDate,
    institutionId: '', // Will be filled by the service
    userId: params.approverId,
    datasetIds: params.datasetIds,
    accessLevel: params.accessLevel,
    accessibleFields: params.accessibleFields,
    ipRestrictions: params.ipRestrictions,
    timeRestrictions: params.timeRestrictions,
    usageConditions: params.usageConditions || [],
    auditRequirements: {
      logAccessAttempts: true,
      logDataRetrievals: true,
      periodicAuditReview: true
    },
    isActive: true
  };
}

/**
 * Data Sharing Service for managing cross-institutional data sharing
 */
export class DataSharingService {
  private logger: LoggingService;

  constructor(
    private _institutionService: InstitutionService,
    private dataAccessService: DataAccessService,
    private governanceService: GovernanceService,
    private eventBus: EventBusService,
    logger?: LoggingService
  ) {
    this.logger = logger || new LoggingService();
  }

  /**
   * Create a new data sharing agreement between institutions
   */
  async createAgreement(
    _providerId: string,
    _recipientIds: string[],
    _datasetIds: string[],
    allowedPurposes: DataUsagePurpose[],
    allowedAccessLevels: DataAccessLevel[],
    startDate: Date,
    endDate: Date,
    termsAndConditions: string,
    legalBasis: LegalBasis,
    createdById: string,
    name: string,
    description: string
  ): Promise<DataSharingAgreement> {
    // Verify institutions exist and are verified
    const provider = await this.getVerifiedInstitution(_providerId);
    
    for (const recipientId of _recipientIds) {
      await this.getVerifiedInstitution(recipientId);
    }

    // Verify datasets exist and provider has rights to share them
    const datasets = await Promise.all(
      _datasetIds.map(async (datasetId) => {
        const dataset = await this.dataAccessService.getDatasetById(datasetId);
        if (!dataset) {
          throw new DataSharingError(
            'INVALID_DATASET',
            `Dataset with ID ${datasetId} does not exist`,
            { datasetId }
          );
        }
        
        // Check if provider has rights to share this dataset
        const hasRights = await this.hasDatasetRights(_providerId, datasetId);
        if (!hasRights) {
          throw new DataSharingError(
            'UNAUTHORIZED_ACCESS',
            `Institution ${_providerId} does not have rights to share dataset ${datasetId}`,
            { _providerId, datasetId }
          );
        }
        
        return dataset;
      })
    );

    // Check governance policies for data sharing
    const governanceCheck = await this.checkDataSharingCompliance(
      _providerId,
      _recipientIds,
      _datasetIds,
      allowedAccessLevels,
      allowedPurposes
    );

    if (!governanceCheck.compliant) {
      throw new DataSharingError(
        'GOVERNANCE_VIOLATION',
        `Data sharing violates governance policies: ${governanceCheck.reasons.join(', ')}`,
        { _providerId, _recipientIds, violations: governanceCheck.reasons }
      );
    }

    // Create the agreement
    const agreement = createDataSharingAgreement({
      name,
      description,
      startDate,
      endDate,
      providerInstitutionId: _providerId,
      recipientInstitutions: _recipientIds,
      sharedDatasets: _datasetIds,
      allowedPurposes: allowedPurposes,
      legalBasis,
      dataProtectionClauses: [termsAndConditions],
      intellectualPropertyClauses: [],
      confidentialityClauses: [],
      liabilityClauses: [],
      breachNotificationProcedure: '',
      disputeResolutionProcedure: '',
      terminationClauses: [],
      governingLaw: 'United Kingdom',
      status: AgreementStatus.PENDING_APPROVAL
    }, createdById);

    // Save the agreement
    await this.dataAccessService.saveAgreement(agreement);

    // Log the creation
    this.logger.info('Data sharing agreement created', {
      agreementId: agreement.id,
      _providerId,
      _recipientIds,
      datasetIds: _datasetIds
    });

    // Publish event
    this.eventBus.emit('dataSharingAgreement.created', {
      agreement,
      provider,
      _recipientIds,
      datasets
    });

    return agreement;
  }

  /**
   * Update an existing data sharing agreement
   */
  async updateAgreement(
    agreementId: string,
    updates: Partial<Omit<DataSharingAgreement, 'id' | 'providerInstitutionId' | 'recipientInstitutions'>>,
    updatedById: string
  ): Promise<DataSharingAgreement> {
    const agreement = await this.dataAccessService.getAgreementById(agreementId);
    if (!agreement) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} does not exist`,
        { agreementId }
      );
    }

    // If access levels or purposes are being updated, verify governance compliance
    if (updates.allowedPurposes || updates.sharedDatasets) {
      const sharedDatasets = updates.sharedDatasets || agreement.sharedDatasets;
      const allowedPurposes = updates.allowedPurposes || agreement.allowedPurposes;
      const allowedAccessLevels = agreement.allowedPurposes as unknown as DataAccessLevel[];
      
      const governanceCheck = await this.checkDataSharingCompliance(
        agreement.providerInstitutionId,
        agreement.recipientInstitutions,
        sharedDatasets,
        allowedAccessLevels,
        allowedPurposes
      );

      if (!governanceCheck.compliant) {
        throw new DataSharingError(
          'GOVERNANCE_VIOLATION',
          `Updated agreement violates governance policies: ${governanceCheck.reasons.join(', ')}`,
          { agreementId, violations: governanceCheck.reasons }
        );
      }
    }

    // Apply updates
    const updatedAgreement = {
      ...agreement,
      ...updates,
      updatedBy: updatedById,
      lastUpdated: new Date()
    };

    // Save the updated agreement
    await this.dataAccessService.updateAgreement(updatedAgreement);

    // Log the update
    this.logger.info('Data sharing agreement updated', {
      agreementId,
      updates: Object.keys(updates)
    });

    // Publish event
    this.eventBus.emit('dataSharingAgreement.updated', {
      previous: agreement,
      current: updatedAgreement
    });

    return updatedAgreement;
  }

  /**
   * Activate a pending data sharing agreement
   */
  async activateAgreement(agreementId: string, activatedById: string): Promise<DataSharingAgreement> {
    const agreement = await this.dataAccessService.getAgreementById(agreementId);
    if (!agreement) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} does not exist`,
        { agreementId }
      );
    }

    if (agreement.status !== AgreementStatus.PENDING_APPROVAL) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} is not in PENDING_APPROVAL status`,
        { agreementId, currentStatus: agreement.status }
      );
    }

    // Verify both institutions still exist and are verified
    const provider = await this.getVerifiedInstitution(agreement.providerInstitutionId);
    
    for (const recipientId of agreement.recipientInstitutions) {
      await this.getVerifiedInstitution(recipientId);
    }

    // Verify provider has active compliance certifications
    const providerCompliance = await this.getComplianceStatus(agreement.providerInstitutionId);
    if (!providerCompliance.compliant) {
      throw new DataSharingError(
        'INSUFFICIENT_COMPLIANCE',
        `Provider institution does not have required compliance certifications: ${providerCompliance.reasons.join(', ')}`,
        { id: agreement.providerInstitutionId, reasons: providerCompliance.reasons }
      );
    }

    // Verify all recipients have active compliance certifications
    for (const recipientId of agreement.recipientInstitutions) {
      const recipientCompliance = await this.getComplianceStatus(recipientId);
      if (!recipientCompliance.compliant) {
        throw new DataSharingError(
          'INSUFFICIENT_COMPLIANCE',
          `Recipient institution ${recipientId} does not have required compliance certifications: ${recipientCompliance.reasons.join(', ')}`,
          { id: recipientId, reasons: recipientCompliance.reasons }
        );
      }
    }

    // Create activation approval
    const approval = {
      id: agreement.providerInstitutionId,
      approvedBy: activatedById,
      approvalDate: new Date(),
      comments: 'Agreement activated'
    };

    // Update the agreement status
    const activatedAgreement = await this.updateAgreement(agreementId, {
      status: AgreementStatus.ACTIVE,
      approvals: [...(agreement.approvals || []), approval]
    }, activatedById);

    // Log the activation
    this.logger.info('Data sharing agreement activated', {
      agreementId,
      providerId: agreement.providerInstitutionId,
      recipientIds: agreement.recipientInstitutions
    });

    // Publish event
    this.eventBus.emit('dataSharingAgreement.activated', {
      agreement: activatedAgreement,
      provider,
      recipientIds: agreement.recipientInstitutions
    });

    return activatedAgreement;
  }

  /**
   * Terminate an active data sharing agreement
   */
  async terminateAgreement(
    agreementId: string, 
    reason: string,
    terminatedById: string
  ): Promise<DataSharingAgreement> {
    const agreement = await this.dataAccessService.getAgreementById(agreementId);
    if (!agreement) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} does not exist`,
        { agreementId }
      );
    }

    if (agreement.status !== AgreementStatus.ACTIVE) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} is not in ACTIVE status`,
        { agreementId, currentStatus: agreement.status }
      );
    }

    // Revoke all active grants under this agreement
    const activeGrants = await this.getActiveGrantsByAgreement(agreementId);
    await Promise.all(
      activeGrants.map(grant => 
        this.revokeAccess(grant.id, `Agreement terminated: ${reason}`, terminatedById)
      )
    );

    // Update the agreement status
    const terminatedAgreement = await this.updateAgreement(agreementId, {
      status: AgreementStatus.TERMINATED,
      terminatedBy: terminatedById,
      terminationReason: reason,
      terminationDate: new Date()
    }, terminatedById);

    // Log the termination
    this.logger.info('Data sharing agreement terminated', {
      agreementId,
      reason,
      activeGrantsRevoked: activeGrants.length
    });

    // Publish event
    this.eventBus.emit('dataSharingAgreement.terminated', {
      agreement: terminatedAgreement,
      reason,
      revokedGrants: activeGrants
    });

    return terminatedAgreement;
  }

  /**
   * Submit a data access request
   */
  async requestDataAccess(
    recipientId: string,
    agreementId: string,
    _datasetIds: string[],
    accessLevel: DataAccessLevel,
    purpose: DataUsagePurpose,
    requestingUserId: string,
    projectDescription: string,
    researchQuestions: string[],
    methodologySummary: string,
    proposedAnalysisMethods: string[],
    expectedOutputs: string[],
    requestedDuration: number, // in months
    title: string,
    description: string
  ): Promise<DataSharingRequest> {
    // Verify the agreement exists and is active
    const agreement = await this.dataAccessService.getAgreementById(agreementId);
    if (!agreement) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} does not exist`,
        { agreementId }
      );
    }

    if (agreement.status !== AgreementStatus.ACTIVE) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} is not active`,
        { agreementId, status: agreement.status }
      );
    }

    // Verify recipient is included in the agreement
    if (!agreement.recipientInstitutions.includes(recipientId)) {
      throw new DataSharingError(
        'UNAUTHORIZED_ACCESS',
        `Institution ${recipientId} is not a recipient in agreement ${agreementId}`,
        { recipientId, agreementRecipientIds: agreement.recipientInstitutions }
      );
    }

    // Verify datasets are included in the agreement
    for (const datasetId of _datasetIds) {
      if (!agreement.sharedDatasets.includes(datasetId)) {
        throw new DataSharingError(
          'INVALID_REQUEST',
          `Dataset ${datasetId} is not included in agreement ${agreementId}`,
          { datasetId, agreementId }
        );
      }
    }

    // Verify purpose is allowed by the agreement
    if (!agreement.allowedPurposes.includes(purpose)) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Purpose ${purpose} is not allowed by agreement ${agreementId}`,
        { purpose, allowedPurposes: agreement.allowedPurposes }
      );
    }

    // Create the request
    const request = createDataSharingRequest({
      title,
      description,
      requestingInstitutionId: recipientId,
      requestedDatasets: _datasetIds,
      dataProviderInstitutionId: agreement.providerInstitutionId,
      researchPurpose: purpose,
      projectDescription,
      researchQuestions,
      methodologySummary,
      proposedAnalysisMethods,
      expectedOutputs,
      requestedAccessLevel: accessLevel,
      requestedDuration
    }, requestingUserId);

    // Update status to submitted (as createDataSharingRequest defaults to DRAFT)
    const submittedRequest = {
      ...request,
      status: SharingRequestStatus.SUBMITTED
    };

    // Save the request
    await this.dataAccessService.saveRequest(submittedRequest);

    // Log the request
    this.logger.info('Data sharing request submitted', {
      requestId: submittedRequest.id,
      agreementId,
      recipientId,
      sharedDatasets: _datasetIds,
      accessLevel,
      purpose
    });

    // Publish event
    this.eventBus.emit('dataSharingRequest.created', {
      request: submittedRequest,
      agreement
    });

    return submittedRequest;
  }

  /**
   * Approve a data access request
   */
  async approveRequest(
    requestId: string,
    approverId: string,
    approverNotes?: string,
    customDuration?: number // in days, overrides requested duration if provided
  ): Promise<DataAccessGrant> {
    const request = await this.dataAccessService.getRequestById(requestId);
    if (!request) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Request with ID ${requestId} does not exist`,
        { requestId }
      );
    }

    if (request.status !== SharingRequestStatus.SUBMITTED && 
        request.status !== SharingRequestStatus.UNDER_REVIEW) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Request with ID ${requestId} is not in a reviewable status`,
        { requestId, currentStatus: request.status }
      );
    }

    // Verify approver is from the provider institution
    const approverInstitution = await this.getInstitutionByUserId(approverId);
    if (!approverInstitution || approverInstitution.id !== request.dataProviderInstitutionId) {
      throw new DataSharingError(
        'UNAUTHORIZED_ACCESS',
        `User ${approverId} is not authorized to approve this request`,
        { approverId, providerInstitutionId: request.dataProviderInstitutionId }
      );
    }

    // Calculate expiry date based on duration
    const durationInDays = customDuration ?? (request.requestedDuration * 30); // Convert months to approx days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationInDays);

    // Create the grant
    const grant = createDataAccessGrant({
      requestId,
      agreementId: '', // Will be populated by additional logic
      datasetIds: request.requestedDatasets,
      accessLevel: request.requestedAccessLevel,
      purpose: request.researchPurpose,
      status: GrantStatus.ACTIVE,
      approverId,
      approverNotes,
      expiryDate,
      usageConditions: [`Approved for: ${request.projectDescription.substring(0, 100)}...`]
    });

    // Set the institution ID
    grant.institutionId = request.requestingInstitutionId;

    // Create a review decision
    const reviewDecision = {
      decision: 'approved' as const,
      decidedBy: approverId,
      decisionDate: new Date(),
      rationale: approverNotes || 'Request approved',
      conditions: []
    };

    // Update the request status
    const updatedRequest = {
      ...request,
      status: SharingRequestStatus.APPROVED,
      reviewDecision,
      resolvedAt: new Date()
    };

    // Save the updated request
    await this.dataAccessService.updateRequest(updatedRequest);

    // Save the grant
    await this.dataAccessService.saveAccessGrant(grant);

    // Log the approval
    this.logger.info('Data sharing request approved', {
      requestId,
      grantId: grant.id,
      approverId,
      expiryDate
    });

    // Publish events
    this.eventBus.emit('dataSharingRequest.approved', {
      request: updatedRequest,
      grant,
      approverNotes
    });

    this.eventBus.emit('dataAccessGrant.created', {
      grant,
      request: updatedRequest
    });

    return grant;
  }

  /**
   * Reject a data access request
   */
  async rejectRequest(
    requestId: string,
    resolverId: string,
    rejectionReason: string
  ): Promise<DataSharingRequest> {
    const request = await this.dataAccessService.getRequestById(requestId);
    if (!request) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Request with ID ${requestId} does not exist`,
        { requestId }
      );
    }

    if (request.status !== SharingRequestStatus.SUBMITTED && 
        request.status !== SharingRequestStatus.UNDER_REVIEW) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Request with ID ${requestId} is not in a reviewable status`,
        { requestId, currentStatus: request.status }
      );
    }

    // Verify resolver is from the provider institution
    const resolverInstitution = await this.getInstitutionByUserId(resolverId);
    if (!resolverInstitution || resolverInstitution.id !== request.dataProviderInstitutionId) {
      throw new DataSharingError(
        'UNAUTHORIZED_ACCESS',
        `User ${resolverId} is not authorized to reject this request`,
        { resolverId, providerInstitutionId: request.dataProviderInstitutionId }
      );
    }

    // Create a review decision
    const reviewDecision = {
      decision: 'rejected' as const,
      decidedBy: resolverId,
      decisionDate: new Date(),
      rationale: rejectionReason,
      conditions: []
    };

    // Update the request status
    const updatedRequest = {
      ...request,
      status: SharingRequestStatus.REJECTED,
      reviewDecision,
      resolvedAt: new Date()
    };

    // Save the updated request
    await this.dataAccessService.updateRequest(updatedRequest);

    // Log the rejection
    this.logger.info('Data sharing request rejected', {
      requestId,
      resolverId,
      reason: rejectionReason
    });

    // Publish event
    this.eventBus.emit('dataSharingRequest.rejected', {
      request: updatedRequest,
      rejectionReason
    });

    return updatedRequest;
  }

  /**
   * Revoke an active data access grant
   */
  async revokeAccess(
    grantId: string,
    revocationReason: string,
    revokedById: string
  ): Promise<DataAccessGrant> {
    const grant = await this.dataAccessService.getAccessGrantById(grantId);
    if (!grant) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Grant with ID ${grantId} does not exist`,
        { grantId }
      );
    }

    if (!grant.isActive) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Grant with ID ${grantId} is not active`,
        { grantId }
      );
    }

    // Update the grant
    const updatedGrant = {
      ...grant,
      isActive: false,
      revocationReason,
      revocationDate: new Date(),
      revokedBy: revokedById
    };

    await this.dataAccessService.updateAccessGrant(updatedGrant);

    // Log the revocation
    this.logger.info('Data access grant revoked', {
      grantId,
      reason: revocationReason
    });

    // Publish event
    this.eventBus.emit('dataAccessGrant.revoked', {
      grant: updatedGrant,
      reason: revocationReason
    });

    return updatedGrant;
  }

  /**
   * Get agreements where institution is a provider
   */
  async getAgreementsByProvider(
    id: string,
    status?: AgreementStatus
  ): Promise<DataSharingAgreement[]> {
    await this.verifyInstitutionExists(id);
    const result = await this.dataAccessService.searchAgreements({
      providerInstitutionId: id,
      status: status
    });
    return result.agreements;
  }

  /**
   * Get agreements where institution is a recipient
   */
  async getAgreementsByRecipient(
    id: string,
    status?: AgreementStatus
  ): Promise<DataSharingAgreement[]> {
    await this.verifyInstitutionExists(id);
    const result = await this.dataAccessService.searchAgreements({
      recipientInstitutionId: id,
      status: status
    });
    return result.agreements;
  }

  /**
   * Get all data access requests for an agreement
   */
  async getRequestsByAgreement(
    agreementId: string,
    _status?: SharingRequestStatus
  ): Promise<DataSharingRequest[]> {
    await this.verifyAgreementExists(agreementId);
    // In a real implementation, we would filter by agreement ID
    // This is a placeholder implementation
    return [];
  }

  /**
   * Get all active grants for a dataset
   */
  async getActiveGrantsByDataset(datasetId: string): Promise<DataAccessGrant[]> {
    const result = await this.dataAccessService.searchAccessGrants({
      datasetId,
      isActive: true
    });
    return result.grants;
  }

  /**
   * Get all active grants for an agreement
   */
  async getActiveGrantsByAgreement(_agreementId: string): Promise<DataAccessGrant[]> {
    // This is a placeholder implementation
    // In a real implementation, we would filter by agreement ID
    return [];
  }

  /**
   * Check if a user has access to a dataset
   */
  async checkUserDatasetAccess(
    id: string,
    datasetId: string,
    requiredAccessLevel: DataAccessLevel
  ): Promise<{ hasAccess: boolean; grant?: DataAccessGrant }> {
    // Get user's institution
    const institution = await this.getInstitutionByUserId(id);
    if (!institution) {
      return { hasAccess: false };
    }

    // Get active grants for this institution and dataset
    const result = await this.dataAccessService.searchAccessGrants({
      institutionId: institution.id,
      datasetId,
      isActive: true
    });

    // Find a grant that provides the required access level or higher
    const accessLevelOrder: DataAccessLevel[] = [
      DataAccessLevel.METADATA_ONLY,
      DataAccessLevel.AGGREGATED_RESULTS,
      DataAccessLevel.SYNTHETIC,
      DataAccessLevel.ANONYMIZED,
      DataAccessLevel.PSEUDONYMIZED,
      DataAccessLevel.IDENTIFIED
    ];

    const requiredLevelIndex = accessLevelOrder.indexOf(requiredAccessLevel);
    const validGrant = result.grants.find(grant => {
      const grantLevelIndex = accessLevelOrder.indexOf(grant.accessLevel);
      return grantLevelIndex >= requiredLevelIndex;
    });

    return {
      hasAccess: !!validGrant,
      grant: validGrant
    };
  }

  /**
   * Utility method to verify an institution exists and is verified
   */
  private async getVerifiedInstitution(id: string): Promise<Institution> {
    const institution = await this.dataAccessService.getInstitutionById(id);
    if (!institution) {
      throw new DataSharingError(
        'INVALID_INSTITUTION',
        `Institution with ID ${id} does not exist`,
        { id }
      );
    }

    if (institution.verificationStatus !== VerificationStatus.VERIFIED) {
      throw new DataSharingError(
        'INVALID_INSTITUTION',
        `Institution with ID ${id} is not verified`,
        { id, verificationStatus: institution.verificationStatus }
      );
    }

    return institution;
  }

  /**
   * Utility method to verify an institution exists
   */
  private async verifyInstitutionExists(id: string): Promise<void> {
    const institution = await this.dataAccessService.getInstitutionById(id);
    if (!institution) {
      throw new DataSharingError(
        'INVALID_INSTITUTION',
        `Institution with ID ${id} does not exist`,
        { id }
      );
    }
  }

  /**
   * Utility method to verify an agreement exists
   */
  private async verifyAgreementExists(agreementId: string): Promise<void> {
    const agreement = await this.dataAccessService.getAgreementById(agreementId);
    if (!agreement) {
      throw new DataSharingError(
        'INVALID_REQUEST',
        `Agreement with ID ${agreementId} does not exist`,
        { agreementId }
      );
    }
  }

  /**
   * Utility method to get institution by user ID
   */
  private async getInstitutionByUserId(_userId: string): Promise<Institution | null> {
    // This is a placeholder implementation
    // In a real implementation, we would use a users service to get the user's institution
    return null;
  }

  /**
   * Check if provider has rights to share a dataset
   */
  private async hasDatasetRights(_providerId: string, datasetId: string): Promise<boolean> {
    const dataset = await this.dataAccessService.getDatasetById(datasetId);
    return dataset?.ownerId === _providerId;
  }

  /**
   * Check compliance with governance policies
   */
  private async checkDataSharingCompliance(
    _providerId: string,
    _recipientIds: string[],
    _datasetIds: string[],
    _accessLevels: DataAccessLevel[],
    allowedPurposes: DataUsagePurpose[]
  ): Promise<{ compliant: boolean; reasons: string[] }> {
    void(_providerId);
    void(_recipientIds);
    void(_datasetIds);
    void(_accessLevels);
    void(allowedPurposes);
    // This is a placeholder implementation
    // In a real implementation, we would check against governance policies
    return { compliant: true, reasons: [] };
  }

  /**
   * Get compliance status for an institution
   */
  private async getComplianceStatus(id: string): Promise<{ compliant: boolean; reasons: string[] }> {
    const institution = await this.dataAccessService.getInstitutionById(id);
    if (!institution) {
      return { compliant: false, reasons: ['Institution does not exist'] };
    }

    const reasons: string[] = [];

    // Check if any required certifications are missing or expired
    const requiredFrameworks = ['gdpr', 'uk_data_protection_act'];
    
    const hasRequiredCertifications = requiredFrameworks.every(framework => {
      const cert = institution.complianceCertifications.find(c => 
        c.framework.toLowerCase() === framework && 
        c.verificationStatus === VerificationStatus.VERIFIED
      );
      
      if (!cert) {
        reasons.push(`Missing required certification: ${framework}`);
        return false;
      }
      
      if (cert.expiryDate && new Date() > new Date(cert.expiryDate)) {
        reasons.push(`Expired certification: ${framework}`);
        return false;
      }
      
      return true;
    });

    return { 
      compliant: hasRequiredCertifications,
      reasons
    };
  }
}