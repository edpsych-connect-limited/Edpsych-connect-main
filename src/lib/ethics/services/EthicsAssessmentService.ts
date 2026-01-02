/**
 * @fileoverview Ethics Assessment Service
 * 
 * Service responsible for managing ethics assessments, including creation,
 * updates, reviews, approvals, and generating assessment documentation.
 */

import { EthicsAssessment, EthicsAssessmentOptions } from '../models/EthicsAssessment';

export interface EthicsAssessmentServiceOptions {
  dataAccessService?: any;
  notificationService?: any;
  documentationService?: any;
  userService?: any;
  monitoringService?: any;
  logger?: any;
}

export class EthicsAssessmentService {
  dataAccessService: any;
  notificationService: any;
  documentationService: any;
  userService: any;
  monitoringService: any;
  logger: any;

  constructor({
    dataAccessService = null,
    notificationService = null,
    documentationService = null,
    userService = null,
    monitoringService = null,
    logger = console
  }: EthicsAssessmentServiceOptions = {}) {
    this.dataAccessService = dataAccessService;
    this.notificationService = notificationService;
    this.documentationService = documentationService;
    this.userService = userService;
    this.monitoringService = monitoringService;
    this.logger = logger;
  }

  /**
   * Get an assessment by ID
   * @param {string} assessmentId - ID of the assessment
   * @returns {Promise<EthicsAssessment>} The assessment
   */
  async getAssessment(assessmentId: string): Promise<EthicsAssessment | null> {
    try {
      return await this.dataAccessService.getAssessmentById(assessmentId);
    } catch (error) {
      this.logger.error(`Failed to get assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Get assessments with optional filtering
   * @param {Object} filters - Filters to apply
   * @param {Object} pagination - Pagination options
   * @param {Object} sort - Sort options
   * @returns {Promise<Array<EthicsAssessment>>} Array of assessments
   */
  async getAssessments(filters: any = {}, pagination: any = {}, sort: any = {}): Promise<EthicsAssessment[]> {
    try {
      return await this.dataAccessService.getAssessments(filters, pagination, sort);
    } catch (error) {
      this.logger.error('Failed to get assessments', error);
      throw error;
    }
  }

  /**
   * Create a new ethics assessment
   * @param {EthicsAssessment} assessment - The assessment to create
   * @returns {Promise<EthicsAssessment>} The created assessment
   */
  async createAssessment(assessment: EthicsAssessment): Promise<EthicsAssessment> {
    try {
      // Ensure the assessment has creation dates
      if (!assessment.createdAt) {
        assessment.createdAt = new Date();
      }
      
      if (!assessment.updatedAt) {
        assessment.updatedAt = new Date();
      }
      
      // Set initial status if not specified
      if (!assessment.status) {
        assessment.status = 'draft';
      }
      
      // Save the assessment
      const createdAssessment = await this.dataAccessService.createAssessment(assessment);
      
      this.logger.info(`Created ethics assessment ${createdAssessment.id}`);
      
      // Notify assessor and reviewers
      await this.notifyAssessmentParticipants(createdAssessment, 'created');
      
      return createdAssessment;
    } catch (error) {
      this.logger.error('Failed to create ethics assessment', error);
      throw error;
    }
  }

  /**
   * Update an existing assessment
   * @param {EthicsAssessment} assessment - The updated assessment
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async updateAssessment(assessment: EthicsAssessment): Promise<EthicsAssessment> {
    try {
      // Get the existing assessment
      const existingAssessment = await this.dataAccessService.getAssessmentById(assessment.id);
      if (!existingAssessment) {
        throw new Error(`Assessment ${assessment.id} not found`);
      }
      
      // Update the timestamp
      assessment.updatedAt = new Date();
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Updated ethics assessment ${updatedAssessment.id}`);
      
      // Detect significant changes and send notifications
      if (existingAssessment.status !== updatedAssessment.status) {
        await this.notifyAssessmentParticipants(updatedAssessment, 'status_changed', {
          previousStatus: existingAssessment.status
        });
      }
      
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to update ethics assessment ${assessment.id}`, error);
      throw error;
    }
  }

  /**
   * Submit an assessment for review
   * @param {string} assessmentId - ID of the assessment
   * @param {string} assessorId - ID of the assessor submitting the assessment
   * @param {Array<string>} reviewerIds - IDs of the reviewers
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async submitForReview(assessmentId: string, assessorId: string, reviewerIds: string[] = []): Promise<EthicsAssessment> {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Verify the assessment is in draft status
      if (!assessment.isDraft()) {
        throw new Error(`Assessment ${assessmentId} is not in draft status and cannot be submitted for review`);
      }
      
      // Update the assessment
      assessment.status = 'in_review';
      assessment.updatedAt = new Date();
      
      // Set the assessor if not already set
      if (!assessment.assessorId) {
        assessment.assessorId = assessorId;
      }
      
      // Add reviewers without duplicates
      const currentReviewers = new Set(assessment.reviewers);
      reviewerIds.forEach(id => currentReviewers.add(id));
      assessment.reviewers = Array.from(currentReviewers);
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Submitted ethics assessment ${assessmentId} for review`);
      
      // Notify reviewers
      await this.notifyAssessmentParticipants(updatedAssessment, 'submitted_for_review');
      
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to submit ethics assessment ${assessmentId} for review`, error);
      throw error;
    }
  }

  /**
   * Approve an assessment
   * @param {string} assessmentId - ID of the assessment
   * @param {string} reviewerId - ID of the reviewer approving the assessment
   * @param {string} outcome - Outcome of the approval
   * @param {Array<Object>} conditions - Conditions for approval (if outcome is 'approved_with_conditions')
   * @returns {Promise<EthicsAssessment>} The approved assessment
   */
  async approveAssessment(assessmentId: string, reviewerId: string, outcome: 'approved' | 'approved_with_conditions' | 'not_approved' = 'approved', conditions: any[] = []): Promise<EthicsAssessment> {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Verify the assessment is in review status
      if (assessment.status !== 'in_review') {
        throw new Error(`Assessment ${assessmentId} is not in review status and cannot be approved`);
      }
      
      // Verify the reviewer is authorized
      if (!assessment.reviewers.includes(reviewerId)) {
        throw new Error(`User ${reviewerId} is not authorized to approve assessment ${assessmentId}`);
      }
      
      // Approve the assessment
      // Note: Assuming EthicsAssessment has approve method, if not we implement logic here
      // Since we defined the model earlier without methods, we'll implement logic here
      assessment.status = 'approved';
      assessment.approvedAt = new Date();
      assessment.outcome = outcome;
      
      // Add conditions if provided and outcome is 'approved_with_conditions'
      if (outcome === 'approved_with_conditions' && conditions.length > 0) {
        for (const condition of conditions) {
          // assessment.addCondition(condition.description, condition.status || 'pending');
          assessment.conditions.push(condition.description);
        }
      }
      
      // Save the updated assessment
      const approvedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Approved ethics assessment ${assessmentId} with outcome: ${outcome}`);
      
      // Notify participants
      await this.notifyAssessmentParticipants(approvedAssessment, 'approved', {
        reviewerId,
        outcome,
        conditionsCount: conditions.length
      });
      
      // If any recommended monitors were specified, create them
      if (this.monitoringService && approvedAssessment.recommendedMonitors.length > 0) {
        await this.createRecommendedMonitors(approvedAssessment);
      }
      
      // Generate approval documentation if documentation service is available
      if (this.documentationService) {
        try {
          const documentationId = await this.documentationService.generateAssessmentApprovalReport(assessmentId);
          
          this.logger.info(`Generated approval documentation ${documentationId} for assessment ${assessmentId}`);
          
          // Add documentation reference to the assessment
          approvedAssessment.metadata.approvalDocumentationId = documentationId;
          await this.dataAccessService.updateAssessment(approvedAssessment);
        } catch (docError) {
          this.logger.error(`Failed to generate approval documentation for assessment ${assessmentId}`, docError);
          // Don't throw here, as the assessment is already approved
        }
      }
      
      return approvedAssessment;
    } catch (error) {
      this.logger.error(`Failed to approve ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Request revisions to an assessment
   * @param {string} assessmentId - ID of the assessment
   * @param {string} reviewerId - ID of the reviewer requesting revisions
   * @param {string} feedback - Feedback for the revision request
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async requestRevisions(assessmentId: string, reviewerId: string, feedback: string): Promise<EthicsAssessment> {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Verify the assessment is in review status
      if (assessment.status !== 'in_review') {
        throw new Error(`Assessment ${assessmentId} is not in review status and cannot have revisions requested`);
      }
      
      // Verify the reviewer is authorized
      if (!assessment.reviewers.includes(reviewerId)) {
        throw new Error(`User ${reviewerId} is not authorized to request revisions for assessment ${assessmentId}`);
      }
      
      // Request revisions
      assessment.status = 'needs_revision';
      // assessment.requestRevisions(reviewerId, feedback);
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Requested revisions for ethics assessment ${assessmentId}`);
      
      // Notify participants
      await this.notifyAssessmentParticipants(updatedAssessment, 'revisions_requested', {
        reviewerId,
        feedback
      });
      
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to request revisions for ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Notify assessment participants of changes
   * @private
   */
  private async notifyAssessmentParticipants(assessment: EthicsAssessment, action: string, data: any = {}): Promise<void> {
    if (!this.notificationService) return;
    
    try {
      const recipients = new Set<string>();
      if (assessment.assessorId) recipients.add(assessment.assessorId);
      if (assessment.reviewers) assessment.reviewers.forEach(r => recipients.add(r));
      
      for (const recipient of Array.from(recipients)) {
        await this.notificationService.sendNotification({
          recipient,
          type: 'ethics_assessment_update',
          data: {
            assessmentId: assessment.id,
            action,
            ...data
          }
        });
      }
    } catch (error) {
      this.logger.error('Failed to notify assessment participants', error);
    }
  }

  /**
   * Create recommended monitors for an approved assessment
   * @private
   */
  private async createRecommendedMonitors(assessment: EthicsAssessment): Promise<void> {
    // Implementation would go here
    this.logger.info(`Creating recommended monitors for assessment ${assessment.id}`);
  }
}
