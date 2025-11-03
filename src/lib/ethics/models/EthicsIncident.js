/**
 * @fileoverview Ethics Incident Model
 * 
 * Represents an ethical incident that has been detected or reported.
 * Tracks the status, severity, related metrics, and resolution steps.
 */

class EthicsIncident {
  constructor({
    id = null,
    title,
    description,
    monitorId, // Reference to the EthicsMonitor that detected the incident
    metricId, // Specific metric that triggered the incident
    metricValue, // Value of the metric at the time of the incident
    thresholdValue, // Threshold value that was exceeded
    detectedAt = new Date(),
    status = 'open', // 'open', 'investigating', 'mitigating', 'resolved', 'dismissed'
    severity = 'medium', // 'low', 'medium', 'high', 'critical'
    assignedTo = null, // User ID of the person responsible for addressing the incident
    resolutionSteps = [],
    resolvedAt = null,
    dismissReason = null,
    affectedUsers = [], // List of user IDs potentially affected by this incident
    affectedComponents = [], // System components involved in the incident
    tags = [],
    relatedIncidents = [], // IDs of related incidents
    metadata = {}
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.monitorId = monitorId;
    this.metricId = metricId;
    this.metricValue = metricValue;
    this.thresholdValue = thresholdValue;
    this.detectedAt = detectedAt;
    this.status = status;
    this.severity = severity;
    this.assignedTo = assignedTo;
    this.resolutionSteps = resolutionSteps;
    this.resolvedAt = resolvedAt;
    this.dismissReason = dismissReason;
    this.affectedUsers = affectedUsers;
    this.affectedComponents = affectedComponents;
    this.tags = tags;
    this.relatedIncidents = relatedIncidents;
    this.metadata = metadata;
  }

  /**
   * Check if the incident is currently open
   * @returns {boolean} True if the incident is open
   */
  isOpen() {
    return ['open', 'investigating', 'mitigating'].includes(this.status);
  }

  /**
   * Check if the incident has been resolved
   * @returns {boolean} True if the incident is resolved
   */
  isResolved() {
    return this.status === 'resolved';
  }

  /**
   * Check if the incident has been dismissed
   * @returns {boolean} True if the incident is dismissed
   */
  isDismissed() {
    return this.status === 'dismissed';
  }

  /**
   * Add a resolution step to the incident
   * @param {string} description - Description of the resolution step
   * @param {string} status - Status of the resolution step ('planned', 'in_progress', 'completed')
   * @param {string} userId - ID of the user who added the step
   * @returns {number} Index of the new resolution step
   */
  addResolutionStep(description, status = 'planned', userId = null) {
    const step = {
      description,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      userId
    };
    
    this.resolutionSteps.push(step);
    return this.resolutionSteps.length - 1;
  }

  /**
   * Update the status of a resolution step
   * @param {number} index - Index of the resolution step
   * @param {string} status - New status of the resolution step
   * @param {string} userId - ID of the user updating the step
   * @returns {boolean} True if the update was successful
   */
  updateResolutionStep(index, status, userId = null) {
    if (index < 0 || index >= this.resolutionSteps.length) {
      return false;
    }
    
    this.resolutionSteps[index].status = status;
    this.resolutionSteps[index].updatedAt = new Date();
    
    if (status === 'completed') {
      this.resolutionSteps[index].completedAt = new Date();
    }
    
    if (userId) {
      this.resolutionSteps[index].userId = userId;
    }
    
    return true;
  }

  /**
   * Resolve the incident
   * @param {string} userId - ID of the user resolving the incident
   * @returns {boolean} True if the incident was resolved
   */
  resolve(userId = null) {
    if (this.isDismissed()) {
      return false;
    }
    
    this.status = 'resolved';
    this.resolvedAt = new Date();
    
    if (userId) {
      this.assignedTo = userId;
    }
    
    return true;
  }

  /**
   * Dismiss the incident
   * @param {string} reason - Reason for dismissing the incident
   * @param {string} userId - ID of the user dismissing the incident
   * @returns {boolean} True if the incident was dismissed
   */
  dismiss(reason, userId = null) {
    if (this.isResolved()) {
      return false;
    }
    
    this.status = 'dismissed';
    this.dismissReason = reason;
    
    if (userId) {
      this.assignedTo = userId;
    }
    
    return true;
  }

  /**
   * Calculate the time elapsed since the incident was detected
   * @returns {number} Time elapsed in milliseconds
   */
  getTimeElapsed() {
    const now = new Date();
    return now - this.detectedAt;
  }

  /**
   * Calculate the time to resolution
   * @returns {number|null} Time to resolution in milliseconds, or null if not resolved
   */
  getTimeToResolution() {
    if (!this.isResolved()) {
      return null;
    }
    
    return this.resolvedAt - this.detectedAt;
  }

  /**
   * Serializes the incident to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      monitorId: this.monitorId,
      metricId: this.metricId,
      metricValue: this.metricValue,
      thresholdValue: this.thresholdValue,
      detectedAt: this.detectedAt,
      status: this.status,
      severity: this.severity,
      assignedTo: this.assignedTo,
      resolutionSteps: this.resolutionSteps,
      resolvedAt: this.resolvedAt,
      dismissReason: this.dismissReason,
      affectedUsers: this.affectedUsers,
      affectedComponents: this.affectedComponents,
      tags: this.tags,
      relatedIncidents: this.relatedIncidents,
      metadata: this.metadata
    };
  }

  /**
   * Creates an instance from a plain object
   * @param {Object} data - Plain object representation
   * @returns {EthicsIncident} New instance
   */
  static fromJSON(data) {
    return new EthicsIncident({
      ...data,
      detectedAt: data.detectedAt ? new Date(data.detectedAt) : new Date(),
      resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null,
      resolutionSteps: data.resolutionSteps ? data.resolutionSteps.map(step => ({
        ...step,
        createdAt: step.createdAt ? new Date(step.createdAt) : new Date(),
        updatedAt: step.updatedAt ? new Date(step.updatedAt) : new Date(),
        completedAt: step.completedAt ? new Date(step.completedAt) : null
      })) : []
    });
  }
}

module.exports = EthicsIncident;