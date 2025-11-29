import { logger } from "@/lib/logger";
/**
 * Impact Metrics Service
 * 
 * This service provides functionality for calculating, analyzing, and comparing
 * academic impact metrics for researchers, publications, and institutions.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  ImpactMetricRecord, 
  MetricType, 
  MetricValue,
  MetricSource,
  MetricTimePeriod,
  ResearchField
} from '../models/impact-metrics';

/**
 * Service response type for impact metrics operations
 */
export interface ImpactMetricsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Impact metrics search parameters
 */
export interface ImpactMetricsSearchParams {
  entityId?: string;
  entityType?: 'researcher' | 'publication' | 'journal' | 'institution' | 'department' | 'research_group';
  metricType?: MetricType;
  field?: ResearchField;
  source?: MetricSource;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Parameters for calculating researcher metrics
 */
export interface ResearcherMetricsParams {
  timePeriod?: MetricTimePeriod;
  customStartDate?: Date;
  customEndDate?: Date;
  includeFieldNormalized?: boolean;
  includeAltmetrics?: boolean;
  includeAdvancedMetrics?: boolean;
  source?: MetricSource;
}

/**
 * Results of researcher metrics calculation
 */
export interface ResearcherMetricsResult {
  researcherId: string;
  researcherName: string;
  academicAge: number;
  
  // Basic metrics
  publicationCount: number;
  citationCount: number;
  hIndex: number;
  i10Index: number;
  gIndex: number;
  
  // Advanced metrics
  mIndex?: number;
  contemporaryHIndex?: number;
  
  // Field-normalized metrics
  fieldNormalizedCitationImpact?: number;
  percentilesByField?: Record<string, number>;
  
  // Altmetrics
  altmetricScore?: number;
  socialMediaMentions?: number;
  newsMediaMentions?: number;
  policyDocumentCitations?: number;
  
  // Temporal data
  yearlyMetrics?: {
    year: number;
    publicationCount: number;
    citationCount: number;
    hIndex: number;
  }[];
  
  // Comparison data
  fieldAverage?: {
    publicationCount: number;
    citationCount: number;
    hIndex: number;
  };
  
  // Metadata
  timePeriod: MetricTimePeriod;
  customStartDate?: Date;
  customEndDate?: Date;
  calculatedAt: Date;
  source: MetricSource;
}

/**
 * Service for calculating and analyzing academic impact metrics
 */
export class ImpactMetricsService {
  private metricRecords: Map<string, ImpactMetricRecord>;
  private researcherPublications: Map<string, string[]>; // Researcher ID -> Publication IDs
  private publicationCitations: Map<string, number>; // Publication ID -> Citation count
  
  /**
   * Create a new Impact Metrics Service instance
   */
  constructor() {
    this.metricRecords = new Map<string, ImpactMetricRecord>();
    this.researcherPublications = new Map<string, string[]>();
    this.publicationCitations = new Map<string, number>();
  }

  /**
   * Calculate comprehensive metrics for a researcher
   * 
   * @param researcherId Researcher ID
   * @param params Calculation parameters
   * @returns Response with calculated metrics
   */
  async calculateResearcherMetrics(
    researcherId: string,
    params: ResearcherMetricsParams = {}
  ): Promise<ImpactMetricsResponse<ResearcherMetricsResult>> {
    try {
      // Default parameters
      const timePeriod = params.timePeriod || MetricTimePeriod.ALL_TIME;
      const includeFieldNormalized = params.includeFieldNormalized !== false;
      const includeAltmetrics = params.includeAltmetrics !== false;
      const includeAdvancedMetrics = params.includeAdvancedMetrics !== false;
      const source = params.source || MetricSource.INTERNAL;
      
      // Get researcher publications and citation counts
      const publicationIds = this.researcherPublications.get(researcherId) || [];
      const citationCounts = publicationIds.map(id => this.publicationCitations.get(id) || 0);
      
      // Calculate basic metrics
      const publicationCount = publicationIds.length;
      const citationCount = citationCounts.reduce((sum, count) => sum + count, 0);
      
      // H-index calculation
      const sortedCounts = [...citationCounts].sort((a, b) => b - a);
      let hIndex = 0;
      for (let i = 0; i < sortedCounts.length; i++) {
        if (sortedCounts[i] >= i + 1) {
          hIndex = i + 1;
        } else {
          break;
        }
      }
      
      // i10-index calculation
      const i10Index = citationCounts.filter(count => count >= 10).length;
      
      // G-index calculation
      let sumCitations = 0;
      let gIndex = 0;
      for (let i = 0; i < sortedCounts.length; i++) {
        sumCitations += sortedCounts[i];
        if (sumCitations >= Math.pow(i + 1, 2)) {
          gIndex = i + 1;
        } else {
          break;
        }
      }
      
      // Advanced metrics calculation
      let mIndex: number | undefined;
      let contemporaryHIndex: number | undefined;
      
      if (includeAdvancedMetrics) {
        // Mock data for demonstration
        const academicAge = 10; // Years since first publication
        mIndex = hIndex / academicAge;
        contemporaryHIndex = Math.round(hIndex * 0.9); // Simplified calculation
      }
      
      // Field-normalized metrics
      let fieldNormalizedCitationImpact: number | undefined;
      let percentilesByField: Record<string, number> | undefined;
      
      if (includeFieldNormalized) {
        // Mock data for demonstration
        fieldNormalizedCitationImpact = 1.2; // Above average
        percentilesByField = {
          [ResearchField.EDUCATION]: 85,
          [ResearchField.PSYCHOLOGY]: 78,
          [ResearchField.COGNITIVE_SCIENCE]: 92
        };
      }
      
      // Altmetrics
      let altmetricScore: number | undefined;
      let socialMediaMentions: number | undefined;
      let newsMediaMentions: number | undefined;
      let policyDocumentCitations: number | undefined;
      
      if (includeAltmetrics) {
        // Mock data for demonstration
        altmetricScore = 65.7;
        socialMediaMentions = 120;
        newsMediaMentions = 5;
        policyDocumentCitations = 3;
      }
      
      // Yearly metrics (simplified mock data)
      const yearlyMetrics = [
        { year: 2023, publicationCount: 3, citationCount: 15, hIndex: 3 },
        { year: 2024, publicationCount: 5, citationCount: 25, hIndex: 4 },
        { year: 2025, publicationCount: 4, citationCount: 10, hIndex: 5 }
      ];
      
      // Field average comparison (mock data)
      const fieldAverage = {
        publicationCount: 4,
        citationCount: 18,
        hIndex: 3
      };
      
      // Create result object
      const result: ResearcherMetricsResult = {
        researcherId,
        researcherName: 'Researcher Name', // This would come from the researcher profile
        academicAge: 10, // This would be calculated from first publication date
        publicationCount,
        citationCount,
        hIndex,
        i10Index,
        gIndex,
        timePeriod,
        calculatedAt: new Date(),
        source
      };
      
      // Add optional fields if calculated
      if (includeAdvancedMetrics) {
        result.mIndex = mIndex;
        result.contemporaryHIndex = contemporaryHIndex;
      }
      
      if (includeFieldNormalized) {
        result.fieldNormalizedCitationImpact = fieldNormalizedCitationImpact;
        result.percentilesByField = percentilesByField;
      }
      
      if (includeAltmetrics) {
        result.altmetricScore = altmetricScore;
        result.socialMediaMentions = socialMediaMentions;
        result.newsMediaMentions = newsMediaMentions;
        result.policyDocumentCitations = policyDocumentCitations;
      }
      
      result.yearlyMetrics = yearlyMetrics;
      result.fieldAverage = fieldAverage;
      
      if (timePeriod === MetricTimePeriod.CUSTOM) {
        result.customStartDate = params.customStartDate;
        result.customEndDate = params.customEndDate;
      }
      
      // Store the calculated metrics
      this.recordMetric(
        researcherId,
        'researcher',
        MetricType.H_INDEX,
        {
          value: hIndex,
          date: new Date(),
          source: MetricSource.INTERNAL,
          timePeriod
        }
      );
      
      this.recordMetric(
        researcherId,
        'researcher',
        MetricType.I10_INDEX,
        {
          value: i10Index,
          date: new Date(),
          source: MetricSource.INTERNAL,
          timePeriod
        }
      );
      
      this.recordMetric(
        researcherId,
        'researcher',
        MetricType.G_INDEX,
        {
          value: gIndex,
          date: new Date(),
          source: MetricSource.INTERNAL,
          timePeriod
        }
      );
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'RESEARCHER_METRICS_CALCULATION_FAILED'
      };
    }
  }

  /**
   * Compare metrics between researchers
   * 
   * @param researcherIds Array of researcher IDs to compare
   * @param params Calculation parameters
   * @returns Response with comparison results
   */
  async compareResearchers(
    researcherIds: string[],
    params: ResearcherMetricsParams = {}
  ): Promise<ImpactMetricsResponse<{
    researchers: ResearcherMetricsResult[];
    comparisonDate: Date;
  }>> {
    try {
      const researchers: ResearcherMetricsResult[] = [];
      
      // Calculate metrics for each researcher
      for (const researcherId of researcherIds) {
        const response = await this.calculateResearcherMetrics(researcherId, params);
        
        if (response.success && response.data) {
          researchers.push(response.data);
        }
      }
      
      return {
        success: true,
        data: {
          researchers,
          comparisonDate: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'RESEARCHER_COMPARISON_FAILED'
      };
    }
  }

  /**
   * Get historical metrics for an entity
   * 
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param metricType Metric type
   * @returns Response with historical metrics
   */
  async getMetricHistory(
    entityId: string,
    entityType: 'researcher' | 'publication' | 'journal' | 'institution',
    metricType: MetricType
  ): Promise<ImpactMetricsResponse<{
    entityId: string;
    entityType: string;
    metricType: MetricType;
    history: {
      date: Date;
      value: number;
      source: MetricSource;
    }[];
  }>> {
    try {
      // Generate a unique key for this entity and metric combination
      const key = `${entityType}:${entityId}:${metricType}`;
      
      // Get the metric record
      const record = this.metricRecords.get(key);
      
      if (!record) {
        return {
          success: false,
          error: 'No metrics found for the specified entity and metric type',
          code: 'NO_METRICS_FOUND'
        };
      }
      
      // Extract and format historical values
      const history = record.values.map(value => ({
        date: value.date,
        value: value.value,
        source: value.source
      })).sort((a, b) => a.date.getTime() - b.date.getTime());
      
      return {
        success: true,
        data: {
          entityId,
          entityType,
          metricType,
          history
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'METRIC_HISTORY_FAILED'
      };
    }
  }

  /**
   * Calculate field-normalized impact for a researcher
   * 
   * @param researcherId Researcher ID
   * @param field Research field
   * @returns Response with field-normalized impact metrics
   */
  async calculateFieldNormalizedImpact(
    researcherId: string,
    field: ResearchField
  ): Promise<ImpactMetricsResponse<{
    researcherId: string;
    field: ResearchField;
    fieldNormalizedCitationImpact: number;
    percentileRank: number;
    fieldAverageCitations: number;
    researcherCitations: number;
  }>> {
    try {
      // Get researcher citation count
      const publicationIds = this.researcherPublications.get(researcherId) || [];
      const researcherCitations = publicationIds
        .map(id => this.publicationCitations.get(id) || 0)
        .reduce((sum, count) => sum + count, 0);
      
      // Mock field average citation count
      const fieldAverageCitations = {
        [ResearchField.EDUCATION]: 25,
        [ResearchField.PSYCHOLOGY]: 35,
        [ResearchField.COGNITIVE_SCIENCE]: 40,
        [ResearchField.NEUROSCIENCE]: 45,
        [ResearchField.COMPUTER_SCIENCE]: 30,
        [ResearchField.DATA_SCIENCE]: 28,
        [ResearchField.SOCIAL_SCIENCES]: 22,
        [ResearchField.HUMANITIES]: 15,
        [ResearchField.MEDICINE]: 50,
        [ResearchField.NATURAL_SCIENCES]: 42,
        [ResearchField.ENGINEERING]: 32,
        [ResearchField.MATHEMATICS]: 20,
        [ResearchField.OTHER]: 30
      }[field] || 30;
      
      // Calculate field-normalized citation impact
      const fieldNormalizedCitationImpact = 
        fieldAverageCitations > 0 ? researcherCitations / fieldAverageCitations : 0;
      
      // Calculate percentile rank (mock calculation)
      const percentileRank = Math.min(99, Math.round(fieldNormalizedCitationImpact * 50));
      
      // Record the metric
      this.recordMetric(
        researcherId,
        'researcher',
        MetricType.FIELD_WEIGHTED_CITATION_IMPACT,
        {
          value: fieldNormalizedCitationImpact,
          date: new Date(),
          source: MetricSource.INTERNAL,
          timePeriod: MetricTimePeriod.ALL_TIME
        },
        field
      );
      
      return {
        success: true,
        data: {
          researcherId,
          field,
          fieldNormalizedCitationImpact,
          percentileRank,
          fieldAverageCitations,
          researcherCitations
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'FIELD_NORMALIZED_IMPACT_FAILED'
      };
    }
  }

  /**
   * Calculate altmetrics for a publication
   * 
   * @param publicationId Publication ID
   * @returns Response with altmetrics
   */
  async calculatePublicationAltmetrics(
    publicationId: string
  ): Promise<ImpactMetricsResponse<{
    publicationId: string;
    altmetricScore: number;
    socialMediaMentions: number;
    newsMediaMentions: number;
    blogMentions: number;
    policyDocumentCitations: number;
    wikipediaCitations: number;
    sources: {
      source: string;
      count: number;
      url?: string;
    }[];
  }>> {
    try {
      // Mock altmetrics data
      const altmetricScore = Math.floor(Math.random() * 100);
      const socialMediaMentions = Math.floor(Math.random() * 200);
      const newsMediaMentions = Math.floor(Math.random() * 10);
      const blogMentions = Math.floor(Math.random() * 20);
      const policyDocumentCitations = Math.floor(Math.random() * 5);
      const wikipediaCitations = Math.floor(Math.random() * 3);
      
      // Mock sources
      const sources = [
        { source: 'Twitter', count: Math.floor(Math.random() * 150), url: 'https://twitter.com' },
        { source: 'Facebook', count: Math.floor(Math.random() * 50), url: 'https://facebook.com' },
        { source: 'News Outlets', count: newsMediaMentions, url: 'https://news.example.com' },
        { source: 'Blogs', count: blogMentions, url: 'https://blogs.example.com' },
        { source: 'Policy Documents', count: policyDocumentCitations, url: 'https://policy.example.com' },
        { source: 'Wikipedia', count: wikipediaCitations, url: 'https://wikipedia.org' }
      ];
      
      // Record altmetric score
      this.recordMetric(
        publicationId,
        'publication',
        MetricType.ALTMETRIC_SCORE,
        {
          value: altmetricScore,
          date: new Date(),
          source: MetricSource.INTERNAL,
          timePeriod: MetricTimePeriod.ALL_TIME
        }
      );
      
      return {
        success: true,
        data: {
          publicationId,
          altmetricScore,
          socialMediaMentions,
          newsMediaMentions,
          blogMentions,
          policyDocumentCitations,
          wikipediaCitations,
          sources
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'PUBLICATION_ALTMETRICS_FAILED'
      };
    }
  }

  /**
   * Get citation network metrics for a researcher
   * 
   * @param researcherId Researcher ID
   * @returns Response with citation network metrics
   */
  async getCitationNetworkMetrics(
    researcherId: string
  ): Promise<ImpactMetricsResponse<{
    researcherId: string;
    collaborationIndex: number;
    internationalCollaborationRatio: number;
    topCollaborators: {
      researcherId: string;
      name: string;
      jointPublications: number;
      totalCitations: number;
    }[];
    citationClusters: {
      clusterId: string;
      publications: number;
      totalCitations: number;
      primaryTopic: string;
    }[];
  }>> {
    try {
      // Mock citation network data
      const collaborationIndex = 3.2; // Average number of authors per paper
      const internationalCollaborationRatio = 0.45; // 45% of collaborations are international
      
      // Mock top collaborators
      const topCollaborators = [
        { researcherId: 'r1', name: 'Jane Smith', jointPublications: 5, totalCitations: 120 },
        { researcherId: 'r2', name: 'John Doe', jointPublications: 3, totalCitations: 85 },
        { researcherId: 'r3', name: 'Alice Johnson', jointPublications: 2, totalCitations: 65 }
      ];
      
      // Mock citation clusters
      const citationClusters = [
        { clusterId: 'c1', publications: 4, totalCitations: 95, primaryTopic: 'Cognitive Development' },
        { clusterId: 'c2', publications: 3, totalCitations: 75, primaryTopic: 'Educational Technology' },
        { clusterId: 'c3', publications: 2, totalCitations: 45, primaryTopic: 'Learning Assessment' }
      ];
      
      // Record collaboration metrics
      this.recordMetric(
        researcherId,
        'researcher',
        MetricType.COLLABORATION_INDEX,
        {
          value: collaborationIndex,
          date: new Date(),
          source: MetricSource.INTERNAL,
          timePeriod: MetricTimePeriod.ALL_TIME
        }
      );
      
      this.recordMetric(
        researcherId,
        'researcher',
        MetricType.INTERNATIONAL_COLLABORATION_RATIO,
        {
          value: internationalCollaborationRatio,
          date: new Date(),
          source: MetricSource.INTERNAL,
          timePeriod: MetricTimePeriod.ALL_TIME
        }
      );
      
      return {
        success: true,
        data: {
          researcherId,
          collaborationIndex,
          internationalCollaborationRatio,
          topCollaborators,
          citationClusters
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'CITATION_NETWORK_METRICS_FAILED'
      };
    }
  }

  /**
   * Get metrics data for visualization
   * 
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param metricTypes Array of metric types to include
   * @returns Response with visualization data
   */
  async getVisualizationData(
    entityId: string,
    entityType: 'researcher' | 'publication' | 'journal' | 'institution',
    metricTypes: MetricType[]
  ): Promise<ImpactMetricsResponse<{
    entityId: string;
    entityType: string;
    timeSeries: {
      metricType: MetricType;
      data: {
        date: Date;
        value: number;
      }[];
    }[];
    radar: {
      categories: string[];
      values: number[];
      benchmark?: number[];
    };
  }>> {
    try {
      const timeSeries: {
        metricType: MetricType;
        data: {
          date: Date;
          value: number;
        }[];
      }[] = [];
      
      // Generate time series data for each metric type
      for (const metricType of metricTypes) {
        const key = `${entityType}:${entityId}:${metricType}`;
        const record = this.metricRecords.get(key);
        
        if (record) {
          const data = record.values
            .map(value => ({
              date: value.date,
              value: value.value
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
          
          timeSeries.push({
            metricType,
            data
          });
        }
      }
      
      // Generate radar chart data
      const categories = metricTypes.map(type => {
        switch (type) {
          case MetricType.H_INDEX: return 'H-index';
          case MetricType.I10_INDEX: return 'i10-index';
          case MetricType.G_INDEX: return 'G-index';
          case MetricType.ALTMETRIC_SCORE: return 'Altmetric';
          case MetricType.FIELD_WEIGHTED_CITATION_IMPACT: return 'FWCI';
          default: return type;
        }
      });
      
      const values = metricTypes.map(type => {
        const key = `${entityType}:${entityId}:${type}`;
        const record = this.metricRecords.get(key);
        
        if (record && record.values.length > 0) {
          // Get the most recent value
          const latestValue = record.values.reduce((latest, current) => 
            current.date > latest.date ? current : latest, record.values[0]);
          
          return latestValue.value;
        }
        
        return 0;
      });
      
      // Mock benchmark data
      const benchmark = metricTypes.map(() => Math.floor(Math.random() * 10));
      
      return {
        success: true,
        data: {
          entityId,
          entityType,
          timeSeries,
          radar: {
            categories,
            values,
            benchmark
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'VISUALIZATION_DATA_FAILED'
      };
    }
  }

  /**
   * Import metrics from external sources
   * 
   * @param source External source
   * @param data Metrics data to import
   * @returns Response with import results
   */
  async importMetrics(
    source: MetricSource,
    data: {
      entityId: string;
      entityType: 'researcher' | 'publication' | 'journal' | 'institution';
      metrics: {
        metricType: MetricType;
        value: number;
        date: Date;
      }[];
    }[]
  ): Promise<ImpactMetricsResponse<{
    imported: number;
    failed: number;
    results: {
      entityId: string;
      entityType: string;
      success: boolean;
      error?: string;
    }[];
  }>> {
    try {
      const results: {
        entityId: string;
        entityType: string;
        success: boolean;
        error?: string;
      }[] = [];
      
      let imported = 0;
      let failed = 0;
      
      // Process each entity's metrics
      for (const item of data) {
        try {
          // Import metrics for this entity
          for (const metric of item.metrics) {
            this.recordMetric(
              item.entityId,
              item.entityType,
              metric.metricType,
              {
                value: metric.value,
                date: metric.date,
                source,
                timePeriod: MetricTimePeriod.ALL_TIME
              }
            );
          }
          
          results.push({
            entityId: item.entityId,
            entityType: item.entityType,
            success: true
          });
          
          imported++;
        } catch (error) {
          results.push({
            entityId: item.entityId,
            entityType: item.entityType,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          failed++;
        }
      }
      
      return {
        success: true,
        data: {
          imported,
          failed,
          results
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'METRICS_IMPORT_FAILED'
      };
    }
  }

  // Private helper methods

  /**
   * Record a metric value
   * 
   * @param entityId Entity ID
   * @param entityType Entity type
   * @param metricType Metric type
   * @param value Metric value
   * @param field Optional research field
   */
  private recordMetric(
    entityId: string,
    entityType: 'researcher' | 'publication' | 'journal' | 'institution' | 'department' | 'research_group',
    metricType: MetricType,
    value: MetricValue,
    field?: ResearchField
  ): void {
    // Generate a unique key for this entity and metric combination
    const key = `${entityType}:${entityId}:${metricType}`;
    
    // Get or create the metric record
    let record = this.metricRecords.get(key);
    
    if (!record) {
      record = new ImpactMetricRecord({
        id: uuidv4(),
        entityId,
        entityType,
        metricType,
        field,
        values: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      });
      
      this.metricRecords.set(key, record);
    }
    
    // Add the new value
    record.addValue(value);
    record.updatedAt = new Date();
  }

  /**
   * Set researcher publications
   * 
   * @param researcherId Researcher ID
   * @param publicationIds Publication IDs
   */
  setResearcherPublications(researcherId: string, publicationIds: string[]): void {
    this.researcherPublications.set(researcherId, publicationIds);
  }

  /**
   * Set publication citation count
   * 
   * @param publicationId Publication ID
   * @param citationCount Citation count
   */
  setPublicationCitationCount(publicationId: string, citationCount: number): void {
    this.publicationCitations.set(publicationId, citationCount);
  }
}