/**
 * Federated Learning Service
 * 
 * This service manages federated learning projects, training rounds, and coordinates
 * the model training process across institutions without direct data sharing.
 */

import { v4 as uuidv4 } from 'uuid';
import { LoggingService } from '../../shared/services/logging-service';
import { EventBusService } from '../../shared/services/event-bus';

import { InstitutionService } from '../../data-sharing/services/institution-service';
import { VerificationStatus } from '../../data-sharing/models/institution';
import {
  FederatedLearningProject,
  FederatedProjectStatus,
  TrainingRound,
  TrainingRoundStatus,
  ModelVersion,
  ParticipantTrainingStatus,
  ModelTaskType,
  AggregationMethod,
  PrivacyMechanism,
  ModelParameters,
  ModelArchitecture,
  EvaluationMetrics,
  createFederatedLearningProject,
  createTrainingRound,
  createModelVersion
} from '../models/federated-learning';

/**
 * Manages the life cycle of federated learning projects and coordinates
 * the training process across participating institutions.
 */
export class FederatedLearningService {
  private projects: Map<string, FederatedLearningProject> = new Map();
  private trainingRounds: Map<string, TrainingRound> = new Map();
  private modelVersions: Map<string, ModelVersion> = new Map();
  
  constructor(
    private loggingService: LoggingService,
    private eventBusService: EventBusService,
    
    private institutionService: InstitutionService
  ) {
    
    // Subscribe to relevant events
    this.eventBusService.subscribe('institution-verified', this.handleInstitutionVerified.bind(this));
    this.eventBusService.subscribe('model-training-completed', this.handleModelTrainingCompleted.bind(this));
    this.eventBusService.subscribe('model-validation-completed', this.handleModelValidationCompleted.bind(this));
  }

  /**
   * Creates a new federated learning project
   */
  public async createProject(
    params: {
      name: string;
      description: string;
      objective: string;
      modelTask: ModelTaskType;
      coordinatorInstitutionId: string;
      aggregationMethod: AggregationMethod;
      privacyMechanisms: PrivacyMechanism[];
      datasetSchema: {
        features: any[];
        targetFeature: string;
      };
      hyperparameters: any;
      convergenceCriteria?: {
        maxRounds: number;
        targetMetric: string;
        targetValue: number;
        minParticipants: number;
        minParticipantsPercentage?: number;
        earlyStoppingPatience?: number;
      };
      schedule?: {
        startDate?: Date;
        endDate?: Date;
        roundDuration: number;
        maxParallelRounds: number;
        timezone: string;
      };
      securitySettings?: {
        encryptionRequired: boolean;
        modelValidationRequired: boolean;
        participantValidationMethod: 'manual' | 'automatic' | 'hybrid';
        anomalyDetection: boolean;
        modelPoisoningProtection: boolean;
      };
      regulatoryCompliance?: {
        gdprCompliant: boolean;
        hipaaCompliant: boolean;
        coppaCompliant: boolean;
        ferpaCompliant: boolean;
        dataResidencyRestrictions?: string[];
      };
      tags?: string[];
    },
    id: string
  ): Promise<FederatedLearningProject> {
    try {
      // Verify coordinator institution
      const institution = await this.institutionService.getInstitutionById(params.coordinatorInstitutionId, id);
      if (!institution) {
        throw new Error(`Institution with ID ${params.coordinatorInstitutionId} not found`);
      }
      
      if (institution.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new Error(`Institution with ID ${params.coordinatorInstitutionId} is not verified`);
      }

      // Create project
      const project = createFederatedLearningProject(params, id);
      
      // Add coordinator as first participant
      project.participants = [{
        id: uuidv4(),
        institutionId: params.coordinatorInstitutionId,
        datasetIds: [],
        role: 'coordinator',
        joinedAt: new Date(),
        status: 'active' as const,
        approvedBy: id,
        approvedAt: new Date()
      }];
      
      // Store project
      this.projects.set(project.id, project);
      
      // Log creation
      this.loggingService.log({
        level: 'info',
        message: `Created federated learning project: ${project.name}`,
        component: 'FederatedLearningService',
        context: {
          projectId: project.id,
          id
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.project.created', {
        projectId: project.id,
        name: project.name,
        createdBy: id,
        coordinatorInstitutionId: params.coordinatorInstitutionId
      });
      
      return project;
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to create federated learning project: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          params,
          id,
          _error: (_error as Error).stack
        }
      });
      
      throw _error;
    }
  }

  /**
   * Updates an existing federated learning project
   */
  public async updateProject(
    projectId: string,
    updates: Partial<FederatedLearningProject>,
    id: string
  ): Promise<FederatedLearningProject> {
    try {
      const project = this.projects.get(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Check if user has permission to update project
      if (project.createdBy !== id &&
          !project.participants.some(p =>
            p.institutionId === updates.coordinatorInstitutionId &&
            p.role === 'coordinator')) {
        throw new Error('Unauthorized to update this project');
      }
      
      // Apply updates
      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date()
      };
      
      // Validate project state
      this.validateProjectState(updatedProject);
      
      // Store updated project
      this.projects.set(projectId, updatedProject);
      
      // Log update
      this.loggingService.log({
        level: 'info',
        message: `Updated federated learning project: ${updatedProject.name}`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          id,
          updates: Object.keys(updates)
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.project.updated', {
        projectId,
        name: updatedProject.name,
        updatedBy: id,
        updates: Object.keys(updates)
      });
      
      return updatedProject;
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to update federated learning project: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          id,
          updates: Object.keys(updates),
          _error: (_error as Error).stack
        }
      });
      
      throw _error;
    }
  }

  /**
   * Adds a participant to a federated learning project
   */
  public async addParticipant(
    projectId: string,
    params: {
      id: string;
      datasetIds?: string[];
      role: 'contributor' | 'validator' | 'observer';
      computeCapacity?: {
        cpu: number;
        memory: number;
        gpu?: number;
        diskSpace?: number;
      };
      datasetStats?: {
        sampleCount: number;
        classDistribution?: Record<string, number>;
        featureStats?: Record<string, { min: number; max: number; mean: number; stdDev: number }>;
      };
    },
    id: string
  ): Promise<FederatedLearningProject> {
    try {
      const project = this.projects.get(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Verify institution
      const institution = await this.institutionService.getInstitutionById(params.id, id);
      if (!institution) {
        throw new Error(`Institution with ID ${params.id} not found`);
      }
      
      if (institution.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new Error(`Institution with ID ${params.id} is not verified`);
      }
      
      // Check if institution is already a participant
      if (project.participants.some(p => p.institutionId === params.id)) {
        throw new Error(`Institution with ID ${params.id} is already a participant`);
      }
      
      // Add participant
      const participant = {
        id: uuidv4(),
        institutionId: params.id,
        datasetIds: params.datasetIds || [],
        role: params.role,
        joinedAt: new Date(),
        status: 'active' as const,
        computeCapacity: params.computeCapacity,
        datasetStats: params.datasetStats
      };
      
      const updatedProject = {
        ...project,
        participants: [...project.participants, participant],
        updatedAt: new Date()
      };
      
      // Store updated project
      this.projects.set(projectId, updatedProject);
      
      // Log addition
      this.loggingService.log({
        level: 'info',
        message: `Added participant to federated learning project`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          institutionId: params.id,
          role: params.role,
          id
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.participant.added', {
        projectId,
        participantId: participant.id,
        institutionId: params.id,
        role: params.role,
        addedBy: id
      });
      
      return updatedProject;
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to add participant to federated learning project: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          institutionId: params.id,
          userId: id,
          _error: (_error as Error).stack
        }
      });
      
      throw _error;
    }
  }

  /**
   * Starts a federated learning project
   */
  public async startProject(
    projectId: string,
    initialModelParams: {
      architecture: ModelArchitecture;
      parameters: ModelParameters;
    },
    id: string
  ): Promise<FederatedLearningProject> {
    try {
      const project = this.projects.get(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      if (project.status !== FederatedProjectStatus.DRAFT && 
          project.status !== FederatedProjectStatus.PENDING_APPROVAL) {
        throw new Error(`Project with ID ${projectId} is already started`);
      }
      
      // Check if user has permission to start project
      const userParticipant = project.participants.find(p =>
        p.institutionId === initialModelParams.parameters.modelVersionId &&
        p.role === 'coordinator');
      
      if (project.createdBy !== id && !userParticipant) {
        throw new Error('Unauthorized to start this project');
      }
      
      // Create initial model version
      const initialModelVersion = createModelVersion(
        projectId,
        initialModelParams.architecture,
        initialModelParams.parameters,
        1,
        id
      );
      
      // Store model version
      this.modelVersions.set(initialModelVersion.id, initialModelVersion);
      
      // Create first training round
      const contributorParticipants = project.participants.filter(p => 
        p.role === 'contributor' || p.role === 'coordinator');
        
      const round = createTrainingRound(
        projectId, 
        initialModelVersion.id, 
        1, 
        contributorParticipants.map(p => ({ participantId: p.id }))
      );
      
      // Store training round
      this.trainingRounds.set(round.id, round);
      
      // Update project
      const updatedProject = {
        ...project,
        status: FederatedProjectStatus.ACTIVE,
        initialModelId: initialModelVersion.id,
        currentModelVersionId: initialModelVersion.id,
        currentRoundId: round.id,
        updatedAt: new Date()
      };
      
      // Store updated project
      this.projects.set(projectId, updatedProject);
      
      // Log start
      this.loggingService.log({
        level: 'info',
        message: `Started federated learning project: ${updatedProject.name}`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          id,
          initialModelVersionId: initialModelVersion.id,
          roundId: round.id
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.project.started', {
        projectId,
        name: updatedProject.name,
        startedBy: id,
        initialModelVersionId: initialModelVersion.id,
        roundId: round.id
      });
      
      // Notify participants about the round
      this.notifyParticipantsAboutRound(round);
      
      return updatedProject;
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to start federated learning project: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          id,
          _error: (_error as Error).stack
        }
      });
      
      throw _error;
    }
  }

  /**
   * Submits a trained model from a participant
   */
  public async submitTrainedModel(
    roundId: string,
    participantId: string,
    modelParams: {
      parameters: ModelParameters;
      trainingStats: {
        startTime: Date;
        endTime: Date;
        epochsCompleted: number;
        samplesProcessed: number;
        localEvaluationMetrics?: EvaluationMetrics;
      };
    },
    id: string
  ): Promise<TrainingRound> {
    try {
      const round = this.trainingRounds.get(roundId);
      
      if (!round) {
        throw new Error(`Training round with ID ${roundId} not found`);
      }
      
      // Check if participant is part of this round
      const participantResult = round.participantResults.find(pr => pr.participantId === participantId);
      
      if (!participantResult) {
        throw new Error(`Participant with ID ${participantId} is not part of this training round`);
      }
      
      if (participantResult.status === ParticipantTrainingStatus.COMPLETED) {
        throw new Error(`Participant with ID ${participantId} has already submitted model for this round`);
      }
      
      // Get project and base model
      const project = this.projects.get(round.projectId);
      if (!project) {
        throw new Error(`Project with ID ${round.projectId} not found`);
      }
      
      const baseModelVersion = this.modelVersions.get(round.baseModelVersionId);
      if (!baseModelVersion) {
        throw new Error(`Base model version with ID ${round.baseModelVersionId} not found`);
      }
      
      // Create new model version for this participant's trained model
      const modelVersion = createModelVersion(
        project.id,
        baseModelVersion.architecture,
        modelParams.parameters,
        baseModelVersion.versionNumber + 0.01, // Participant model versions are minor versions
        id,
        baseModelVersion.id,
        roundId
      );
      
      // Store model version
      this.modelVersions.set(modelVersion.id, modelVersion);
      
      // Update participant result
      const updatedParticipantResults = round.participantResults.map(pr => {
        if (pr.participantId === participantId) {
          return {
            ...pr,
            status: ParticipantTrainingStatus.COMPLETED,
            modelVersionId: modelVersion.id,
            trainingStats: modelParams.trainingStats
          };
        }
        return pr;
      });
      
      // Update round
      const updatedRound = {
        ...round,
        participantResults: updatedParticipantResults
      };
      
      // Store updated round
      this.trainingRounds.set(roundId, updatedRound);
      
      // Log submission
      this.loggingService.log({
        level: 'info',
        message: `Submitted trained model for participant`,
        component: 'FederatedLearningService',
        context: {
          roundId,
          participantId,
          modelVersionId: modelVersion.id,
          id
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.model.submitted', {
        roundId,
        projectId: project.id,
        participantId,
        modelVersionId: modelVersion.id,
        submittedBy: id
      });
      
      // Check if all participants have submitted
      this.checkRoundCompletion(updatedRound);
      
      return updatedRound;
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to submit trained model: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          roundId,
          participantId,
          id,
          _error: (_error as Error).stack
        }
      });
      
      throw _error;
    }
  }

  /**
   * Aggregates models from a completed round and creates a new global model
   */
  public async aggregateModels(
    roundId: string,
    id: string
  ): Promise<ModelVersion> {
    try {
      const round = this.trainingRounds.get(roundId);
      
      if (!round) {
        throw new Error(`Training round with ID ${roundId} not found`);
      }
      
      if (round.status !== TrainingRoundStatus.COMPLETED) {
        throw new Error(`Training round with ID ${roundId} is not completed`);
      }
      
      if (round.aggregatedModelVersionId) {
        throw new Error(`Training round with ID ${roundId} already has an aggregated model`);
      }
      
      // Get project
      const project = this.projects.get(round.projectId);
      if (!project) {
        throw new Error(`Project with ID ${round.projectId} not found`);
      }
      
      // Get base model
      const baseModelVersion = this.modelVersions.get(round.baseModelVersionId);
      if (!baseModelVersion) {
        throw new Error(`Base model version with ID ${round.baseModelVersionId} not found`);
      }
      
      // Get participant models
      const participantModelVersionIds = round.participantResults
        .filter(pr => pr.status === ParticipantTrainingStatus.COMPLETED && pr.modelVersionId !== undefined)
        .map(pr => pr.modelVersionId!);  // Non-null assertion is safe because of the filter condition
      
      const participantModels = participantModelVersionIds
        .map(id => this.modelVersions.get(id))
        .filter((model): model is ModelVersion => model !== undefined);
      
      if (participantModels.length === 0) {
        throw new Error(`No participant models found for round with ID ${roundId}`);
      }
      
      // Update round status to aggregating
      const updatedRound = {
        ...round,
        status: TrainingRoundStatus.AGGREGATING,
        aggregationStats: {
          ...round.aggregationStats,
          startTime: new Date(),
          participantCount: participantModels.length,
          totalSamplesProcessed: round.participantResults.reduce(
            (total, pr) => total + (pr.trainingStats?.samplesProcessed || 0), 
            0
          )
        }
      };
      
      this.trainingRounds.set(roundId, updatedRound);
      
      // Execute model aggregation (implementation depends on the aggregation method)
      // This would normally call an external service or library to perform the actual aggregation
      const aggregatedParameters = await this.performModelAggregation(
        project.aggregationMethod,
        baseModelVersion,
        participantModels,
        round.participantResults
      );
      
      // Create new model version for the aggregated model
      const aggregatedModelVersion = createModelVersion(
        project.id,
        baseModelVersion.architecture,
        aggregatedParameters,
        baseModelVersion.versionNumber + 1, // Increment version number
        'system', // Aggregated by system
        baseModelVersion.id,
        roundId
      );
      
      // Mark model as aggregated
      aggregatedModelVersion.status = 'aggregated';
      
      // Store model version
      this.modelVersions.set(aggregatedModelVersion.id, aggregatedModelVersion);
      
      // Update round with aggregated model
      const finalRound = {
        ...updatedRound,
        status: TrainingRoundStatus.COMPLETED,
        aggregatedModelVersionId: aggregatedModelVersion.id,
        aggregationStats: {
          ...updatedRound.aggregationStats,
          endTime: new Date()
        }
      };
      
      this.trainingRounds.set(roundId, finalRound);
      
      // Update project with current model version
      const updatedProject = {
        ...project,
        currentModelVersionId: aggregatedModelVersion.id,
        completedRounds: project.completedRounds + 1,
        updatedAt: new Date()
      };
      
      this.projects.set(project.id, updatedProject);
      
      // Log aggregation
      this.loggingService.log({
        level: 'info',
        message: `Aggregated models for round ${round.roundNumber}`,
        component: 'FederatedLearningService',
        context: {
          roundId,
          projectId: project.id,
          aggregatedModelVersionId: aggregatedModelVersion.id,
          participantModelCount: participantModels.length,
          id
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.models.aggregated', {
        roundId,
        projectId: project.id,
        aggregatedModelVersionId: aggregatedModelVersion.id,
        participantModelCount: participantModels.length,
        aggregatedBy: id
      });
      
      // Check if the project has reached completion criteria
      this.checkProjectCompletion(updatedProject);
      
      // Start next round if project is still active
      if (updatedProject.status === FederatedProjectStatus.ACTIVE) {
        this.startNextRound(updatedProject, aggregatedModelVersion.id);
      }
      
      return aggregatedModelVersion;
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to aggregate models: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          roundId,
          id,
          _error: (_error as Error).stack
        }
      });
      
      throw _error;
    }
  }

  /**
   * Evaluates a model against validation data
   */
  public async evaluateModel(
    modelVersionId: string,
    evaluationMetrics: EvaluationMetrics,
    id: string
  ): Promise<ModelVersion> {
    try {
      const modelVersion = this.modelVersions.get(modelVersionId);
      
      if (!modelVersion) {
        throw new Error(`Model version with ID ${modelVersionId} not found`);
      }
      
      // Update model with evaluation metrics
      const updatedModelVersion: ModelVersion = {
        ...modelVersion,
        evaluationMetrics,
        status: 'validated' as const,
        validatedBy: id,
        validatedAt: new Date()
      };
      
      // Store updated model
      this.modelVersions.set(modelVersionId, updatedModelVersion);
      
      // Get project
      const project = this.projects.get(modelVersion.projectId);
      if (project) {
        // Check if this is the best model so far
        let isNewBestModel = false;
        
        if (!project.bestModelMetrics) {
          isNewBestModel = true;
        } else if (project.convergenceCriteria?.targetMetric) {
          // Compare using the target metric
          const targetMetric = project.convergenceCriteria.targetMetric;
          const currentValue = evaluationMetrics[targetMetric];
          const bestValue = project.bestModelMetrics[targetMetric];
          
          if (typeof currentValue === 'number' && typeof bestValue === 'number') {
            // Higher is better for most metrics, except for error metrics
            const isErrorMetric = targetMetric.toLowerCase().includes('error') ||
                                 targetMetric.toLowerCase().includes('loss');
            
            isNewBestModel = isErrorMetric ?
              currentValue < bestValue :
              currentValue > bestValue;
          }
        }
        
        if (isNewBestModel) {
          // Update project with best model
          const updatedProject = {
            ...project,
            bestModelVersionId: modelVersionId,
            bestModelMetrics: evaluationMetrics,
            updatedAt: new Date()
          };
          
          this.projects.set(project.id, updatedProject);
          
          // Log best model update
          this.loggingService.log({
            level: 'info',
            message: `New best model for project ${project.name}`,
            component: 'FederatedLearningService',
            context: {
              projectId: project.id,
              modelVersionId,
              metrics: Object.keys(evaluationMetrics),
              id
            }
          });
          
          // Publish event
          this.eventBusService.emit('federated.model.new_best', {
            projectId: project.id,
            modelVersionId,
            metrics: evaluationMetrics,
            evaluatedBy: id
          });
        }
      }
      
      // Log evaluation
      this.loggingService.log({
        level: 'info',
        message: `Evaluated model version ${modelVersion.versionNumber}`,
        component: 'FederatedLearningService',
        context: {
          modelVersionId,
          projectId: modelVersion.projectId,
          metrics: Object.keys(evaluationMetrics),
          id
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.model.evaluated', {
        modelVersionId,
        projectId: modelVersion.projectId,
        metrics: evaluationMetrics,
        evaluatedBy: id
      });
      
      return updatedModelVersion;
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to evaluate model: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          modelVersionId,
          id,
          _error: (_error as Error).stack
        }
      });
      
      throw _error;
    }
  }

  /**
   * Gets a federated learning project by ID
   */
  public getProject(projectId: string): FederatedLearningProject | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Gets all federated learning projects
   */
  public getAllProjects(): FederatedLearningProject[] {
    return Array.from(this.projects.values());
  }

  /**
   * Gets projects for a specific institution
   */
  public getProjectsByInstitution(id: string): FederatedLearningProject[] {
    return Array.from(this.projects.values())
      .filter(project => project.participants.some(p => p.institutionId === id));
  }

  /**
   * Gets a training round by ID
   */
  public getTrainingRound(roundId: string): TrainingRound | undefined {
    return this.trainingRounds.get(roundId);
  }

  /**
   * Gets all training rounds for a project
   */
  public getTrainingRoundsByProject(projectId: string): TrainingRound[] {
    return Array.from(this.trainingRounds.values())
      .filter(round => round.projectId === projectId)
      .sort((a, b) => a.roundNumber - b.roundNumber);
  }

  /**
   * Gets a model version by ID
   */
  public getModelVersion(modelVersionId: string): ModelVersion | undefined {
    return this.modelVersions.get(modelVersionId);
  }

  /**
   * Gets all model versions for a project
   */
  public getModelVersionsByProject(projectId: string): ModelVersion[] {
    return Array.from(this.modelVersions.values())
      .filter(model => model.projectId === projectId)
      .sort((a, b) => a.versionNumber - b.versionNumber);
  }

  /**
   * Validates project state transitions
   */
  private validateProjectState(project: FederatedLearningProject): void {
    // Various validation rules could be implemented here
    // For example, ensuring required fields are present based on status
    if (project.status === FederatedProjectStatus.ACTIVE) {
      if (!project.participants.some(p => p.role === 'coordinator')) {
        throw new Error('Active project must have a coordinator');
      }
      
      if (project.participants.filter(p => p.role === 'contributor').length < 2) {
        throw new Error('Active project must have at least two contributors');
      }
    }
  }

  /**
   * Checks if a round is complete (all participants have submitted)
   */
  private checkRoundCompletion(round: TrainingRound): void {
    const allCompleted = round.participantResults.every(pr => 
      pr.status === ParticipantTrainingStatus.COMPLETED || 
      pr.status === ParticipantTrainingStatus.DECLINED ||
      pr.status === ParticipantTrainingStatus.FAILED ||
      pr.status === ParticipantTrainingStatus.REJECTED
    );
    
    if (allCompleted && round.status === TrainingRoundStatus.IN_PROGRESS) {
      // Mark round as completed
      const updatedRound = {
        ...round,
        status: TrainingRoundStatus.COMPLETED,
        completedAt: new Date()
      };
      
      this.trainingRounds.set(round.id, updatedRound);
      
      // Log completion
      this.loggingService.log({
        level: 'info',
        message: `Training round ${round.roundNumber} completed`,
        component: 'FederatedLearningService',
        context: {
          roundId: round.id,
          projectId: round.projectId,
          completedParticipants: round.participantResults.filter(pr => 
            pr.status === ParticipantTrainingStatus.COMPLETED
          ).length,
          totalParticipants: round.participantResults.length
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.round.completed', {
        roundId: round.id,
        projectId: round.projectId,
        roundNumber: round.roundNumber,
        completedParticipants: round.participantResults.filter(pr => 
          pr.status === ParticipantTrainingStatus.COMPLETED
        ).length,
        totalParticipants: round.participantResults.length
      });
      
      // Trigger model aggregation
      this.eventBusService.emit('federated.aggregation.requested', {
        roundId: round.id,
        projectId: round.projectId
      });
    }
  }

  /**
   * Checks if a project has reached its completion criteria
   */
  private checkProjectCompletion(project: FederatedLearningProject): void {
    // Check if maximum rounds reached
    if (project.completedRounds >= project.totalRounds) {
      this.completeProject(project.id, 'Maximum rounds reached');
      return;
    }
    
    // Check convergence criteria if defined
    if (project.convergenceCriteria && project.bestModelMetrics) {
      const { targetMetric, targetValue } = project.convergenceCriteria;
      
      if (targetMetric && targetValue !== undefined) {
        const currentValue = project.bestModelMetrics[targetMetric];
        
        if (typeof currentValue === 'number') {
          // Check if target value is reached
          // Higher is better for most metrics, except for error metrics
          const isErrorMetric = targetMetric.toLowerCase().includes('error') ||
                              targetMetric.toLowerCase().includes('loss');
          
          const targetReached = isErrorMetric ?
            currentValue <= targetValue :
            currentValue >= targetValue;
          
          if (targetReached) {
            this.completeProject(project.id, `Target ${targetMetric} value reached`);
          }
        }
      }
    }
  }

  /**
   * Completes a project
   */
  private async completeProject(
    projectId: string, 
    reason: string
  ): Promise<void> {
    try {
      const project = this.projects.get(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      if (project.status === FederatedProjectStatus.COMPLETED) {
        return; // Already completed
      }
      
      // Update project status
      const updatedProject = {
        ...project,
        status: FederatedProjectStatus.COMPLETED,
        updatedAt: new Date()
      };
      
      this.projects.set(projectId, updatedProject);
      
      // Log completion
      this.loggingService.log({
        level: 'info',
        message: `Project ${project.name} completed: ${reason}`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          completedRounds: project.completedRounds,
          bestModelVersionId: project.bestModelVersionId
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.project.completed', {
        projectId,
        name: project.name,
        reason,
        completedRounds: project.completedRounds,
        bestModelVersionId: project.bestModelVersionId
      });
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to complete project: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          projectId,
          reason,
          _error: (_error as Error).stack
        }
      });
    }
  }

  /**
   * Starts the next training round for a project
   */
  private async startNextRound(
    project: FederatedLearningProject, 
    baseModelVersionId: string
  ): Promise<void> {
    try {
      // Get active contributors
      const contributors = project.participants.filter(p => 
        (p.role === 'contributor' || p.role === 'coordinator') &&
        p.status === 'active'
      );
      
      if (contributors.length < 2) {
        throw new Error('Cannot start new round: not enough active contributors');
      }
      
      // Create new round
      const roundNumber = project.completedRounds + 1;
      const round = createTrainingRound(
        project.id,
        baseModelVersionId,
        roundNumber,
        contributors.map(p => ({ participantId: p.id }))
      );
      
      // Store training round
      this.trainingRounds.set(round.id, round);
      
      // Update project
      const updatedProject = {
        ...project,
        currentRoundId: round.id,
        updatedAt: new Date()
      };
      
      this.projects.set(project.id, updatedProject);
      
      // Log new round
      this.loggingService.log({
        level: 'info',
        message: `Started training round ${roundNumber} for project ${project.name}`,
        component: 'FederatedLearningService',
        context: {
          projectId: project.id,
          roundId: round.id,
          roundNumber,
          baseModelVersionId,
          participantCount: contributors.length
        }
      });
      
      // Publish event
      this.eventBusService.emit('federated.round.started', {
        projectId: project.id,
        roundId: round.id,
        roundNumber,
        baseModelVersionId,
        participantCount: contributors.length
      });
      
      // Notify participants about the round
      this.notifyParticipantsAboutRound(round);
    } catch (_error) {
      this.loggingService.log({
        level: '_error',
        message: `Failed to start next round: ${(_error as Error).message}`,
        component: 'FederatedLearningService',
        context: {
          projectId: project.id,
          baseModelVersionId,
          _error: (_error as Error).stack
        }
      });
    }
  }

  /**
   * Notifies participants about a new training round
   */
  private notifyParticipantsAboutRound(round: TrainingRound): void {
    // For each participant, publish an event that their client application would listen for
    for (const participant of round.participantResults) {
      this.eventBusService.emit('federated.participant.round_notification', {
        roundId: round.id,
        projectId: round.projectId,
        participantId: participant.participantId,
        roundNumber: round.roundNumber,
        baseModelVersionId: round.baseModelVersionId
      });
      
      // Update participant status to training
      const updatedParticipantResults = round.participantResults.map(pr => {
        if (pr.participantId === participant.participantId) {
          return {
            ...pr,
            status: ParticipantTrainingStatus.INVITED
          };
        }
        return pr;
      });
      
      // Update round
      const updatedRound = {
        ...round,
        participantResults: updatedParticipantResults
      };
      
      this.trainingRounds.set(round.id, updatedRound);
    }
    
    // Update round status
    const finalRound = {
      ...round,
      status: TrainingRoundStatus.IN_PROGRESS
    };
    
    this.trainingRounds.set(round.id, finalRound);
  }

  /**
   * Performs the actual model aggregation based on the chosen method
   * This is a placeholder - actual implementation would depend on the aggregation method
   */
  private async performModelAggregation(
    _method: AggregationMethod,
    baseModel: ModelVersion,
    _participantModels: ModelVersion[],
    participantResults: TrainingRound['participantResults']
  ): Promise<ModelParameters> {
    // This would be a complex implementation based on the aggregation method
    // For example, FedAvg would weight models by the number of samples processed
    
    // Simple placeholder implementation
    const now = new Date();
    
    // Calculate weights for each participant model based on samples processed
    const totalSamples = participantResults.reduce(
      (total, pr) => total + (pr.trainingStats?.samplesProcessed || 0), 
      0
    );
    
    const weightedContributions: Record<string, number> = {};
    
    participantResults.forEach(pr => {
      if (pr.modelVersionId !== undefined && pr.trainingStats?.samplesProcessed) {
        const weight = pr.trainingStats.samplesProcessed / totalSamples;
        weightedContributions[pr.modelVersionId] = weight;
      }
    });
    
    // In a real implementation, this would use the weights to aggregate model parameters
    // based on the chosen method (FedAvg, Secure Aggregation, etc.)
    
    // For now, we just return a mock parameters object
    return {
      id: uuidv4(),
      modelVersionId: '',  // This will be set when the model version is created
      format: baseModel.parameters.format,
      size: baseModel.parameters.size,
      hash: `aggregated_${Date.now()}`, // This would be a real hash in production
      createdAt: now,
      storageUri: `s3://federated-models/aggregated_${Date.now()}`, // This would be a real URI in production
      encrypted: baseModel.parameters.encrypted,
      encryptionMethod: baseModel.parameters.encryptionMethod
    };
  }

  /**
   * Event handler for institution verification
   */
  private handleInstitutionVerified(event: any): void {
    // Update participant status in relevant projects
    const id = event.id;
    
    for (const project of this.projects.values()) {
      const participantIndex = project.participants.findIndex(p => p.institutionId === id);
      
      if (participantIndex >= 0) {
        // Update participant status if previously inactive due to verification
        if (project.participants[participantIndex].status === 'inactive') {
          const updatedParticipants = [...project.participants];
          updatedParticipants[participantIndex] = {
            ...updatedParticipants[participantIndex],
            status: 'active'
          };
          
          const updatedProject = {
            ...project,
            participants: updatedParticipants,
            updatedAt: new Date()
          };
          
          this.projects.set(project.id, updatedProject);
          
          this.loggingService.log({
            level: 'info',
            message: `Participant status updated due to institution verification`,
            component: 'FederatedLearningService',
            context: {
              projectId: project.id,
              id,
              participantId: project.participants[participantIndex].id
            }
          });
        }
      }
    }
  }

  /**
   * Event handler for model training completion
   */
  private handleModelTrainingCompleted(event: any): void {
    // This would handle events from a client/edge system that completed training
    // In a real implementation, this would trigger submitTrainedModel
    this.loggingService.log({
      level: 'info',
      message: `Received model training completed event`,
      component: 'FederatedLearningService',
      context: event
    });
    
    // Implementation depends on the event structure
  }

  /**
   * Event handler for model validation completion
   */
  private handleModelValidationCompleted(event: any): void {
    // This would handle events from a validation system
    // In a real implementation, this would trigger evaluateModel
    this.loggingService.log({
      level: 'info',
      message: `Received model validation completed event`,
      component: 'FederatedLearningService',
      context: event
    });
    
    // Implementation depends on the event structure
  }
}
