import { logger as _logger } from "@/lib/logger";
/**
 * Training Round Coordinator for Federated Learning
 * 
 * Manages the lifecycle of training rounds in federated learning projects,
 * coordinating training across multiple institutions without sharing raw data.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  FederatedLearningProject,
  TrainingRound,
  TrainingRoundStatus,
  ModelParameters,
  AggregationMethod,
  ModelVersion,
  createTrainingRound
} from '../models/federated-learning';
import { LoggingService } from '../../shared/services/logging-service';
import { EventBusService } from '../../shared/services/event-bus';
import { ModelAggregator, AggregationConfig } from '../utils/model-aggregation';
import { FederatedLearningService } from './federated-learning-service';

/**
 * Parameters required to create a new training round
 */
export interface TrainingRoundParams {
  /** ID of the federated learning project */
  projectId: string;
  /** Model version to use as the starting point (if not the first round) */
  baseModelVersionId: string;
  /** Maximum time allowed for the round in milliseconds */
  timeLimit?: number;
  /** Minimum number of institutions required to participate */
  minParticipants?: number;
  /** Training hyperparameters specific to this round (overrides project defaults) */
  hyperparameters?: Record<string, any>;
}

/**
 * A participant's update during a training round
 */
export interface ParticipantUpdate {
  /** Institution ID of the participant */
  id: string;
  /** User ID who submitted the update */
  submittedBy: string;
  /** Locally trained model parameters */
  modelParameters: ModelParameters;
  /** Size of the local training dataset */
  trainingExampleCount: number;
  /** Performance metrics on local validation data */
  localMetrics: Record<string, number>;
}

/**
 * Extended training round with additional metadata for coordination
 */
export interface ExtendedTrainingRound extends TrainingRound {
  timeLimit: number;
  minParticipants: number;
  participantCount: number;
  resultModelVersionId?: string;
  createdBy: string;
}

/**
 * Service that coordinates training rounds across institutions
 */
export class TrainingRoundCoordinator {
  private federatedLearningService: FederatedLearningService;
  private modelAggregator: ModelAggregator;
  private logger: LoggingService;
  private eventBus: EventBusService;
  
  // In-memory storage of active training rounds
  private activeRounds: Map<string, ExtendedTrainingRound>;
  
  // In-memory storage of participant updates for each round
  private roundUpdates: Map<string, Map<string, ParticipantUpdate>>;

  constructor(
    federatedLearningService: FederatedLearningService,
    modelAggregator: ModelAggregator,
    logger: LoggingService,
    eventBus: EventBusService
  ) {
    this.federatedLearningService = federatedLearningService;
    this.modelAggregator = modelAggregator;
    this.logger = logger;
    this.eventBus = eventBus;
    this.activeRounds = new Map();
    this.roundUpdates = new Map();
    
    // Set up event listeners for training round lifecycle
    this.setupEventListeners();
  }
  
  /**
   * Create a new training round for a federated learning project
   * 
   * @param params Parameters for the new training round
   * @param id User ID of the coordinator initiating the round
   * @returns The newly created training round
   */
  public async createTrainingRound(
    params: TrainingRoundParams,
    id: string
  ): Promise<ExtendedTrainingRound> {
    // Get the project
    const project = await this.federatedLearningService.getProject(params.projectId);
    
    if (!project) {
      throw new Error(`Project with ID ${params.projectId} not found`);
    }
    
    // Check if the user is authorized to coordinate training for this project
    const isCoordinator = this.isUserProjectCoordinator(project, id);
    if (!isCoordinator) {
      throw new Error(`User ${id} is not authorized to coordinate training for project ${params.projectId}`);
    }
    
    // Get the latest round number for this project
    const roundNumber = this.getNextRoundNumber(project);
    
    // Get participants list for the project
    const participants = project.participants.map(p => ({
      participantId: p.id
    }));
    
    // Create the base training round
    const baseRound = createTrainingRound(
      params.projectId,
      params.baseModelVersionId,
      roundNumber,
      participants
    );
    
    // Create the extended training round with additional metadata
    const extendedRound: ExtendedTrainingRound = {
      ...baseRound,
      timeLimit: params.timeLimit || 24 * 60 * 60 * 1000, // 24 hours default
      minParticipants: params.minParticipants || project.convergenceCriteria?.minParticipants || 2,
      participantCount: 0,
      createdBy: id
    };
    
    // Store the round
    this.activeRounds.set(extendedRound.id, extendedRound);
    this.roundUpdates.set(extendedRound.id, new Map());
    
    // Emit event for round creation
    this.eventBus.emit('federated.round.created', {
      roundId: extendedRound.id,
      projectId: project.id,
      roundNumber,
      createdBy: id
    });
    
    this.logger.info('Created new training round', {
      component: 'TrainingRoundCoordinator',
      roundId: extendedRound.id,
      projectId: project.id,
      roundNumber
    });
    
    return extendedRound;
  }
  
  /**
   * Start a training round, making it available for participants
   * 
   * @param roundId ID of the training round to start
   * @param id User ID starting the round
   * @returns The updated training round
   */
  public async startTrainingRound(
    roundId: string,
    id: string
  ): Promise<ExtendedTrainingRound> {
    const round = this.activeRounds.get(roundId);
    
    if (!round) {
      throw new Error(`Training round with ID ${roundId} not found`);
    }
    
    if (round.status !== TrainingRoundStatus.PENDING) {
      throw new Error(`Training round ${roundId} cannot be started: current status is ${round.status}`);
    }
    
    // Get the project to check authorization
    const project = await this.federatedLearningService.getProject(round.projectId);
    
    if (!project) {
      throw new Error(`Project with ID ${round.projectId} not found`);
    }
    
    // Check if the user is authorized to coordinate training for this project
    const isCoordinator = this.isUserProjectCoordinator(project, id);
    if (!isCoordinator) {
      throw new Error(`User ${id} is not authorized to start training round ${roundId}`);
    }
    
    // Update the round status
    round.status = TrainingRoundStatus.IN_PROGRESS;
    round.startedAt = new Date();
    round.participantCount = 0;
    
    // Set up round expiration timer
    this.scheduleRoundExpiration(round);
    
    // Emit event for round start
    this.eventBus.emit('federated.round.started', {
      roundId: round.id,
      projectId: project.id,
      roundNumber: round.roundNumber,
      startedBy: id,
      startedAt: round.startedAt,
      expiresAt: new Date(round.startedAt.getTime() + round.timeLimit)
    });
    
    this.logger.info('Started training round', {
      component: 'TrainingRoundCoordinator',
      roundId: round.id,
      projectId: project.id,
      roundNumber: round.roundNumber
    });
    
    return round;
  }
  
  /**
   * Submit a model update for a participant in a training round
   * 
   * @param roundId ID of the training round
   * @param update The participant's model update
   * @returns Success indicator and receipt
   */
  public async submitUpdate(
    roundId: string,
    update: ParticipantUpdate
  ): Promise<{ success: boolean; receipt: string }> {
    const round = this.activeRounds.get(roundId);
    
    if (!round) {
      throw new Error(`Training round with ID ${roundId} not found`);
    }
    
    if (round.status !== TrainingRoundStatus.IN_PROGRESS) {
      throw new Error(`Training round ${roundId} is not active: current status is ${round.status}`);
    }
    
    // Get the project to check if the institution is a participant
    const project = await this.federatedLearningService.getProject(round.projectId);
    
    if (!project) {
      throw new Error(`Project with ID ${round.projectId} not found`);
    }
    
    // Check if the institution is a participant in the project
    const isParticipant = project.participants.some(p => p.id === update.id);
    if (!isParticipant) {
      throw new Error(`Institution ${update.id} is not a participant in project ${project.id}`);
    }
    
    // Store the update
    const roundUpdates = this.roundUpdates.get(roundId);
    if (!roundUpdates) {
      throw new Error(`Updates for round ${roundId} not found`);
    }
    
    // If the institution already submitted an update, overwrite it
    if (roundUpdates.has(update.id)) {
      this.logger.warn('Institution submitted multiple updates for round', {
        component: 'TrainingRoundCoordinator',
        roundId,
        id: update.id
      });
    }
    
    roundUpdates.set(update.id, update);
    
    // Update participant count
    round.participantCount = roundUpdates.size;
    
    // Generate a receipt for the submission
    const receipt = `${roundId}-${update.id}-${Date.now()}`;
    
    // Emit event for update submission
    this.eventBus.emit('federated.round.update.submitted', {
      roundId: round.id,
      projectId: project.id,
      id: update.id,
      submittedBy: update.submittedBy,
      submittedAt: new Date(),
      trainingExampleCount: update.trainingExampleCount
    });
    
    this.logger.info('Received model update for training round', {
      component: 'TrainingRoundCoordinator',
      roundId: round.id,
      id: update.id,
      participantCount: round.participantCount
    });
    
    // Check if we have reached the minimum number of participants to complete the round
    if (round.participantCount >= round.minParticipants) {
      this.logger.info('Minimum participants reached for training round', {
        component: 'TrainingRoundCoordinator',
        roundId: round.id,
        participantCount: round.participantCount,
        minParticipants: round.minParticipants
      });
      
      // Auto-complete the round if we have all participants
      if (round.participantCount === project.participants.length) {
        this.logger.info('All participants submitted updates, auto-completing round', {
          component: 'TrainingRoundCoordinator',
          roundId: round.id
        });
        
        // Complete asynchronously to avoid blocking this response
        this.completeTrainingRound(round.id, update.submittedBy).catch(err => {
          this.logger.error('Failed to auto-complete training round', {
            component: 'TrainingRoundCoordinator',
            roundId: round.id,
            error: err instanceof Error ? err.message : String(err)
          });
        });
      }
    }
    
    return {
      success: true,
      receipt
    };
  }
  
  /**
   * Complete a training round, aggregating all participant updates
   * 
   * @param roundId ID of the training round to complete
   * @param id User ID completing the round
   * @returns The completed training round
   */
  public async completeTrainingRound(
    roundId: string,
    id: string
  ): Promise<ExtendedTrainingRound> {
    const round = this.activeRounds.get(roundId);
    
    if (!round) {
      throw new Error(`Training round with ID ${roundId} not found`);
    }
    
    if (round.status === TrainingRoundStatus.COMPLETED) {
      // Already completed, just return the round
      return round;
    }
    
    if (round.status !== TrainingRoundStatus.IN_PROGRESS) {
      throw new Error(`Training round ${roundId} cannot be completed: current status is ${round.status}`);
    }
    
    // Get the project to check authorization
    const project = await this.federatedLearningService.getProject(round.projectId);
    
    if (!project) {
      throw new Error(`Project with ID ${round.projectId} not found`);
    }
    
    // Check if the user is authorized to coordinate training for this project
    const isCoordinator = this.isUserProjectCoordinator(project, id);
    if (!isCoordinator) {
      throw new Error(`User ${id} is not authorized to complete training round ${roundId}`);
    }
    
    // Get participant updates for this round
    const updates = this.roundUpdates.get(roundId);
    if (!updates || updates.size === 0) {
      throw new Error(`No updates found for training round ${roundId}`);
    }
    
    if (updates.size < round.minParticipants) {
      throw new Error(
        `Insufficient participants to complete round: ${updates.size} < ${round.minParticipants}`
      );
    }
    
    // Mark round as aggregating to prevent multiple completions
    round.status = TrainingRoundStatus.AGGREGATING;
    
    try {
      // Prepare participant models for aggregation
      const participantModels = new Map();
      let totalExamples = 0;
      
      updates.forEach((update, id) => {
        participantModels.set(id, update.modelParameters);
        totalExamples += update.trainingExampleCount;
      });
      
      // Prepare weights based on dataset sizes
      const weights = new Map();
      updates.forEach((update, id) => {
        weights.set(id, update.trainingExampleCount / totalExamples);
      });
      
      // Configure aggregation
      const aggregationConfig: AggregationConfig = {
        method: project.aggregationMethod || AggregationMethod.FEDERATED_AVERAGING,
        privacyMechanisms: project.privacyMechanisms,
        minParticipants: round.minParticipants,
        participantWeights: weights
      };
      
      // Perform model aggregation
      this.logger.info('Aggregating model updates for training round', {
        component: 'TrainingRoundCoordinator',
        roundId: round.id,
        participantCount: updates.size,
        aggregationMethod: aggregationConfig.method
      });
      
      const aggregationResult = await this.modelAggregator.aggregateModels(
        participantModels,
        aggregationConfig
      );
      
      // Update the aggregation stats
      if (!round.aggregationStats) {
        round.aggregationStats = {
          startTime: new Date(),
          participantCount: updates.size,
          totalSamplesProcessed: totalExamples
        };
      } else {
        round.aggregationStats.endTime = new Date();
        round.aggregationStats.participantCount = updates.size;
        round.aggregationStats.totalSamplesProcessed = totalExamples;
        round.aggregationStats.weightedContributions = Object.fromEntries(weights);
      }
      
      // Create a new model version with the aggregated parameters
      const modelVersion = await this.createModelVersion({
        projectId: project.id,
        roundId: round.id,
        previousVersionId: round.baseModelVersionId,
        parameters: aggregationResult.parameters,
        metrics: this.aggregateMetrics(updates)
      }, id);
      
      // Update the round with the result
      round.status = TrainingRoundStatus.COMPLETED;
      round.completedAt = new Date();
      round.resultModelVersionId = modelVersion.id;
      round.aggregatedModelVersionId = modelVersion.id;
      round.evaluationMetrics = modelVersion.evaluationMetrics;
      
      // Calculate improvement from previous round if applicable
      if (modelVersion.parentVersionId) {
        const previousVersion = await this.federatedLearningService.getModelVersion(modelVersion.parentVersionId);
        if (previousVersion && previousVersion.evaluationMetrics && modelVersion.evaluationMetrics) {
          round.improvementFromPreviousRound = this.calculateImprovement(
            previousVersion.evaluationMetrics,
            modelVersion.evaluationMetrics
          );
        }
      }
      
      // Emit event for round completion
      this.eventBus.emit('federated.round.completed', {
        roundId: round.id,
        projectId: project.id,
        roundNumber: round.roundNumber,
        completedBy: id,
        completedAt: round.completedAt,
        participantCount: updates.size,
        resultModelVersionId: modelVersion.id,
        aggregationMetrics: aggregationResult.metrics
      });
      
      this.logger.info('Completed training round successfully', {
        component: 'TrainingRoundCoordinator',
        roundId: round.id,
        projectId: project.id,
        roundNumber: round.roundNumber,
        participantCount: updates.size,
        resultModelVersionId: modelVersion.id
      });
      
      // Check if the project has convergence criteria and if they've been met
      if (project.convergenceCriteria && modelVersion.evaluationMetrics) {
        const { targetMetric, targetValue } = project.convergenceCriteria;
        // Safely access the metric from evaluationMetrics or customMetrics
        let actualValue: number | undefined;
        
        // Check if the metric is in the standard metrics
        if (targetMetric in modelVersion.evaluationMetrics) {
          actualValue = (modelVersion.evaluationMetrics as any)[targetMetric];
        }
        // Check if it's in customMetrics
        else if (modelVersion.evaluationMetrics.customMetrics &&
                 targetMetric in modelVersion.evaluationMetrics.customMetrics) {
          actualValue = modelVersion.evaluationMetrics.customMetrics[targetMetric];
        }
        
        if (actualValue !== undefined && actualValue >= targetValue) {
          this.logger.info('Project convergence criteria met', {
            component: 'TrainingRoundCoordinator',
            projectId: project.id,
            roundNumber: round.roundNumber,
            metric: targetMetric,
            actual: actualValue,
            target: targetValue
          });
          
          // Update project status to indicate convergence
          await this.updateProjectStatus(
            project.id,
            'COMPLETED',
            id
          );
          
          // Emit event for project convergence
          this.eventBus.emit('federated.project.converged', {
            projectId: project.id,
            roundId: round.id,
            roundNumber: round.roundNumber,
            modelVersionId: modelVersion.id,
            metric: targetMetric,
            value: actualValue,
            target: targetValue
          });
        }
      }
      
      return round;
    } catch (_error) {
      // Handle aggregation failure
      round.status = TrainingRoundStatus.FAILED;
      
      this.logger.error('Failed to complete training round', {
        component: 'TrainingRoundCoordinator',
        roundId: round.id,
        error: _error instanceof Error ? _error.message : String(_error)
      });
      
      // Emit event for round failure
      this.eventBus.emit('federated.round.failed', {
        roundId: round.id,
        projectId: project.id,
        error: _error instanceof Error ? _error.message : String(_error)
      });
      
      throw _error;
    }
  }
  
  /**
   * Get a training round by ID
   * 
   * @param roundId ID of the training round
   * @returns The training round or null if not found
   */
  public getTrainingRound(roundId: string): ExtendedTrainingRound | null {
    return this.activeRounds.get(roundId) || null;
  }
  
  /**
   * List active training rounds for a project
   * 
   * @param projectId ID of the project
   * @returns List of active training rounds
   */
  public listProjectRounds(projectId: string): ExtendedTrainingRound[] {
    const projectRounds: ExtendedTrainingRound[] = [];
    
    this.activeRounds.forEach(round => {
      if (round.projectId === projectId) {
        projectRounds.push(round);
      }
    });
    
    return projectRounds.sort((a, b) => b.roundNumber - a.roundNumber);
  }
  
  /**
   * Cancel an active training round
   * 
   * @param roundId ID of the training round to cancel
   * @param id User ID cancelling the round
   * @param reason Reason for cancellation
   * @returns The cancelled training round
   */
  public async cancelTrainingRound(
    roundId: string,
    id: string,
    reason: string
  ): Promise<ExtendedTrainingRound> {
    const round = this.activeRounds.get(roundId);
    
    if (!round) {
      throw new Error(`Training round with ID ${roundId} not found`);
    }
    
    if (round.status !== TrainingRoundStatus.IN_PROGRESS && round.status !== TrainingRoundStatus.PENDING) {
      throw new Error(`Training round ${roundId} cannot be cancelled: current status is ${round.status}`);
    }
    
    // Get the project to check authorization
    const project = await this.federatedLearningService.getProject(round.projectId);
    
    if (!project) {
      throw new Error(`Project with ID ${round.projectId} not found`);
    }
    
    // Check if the user is authorized to coordinate training for this project
    const isCoordinator = this.isUserProjectCoordinator(project, id);
    if (!isCoordinator) {
      throw new Error(`User ${id} is not authorized to cancel training round ${roundId}`);
    }
    
    // Update the round status
    round.status = TrainingRoundStatus.FAILED;
    
    // Emit event for round cancellation
    this.eventBus.emit('federated.round.cancelled', {
      roundId: round.id,
      projectId: project.id,
      roundNumber: round.roundNumber,
      cancelledBy: id,
      cancelledAt: new Date(),
      reason
    });
    
    this.logger.info('Cancelled training round', {
      component: 'TrainingRoundCoordinator',
      roundId: round.id,
      projectId: project.id,
      roundNumber: round.roundNumber,
      reason
    });
    
    return round;
  }
  
  // Private helper methods
  
  private isUserProjectCoordinator(project: FederatedLearningProject, id: string): boolean {
    return project.participants.some(p => 
      p.role === 'coordinator' && id === project.createdBy
    );
  }
  
  private getNextRoundNumber(project: FederatedLearningProject): number {
    let maxRound = 0;
    
    this.activeRounds.forEach(round => {
      if (round.projectId === project.id && round.roundNumber > maxRound) {
        maxRound = round.roundNumber;
      }
    });
    
    return maxRound + 1;
  }
  
  private scheduleRoundExpiration(round: ExtendedTrainingRound): void {
    if (!round.startedAt) {
      return;
    }
    
    const expirationTime = round.startedAt.getTime() + round.timeLimit;
    const now = Date.now();
    const timeToExpiration = expirationTime - now;
    
    if (timeToExpiration <= 0) {
      // Already expired
      this.handleRoundExpiration(round.id);
      return;
    }
    
    // Schedule expiration
    setTimeout(() => {
      this.handleRoundExpiration(round.id);
    }, timeToExpiration);
    
    this.logger.debug('Scheduled round expiration', {
      component: 'TrainingRoundCoordinator',
      roundId: round.id,
      expiresAt: new Date(expirationTime),
      timeToExpiration: Math.floor(timeToExpiration / 1000)
    });
  }
  
  private async handleRoundExpiration(roundId: string): Promise<void> {
    const round = this.activeRounds.get(roundId);
    
    if (!round || round.status !== TrainingRoundStatus.IN_PROGRESS) {
      return;
    }
    
    this.logger.info('Training round expired', {
      component: 'TrainingRoundCoordinator',
      roundId,
      projectId: round.projectId,
      roundNumber: round.roundNumber
    });
    
    // Get the updates for this round
    const updates = this.roundUpdates.get(roundId);
    
    if (updates && updates.size >= round.minParticipants) {
      // We have enough participants to complete the round
      try {
        // Get a coordinator user ID from the project
        const project = await this.federatedLearningService.getProject(round.projectId);
        const coordinatorId = project?.createdBy || round.createdBy;
        
        // Complete the round
        await this.completeTrainingRound(roundId, coordinatorId);
      } catch (_error) {
        this.logger.error('Failed to auto-complete expired round', {
          component: 'TrainingRoundCoordinator',
          roundId,
          error: _error instanceof Error ? _error.message : String(_error)
        });
        
        // Mark as failed
        round.status = TrainingRoundStatus.FAILED;
      }
    } else {
      // Not enough participants, mark as failed
      round.status = TrainingRoundStatus.FAILED;
      
      // Emit event for round expiration
      this.eventBus.emit('federated.round.expired', {
        roundId: round.id,
        projectId: round.projectId,
        roundNumber: round.roundNumber,
        participantCount: updates?.size || 0,
        minParticipants: round.minParticipants
      });
    }
  }
  
  private aggregateMetrics(
    updates: Map<string, ParticipantUpdate>
  ): Record<string, number> {
    const metrics: Record<string, number> = {};
    const metricCounts: Record<string, number> = {};
    
    // Aggregate metrics from all participants
    updates.forEach(update => {
      for (const [metric, value] of Object.entries(update.localMetrics)) {
        if (typeof value === 'number') {
          metrics[metric] = (metrics[metric] || 0) + value;
          metricCounts[metric] = (metricCounts[metric] || 0) + 1;
        }
      }
    });
    
    // Calculate averages
    for (const metric of Object.keys(metrics)) {
      if (metricCounts[metric] > 0) {
        metrics[metric] = metrics[metric] / metricCounts[metric];
      }
    }
    
    return metrics;
  }
  
  private calculateImprovement(
    previousMetrics: Record<string, any>,
    currentMetrics: Record<string, any>
  ): Record<string, number> {
    const improvement: Record<string, number> = {};
    
    for (const [metric, value] of Object.entries(currentMetrics)) {
      if (typeof value === 'number' && typeof previousMetrics[metric] === 'number') {
        improvement[metric] = value - previousMetrics[metric];
      }
    }
    
    return improvement;
  }
  
  private setupEventListeners(): void {
    // Listen for project deletion events to clean up related rounds
    this.eventBus.subscribe('federated.project.deleted', (event: any) => {
      const projectId = event.projectId;
      
      if (!projectId) {
        return;
      }
      
      // Clean up rounds for this project
      const roundsToDelete: string[] = [];
      
      this.activeRounds.forEach((round, roundId) => {
        if (round.projectId === projectId) {
          roundsToDelete.push(roundId);
        }
      });
      
      // Delete the rounds
      for (const roundId of roundsToDelete) {
        this.activeRounds.delete(roundId);
        this.roundUpdates.delete(roundId);
      }
      
      this.logger.info('Cleaned up training rounds for deleted project', {
        component: 'TrainingRoundCoordinator',
        projectId,
        roundsDeleted: roundsToDelete.length
      });
    });
  }
  
  /**
   * Create a new model version from aggregated parameters
   * Helper method to abstract the model version creation logic
   */
  private async createModelVersion(
    params: {
      projectId: string;
      roundId: string;
      previousVersionId?: string;
      parameters: any;
      metrics?: Record<string, number>;
    },
    id: string
  ): Promise<ModelVersion> {
    // This would typically call the federated learning service's createModelVersion method
    // For now, we'll create a simplified version directly
    
    const project = await this.federatedLearningService.getProject(params.projectId);
    if (!project) {
      throw new Error(`Project with ID ${params.projectId} not found`);
    }
    
    // Get previous version to determine next version number
    let versionNumber = 1;
    if (params.previousVersionId) {
      const previousVersion = await this.federatedLearningService.getModelVersion(params.previousVersionId);
      if (previousVersion) {
        versionNumber = previousVersion.versionNumber + 1;
      }
    }
    
    // Get or create model architecture
    // In a real implementation, this would come from the project's model architecture
    const architecture = {
      id: `arch-${Date.now()}`,
      name: `Model Architecture v${versionNumber}`,
      description: `Aggregated model architecture for project ${project.name}`,
      framework: project.modelTask.toLowerCase().includes('vision') ? 'tensorflow' : 'pytorch',
      version: '1.0.0',
      inputShape: [32, 32, 3],
      outputShape: [10],
      serializationFormat: params.parameters.format
    };
    
    // Create the model version
    const modelVersion: ModelVersion = {
      id: uuidv4(),
      projectId: params.projectId,
      versionNumber,
      architecture: architecture as any,
      parameters: params.parameters,
      createdAt: new Date(),
      createdBy: id,
      roundId: params.roundId,
      parentVersionId: params.previousVersionId,
      evaluationMetrics: params.metrics ? {
        ...params.metrics
      } : undefined,
      status: 'aggregated'
    };
    
    // In a real implementation, you would store this in a database
    // and emit events for model version creation
    
    this.logger.info('Created new model version', {
      component: 'TrainingRoundCoordinator',
      modelVersionId: modelVersion.id,
      projectId: params.projectId,
      versionNumber
    });
    
    return modelVersion;
  }
  
  /**
   * Update project status
   * Helper method to abstract the project status update logic
   */
  private async updateProjectStatus(
    projectId: string,
    status: string,
    id: string
  ): Promise<void> {
    // This would typically call the federated learning service's updateProject method
    // For now, we'll just log the status update
    
    this.logger.info('Updated project status', {
      component: 'TrainingRoundCoordinator',
      projectId,
      status,
      updatedBy: id
    });
    
    // Emit event for project status update
    this.eventBus.emit('federated.project.status.updated', {
      projectId,
      status,
      updatedBy: id,
      updatedAt: new Date()
    });
  }
}
