/**
 * Base Generator Interface
 * 
 * Defines the common interface for all synthetic data generators.
 * Specialized generators for each data type will implement this interface.
 */

import { 
  SyntheticDataConfig,
  SyntheticDataset,
  createEmptySyntheticDataset
} from '../models/synthetic-data';

/**
 * Interface for all synthetic data generators
 */
export interface DataGenerator {
  /**
   * Generate a synthetic dataset according to the provided configuration
   */
  generate(config: SyntheticDataConfig): Promise<SyntheticDataset>;
  
  /**
   * Get a schema definition for the type of data this generator produces
   */
  getSchema(config: SyntheticDataConfig): any;
  
  /**
   * Validate the configuration for this generator
   * @returns An array of validation errors, or empty array if valid
   */
  validateConfig(config: SyntheticDataConfig): string[];
}

/**
 * Abstract base class for data generators
 * Provides common functionality for all generators
 */
export abstract class BaseDataGenerator implements DataGenerator {
  /**
   * Implement in derived classes to generate synthetic data
   */
  abstract generate(config: SyntheticDataConfig): Promise<SyntheticDataset>;
  
  /**
   * Implement in derived classes to provide schema for the generated data
   */
  abstract getSchema(config: SyntheticDataConfig): any;
  
  /**
   * Validates the basic configuration parameters
   * Derived classes should extend this with type-specific validation
   */
  validateConfig(config: SyntheticDataConfig): string[] {
    const errors: string[] = [];
    
    if (!config) {
      errors.push('Configuration is required');
      return errors;
    }
    
    if (config.recordCount <= 0) {
      errors.push('Record count must be greater than zero');
    }
    
    if (config.recordCount > 1000000) {
      errors.push('Record count exceeds maximum allowed (1,000,000)');
    }
    
    return errors;
  }
  
  /**
   * Creates an empty dataset with proper schema
   * Utility method for derived classes
   */
  protected createInitialDataset(config: SyntheticDataConfig): SyntheticDataset {
    const schema = this.getSchema(config);
    return createEmptySyntheticDataset(config, schema);
  }
  
  /**
   * Initializes a random number generator with the provided seed
   * Ensures reproducible data generation
   */
  protected initializeRandom(seed: number): () => number {
    // Simple seeded random number generator
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }
  
  /**
   * Utility to generate normally distributed random values
   * Uses Box-Muller transform
   */
  protected normalRandom(random: () => number, mean: number, stdDev: number): number {
    const u1 = random();
    const u2 = random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
  
  /**
   * Creates a weighted random selection function
   * Useful for generating values according to specific distributions
   */
  protected createWeightedRandomSelector<T>(
    items: T[],
    weights: number[],
    random: () => number
  ): () => T {
    // Normalize weights to sum to 1
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Create cumulative weights
    const cumulativeWeights: number[] = [];
    let cumWeight = 0;
    for (const weight of normalizedWeights) {
      cumWeight += weight;
      cumulativeWeights.push(cumWeight);
    }
    
    // Return selector function
    return () => {
      const r = random();
      for (let i = 0; i < cumulativeWeights.length; i++) {
        if (r <= cumulativeWeights[i]) {
          return items[i];
        }
      }
      return items[items.length - 1];
    };
  }
  
  /**
   * Calculates basic statistics for a numeric array
   */
  protected calculateStatistics(values: number[]): {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  } {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        stdDev: 0
      };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const sum = sorted.reduce((s, v) => s + v, 0);
    const mean = sum / sorted.length;
    
    // Calculate median
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    
    // Calculate standard deviation
    const squareDiffs = sorted.map(v => (v - mean) ** 2);
    const variance = squareDiffs.reduce((s, v) => s + v, 0) / sorted.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      min,
      max,
      mean,
      median,
      stdDev
    };
  }
}