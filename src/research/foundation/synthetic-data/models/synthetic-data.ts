/**
 * Core data models for the synthetic data generation system
 * 
 * Defines the structures and types used throughout the synthetic data generation
 * process, ensuring type safety and consistency.
 */

/**
 * Types of educational data that can be synthetically generated
 */
export enum SyntheticDataType {
  STUDENT_PERFORMANCE = 'student-performance',
  STUDENT_BEHAVIOR = 'student-behavior',
  TEACHER_ASSESSMENT = 'teacher-assessment',
  SOCIAL_RELATIONSHIPS = 'social-relationships',
  EMOTIONAL_WELLBEING = 'emotional-wellbeing',
  LEARNING_PATTERNS = 'learning-patterns',
  CLASSROOM_DYNAMICS = 'classroom-dynamics',
  PARENTAL_ENGAGEMENT = 'parental-engagement'
}

/**
 * UK-specific educational key stages
 */
export enum UKEducationKeyStage {
  EARLY_YEARS = 'early-years',           // Ages 3-5
  KEY_STAGE_1 = 'key-stage-1',           // Ages 5-7 (Years 1-2)
  KEY_STAGE_2 = 'key-stage-2',           // Ages 7-11 (Years 3-6)
  KEY_STAGE_3 = 'key-stage-3',           // Ages 11-14 (Years 7-9)
  KEY_STAGE_4 = 'key-stage-4',           // Ages 14-16 (Years 10-11)
  KEY_STAGE_5 = 'key-stage-5'            // Ages 16-18 (Years 12-13)
}

/**
 * Demographic distribution models to represent different population structures
 */
export enum DemographicDistribution {
  UK_NATIONAL = 'uk-national',             // Based on UK census data
  LONDON = 'london',                       // London metropolitan demographics
  RURAL = 'rural',                         // Rural UK demographics
  URBAN_DIVERSE = 'urban-diverse',         // Diverse urban setting
  HIGH_NEEDS = 'high-needs',               // Higher proportion of special needs
  CUSTOM = 'custom'                        // User-defined distribution
}

/**
 * Methods for ensuring privacy in synthetic data
 */
export enum PrivacyMethod {
  DIFFERENTIAL_PRIVACY = 'differential-privacy',
  K_ANONYMITY = 'k-anonymity',
  T_CLOSENESS = 't-closeness',
  L_DIVERSITY = 'l-diversity',
  NOISE_ADDITION = 'noise-addition',
  MICROAGGREGATION = 'microaggregation'
}

/**
 * Configuration for generating synthetic data
 */
export interface SyntheticDataConfig {
  /** Type of data to generate */
  dataType: SyntheticDataType;
  
  /** Number of records to generate */
  recordCount: number;
  
  /** Demographic distribution to model */
  demographicDistribution: DemographicDistribution;
  
  /** Custom demographic distribution parameters (if using CUSTOM) */
  customDemographics?: Record<string, any>;
  
  /** UK education key stage to generate data for */
  keyStage?: UKEducationKeyStage;
  
  /** Academic year range for the data */
  academicYearRange?: [number, number];
  
  /** Whether to include special educational needs data */
  includeSpecialEducationalNeeds?: boolean;
  
  /** Privacy method to apply to the generated data */
  privacyMethod?: PrivacyMethod;
  
  /** Whether to generate relationships between entities */
  generateRelationships?: boolean;
  
  /** Random seed for reproducibility */
  seed?: number;
  
  /** Additional parameters specific to the data type */
  additionalParams?: Record<string, any>;
}

/**
 * Metadata about a synthetic dataset
 */
export interface SyntheticDatasetMetadata {
  /** Unique identifier for this dataset */
  id: string;
  
  /** When the dataset was generated */
  generatedAt: Date;
  
  /** Configuration used to generate the data */
  config: SyntheticDataConfig;
  
  /** Statistical summary of the generated data */
  statistics: {
    /** Basic statistical metrics per field */
    fieldStats: Record<string, {
      min?: number;
      max?: number;
      mean?: number;
      median?: number;
      mode?: any;
      stdDev?: number;
      distribution?: string;
    }>;
    
    /** Correlation matrix between fields */
    correlationMatrix?: Record<string, Record<string, number>>;
    
    /** How closely the synthetic data matches target distributions */
    distributionFidelity?: Record<string, number>;
  };
  
  /** Privacy guarantees provided by this dataset */
  privacyGuarantees?: {
    method: PrivacyMethod;
    parameters: Record<string, any>;
    riskMetrics: Record<string, number>;
  };

  /** Additional custom data associated with this dataset */
  additionalData?: Record<string, any>;
}

/**
 * A complete synthetic dataset with data and metadata
 */
export interface SyntheticDataset {
  /** Metadata about this dataset */
  metadata: SyntheticDatasetMetadata;
  
  /** The actual data records */
  records: Record<string, any>[];
  
  /** Schema describing the data structure */
  schema: {
    fields: Array<{
      name: string;
      type: string;
      description?: string;
      constraints?: Record<string, any>;
    }>;
    relationships?: Array<{
      from: string;
      to: string;
      type: string;
      cardinality: string;
    }>;
  };
}

/**
 * Factory function to create a new SyntheticDataConfig with defaults
 */
export function createSyntheticDataConfig(
  params: Partial<SyntheticDataConfig>
): SyntheticDataConfig {
  return {
    dataType: params.dataType || SyntheticDataType.STUDENT_PERFORMANCE,
    recordCount: params.recordCount || 1000,
    demographicDistribution: params.demographicDistribution || DemographicDistribution.UK_NATIONAL,
    keyStage: params.keyStage,
    academicYearRange: params.academicYearRange || [new Date().getFullYear() - 1, new Date().getFullYear()],
    includeSpecialEducationalNeeds: params.includeSpecialEducationalNeeds || false,
    privacyMethod: params.privacyMethod,
    generateRelationships: params.generateRelationships || false,
    seed: params.seed || Math.floor(Math.random() * 1000000),
    additionalParams: params.additionalParams || {},
    customDemographics: params.customDemographics
  };
}

/**
 * Factory function to create an empty synthetic dataset structure
 */
export function createEmptySyntheticDataset(
  config: SyntheticDataConfig,
  schema: any
): SyntheticDataset {
  return {
    metadata: {
      id: `dataset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      generatedAt: new Date(),
      config,
      statistics: {
        fieldStats: {}
      },
      additionalData: {}
    },
    records: [],
    schema
  };
}