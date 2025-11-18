/**
 * Models related to research cohorts in the EdPsych Research Foundation
 */
/**
 * Cohort status enum
 */
export enum CohortStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

/**
 * Single criterion for cohort inclusion/exclusion
 */
export interface Criterion {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'between';
  value: any;
  valueType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

/**
 * Set of criteria combined with a logical operator
 */
export interface CriteriaSet {
  operator: 'AND' | 'OR';
  criteria: Criterion[];
}

/**
 * Parameters for matching cohort participants
 */
export interface MatchingParameters {
  matchVariables?: string[];
  controlGroupRatio?: number;
  matchTolerance?: number;
  stratificationFactors?: string[];
  minimumSampleSize?: number;
  lastMatchDate?: Date;
  matchQuality?: number;
  [key: string]: any;
}

/**
 * Main cohort entity
 */
export interface Cohort {
  id: string;
  name: string;
  description: string;
  creationDate: Date;
  createdBy: string;
  status: CohortStatus;
  participantCount: number;
  inclusionCriteria: CriteriaSet[];
  exclusionCriteria: CriteriaSet[];
  stratificationVariables: string[];
  matchingAlgorithm: string;
  matchingParameters: MatchingParameters;
  studyId?: string;
  version: number;
  lastUpdated: Date;
  updatedBy: string;
}

/**
 * Parameters for creating a new cohort
 */
export interface CohortCreationParams {
  name: string;
  description: string;
  inclusionCriteria?: CriteriaSet[];
  exclusionCriteria?: CriteriaSet[];
  stratificationVariables?: string[];
  matchingAlgorithm?: string;
  matchingParameters?: MatchingParameters;
  studyId?: string;
}

/**
 * Parameters for updating an existing cohort
 */
export interface CohortUpdateParams {
  name?: string;
  description?: string;
  inclusionCriteria?: CriteriaSet[];
  exclusionCriteria?: CriteriaSet[];
  stratificationVariables?: string[];
  matchingAlgorithm?: string;
  matchingParameters?: MatchingParameters;
  studyId?: string;
  status?: CohortStatus;
}

/**
 * Assignment of a participant to a cohort
 */
export interface ParticipantAssignment {
  cohortId: string;
  participantId: string;
  assignmentDate?: Date;
  assignmentGroup?: string | null;
  participationStatus: 'active' | 'inactive' | 'withdrawn' | 'completed';
  completionStatus?: string;
  removalDate?: Date;
  removalReason?: string;
  lastUpdated: Date;
  updatedBy: string;
}

/**
 * Result of participant matching process
 */
export interface MatchingResult {
  assignments: {
    participantId: string;
    group: string;
  }[];
  matchQuality: number;
  unmatchedParticipants?: string[];
  matchDetails?: any;
}

/**
 * Analytics data for a cohort
 */
export interface CohortAnalytics {
  cohortId: string;
  cohortName: string;
  participantCount: number;
  demographicDistribution: Record<string, any>;
  attritionRate: Record<string, any>;
  groupBalance: Record<string, any>;
  lastUpdated: Date;
}

/**
 * Cohort search filters for querying cohorts
 */
export interface CohortSearchFilters {
  studyId?: string;
  status?: CohortStatus;
  createdBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  nameContains?: string;
  minParticipants?: number;
  maxParticipants?: number;
}