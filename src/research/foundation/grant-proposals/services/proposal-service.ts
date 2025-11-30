import { logger as _logger } from "@/lib/logger";
/**
 * Proposal Service
 * 
 * Service layer for managing grant proposals in the EdPsych Research Foundation.
 * Provides comprehensive functionality for creating, managing, and submitting
 * grant proposals with integration to funding bodies and research components.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  GrantProposal,
  ProposalStatus,
  ProposalCreationParams,
  ProposalUpdateParams,
  FundingBody,
  FundingScheme,
  Attachment,
  AttachmentType,
  ProposalReview,
  RevisionRequest,
  ProposalSearchFilters,
  InvestigatorRole,
  FunderType
} from '../models/proposal';
import { DataAccessService } from '../../data-lake/services/data-access-service';
import { GovernanceService } from '../../governance/services/governance-service';
import { EventEmitter } from 'events';
import { LoggerService } from '../../common/services/logger-service';

/**
 * Service for managing grant proposals
 */
export class ProposalService {
  private dataAccessService: DataAccessService;
  private governanceService: GovernanceService;
  private logger: LoggerService;
  private events: EventEmitter;

  constructor(
    dataAccessService: DataAccessService,
    governanceService: GovernanceService,
    logger: LoggerService
  ) {
    this.dataAccessService = dataAccessService;
    this.governanceService = governanceService;
    this.logger = logger;
    this.events = new EventEmitter();
  }

  /**
   * Create a new grant proposal
   */
  async createProposal(
    creationParams: ProposalCreationParams,
    id: string
  ): Promise<GrantProposal> {
    this.logger.info('Creating new grant proposal', { id, title: creationParams.title });

    // Check if creating from template
    let templateProposal: GrantProposal | null = null;
    if (creationParams.fromTemplateId) {
      templateProposal = await this.getProposal(creationParams.fromTemplateId);
      if (!templateProposal || !templateProposal.isTemplate) {
        throw new Error(`Template proposal with ID ${creationParams.fromTemplateId} not found`);
      }
    }

    // Resolve funding body (either use the provided object or fetch by ID)
    let fundingBody: FundingBody;
    if (typeof creationParams.fundingBody === 'string') {
      const fetchedFundingBody = await this.dataAccessService.getFundingBody(creationParams.fundingBody);
      if (!fetchedFundingBody) {
        throw new Error(`Funding body with ID ${creationParams.fundingBody} not found`);
      }
      fundingBody = fetchedFundingBody;
    } else {
      fundingBody = creationParams.fundingBody;
    }

    // Resolve funding scheme (either use the provided object or fetch by ID)
    let fundingScheme: FundingScheme;
    if (typeof creationParams.fundingScheme === 'string') {
      const fetchedFundingScheme = await this.dataAccessService.getFundingScheme(creationParams.fundingScheme);
      if (!fetchedFundingScheme) {
        throw new Error(`Funding scheme with ID ${creationParams.fundingScheme} not found`);
      }
      fundingScheme = fetchedFundingScheme;
    } else {
      fundingScheme = creationParams.fundingScheme;
    }

    // Create the proposal
    const now = new Date();
    const proposal: GrantProposal = {
      id: uuidv4(),
      title: creationParams.title,
      summary: creationParams.summary,
      status: ProposalStatus.DRAFT,
      createdBy: id,
      createdDate: now,
      lastUpdated: now,
      updatedBy: id,
      grantType: creationParams.grantType,
      fundingBody: fundingBody,
      fundingScheme: fundingScheme,
      requestedAmount: creationParams.requestedAmount,
      currency: creationParams.currency,
      duration: creationParams.duration,
      plannedStartDate: creationParams.plannedStartDate,
      deadline: creationParams.deadline || 
        (fundingScheme.deadlines?.length > 0 ? fundingScheme.deadlines[0] : undefined),
      investigators: creationParams.investigators?.map(investigator => ({
        id: investigator.id || id,
        name: investigator.name || '',
        institution: investigator.institution || '',
        department: investigator.department,
        role: investigator.role || InvestigatorRole.PRINCIPAL,
        timeCommitment: investigator.timeCommitment || 0,
        expertise: investigator.expertise || [],
        bio: investigator.bio,
        contactEmail: investigator.contactEmail || '',
        orcidId: investigator.orcidId
      })) || [{
        id: id,
        name: '', // To be populated later
        institution: '',
        role: InvestigatorRole.PRINCIPAL,
        timeCommitment: 100,
        expertise: [],
        contactEmail: '',
      }],
      budget: templateProposal?.budget || [],
      projectPlan: templateProposal?.projectPlan || {
        summary: '',
        aims: [],
        objectives: [],
        methodology: '',
        milestones: []
      },
      ethicsApprovalRequired: false,
      attachments: [],
      reviews: [],
      revisionRequests: [],
      isTemplate: creationParams.isTemplate || false,
      templateName: creationParams.isTemplate ? creationParams.templateName : undefined,
      version: 1
    };

    // Persist the proposal
    await this.dataAccessService.saveProposal(proposal);

    // Register with governance service for tracking
    await this.governanceService.registerResearchObject({
      id: proposal.id,
      type: 'proposal',
      name: proposal.title,
      description: proposal.summary,
      createdBy: id,
      createdDate: proposal.createdDate
    });

    // Emit event
    this.events.emit('proposal:created', { proposalId: proposal.id, id });

    return proposal;
  }

  /**
   * Get a proposal by ID
   */
  async getProposal(proposalId: string): Promise<GrantProposal | null> {
    return this.dataAccessService.getProposal(proposalId);
  }

  /**
   * Update an existing proposal
   */
  async updateProposal(
    proposalId: string,
    updateParams: ProposalUpdateParams,
    id: string
  ): Promise<GrantProposal> {
    this.logger.info('Updating proposal', { id, proposalId });

    // Get the existing proposal
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if the proposal can be updated in its current state
    if ([
      ProposalStatus.SUBMITTED,
      ProposalStatus.UNDER_FUNDER_REVIEW,
      ProposalStatus.AWARDED,
      ProposalStatus.REJECTED,
      ProposalStatus.ARCHIVED
    ].includes(proposal.status) && !updateParams.isTemplate) {
      throw new Error(`Cannot update proposal with status ${proposal.status}`);
    }

    // Handle funding body update if needed
    let fundingBody = proposal.fundingBody;
    if (updateParams.fundingBody) {
      if (typeof updateParams.fundingBody === 'string') {
        const fetchedFundingBody = await this.dataAccessService.getFundingBody(updateParams.fundingBody);
        if (!fetchedFundingBody) {
          throw new Error(`Funding body with ID ${updateParams.fundingBody} not found`);
        }
        fundingBody = fetchedFundingBody;
      } else {
        fundingBody = updateParams.fundingBody;
      }
    }

    // Handle funding scheme update if needed
    let fundingScheme = proposal.fundingScheme;
    if (updateParams.fundingScheme) {
      if (typeof updateParams.fundingScheme === 'string') {
        const fetchedFundingScheme = await this.dataAccessService.getFundingScheme(updateParams.fundingScheme);
        if (!fetchedFundingScheme) {
          throw new Error(`Funding scheme with ID ${updateParams.fundingScheme} not found`);
        }
        fundingScheme = fetchedFundingScheme;
      } else {
        fundingScheme = updateParams.fundingScheme;
      }
    }

    // Update the proposal
    const updatedProposal: GrantProposal = {
      ...proposal,
      title: updateParams.title ?? proposal.title,
      summary: updateParams.summary ?? proposal.summary,
      status: updateParams.status ?? proposal.status,
      grantType: updateParams.grantType ?? proposal.grantType,
      fundingBody,
      fundingScheme,
      requestedAmount: updateParams.requestedAmount ?? proposal.requestedAmount,
      currency: updateParams.currency ?? proposal.currency,
      duration: updateParams.duration ?? proposal.duration,
      plannedStartDate: updateParams.plannedStartDate ?? proposal.plannedStartDate,
      deadline: updateParams.deadline ?? proposal.deadline,
      investigators: updateParams.investigators ?? proposal.investigators,
      budget: updateParams.budget ?? proposal.budget,
      projectPlan: updateParams.projectPlan 
        ? { ...proposal.projectPlan, ...updateParams.projectPlan }
        : proposal.projectPlan,
      impactStatement: updateParams.impactStatement ?? proposal.impactStatement,
      impactPathways: updateParams.impactPathways ?? proposal.impactPathways,
      ethicsStatement: updateParams.ethicsStatement ?? proposal.ethicsStatement,
      ethicsApprovalRequired: updateParams.ethicsApprovalRequired ?? proposal.ethicsApprovalRequired,
      ethicsApprovalStatus: updateParams.ethicsApprovalStatus ?? proposal.ethicsApprovalStatus,
      dataManagementPlan: updateParams.dataManagementPlan ?? proposal.dataManagementPlan,
      publicEngagementPlan: updateParams.publicEngagementPlan ?? proposal.publicEngagementPlan,
      relatedStudies: updateParams.relatedStudies ?? proposal.relatedStudies,
      relatedCohorts: updateParams.relatedCohorts ?? proposal.relatedCohorts,
      isTemplate: updateParams.isTemplate ?? proposal.isTemplate,
      templateName: updateParams.isTemplate ? 
        (updateParams.templateName ?? proposal.templateName) : undefined,
      customFields: updateParams.customFields 
        ? { ...proposal.customFields, ...updateParams.customFields }
        : proposal.customFields,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the status change if applicable
    if (updateParams.status && updateParams.status !== proposal.status) {
      this.logger.info('Proposal status changed', {
        proposalId,
        previousStatus: proposal.status,
        newStatus: updateParams.status,
        id
      });

      // Emit status change event
      this.events.emit('proposal:statusChanged', {
        proposalId: proposal.id,
        previousStatus: proposal.status,
        newStatus: updateParams.status,
        id
      });
    }

    return updatedProposal;
  }

  /**
   * Search for proposals based on filters
   */
  async searchProposals(filters: ProposalSearchFilters): Promise<GrantProposal[]> {
    return this.dataAccessService.searchProposals(filters);
  }

  /**
   * Delete a proposal (only allowed for DRAFT status)
   */
  async deleteProposal(proposalId: string, id: string): Promise<void> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Only draft proposals can be deleted, or templates
    if (proposal.status !== ProposalStatus.DRAFT && !proposal.isTemplate) {
      throw new Error(`Cannot delete proposal with status ${proposal.status}`);
    }

    // Delete the proposal
    await this.dataAccessService.deleteProposal(proposalId);

    // Log the deletion
    this.logger.info('Proposal deleted', { proposalId, id });

    // Emit event
    this.events.emit('proposal:deleted', { proposalId, id });
  }

  /**
   * Archive a proposal
   */
  async archiveProposal(proposalId: string, id: string): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Update to archived status
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: ProposalStatus.ARCHIVED,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the archived proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the archival
    this.logger.info('Proposal archived', { proposalId, id });

    // Emit event
    this.events.emit('proposal:archived', { proposalId, id });

    return updatedProposal;
  }

  /**
   * Submit a proposal for internal review
   */
  async submitForInternalReview(
    proposalId: string,
    id: string,
    comments?: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if proposal can be submitted for review
    if (proposal.status !== ProposalStatus.DRAFT && 
        proposal.status !== ProposalStatus.REVISIONS_NEEDED) {
      throw new Error(`Cannot submit proposal with status ${proposal.status} for review`);
    }

    // Validate proposal completeness
    const validationResult = await this.validateProposalCompleteness(proposal);
    if (!validationResult.isComplete) {
      throw new Error(`Proposal is incomplete: ${validationResult.missingFields.join(', ')}`);
    }

    // Update status to internal review
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: ProposalStatus.INTERNAL_REVIEW,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the submission for review
    this.logger.info('Proposal submitted for internal review', { proposalId, id });

    // Emit event
    this.events.emit('proposal:submittedForReview', { 
      proposalId, 
      id,
      comments 
    });

    return updatedProposal;
  }

  /**
   * Approve a proposal for submission to funder
   */
  async approveForSubmission(
    proposalId: string,
    id: string,
    comments?: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if proposal can be approved
    if (proposal.status !== ProposalStatus.INTERNAL_REVIEW) {
      throw new Error(`Cannot approve proposal with status ${proposal.status}`);
    }

    // Update status to approved for submission
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: ProposalStatus.APPROVED_FOR_SUBMISSION,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the approval
    this.logger.info('Proposal approved for submission', { proposalId, id });

    // Emit event
    this.events.emit('proposal:approvedForSubmission', { 
      proposalId, 
      id,
      comments 
    });

    return updatedProposal;
  }

  /**
   * Request revisions for a proposal
   */
  async requestRevisions(
    proposalId: string,
    revisionRequest: Omit<RevisionRequest, 'id' | 'requestedDate' | 'status'>,
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if revisions can be requested
    if (proposal.status !== ProposalStatus.INTERNAL_REVIEW && 
        proposal.status !== ProposalStatus.UNDER_FUNDER_REVIEW) {
      throw new Error(`Cannot request revisions for proposal with status ${proposal.status}`);
    }

    // Create revision request
    const newRevisionRequest: RevisionRequest = {
      id: uuidv4(),
      requestedBy: id,
      requestedDate: new Date(),
      dueDate: revisionRequest.dueDate,
      sections: revisionRequest.sections,
      comments: revisionRequest.comments,
      status: 'open'
    };

    // Update proposal status and add revision request
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: proposal.status === ProposalStatus.INTERNAL_REVIEW 
        ? ProposalStatus.REVISIONS_NEEDED 
        : ProposalStatus.FUNDER_REVISIONS_REQUESTED,
      revisionRequests: [...proposal.revisionRequests, newRevisionRequest],
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the revision request
    this.logger.info('Revisions requested for proposal', { 
      proposalId, 
      revisionRequestId: newRevisionRequest.id,
      id 
    });

    // Emit event
    this.events.emit('proposal:revisionsRequested', { 
      proposalId, 
      revisionRequestId: newRevisionRequest.id,
      id 
    });

    return updatedProposal;
  }

  /**
   * Respond to a revision request
   */
  async respondToRevisionRequest(
    proposalId: string,
    revisionRequestId: string,
    responseComments: string,
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Find the revision request
    const revisionRequestIndex = proposal.revisionRequests.findIndex((r: RevisionRequest) => r.id === revisionRequestId);
    if (revisionRequestIndex === -1) {
      throw new Error(`Revision request with ID ${revisionRequestId} not found`);
    }

    // Update the revision request
    const updatedRevisionRequests = [...proposal.revisionRequests];
    updatedRevisionRequests[revisionRequestIndex] = {
      ...updatedRevisionRequests[revisionRequestIndex],
      status: 'addressed',
      responseComments,
      responseDate: new Date()
    };

    // Update the proposal
    const updatedProposal: GrantProposal = {
      ...proposal,
      revisionRequests: updatedRevisionRequests,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the revision response
    this.logger.info('Responded to revision request', { 
      proposalId, 
      revisionRequestId,
      id 
    });

    // Emit event
    this.events.emit('proposal:revisionResponseSubmitted', { 
      proposalId, 
      revisionRequestId,
      id 
    });

    return updatedProposal;
  }

  /**
   * Mark a proposal as submitted to funder
   */
  async markAsSubmitted(
    proposalId: string,
    submissionDetails: {
      referenceNumber?: string;
      portalConfirmation?: string;
    },
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if proposal can be marked as submitted
    if (proposal.status !== ProposalStatus.APPROVED_FOR_SUBMISSION &&
        proposal.status !== ProposalStatus.FUNDER_REVISIONS_REQUESTED) {
      throw new Error(`Cannot mark proposal with status ${proposal.status} as submitted`);
    }

    // Update proposal status and add submission details
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: ProposalStatus.SUBMITTED,
      submissionDetails: {
        submittedBy: id,
        submittedDate: new Date(),
        referenceNumber: submissionDetails.referenceNumber,
        portalConfirmation: submissionDetails.portalConfirmation
      },
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the submission
    this.logger.info('Proposal marked as submitted to funder', { 
      proposalId, 
      referenceNumber: submissionDetails.referenceNumber,
      id 
    });

    // Emit event
    this.events.emit('proposal:submitted', { 
      proposalId, 
      referenceNumber: submissionDetails.referenceNumber,
      id 
    });

    return updatedProposal;
  }

  /**
   * Mark a proposal as under funder review
   */
  async markAsUnderFunderReview(
    proposalId: string,
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if proposal can be marked as under funder review
    if (proposal.status !== ProposalStatus.SUBMITTED) {
      throw new Error(`Cannot mark proposal with status ${proposal.status} as under funder review`);
    }

    // Update proposal status
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: ProposalStatus.UNDER_FUNDER_REVIEW,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the status update
    this.logger.info('Proposal marked as under funder review', { proposalId, id });

    // Emit event
    this.events.emit('proposal:underFunderReview', { proposalId, id });

    return updatedProposal;
  }

  /**
   * Mark a proposal as awarded
   */
  async markAsAwarded(
    proposalId: string,
    awardDetails: {
      awardedAmount: number;
      startDate: Date;
      endDate: Date;
      referenceNumber: string;
      contractUrl?: string;
    },
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if proposal can be marked as awarded
    if (proposal.status !== ProposalStatus.UNDER_FUNDER_REVIEW) {
      throw new Error(`Cannot mark proposal with status ${proposal.status} as awarded`);
    }

    // Update proposal status and add award details
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: ProposalStatus.AWARDED,
      awardDetails: {
        ...awardDetails,
        awardedDate: new Date()
      },
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the award
    this.logger.info('Proposal marked as awarded', { 
      proposalId, 
      awardedAmount: awardDetails.awardedAmount,
      referenceNumber: awardDetails.referenceNumber,
      id 
    });

    // Emit event
    this.events.emit('proposal:awarded', { 
      proposalId, 
      awardedAmount: awardDetails.awardedAmount,
      referenceNumber: awardDetails.referenceNumber,
      id 
    });

    return updatedProposal;
  }

  /**
   * Mark a proposal as rejected
   */
  async markAsRejected(
    proposalId: string,
    funderFeedback: string,
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if proposal can be marked as rejected
    if (proposal.status !== ProposalStatus.UNDER_FUNDER_REVIEW) {
      throw new Error(`Cannot mark proposal with status ${proposal.status} as rejected`);
    }

    // Update proposal status and add feedback
    const updatedProposal: GrantProposal = {
      ...proposal,
      status: ProposalStatus.REJECTED,
      submissionDetails: {
        ...proposal.submissionDetails!,
        funderFeedback
      },
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the rejection
    this.logger.info('Proposal marked as rejected', { proposalId, id });

    // Emit event
    this.events.emit('proposal:rejected', { proposalId, id });

    return updatedProposal;
  }

  /**
   * Add an attachment to a proposal
   */
  async addAttachment(
    proposalId: string,
    attachment: Omit<Attachment, 'id' | 'uploadDate' | 'uploadedBy' | 'version'>,
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Only allow attachments to be added to editable proposals
    if ([
      ProposalStatus.SUBMITTED,
      ProposalStatus.UNDER_FUNDER_REVIEW,
      ProposalStatus.AWARDED,
      ProposalStatus.REJECTED,
      ProposalStatus.ARCHIVED
    ].includes(proposal.status) && !proposal.isTemplate) {
      throw new Error(`Cannot add attachments to proposal with status ${proposal.status}`);
    }

    // Create new attachment
    const newAttachment: Attachment = {
      id: uuidv4(),
      type: attachment.type,
      filename: attachment.filename,
      uploadDate: new Date(),
      uploadedBy: id,
      fileUrl: attachment.fileUrl,
      description: attachment.description,
      version: 1
    };

    // Update proposal with new attachment
    const updatedProposal: GrantProposal = {
      ...proposal,
      attachments: [...proposal.attachments, newAttachment],
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the attachment addition
    this.logger.info('Attachment added to proposal', { 
      proposalId, 
      attachmentId: newAttachment.id,
      attachmentType: newAttachment.type,
      id 
    });

    // Emit event
    this.events.emit('proposal:attachmentAdded', { 
      proposalId, 
      attachmentId: newAttachment.id,
      id 
    });

    return updatedProposal;
  }

  /**
   * Remove an attachment from a proposal
   */
  async removeAttachment(
    proposalId: string,
    attachmentId: string,
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Find the attachment
    const attachmentIndex = proposal.attachments.findIndex((a: Attachment) => a.id === attachmentId);
    if (attachmentIndex === -1) {
      throw new Error(`Attachment with ID ${attachmentId} not found`);
    }

    // Only allow attachments to be removed from editable proposals
    if ([
      ProposalStatus.SUBMITTED,
      ProposalStatus.UNDER_FUNDER_REVIEW,
      ProposalStatus.AWARDED,
      ProposalStatus.REJECTED,
      ProposalStatus.ARCHIVED
    ].includes(proposal.status) && !proposal.isTemplate) {
      throw new Error(`Cannot remove attachments from proposal with status ${proposal.status}`);
    }

    // Update proposal with attachment removed
    const updatedAttachments = [...proposal.attachments];
    updatedAttachments.splice(attachmentIndex, 1);

    const updatedProposal: GrantProposal = {
      ...proposal,
      attachments: updatedAttachments,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the attachment removal
    this.logger.info('Attachment removed from proposal', { 
      proposalId, 
      attachmentId,
      id 
    });

    // Emit event
    this.events.emit('proposal:attachmentRemoved', { 
      proposalId, 
      attachmentId,
      id 
    });

    return updatedProposal;
  }

  /**
   * Add or update a review for a proposal
   */
  async addOrUpdateReview(
    proposalId: string,
    review: Omit<ProposalReview, 'id' | 'date'> | (Omit<ProposalReview, 'date'> & { id: string }),
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Check if this is an update or a new review
    let updatedReviews: ProposalReview[];
    if ('id' in review) {
      // This is an update
      const reviewIndex = proposal.reviews.findIndex((r: ProposalReview) => r.id === review.id);
      if (reviewIndex === -1) {
        throw new Error(`Review with ID ${review.id} not found`);
      }

      updatedReviews = [...proposal.reviews];
      updatedReviews[reviewIndex] = {
        ...review,
        date: new Date()
      };
    } else {
      // This is a new review
      updatedReviews = [
        ...proposal.reviews,
        {
          id: uuidv4(),
          ...review,
          date: new Date()
        }
      ];
    }

    // Update proposal with new/updated review
    const updatedProposal: GrantProposal = {
      ...proposal,
      reviews: updatedReviews,
      lastUpdated: new Date(),
      updatedBy: id,
      version: proposal.version + 1
    };

    // Persist the updated proposal
    await this.dataAccessService.saveProposal(updatedProposal);

    // Log the review
    this.logger.info('Review added/updated for proposal', { 
      proposalId, 
      reviewId: 'id' in review ? review.id : updatedReviews[updatedReviews.length - 1].id,
      id 
    });

    // Emit event
    this.events.emit('proposal:reviewAdded', { 
      proposalId, 
      reviewId: 'id' in review ? review.id : updatedReviews[updatedReviews.length - 1].id,
      id 
    });

    return updatedProposal;
  }

  /**
   * Generate a proposal export
   */
  async exportProposal(
    proposalId: string, 
    format: 'pdf' | 'docx' | 'json' = 'pdf'
  ): Promise<string> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // This would call an export service to generate the appropriate format
    // For now, we'll return a placeholder URL
    this.logger.info(`Exporting proposal as ${format}`, { proposalId });

    return `https://edpsych-research.example.com/exports/proposals/${proposalId}/export.${format}`;
  }

  /**
   * Clone a proposal
   */
  async cloneProposal(
    proposalId: string,
    options: {
      newTitle?: string;
      makeTemplate?: boolean;
      templateName?: string;
    },
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Create a new proposal based on the existing one
    const now = new Date();
    const clonedProposal: GrantProposal = {
      ...proposal,
      id: uuidv4(),
      title: options.newTitle || `Copy of ${proposal.title}`,
      status: ProposalStatus.DRAFT,
      createdBy: id,
      createdDate: now,
      lastUpdated: now,
      updatedBy: id,
      submissionDetails: undefined,
      awardDetails: undefined,
      isTemplate: options.makeTemplate || false,
      templateName: options.makeTemplate ? options.templateName : undefined,
      version: 1
    };

    // Persist the cloned proposal
    await this.dataAccessService.saveProposal(clonedProposal);

    // Log the cloning
    this.logger.info('Proposal cloned', { 
      originalProposalId: proposalId, 
      newProposalId: clonedProposal.id,
      id 
    });

    // Emit event
    this.events.emit('proposal:cloned', { 
      originalProposalId: proposalId, 
      newProposalId: clonedProposal.id,
      id 
    });

    return clonedProposal;
  }

  /**
   * Create a proposal template
   */
  async createTemplate(
    proposalId: string,
    templateName: string,
    id: string
  ): Promise<GrantProposal> {
    const proposal = await this.dataAccessService.getProposal(proposalId);
    if (!proposal) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    // Clone the proposal and make it a template
    return this.cloneProposal(
      proposalId,
      {
        newTitle: `Template: ${proposal.title}`,
        makeTemplate: true,
        templateName
      },
      id
    );
  }

  /**
   * Get all proposal templates
   */
  async getTemplates(): Promise<GrantProposal[]> {
    return this.dataAccessService.searchProposals({ isTemplate: true });
  }

  /**
   * Find funding opportunities matching criteria
   */
  async findFundingOpportunities(
    criteria: {
      keywords?: string[];
      minAmount?: number;
      maxAmount?: number;
      funderTypes?: FunderType[];
      deadlineAfter?: Date;
      deadlineBefore?: Date;
      duration?: number;
    }
  ): Promise<FundingScheme[]> {
    // This would search external and internal funding opportunity databases
    // For now, we'll return a placeholder implementation
    return this.dataAccessService.searchFundingSchemes({
      keywords: criteria.keywords,
      minAmount: criteria.minAmount,
      maxAmount: criteria.maxAmount,
      funderTypes: criteria.funderTypes,
      deadlineAfter: criteria.deadlineAfter,
      deadlineBefore: criteria.deadlineBefore,
      duration: criteria.duration
    });
  }

  /**
   * Validate proposal completeness
   */
  private async validateProposalCompleteness(
    proposal: GrantProposal
  ): Promise<{ isComplete: boolean; missingFields: string[] }> {
    const missingFields: string[] = [];

    // Check for required fields
    if (!proposal.title || proposal.title.trim() === '') {
      missingFields.push('title');
    }

    if (!proposal.summary || proposal.summary.trim() === '') {
      missingFields.push('summary');
    }

    if (proposal.investigators.length === 0) {
      missingFields.push('investigators');
    } else {
      const principalInvestigator = proposal.investigators.find(i => 
        i.role === InvestigatorRole.PRINCIPAL);
      
      if (!principalInvestigator) {
        missingFields.push('principal investigator');
      }
    }

    if (!proposal.projectPlan.summary || proposal.projectPlan.summary.trim() === '') {
      missingFields.push('project plan summary');
    }

    if (!proposal.projectPlan.aims || proposal.projectPlan.aims.length === 0) {
      missingFields.push('project aims');
    }

    if (!proposal.projectPlan.objectives || proposal.projectPlan.objectives.length === 0) {
      missingFields.push('project objectives');
    }

    if (!proposal.projectPlan.methodology || proposal.projectPlan.methodology.trim() === '') {
      missingFields.push('methodology');
    }

    if (proposal.budget.length === 0) {
      missingFields.push('budget');
    }

    // Check for funder-specific requirements
    const fundingScheme = proposal.fundingScheme;
    
    // Check if data management plan is required
    if (fundingScheme.eligibilityCriteria.some(c => 
        c.toLowerCase().includes('data management plan') ||
        c.toLowerCase().includes('dmp')) &&
        (!proposal.dataManagementPlan || proposal.dataManagementPlan.trim() === '')) {
      missingFields.push('data management plan');
    }

    // Check if impact statement is required
    if (fundingScheme.eligibilityCriteria.some(c => 
        c.toLowerCase().includes('impact') ||
        c.toLowerCase().includes('pathways to impact')) &&
        (!proposal.impactStatement || proposal.impactStatement.trim() === '')) {
      missingFields.push('impact statement');
    }

    // Check if ethics statement is required
    if (proposal.ethicsApprovalRequired &&
        (!proposal.ethicsStatement || proposal.ethicsStatement.trim() === '')) {
      missingFields.push('ethics statement');
    }

    // Check for required attachments based on funding scheme
    const requiredAttachmentTypes: AttachmentType[] = [];
    
    // Case for support is almost always required
    requiredAttachmentTypes.push(AttachmentType.CASE_FOR_SUPPORT);
    
    // Check if CVs are required
    if (fundingScheme.eligibilityCriteria.some(c => 
        c.toLowerCase().includes('cv') ||
        c.toLowerCase().includes('curriculum vitae'))) {
      requiredAttachmentTypes.push(AttachmentType.CV);
    }
    
    // Check for other required attachments
    if (proposal.ethicsApprovalRequired) {
      requiredAttachmentTypes.push(AttachmentType.ETHICS_APPROVAL);
    }
    
    // Verify all required attachments are present
    for (const requiredType of requiredAttachmentTypes) {
      if (!proposal.attachments.some(a => a.type === requiredType)) {
        missingFields.push(`attachment: ${requiredType}`);
      }
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Subscribe to proposal events
   */
  onProposalEvent(
    eventType: string,
    handler: (_eventData: any) => void
  ): void {
    this.events.on(eventType, handler);
  }

  /**
   * Unsubscribe from proposal events
   */
  offProposalEvent(
    eventType: string,
    handler: (_eventData: any) => void
  ): void {
    this.events.off(eventType, handler);
  }
}