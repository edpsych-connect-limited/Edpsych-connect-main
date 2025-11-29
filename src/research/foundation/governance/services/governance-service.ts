/**
 * Governance Service Interface
 * 
 * This service handles research governance, ethics approval, compliance tracking,
 * and regulatory oversight for research activities.
 */

export interface GovernanceService {
  /**
   * Check if ethics approval is required for a specific research object type
   * @param objectType Type of research object
   * @returns True if ethics approval is required
   */
  isEthicsApprovalRequired(objectType: string): boolean;

  /**
   * Validate an ethics approval ID
   * @param approvalId Ethics approval ID to validate
   * @returns Promise resolving to true if valid
   */
  validateEthicsApproval(approvalId: string): Promise<boolean>;

  /**
   * Register a research object with the governance system
   * @param object Research object registration details
   * @returns Promise resolving to registration ID
   */
  registerResearchObject(object: ResearchObjectRegistration): Promise<string>;

  /**
   * Update the status of a research object
   * @param objectId ID of the research object
   * @param status New status
   * @param metadata Optional metadata about the status change
   * @returns Promise resolving when operation completes
   */
  updateResearchObjectStatus(
    objectId: string, 
    status: string,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Get the governance status of a research object
   * @param objectId ID of the research object
   * @returns Promise resolving to the governance status
   */
  getResearchObjectStatus(objectId: string): Promise<ResearchObjectStatus>;

  /**
   * Get the compliance requirements for a research object
   * @param objectType Type of research object
   * @param jurisdictions Jurisdictions to consider (e.g., ['UK', 'EU'])
   * @returns Promise resolving to compliance requirements
   */
  getComplianceRequirements(
    objectType: string,
    jurisdictions: string[]
  ): Promise<ComplianceRequirement[]>;

  /**
   * Record a compliance event or action
   * @param objectId ID of the research object
   * @param event Compliance event details
   * @returns Promise resolving when operation completes
   */
  recordComplianceEvent(
    objectId: string,
    event: ComplianceEvent
  ): Promise<void>;

  /**
   * Validate that a research object meets all compliance requirements
   * @param objectId ID of the research object
   * @returns Promise resolving to validation result
   */
  validateCompliance(objectId: string): Promise<ComplianceValidationResult>;

  /**
   * Generate a governance report for a research object
   * @param objectId ID of the research object
   * @param reportType Type of report to generate
   * @returns Promise resolving to report URL
   */
  generateGovernanceReport(
    objectId: string,
    reportType: 'compliance' | 'audit' | 'ethics' | 'summary'
  ): Promise<string>;
}

/**
 * Research object registration details
 */
export interface ResearchObjectRegistration {
  /**
   * ID of the research object
   */
  id: string;

  /**
   * Type of research object
   */
  type: string;

  /**
   * Name of the research object
   */
  name: string;

  /**
   * Description of the research object
   */
  description: string;

  /**
   * ID of the user who created the object
   */
  createdBy: string;

  /**
   * Date when the object was created
   */
  createdDate: Date;

  /**
   * Related research objects
   */
  relatedObjects?: {
    id: string;
    type: string;
    relationship: string;
  }[];

  /**
   * Ethics approval ID if applicable
   */
  ethicsApprovalId?: string;

  /**
   * Additional metadata for the research object
   */
  metadata?: Record<string, any>;
}

/**
 * Research object governance status
 */
export interface ResearchObjectStatus {
  /**
   * ID of the research object
   */
  objectId: string;

  /**
   * Current status
   */
  status: string;

  /**
   * Status history
   */
  history: {
    status: string;
    changedBy: string;
    changedDate: Date;
    reason?: string;
  }[];

  /**
   * Ethics approval details
   */
  ethicsApproval?: {
    id: string;
    status: string;
    approvedDate?: Date;
    expiryDate?: Date;
    conditions?: string[];
  };

  /**
   * Compliance status
   */
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';

  /**
   * Issues that need to be addressed
   */
  outstandingIssues?: {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    createdDate: Date;
    resolvedDate?: Date;
  }[];
}

/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  /**
   * ID of the requirement
   */
  id: string;

  /**
   * Description of the requirement
   */
  description: string;

  /**
   * Jurisdiction this requirement applies to
   */
  jurisdiction: string;

  /**
   * Regulation or policy this requirement is based on
   */
  regulation: string;

  /**
   * Whether this requirement is mandatory
   */
  mandatory: boolean;

  /**
   * Evidence needed to demonstrate compliance
   */
  evidenceRequired: string[];

  /**
   * Validation function or criteria
   */
  validationCriteria: string;
}

/**
 * Compliance event
 */
export interface ComplianceEvent {
  /**
   * Event type
   */
  type: string;

  /**
   * User who performed the action
   */
  id: string;

  /**
   * Date of the event
   */
  date: Date;

  /**
   * Description of the event
   */
  description: string;

  /**
   * Evidence or documentation URLs
   */
  evidenceUrls?: string[];

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Result of compliance validation
 */
export interface ComplianceValidationResult {
  /**
   * Whether the object is compliant overall
   */
  compliant: boolean;

  /**
   * Results for individual requirements
   */
  requirements: {
    requirementId: string;
    satisfied: boolean;
    evidence?: string[];
    issues?: string[];
  }[];

  /**
   * Actions needed to achieve compliance
   */
  requiredActions?: {
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: Date;
  }[];

  /**
   * Date of validation
   */
  validationDate: Date;

  /**
   * User who performed the validation
   */
  validatedBy: string;
}