/**
 * Data Access Service Interface
 * 
 * This service provides a unified interface for accessing data from the data lake,
 * with support for different data formats, schemas, and access patterns.
 */

import { DoubleBlindStudy, BlindingAuditLog } from '../../double-blind/models/study';
import { GrantProposal, FundingBody, FundingScheme } from '../../grant-proposals/models/proposal';

export interface DataAccessService {
  /**
   * Save a double-blind study to the data store
   * @param study The study to save
   * @returns Promise resolving when the operation completes
   */
  saveDoubleBlindStudy(study: DoubleBlindStudy): Promise<void>;

  /**
   * Update an existing double-blind study
   * @param study The updated study
   * @returns Promise resolving when the operation completes
   */
  updateDoubleBlindStudy(study: DoubleBlindStudy): Promise<void>;

  /**
   * Retrieve a double-blind study by ID
   * @param studyId ID of the study to retrieve
   * @returns Promise resolving to the study or null if not found
   */
  getDoubleBlindStudyById(studyId: string): Promise<DoubleBlindStudy | null>;

  /**
   * Search for double-blind studies based on filters
   * @param filters Search filters
   * @returns Promise resolving to an array of studies matching the filters
   */
  searchDoubleBlindStudies(filters: any): Promise<DoubleBlindStudy[]>;

  /**
   * Append an audit log entry to a double-blind study
   * @param studyId ID of the study
   * @param entry Audit log entry to append
   * @returns Promise resolving when the operation completes
   */
  appendDoubleBlindStudyAuditLog(studyId: string, entry: BlindingAuditLog): Promise<void>;

  /**
   * Store a block randomization sequence for a study
   * @param studyId ID of the study
   * @param blockNumber Block number
   * @param sequence The randomization sequence
   * @returns Promise resolving when the operation completes
   */
  storeBlockRandomizationSequence(studyId: string, blockNumber: number, sequence: string[]): Promise<void>;

  /**
   * Retrieve a block randomization sequence for a study
   * @param studyId ID of the study
   * @param blockNumber Block number
   * @returns The randomization sequence
   */
  getBlockRandomizationSequence(studyId: string, blockNumber: number): string[];

  /**
   * Store assignment counts for a stratum in a study
   * @param studyId ID of the study
   * @param stratumId Stratum identifier
   * @param counts Assignment counts per arm
   * @returns Promise resolving when the operation completes
   */
  storeStratumAssignmentCounts(studyId: string, stratumId: string, counts: Record<string, number>): Promise<void>;

  /**
   * Retrieve assignment counts for a stratum in a study
   * @param studyId ID of the study
   * @param stratumId Stratum identifier
   * @returns Assignment counts per arm, or null if not found
   */
  getStratumAssignmentCounts(studyId: string, stratumId: string): Record<string, number> | null;

  /**
   * Retrieve participant data
   * @param participantId ID of the participant
   * @returns Participant data
   */
  getParticipantData(participantId: string): Record<string, any>;

  /**
   * Get a single participant by ID
   * @param id The participant ID
   * @returns Promise resolving to the participant or null if not found
   */
  getParticipant(id: string): Promise<Record<string, any> | null>;

  /**
   * Get multiple participants by IDs
   * @param ids Array of participant IDs
   * @returns Promise resolving to an array of participants
   */
  getParticipants(ids: string[]): Promise<Record<string, any>[]>;

  /**
   * Query for participants based on criteria
   * @param criteria Query criteria
   * @param options Query options like pagination
   * @returns Promise resolving to participants matching the criteria
   */
  queryParticipants(criteria: any, options?: any): Promise<Record<string, any>[]>;

  /**
   * Export participant data in a specific format
   * @param participantIds IDs of participants to export
   * @param format Export format
   * @param fields Fields to include in export
   * @returns Promise resolving to export data
   */
  exportParticipantData(
    participantIds: string[],
    format: 'csv' | 'json' | 'xlsx',
    fields?: string[]
  ): Promise<any>;

  /**
   * Save a grant proposal to the data store
   * @param proposal The proposal to save
   * @returns Promise resolving when the operation completes
   */
  saveProposal(proposal: GrantProposal): Promise<void>;

  /**
   * Retrieve a grant proposal by ID
   * @param proposalId ID of the proposal to retrieve
   * @returns Promise resolving to the proposal or null if not found
   */
  getProposal(proposalId: string): Promise<GrantProposal | null>;

  /**
   * Delete a grant proposal
   * @param proposalId ID of the proposal to delete
   * @returns Promise resolving when the operation completes
   */
  deleteProposal(proposalId: string): Promise<void>;

  /**
   * Search for grant proposals based on filters
   * @param filters Search filters
   * @returns Promise resolving to an array of proposals matching the filters
   */
  searchProposals(filters: any): Promise<GrantProposal[]>;

  /**
   * Retrieve a funding body by ID
   * @param fundingBodyId ID of the funding body to retrieve
   * @returns Promise resolving to the funding body or null if not found
   */
  getFundingBody(fundingBodyId: string): Promise<FundingBody | null>;

  /**
   * Retrieve a funding scheme by ID
   * @param fundingSchemeId ID of the funding scheme to retrieve
   * @returns Promise resolving to the funding scheme or null if not found
   */
  getFundingScheme(fundingSchemeId: string): Promise<FundingScheme | null>;

  /**
   * Search for funding schemes based on filters
   * @param filters Search filters
   * @returns Promise resolving to an array of funding schemes matching the filters
   */
  searchFundingSchemes(filters: any): Promise<FundingScheme[]>;
}