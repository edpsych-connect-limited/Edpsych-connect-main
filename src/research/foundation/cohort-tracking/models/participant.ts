/**
 * Models related to research participants in the EdPsych Research Foundation
 */

/**
 * UK Academic Year representation
 */
export enum UKAcademicYear {
  RECEPTION = 'Reception',
  YEAR_1 = 'Year 1',
  YEAR_2 = 'Year 2',
  YEAR_3 = 'Year 3',
  YEAR_4 = 'Year 4',
  YEAR_5 = 'Year 5',
  YEAR_6 = 'Year 6',
  YEAR_7 = 'Year 7',
  YEAR_8 = 'Year 8',
  YEAR_9 = 'Year 9',
  YEAR_10 = 'Year 10',
  YEAR_11 = 'Year 11',
  YEAR_12 = 'Year 12',
  YEAR_13 = 'Year 13'
}

/**
 * Special Educational Needs (SEN) provision types in UK education
 */
export enum SENProvision {
  NO_SPECIAL_PROVISION = 'N',
  SEN_SUPPORT = 'K',
  EDUCATION_HEALTH_CARE_PLAN = 'E',
  STATEMENT = 'S',  // Legacy, being phased out by EHC plans
}

/**
 * Consent status enum for GDPR compliance
 */
export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

/**
 * English as an Additional Language (EAL) stages
 */
export enum EALStage {
  NEW_TO_ENGLISH = 'A',
  EARLY_ACQUISITION = 'B',
  DEVELOPING_COMPETENCE = 'C',
  COMPETENT = 'D',
  FLUENT = 'E',
  NOT_APPLICABLE = 'N'
}

/**
 * Consent details tracking for GDPR compliance
 */
export interface ConsentDetails {
  consentType: string;
  status: ConsentStatus;
  dateProvided?: Date;
  dateWithdrawn?: Date;
  dateExpires?: Date;
  consentVersion: string;
  consentProvidedBy?: string;
  consentMethod: 'electronic' | 'paper' | 'verbal';
  consentVerificationId?: string;
  consentDocumentUrl?: string;
  consentNotes?: string;
}

/**
 * Participant educational context in UK education system
 */
export interface EducationalContext {
  id?: string;
  schoolUrn?: string;  // Unique Reference Number for UK schools
  academicYear?: UKAcademicYear;
  yearGroup?: string;
  classGroups?: string[];
  senProvision?: SENProvision;
  senCategory?: string[];
  fsm?: boolean;  // Free School Meals eligibility
  pupilPremium?: boolean;
  eal?: boolean;  // English as Additional Language
  ealStage?: EALStage;
  lookAfterChild?: boolean;  // "Looked After Child" status
  startDate?: Date;
  endDate?: Date;
}

/**
 * Anonymized demographic information
 */
export interface Demographics {
  ageGroup: string;
  gender?: string;
  ethnicGroup?: string;
  regionCode?: string;
  imdDecile?: number;  // Index of Multiple Deprivation (UK)
  ruralUrbanClassification?: string;
  languageGroup?: string;
  postcodeSector?: string;  // First part of postcode only for area stats
}

/**
 * Pseudonymized academic performance metrics
 */
export interface AcademicPerformance {
  assessmentId: string;
  dateRecorded: Date;
  scores: Record<string, number>;
  standardizedScores?: Record<string, number>;
  percentiles?: Record<string, number>;
  teacherAssessments?: Record<string, string>;
  progressMeasures?: Record<string, number>;
}

/**
 * Main participant entity with pseudonymized identifiers
 */
export interface Participant {
  id: string;  // Pseudonymized ID
  researchId: string;  // Secondary research identifier
  reference?: string;  // Optional reference code
  creationDate: Date;
  lastUpdated: Date;
  educationalContext?: EducationalContext;
  demographics?: Demographics;
  academicPerformance?: AcademicPerformance[];
  consents: ConsentDetails[];
  participationHistory: string[];  // IDs of studies/cohorts
  dataSourceIds: Record<string, string>;  // Maps source systems to their IDs
  metadata: Record<string, any>;  // Additional metadata
  dataRetentionDate?: Date;
  pseudonymizationLevel: 'full' | 'partial' | 'identifiable';
  dataAccessLevel: 'restricted' | 'anonymized' | 'identifiable';
}

/**
 * Parameters for creating a new participant
 */
export interface ParticipantCreationParams {
  reference?: string;
  educationalContext?: EducationalContext;
  demographics?: Demographics;
  academicPerformance?: AcademicPerformance[];
  consents: ConsentDetails[];
  dataSourceIds?: Record<string, string>;
  metadata?: Record<string, any>;
  pseudonymizationLevel?: 'full' | 'partial' | 'identifiable';
  dataAccessLevel?: 'restricted' | 'anonymized' | 'identifiable';
  dataRetentionPeriod?: number;  // In months
}

/**
 * Parameters for updating an existing participant
 */
export interface ParticipantUpdateParams {
  reference?: string;
  educationalContext?: EducationalContext;
  demographics?: Demographics;
  academicPerformance?: AcademicPerformance[];
  consents?: ConsentDetails[];
  dataSourceIds?: Record<string, string>;
  metadata?: Record<string, any>;
  pseudonymizationLevel?: 'full' | 'partial' | 'identifiable';
  dataAccessLevel?: 'restricted' | 'anonymized' | 'identifiable';
  dataRetentionDate?: Date;
}

/**
 * Participant search filters for querying participants
 */
export interface ParticipantSearchFilters {
  academicYear?: UKAcademicYear;
  id?: string;
  schoolUrn?: string;
  senProvision?: SENProvision;
  fsm?: boolean;
  pupilPremium?: boolean;
  eal?: boolean;
  lookAfterChild?: boolean;
  ageGroup?: string;
  gender?: string;
  ethnicGroup?: string;
  regionCode?: string;
  imdDecile?: number;
  consentStatus?: ConsentStatus;
  participatedInStudy?: string;
  participatedInCohort?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  hasValidConsent?: boolean;
  minPerformanceScore?: Record<string, number>;
}