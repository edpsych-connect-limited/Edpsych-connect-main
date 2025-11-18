/**
 * Data Sharing Models
 * 
 * This file defines the data structures for cross-institutional data sharing
 * within the EdPsych Research Foundation, including agreements, datasets,
 * sharing requests, and access controls.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Status of a data sharing agreement
 */
export enum AgreementStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  REJECTED = 'rejected'
}

/**
 * Status of a data sharing request
 */
export enum SharingRequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

/**
 * Access level for shared data
 */
export enum DataAccessLevel {
  METADATA_ONLY = 'metadata_only',        // Only descriptive information about the dataset
  AGGREGATED_RESULTS = 'aggregated_results', // Only aggregated/statistical results
  SYNTHETIC = 'synthetic',               // Synthetic data derived from original
  ANONYMIZED = 'anonymized',             // Fully anonymized data
  PSEUDONYMIZED = 'pseudonymized',       // Pseudonymized data
  IDENTIFIED = 'identified'              // Data with identifiers (requires highest level of protection)
}

/**
 * Type of dataset being shared
 */
export enum DatasetType {
  SURVEY_RESPONSES = 'survey_responses',
  ASSESSMENT_RESULTS = 'assessment_results',
  OBSERVATIONAL_DATA = 'observational_data',
  INTERVIEW_TRANSCRIPTS = 'interview_transcripts',
  NEUROPSYCHOLOGICAL_TESTS = 'neuropsychological_tests',
  BEHAVIORAL_METRICS = 'behavioral_metrics',
  EDUCATIONAL_OUTCOMES = 'educational_outcomes',
  DEMOGRAPHIC_DATA = 'demographic_data',
  LONGITUDINAL_TRACKING = 'longitudinal_tracking',
  INTERVENTION_OUTCOMES = 'intervention_outcomes',
  SOCIAL_NETWORK_ANALYSIS = 'social_network_analysis',
  MIXED_METHODS = 'mixed_methods'
}

/**
 * Usage purpose for shared data
 */
export enum DataUsagePurpose {
  ACADEMIC_RESEARCH = 'academic_research',
  EDUCATIONAL_IMPROVEMENT = 'educational_improvement',
  POLICY_DEVELOPMENT = 'policy_development',
  PRODUCT_DEVELOPMENT = 'product_development',
  PROGRAM_EVALUATION = 'program_evaluation',
  META_ANALYSIS = 'meta_analysis',
  MACHINE_LEARNING_TRAINING = 'machine_learning_training',
  BENCHMARKING = 'benchmarking',
  REPLICATION_STUDY = 'replication_study',
  VALIDATION_STUDY = 'validation_study'
}

/**
 * Data format for shared data
 */
export enum DataFormat {
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
  PARQUET = 'parquet',
  AVRO = 'avro',
  SQL = 'sql',
  RDF = 'rdf',
  EXCEL = 'excel',
  SPSS = 'spss',
  STATA = 'stata',
  R_DATA = 'r_data',
  PYTHON_PICKLE = 'python_pickle',
  CUSTOM = 'custom'
}

/**
 * Legal basis for data processing under GDPR and similar regulations
 */
export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
  SCIENTIFIC_RESEARCH = 'scientific_research'
}

/**
 * Represents a field in a dataset
 */
export interface DataField {
  id: string;
  name: string;
  description: string;
  dataType: string; // String, Number, Date, Boolean, etc.
  isIdentifiable: boolean;
  isPHI: boolean; // Protected Health Information
  isRequired: boolean;
  possibleValues?: string[];
  unitOfMeasure?: string;
  validationRules?: string[];
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Data protection measures applied to a dataset
 */
export interface DataProtectionMeasures {
  anonymizationTechniques?: string[];
  encryptionMethods?: string[];
  accessControls: string[];
  dataMinimizationApplied: boolean;
  retentionPeriod?: number; // In months
  additionalMeasures?: string[];
}

/**
 * Represents a dataset that can be shared
 */
export interface SharedDataset {
  id: string;
  name: string;
  description: string;
  ownerId: string; // Institution ID
  createdBy: string; // User ID
  createdDate: Date;
  lastUpdated: Date;
  updatedBy: string;
  type: DatasetType;
  subtype?: string;
  accessLevel: DataAccessLevel;
  fields: DataField[];
  dataFormat: DataFormat;
  sampleDataUrl?: string;
  dataProtection: DataProtectionMeasures;
  ethicsApprovalId?: string;
  dataRetentionPeriod: number; // In months
  containsMinorData: boolean;
  containsSensitiveData: boolean;
  containsSpecialCategoryData: boolean; // GDPR special categories
  metadata: Record<string, any>;
  tags: string[];
  size?: number; // In bytes
  recordCount?: number;
  timeframe?: {
    startDate: Date;
    endDate: Date;
  };
  version: string;
  isActive: boolean;
  deactivationReason?: string;
  deactivationDate?: Date;
}

/**
 * Represents a data sharing agreement between institutions
 */
export interface DataSharingAgreement {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdDate: Date;
  lastUpdated: Date;
  updatedBy: string;
  status: AgreementStatus;
  startDate: Date;
  endDate: Date;
  providerInstitutionId: string;
  recipientInstitutions: string[]; // Institution IDs
  sharedDatasets: string[]; // Dataset IDs
  allowedPurposes: DataUsagePurpose[];
  legalBasis: LegalBasis;
  dataProtectionClauses: string[];
  intellectualPropertyClauses: string[];
  confidentialityClauses: string[];
  liabilityClauses: string[];
  breachNotificationProcedure: string;
  disputeResolutionProcedure: string;
  terminationClauses: string[];
  governingLaw: string;
  documentUrl?: string;
  signedDocumentUrl?: string;
  approvals: {
    id: string;
    approvedBy: string;
    approvalDate: Date;
    comments?: string;
  }[];
  rejections?: {
    id: string;
    rejectedBy: string;
    rejectionDate: Date;
    reason: string;
  }[];
  renewalDate: Date;
  renewedBy: string;
  previousEndDate: Date;
  newEndDate: Date;
  changes?: string;
  amendments?: {
    amendmentDate: Date;
    amendedBy: string;
    description: string;
    documentUrl?: string;
  }[];
  isActive: boolean;
  terminationReason?: string;
  terminationDate?: Date;
  terminatedBy?: string;
}

/**
 * Represents a request to access shared data
 */
export interface DataSharingRequest {
  id: string;
  title: string;
  description: string;
  requestingInstitutionId: string;
  requestedDatasets: string[]; // Dataset IDs
  dataProviderInstitutionId: string;
  requestingUserId: string;
  requestDate: Date;
  status: SharingRequestStatus;
  researchPurpose: DataUsagePurpose;
  projectDescription: string;
  researchQuestions: string[];
  methodologySummary: string;
  proposedAnalysisMethods: string[];
  expectedOutputs: string[];
  requestedAccessLevel: DataAccessLevel;
  requestedFields?: string[]; // Specific fields requested
  requestedDuration: number; // In months
  ethicsApprovalId?: string;
  ethicsApprovalDocumentUrl?: string;
  dataManagementPlanUrl?: string;
  reviewers?: string[]; // User IDs
  reviewComments?: {
    reviewerId: string;
    comment: string;
    timestamp: Date;
  }[];
  reviewDecision?: {
    decision: 'approved' | 'rejected' | 'more_info_needed';
    decidedBy: string;
    decisionDate: Date;
    rationale: string;
    conditions?: string[];
  };
  expiryDate?: Date;
  isActive: boolean;
  withdrawalReason?: string;
  withdrawalDate?: Date;
}

/**
 * Represents an access grant for shared data
 */
export interface DataAccessGrant {
  id: string;
  requestId: string;
  grantedBy: string;
  grantDate: Date;
  expiryDate: Date;
  institutionId: string;
  userId: string;
  datasetIds: string[];
  accessLevel: DataAccessLevel;
  accessibleFields?: string[]; // Field IDs, if subset
  ipRestrictions?: string[];
  timeRestrictions?: {
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    timezone: string;
    allowedDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  };
  usageConditions: string[];
  accessCredentials?: {
    apiKey?: string;
    tokenExpiry?: Date;
    encryptionKey?: {
      publicKey: string;
      algorithm: string;
    };
  };
  auditRequirements: {
    logAccessAttempts: boolean;
    logDataRetrievals: boolean;
    periodicAuditReview: boolean;
    auditReviewFrequency?: number; // In days
  };
  isActive: boolean;
  revocationReason?: string;
  revocationDate?: Date;
  revokedBy?: string;
}

/**
 * Audit record for data sharing activities
 */
export interface DataSharingAuditLog {
  id: string;
  timestamp: Date;
  action: 'data_request' | 'data_access' | 'agreement_created' | 'agreement_signed' |
         'access_granted' | 'access_revoked' | 'data_downloaded' | 'data_viewed' |
         'query_executed' | 'api_access';
  userId: string;
  institutionId: string;
  resourceId: string; // Agreement ID, Dataset ID, etc.
  resourceType: 'agreement' | 'dataset' | 'request' | 'access_grant';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
}

/**
 * Create a new shared dataset
 */
export function createSharedDataset(
  params: {
    name: string;
    description: string;
    ownerId: string;
    type: DatasetType;
    accessLevel: DataAccessLevel;
    fields: Omit<DataField, 'id'>[];
    dataFormat: DataFormat;
    dataProtection: DataProtectionMeasures;
    dataRetentionPeriod: number;
    containsMinorData: boolean;
    containsSensitiveData: boolean;
    containsSpecialCategoryData: boolean;
    metadata?: Record<string, any>;
    tags?: string[];
    size?: number;
    recordCount?: number;
    timeframe?: {
      startDate: Date;
      endDate: Date;
    };
    version?: string;
  },
  createdBy: string
): SharedDataset {
  const now = new Date();
  
  const fields = params.fields.map(field => ({
    ...field,
    id: uuidv4()
  }));
  
  return {
    id: uuidv4(),
    name: params.name,
    description: params.description,
    ownerId: params.ownerId,
    createdBy,
    createdDate: now,
    lastUpdated: now,
    updatedBy: createdBy,
    type: params.type,
    accessLevel: params.accessLevel,
    fields,
    dataFormat: params.dataFormat,
    dataProtection: params.dataProtection,
    dataRetentionPeriod: params.dataRetentionPeriod,
    containsMinorData: params.containsMinorData,
    containsSensitiveData: params.containsSensitiveData,
    containsSpecialCategoryData: params.containsSpecialCategoryData,
    metadata: params.metadata || {},
    tags: params.tags || [],
    size: params.size,
    recordCount: params.recordCount,
    timeframe: params.timeframe,
    version: params.version || '1.0.0',
    isActive: true
  };
}

/**
 * Create a new data sharing agreement
 */
export function createDataSharingAgreement(
  params: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    providerInstitutionId: string;
    recipientInstitutions: string[];
    sharedDatasets: string[];
    allowedPurposes: DataUsagePurpose[];
    legalBasis: LegalBasis;
    dataProtectionClauses: string[];
    intellectualPropertyClauses: string[];
    confidentialityClauses: string[];
    liabilityClauses: string[];
    breachNotificationProcedure: string;
    disputeResolutionProcedure: string;
    terminationClauses: string[];
    governingLaw: string;
    documentUrl?: string;
    status?: AgreementStatus;
  },
  createdBy: string
): DataSharingAgreement {
  const now = new Date();
  
  return {
    id: uuidv4(),
    name: params.name,
    description: params.description,
    createdBy,
    createdDate: now,
    lastUpdated: now,
    updatedBy: createdBy,
    status: params.status || AgreementStatus.DRAFT,
    startDate: params.startDate,
    endDate: params.endDate,
    providerInstitutionId: params.providerInstitutionId,
    recipientInstitutions: params.recipientInstitutions,
    sharedDatasets: params.sharedDatasets,
    allowedPurposes: params.allowedPurposes,
    legalBasis: params.legalBasis,
    dataProtectionClauses: params.dataProtectionClauses,
    intellectualPropertyClauses: params.intellectualPropertyClauses,
    confidentialityClauses: params.confidentialityClauses,
    liabilityClauses: params.liabilityClauses,
    breachNotificationProcedure: params.breachNotificationProcedure,
    disputeResolutionProcedure: params.disputeResolutionProcedure,
    terminationClauses: params.terminationClauses,
    governingLaw: params.governingLaw,
    documentUrl: params.documentUrl,
    approvals: [],
    isActive: true,
    signedDocumentUrl: undefined,
    rejections: undefined,
    renewals: undefined,
    amendments: undefined,
    terminationReason: undefined,
    terminationDate: undefined,
    terminatedBy: undefined
  };
}

/**
 * Create a new data sharing request
 */
export function createDataSharingRequest(
  params: {
    title: string;
    description: string;
    requestingInstitutionId: string;
    requestedDatasets: string[];
    dataProviderInstitutionId: string;
    researchPurpose: DataUsagePurpose;
    projectDescription: string;
    researchQuestions: string[];
    methodologySummary: string;
    proposedAnalysisMethods: string[];
    expectedOutputs: string[];
    requestedAccessLevel: DataAccessLevel;
    requestedFields?: string[];
    requestedDuration: number;
    ethicsApprovalId?: string;
    ethicsApprovalDocumentUrl?: string;
    dataManagementPlanUrl?: string;
  },
  requestingUserId: string
): DataSharingRequest {
  const now = new Date();
  
  return {
    id: uuidv4(),
    title: params.title,
    description: params.description,
    requestingInstitutionId: params.requestingInstitutionId,
    requestedDatasets: params.requestedDatasets,
    dataProviderInstitutionId: params.dataProviderInstitutionId,
    requestingUserId,
    requestDate: now,
    status: SharingRequestStatus.DRAFT,
    researchPurpose: params.researchPurpose,
    projectDescription: params.projectDescription,
    researchQuestions: params.researchQuestions,
    methodologySummary: params.methodologySummary,
    proposedAnalysisMethods: params.proposedAnalysisMethods,
    expectedOutputs: params.expectedOutputs,
    requestedAccessLevel: params.requestedAccessLevel,
    requestedFields: params.requestedFields,
    requestedDuration: params.requestedDuration,
    ethicsApprovalId: params.ethicsApprovalId,
    ethicsApprovalDocumentUrl: params.ethicsApprovalDocumentUrl,
    dataManagementPlanUrl: params.dataManagementPlanUrl,
    isActive: true
  };
}