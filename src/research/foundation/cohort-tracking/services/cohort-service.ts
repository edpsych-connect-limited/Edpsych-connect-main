/**
 * Cohort Service Interface
 * 
 * This service provides functionality for managing research cohorts and participants,
 * tracking their data, and supporting research study operations.
 */

export interface CohortService {
  /**
   * Get a research study by ID
   * @param studyId ID of the study to retrieve
   * @returns Promise resolving to the study or null if not found
   */
  getStudyById(studyId: string): Promise<any | null>;

  /**
   * Get a participant by ID
   * @param participantId ID of the participant to retrieve
   * @returns Promise resolving to the participant or null if not found
   */
  getParticipantById(participantId: string): Promise<any | null>;

  /**
   * Get participant data for a specific participant
   * @param participantId ID of the participant
   * @returns Participant data as a record of key-value pairs
   */
  getParticipantData(participantId: string): Promise<Record<string, any>>;

  /**
   * Create a new research study
   * @param study Study details
   * @param id ID of the user creating the study
   * @returns Promise resolving to the created study
   */
  createStudy(study: any, id: string): Promise<any>;

  /**
   * Update an existing research study
   * @param studyId ID of the study to update
   * @param updates Fields to update
   * @param id ID of the user making the update
   * @returns Promise resolving to the updated study
   */
  updateStudy(studyId: string, updates: any, id: string): Promise<any>;

  /**
   * Add a participant to a study
   * @param studyId ID of the study
   * @param participant Participant details
   * @param id ID of the user adding the participant
   * @returns Promise resolving to the added participant
   */
  addParticipant(studyId: string, participant: any, id: string): Promise<any>;

  /**
   * Remove a participant from a study
   * @param studyId ID of the study
   * @param participantId ID of the participant to remove
   * @param reason Reason for removal
   * @param id ID of the user removing the participant
   * @returns Promise resolving when the operation completes
   */
  removeParticipant(studyId: string, participantId: string, reason: string, id: string): Promise<void>;

  /**
   * Add data for a participant
   * @param participantId ID of the participant
   * @param dataType Type of data
   * @param data The data to add
   * @param id ID of the user adding the data
   * @returns Promise resolving to the data entry ID
   */
  addParticipantData(participantId: string, dataType: string, data: any, id: string): Promise<string>;

  /**
   * Query participants based on criteria
   * @param criteria Query criteria
   * @returns Promise resolving to participants matching the criteria
   */
  queryParticipants(criteria: any): Promise<any[]>;

  /**
   * Get cohort statistics
   * @param cohortId ID of the cohort
   * @param metrics Metrics to calculate
   * @returns Promise resolving to cohort statistics
   */
  getCohortStatistics(cohortId: string, metrics: string[]): Promise<Record<string, any>>;

  /**
   * Export cohort data
   * @param cohortId ID of the cohort
   * @param format Export format
   * @param options Export options
   * @returns Promise resolving to export URL
   */
  exportCohortData(
    cohortId: string,
    format: 'csv' | 'json' | 'xlsx',
    options?: any
  ): Promise<string>;

  /**
   * Create a new cohort from a query
   * @param name Cohort name
   * @param description Cohort description
   * @param query Query to define the cohort
   * @param id ID of the user creating the cohort
   * @returns Promise resolving to the created cohort
   */
  createCohortFromQuery(
    name: string,
    description: string,
    query: any,
    id: string
  ): Promise<any>;

  /**
   * Merge multiple cohorts
   * @param name Name for the merged cohort
   * @param description Description for the merged cohort
   * @param cohortIds IDs of cohorts to merge
   * @param mergeStrategy Strategy to use when merging
   * @param id ID of the user performing the merge
   * @returns Promise resolving to the merged cohort
   */
  mergeCohorts(
    name: string,
    description: string,
    cohortIds: string[],
    mergeStrategy: 'union' | 'intersection' | 'difference',
    id: string
  ): Promise<any>;

  /**
   * Track a participant action or event
   * @param participantId ID of the participant
   * @param eventType Type of event
   * @param eventData Event data
   * @returns Promise resolving when the operation completes
   */
  trackParticipantEvent(
    participantId: string,
    eventType: string,
    eventData: any
  ): Promise<void>;
}