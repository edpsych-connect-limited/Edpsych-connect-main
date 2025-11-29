/**
 * Impact metrics model for the citation tracking system
 * 
 * This module defines the data structures for tracking academic impact metrics
 * including traditional citation metrics and alternative metrics.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Time periods for metric calculation
 */
export enum MetricTimePeriod {
  ALL_TIME = 'all_time',
  FIVE_YEARS = 'five_years',
  TWO_YEARS = 'two_years',
  ONE_YEAR = 'one_year',
  CUSTOM = 'custom'
}

/**
 * Sources for metric data
 */
export enum MetricSource {
  INTERNAL = 'internal',
  WEB_OF_SCIENCE = 'web_of_science',
  SCOPUS = 'scopus',
  GOOGLE_SCHOLAR = 'google_scholar',
  CROSSREF = 'crossref',
  DIMENSIONS = 'dimensions',
  MICROSOFT_ACADEMIC = 'microsoft_academic',
  SEMANTIC_SCHOLAR = 'semantic_scholar',
  CUSTOM = 'custom'
}

/**
 * Academic metric type
 */
export enum MetricType {
  // Traditional citation metrics
  H_INDEX = 'h_index',
  I10_INDEX = 'i10_index',
  G_INDEX = 'g_index',
  M_INDEX = 'm_index',
  
  // Journal metrics
  IMPACT_FACTOR = 'impact_factor',
  EIGENFACTOR = 'eigenfactor',
  SNIP = 'snip', // Source Normalized Impact per Paper
  SJR = 'sjr', // SCImago Journal Rank
  
  // Alternative metrics
  ALTMETRIC_SCORE = 'altmetric_score',
  MENDELEY_READERS = 'mendeley_readers',
  TWITTER_MENTIONS = 'twitter_mentions',
  NEWS_MENTIONS = 'news_mentions',
  POLICY_MENTIONS = 'policy_mentions',
  WIKIPEDIA_CITATIONS = 'wikipedia_citations',
  BLOG_MENTIONS = 'blog_mentions',
  
  // Usage metrics
  DOWNLOADS = 'downloads',
  VIEWS = 'views',
  UNIQUE_VISITORS = 'unique_visitors',
  
  // Research outputs
  PUBLICATION_COUNT = 'publication_count',
  CITATION_COUNT = 'citation_count',
  
  // Field-normalized metrics
  FIELD_WEIGHTED_CITATION_IMPACT = 'field_weighted_citation_impact',
  PERCENTILE_RANK = 'percentile_rank',
  
  // Collaboration metrics
  COLLABORATION_INDEX = 'collaboration_index',
  INTERNATIONAL_COLLABORATION_RATIO = 'international_collaboration_ratio',
  
  // Custom metrics
  CUSTOM = 'custom'
}

/**
 * Research field categorization
 */
export enum ResearchField {
  EDUCATION = 'education',
  PSYCHOLOGY = 'psychology',
  COGNITIVE_SCIENCE = 'cognitive_science',
  NEUROSCIENCE = 'neuroscience',
  COMPUTER_SCIENCE = 'computer_science',
  DATA_SCIENCE = 'data_science',
  SOCIAL_SCIENCES = 'social_sciences',
  HUMANITIES = 'humanities',
  MEDICINE = 'medicine',
  NATURAL_SCIENCES = 'natural_sciences',
  ENGINEERING = 'engineering',
  MATHEMATICS = 'mathematics',
  OTHER = 'other'
}

/**
 * Metric value with metadata
 */
export interface MetricValue {
  value: number;
  date: Date;
  source: MetricSource;
  timePeriod: MetricTimePeriod;
  customPeriodStart?: Date;
  customPeriodEnd?: Date;
  percentile?: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Interface representing a metric definition
 */
export interface IMetricDefinition {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  standardDeviation?: number;
  formula?: string;
  customParameters?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Class representing a metric definition
 */
export class MetricDefinition implements IMetricDefinition {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  standardDeviation?: number;
  formula?: string;
  customParameters?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(definition: Partial<IMetricDefinition>) {
    this.id = definition.id || uuidv4();
    
    // Required fields
    if (!definition.name) {
      throw new Error('Metric name is required');
    }
    this.name = definition.name;
    
    if (!definition.description) {
      throw new Error('Metric description is required');
    }
    this.description = definition.description;
    
    this.type = definition.type || MetricType.CUSTOM;
    
    // Optional fields
    this.unit = definition.unit;
    this.minValue = definition.minValue;
    this.maxValue = definition.maxValue;
    this.standardDeviation = definition.standardDeviation;
    this.formula = definition.formula;
    this.customParameters = definition.customParameters;
    this.createdAt = definition.createdAt || new Date();
    this.updatedAt = definition.updatedAt || new Date();
  }
}

/**
 * Interface representing an impact metric record
 */
export interface IImpactMetricRecord {
  id: string;
  entityId: string; // ID of the researcher, publication, institution, etc.
  entityType: 'researcher' | 'publication' | 'journal' | 'institution' | 'department' | 'research_group';
  metricType: MetricType;
  field?: ResearchField;
  values: MetricValue[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

/**
 * Class representing an impact metric record
 */
export class ImpactMetricRecord implements IImpactMetricRecord {
  id: string;
  entityId: string;
  entityType: 'researcher' | 'publication' | 'journal' | 'institution' | 'department' | 'research_group';
  metricType: MetricType;
  field?: ResearchField;
  values: MetricValue[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;

  constructor(record: Partial<IImpactMetricRecord>) {
    this.id = record.id || uuidv4();
    
    // Required fields
    if (!record.entityId) {
      throw new Error('Entity ID is required');
    }
    this.entityId = record.entityId;
    
    if (!record.entityType) {
      throw new Error('Entity type is required');
    }
    this.entityType = record.entityType;
    
    if (!record.metricType) {
      throw new Error('Metric type is required');
    }
    this.metricType = record.metricType;
    
    // Optional fields
    this.field = record.field;
    this.values = record.values || [];
    this.createdAt = record.createdAt || new Date();
    this.updatedAt = record.updatedAt || new Date();
    this.metadata = record.metadata || {};
  }

  /**
   * Add a new metric value
   * 
   * @param value The metric value to add
   */
  addValue(value: MetricValue): void {
    this.values.push(value);
    this.updatedAt = new Date();
  }

  /**
   * Get the most recent metric value
   */
  getLatestValue(): MetricValue | undefined {
    if (this.values.length === 0) {
      return undefined;
    }

    return this.values.reduce((latest, current) => 
      current.date > latest.date ? current : latest, this.values[0]);
  }

  /**
   * Get metric values for a specific time period
   * 
   * @param timePeriod The time period to filter by
   * @param customStart Optional custom start date for custom time periods
   * @param customEnd Optional custom end date for custom time periods
   */
  getValuesByTimePeriod(
    timePeriod: MetricTimePeriod,
    customStart?: Date,
    customEnd?: Date
  ): MetricValue[] {
    return this.values.filter(value => {
      if (value.timePeriod !== timePeriod) {
        return false;
      }
      
      if (timePeriod === MetricTimePeriod.CUSTOM) {
        if (!customStart || !customEnd) {
          return false;
        }
        
        return value.customPeriodStart?.getTime() === customStart.getTime() &&
               value.customPeriodEnd?.getTime() === customEnd.getTime();
      }
      
      return true;
    });
  }

  /**
   * Get metric values from a specific source
   * 
   * @param source The source to filter by
   */
  getValuesBySource(source: MetricSource): MetricValue[] {
    return this.values.filter(value => value.source === source);
  }

  /**
   * Calculate the trend of this metric over time
   * 
   * @param period Number of values to consider for trend calculation
   */
  calculateTrend(period: number = 5): number {
    if (this.values.length < 2) {
      return 0;
    }

    // Sort values by date
    const sortedValues = [...this.values]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-period); // Take the most recent 'period' values
    
    if (sortedValues.length < 2) {
      return 0;
    }

    // Simple trend calculation: (latest - oldest) / oldest
    const oldest = sortedValues[0].value;
    const latest = sortedValues[sortedValues.length - 1].value;
    
    if (oldest === 0) {
      return latest > 0 ? 1 : 0; // Avoid division by zero
    }
    
    return (latest - oldest) / oldest;
  }
}

/**
 * Type for creating a new metric definition
 */
export type CreateMetricDefinitionInput = Omit<IMetricDefinition, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

/**
 * Type for updating an existing metric definition
 */
export type UpdateMetricDefinitionInput = Partial<Omit<IMetricDefinition, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for creating a new impact metric record
 */
export type CreateImpactMetricRecordInput = Omit<IImpactMetricRecord, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

/**
 * Type for updating an existing impact metric record
 */
export type UpdateImpactMetricRecordInput = Partial<Omit<IImpactMetricRecord, 'id' | 'createdAt' | 'updatedAt'>>;