/**
 * @fileoverview Ethics Incident Model
 * 
 * Represents an ethical incident that has been detected or reported.
 * Tracks the status, severity, related metrics, and resolution steps.
 */

export interface ResolutionStep {
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  userId: string | null;
}

export interface EthicsIncidentOptions {
  id?: string | null;
  title: string;
  description: string;
  monitorId?: string | null;
  metricId?: string | null;
  metricValue?: any;
  thresholdValue?: any;
  detectedAt?: Date | string;
  status?: 'open' | 'investigating' | 'mitigating' | 'resolved' | 'dismissed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string | null;
  resolutionSteps?: ResolutionStep[];
  resolvedAt?: Date | string | null;
  dismissReason?: string | null;
  affectedUsers?: string[];
  affectedComponents?: string[];
  tags?: string[];
  relatedIncidents?: string[];
  metadata?: Record<string, any>;
}

export class EthicsIncident {
  id: string | null;
  title: string;
  description: string;
  monitorId: string | null;
  metricId: string | null;
  metricValue: any;
  thresholdValue: any;
  detectedAt: Date;
  status: 'open' | 'investigating' | 'mitigating' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string | null;
  resolutionSteps: ResolutionStep[];
  resolvedAt: Date | null;
  dismissReason: string | null;
  affectedUsers: string[];
  affectedComponents: string[];
  tags: string[];
  relatedIncidents: string[];
  metadata: Record<string, any>;

  constructor({
    id = null,
    title,
    description,
    monitorId = null,
    metricId = null,
    metricValue = null,
    thresholdValue = null,
    detectedAt = new Date(),
    status = 'open',
    severity = 'medium',
    assignedTo = null,
    resolutionSteps = [],
    resolvedAt = null,
    dismissReason = null,
    affectedUsers = [],
    affectedComponents = [],
    tags = [],
    relatedIncidents = [],
    metadata = {}
  }: EthicsIncidentOptions) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.monitorId = monitorId;
    this.metricId = metricId;
    this.metricValue = metricValue;
    this.thresholdValue = thresholdValue;
    this.detectedAt = detectedAt instanceof Date ? detectedAt : new Date(detectedAt);
    this.status = status;
    this.severity = severity;
    this.assignedTo = assignedTo;
    this.resolutionSteps = resolutionSteps;
    this.resolvedAt = resolvedAt ? (resolvedAt instanceof Date ? resolvedAt : new Date(resolvedAt)) : null;
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
  isOpen(): boolean {
    return ['open', 'investigating', 'mitigating'].includes(this.status);
  }

  /**
   * Check if the incident has been resolved
   * @returns {boolean} True if the incident is resolved
   */
  isResolved(): boolean {
    return this.status === 'resolved';
  }

  /**
   * Check if the incident has been dismissed
   * @returns {boolean} True if the incident is dismissed
   */
  isDismissed(): boolean {
    return this.status === 'dismissed';
  }

  /**
   * Add a resolution step to the incident
   * @param {string} description - Description of the resolution step
   * @param {string} status - Status of the resolution step ('planned', 'in_progress', 'completed')
   * @param {string} userId - ID of the user who added the step
   * @returns {number} Index of the new resolution step
   */
  addResolutionStep(description: string, status: 'planned' | 'in_progress' | 'completed' = 'planned', userId: string | null = null): number {
    const step: ResolutionStep = {
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
   */
  updateResolutionStep(index: number, status: 'planned' | 'in_progress' | 'completed', userId: string | null = null): void {
    if (index >= 0 && index < this.resolutionSteps.length) {
      this.resolutionSteps[index].status = status;
      this.resolutionSteps[index].updatedAt = new Date();
      
      if (status === 'completed') {
        this.resolutionSteps[index].completedAt = new Date();
      }
      
      if (userId) {
        // Optionally track who updated it, though the interface only has one userId field (creator)
        // Could extend interface if needed
      }
    }
  }
}
