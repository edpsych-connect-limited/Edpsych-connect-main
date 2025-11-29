/**
 * Models for the Double-Blind Study Automation Framework
 * 
 * This module defines the data structures for managing double-blind studies
 * in the EdPsych Research Foundation, ensuring research integrity through
 * proper blinding mechanisms for participants, researchers, and analysts.
 */

/**
 * Blinding level for the study
 */
export enum BlindingLevel {
  SINGLE_BLIND = 'single_blind',  // Participants don't know their group assignment
  DOUBLE_BLIND = 'double_blind',  // Both participants and researchers don't know group assignments
  TRIPLE_BLIND = 'triple_blind'   // Participants, researchers, and data analysts are blinded
}

/**
 * Types of blinding breaches that can occur
 */
export enum BreachType {
  ACCIDENTAL_DISCLOSURE = 'accidental_disclosure',
  DEDUCTIVE_DISCLOSURE = 'deductive_disclosure',
  TECHNICAL_ERROR = 'technical_error',
  PROTOCOL_VIOLATION = 'protocol_violation',
  EMERGENCY_UNBLINDING = 'emergency_unblinding'
}

/**
 * Status of a double-blind study
 */
export enum DoubleBlindStudyStatus {
  SETUP = 'setup',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  UNBLINDED = 'unblinded',
  TERMINATED = 'terminated'
}

/**
 * Group assignment strategy
 */
export enum AssignmentStrategy {
  SIMPLE_RANDOMIZATION = 'simple_randomization',
  BLOCK_RANDOMIZATION = 'block_randomization',
  STRATIFIED_RANDOMIZATION = 'stratified_randomization',
  ADAPTIVE_RANDOMIZATION = 'adaptive_randomization',
  MINIMIZATION = 'minimization'
}

/**
 * Represents a breach in the blinding protocol
 */
export interface BlindingBreach {
  id: string;
  studyId: string;
  timestamp: Date;
  type: BreachType;
  description: string;
  affectedParticipants: string[];
  affectedResearchers: string[];
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationSteps: string;
  reportedBy: string;
  reportDate: Date;
  resolution?: string;
  resolutionDate?: Date;
}

/**
 * Configuration for an automated unblinding trigger
 */
export interface UnblindingTrigger {
  id: string;
  name: string;
  description: string;
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'neq' | 'gte' | 'lte';
    value: number | string | boolean;
  }[];
  requiresApproval: boolean;
  approvers?: string[];
  notificationRecipients: string[];
  active: boolean;
}

/**
 * Specific role/access permissions for the double-blind study
 */
export interface BlindedRole {
  id: string;
  userId: string;
  studyId: string;
  role: 'principal_investigator' | 'researcher' | 'data_analyst' | 'statistician' | 'study_coordinator' | 'ethics_monitor';
  accessLevel: 'full_access' | 'blinded_access' | 'aggregated_only' | 'metadata_only';
  dataPartitions: string[];
  canUnblind: boolean;
  unblindingApprovalRequired: boolean;
  approvers?: string[];
}

/**
 * Study arm/group in the double-blind study
 */
export interface StudyArm {
  id: string;
  name: string;
  internalCode: string; // Used by system, not visible to blinded researchers
  description: string;
  isControl: boolean;
  targetSize: number;
  intervention?: string;
  placebo?: boolean;
}

/**
 * Mapping for a participant in the double-blind study
 */
export interface BlindedParticipant {
  id: string;
  participantId: string; // Original participant ID from cohort system
  blindedId: string; // De-identified ID used in study
  armId: string; // The study arm assignment
  enrollmentDate: Date;
  withdrawalDate?: Date;
  withdrawalReason?: string;
  dataPartitions: string[]; // Which data partitions this participant belongs to
}

/**
 * Emergency unblinding record
 */
export interface EmergencyUnblinding {
  id: string;
  studyId: string;
  participantId: string;
  requestedBy: string;
  requestDate: Date;
  reason: string;
  approved: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  denialReason?: string;
}

/**
 * Audit log entry for the double-blind system
 */
export interface BlindingAuditLog {
  id: string;
  studyId: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  details: Record<string, any>;
  affectedParticipants?: string[];
  systemGenerated: boolean;
}

/**
 * Double-blind study parameters for randomization
 */
export interface RandomizationParams {
  strategy: AssignmentStrategy;
  blockSize?: number; // For block randomization
  stratificationFactors?: {
    factor: string;
    values: string[];
  }[]; // For stratified randomization
  seedValue?: string; // For reproducibility
  allocationRatio?: number[]; // Ratio for group sizes (e.g., [1, 1] for equal, [2, 1] for 2:1)
  minimizationFactors?: {
    factor: string;
    weight: number;
  }[]; // For minimization
}

/**
 * Main double-blind study entity
 */
export interface DoubleBlindStudy {
  id: string;
  name: string;
  description: string;
  status: DoubleBlindStudyStatus;
  blindingLevel: BlindingLevel;
  relatedStudyId: string; // ID of the parent study in the cohort system
  createdBy: string;
  createdDate: Date;
  lastUpdated: Date;
  updatedBy: string;
  startDate?: Date;
  endDate?: Date;
  unblindingDate?: Date;
  ethicsApprovalId?: string;
  randomizationParams: RandomizationParams;
  arms: StudyArm[];
  participants: BlindedParticipant[];
  roles: BlindedRole[];
  unblindingTriggers: UnblindingTrigger[];
  emergencyUnblindings: EmergencyUnblinding[];
  breaches: BlindingBreach[];
  auditLog: BlindingAuditLog[];
  dataPartitions: {
    id: string;
    name: string;
    description: string;
    accessRestrictions: string[];
  }[];
  metadataSchema: {
    fields: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date';
      visibleToBlinded: boolean;
    }[];
  };
  version: number;
}

/**
 * Parameters for creating a new double-blind study
 */
export interface DoubleBlindStudyCreationParams {
  name: string;
  description: string;
  blindingLevel: BlindingLevel;
  relatedStudyId: string;
  randomizationParams: RandomizationParams;
  arms: Omit<StudyArm, 'id'>[];
  ethicsApprovalId?: string;
  dataPartitions?: Omit<DoubleBlindStudy['dataPartitions'][0], 'id'>[];
  metadataSchema?: DoubleBlindStudy['metadataSchema'];
  unblindingTriggers?: Omit<UnblindingTrigger, 'id'>[];
}

/**
 * Filters for searching double-blind studies
 */
export interface DoubleBlindStudySearchFilters {
  status?: DoubleBlindStudyStatus | DoubleBlindStudyStatus[];
  blindingLevel?: BlindingLevel;
  createdBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  relatedStudyId?: string;
  keyword?: string;
}

/**
 * Study unblinding result
 */
export interface UnblindingResult {
  studyId: string;
  timestamp: Date;
  unblindedBy: string;
  reason: string;
  participantMappings: {
    blindedId: string;
    participantId: string;
    armId: string;
    armName: string;
  }[];
  reportUrl?: string;
}

/**
 * Blinding metrics for a study
 */
export interface BlindingIntegrityMetrics {
  studyId: string;
  calculatedDate: Date;
  integrityScore: number; // 0-100 score of blinding integrity
  potentialBreaches: number;
  confirmedBreaches: number;
  guessAccuracyByResearchers: number; // How accurately researchers guessed group assignments
  guessAccuracyByParticipants: number; // How accurately participants guessed their group
  dataSharingRisks: number; // Risk score for data sharing activities
  recommendedActions: string[];
}