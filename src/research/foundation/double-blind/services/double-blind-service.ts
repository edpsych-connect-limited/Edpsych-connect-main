/**
 * Double-Blind Study Service
 * 
 * This service handles the core functionality for creating and managing double-blind studies
 * in the EdPsych Research Foundation, providing mechanisms to ensure research integrity
 * through proper blinding procedures.
 */

import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

import {
  DoubleBlindStudy,
  DoubleBlindStudyCreationParams,
  DoubleBlindStudyStatus,
  AssignmentStrategy,
  StudyArm,
  BlindedParticipant,
  BlindedRole,
  EmergencyUnblinding,
  BlindingBreach,
  BlindingAuditLog,
  DoubleBlindStudySearchFilters,
  UnblindingResult,
  BlindingIntegrityMetrics,
  BreachType,
  RandomizationParams
} from '../models/study';

import { DataAccessService } from '../../data-lake/services/data-access-service';
import { GovernanceService } from '../../governance/services/governance-service';
import { EventBusService } from '../../shared/services/event-bus';
import { CohortService } from '../../cohort-tracking/services/cohort-service';
import { LoggingService } from '../../shared/services/logging-service';
import { NotificationService } from '../../shared/services/notification-service';

/**
 * Error types specific to the double-blind service
 */
export enum DoubleBlindErrorType {
  INVALID_STUDY_STATE = 'invalid_study_state',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  INVALID_RANDOMIZATION_PARAMS = 'invalid_randomization_params',
  BLINDING_BREACH = 'blinding_breach',
  PARTICIPANT_NOT_FOUND = 'participant_not_found',
  EMERGENCY_UNBLIND_DENIED = 'emergency_unblind_denied',
  INVALID_OPERATION = 'invalid_operation',
  INTEGRITY_VIOLATION = 'integrity_violation'
}

/**
 * Custom error class for double-blind operations
 */
export class DoubleBlindError extends Error {
  constructor(
    public type: DoubleBlindErrorType,
    message: string,
    public studyId?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DoubleBlindError';
  }
}

/**
 * Service for managing double-blind studies
 */
export class DoubleBlindService {
  constructor(
    private dataAccessService: DataAccessService,
    private governanceService: GovernanceService,
    private cohortService: CohortService,
    private eventBus: EventBusService,
    private loggingService: LoggingService,
    private notificationService: NotificationService
  ) {}

  /**
   * Creates a new double-blind study
   * @param params Creation parameters for the study
   * @param id ID of the user creating the study
   * @returns The created study
   */
  async createStudy(params: DoubleBlindStudyCreationParams, id: string): Promise<DoubleBlindStudy> {
    // Validate ethics approval if required by governance
    if (this.governanceService.isEthicsApprovalRequired('double_blind_study')) {
      if (!params.ethicsApprovalId) {
        throw new DoubleBlindError(
          DoubleBlindErrorType.INVALID_OPERATION,
          'Ethics approval ID is required for double-blind studies',
          undefined,
          { id }
        );
      }
      
      const isValid = await this.governanceService.validateEthicsApproval(params.ethicsApprovalId);
      if (!isValid) {
        throw new DoubleBlindError(
          DoubleBlindErrorType.INVALID_OPERATION,
          'Invalid ethics approval ID',
          undefined,
          { ethicsApprovalId: params.ethicsApprovalId }
        );
      }
    }

    // Validate the related study exists
    const relatedStudy = await this.cohortService.getStudyById(params.relatedStudyId);
    if (!relatedStudy) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        'Related study not found',
        undefined,
        { relatedStudyId: params.relatedStudyId }
      );
    }

    // Validate randomization parameters
    this.validateRandomizationParams(params.randomizationParams);

    // Create the study
    const now = new Date();
    const study: DoubleBlindStudy = {
      id: uuidv4(),
      name: params.name,
      description: params.description,
      blindingLevel: params.blindingLevel,
      relatedStudyId: params.relatedStudyId,
      status: DoubleBlindStudyStatus.SETUP,
      createdBy: id,
      createdDate: now,
      lastUpdated: now,
      updatedBy: id,
      ethicsApprovalId: params.ethicsApprovalId,
      randomizationParams: params.randomizationParams,
      arms: params.arms.map(arm => ({
        ...arm,
        id: uuidv4(),
        internalCode: crypto.randomBytes(16).toString('hex') // Generate a random code for internal use
      })),
      participants: [],
      roles: [],
      unblindingTriggers: params.unblindingTriggers?.map(trigger => ({
        ...trigger,
        id: uuidv4()
      })) || [],
      emergencyUnblindings: [],
      breaches: [],
      auditLog: [
        {
          id: uuidv4(),
          studyId: '', // Will be set after study ID is created
          timestamp: now,
          action: 'study_created',
          performedBy: id,
          details: { params: { ...params, ethicsApprovalId: params.ethicsApprovalId } },
          systemGenerated: true
        }
      ],
      dataPartitions: params.dataPartitions?.map(partition => ({
        ...partition,
        id: uuidv4()
      })) || [],
      metadataSchema: params.metadataSchema || {
        fields: [
          {
            name: 'studyName',
            type: 'string',
            visibleToBlinded: true
          },
          {
            name: 'startDate',
            type: 'date',
            visibleToBlinded: true
          }
        ]
      },
      version: 1
    };

    // Set the study ID in the audit log
    study.auditLog[0].studyId = study.id;

    // Register with governance service
    await this.governanceService.registerResearchObject({
      id: study.id,
      type: 'double_blind_study',
      name: study.name,
      description: study.description,
      createdBy: id,
      createdDate: now,
      relatedObjects: [
        {
          id: params.relatedStudyId,
          type: 'research_study',
          relationship: 'parent'
        }
      ],
      ethicsApprovalId: params.ethicsApprovalId
    });

    // Add the creator as a role
    const creatorRole: BlindedRole = {
      id: uuidv4(),
      userId: id,
      studyId: study.id,
      role: 'principal_investigator',
      accessLevel: 'full_access',
      dataPartitions: study.dataPartitions.map(p => p.id),
      canUnblind: true,
      unblindingApprovalRequired: false
    };
    study.roles.push(creatorRole);

    // Save to data store
    await this.dataAccessService.saveDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-study-created', {
      studyId: study.id,
      id,
      timestamp: now
    });

    // Log the creation
    this.loggingService.log('info', 'Double-blind study created', {
      studyId: study.id,
      id,
      blindingLevel: study.blindingLevel
    });

    return study;
  }

  /**
   * Retrieves a double-blind study by ID
   * @param studyId ID of the study to retrieve
   * @param id ID of the user making the request
   * @param includeBlindedData Whether to include data that may be blinded
   * @returns The requested study with appropriate blinding applied
   */
  async getStudyById(studyId: string, id: string, includeBlindedData = false): Promise<DoubleBlindStudy> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have access to this study',
        studyId,
        { id }
      );
    }

    // Log the access
    this.loggingService.log('info', 'Double-blind study accessed', {
      studyId,
      id,
      includeBlindedData
    });

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: new Date(),
      action: 'study_accessed',
      performedBy: id,
      details: { includeBlindedData },
      systemGenerated: true
    };
    
    // Add audit log entry
    await this.appendAuditLog(studyId, auditEntry);

    // Apply blinding based on user role if blinded data not explicitly requested
    if (!includeBlindedData && userRole.accessLevel !== 'full_access') {
      return this.applyBlinding(study, userRole);
    }

    return study;
  }

  /**
   * Searches for double-blind studies based on filters
   * @param filters Search filters
   * @param id ID of the user making the request
   * @returns List of studies matching the filters
   */
  async searchStudies(
    filters: DoubleBlindStudySearchFilters,
    id: string
  ): Promise<DoubleBlindStudy[]> {
    const studies = await this.dataAccessService.searchDoubleBlindStudies(filters);
    
    // Filter studies based on user permissions
    const accessibleStudies: DoubleBlindStudy[] = [];
    
    for (const study of studies) {
      const userRole = study.roles.find(role => role.id === id);
      if (userRole) {
        // Apply blinding based on user role
        if (userRole.accessLevel !== 'full_access') {
          accessibleStudies.push(this.applyBlinding(study, userRole));
        } else {
          accessibleStudies.push(study);
        }
      }
    }
    
    return accessibleStudies;
  }

  /**
   * Updates a double-blind study
   * @param studyId ID of the study to update
   * @param updates Fields to update
   * @param id ID of the user making the update
   * @returns The updated study
   */
  async updateStudy(
    studyId: string,
    updates: Partial<DoubleBlindStudy>,
    id: string
  ): Promise<DoubleBlindStudy> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to update this study',
        studyId,
        { id }
      );
    }

    // Check if study is in a state that allows updates
    if (study.status !== DoubleBlindStudyStatus.SETUP) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_STUDY_STATE,
        'Study can only be updated in SETUP state',
        studyId,
        { currentStatus: study.status }
      );
    }

    // Fields that cannot be updated directly
    const protectedFields = [
      'id', 'createdBy', 'createdDate', 'version', 
      'auditLog', 'participants', 'emergencyUnblindings', 
      'breaches'
    ];

    // Create updated study object
    const updatedStudy: DoubleBlindStudy = {
      ...study,
      ...Object.fromEntries(
        Object.entries(updates).filter(([key]) => !protectedFields.includes(key))
      ),
      lastUpdated: new Date(),
      updatedBy: id,
      version: study.version + 1
    };

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: updatedStudy.lastUpdated,
      action: 'study_updated',
      performedBy: id,
      details: { updates: Object.fromEntries(
        Object.entries(updates).filter(([key]) => !protectedFields.includes(key))
      )},
      systemGenerated: true
    };
    
    // Add audit log entry
    updatedStudy.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(updatedStudy);

    // Emit event
    this.eventBus.emit('double-blind-study-updated', {
      studyId,
      id,
      timestamp: updatedStudy.lastUpdated
    });

    return updatedStudy;
  }

  /**
   * Activates a double-blind study, transitioning it from SETUP to ACTIVE
   * @param studyId ID of the study to activate
   * @param id ID of the user activating the study
   * @returns The activated study
   */
  async activateStudy(studyId: string, id: string): Promise<DoubleBlindStudy> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to activate this study',
        studyId,
        { id }
      );
    }

    // Check if study is in correct state
    if (study.status !== DoubleBlindStudyStatus.SETUP) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_STUDY_STATE,
        'Study must be in SETUP state to be activated',
        studyId,
        { currentStatus: study.status }
      );
    }

    // Check if study has required components
    if (study.arms.length === 0) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        'Study must have at least one arm before activation',
        studyId
      );
    }

    const now = new Date();
    const updatedStudy: DoubleBlindStudy = {
      ...study,
      status: DoubleBlindStudyStatus.ACTIVE,
      startDate: now,
      lastUpdated: now,
      updatedBy: id,
      version: study.version + 1
    };

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'study_activated',
      performedBy: id,
      details: { startDate: now },
      systemGenerated: true
    };
    
    // Add audit log entry
    updatedStudy.auditLog.push(auditEntry);

    // Update governance status
    await this.governanceService.updateResearchObjectStatus(studyId, 'active');

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(updatedStudy);

    // Emit event
    this.eventBus.emit('double-blind-study-activated', {
      studyId,
      id,
      timestamp: now
    });

    // Send notifications to all study personnel
    for (const role of study.roles) {
      await this.notificationService.sendNotification(
        role.id,
        'study_activated',
        `The double-blind study "${study.name}" has been activated`,
        {
          studyId,
          studyName: study.name,
          activatedBy: id,
          activationDate: now
        }
      );
    }

    return updatedStudy;
  }

  /**
   * Adds a participant to a double-blind study and assigns them to a study arm
   * @param studyId ID of the study
   * @param participantId ID of the participant to add
   * @param dataPartitions Data partitions the participant belongs to
   * @param id ID of the user adding the participant
   * @returns The updated study
   */
  async addParticipant(
    studyId: string,
    participantId: string,
    dataPartitions: string[],
    id: string
  ): Promise<BlindedParticipant> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to add participants to this study',
        studyId,
        { id }
      );
    }

    // Check if study is in correct state
    if (study.status !== DoubleBlindStudyStatus.SETUP && study.status !== DoubleBlindStudyStatus.ACTIVE) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_STUDY_STATE,
        'Participants can only be added when study is in SETUP or ACTIVE state',
        studyId,
        { currentStatus: study.status }
      );
    }

    // Check if participant exists in the cohort
    const participant = await this.cohortService.getParticipantById(participantId);
    if (!participant) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.PARTICIPANT_NOT_FOUND,
        `Participant with ID ${participantId} not found in cohort`,
        studyId,
        { participantId }
      );
    }

    // Check if participant is already in the study
    if (study.participants.some(p => p.participantId === participantId)) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        `Participant with ID ${participantId} is already enrolled in this study`,
        studyId,
        { participantId }
      );
    }

    // Assign participant to an arm based on randomization strategy
    const armId = await this.assignParticipantToArm(study, participantId);

    // Create blinded participant
    const now = new Date();
    const blindedParticipant: BlindedParticipant = {
      id: uuidv4(),
      participantId,
      blindedId: `B-${crypto.randomBytes(8).toString('hex')}`, // Generate a random blinded ID
      armId,
      enrollmentDate: now,
      dataPartitions
    };

    // Update study with new participant
    study.participants.push(blindedParticipant);
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'participant_added',
      performedBy: id,
      details: {
        blindedId: blindedParticipant.blindedId,
        armId: blindedParticipant.armId,
        dataPartitions
      },
      affectedParticipants: [participantId],
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-participant-added', {
      studyId,
      blindedParticipantId: blindedParticipant.id,
      id,
      timestamp: now
    });

    return blindedParticipant;
  }

  /**
   * Removes a participant from a double-blind study
   * @param studyId ID of the study
   * @param participantId ID of the participant to remove
   * @param reason Reason for removal
   * @param id ID of the user removing the participant
   * @returns The updated study
   */
  async removeParticipant(
    studyId: string,
    participantId: string,
    reason: string,
    id: string
  ): Promise<DoubleBlindStudy> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to remove participants from this study',
        studyId,
        { id }
      );
    }

    // Find participant
    const participantIndex = study.participants.findIndex(p => p.participantId === participantId);
    if (participantIndex === -1) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.PARTICIPANT_NOT_FOUND,
        `Participant with ID ${participantId} not found in this study`,
        studyId,
        { participantId }
      );
    }

    const now = new Date();
    const participant = study.participants[participantIndex];
    
    // Update withdrawal information
    participant.withdrawalDate = now;
    participant.withdrawalReason = reason;
    
    // Update study
    study.participants[participantIndex] = participant;
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'participant_removed',
      performedBy: id,
      details: {
        blindedId: participant.blindedId,
        withdrawalReason: reason
      },
      affectedParticipants: [participantId],
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-participant-removed', {
      studyId,
      blindedParticipantId: participant.id,
      id,
      timestamp: now,
      reason
    });

    return study;
  }

  /**
   * Adds a user role to a double-blind study
   * @param studyId ID of the study
   * @param role Role to add
   * @param id ID of the user adding the role
   * @returns The added role
   */
  async addRole(
    studyId: string,
    role: Omit<BlindedRole, 'id' | 'studyId'>,
    id: string
  ): Promise<BlindedRole> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to add roles to this study',
        studyId,
        { id }
      );
    }

    // Check if user already has a role
    if (study.roles.some(r => r.userId === role.userId)) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        `User with ID ${role.userId} already has a role in this study`,
        studyId,
        { roleUserId: role.userId }
      );
    }

    // Create new role
    const now = new Date();
    const newRole: BlindedRole = {
      id: uuidv4(),
      studyId,
      ...role
    };

    // Update study with new role
    study.roles.push(newRole);
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'role_added',
      performedBy: id,
      details: {
        roleId: newRole.id,
        roleUserId: newRole.userId,
        roleType: newRole.role,
        accessLevel: newRole.accessLevel
      },
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-role-added', {
      studyId,
      roleId: newRole.id,
      id,
      timestamp: now
    });

    // Notify the user about their role
    await this.notificationService.sendNotification(
      newRole.userId,
      'role_assigned',
      `You have been assigned a role in the double-blind study "${study.name}"`,
      {
        studyId,
        studyName: study.name,
        role: newRole.role,
        accessLevel: newRole.accessLevel,
        assignedBy: id
      }
    );

    return newRole;
  }

  /**
   * Updates a user role in a double-blind study
   * @param studyId ID of the study
   * @param roleId ID of the role to update
   * @param updates Fields to update
   * @param id ID of the user updating the role
   * @returns The updated role
   */
  async updateRole(
    studyId: string,
    roleId: string,
    updates: Partial<BlindedRole>,
    id: string
  ): Promise<BlindedRole> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to update roles in this study',
        studyId,
        { id }
      );
    }

    // Find role to update
    const roleIndex = study.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        `Role with ID ${roleId} not found in this study`,
        studyId,
        { roleId }
      );
    }

    // Fields that cannot be updated
    const protectedFields = ['id', 'studyId', 'userId'];

    // Create updated role
    const now = new Date();
    const currentRole = study.roles[roleIndex];
    const updatedRole: BlindedRole = {
      ...currentRole,
      ...Object.fromEntries(
        Object.entries(updates).filter(([key]) => !protectedFields.includes(key))
      )
    };

    // Update study with updated role
    study.roles[roleIndex] = updatedRole;
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'role_updated',
      performedBy: id,
      details: {
        roleId,
        updates: Object.fromEntries(
          Object.entries(updates).filter(([key]) => !protectedFields.includes(key))
        )
      },
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-role-updated', {
      studyId,
      roleId,
      id,
      timestamp: now
    });

    // Notify the user about their updated role
    await this.notificationService.sendNotification(
      updatedRole.userId,
      'role_updated',
      `Your role in the double-blind study "${study.name}" has been updated`,
      {
        studyId,
        studyName: study.name,
        role: updatedRole.role,
        accessLevel: updatedRole.accessLevel,
        updatedBy: id
      }
    );

    return updatedRole;
  }

  /**
   * Removes a user role from a double-blind study
   * @param studyId ID of the study
   * @param roleId ID of the role to remove
   * @param id ID of the user removing the role
   * @returns The updated study
   */
  async removeRole(
    studyId: string,
    roleId: string,
    id: string
  ): Promise<DoubleBlindStudy> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to remove roles from this study',
        studyId,
        { id }
      );
    }

    // Find role to remove
    const roleIndex = study.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        `Role with ID ${roleId} not found in this study`,
        studyId,
        { roleId }
      );
    }

    // Check if it's the last full access role
    const roleToRemove = study.roles[roleIndex];
    const fullAccessRoles = study.roles.filter(r => r.accessLevel === 'full_access');
    if (fullAccessRoles.length === 1 && fullAccessRoles[0].id === roleId) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        'Cannot remove the last full access role from the study',
        studyId,
        { roleId }
      );
    }

    // Remove role
    const now = new Date();
    study.roles.splice(roleIndex, 1);
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'role_removed',
      performedBy: id,
      details: {
        roleId,
        roleUserId: roleToRemove.userId,
        roleType: roleToRemove.role
      },
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-role-removed', {
      studyId,
      roleId,
      id,
      timestamp: now
    });

    // Notify the user about their role removal
    await this.notificationService.sendNotification(
      roleToRemove.userId,
      'role_removed',
      `Your role in the double-blind study "${study.name}" has been removed`,
      {
        studyId,
        studyName: study.name,
        removedBy: id
      }
    );

    return study;
  }

  /**
   * Registers a blinding breach in the study
   * @param studyId ID of the study
   * @param breach Breach details
   * @param id ID of the user registering the breach
   * @returns The registered breach
   */
  async registerBreach(
    studyId: string,
    breach: Omit<BlindingBreach, 'id' | 'studyId' | 'reportedBy' | 'reportDate'>,
    id: string
  ): Promise<BlindingBreach> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions (any role can report a breach)
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have access to this study',
        studyId,
        { id }
      );
    }

    // Create breach record
    const now = new Date();
    const newBreach: BlindingBreach = {
      id: uuidv4(),
      studyId,
      reportedBy: id,
      reportDate: now,
      ...breach
    };

    // Update study with new breach
    study.breaches.push(newBreach);
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'breach_registered',
      performedBy: id,
      details: {
        breachId: newBreach.id,
        breachType: newBreach.type,
        severityLevel: newBreach.severityLevel
      },
      affectedParticipants: newBreach.affectedParticipants,
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-breach-registered', {
      studyId,
      breachId: newBreach.id,
      id,
      timestamp: now,
      severityLevel: newBreach.severityLevel
    });

    // For critical breaches, notify all full access users
    if (newBreach.severityLevel === 'critical') {
      const fullAccessUsers = study.roles
        .filter(r => r.accessLevel === 'full_access')
        .map(r => r.id);
      
      for (const fullAccessUser of fullAccessUsers) {
        await this.notificationService.sendNotification(
          fullAccessUser,
          'critical_breach',
          `A critical blinding breach has been reported in the study "${study.name}"`,
          {
            studyId,
            studyName: study.name,
            breachId: newBreach.id,
            breachType: newBreach.type,
            reportedBy: id
          }
        );
      }
    }

    return newBreach;
  }

  /**
   * Requests an emergency unblinding for a participant
   * @param studyId ID of the study
   * @param participantId ID of the participant to unblind
   * @param reason Reason for the emergency unblinding
   * @param id ID of the user requesting the unblinding
   * @returns The emergency unblinding request
   */
  async requestEmergencyUnblinding(
    studyId: string,
    participantId: string,
    reason: string,
    id: string
  ): Promise<EmergencyUnblinding> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.userId === id);
    if (!userRole) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have access to this study',
        studyId,
        { id }
      );
    }

    // Find participant
    const participant = study.participants.find(p => p.participantId === participantId);
    if (!participant) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.PARTICIPANT_NOT_FOUND,
        `Participant with ID ${participantId} not found in this study`,
        studyId,
        { participantId }
      );
    }

    // Create emergency unblinding request
    const now = new Date();
    const request: EmergencyUnblinding = {
      id: uuidv4(),
      studyId,
      participantId,
      requestedBy: id,
      requestDate: now,
      reason,
      approved: false // Default to unapproved
    };

    // Auto-approve if the user has unblinding permission and doesn't require approval
    if (userRole.canUnblind && !userRole.unblindingApprovalRequired) {
      request.approved = true;
      request.approvedBy = id;
      request.approvalDate = now;
    }

    // Update study with new request
    study.emergencyUnblindings.push(request);
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'emergency_unblinding_requested',
      performedBy: id,
      details: {
        requestId: request.id,
        autoApproved: request.approved,
        reason
      },
      affectedParticipants: [participantId],
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-emergency-unblinding-requested', {
      studyId,
      requestId: request.id,
      participantId,
      id,
      timestamp: now,
      approved: request.approved
    });

    // If auto-approved, register a breach
    if (request.approved) {
      await this.registerBreach(
        studyId,
        {
          timestamp: now,
          type: BreachType.EMERGENCY_UNBLINDING,
          description: `Emergency unblinding for participant ${participantId}: ${reason}`,
          affectedParticipants: [participantId],
          affectedResearchers: [id],
          severityLevel: 'high',
          mitigationSteps: 'Limit exposure of unblinded information to only those who need to know.'
        },
        id
      );
    } else {
      // Notify approvers if not auto-approved
      const approvers = userRole.approvers || 
        study.roles
          .filter(r => r.canUnblind && r.accessLevel === 'full_access')
          .map(r => r.id);
      
      for (const approver of approvers) {
        await this.notificationService.sendNotification(
          approver,
          'unblinding_approval_needed',
          `An emergency unblinding request requires your approval in study "${study.name}"`,
          {
            studyId,
            studyName: study.name,
            requestId: request.id,
            requestedBy: id,
            participantId,
            reason
          }
        );
      }
    }

    return request;
  }

  /**
   * Approves or denies an emergency unblinding request
   * @param studyId ID of the study
   * @param requestId ID of the unblinding request
   * @param approved Whether to approve or deny the request
   * @param denialReason Reason for denial (if denied)
   * @param id ID of the user making the decision
   * @returns The updated emergency unblinding request
   */
  async resolveEmergencyUnblinding(
    studyId: string,
    requestId: string,
    approved: boolean,
    denialReason: string | undefined,
    id: string
  ): Promise<EmergencyUnblinding> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.userId === id);
    if (!userRole || !userRole.canUnblind) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to approve/deny unblinding requests',
        studyId,
        { id }
      );
    }

    // Find request
    const requestIndex = study.emergencyUnblindings.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        `Unblinding request with ID ${requestId} not found in this study`,
        studyId,
        { requestId }
      );
    }

    const request = study.emergencyUnblindings[requestIndex];

    // Check if already resolved
    if (request.approved || request.denialReason) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_OPERATION,
        'This unblinding request has already been resolved',
        studyId,
        { requestId }
      );
    }

    // Update request
    const now = new Date();
    const updatedRequest: EmergencyUnblinding = {
      ...request,
      approved,
      approvedBy: approved ? id : undefined,
      approvalDate: approved ? now : undefined,
      denialReason: !approved ? denialReason : undefined
    };

    // Update study with updated request
    study.emergencyUnblindings[requestIndex] = updatedRequest;
    study.lastUpdated = now;
    study.updatedBy = id;
    study.version += 1;

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: approved ? 'emergency_unblinding_approved' : 'emergency_unblinding_denied',
      performedBy: id,
      details: {
        requestId,
        approved,
        denialReason
      },
      affectedParticipants: [request.participantId],
      systemGenerated: true
    };
    
    // Add audit log entry
    study.auditLog.push(auditEntry);

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(study);

    // Emit event
    this.eventBus.emit('double-blind-emergency-unblinding-resolved', {
      studyId,
      requestId,
      approved,
      id,
      timestamp: now
    });

    // If approved, register a breach
    if (approved) {
      await this.registerBreach(
        studyId,
        {
          timestamp: now,
          type: BreachType.EMERGENCY_UNBLINDING,
          description: `Emergency unblinding for participant ${request.participantId}: ${request.reason}`,
          affectedParticipants: [request.participantId],
          affectedResearchers: [request.requestedBy, id],
          severityLevel: 'high',
          mitigationSteps: 'Limit exposure of unblinded information to only those who need to know.'
        },
        id
      );
    }

    // Notify the requester
    await this.notificationService.sendNotification(
      request.requestedBy,
      approved ? 'unblinding_approved' : 'unblinding_denied',
      approved 
        ? `Your emergency unblinding request for study "${study.name}" has been approved`
        : `Your emergency unblinding request for study "${study.name}" has been denied`,
      {
        studyId,
        studyName: study.name,
        requestId,
        approved,
        denialReason,
        decidedBy: id
      }
    );

    return updatedRequest;
  }

  /**
   * Completes a double-blind study, transitioning it to COMPLETED status
   * @param studyId ID of the study to complete
   * @param id ID of the user completing the study
   * @returns The completed study
   */
  async completeStudy(studyId: string, id: string): Promise<DoubleBlindStudy> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.userId === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to complete this study',
        studyId,
        { id }
      );
    }

    // Check if study is in correct state
    if (study.status !== DoubleBlindStudyStatus.ACTIVE && study.status !== DoubleBlindStudyStatus.PAUSED) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_STUDY_STATE,
        'Study must be in ACTIVE or PAUSED state to be completed',
        studyId,
        { currentStatus: study.status }
      );
    }

    const now = new Date();
    const updatedStudy: DoubleBlindStudy = {
      ...study,
      status: DoubleBlindStudyStatus.COMPLETED,
      endDate: now,
      lastUpdated: now,
      updatedBy: id,
      version: study.version + 1
    };

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'study_completed',
      performedBy: id,
      details: { endDate: now },
      systemGenerated: true
    };
    
    // Add audit log entry
    updatedStudy.auditLog.push(auditEntry);

    // Update governance status
    await this.governanceService.updateResearchObjectStatus(studyId, 'completed');

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(updatedStudy);

    // Emit event
    this.eventBus.emit('double-blind-study-completed', {
      studyId,
      id,
      timestamp: now
    });

    // Send notifications to all study personnel
    for (const role of study.roles) {
      await this.notificationService.sendNotification(
        role.userId,
        'study_completed',
        `The double-blind study "${study.name}" has been marked as completed`,
        {
          studyId,
          studyName: study.name,
          completedBy: id,
          completionDate: now
        }
      );
    }

    return updatedStudy;
  }

  /**
   * Unblinds a completed study, revealing all group assignments
   * @param studyId ID of the study to unblind
   * @param reason Reason for unblinding
   * @param id ID of the user unblinding the study
   * @returns Unblinding result with participant mappings
   */
  async unblindStudy(
    studyId: string,
    reason: string,
    id: string
  ): Promise<UnblindingResult> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access' || !userRole.canUnblind) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to unblind this study',
        studyId,
        { id }
      );
    }

    // Check if study is in correct state
    if (study.status !== DoubleBlindStudyStatus.COMPLETED) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_STUDY_STATE,
        'Study must be in COMPLETED state to be unblinded',
        studyId,
        { currentStatus: study.status }
      );
    }

    const now = new Date();
    
    // Create participant mappings
    const participantMappings = study.participants.map(participant => {
      const arm = study.arms.find(a => a.id === participant.armId);
      return {
        blindedId: participant.blindedId,
        participantId: participant.participantId,
        armId: participant.armId,
        armName: arm ? arm.name : 'Unknown'
      };
    });

    // Create unblinding result
    const result: UnblindingResult = {
      studyId,
      timestamp: now,
      unblindedBy: id,
      reason,
      participantMappings
    };

    // Update study status
    const updatedStudy: DoubleBlindStudy = {
      ...study,
      status: DoubleBlindStudyStatus.UNBLINDED,
      unblindingDate: now,
      lastUpdated: now,
      updatedBy: id,
      version: study.version + 1
    };

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'study_unblinded',
      performedBy: id,
      details: {
        reason,
        participantCount: participantMappings.length
      },
      affectedParticipants: study.participants.map(p => p.participantId),
      systemGenerated: true
    };
    
    // Add audit log entry
    updatedStudy.auditLog.push(auditEntry);

    // Update governance status
    await this.governanceService.updateResearchObjectStatus(studyId, 'unblinded');

    // Generate unblinding report
    const reportUrl = await this.generateUnblindingReport(study, result, id);
    result.reportUrl = reportUrl;

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(updatedStudy);

    // Emit event
    this.eventBus.emit('double-blind-study-unblinded', {
      studyId,
      id,
      timestamp: now,
      reportUrl
    });

    // Send notifications to all study personnel
    for (const role of study.roles) {
      await this.notificationService.sendNotification(
        role.id,
        'study_unblinded',
        `The double-blind study "${study.name}" has been unblinded`,
        {
          studyId,
          studyName: study.name,
          unblindedBy: id,
          unblindingDate: now,
          reportUrl
        }
      );
    }

    return result;
  }

  /**
   * Gets the blinding integrity metrics for a study
   * @param studyId ID of the study
   * @param id ID of the user requesting the metrics
   * @returns Blinding integrity metrics
   */
  async getBlindingIntegrityMetrics(
    studyId: string,
    id: string
  ): Promise<BlindingIntegrityMetrics> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to access blinding integrity metrics',
        studyId,
        { id }
      );
    }

    // Calculate metrics
    const now = new Date();
    
    // Count breaches
    const confirmedBreaches = study.breaches.length;
    
    // Calculate potential breaches based on audit logs
    const potentialBreaches = this.calculatePotentialBreaches(study);
    
    // Calculate integrity score (0-100)
    // Higher is better, lower means more breaches or risks
    const baseScore = 100;
    const confirmedBreachPenalty = confirmedBreaches * 10; // Each confirmed breach reduces score by 10
    const potentialBreachPenalty = potentialBreaches * 2; // Each potential breach reduces score by 2
    
    // Additional penalties based on emergency unblindings
    const emergencyUnblindings = study.emergencyUnblindings.filter(u => u.approved).length;
    const emergencyUnblindingPenalty = emergencyUnblindings * 5;
    
    // Calculate final score
    let integrityScore = baseScore - confirmedBreachPenalty - potentialBreachPenalty - emergencyUnblindingPenalty;
    integrityScore = Math.max(0, Math.min(100, integrityScore)); // Ensure score is between 0-100
    
    // Calculate researcher guess accuracy (placeholder - would be from survey data in real system)
    // 50% would be random chance (no information), higher means breach of blinding
    const guessAccuracyByResearchers = 50; // Placeholder
    
    // Calculate participant guess accuracy (placeholder - would be from survey data in real system)
    const guessAccuracyByParticipants = 50; // Placeholder
    
    // Calculate data sharing risks based on access patterns
    const dataSharingRisks = this.calculateDataSharingRisks(study);
    
    // Generate recommended actions
    const recommendedActions = this.generateBlindingRecommendations(
      study, 
      integrityScore, 
      confirmedBreaches, 
      potentialBreaches,
      dataSharingRisks
    );

    // Create metrics object
    const metrics: BlindingIntegrityMetrics = {
      studyId,
      calculatedDate: now,
      integrityScore,
      potentialBreaches,
      confirmedBreaches,
      guessAccuracyByResearchers,
      guessAccuracyByParticipants,
      dataSharingRisks,
      recommendedActions
    };

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'integrity_metrics_accessed',
      performedBy: id,
      details: {
        integrityScore,
        confirmedBreaches,
        potentialBreaches
      },
      systemGenerated: true
    };
    
    // Add audit log entry
    await this.appendAuditLog(studyId, auditEntry);

    return metrics;
  }

  /**
   * Gets the audit log for a study
   * @param studyId ID of the study
   * @param id ID of the user requesting the audit log
   * @param filters Optional filters for the audit log
   * @returns Filtered audit log entries
   */
  async getAuditLog(
    studyId: string,
    id: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      actions?: string[];
      userIds?: string[];
    }
  ): Promise<BlindingAuditLog[]> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to access the audit log',
        studyId,
        { id }
      );
    }

    // Apply filters
    let filteredLog = study.auditLog;
    
    if (filters?.startDate) {
      filteredLog = filteredLog.filter(entry => entry.timestamp >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      filteredLog = filteredLog.filter(entry => entry.timestamp <= filters.endDate!);
    }
    
    if (filters?.actions && filters.actions.length > 0) {
      filteredLog = filteredLog.filter(entry => filters.actions!.includes(entry.action));
    }
    
    if (filters?.userIds && filters.userIds.length > 0) {
      filteredLog = filteredLog.filter(entry => filters.userIds!.includes(entry.id));
    }
    
    // Sort by timestamp (newest first)
    filteredLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Create audit log entry for this access
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: new Date(),
      action: 'audit_log_accessed',
      performedBy: id,
      details: { filters },
      systemGenerated: true
    };
    
    // Add audit log entry
    await this.appendAuditLog(studyId, auditEntry);

    return filteredLog;
  }

  /**
   * Terminates a study due to critical issues
   * @param studyId ID of the study to terminate
   * @param reason Reason for termination
   * @param id ID of the user terminating the study
   * @returns The terminated study
   */
  async terminateStudy(
    studyId: string,
    reason: string,
    id: string
  ): Promise<DoubleBlindStudy> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole || userRole.accessLevel !== 'full_access') {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to terminate this study',
        studyId,
        { id }
      );
    }

    // Check if study is already terminated or unblinded
    if (study.status === DoubleBlindStudyStatus.TERMINATED || study.status === DoubleBlindStudyStatus.UNBLINDED) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INVALID_STUDY_STATE,
        `Study is already in ${study.status} state`,
        studyId,
        { currentStatus: study.status }
      );
    }

    const now = new Date();
    const updatedStudy: DoubleBlindStudy = {
      ...study,
      status: DoubleBlindStudyStatus.TERMINATED,
      endDate: now,
      lastUpdated: now,
      updatedBy: id,
      version: study.version + 1
    };

    // Create audit log entry
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: now,
      action: 'study_terminated',
      performedBy: id,
      details: {
        reason,
        previousStatus: study.status
      },
      systemGenerated: true
    };
    
    // Add audit log entry
    updatedStudy.auditLog.push(auditEntry);

    // Update governance status
    await this.governanceService.updateResearchObjectStatus(studyId, 'terminated', { reason });

    // Save updated study
    await this.dataAccessService.updateDoubleBlindStudy(updatedStudy);

    // Emit event
    this.eventBus.emit('double-blind-study-terminated', {
      studyId,
      id,
      timestamp: now,
      reason
    });

    // Send notifications to all study personnel
    for (const role of study.roles) {
      await this.notificationService.sendNotification(
        role.id,
        'study_terminated',
        `The double-blind study "${study.name}" has been terminated`,
        {
          studyId,
          studyName: study.name,
          terminatedBy: id,
          terminationDate: now,
          reason
        }
      );
    }

    return updatedStudy;
  }

  /**
   * Gets the participant's group assignment (only available for unblinded studies or emergency unblinding)
   * @param studyId ID of the study
   * @param participantId ID of the participant
   * @param id ID of the user requesting the assignment
   * @returns The participant's group assignment
   */
  async getParticipantAssignment(
    studyId: string,
    participantId: string,
    id: string
  ): Promise<{ participantId: string; blindedId: string; armId: string; armName: string }> {
    const study = await this.dataAccessService.getDoubleBlindStudyById(studyId);
    if (!study) {
      throw new Error(`Double-blind study with ID ${studyId} not found`);
    }

    // Check user permissions
    const userRole = study.roles.find(role => role.id === id);
    if (!userRole) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
        'User does not have access to this study',
        studyId,
        { id }
      );
    }

    // Check if study is unblinded
    if (study.status !== DoubleBlindStudyStatus.UNBLINDED) {
      // Check if emergency unblinding was approved for this participant
      const emergencyUnblinding = study.emergencyUnblindings.find(
        u => u.participantId === participantId && u.approved
      );
      
      // If not emergency unblinded and user doesn't have unblinding permission
      if (!emergencyUnblinding && (!userRole.canUnblind || userRole.accessLevel !== 'full_access')) {
        throw new DoubleBlindError(
          DoubleBlindErrorType.INSUFFICIENT_PERMISSIONS,
          'Study is not unblinded and user does not have unblinding permission',
          studyId,
          { id, participantId }
        );
      }
    }

    // Find participant
    const participant = study.participants.find(p => p.participantId === participantId);
    if (!participant) {
      throw new DoubleBlindError(
        DoubleBlindErrorType.PARTICIPANT_NOT_FOUND,
        `Participant with ID ${participantId} not found in this study`,
        studyId,
        { participantId }
      );
    }

    // Find arm
    const arm = study.arms.find(a => a.id === participant.armId);
    if (!arm) {
      throw new Error(`Arm with ID ${participant.armId} not found in study`);
    }

    // Create audit log entry for this access
    const auditEntry: BlindingAuditLog = {
      id: uuidv4(),
      studyId,
      timestamp: new Date(),
      action: 'participant_assignment_accessed',
      performedBy: id,
      details: {
        participantId,
        blindedId: participant.blindedId,
        armId: arm.id,
        armName: arm.name
      },
      affectedParticipants: [participantId],
      systemGenerated: true
    };
    
    // Add audit log entry
    await this.appendAuditLog(studyId, auditEntry);

    // If this is accessing data in a blinded study, register a breach
    if (study.status !== DoubleBlindStudyStatus.UNBLINDED) {
      await this.registerBreach(
        studyId,
        {
          timestamp: new Date(),
          type: BreachType.EMERGENCY_UNBLINDING,
          description: `Assignment accessed for participant ${participantId} during blinded phase`,
          affectedParticipants: [participantId],
          affectedResearchers: [id],
          severityLevel: 'high',
          mitigationSteps: 'Limit exposure of unblinded information to only those who need to know.'
        },
        id
      );
    }

    return {
      participantId: participant.participantId,
      blindedId: participant.blindedId,
      armId: arm.id,
      armName: arm.name
    };
  }

  // =====================================
  // Private helper methods
  // =====================================

  /**
   * Validates randomization parameters
   * @param params Randomization parameters to validate
   * @throws Error if parameters are invalid
   */
  private validateRandomizationParams(params: RandomizationParams): void {
    // Validate based on strategy
    switch (params.strategy) {
      case AssignmentStrategy.BLOCK_RANDOMIZATION:
        if (!params.blockSize || params.blockSize < 2) {
          throw new DoubleBlindError(
            DoubleBlindErrorType.INVALID_RANDOMIZATION_PARAMS,
            'Block randomization requires a block size of at least 2',
            undefined,
            { strategy: params.strategy, blockSize: params.blockSize }
          );
        }
        break;
      
      case AssignmentStrategy.STRATIFIED_RANDOMIZATION:
        if (!params.stratificationFactors || params.stratificationFactors.length === 0) {
          throw new DoubleBlindError(
            DoubleBlindErrorType.INVALID_RANDOMIZATION_PARAMS,
            'Stratified randomization requires at least one stratification factor',
            undefined,
            { strategy: params.strategy }
          );
        }
        break;
      
      case AssignmentStrategy.MINIMIZATION:
        if (!params.minimizationFactors || params.minimizationFactors.length === 0) {
          throw new DoubleBlindError(
            DoubleBlindErrorType.INVALID_RANDOMIZATION_PARAMS,
            'Minimization requires at least one factor with weight',
            undefined,
            { strategy: params.strategy }
          );
        }
        break;
    }

    // Validate allocation ratio if provided
    if (params.allocationRatio) {
      if (params.allocationRatio.some(r => r <= 0)) {
        throw new DoubleBlindError(
          DoubleBlindErrorType.INVALID_RANDOMIZATION_PARAMS,
          'Allocation ratios must be positive numbers',
          undefined,
          { allocationRatio: params.allocationRatio }
        );
      }
    }
  }

  /**
   * Assigns a participant to a study arm based on the randomization strategy
   * @param study The study
   * @param participantId ID of the participant to assign
   * @returns ID of the assigned arm
   */
  private async assignParticipantToArm(study: DoubleBlindStudy, participantId: string): Promise<string> {
    const { randomizationParams, arms } = study;
    
    // Get participant data for stratified randomization or minimization
    let participantData: Record<string, any> | undefined;
    if (
      randomizationParams.strategy === AssignmentStrategy.STRATIFIED_RANDOMIZATION ||
      randomizationParams.strategy === AssignmentStrategy.MINIMIZATION
    ) {
      participantData = await this.cohortService.getParticipantData(participantId);
    }
    
    // Perform assignment based on strategy
    switch (randomizationParams.strategy) {
      case AssignmentStrategy.SIMPLE_RANDOMIZATION:
        return this.simpleRandomization(arms, randomizationParams);
      
      case AssignmentStrategy.BLOCK_RANDOMIZATION:
        return this.blockRandomization(study, randomizationParams);
      
      case AssignmentStrategy.STRATIFIED_RANDOMIZATION:
        return this.stratifiedRandomization(study, participantData!, randomizationParams);
      
      case AssignmentStrategy.ADAPTIVE_RANDOMIZATION:
        return this.adaptiveRandomization(study, randomizationParams);
      
      case AssignmentStrategy.MINIMIZATION:
        return this.minimization(study, participantData!, randomizationParams);
      
      default:
        // Default to simple randomization
        return this.simpleRandomization(arms, randomizationParams);
    }
  }

  /**
   * Performs simple randomization
   * @param arms Study arms
   * @param params Randomization parameters
   * @returns ID of the assigned arm
   */
  private simpleRandomization(arms: StudyArm[], params: RandomizationParams): string {
    // Use allocation ratio if provided
    const weights = params.allocationRatio || Array(arms.length).fill(1);
    
    // Normalize weights to sum to 1
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = weights.map(weight => weight / totalWeight);
    
    // Generate a random number between 0 and 1
    const random = Math.random();
    
    // Select arm based on weights
    let cumulativeWeight = 0;
    for (let i = 0; i < arms.length; i++) {
      cumulativeWeight += normalizedWeights[i];
      if (random < cumulativeWeight) {
        return arms[i].id;
      }
    }
    
    // Fallback to last arm (should never happen)
    return arms[arms.length - 1].id;
  }

  /**
   * Performs block randomization
   * @param study The study
   * @param params Randomization parameters
   * @returns ID of the assigned arm
   */
  private blockRandomization(study: DoubleBlindStudy, params: RandomizationParams): string {
    const { arms, participants } = study;
    const blockSize = params.blockSize || arms.length * 2;
    
    // Determine current block number
    const currentBlockNumber = Math.floor(participants.length / blockSize);
    const positionInBlock = participants.length % blockSize;
    
    // If this is the start of a new block, generate a new block sequence
    if (positionInBlock === 0) {
      // Generate block sequence
      const block: string[] = [];
      
      // Calculate repetitions for each arm based on allocation ratio
      const ratio = params.allocationRatio || Array(arms.length).fill(1);
      const totalRatio = ratio.reduce((sum, r) => sum + r, 0);
      const repetitions = ratio.map(r => Math.round((r / totalRatio) * blockSize));
      
      // Add each arm to the block the appropriate number of times
      for (let i = 0; i < arms.length; i++) {
        for (let j = 0; j < repetitions[i]; j++) {
          block.push(arms[i].id);
        }
      }
      
      // Shuffle the block
      for (let i = block.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [block[i], block[j]] = [block[j], block[i]];
      }
      
      // Store the block in data access service for future assignments in this block
      this.dataAccessService.storeBlockRandomizationSequence(study.id, currentBlockNumber, block);
      
      // Return the first assignment in the block
      return block[0];
    } else {
      // Retrieve the block from data access service
      const block = this.dataAccessService.getBlockRandomizationSequence(study.id, currentBlockNumber);
      
      // Return the assignment for the current position in the block
      return block[positionInBlock];
    }
  }

  /**
   * Performs stratified randomization
   * @param study The study
   * @param participantData Participant data for stratification
   * @param params Randomization parameters
   * @returns ID of the assigned arm
   */
  private stratifiedRandomization(
    study: DoubleBlindStudy,
    participantData: Record<string, any>,
    params: RandomizationParams
  ): string {
    const { arms } = study;
    
    // Create a stratum identifier based on stratification factors
    const factors = params.stratificationFactors || [];
    const stratumValues = factors.map(factor => {
      const value = participantData[factor.factor];
      return value !== undefined ? value : 'unknown';
    });
    
    const stratumId = stratumValues.join('_');
    
    // Get the current counts for this stratum
    const stratumCounts = this.dataAccessService.getStratumAssignmentCounts(study.id, stratumId);
    
    // If this is a new stratum, initialize counts
    if (!stratumCounts) {
      const newCounts = arms.reduce((counts, arm) => {
        counts[arm.id] = 0;
        return counts;
      }, {} as Record<string, number>);
      
      this.dataAccessService.storeStratumAssignmentCounts(study.id, stratumId, newCounts);
      
      // Perform simple randomization for the first assignment in this stratum
      return this.simpleRandomization(arms, params);
    }
    
    // Find the arm with the lowest count in this stratum
    const armsByCount = arms
      .map(arm => ({ armId: arm.id, count: stratumCounts[arm.id] || 0 }))
      .sort((a, b) => a.count - b.count);
    
    // If there are multiple arms with the same lowest count, randomize between them
    const lowestCount = armsByCount[0].count;
    const armsWithLowestCount = armsByCount.filter(a => a.count === lowestCount);
    
    // Randomly select from arms with lowest count
    const selectedArmId = armsWithLowestCount[Math.floor(Math.random() * armsWithLowestCount.length)].armId;
    
    // Update counts
    stratumCounts[selectedArmId] = (stratumCounts[selectedArmId] || 0) + 1;
    this.dataAccessService.storeStratumAssignmentCounts(study.id, stratumId, stratumCounts);
    
    return selectedArmId;
  }

  /**
   * Performs adaptive randomization
   * @param study The study
   * @param params Randomization parameters
   * @returns ID of the assigned arm
   */
  private adaptiveRandomization(study: DoubleBlindStudy, params: RandomizationParams): string {
    const { arms, participants } = study;
    
    // Count current assignments to each arm
    const armCounts = arms.reduce((counts, arm) => {
      counts[arm.id] = 0;
      return counts;
    }, {} as Record<string, number>);
    
    participants.forEach(p => {
      if (!p.withdrawalDate) { // Only count active participants
        armCounts[p.armId] = (armCounts[p.armId] || 0) + 1;
      }
    });
    
    // Calculate total participants
    const totalParticipants = Object.values(armCounts).reduce((sum, count) => sum + count, 0);
    
    // For early assignments, use simple randomization to avoid predictability
    if (totalParticipants < arms.length * 2) {
      return this.simpleRandomization(arms, params);
    }
    
    // Calculate target proportions based on allocation ratio
    const ratio = params.allocationRatio || Array(arms.length).fill(1);
    const totalRatio = ratio.reduce((sum, r) => sum + r, 0);
    const targetProportions = ratio.map(r => r / totalRatio);
    
    // Calculate current proportions
    const currentProportions = arms.map(arm => 
      (armCounts[arm.id] || 0) / (totalParticipants || 1)
    );
    
    // Calculate differences from target
    const differences = arms.map((arm, i) => ({
      armId: arm.id,
      difference: targetProportions[i] - currentProportions[i]
    }));
    
    // Sort by difference (largest difference first)
    differences.sort((a, b) => b.difference - a.difference);
    
    // Create adaptive weights based on differences
    const adaptiveWeights = differences.map(d => Math.max(0.1, d.difference + 0.5));
    
    // Normalize weights
    const totalWeight = adaptiveWeights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = adaptiveWeights.map(w => w / totalWeight);
    
    // Select arm based on adaptive weights
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < differences.length; i++) {
      cumulativeWeight += normalizedWeights[i];
      if (random < cumulativeWeight) {
        return differences[i].armId;
      }
    }
    
    // Fallback to the arm with the largest difference
    return differences[0].armId;
  }

  /**
   * Performs minimization (a deterministic adaptive method)
   * @param study The study
   * @param participantData Participant data for minimization factors
   * @param params Randomization parameters
   * @returns ID of the assigned arm
   */
  private minimization(
    study: DoubleBlindStudy,
    participantData: Record<string, any>,
    params: RandomizationParams
  ): string {
    const { arms, participants } = study;
    const factors = params.minimizationFactors || [];
    
    // If there are no minimization factors, fall back to simple randomization
    if (factors.length === 0) {
      return this.simpleRandomization(arms, params);
    }
    
    // Group existing participants by arm and factor values
    const armFactorCounts: Record<string, Record<string, Record<string, number>>> = {};
    
    // Initialize counts
    for (const arm of arms) {
      armFactorCounts[arm.id] = {};
      for (const factor of factors) {
        armFactorCounts[arm.id][factor.factor] = {};
      }
    }
    
    // Count existing participants
    for (const participant of participants) {
      if (participant.withdrawalDate) continue; // Skip withdrawn participants
      
      const participantInfo = this.dataAccessService.getParticipantData(participant.participantId);
      
      for (const factor of factors) {
        const factorValue = participantInfo[factor.factor]?.toString() || 'unknown';
        
        if (!armFactorCounts[participant.armId][factor.factor][factorValue]) {
          armFactorCounts[participant.armId][factor.factor][factorValue] = 0;
        }
        
        armFactorCounts[participant.armId][factor.factor][factorValue]++;
      }
    }
    
    // Calculate imbalance scores for each arm
    const imbalanceScores: Record<string, number> = {};
    
    for (const arm of arms) {
      let score = 0;
      
      for (const factor of factors) {
        const factorValue = participantData[factor.factor]?.toString() || 'unknown';
        const weight = factor.weight || 1;
        
        // Sum counts across all arms for this factor value
        let totalCount = 0;
        for (const armId in armFactorCounts) {
          totalCount += armFactorCounts[armId][factor.factor][factorValue] || 0;
        }
        
        // Current count for this arm
        const currentCount = armFactorCounts[arm.id][factor.factor][factorValue] || 0;
        
        // Add weighted imbalance to score
        score += weight * currentCount;
      }
      
      imbalanceScores[arm.id] = score;
    }
    
    // Find arms with minimum imbalance score
    let minScore = Infinity;
    const armsWithMinScore: string[] = [];
    
    for (const armId in imbalanceScores) {
      if (imbalanceScores[armId] < minScore) {
        minScore = imbalanceScores[armId];
        armsWithMinScore.length = 0;
        armsWithMinScore.push(armId);
      } else if (imbalanceScores[armId] === minScore) {
        armsWithMinScore.push(armId);
      }
    }
    
    // If there's a tie, add a small random component (80% to minimized arm, 20% to random)
    if (armsWithMinScore.length > 1 && Math.random() < 0.2) {
      // 20% chance of using simple randomization
      return this.simpleRandomization(arms, params);
    } else {
      // 80% chance of using the minimized arm(s)
      return armsWithMinScore[Math.floor(Math.random() * armsWithMinScore.length)];
    }
  }

  /**
   * Applies blinding to a study based on user role
   * @param study The study to blind
   * @param userRole The user's role
   * @returns Blinded study with appropriate data hidden
   */
  private applyBlinding(study: DoubleBlindStudy, userRole: BlindedRole): DoubleBlindStudy {
    // Clone the study to avoid modifying the original
    const blindedStudy: DoubleBlindStudy = { ...study };
    
    // Apply different blinding based on access level
    switch (userRole.accessLevel) {
      case 'blinded_access':
        // Hide participant-arm mappings
        blindedStudy.participants = study.participants.map(p => ({
          ...p,
          armId: 'blinded' // Hide the actual arm assignment
        }));
        
        // Hide internal arm codes
        blindedStudy.arms = study.arms.map(a => ({
          ...a,
          internalCode: 'blinded'
        }));
        
        // Filter out certain audit log entries
        blindedStudy.auditLog = study.auditLog.filter(log => 
          !log.action.includes('unblind') && 
          !log.action.includes('breach') &&
          !log.action.includes('emergency')
        );
        
        // Hide breaches
        blindedStudy.breaches = [];
        
        // Hide emergency unblindings
        blindedStudy.emergencyUnblindings = [];
        break;
      
      case 'aggregated_only':
        // Only show aggregated data, no individual participants
        blindedStudy.participants = [];
        
        // Hide internal arm codes
        blindedStudy.arms = study.arms.map(a => ({
          ...a,
          internalCode: 'blinded'
        }));
        
        // Filter out detailed audit log entries
        blindedStudy.auditLog = study.auditLog.filter(log => 
          log.action.includes('study_') && !log.action.includes('unblind')
        );
        
        // Hide breaches
        blindedStudy.breaches = [];
        
        // Hide emergency unblindings
        blindedStudy.emergencyUnblindings = [];
        break;
      
      case 'metadata_only':
        // Only show study metadata, no participant or arm details
        blindedStudy.participants = [];
        blindedStudy.arms = [];
        blindedStudy.auditLog = [];
        blindedStudy.breaches = [];
        blindedStudy.emergencyUnblindings = [];
        break;
    }
    
    // Filter participants by data partitions if user's access is restricted
    if (userRole.accessLevel !== 'metadata_only' && userRole.dataPartitions.length > 0) {
      blindedStudy.participants = blindedStudy.participants.filter(p => 
        p.dataPartitions.some(partition => userRole.dataPartitions.includes(partition))
      );
    }
    
    return blindedStudy;
  }

  /**
   * Appends an audit log entry to a study
   * @param studyId ID of the study
   * @param entry Audit log entry to append
   */
  private async appendAuditLog(studyId: string, entry: BlindingAuditLog): Promise<void> {
    await this.dataAccessService.appendDoubleBlindStudyAuditLog(studyId, entry);
  }

  /**
   * Generates an unblinding report
   * @param study The study
   * @param result Unblinding result
   * @param id ID of the user generating the report
   * @returns URL to the generated report
   */
  private async generateUnblindingReport(
    study: DoubleBlindStudy,
    result: UnblindingResult,
    id: string
  ): Promise<string> {
    void(result);
    void(id);
    // This would generate a comprehensive report with mappings and statistics
    // For now, just return a placeholder URL
    return `/research/foundation/reports/unblinding-${study.id}.pdf`;
  }

  /**
   * Calculates potential blinding breaches based on access patterns
   * @param study The study to analyze
   * @returns Number of potential breaches
   */
  private calculatePotentialBreaches(study: DoubleBlindStudy): number {
    // Analyze audit log for suspicious patterns
    let potentialBreaches = 0;
    
    // Check for repeated access to same participant data
    const participantAccessCounts: Record<string, Record<string, number>> = {};
    
    for (const log of study.auditLog) {
      if (log.affectedParticipants && log.affectedParticipants.length > 0) {
        for (const participantId of log.affectedParticipants) {
          if (!participantAccessCounts[participantId]) {
            participantAccessCounts[participantId] = {};
          }
          
          participantAccessCounts[participantId][log.id] = 
            (participantAccessCounts[participantId][log.id] || 0) + 1;
          
          // Repeated access by same user might indicate attempt to deduce group
          if (participantAccessCounts[participantId][log.id] > 5) {
            potentialBreaches++;
          }
        }
      }
    }
    
    // Check for access patterns that might reveal blinding
    const suspiciousActions = [
      'participant_assignment_accessed',
      'emergency_unblinding_requested',
      'emergency_unblinding_approved'
    ];
    
    for (const log of study.auditLog) {
      if (suspiciousActions.includes(log.action)) {
        potentialBreaches++;
      }
    }
    
    return potentialBreaches;
  }

  /**
   * Calculates data sharing risks
   * @param study The study to analyze
   * @returns Risk score (0-100, higher is riskier)
   */
  private calculateDataSharingRisks(study: DoubleBlindStudy): number {
    // Base risk
    let riskScore = 0;
    
    // More roles = more risk
    riskScore += study.roles.length * 2;
    
    // More participants = slightly more risk
    riskScore += Math.min(20, study.participants.length / 5);
    
    // Each confirmed breach adds risk
    riskScore += study.breaches.length * 5;
    
    // Each emergency unblinding adds risk
    riskScore += study.emergencyUnblindings.filter(u => u.approved).length * 3;
    
    // Cap at 100
    return Math.min(100, riskScore);
  }

  /**
   * Generates recommendations for improving blinding integrity
   * @param study The study
   * @param integrityScore Current integrity score
   * @param confirmedBreaches Number of confirmed breaches
   * @param potentialBreaches Number of potential breaches
   * @param dataSharingRisks Data sharing risk score
   * @returns List of recommendations
   */
  private generateBlindingRecommendations(
    study: DoubleBlindStudy,
    integrityScore: number,
    confirmedBreaches: number,
    potentialBreaches: number,
    dataSharingRisks: number
  ): string[] {
    void(study);
    const recommendations: string[] = [];
    
    // Basic recommendations
    recommendations.push('Regularly remind all study personnel about blinding protocols');
    
    // Recommendations based on integrity score
    if (integrityScore < 70) {
      recommendations.push('Consider enhancing blinding procedures for future studies');
      recommendations.push('Conduct additional blinding integrity training for research staff');
    }
    
    // Recommendations based on breaches
    if (confirmedBreaches > 0) {
      recommendations.push('Document all blinding breaches in publications derived from this study');
      recommendations.push('Consider sensitivity analyses excluding affected participants');
    }
    
    if (potentialBreaches > 3) {
      recommendations.push('Audit access patterns to identify potential systematic breaches');
      recommendations.push('Consider implementing additional access controls');
    }
    
    // Recommendations based on data sharing risks
    if (dataSharingRisks > 50) {
      recommendations.push('Implement more restrictive data access protocols');
      recommendations.push('Consider data partitioning to limit exposure');
    }
    
    return recommendations;
  }
}