/**
 * @fileoverview Ethics Assessment Service
 * 
 * Service responsible for managing ethics assessments, including creation,
 * updates, reviews, approvals, and generating assessment documentation.
 */

const EthicsAssessment = require('../models/EthicsAssessment');

class EthicsAssessmentService {
  constructor({
    dataAccessService = null,
    notificationService = null,
    documentationService = null,
    userService = null,
    monitoringService = null,
    logger = console
  }) {
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
  async getAssessment(assessmentId) {
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
  async getAssessments(filters = {}, pagination = {}, sort = {}) {
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
  async createAssessment(assessment) {
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
  async updateAssessment(assessment) {
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
  async submitForReview(assessmentId, assessorId, reviewerIds = []) {
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
  async approveAssessment(assessmentId, reviewerId, outcome = 'approved', conditions = []) {
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
      assessment.approve(reviewerId, outcome);
      
      // Add conditions if provided and outcome is 'approved_with_conditions'
      if (outcome === 'approved_with_conditions' && conditions.length > 0) {
        for (const condition of conditions) {
          assessment.addCondition(condition.description, condition.status || 'pending');
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
  async requestRevisions(assessmentId, reviewerId, feedback) {
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
      assessment.requestRevisions(reviewerId, feedback);
      
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
   * Create a new version of an assessment
   * @param {string} assessmentId - ID of the assessment
   * @returns {Promise<EthicsAssessment>} The new version of the assessment
   */
  async createNewVersion(assessmentId) {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Create a new version
      const newVersion = assessment.createNewVersion();
      
      // Save the new version
      const createdVersion = await this.dataAccessService.createAssessment(newVersion);
      
      this.logger.info(`Created new version ${createdVersion.version} of ethics assessment ${assessmentId}`);
      
      // Add reference to previous version in metadata
      createdVersion.metadata.previousVersionId = assessmentId;
      await this.dataAccessService.updateAssessment(createdVersion);
      
      // Notify participants
      await this.notifyAssessmentParticipants(createdVersion, 'new_version_created', {
        previousVersionId: assessmentId,
        previousVersion: assessment.version
      });
      
      return createdVersion;
    } catch (error) {
      this.logger.error(`Failed to create new version of ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Add a question and answer to an assessment
   * @param {string} assessmentId - ID of the assessment
   * @param {string} question - The question to add
   * @param {string} answer - The answer to the question
   * @param {string} category - Category of the question
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async addQuestion(assessmentId, question, answer, category = 'general') {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Verify the assessment is in draft or needs_revision status
      if (!assessment.isDraft() && !assessment.needsRevision()) {
        throw new Error(`Assessment ${assessmentId} is not in draft or needs_revision status and cannot be modified`);
      }
      
      // Add the question
      assessment.addQuestion(question, answer, category);
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Added question to ethics assessment ${assessmentId}`);
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to add question to ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Add an ethical risk to an assessment
   * @param {string} assessmentId - ID of the assessment
   * @param {string} description - Description of the ethical risk
   * @param {string} severity - Severity of the risk
   * @param {string} category - Category of the risk
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async addEthicalRisk(assessmentId, description, severity = 'medium', category = 'general') {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Verify the assessment is in draft or needs_revision status
      if (!assessment.isDraft() && !assessment.needsRevision()) {
        throw new Error(`Assessment ${assessmentId} is not in draft or needs_revision status and cannot be modified`);
      }
      
      // Add the ethical risk
      assessment.addEthicalRisk(description, severity, category);
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Added ethical risk to ethics assessment ${assessmentId}`);
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to add ethical risk to ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Add a mitigation strategy to an assessment
   * @param {string} assessmentId - ID of the assessment
   * @param {number} riskIndex - Index of the ethical risk
   * @param {string} description - Description of the mitigation strategy
   * @param {string} status - Status of the mitigation
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async addMitigation(assessmentId, riskIndex, description, status = 'planned') {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Verify the assessment is in draft or needs_revision status
      if (!assessment.isDraft() && !assessment.needsRevision()) {
        throw new Error(`Assessment ${assessmentId} is not in draft or needs_revision status and cannot be modified`);
      }
      
      // Add the mitigation
      const mitigationIndex = assessment.addMitigation(riskIndex, description, status);
      if (mitigationIndex === -1) {
        throw new Error(`Invalid risk index: ${riskIndex}`);
      }
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Added mitigation to ethics assessment ${assessmentId}`);
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to add mitigation to ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Update the status of a mitigation
   * @param {string} assessmentId - ID of the assessment
   * @param {number} mitigationIndex - Index of the mitigation
   * @param {string} status - New status of the mitigation
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async updateMitigationStatus(assessmentId, mitigationIndex, status) {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Update the mitigation status
      const success = assessment.updateMitigationStatus(mitigationIndex, status);
      if (!success) {
        throw new Error(`Invalid mitigation index: ${mitigationIndex}`);
      }
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Updated mitigation status in ethics assessment ${assessmentId}`);
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to update mitigation status in ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Add a recommended monitor to an assessment
   * @param {string} assessmentId - ID of the assessment
   * @param {string} monitorType - Type of monitor to implement
   * @param {string} description - Description of what the monitor should track
   * @param {Object} configuration - Suggested configuration for the monitor
   * @returns {Promise<EthicsAssessment>} The updated assessment
   */
  async addRecommendedMonitor(assessmentId, monitorType, description, configuration = {}) {
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Verify the assessment is in draft or needs_revision status
      if (!assessment.isDraft() && !assessment.needsRevision()) {
        throw new Error(`Assessment ${assessmentId} is not in draft or needs_revision status and cannot be modified`);
      }
      
      // Add the recommended monitor
      assessment.addRecommendedMonitor(monitorType, description, configuration);
      
      // Save the updated assessment
      const updatedAssessment = await this.dataAccessService.updateAssessment(assessment);
      
      this.logger.info(`Added recommended monitor to ethics assessment ${assessmentId}`);
      return updatedAssessment;
    } catch (error) {
      this.logger.error(`Failed to add recommended monitor to ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Create monitors recommended by an assessment
   * @param {EthicsAssessment} assessment - The assessment containing recommended monitors
   * @returns {Promise<Array>} Array of created monitors
   * @private
   */
  async createRecommendedMonitors(assessment) {
    if (!this.monitoringService) {
      this.logger.warn('Monitoring service not available, skipping creation of recommended monitors');
      return [];
    }
    
    try {
      const createdMonitors = [];
      
      for (const recommendedMonitor of assessment.recommendedMonitors) {
        // Create a monitor based on the recommendation
        const monitor = {
          name: `${assessment.title} - ${recommendedMonitor.monitorType}`,
          description: recommendedMonitor.description,
          metrics: [],
          thresholds: {},
          enabled: true,
          tags: [...(assessment.tags || []), 'assessment_recommended'],
          metadata: {
            assessmentId: assessment.id,
            componentId: assessment.componentId,
            componentType: assessment.componentType,
            recommendedConfiguration: recommendedMonitor.configuration
          }
        };
        
        // Add metrics and thresholds based on configuration
        if (recommendedMonitor.configuration.metrics) {
          for (const metric of recommendedMonitor.configuration.metrics) {
            monitor.metrics.push(metric);
            
            if (metric.threshold) {
              monitor.thresholds[metric.id] = metric.threshold;
            }
          }
        }
        
        // Create the monitor
        const createdMonitor = await this.monitoringService.addMonitor(monitor);
        createdMonitors.push(createdMonitor);
        
        this.logger.info(`Created recommended monitor ${createdMonitor.id} from assessment ${assessment.id}`);
      }
      
      return createdMonitors;
    } catch (error) {
      this.logger.error(`Failed to create recommended monitors for assessment ${assessment.id}`, error);
      // Don't throw here to avoid disrupting the main flow
      return [];
    }
  }

  /**
   * Generate an ethics assessment report
   * @param {string} assessmentId - ID of the assessment
   * @param {string} format - Format of the report (pdf, html, json)
   * @returns {Promise<string>} URL or ID of the generated report
   */
  async generateAssessmentReport(assessmentId, format = 'pdf') {
    if (!this.documentationService) {
      throw new Error('Documentation service not available');
    }
    
    try {
      // Get the assessment
      const assessment = await this.dataAccessService.getAssessmentById(assessmentId);
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }
      
      // Generate the report
      const reportId = await this.documentationService.generateAssessmentReport(assessment, format);
      
      this.logger.info(`Generated ${format} report ${reportId} for ethics assessment ${assessmentId}`);
      return reportId;
    } catch (error) {
      this.logger.error(`Failed to generate report for ethics assessment ${assessmentId}`, error);
      throw error;
    }
  }

  /**
   * Notify participants of an assessment event
   * @param {EthicsAssessment} assessment - The assessment
   * @param {string} eventType - Type of event
   * @param {Object} eventData - Additional data for the event
   * @returns {Promise<void>}
   * @private
   */
  async notifyAssessmentParticipants(assessment, eventType, eventData = {}) {
    if (!this.notificationService) {
      this.logger.warn('Notification service not available, skipping assessment notifications');
      return;
    }
    
    try {
      // Determine recipients based on event type and assessment data
      const recipients = await this.determineNotificationRecipients(assessment, eventType);
      
      // For each recipient, send a notification
      for (const recipient of recipients) {
        const message = this.formatNotificationMessage(assessment, eventType, eventData);
        
        await this.notificationService.sendNotification({
          channel: recipient.channel || 'email',
          recipient: recipient.id,
          subject: `Ethics Assessment ${this.getNotificationSubject(eventType)}: ${assessment.title}`,
          message,
          data: {
            assessmentId: assessment.id,
            eventType,
            ...eventData
          }
        });
      }
      
      this.logger.info(`Sent ${eventType} notifications for assessment ${assessment.id}`);
    } catch (error) {
      this.logger.error(`Failed to send notifications for assessment ${assessment.id}`, error);
      // Don't throw here to avoid disrupting the main flow
    }
  }

  /**
   * Determine notification recipients based on assessment and event type
   * @param {EthicsAssessment} assessment - The assessment
   * @param {string} eventType - Type of event
   * @returns {Promise<Array>} Array of recipients
   * @private
   */
  async determineNotificationRecipients(assessment, eventType) {
    // This would typically involve querying user preferences and roles
    // For simplicity, we'll return a basic set of recipients
    
    const recipients = [];
    
    // Always notify the assessor if there is one
    if (assessment.assessorId) {
      recipients.push({ id: assessment.assessorId, channel: 'email' });
    }
    
    // For certain events, notify reviewers
    if (['created', 'submitted_for_review', 'new_version_created'].includes(eventType)) {
      for (const reviewerId of assessment.reviewers) {
        recipients.push({ id: reviewerId, channel: 'email' });
      }
    }
    
    // For approval or revision events, notify the assessor
    if (['approved', 'revisions_requested'].includes(eventType) && assessment.assessorId) {
      recipients.push({ id: assessment.assessorId, channel: 'email' });
    }
    
    return recipients;
  }

  /**
   * Format notification message based on assessment and event type
   * @param {EthicsAssessment} assessment - The assessment
   * @param {string} eventType - Type of event
   * @param {Object} eventData - Additional data for the event
   * @returns {string} Formatted message
   * @private
   */
  formatNotificationMessage(assessment, eventType, eventData) {
    const baseInfo = `
Assessment ID: ${assessment.id}
Title: ${assessment.title}
Component: ${assessment.componentId} (${assessment.componentType})
Version: ${assessment.version}
Status: ${assessment.status}
`;
    
    switch (eventType) {
      case 'created':
        return `A new ethics assessment has been created:
${baseInfo}
Please review and contribute to this assessment as needed.`;
        
      case 'submitted_for_review':
        return `An ethics assessment has been submitted for review:
${baseInfo}
Please review this assessment at your earliest convenience.`;
        
      case 'approved':
        return `An ethics assessment has been approved:
${baseInfo}
Outcome: ${eventData.outcome}
${eventData.conditionsCount > 0 ? `With ${eventData.conditionsCount} conditions` : 'Without conditions'}

${eventData.outcome === 'approved' ? 'No further action is required.' : 'Please implement the conditions for approval.'}`;
        
      case 'revisions_requested':
        return `Revisions have been requested for an ethics assessment:
${baseInfo}
Feedback: ${eventData.feedback}

Please make the requested revisions and resubmit the assessment.`;
        
      case 'new_version_created':
        return `A new version of an ethics assessment has been created:
${baseInfo}
Previous Version: ${eventData.previousVersion}
Previous Version ID: ${eventData.previousVersionId}

Please review and update this new version as needed.`;
        
      case 'status_changed':
        return `An ethics assessment status has changed:
${baseInfo}
Previous status: ${eventData.previousStatus}
New status: ${assessment.status}

Please review this update.`;
        
      default:
        return `Ethics assessment update:
${baseInfo}
Event: ${eventType}

Please review this update.`;
    }
  }

  /**
   * Get notification subject based on event type
   * @param {string} eventType - Type of event
   * @returns {string} Subject text
   * @private
   */
  getNotificationSubject(eventType) {
    switch (eventType) {
      case 'created':
        return 'New Assessment';
      case 'submitted_for_review':
        return 'Submitted for Review';
      case 'approved':
        return 'Approved';
      case 'revisions_requested':
        return 'Revisions Requested';
      case 'new_version_created':
        return 'New Version Created';
      case 'status_changed':
        return 'Status Changed';
      default:
        return 'Update';
    }
  }
}

module.exports = EthicsAssessmentService;