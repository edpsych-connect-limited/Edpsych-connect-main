/**
 * Federated Learning Models
 * 
 * This file defines the core data structures for the federated machine learning
 * pipeline, enabling cross-institutional collaborative model training without
 * direct data sharing.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Types of machine learning tasks supported by the federated learning system
 */
export enum ModelTaskType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  DIMENSIONALITY_REDUCTION = 'dimensionality_reduction',
  ANOMALY_DETECTION = 'anomaly_detection',
  RECOMMENDATION = 'recommendation',
  SEQUENCE_PREDICTION = 'sequence_prediction',
  NATURAL_LANGUAGE_PROCESSING = 'natural_language_processing',
  COMPUTER_VISION = 'computer_vision',
  REINFORCEMENT_LEARNING = 'reinforcement_learning'
}

/**
 * Types of federated learning aggregation methods
 */
export enum AggregationMethod {
  FEDERATED_AVERAGING = 'federated_averaging',
  FEDERATED_STOCHASTIC_GRADIENT_DESCENT = 'federated_sgd',
  SECURE_AGGREGATION = 'secure_aggregation',
  DIFFERENTIAL_PRIVACY = 'differential_privacy',
  HOMOMORPHIC_ENCRYPTION = 'homomorphic_encryption',
  WEIGHTED_AVERAGING = 'weighted_averaging',
  ROBUST_AGGREGATION = 'robust_aggregation'
}

/**
 * Status of a federated learning project
 */
export enum FederatedProjectStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  TRAINING = 'training',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

/**
 * Status of a federated learning training round
 */
export enum TrainingRoundStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  AGGREGATING = 'aggregating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Status of a participant's model training in a round
 */
export enum ParticipantTrainingStatus {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TRAINING = 'training',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected' // e.g., for anomalous models
}

/**
 * Model architecture framework
 */
export enum ModelFramework {
  TENSORFLOW = 'tensorflow',
  PYTORCH = 'pytorch',
  SCIKIT_LEARN = 'scikit_learn',
  KERAS = 'keras',
  JAXLIB = 'jaxlib',
  MXNET = 'mxnet',
  XGBOOST = 'xgboost',
  CUSTOM = 'custom'
}

/**
 * Model parameter serialization format
 */
export enum ParameterFormat {
  HDF5 = 'hdf5',
  PROTOBUF = 'protobuf',
  ONNX = 'onnx',
  PICKLE = 'pickle',
  JSON = 'json',
  CUSTOM = 'custom'
}

/**
 * Privacy mechanisms for federated learning
 */
export enum PrivacyMechanism {
  DIFFERENTIAL_PRIVACY = 'differential_privacy',
  HOMOMORPHIC_ENCRYPTION = 'homomorphic_encryption',
  SECURE_MULTI_PARTY_COMPUTATION = 'secure_mpc',
  TRUSTED_EXECUTION_ENVIRONMENT = 'trusted_execution',
  FEDERATED_ANALYTICS = 'federated_analytics',
  SPLIT_LEARNING = 'split_learning',
  NONE = 'none'
}

/**
 * Describes a model's hyperparameters
 */
export interface ModelHyperparameters {
  [key: string]: any;
}

/**
 * Describes a dataset feature schema
 */
export interface FeatureSchema {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'image' | 'time_series' | 'mixed';
  required: boolean;
  description?: string;
  constraints?: {
    min?: number;
    max?: number;
    categories?: string[];
    format?: string;
    pattern?: string;
  };
  preprocessing?: {
    normalization?: 'min_max' | 'z_score' | 'robust_scaler';
    encoding?: 'one_hot' | 'label' | 'target' | 'binary';
    imputation?: 'mean' | 'median' | 'mode' | 'constant';
  };
}

/**
 * A model architecture specification
 */
export interface ModelArchitecture {
  id: string;
  name: string;
  description: string;
  framework: ModelFramework;
  version: string;
  layers?: any[]; // Framework-specific layer definitions
  inputShape: number[] | string[];
  outputShape: number[] | string[];
  parameterCount?: number;
  serializationFormat: ParameterFormat;
  codeReference?: string; // Git repository or code location
  pretrained?: boolean;
  pretrainedSource?: string;
  customComponents?: any[];
}

/**
 * Evaluation metrics for model performance
 */
export interface EvaluationMetrics {
  [key: string]: number | number[][] | Record<string, number> | undefined;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  meanSquaredError?: number;
  meanAbsoluteError?: number;
  r2Score?: number;
  logLoss?: number;
  customMetrics?: Record<string, number>;
  confusionMatrix?: number[][];
  executionTime?: number; // In milliseconds
  memoryUsage?: number; // In MB
  threshold?: number; // For classification models
}

/**
 * Model weight parameters
 */
export interface ModelParameters {
  id: string;
  modelVersionId: string;
  format: ParameterFormat;
  size: number; // In bytes
  hash: string; // SHA256 hash for integrity checking
  createdAt: Date;
  storageUri: string; // S3, Azure Blob, or other storage location
  encrypted: boolean;
  encryptionMethod?: string;
}

/**
 * Participant in a federated learning project
 */
export interface FederatedParticipant {
  id: string;
  institutionId: string;
  datasetIds: string[];
  role: 'coordinator' | 'contributor' | 'validator' | 'observer';
  joinedAt: Date;
  status: 'active' | 'inactive' | 'suspended';
  approvedBy?: string;
  approvedAt?: Date;
  computeCapacity?: {
    cpu: number; // Cores
    memory: number; // GB
    gpu?: number; // Count
    diskSpace?: number; // GB
  };
  datasetStats?: {
    sampleCount: number;
    classDistribution?: Record<string, number>;
    featureStats?: Record<string, { min: number; max: number; mean: number; stdDev: number }>;
  };
  lastActivity?: Date;
  participationRate?: number; // Percentage of rounds participated
}

/**
 * A federated learning project
 */
export interface FederatedLearningProject {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: FederatedProjectStatus;
  objective: string;
  modelTask: ModelTaskType;
  initialModelId?: string;
  currentModelVersionId?: string;
  coordinatorInstitutionId: string;
  participants: FederatedParticipant[];
  aggregationMethod: AggregationMethod;
  privacyMechanisms: PrivacyMechanism[];
  datasetSchema: {
    features: FeatureSchema[];
    targetFeature: string;
  };
  hyperparameters: ModelHyperparameters;
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
    roundDuration: number; // In hours
    maxParallelRounds: number;
    timezone: string;
  };
  securitySettings: {
    encryptionRequired: boolean;
    modelValidationRequired: boolean;
    participantValidationMethod: 'manual' | 'automatic' | 'hybrid';
    anomalyDetection: boolean;
    modelPoisoningProtection: boolean;
  };
  regulatoryCompliance: {
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    coppaCompliant: boolean;
    ferpaCompliant: boolean;
    dataResidencyRestrictions?: string[];
  };
  completedRounds: number;
  totalRounds: number;
  currentRoundId?: string;
  bestModelVersionId?: string;
  bestModelMetrics?: EvaluationMetrics;
  tags: string[];
}

/**
 * A training round in a federated learning project
 */
export interface TrainingRound {
  id: string;
  projectId: string;
  roundNumber: number;
  status: TrainingRoundStatus;
  startedAt: Date;
  completedAt?: Date;
  baseModelVersionId: string;
  aggregatedModelVersionId?: string;
  participantResults: {
    participantId: string;
    status: ParticipantTrainingStatus;
    modelVersionId?: string;
    trainingStats?: {
      startTime: Date;
      endTime?: Date;
      epochsCompleted: number;
      samplesProcessed: number;
      localEvaluationMetrics?: EvaluationMetrics;
    };
    rejected?: boolean;
    rejectionReason?: string;
  }[];
  aggregationStats?: {
    startTime: Date;
    endTime?: Date;
    weightedContributions?: Record<string, number>;
    participantCount: number;
    totalSamplesProcessed: number;
  };
  evaluationMetrics?: EvaluationMetrics;
  improvementFromPreviousRound?: Record<string, number>;
}

/**
 * A version of a model in the federated learning system
 */
export interface ModelVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  architecture: ModelArchitecture;
  parameters: ModelParameters;
  createdAt: Date;
  createdBy: string; // User ID or 'system' for aggregated models
  roundId?: string; // Training round that created this version
  parentVersionId?: string; // Previous model version
  evaluationMetrics?: EvaluationMetrics;
  status: 'draft' | 'training' | 'aggregated' | 'validated' | 'rejected';
  validatedBy?: string;
  validatedAt?: Date;
  deploymentTargets?: {
    environment: 'development' | 'staging' | 'production';
    deployedAt: Date;
    deployedBy: string;
    endpointUrl?: string;
  }[];
}

/**
 * Create a new federated learning project
 */
export function createFederatedLearningProject(
  params: {
    name: string;
    description: string;
    objective: string;
    modelTask: ModelTaskType;
    coordinatorInstitutionId: string;
    aggregationMethod: AggregationMethod;
    privacyMechanisms: PrivacyMechanism[];
    datasetSchema: {
      features: FeatureSchema[];
      targetFeature: string;
    };
    hyperparameters: ModelHyperparameters;
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
  createdBy: string
): FederatedLearningProject {
  const now = new Date();
  
  return {
    id: uuidv4(),
    name: params.name,
    description: params.description,
    createdBy,
    createdAt: now,
    updatedAt: now,
    status: FederatedProjectStatus.DRAFT,
    objective: params.objective,
    modelTask: params.modelTask,
    coordinatorInstitutionId: params.coordinatorInstitutionId,
    participants: [],
    aggregationMethod: params.aggregationMethod,
    privacyMechanisms: params.privacyMechanisms,
    datasetSchema: params.datasetSchema,
    hyperparameters: params.hyperparameters,
    convergenceCriteria: params.convergenceCriteria,
    schedule: params.schedule,
    securitySettings: params.securitySettings || {
      encryptionRequired: true,
      modelValidationRequired: true,
      participantValidationMethod: 'manual',
      anomalyDetection: true,
      modelPoisoningProtection: true
    },
    regulatoryCompliance: params.regulatoryCompliance || {
      gdprCompliant: true,
      hipaaCompliant: false,
      coppaCompliant: true,
      ferpaCompliant: true,
      dataResidencyRestrictions: ['UK', 'EU']
    },
    completedRounds: 0,
    totalRounds: params.convergenceCriteria?.maxRounds || 10,
    tags: params.tags || []
  };
}

/**
 * Create a new training round for a project
 */
export function createTrainingRound(
  projectId: string,
  baseModelVersionId: string,
  roundNumber: number,
  participants: { participantId: string }[]
): TrainingRound {
  const now = new Date();
  
  return {
    id: uuidv4(),
    projectId,
    roundNumber,
    status: TrainingRoundStatus.PENDING,
    startedAt: now,
    baseModelVersionId,
    participantResults: participants.map(p => ({
      participantId: p.participantId,
      status: ParticipantTrainingStatus.INVITED,
      trainingStats: {
        startTime: new Date(0), // Will be updated when training begins
        epochsCompleted: 0,
        samplesProcessed: 0
      }
    })),
    aggregationStats: {
      startTime: new Date(0), // Will be updated when aggregation begins
      participantCount: 0,
      totalSamplesProcessed: 0
    }
  };
}

/**
 * Create a new model version
 */
export function createModelVersion(
  projectId: string,
  architecture: ModelArchitecture,
  parameters: ModelParameters,
  versionNumber: number,
  createdBy: string,
  parentVersionId?: string,
  roundId?: string
): ModelVersion {
  return {
    id: uuidv4(),
    projectId,
    versionNumber,
    architecture,
    parameters,
    createdAt: new Date(),
    createdBy,
    parentVersionId,
    roundId,
    status: 'draft'
  };
}