/**
 * Data Validator Module
 * 
 * Provides validation functionality for synthetic datasets to ensure they meet
 * quality, statistical, and utility requirements.
 */

import { SyntheticDataset, SyntheticDataType } from '../models/synthetic-data';

/**
 * Validation result containing status and any issues found
 */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  statistics: Record<string, any>;
}

/**
 * Describes a validation issue found in the dataset
 */
export interface ValidationIssue {
  type: 'error' | 'warning';
  field?: string;
  message: string;
  affectedRecords?: number;
  details?: any;
}

/**
 * Options for validating a dataset
 */
export interface ValidationOptions {
  /** Validation strictness level */
  strictness?: 'low' | 'medium' | 'high';
  
  /** Whether to validate statistical properties */
  validateStatistics?: boolean;
  
  /** Whether to validate data utility for research purposes */
  validateUtility?: boolean;
  
  /** Whether to validate privacy characteristics */
  validatePrivacy?: boolean;
  
  /** Custom validation rules */
  customRules?: Array<(dataset: SyntheticDataset) => ValidationIssue[]>;
}

/**
 * Default validation options
 */
const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  strictness: 'medium',
  validateStatistics: true,
  validateUtility: true,
  validatePrivacy: false,
  customRules: []
};

/**
 * Main validator class for synthetic datasets
 */
export class DataValidator {
  private options: ValidationOptions;
  
  /**
   * Creates a new data validator with the specified options
   */
  constructor(options: ValidationOptions = {}) {
    this.options = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  }
  
  /**
   * Validates a synthetic dataset according to quality criteria
   * @param dataset The dataset to validate
   * @returns Validation result with issues and statistics
   */
  public validate(dataset: SyntheticDataset): ValidationResult {
    const issues: ValidationIssue[] = [];
    const statistics: Record<string, any> = {};
    
    // Basic validation
    issues.push(...this.validateBasicProperties(dataset));
    
    // Schema compliance validation
    issues.push(...this.validateSchemaCompliance(dataset));
    
    // Data type specific validation
    issues.push(...this.validateDataTypeSpecific(dataset));
    
    // Statistical validation if enabled
    if (this.options.validateStatistics) {
      const statsResults = this.validateStatistics(dataset);
      issues.push(...statsResults.issues);
      Object.assign(statistics, statsResults.statistics);
    }
    
    // Utility validation if enabled
    if (this.options.validateUtility) {
      issues.push(...this.validateUtility(dataset));
    }
    
    // Privacy validation if enabled
    if (this.options.validatePrivacy) {
      issues.push(...this.validatePrivacy(dataset));
    }
    
    // Run custom validation rules if any
    if (this.options.customRules && this.options.customRules.length > 0) {
      for (const rule of this.options.customRules) {
        issues.push(...rule(dataset));
      }
    }
    
    // Determine overall validity based on errors (warnings don't make it invalid)
    const hasErrors = issues.some(issue => issue.type === 'error');
    
    return {
      valid: !hasErrors,
      issues,
      statistics
    };
  }
  
  /**
   * Validates basic properties of the dataset
   */
  private validateBasicProperties(dataset: SyntheticDataset): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check if dataset has records
    if (!dataset.records || dataset.records.length === 0) {
      issues.push({
        type: 'error',
        message: 'Dataset contains no records'
      });
    }
    
    // Check if record count matches expected count from config
    const expectedCount = dataset.metadata.config.recordCount;
    const actualCount = dataset.records.length;
    if (actualCount !== expectedCount) {
      issues.push({
        type: 'warning',
        message: `Expected ${expectedCount} records but found ${actualCount}`,
        details: { expectedCount, actualCount }
      });
    }
    
    // Check for metadata completeness
    if (!dataset.metadata.generatedAt) {
      issues.push({
        type: 'warning',
        message: 'Missing generation timestamp in metadata'
      });
    }
    
    return issues;
  }
  
  /**
   * Validates that all records comply with the dataset schema
   */
  private validateSchemaCompliance(dataset: SyntheticDataset): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const { fields } = dataset.schema;
    
    // Check each field in the schema
    for (const field of fields) {
      // Count records with missing required fields
      if (field.constraints?.required) {
        const missingCount = dataset.records.filter(record => 
          record[field.name] === undefined || record[field.name] === null
        ).length;
        
        if (missingCount > 0) {
          issues.push({
            type: 'error',
            field: field.name,
            message: `Required field "${field.name}" missing in ${missingCount} records`,
            affectedRecords: missingCount
          });
        }
      }
      
      // Check data types
      const typeErrors = dataset.records.filter(record => {
        const value = record[field.name];
        if (value === undefined || value === null) return false;
        
        switch (field.type) {
          case 'string':
            return typeof value !== 'string';
          case 'number':
          case 'integer':
            return typeof value !== 'number';
          case 'boolean':
            return typeof value !== 'boolean';
          case 'array':
            return !Array.isArray(value);
          case 'object':
            return typeof value !== 'object' || Array.isArray(value);
          case 'date':
            return !(value instanceof Date) && isNaN(Date.parse(value));
          default:
            return false;
        }
      }).length;
      
      if (typeErrors > 0) {
        issues.push({
          type: 'error',
          field: field.name,
          message: `Type mismatch for field "${field.name}" in ${typeErrors} records (expected ${field.type})`,
          affectedRecords: typeErrors
        });
      }
      
      // Validate range constraints for numeric fields
      if ((field.type === 'number' || field.type === 'integer') && 
          (field.constraints?.min !== undefined || field.constraints?.max !== undefined)) {
        
        const min = field.constraints.min;
        const max = field.constraints.max;
        
        const outOfRangeCount = dataset.records.filter(record => {
          const value = record[field.name];
          if (value === undefined || value === null) return false;
          
          return (min !== undefined && value < min) || (max !== undefined && value > max);
        }).length;
        
        if (outOfRangeCount > 0) {
          issues.push({
            type: 'error',
            field: field.name,
            message: `Value out of range for field "${field.name}" in ${outOfRangeCount} records`,
            affectedRecords: outOfRangeCount,
            details: { min, max }
          });
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Performs data type specific validation
   */
  private validateDataTypeSpecific(dataset: SyntheticDataset): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const dataType = dataset.metadata.config.dataType;
    
    switch (dataType) {
      case SyntheticDataType.STUDENT_PERFORMANCE:
        issues.push(...this.validateStudentPerformance(dataset));
        break;
      // Add cases for other data types as they are implemented
    }
    
    return issues;
  }
  
  /**
   * Validates student performance data
   */
  private validateStudentPerformance(dataset: SyntheticDataset): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for grade consistency within key stages
    const keyStage = dataset.metadata.config.keyStage;
    if (keyStage) {
      // Different validation logic depending on key stage
      // This would contain UK-specific educational validation
    }
    
    // Check for subject coverage
    const requiredSubjects = ['mathematics', 'english', 'science'];
    
    // Check if we can find these subjects in the data
    const hasAllSubjects = requiredSubjects.every(subject => {
      // Look for subject either as a field or within a subjects object
      return dataset.records.some(record => 
        record[subject] !== undefined || 
        (record.subjects && record.subjects[subject] !== undefined)
      );
    });
    
    if (!hasAllSubjects) {
      issues.push({
        type: 'warning',
        message: 'Dataset is missing data for core subjects',
        details: { requiredSubjects }
      });
    }
    
    return issues;
  }
  
  /**
   * Validates statistical properties of the dataset
   */
  private validateStatistics(dataset: SyntheticDataset): { 
    issues: ValidationIssue[];
    statistics: Record<string, any>;
  } {
    const issues: ValidationIssue[] = [];
    const statistics: Record<string, any> = {};
    
    // Get numeric fields from schema
    const numericFields = dataset.schema.fields
      .filter(field => field.type === 'number' || field.type === 'integer')
      .map(field => field.name);
    
    // Calculate basic statistics for numeric fields
    for (const field of numericFields) {
      const values = dataset.records
        .map(record => record[field])
        .filter(value => value !== undefined && value !== null);
      
      if (values.length === 0) continue;
      
      // Calculate statistics
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
      
      // Check for unusual distributions
      if (min === max) {
        issues.push({
          type: 'warning',
          field,
          message: `Field "${field}" has no variation (all values are ${min})`,
          details: { min, max, mean }
        });
      }
      
      // Check for abnormal standard deviation
      if (stdDev === 0) {
        issues.push({
          type: 'warning',
          field,
          message: `Field "${field}" has zero standard deviation`,
          details: { stdDev, mean }
        });
      }
      
      // Save statistics
      statistics[field] = { min, max, mean, median, stdDev };
    }
    
    return { issues, statistics };
  }
  
  /**
   * Validates the utility of the dataset for research purposes
   */
  private validateUtility(dataset: SyntheticDataset): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for sufficient diversity in categorical fields
    const categoricalFields = dataset.schema.fields
      .filter(field => field.type === 'string' && field.constraints?.enum)
      .map(field => field.name);
    
    for (const field of categoricalFields) {
      // Count occurrences of each value
      const valueCounts: Record<string, number> = {};
      dataset.records.forEach(record => {
        const value = record[field];
        if (value !== undefined && value !== null) {
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        }
      });
      
      // Check for skewed distributions
      const uniqueValues = Object.keys(valueCounts).length;
      const expectedUnique = (dataset.schema.fields.find(f => f.name === field)?.constraints?.enum as string[])?.length || 0;
      
      if (uniqueValues < expectedUnique) {
        issues.push({
          type: 'warning',
          field,
          message: `Field "${field}" has insufficient diversity (${uniqueValues}/${expectedUnique} possible values represented)`,
          details: { uniqueValues, expectedUnique, valueCounts }
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Validates privacy characteristics of the dataset
   */
  private validatePrivacy(dataset: SyntheticDataset): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check if privacy method is specified
    if (!dataset.metadata.privacyGuarantees?.method) {
      issues.push({
        type: this.options.strictness === 'high' ? 'error' : 'warning',
        message: 'No privacy method specified for this dataset'
      });
      return issues;
    }
    
    // Check for potential identifiability issues
    // This would involve more sophisticated privacy analysis
    
    return issues;
  }
}