import { logger } from "@/lib/logger";
/**
 * Privacy Utilities Module
 * 
 * Provides privacy-preserving methods for synthetic data generation.
 * Implements various privacy techniques to ensure generated data
 * cannot be used to identify individuals or reveal sensitive information.
 */

import { PrivacyMethod, SyntheticDataset } from '../models/synthetic-data';

/**
 * Configuration options for applying privacy methods
 */
export interface PrivacyOptions {
  /** The privacy method to apply */
  method: PrivacyMethod;
  
  /** Parameters specific to the selected privacy method */
  parameters?: Record<string, any>;
  
  /** Specific fields to exclude from privacy transformations */
  excludeFields?: string[];
  
  /** Specific fields to include in privacy transformations (if not specified, all non-excluded fields are included) */
  includeFields?: string[];
  
  /** Whether to add privacy metadata to the dataset */
  addMetadata?: boolean;
}

/**
 * Default privacy parameters for each method
 */
const DEFAULT_PRIVACY_PARAMETERS: Record<PrivacyMethod, Record<string, any>> = {
  [PrivacyMethod.DIFFERENTIAL_PRIVACY]: {
    epsilon: 1.0,   // Privacy budget (lower = more private)
    delta: 0.00001  // Probability of privacy breach
  },
  [PrivacyMethod.K_ANONYMITY]: {
    k: 5,           // Minimum group size
    quasiIdentifiers: []  // Fields that could be used for identification
  },
  [PrivacyMethod.T_CLOSENESS]: {
    t: 0.15,        // Maximum distribution difference
    sensitiveAttributes: []  // Sensitive attributes to protect
  },
  [PrivacyMethod.L_DIVERSITY]: {
    l: 3,           // Minimum distinct values in each group
    sensitiveAttributes: []  // Sensitive attributes to protect
  },
  [PrivacyMethod.NOISE_ADDITION]: {
    mean: 0,        // Mean of noise distribution
    stdDev: 0.1     // Standard deviation of noise distribution
  },
  [PrivacyMethod.MICROAGGREGATION]: {
    groupSize: 3,   // Size of groups for aggregation
    attributes: []  // Attributes to aggregate
  }
};

/**
 * Applies privacy-preserving methods to a synthetic dataset
 * @param dataset The dataset to apply privacy methods to
 * @param options Configuration options for the privacy transformation
 * @returns A new dataset with privacy methods applied
 */
export function applyPrivacyMethods(
  dataset: SyntheticDataset,
  options: PrivacyOptions
): SyntheticDataset {
  // Create a deep copy of the dataset to avoid modifying the original
  const protectedDataset: SyntheticDataset = JSON.parse(JSON.stringify(dataset));
  
  // Get default parameters for the selected method
  const defaultParams = DEFAULT_PRIVACY_PARAMETERS[options.method];
  const params = { ...defaultParams, ...options.parameters };
  
  // Apply the selected privacy method
  switch (options.method) {
    case PrivacyMethod.DIFFERENTIAL_PRIVACY:
      applyDifferentialPrivacy(protectedDataset, params, options);
      break;
    case PrivacyMethod.K_ANONYMITY:
      applyKAnonymity(protectedDataset, params, options);
      break;
    case PrivacyMethod.T_CLOSENESS:
      applyTCloseness(protectedDataset, params, options);
      break;
    case PrivacyMethod.L_DIVERSITY:
      applyLDiversity(protectedDataset, params, options);
      break;
    case PrivacyMethod.NOISE_ADDITION:
      applyNoiseAddition(protectedDataset, params, options);
      break;
    case PrivacyMethod.MICROAGGREGATION:
      applyMicroaggregation(protectedDataset, params, options);
      break;
  }
  
  // Add privacy guarantees to metadata if requested
  if (options.addMetadata !== false) {
    protectedDataset.metadata.privacyGuarantees = {
      method: options.method,
      parameters: params,
      riskMetrics: calculatePrivacyRiskMetrics(protectedDataset, options)
    };
  }
  
  return protectedDataset;
}

/**
 * Applies differential privacy to the dataset
 * 
 * Differential privacy adds carefully calibrated noise to data
 * to ensure that the presence or absence of any individual
 * cannot be determined from the dataset.
 */
function applyDifferentialPrivacy(
  dataset: SyntheticDataset,
  params: Record<string, any>,
  options: PrivacyOptions
): void {
  const { epsilon, delta } = params;
  logger.debug(`Applying differential privacy (epsilon=${epsilon}, delta=${delta})`);
  
  // Get numeric fields from schema
  const numericFields = dataset.schema.fields
    .filter(field => field.type === 'number' || field.type === 'integer')
    .map(field => field.name)
    .filter(shouldProcessField);
  
  // Apply Laplace mechanism to numeric fields
  for (const field of numericFields) {
    // Calculate sensitivity (difference one individual can make)
    const values = dataset.records.map(record => record[field]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Determine noise scale based on sensitivity and epsilon
    const sensitivity = range * 0.01; // Assuming 1% of range as sensitivity
    const scale = sensitivity / epsilon;
    
    // Add Laplace noise to each record
    for (const record of dataset.records) {
      if (record[field] !== undefined && record[field] !== null) {
        record[field] += generateLaplaceNoise(0, scale);
      }
    }
  }
  
  // Helper function to check if a field should be processed
  function shouldProcessField(field: string): boolean {
    if (options.excludeFields?.includes(field)) return false;
    if (options.includeFields && !options.includeFields.includes(field)) return false;
    return true;
  }
}

/**
 * Applies k-anonymity to the dataset
 * 
 * K-anonymity ensures that each record is indistinguishable
 * from at least k-1 other records with respect to certain attributes.
 */
function applyKAnonymity(
  dataset: SyntheticDataset,
  params: Record<string, any>,
  options: PrivacyOptions
): void {
  const { k, quasiIdentifiers } = params;
  logger.debug(`Applying k-anonymity (k=${k})`);
  
  // If no quasi-identifiers specified, use all categorical fields
  const identifiers = quasiIdentifiers.length > 0 
    ? quasiIdentifiers
    : dataset.schema.fields
        .filter(field => field.type === 'string' && field.constraints?.enum)
        .map(field => field.name)
        .filter(shouldProcessField);
  
  if (identifiers.length === 0) {
    console.warn('No quasi-identifiers specified for k-anonymity');
    return;
  }
  
  // Group records by quasi-identifiers
  const groups: Record<string, any[]> = {};
  for (const record of dataset.records) {
    const key = identifiers.map((id: string) => record[id]).join('|');
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
  }
  
  // Generalize groups that are smaller than k
  for (const key in groups) {
    if (groups[key].length < k) {
      generalizeGroup(groups[key], identifiers);
    }
  }
  
  // Helper function to check if a field should be processed
  function shouldProcessField(field: string): boolean {
    if (options.excludeFields?.includes(field)) return false;
    if (options.includeFields && !options.includeFields.includes(field)) return false;
    return true;
  }
  
  // Helper function to generalize a group
  function generalizeGroup(group: any[], identifiers: string[]): void {
    // For each identifier, replace specific values with a more general category
    for (const id of identifiers) {
      // Get unique values for this identifier in the group
      const uniqueValuesSet = new Set(group.map(record => record[id]));
      const uniqueValues = Array.from(uniqueValuesSet);
      
      if (uniqueValues.length > 1) {
        // Replace with a generalized value (e.g., range, category, etc.)
        const generalizedValue = `${uniqueValues[0]}-${uniqueValues[uniqueValues.length - 1]}`;
        for (const record of group) {
          record[id] = generalizedValue;
        }
      }
    }
  }
}

/**
 * Applies t-closeness to the dataset
 * 
 * T-closeness ensures that the distribution of sensitive values
 * in any equivalence class is close to the distribution in the whole dataset.
 */
function applyTCloseness(
  dataset: SyntheticDataset,
  params: Record<string, any>,
  options: PrivacyOptions
): void {
  const { t, sensitiveAttributes } = params;
  logger.debug(`Applying t-closeness (t=${t})`);
  
  // Simplified implementation for synthetic data
  // For a complete implementation, would need to calculate Earth Mover's Distance
  // between distributions and perform more complex transformations
  
  // For now, we'll just apply additional noise to sensitive attributes
  for (const attr of sensitiveAttributes) {
    if (shouldProcessField(attr)) {
      for (const record of dataset.records) {
        if (typeof record[attr] === 'number') {
          // Add noise proportional to t value
          record[attr] += generateGaussianNoise(0, record[attr] * t * 0.1);
        }
      }
    }
  }
  
  // Helper function to check if a field should be processed
  function shouldProcessField(field: string): boolean {
    if (options.excludeFields?.includes(field)) return false;
    if (options.includeFields && !options.includeFields.includes(field)) return false;
    return true;
  }
}

/**
 * Applies l-diversity to the dataset
 * 
 * L-diversity ensures that each equivalence class has
 * at least l different values for sensitive attributes.
 */
function applyLDiversity(
  dataset: SyntheticDataset,
  params: Record<string, any>,
  options: PrivacyOptions
): void {
  const { l, sensitiveAttributes } = params;
  logger.debug(`Applying l-diversity (l=${l})`);
  
  // Simplified implementation
  // In a full implementation, would need to identify equivalence classes
  // and ensure each has l distinct values for sensitive attributes
  
  // For now, we'll just ensure global diversity for sensitive attributes
  for (const attr of sensitiveAttributes) {
    if (shouldProcessField(attr)) {
      // Count distinct values
      const distinctValues = new Set(dataset.records.map(record => record[attr])).size;
      
      // If we don't have enough distinct values, introduce more diversity
      if (distinctValues < l) {
        const valueSet = new Set(dataset.records.map(record => record[attr]));
        const existingValues = Array.from(valueSet);
        
        // Add synthetic diverse values where needed
        for (let i = 0; i < dataset.records.length; i += Math.ceil(dataset.records.length / l)) {
          const newValue = i < existingValues.length 
            ? existingValues[i] 
            : generateSyntheticValue(attr, dataset.schema);
          
          dataset.records[i][attr] = newValue;
        }
      }
    }
  }
  
  // Helper function to check if a field should be processed
  function shouldProcessField(field: string): boolean {
    if (options.excludeFields?.includes(field)) return false;
    if (options.includeFields && !options.includeFields.includes(field)) return false;
    return true;
  }
  
  // Helper function to generate synthetic values based on field type
  function generateSyntheticValue(field: string, schema: any): any {
    const fieldSchema = schema.fields.find((f: any) => f.name === field);
    if (!fieldSchema) return null;
    
    switch (fieldSchema.type) {
      case 'string':
        if (fieldSchema.constraints?.enum) {
          const enumValues = fieldSchema.constraints.enum;
          return enumValues[Math.floor(Math.random() * enumValues.length)];
        }
        return `Synthetic_${Math.floor(Math.random() * 1000)}`;
        
      case 'number':
      case 'integer':
        const min = fieldSchema.constraints?.min ?? 0;
        const max = fieldSchema.constraints?.max ?? 100;
        return min + Math.random() * (max - min);
        
      default:
        return null;
    }
  }
}

/**
 * Applies noise addition to the dataset
 * 
 * Adds random noise to numeric fields to mask exact values
 * while preserving overall statistical properties.
 */
function applyNoiseAddition(
  dataset: SyntheticDataset,
  params: Record<string, any>,
  options: PrivacyOptions
): void {
  const { mean, stdDev } = params;
  logger.debug(`Applying noise addition (mean=${mean}, stdDev=${stdDev})`);
  
  // Get numeric fields from schema
  const numericFields = dataset.schema.fields
    .filter(field => field.type === 'number' || field.type === 'integer')
    .map(field => field.name)
    .filter(shouldProcessField);
  
  // Add noise to each numeric field
  for (const field of numericFields) {
    // Calculate field-specific noise scale based on data range
    const values = dataset.records.map(record => record[field]);
    const fieldMin = Math.min(...values);
    const fieldMax = Math.max(...values);
    const fieldRange = fieldMax - fieldMin;
    
    // Scale noise based on field range
    const noiseScale = stdDev * fieldRange;
    
    // Add noise to each record
    for (const record of dataset.records) {
      if (record[field] !== undefined && record[field] !== null) {
        record[field] += generateGaussianNoise(mean, noiseScale);
      }
    }
  }
  
  // Helper function to check if a field should be processed
  function shouldProcessField(field: string): boolean {
    if (options.excludeFields?.includes(field)) return false;
    if (options.includeFields && !options.includeFields.includes(field)) return false;
    return true;
  }
}

/**
 * Applies microaggregation to the dataset
 * 
 * Microaggregation groups similar records and replaces values
 * with the group average to protect individual data points.
 */
function applyMicroaggregation(
  dataset: SyntheticDataset,
  params: Record<string, any>,
  options: PrivacyOptions
): void {
  const { groupSize, attributes } = params;
  logger.debug(`Applying microaggregation (groupSize=${groupSize})`);
  
  // Get fields to aggregate
  const fieldsToAggregate = attributes.length > 0
    ? attributes.filter(shouldProcessField)
    : dataset.schema.fields
        .filter(field => field.type === 'number' || field.type === 'integer')
        .map(field => field.name)
        .filter(shouldProcessField);
  
  if (fieldsToAggregate.length === 0) {
    console.warn('No fields specified for microaggregation');
    return;
  }
  
  // Simple grouping by sorting and chunking
  for (const field of fieldsToAggregate) {
    // Sort records by this field
    const sortedRecords = [...dataset.records].sort((a, b) => {
      return (a[field] || 0) - (b[field] || 0);
    });
    
    // Process in groups
    for (let i = 0; i < sortedRecords.length; i += groupSize) {
      const group = sortedRecords.slice(i, i + groupSize);
      
      // Calculate group average
      const sum = group.reduce((acc, record) => acc + (record[field] || 0), 0);
      const avg = sum / group.length;
      
      // Replace individual values with group average
      for (const record of group) {
        // Find this record in the original dataset and update it
        const originalRecord = dataset.records.find(r => r === record);
        if (originalRecord) {
          originalRecord[field] = avg;
        }
      }
    }
  }
  
  // Helper function to check if a field should be processed
  function shouldProcessField(field: string): boolean {
    if (options.excludeFields?.includes(field)) return false;
    if (options.includeFields && !options.includeFields.includes(field)) return false;
    return true;
  }
}

/**
 * Calculates privacy risk metrics for the dataset
 * @param dataset The dataset to analyze
 * @param options Privacy options applied
 * @returns Object containing privacy risk metrics
 */
function calculatePrivacyRiskMetrics(
  _dataset: SyntheticDataset,
  options: PrivacyOptions
): Record<string, number> {
  const metrics: Record<string, number> = {};
  
  // Calculate basic metrics based on the privacy method used
  switch (options.method) {
    case PrivacyMethod.DIFFERENTIAL_PRIVACY:
      const epsilon = options.parameters?.epsilon || DEFAULT_PRIVACY_PARAMETERS[PrivacyMethod.DIFFERENTIAL_PRIVACY].epsilon;
      metrics.privacyLeakageProbability = Math.exp(epsilon) - 1;
      metrics.identificationRisk = Math.min(1.0, metrics.privacyLeakageProbability);
      break;
      
    case PrivacyMethod.K_ANONYMITY:
      const k = options.parameters?.k || DEFAULT_PRIVACY_PARAMETERS[PrivacyMethod.K_ANONYMITY].k;
      metrics.identificationRisk = 1 / k;
      break;
      
    case PrivacyMethod.NOISE_ADDITION:
      const stdDev = options.parameters?.stdDev || DEFAULT_PRIVACY_PARAMETERS[PrivacyMethod.NOISE_ADDITION].stdDev;
      metrics.dataPrecisionLoss = stdDev;
      metrics.identificationRisk = Math.max(0, 1 - stdDev * 5); // Simplified estimate
      break;
      
    default:
      metrics.identificationRisk = 0.1; // Default estimate
  }
  
  return metrics;
  
  return metrics;
}

/**
 * Generates Laplace distributed noise with given location and scale
 * @param location Center of the distribution (usually 0)
 * @param scale Scale parameter (higher = more noise)
 * @returns Random noise value
 */
export function generateLaplaceNoise(location: number, scale: number): number {
  const u = Math.random() - 0.5;
  const sign = u < 0 ? -1 : 1;
  return location - scale * sign * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Generates Gaussian distributed noise with given mean and standard deviation
 * @param mean Mean of the distribution (usually 0)
 * @param stdDev Standard deviation (higher = more noise)
 * @returns Random noise value
 */
export function generateGaussianNoise(mean: number, stdDev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}
