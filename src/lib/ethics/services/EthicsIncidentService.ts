/**
 * @fileoverview Ethics Incident Service
 * 
 * Service responsible for managing the lifecycle of ethics incidents,
 * from creation to resolution, including assignment, tracking, and reporting.
 */

import { EthicsIncident } from '../models/EthicsIncident';

export interface EthicsIncidentServiceOptions {
  dataAccessService?: any;
  notificationService?: any;
  documentationService?: any;
  userService?: any;
  logger?: any;
}

export class EthicsIncidentService {
  dataAccessService: any;
  notificationService: any;
  documentationService: any;
  userService: any;
  logger: any;

  constructor({
    dataAccessService = null,
    notificationService = null,
    documentationService = null,
    userService = null,
    logger = console
  }: EthicsIncidentServiceOptions = {}) {
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
  async getIncident(incidentId: string): Promise<EthicsIncident | null> {
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
   * @returns {Promise<Array<EthicsIncident>>} Array of incidents
   */
  async getIncidents(filters: any = {}, pagination: any = {}, sort: any = {}): Promise<EthicsIncident[]> {
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
  async createIncident(incident: EthicsIncident): Promise<EthicsIncident> {
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
  async updateIncident(incident: EthicsIncident): Promise<EthicsIncident> {
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
  async assignIncident(incidentId: string, userId: string, assignedByUserId: string | null = null): Promise<EthicsIncident> {
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
  async addResolutionStep(incidentId: string, description: string, status: 'planned' | 'in_progress' | 'completed' = 'planned', userId: string | null = null): Promise<EthicsIncident> {
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
  async updateResolutionStepStatus(incidentId: string, stepIndex: number, status: 'planned' | 'in_progress' | 'completed', userId: string | null = null): Promise<EthicsIncident> {
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
        const allStepsCompleted = incident.resolutionSteps.every((step: any) => step.status === 'completed');
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
  async resolveIncident(incidentId: string, userId: string | null = null, resolutionSummary: string | null = null): Promise<EthicsIncident> {
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
      
      // Send notification
      await this.sendIncidentNotifications(resolvedIncident, 'resolved', {
        resolvedBy: userId,
        resolutionSummary
      });
      
      return resolvedIncident;
    } catch (error) {
      this.logger.error(`Failed to resolve ethics incident ${incidentId}`, error);
      throw error;
    }
  }

  /**
   * Send notifications for incident events
   * @private
   */
  private async sendIncidentNotifications(incident: EthicsIncident, event: string, data: any = {}): Promise<void> {
    if (!this.notificationService) return;
    
    try {
      // Determine recipients based on incident severity and assignment
      const recipients = new Set<string>();
      
      if (incident.assignedTo) {
        recipients.add(incident.assignedTo);
      }
      
      // Add other stakeholders based on severity
      if (incident.severity === 'high' || incident.severity === 'critical') {
        // Add ethics officers, admins, etc.
        // This logic would depend on the user service or configuration
      }
      
      for (const recipient of Array.from(recipients)) {
        await this.notificationService.sendNotification({
          recipient,
          type: 'ethics_incident_update',
          data: {
            incidentId: incident.id,
            event,
            severity: incident.severity,
            title: incident.title,
            ...data
          }
        });
      }
    } catch (error) {
      this.logger.error('Failed to send incident notifications', error);
    }
  }
}
