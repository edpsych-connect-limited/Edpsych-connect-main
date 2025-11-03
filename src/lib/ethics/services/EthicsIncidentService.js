/**
 * @fileoverview Ethics Incident Service
 * 
 * Service responsible for managing the lifecycle of ethics incidents,
 * from creation to resolution, including assignment, tracking, and reporting.
 */

const EthicsIncident = require('../models/EthicsIncident');

class EthicsIncidentService {
  constructor({
    dataAccessService = null,
    notificationService = null,
    documentationService = null,
    userService = null,
    logger = console
  }) {
    this.dataAccessService = dataAccessService;
    this.notificationService = notificationService;
    this.documentationService = documentationService;
    this.userService = userService;
    this.logger = logger;
  }

  /**
   * Get an incident by ID
   * @param {string} incidentId - ID of the incident
   * @returns {Promise<EthicsIncident>} The incident
   */
  async getIncident(incidentId) {
    try {
      return await this.dataAccessService.getIncidentById(incidentId);
    } catch (error) {
      this.logger.error(`Failed to get incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Get incidents with optional filtering
   * @param {Object} filters - Filters to apply (status, severity, date range, etc.)
   * @param {Object} pagination - Pagination options (page, limit)
   * @param {Object} sort - Sort options (field, direction)
   * @returns {Promise<Array>} Array of incidents
   */
  async getIncidents(filters = {}, pagination = {}, sort = {}) {
    try {
      return await this.dataAccessService.getIncidents(filters, pagination, sort);
    } catch (error) {
      this.logger.error('Failed to get incidents', error);
      throw error;
    }
  }

  /**
   * Create a new incident
   * @param {EthicsIncident} incident - The incident to create
   * @returns {Promise<EthicsIncident>} The created incident
   */
  async createIncident(incident) {
    try {
      // Ensure the incident has a detected date
      if (!incident.detectedAt) {
        incident.detectedAt = new Date();
      }
      
      // Save the incident
      const createdIncident = await this.dataAccessService.createIncident(incident);
      
      this.logger.info(`Created ethics incident ${createdIncident.id}`);
      
      // Send initial notifications
      await this.sendIncidentNotifications(createdIncident, 'created');
      
      return createdIncident;
    } catch (error) {
      this.logger.error('Failed to create ethics incident', error);
      throw error;
    }
  }

  /**
   * Update an incident
   * @param {EthicsIncident} incident - The updated incident
   * @returns {Promise<EthicsIncident>} The updated incident
   */
  async updateIncident(incident) {
    try {
      // Get the existing incident for comparison
      const existingIncident = await this.dataAccessService.getIncidentById(incident.id);
      if (!existingIncident) {
        throw new Error(`Incident ${incident.id} not found`);
      }
      
      // Save the updated incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Updated ethics incident ${updatedIncident.id}`);
      
      // Detect significant changes and send notifications
      if (existingIncident.status !== updatedIncident.status) {
        await this.sendIncidentNotifications(updatedIncident, 'status_changed', {
          previousStatus: existingIncident.status
        });
      }
      
      if (existingIncident.severity !== updatedIncident.severity) {
        await this.sendIncidentNotifications(updatedIncident, 'severity_changed', {
          previousSeverity: existingIncident.severity
        });
      }
      
      if (existingIncident.assignedTo !== updatedIncident.assignedTo) {
        await this.sendIncidentNotifications(updatedIncident, 'assigned', {
          previousAssignee: existingIncident.assignedTo
        });
      }
      
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to update ethics incident ${incident.id}`, error);
      throw error;
    }
  }

  /**
   * Assign an incident to a user
   * @param {string} incidentId - ID of the incident
   * @param {string} userId - ID of the user
   * @param {string} assignedByUserId - ID of the user making the assignment
   * @returns {Promise<EthicsIncident>} The updated incident
   */
  async assignIncident(incidentId, userId, assignedByUserId = null) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Verify the user exists if userService is available
      if (this.userService) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
          throw new Error(`User ${userId} not found`);
        }
      }
      
      // Update the assignment
      incident.assignedTo = userId;
      
      // Add assignment metadata
      if (!incident.metadata.assignments) {
        incident.metadata.assignments = [];
      }
      
      incident.metadata.assignments.push({
        userId,
        assignedAt: new Date(),
        assignedBy: assignedByUserId
      });
      
      // Save the updated incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Assigned ethics incident ${incidentId} to user ${userId}`);
      
      // Send assignment notifications
      await this.sendIncidentNotifications(updatedIncident, 'assigned', {
        assignedBy: assignedByUserId
      });
      
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to assign ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Add a resolution step to an incident
   * @param {string} incidentId - ID of the incident
   * @param {string} description - Description of the resolution step
   * @param {string} status - Status of the resolution step
   * @param {string} userId - ID of the user adding the step
   * @returns {Promise<EthicsIncident>} The updated incident
   */
  async addResolutionStep(incidentId, description, status = 'planned', userId = null) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Add the resolution step
      const stepIndex = incident.addResolutionStep(description, status, userId);
      
      // Save the updated incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Added resolution step to ethics incident ${incidentId}`);
      
      // Send notification
      await this.sendIncidentNotifications(updatedIncident, 'resolution_step_added', {
        stepIndex,
        stepDescription: description,
        stepStatus: status
      });
      
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to add resolution step to ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Update a resolution step status
   * @param {string} incidentId - ID of the incident
   * @param {number} stepIndex - Index of the resolution step
   * @param {string} status - New status of the resolution step
   * @param {string} userId - ID of the user updating the step
   * @returns {Promise<EthicsIncident>} The updated incident
   */
  async updateResolutionStepStatus(incidentId, stepIndex, status, userId = null) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Update the resolution step
      const success = incident.updateResolutionStep(stepIndex, status, userId);
      if (!success) {
        throw new Error(`Invalid resolution step index: ${stepIndex}`);
      }
      
      // Save the updated incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Updated resolution step ${stepIndex} status to ${status} for incident ${incidentId}`);
      
      // If all steps are completed and incident is in mitigating status, suggest resolution
      if (status === 'completed' && incident.status === 'mitigating') {
        const allStepsCompleted = incident.resolutionSteps.every(step => step.status === 'completed');
        if (allStepsCompleted) {
          // Send suggestion to resolve the incident
          await this.sendIncidentNotifications(updatedIncident, 'suggest_resolution');
        }
      }
      
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to update resolution step for incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Resolve an incident
   * @param {string} incidentId - ID of the incident
   * @param {string} userId - ID of the user resolving the incident
   * @param {string} resolutionSummary - Summary of the resolution
   * @returns {Promise<EthicsIncident>} The resolved incident
   */
  async resolveIncident(incidentId, userId = null, resolutionSummary = null) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Check if the incident can be resolved
      if (incident.isDismissed()) {
        throw new Error(`Cannot resolve dismissed incident ${incidentId}`);
      }
      
      // Resolve the incident
      incident.resolve(userId);
      
      // Add resolution summary to metadata
      if (resolutionSummary) {
        if (!incident.metadata.resolution) {
          incident.metadata.resolution = {};
        }
        
        incident.metadata.resolution.summary = resolutionSummary;
        incident.metadata.resolution.resolvedBy = userId;
        incident.metadata.resolution.resolvedAt = new Date();
      }
      
      // Save the updated incident
      const resolvedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Resolved ethics incident ${incidentId}`);
      
      // Send resolution notifications
      await this.sendIncidentNotifications(resolvedIncident, 'resolved', {
        resolutionSummary
      });
      
      // Generate resolution documentation if documentation service is available
      if (this.documentationService) {
        try {
          const documentationId = await this.documentationService.generateIncidentResolutionReport(incidentId);
          
          this.logger.info(`Generated resolution documentation ${documentationId} for incident ${incidentId}`);
          
          // Add documentation reference to the incident
          resolvedIncident.metadata.resolutionDocumentationId = documentationId;
          await this.dataAccessService.updateIncident(resolvedIncident);
        } catch (docError) {
          this.logger.error(`Failed to generate resolution documentation for incident ${incidentId}`, docError);
          // Don't throw here, as the incident is already resolved
        }
      }
      
      return resolvedIncident;
    } catch (error) {
      this.logger.error(`Failed to resolve ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Dismiss an incident
   * @param {string} incidentId - ID of the incident
   * @param {string} reason - Reason for dismissing the incident
   * @param {string} userId - ID of the user dismissing the incident
   * @returns {Promise<EthicsIncident>} The dismissed incident
   */
  async dismissIncident(incidentId, reason, userId = null) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Check if the incident can be dismissed
      if (incident.isResolved()) {
        throw new Error(`Cannot dismiss resolved incident ${incidentId}`);
      }
      
      // Dismiss the incident
      incident.dismiss(reason, userId);
      
      // Save the updated incident
      const dismissedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Dismissed ethics incident ${incidentId}`);
      
      // Send dismissal notifications
      await this.sendIncidentNotifications(dismissedIncident, 'dismissed', {
        reason
      });
      
      return dismissedIncident;
    } catch (error) {
      this.logger.error(`Failed to dismiss ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Update the status of an incident
   * @param {string} incidentId - ID of the incident
   * @param {string} status - New status of the incident
   * @param {string} userId - ID of the user updating the status
   * @returns {Promise<EthicsIncident>} The updated incident
   */
  async updateIncidentStatus(incidentId, status, userId = null) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Check if status transition is valid
      if (!this.isValidStatusTransition(incident.status, status)) {
        throw new Error(`Invalid status transition from ${incident.status} to ${status}`);
      }
      
      // Update the status
      const previousStatus = incident.status;
      incident.status = status;
      
      // Update metadata
      if (!incident.metadata.statusHistory) {
        incident.metadata.statusHistory = [];
      }
      
      incident.metadata.statusHistory.push({
        from: previousStatus,
        to: status,
        timestamp: new Date(),
        userId
      });
      
      // Save the updated incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Updated ethics incident ${incidentId} status from ${previousStatus} to ${status}`);
      
      // Send status change notifications
      await this.sendIncidentNotifications(updatedIncident, 'status_changed', {
        previousStatus,
        userId
      });
      
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to update status for ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Check if a status transition is valid
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - New status
   * @returns {boolean} True if the transition is valid
   * @private
   */
  isValidStatusTransition(currentStatus, newStatus) {
    // Define valid transitions
    const validTransitions = {
      'open': ['investigating', 'mitigating', 'resolved', 'dismissed'],
      'investigating': ['mitigating', 'resolved', 'dismissed'],
      'mitigating': ['resolved', 'investigating', 'dismissed'],
      'resolved': [], // No valid transitions from resolved
      'dismissed': []  // No valid transitions from dismissed
    };
    
    return validTransitions[currentStatus] && validTransitions[currentStatus].includes(newStatus);
  }

  /**
   * Add affected users to an incident
   * @param {string} incidentId - ID of the incident
   * @param {Array<string>} userIds - Array of user IDs
   * @returns {Promise<EthicsIncident>} The updated incident
   */
  async addAffectedUsers(incidentId, userIds) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Add users to the affected users list (without duplicates)
      const currentUserIds = new Set(incident.affectedUsers);
      userIds.forEach(id => currentUserIds.add(id));
      incident.affectedUsers = Array.from(currentUserIds);
      
      // Save the updated incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Added affected users to ethics incident ${incidentId}`);
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to add affected users to ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Add affected components to an incident
   * @param {string} incidentId - ID of the incident
   * @param {Array<string>} componentIds - Array of component IDs
   * @returns {Promise<EthicsIncident>} The updated incident
   */
  async addAffectedComponents(incidentId, componentIds) {
    try {
      // Get the incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Add components to the affected components list (without duplicates)
      const currentComponentIds = new Set(incident.affectedComponents);
      componentIds.forEach(id => currentComponentIds.add(id));
      incident.affectedComponents = Array.from(currentComponentIds);
      
      // Save the updated incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      this.logger.info(`Added affected components to ethics incident ${incidentId}`);
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to add affected components to ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Link related incidents
   * @param {string} incidentId - ID of the primary incident
   * @param {string} relatedIncidentId - ID of the related incident
   * @param {boolean} bidirectional - Whether to establish a bidirectional link
   * @returns {Promise<EthicsIncident>} The updated primary incident
   */
  async linkRelatedIncident(incidentId, relatedIncidentId, bidirectional = true) {
    try {
      // Get the primary incident
      const incident = await this.dataAccessService.getIncidentById(incidentId);
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`);
      }
      
      // Get the related incident
      const relatedIncident = await this.dataAccessService.getIncidentById(relatedIncidentId);
      if (!relatedIncident) {
        throw new Error(`Related incident ${relatedIncidentId} not found`);
      }
      
      // Add related incident to the primary incident (without duplicates)
      if (!incident.relatedIncidents.includes(relatedIncidentId)) {
        incident.relatedIncidents.push(relatedIncidentId);
      }
      
      // Save the updated primary incident
      const updatedIncident = await this.dataAccessService.updateIncident(incident);
      
      // If bidirectional, update the related incident as well
      if (bidirectional) {
        if (!relatedIncident.relatedIncidents.includes(incidentId)) {
          relatedIncident.relatedIncidents.push(incidentId);
          await this.dataAccessService.updateIncident(relatedIncident);
        }
      }
      
      this.logger.info(`Linked incident ${incidentId} with related incident ${relatedIncidentId}`);
      return updatedIncident;
    } catch (error) {
      this.logger.error(`Failed to link related incident ${relatedIncidentId} to incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Generate analytics for incidents
   * @param {Object} filters - Filters to apply
   * @param {string} groupBy - Field to group by (e.g., 'status', 'severity', 'monitor')
   * @param {string} timeFrame - Time frame to analyze (e.g., 'day', 'week', 'month')
   * @returns {Promise<Object>} Analytics results
   */
  async generateAnalytics(filters = {}, groupBy = 'status', timeFrame = 'month') {
    try {
      // This would typically involve complex aggregation queries to the data store
      // For simplicity, we'll mock the implementation here
      
      // Get incidents based on filters
      const incidents = await this.dataAccessService.getIncidents(filters);
      
      // Group incidents by the specified field
      const groups = {};
      incidents.forEach(incident => {
        const key = incident[groupBy] || 'unknown';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(incident);
      });
      
      // Calculate metrics for each group
      const results = {};
      for (const [key, groupIncidents] of Object.entries(groups)) {
        results[key] = {
          count: groupIncidents.length,
          averageTimeToResolution: this.calculateAverageTimeToResolution(groupIncidents),
          severityDistribution: this.calculateSeverityDistribution(groupIncidents),
          statusDistribution: this.calculateStatusDistribution(groupIncidents),
          trend: this.calculateTrend(groupIncidents, timeFrame)
        };
      }
      
      return {
        totalCount: incidents.length,
        groups: results,
        timeFrame
      };
    } catch (error) {
      this.logger.error('Failed to generate incident analytics', error);
      throw error;
    }
  }

  /**
   * Calculate average time to resolution for a set of incidents
   * @param {Array<EthicsIncident>} incidents - Array of incidents
   * @returns {number|null} Average time to resolution in milliseconds, or null if no resolved incidents
   * @private
   */
  calculateAverageTimeToResolution(incidents) {
    const resolvedIncidents = incidents.filter(incident => incident.isResolved());
    if (resolvedIncidents.length === 0) {
      return null;
    }
    
    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      const timeToResolution = incident.getTimeToResolution();
      return sum + (timeToResolution || 0);
    }, 0);
    
    return totalTime / resolvedIncidents.length;
  }

  /**
   * Calculate severity distribution for a set of incidents
   * @param {Array<EthicsIncident>} incidents - Array of incidents
   * @returns {Object} Severity distribution
   * @private
   */
  calculateSeverityDistribution(incidents) {
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    incidents.forEach(incident => {
      const severity = incident.severity || 'medium';
      if (distribution[severity] !== undefined) {
        distribution[severity]++;
      }
    });
    
    return distribution;
  }

  /**
   * Calculate status distribution for a set of incidents
   * @param {Array<EthicsIncident>} incidents - Array of incidents
   * @returns {Object} Status distribution
   * @private
   */
  calculateStatusDistribution(incidents) {
    const distribution = {
      open: 0,
      investigating: 0,
      mitigating: 0,
      resolved: 0,
      dismissed: 0
    };
    
    incidents.forEach(incident => {
      const status = incident.status || 'open';
      if (distribution[status] !== undefined) {
        distribution[status]++;
      }
    });
    
    return distribution;
  }

  /**
   * Calculate trend data for a set of incidents
   * @param {Array<EthicsIncident>} incidents - Array of incidents
   * @param {string} timeFrame - Time frame for trend (day, week, month)
   * @returns {Array} Trend data
   * @private
   */
  calculateTrend(incidents, timeFrame) {
    // Sort incidents by detection date
    const sortedIncidents = [...incidents].sort((a, b) => a.detectedAt - b.detectedAt);
    
    // Group incidents by time periods based on the time frame
    const now = new Date();
    const periods = [];
    const timeFrameMillis = this.getTimeFrameMillis(timeFrame);
    const numPeriods = 10; // Number of periods to include in the trend
    
    for (let i = 0; i < numPeriods; i++) {
      const endTime = new Date(now.getTime() - (i * timeFrameMillis));
      const startTime = new Date(endTime.getTime() - timeFrameMillis);
      
      periods.unshift({
        startTime,
        endTime,
        count: 0,
        label: this.formatTrendLabel(startTime, timeFrame)
      });
    }
    
    // Count incidents in each period
    sortedIncidents.forEach(incident => {
      const detectedAt = incident.detectedAt;
      
      for (const period of periods) {
        if (detectedAt >= period.startTime && detectedAt < period.endTime) {
          period.count++;
          break;
        }
      }
    });
    
    return periods.map(period => ({
      label: period.label,
      count: period.count
    }));
  }

  /**
   * Get milliseconds for a time frame
   * @param {string} timeFrame - Time frame (day, week, month)
   * @returns {number} Milliseconds
   * @private
   */
  getTimeFrameMillis(timeFrame) {
    switch (timeFrame.toLowerCase()) {
      case 'day':
        return 24 * 60 * 60 * 1000; // 1 day
      case 'week':
        return 7 * 24 * 60 * 60 * 1000; // 1 week
      case 'month':
      default:
        return 30 * 24 * 60 * 60 * 1000; // ~1 month
    }
  }

  /**
   * Format trend label based on time frame
   * @param {Date} date - Date to format
   * @param {string} timeFrame - Time frame (day, week, month)
   * @returns {string} Formatted label
   * @private
   */
  formatTrendLabel(date, timeFrame) {
    switch (timeFrame.toLowerCase()) {
      case 'day':
        return `${date.getHours()}:00`;
      case 'week':
        return date.toLocaleDateString(undefined, { weekday: 'short' });
      case 'month':
      default:
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Send notifications for an incident event
   * @param {EthicsIncident} incident - The incident
   * @param {string} eventType - Type of event (created, updated, assigned, etc.)
   * @param {Object} eventData - Additional data for the event
   * @returns {Promise<void>}
   * @private
   */
  async sendIncidentNotifications(incident, eventType, eventData = {}) {
    if (!this.notificationService) {
      this.logger.warn('Notification service not available, skipping incident notifications');
      return;
    }
    
    try {
      // Determine recipients based on event type and incident data
      const recipients = await this.determineNotificationRecipients(incident, eventType);
      
      // For each recipient, send a notification
      for (const recipient of recipients) {
        const message = this.formatNotificationMessage(incident, eventType, eventData);
        
        await this.notificationService.sendNotification({
          channel: recipient.channel || 'email',
          recipient: recipient.id,
          subject: `Ethics Incident ${this.getNotificationSubject(eventType)}: ${incident.title}`,
          message,
          data: {
            incidentId: incident.id,
            eventType,
            ...eventData
          }
        });
      }
      
      this.logger.info(`Sent ${eventType} notifications for incident ${incident.id}`);
    } catch (error) {
      this.logger.error(`Failed to send notifications for incident ${incident.id}`, error);
      // Don't throw here to avoid disrupting the main flow
    }
  }

  /**
   * Determine notification recipients based on incident and event type
   * @param {EthicsIncident} incident - The incident
   * @param {string} eventType - Type of event
   * @returns {Promise<Array>} Array of recipients
   * @private
   */
  async determineNotificationRecipients(incident, eventType) {
    // This would typically involve querying user preferences and roles
    // For simplicity, we'll return a basic set of recipients
    
    const recipients = [];
    
    // Always notify the assigned user if there is one
    if (incident.assignedTo) {
      recipients.push({ id: incident.assignedTo, channel: 'email' });
    }
    
    // For certain events, notify additional users
    switch (eventType) {
      case 'created':
        // Notify ethics team members
        recipients.push({ id: 'ethics-team', channel: 'group' });
        break;
        
      case 'assigned':
        // No additional recipients
        break;
        
      case 'status_changed':
        // Notify ethics team for significant status changes
        recipients.push({ id: 'ethics-team', channel: 'group' });
        break;
        
      case 'resolved':
      case 'dismissed':
        // Notify ethics team and management
        recipients.push({ id: 'ethics-team', channel: 'group' });
        recipients.push({ id: 'ethics-management', channel: 'group' });
        break;
        
      default:
        // Default to notifying the ethics team
        recipients.push({ id: 'ethics-team', channel: 'group' });
    }
    
    return recipients;
  }

  /**
   * Format notification message based on incident and event type
   * @param {EthicsIncident} incident - The incident
   * @param {string} eventType - Type of event
   * @param {Object} eventData - Additional data for the event
   * @returns {string} Formatted message
   * @private
   */
  formatNotificationMessage(incident, eventType, eventData) {
    const baseInfo = `
Incident ID: ${incident.id}
Title: ${incident.title}
Description: ${incident.description}
Status: ${incident.status}
Severity: ${incident.severity}
`;
    
    switch (eventType) {
      case 'created':
        return `A new ethics incident has been created:
${baseInfo}
Please review this incident at your earliest convenience.`;
        
      case 'assigned':
        return `An ethics incident has been assigned:
${baseInfo}
Assigned to: ${incident.assignedTo}
${eventData.assignedBy ? `Assigned by: ${eventData.assignedBy}` : ''}

Please review this incident and take appropriate action.`;
        
      case 'status_changed':
        return `An ethics incident status has changed:
${baseInfo}
Previous status: ${eventData.previousStatus}
New status: ${incident.status}

Please review this update.`;
        
      case 'resolution_step_added':
        return `A resolution step has been added to an ethics incident:
${baseInfo}
Step: ${eventData.stepDescription}
Status: ${eventData.stepStatus}

Please review this update.`;
        
      case 'resolved':
        return `An ethics incident has been resolved:
${baseInfo}
${eventData.resolutionSummary ? `Resolution summary: ${eventData.resolutionSummary}` : ''}

No further action is required.`;
        
      case 'dismissed':
        return `An ethics incident has been dismissed:
${baseInfo}
Reason: ${eventData.reason}

No further action is required.`;
        
      case 'suggest_resolution':
        return `All resolution steps have been completed for an ethics incident:
${baseInfo}
Consider marking this incident as resolved if appropriate.`;
        
      default:
        return `Ethics incident update:
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
        return 'New Incident';
      case 'assigned':
        return 'Incident Assigned';
      case 'status_changed':
        return 'Status Changed';
      case 'resolution_step_added':
        return 'Resolution Step Added';
      case 'resolved':
        return 'Incident Resolved';
      case 'dismissed':
        return 'Incident Dismissed';
      case 'suggest_resolution':
        return 'Resolution Suggested';
      default:
        return 'Update';
    }
  }
}

module.exports = EthicsIncidentService;