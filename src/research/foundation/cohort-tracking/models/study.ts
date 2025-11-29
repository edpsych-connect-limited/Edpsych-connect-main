/**
 * Models related to research studies in the EdPsych Research Foundation
 */

/**
 * Study status enum
 */
export enum StudyStatus {
  DRAFT = 'draft',
  ETHICS_REVIEW = 'ethics_review',
  APPROVED = 'approved',
  RECRUITING = 'recruiting',
  ACTIVE = 'active',
  DATA_COLLECTION = 'data_collection',
  ANALYSIS = 'analysis',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  ARCHIVED = 'archived'
}

/**
 * Ethics approval status
 */
export enum EthicsApprovalStatus {
  PENDING = 'pending',
  REVISIONS_REQUIRED = 'revisions_required',
  CONDITIONALLY_APPROVED = 'conditionally_approved',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXEMPT = 'exempt'
}

/**
 * Study design types
 */
export enum StudyDesign {
  OBSERVATIONAL = 'observational',
  EXPERIMENTAL = 'experimental',
  QUASI_EXPERIMENTAL = 'quasi_experimental',
  LONGITUDINAL = 'longitudinal',
  CROSS_SECTIONAL = 'cross_sectional',
  CASE_STUDY = 'case_study',
  MIXED_METHODS = 'mixed_methods',
  META_ANALYSIS = 'meta_analysis',
  SYSTEMATIC_REVIEW = 'systematic_review'
}

/**
 * Ethics review details
 */
export interface EthicsReview {
  submissionDate?: Date;
  reviewerId?: string;
  reviewDate?: Date;
  status: EthicsApprovalStatus;
  referenceNumber?: string;
  expirationDate?: Date;
  revisionRequests?: string[];
  conditions?: string[];
  approvalDocumentUrl?: string;
  reviewNotes?: string;
}

/**
 * Study data governance details
 */
export interface DataGovernance {
  dataController: string;
  dataProcessors?: string[];
  dpia?: {  // Data Protection Impact Assessment
    completed: boolean;
    date?: Date;
    documentUrl?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  };
  retentionPeriod: number; // In months
  dataLocations: string[];
  pseudonymizationMethod: string;
  sensitiveDataCategories?: string[];
  crossBorderTransfers?: boolean;
  crossBorderTransferMechanism?: string;
  dpo?: string; // Data Protection Officer
}

/**
 * Study timeline event
 */
export interface StudyTimelineEvent {
  eventDate: Date;
  eventType: string;
  description: string;
  id: string;
  metadata?: Record<string, any>;
}

/**
 * Study-related publication
 */
export interface StudyPublication {
  title: string;
  authors: string[];
  publicationDate?: Date;
  journal?: string;
  doi?: string;
  url?: string;
  citationCount?: number;
  openAccess: boolean;
}

/**
 * Study funding details
 */
export interface StudyFunding {
  funderId: string;
  funderName: string;
  grantId?: string;
  grantAmount?: number;
  grantCurrency?: string;
  startDate?: Date;
  endDate?: Date;
  grantTitle?: string;
}

/**
 * Study statistics tracking
 */
export interface StudyStatistics {
  participantCount: number;
  cohortsCount: number;
  dataPointsCollected: number;
  analysesRun: number;
  lastUpdated: Date;
}

/**
 * Main study entity
 */
export interface Study {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  researchQuestions: string[];
  hypotheses?: string[];
  keywords: string[];
  leadResearcher: string;
  researchTeam: string[];
  institutions: string[];
  status: StudyStatus;
  creationDate: Date;
  lastUpdated: Date;
  studyDesign: StudyDesign;
  methodology: string;
  interventions?: string[];
  outcomes: string[];
  startDate?: Date;
  endDate?: Date;
  targetParticipantCount?: number;
  inclusionCriteria?: string[];
  exclusionCriteria?: string[];
  cohortIds: string[];
  ethicsReview: EthicsReview;
  dataGovernance: DataGovernance;
  timeline: StudyTimelineEvent[];
  publications?: StudyPublication[];
  funding?: StudyFunding[];
  relatedStudies?: string[];
  externalIdentifiers?: Record<string, string>;
  statisticalAnalysisPlan?: string;
  statistics?: StudyStatistics;
  preRegistered: boolean;
  preRegistrationUrl?: string;
  version: number;
}

/**
 * Parameters for creating a new study
 */
export interface StudyCreationParams {
  title: string;
  shortTitle?: string;
  description: string;
  researchQuestions: string[];
  hypotheses?: string[];
  keywords: string[];
  leadResearcher: string;
  researchTeam?: string[];
  institutions?: string[];
  studyDesign: StudyDesign;
  methodology: string;
  interventions?: string[];
  outcomes: string[];
  startDate?: Date;
  endDate?: Date;
  targetParticipantCount?: number;
  inclusionCriteria?: string[];
  exclusionCriteria?: string[];
  ethicsReview?: Partial<EthicsReview>;
  dataGovernance: DataGovernance;
  statisticalAnalysisPlan?: string;
  preRegistered?: boolean;
  preRegistrationUrl?: string;
  funding?: StudyFunding[];
  externalIdentifiers?: Record<string, string>;
}

/**
 * Parameters for updating an existing study
 */
export interface StudyUpdateParams {
  title?: string;
  shortTitle?: string;
  description?: string;
  researchQuestions?: string[];
  hypotheses?: string[];
  keywords?: string[];
  leadResearcher?: string;
  researchTeam?: string[];
  institutions?: string[];
  status?: StudyStatus;
  studyDesign?: StudyDesign;
  methodology?: string;
  interventions?: string[];
  outcomes?: string[];
  startDate?: Date;
  endDate?: Date;
  targetParticipantCount?: number;
  inclusionCriteria?: string[];
  exclusionCriteria?: string[];
  cohortIds?: string[];
  ethicsReview?: Partial<EthicsReview>;
  dataGovernance?: Partial<DataGovernance>;
  timeline?: StudyTimelineEvent[];
  publications?: StudyPublication[];
  funding?: StudyFunding[];
  relatedStudies?: string[];
  externalIdentifiers?: Record<string, string>;
  statisticalAnalysisPlan?: string;
  preRegistered?: boolean;
  preRegistrationUrl?: string;
}

/**
 * Study search filters for querying studies
 */
export interface StudySearchFilters {
  status?: StudyStatus;
  leadResearcher?: string;
  researchTeam?: string;
  institution?: string;
  studyDesign?: StudyDesign;
  ethicsStatus?: EthicsApprovalStatus;
  keyword?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  activeAfter?: Date;
  activeBefore?: Date;
  preRegistered?: boolean;
  funderId?: string;
  cohortId?: string;
}