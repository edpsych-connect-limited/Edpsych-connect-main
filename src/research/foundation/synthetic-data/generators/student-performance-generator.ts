/**
 * Student Performance Data Generator
 * 
 * Generates synthetic student academic performance data with realistic
 * distributions and correlations typical of UK educational settings.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  SyntheticDataConfig,
  SyntheticDataset,
  SyntheticDataType,
  UKEducationKeyStage,
  DemographicDistribution
} from '../models/synthetic-data';
import { BaseDataGenerator } from './base-generator';

/**
 * Interface for student relationship data
 */
interface StudentFriendship {
  studentId: string;
  friendId: string;
  strength: number;
}

/**
 * Interface for class information
 */
interface ClassInfo {
  name: string;
  students: string[];
}

/**
 * Interface for relationship data structure
 */
interface RelationshipData {
  classes: Record<string, ClassInfo>;
  friendships: StudentFriendship[];
}

/**
 * Interface for demographic profiles used in data generation
 */
interface DemographicProfiles {
  getEthnicity: () => string;
  getHasSEN: () => boolean;
  getHasEAL: () => boolean;
  getEligibleForFSM: () => boolean;
  getSENType: (hasFSM: boolean) => string;
}

/**
 * Interface for base student record data
 */
interface StudentRecord {
  id: string;
  gender: string;
  yearGroup: number;
  age: number;
  hasSpecialEducationalNeeds: boolean;
  specialEducationalNeedsType: string | null;
  eligibleForFreeMeals: boolean;
  ethnicity: string;
  englishAsAdditionalLanguage: boolean;
  attendance: number;
  behaviour: number;
  class?: string;
  [key: string]: any; // Additional academic fields vary by key stage
}

/**
 * Generator for synthetic student performance data
 */
export class StudentPerformanceGenerator extends BaseDataGenerator {
  /**
   * Generate a synthetic student performance dataset
   */
  async generate(config: SyntheticDataConfig): Promise<SyntheticDataset> {
    // Validate configuration
    const errors = this.validateConfig(config);
    if (errors.length > 0) {
      throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }
    
    // Create initial empty dataset
    const dataset = this.createInitialDataset(config);
    
    // Initialize random number generator with seed
    const random = this.initializeRandom(config.seed || Date.now());
    
    // Generate demographic distributions based on configuration
    const demographicProfiles = this.generateDemographicProfiles(config, random);
    
    // Generate student records
    for (let i = 0; i < config.recordCount; i++) {
      const student = this.generateStudentRecord(config, random, demographicProfiles);
      dataset.records.push(student);
    }
    
    // Calculate statistics
    this.calculateDatasetStatistics(dataset);
    
    // Generate relationships if requested
    if (config.generateRelationships) {
      this.generateRelationships(dataset, config, random);
    }
    
    // Apply privacy methods if specified
    if (config.privacyMethod) {
      // This would call privacy enhancing techniques
      // Implemented in a separate privacy utility module
    }
    
    return dataset;
  }
  
  /**
   * Get schema for student performance data
   */
  getSchema(config: SyntheticDataConfig): any {
    // Define base fields that are common to all key stages
    const baseFields = [
      {
        name: 'id',
        type: 'string',
        description: 'Unique identifier for the student'
      },
      {
        name: 'gender',
        type: 'string',
        description: 'Student gender'
      },
      {
        name: 'yearGroup',
        type: 'number',
        description: 'Year group (1-13)'
      },
      {
        name: 'age',
        type: 'number',
        description: 'Student age in years'
      },
      {
        name: 'hasSpecialEducationalNeeds',
        type: 'boolean',
        description: 'Whether the student has special educational needs'
      },
      {
        name: 'specialEducationalNeedsType',
        type: 'string',
        description: 'Type of special educational needs (if applicable)'
      },
      {
        name: 'eligibleForFreeMeals',
        type: 'boolean',
        description: 'Whether the student is eligible for free school meals'
      },
      {
        name: 'ethnicity',
        type: 'string',
        description: 'Student ethnicity'
      },
      {
        name: 'englishAsAdditionalLanguage',
        type: 'boolean',
        description: 'Whether English is an additional language for the student'
      },
      {
        name: 'attendance',
        type: 'number',
        description: 'Attendance percentage'
      },
      {
        name: 'behaviour',
        type: 'number',
        description: 'Behaviour score (0-100)'
      }
    ];
    
    // Add key stage specific fields
    const keyStageFields = this.getKeyStageFields(config.keyStage);
    
    // Define relationships if needed
    const relationships = config.generateRelationships ? [
      {
        from: 'student',
        to: 'student',
        type: 'friendship',
        cardinality: 'many-to-many'
      },
      {
        from: 'student',
        to: 'class',
        type: 'enrollment',
        cardinality: 'many-to-one'
      }
    ] : [];
    
    return {
      fields: [...baseFields, ...keyStageFields],
      relationships
    };
  }
  
  /**
   * Validate configuration specific to student performance data
   */
  validateConfig(config: SyntheticDataConfig): string[] {
    // Call parent validation first
    const errors = super.validateConfig(config);
    
    // Check if data type is correct
    if (config.dataType !== SyntheticDataType.STUDENT_PERFORMANCE) {
      errors.push(`Invalid data type: ${config.dataType}. Expected: ${SyntheticDataType.STUDENT_PERFORMANCE}`);
    }
    
    return errors;
  }
  
  /**
   * Generate demographic profiles based on the selected distribution
   */
  /**
   * Generate demographic profiles based on selected distribution model
   * @param config Configuration for synthetic data generation
   * @param random Random number generator function
   * @returns Object with demographic selector functions
   */
  private generateDemographicProfiles(
    config: SyntheticDataConfig,
    random: () => number
  ): DemographicProfiles {
    // Define demographic distributions based on selected profile
    let ethnicityDistribution: [string, number][];
    let senDistribution: [boolean, number];
    let ealDistribution: [boolean, number];
    let fsmDistribution: [boolean, number];
    
    switch (config.demographicDistribution) {
      case DemographicDistribution.UK_NATIONAL:
        // Based on UK national averages
        ethnicityDistribution = [
          ['White British', 0.73],
          ['White Other', 0.07],
          ['Asian', 0.11],
          ['Black', 0.05],
          ['Mixed', 0.03],
          ['Other', 0.01]
        ];
        senDistribution = [true, 0.15]; // ~15% of students have SEN
        ealDistribution = [true, 0.21]; // ~21% EAL
        fsmDistribution = [true, 0.23]; // ~23% FSM
        break;
        
      case DemographicDistribution.LONDON:
        // London has higher diversity
        ethnicityDistribution = [
          ['White British', 0.43],
          ['White Other', 0.14],
          ['Asian', 0.18],
          ['Black', 0.13],
          ['Mixed', 0.08],
          ['Other', 0.04]
        ];
        senDistribution = [true, 0.14];
        ealDistribution = [true, 0.37];
        fsmDistribution = [true, 0.28];
        break;
        
      case DemographicDistribution.RURAL:
        // Rural areas tend to be less diverse
        ethnicityDistribution = [
          ['White British', 0.92],
          ['White Other', 0.03],
          ['Asian', 0.02],
          ['Black', 0.01],
          ['Mixed', 0.01],
          ['Other', 0.01]
        ];
        senDistribution = [true, 0.13];
        ealDistribution = [true, 0.08];
        fsmDistribution = [true, 0.19];
        break;
        
      case DemographicDistribution.URBAN_DIVERSE:
        // Urban diverse settings
        ethnicityDistribution = [
          ['White British', 0.38],
          ['White Other', 0.12],
          ['Asian', 0.21],
          ['Black', 0.18],
          ['Mixed', 0.08],
          ['Other', 0.03]
        ];
        senDistribution = [true, 0.16];
        ealDistribution = [true, 0.42];
        fsmDistribution = [true, 0.32];
        break;
        
      case DemographicDistribution.HIGH_NEEDS:
        // Setting with higher proportion of special needs
        ethnicityDistribution = [
          ['White British', 0.65],
          ['White Other', 0.08],
          ['Asian', 0.12],
          ['Black', 0.09],
          ['Mixed', 0.04],
          ['Other', 0.02]
        ];
        senDistribution = [true, 0.35]; // Higher SEN
        ealDistribution = [true, 0.25];
        fsmDistribution = [true, 0.38]; // Higher FSM
        break;
        
      case DemographicDistribution.CUSTOM:
        // Use custom demographics if provided
        if (config.customDemographics) {
          ethnicityDistribution = config.customDemographics.ethnicity || 
            [['White British', 1.0]];
          senDistribution = config.customDemographics.sen || [true, 0.15];
          ealDistribution = config.customDemographics.eal || [true, 0.21];
          fsmDistribution = config.customDemographics.fsm || [true, 0.23];
        } else {
          // Default to UK national if no custom demographics provided
          ethnicityDistribution = [
            ['White British', 0.73],
            ['White Other', 0.07],
            ['Asian', 0.11],
            ['Black', 0.05],
            ['Mixed', 0.03],
            ['Other', 0.01]
          ];
          senDistribution = [true, 0.15];
          ealDistribution = [true, 0.21];
          fsmDistribution = [true, 0.23];
        }
        break;
        
      default:
        // Default to UK national averages
        ethnicityDistribution = [
          ['White British', 0.73],
          ['White Other', 0.07],
          ['Asian', 0.11],
          ['Black', 0.05],
          ['Mixed', 0.03],
          ['Other', 0.01]
        ];
        senDistribution = [true, 0.15];
        ealDistribution = [true, 0.21];
        fsmDistribution = [true, 0.23];
    }
    
    // Create weighted selectors
    const ethnicitySelector = this.createWeightedRandomSelector(
      ethnicityDistribution.map(e => e[0]),
      ethnicityDistribution.map(e => e[1]),
      random
    );
    
    // Return all demographic selectors
    return {
      getEthnicity: ethnicitySelector,
      getHasSEN: () => random() < senDistribution[1],
      getHasEAL: () => random() < ealDistribution[1],
      getEligibleForFSM: () => random() < fsmDistribution[1],
      // SEN types distribution with correlation to FSM
      getSENType: (hasFSM: boolean) => {
        const senTypes = [
          'Specific Learning Difficulty',
          'Moderate Learning Difficulty',
          'Severe Learning Difficulty',
          'Profound & Multiple Learning Difficulty',
          'Social, Emotional and Mental Health',
          'Speech, Language and Communication Needs',
          'Hearing Impairment',
          'Visual Impairment',
          'Multi-Sensory Impairment',
          'Physical Disability',
          'Autistic Spectrum Disorder',
          'Other Difficulty/Disability'
        ];
        
        // Adjust weights based on FSM eligibility
        let weights = [
          0.15, 0.24, 0.04, 0.01, 0.17, 0.22, 0.02, 0.01, 0.01, 0.03, 0.08, 0.02
        ];
        
        if (hasFSM) {
          // Higher incidence of some needs in disadvantaged populations
          weights = [
            0.14, 0.28, 0.05, 0.01, 0.24, 0.16, 0.02, 0.01, 0.01, 0.02, 0.05, 0.01
          ];
        }
        
        const senTypeSelector = this.createWeightedRandomSelector(
          senTypes,
          weights,
          random
        );
        
        return senTypeSelector();
      }
    };
  }
  
  /**
   * Generate a single student record
   */
  /**
   * Generate a single student record with realistic demographic and academic data
   * @param config Configuration for synthetic data generation
   * @param random Random number generator function
   * @param demographicProfiles Demographic profile generators
   * @returns Complete student record with demographic and academic data
   */
  private generateStudentRecord(
    config: SyntheticDataConfig,
    random: () => number,
    demographicProfiles: DemographicProfiles
  ): StudentRecord {
    // Determine key stage based on configuration or randomly
    const keyStage = config.keyStage || this.selectRandomKeyStage(random);
    
    // Generate year group and age based on key stage
    const { yearGroup, age } = this.getYearGroupAndAge(keyStage, random);
    
    // Generate demographic information
    const eligibleForFreeMeals = demographicProfiles.getEligibleForFSM();
    const hasSpecialEducationalNeeds = demographicProfiles.getHasSEN();
    const specialEducationalNeedsType = hasSpecialEducationalNeeds 
      ? demographicProfiles.getSENType(eligibleForFreeMeals) 
      : null;
    
    // Generate base student record
    const student: StudentRecord = {
      id: uuidv4(),
      gender: random() < 0.5 ? 'Male' : 'Female',
      yearGroup,
      age,
      hasSpecialEducationalNeeds,
      specialEducationalNeedsType,
      eligibleForFreeMeals,
      ethnicity: demographicProfiles.getEthnicity(),
      englishAsAdditionalLanguage: demographicProfiles.getHasEAL(),
      // Attendance correlated with SEN and FSM
      attendance: this.generateAttendance(hasSpecialEducationalNeeds, eligibleForFreeMeals, random),
      // Behavior correlated with SEN and attendance
      behaviour: this.generateBehaviour(hasSpecialEducationalNeeds, random)
    };
    
    // Add key stage specific academic performance
    const academicPerformance = this.generateAcademicPerformance(
      keyStage,
      student,
      random
    );
    
    // Combine the base student record with academic performance data
    return {
      ...student,
      ...academicPerformance
    } as StudentRecord;
  }
  
  /**
   * Generate attendance value with realistic correlations
   */
  private generateAttendance(
    hasSEN: boolean,
    hasFSM: boolean,
    random: () => number
  ): number {
    // Base attendance
    let meanAttendance = 96;
    const stdDev = 3;
    
    // Apply factors that influence attendance
    if (hasSEN) meanAttendance -= 3;
    if (hasFSM) meanAttendance -= 2;
    
    // Generate attendance value with normal distribution
    let attendance = this.normalRandom(random, meanAttendance, stdDev);
    
    // Ensure value is within realistic bounds
    attendance = Math.max(70, Math.min(100, attendance));
    
    return parseFloat(attendance.toFixed(1));
  }
  
  /**
   * Generate behaviour score with realistic correlations
   */
  private generateBehaviour(
    hasSEN: boolean,
    random: () => number
  ): number {
    // Base behaviour score
    let meanBehaviour = 85;
    const stdDev = 10;
    
    // Apply factors that influence behaviour
    if (hasSEN) meanBehaviour -= 8;
    
    // Generate behaviour value with normal distribution
    let behaviour = this.normalRandom(random, meanBehaviour, stdDev);
    
    // Ensure value is within bounds
    behaviour = Math.max(30, Math.min(100, behaviour));
    
    return Math.round(behaviour);
  }
  
  /**
   * Select a random key stage
   */
  private selectRandomKeyStage(random: () => number): UKEducationKeyStage {
    const keyStages = [
      UKEducationKeyStage.EARLY_YEARS,
      UKEducationKeyStage.KEY_STAGE_1,
      UKEducationKeyStage.KEY_STAGE_2,
      UKEducationKeyStage.KEY_STAGE_3,
      UKEducationKeyStage.KEY_STAGE_4,
      UKEducationKeyStage.KEY_STAGE_5
    ];
    
    const weights = [0.1, 0.15, 0.3, 0.2, 0.15, 0.1];
    
    const keyStageSelector = this.createWeightedRandomSelector(
      keyStages,
      weights,
      random
    );
    
    return keyStageSelector();
  }
  
  /**
   * Get year group and age based on key stage
   */
  private getYearGroupAndAge(
    keyStage: UKEducationKeyStage,
    random: () => number
  ): { yearGroup: number; age: number } {
    let yearGroupRange: [number, number];
    let baseAge: number;
    
    switch (keyStage) {
      case UKEducationKeyStage.EARLY_YEARS:
        yearGroupRange = [0, 0]; // Reception year is sometimes marked as 0
        baseAge = 4;
        break;
      case UKEducationKeyStage.KEY_STAGE_1:
        yearGroupRange = [1, 2];
        baseAge = 5;
        break;
      case UKEducationKeyStage.KEY_STAGE_2:
        yearGroupRange = [3, 6];
        baseAge = 7;
        break;
      case UKEducationKeyStage.KEY_STAGE_3:
        yearGroupRange = [7, 9];
        baseAge = 11;
        break;
      case UKEducationKeyStage.KEY_STAGE_4:
        yearGroupRange = [10, 11];
        baseAge = 14;
        break;
      case UKEducationKeyStage.KEY_STAGE_5:
        yearGroupRange = [12, 13];
        baseAge = 16;
        break;
      default:
        yearGroupRange = [1, 13];
        baseAge = 5;
    }
    
    // Select a year group within the range
    const yearSpread = yearGroupRange[1] - yearGroupRange[0];
    const yearGroup = yearGroupRange[0] + Math.floor(random() * (yearSpread + 1));
    
    // Calculate age with slight variation
    const yearOffset = yearGroup - yearGroupRange[0];
    const ageVariation = random() < 0.1 ? (random() < 0.5 ? -1 : 1) : 0; // 10% of students are 1 year off typical age
    const age = baseAge + yearOffset + ageVariation;
    
    return { yearGroup, age };
  }
  
  /**
   * Generate academic performance fields specific to the key stage
   * @param keyStage Educational key stage to generate data for
   * @param student Base student record
   * @param random Random number generator function
   * @returns Academic performance data appropriate for the key stage
   */
  private generateAcademicPerformance(
    keyStage: UKEducationKeyStage,
    student: StudentRecord,
    random: () => number
  ): Record<string, any> {
    // Base performance factors influenced by demographics
    const basePerformance = this.calculateBasePerformance(student, random);
    
    switch (keyStage) {
      case UKEducationKeyStage.EARLY_YEARS:
        return this.generateEarlyYearsPerformance(basePerformance, student, random);
      case UKEducationKeyStage.KEY_STAGE_1:
        return this.generateKS1Performance(basePerformance, student, random);
      case UKEducationKeyStage.KEY_STAGE_2:
        return this.generateKS2Performance(basePerformance, student, random);
      case UKEducationKeyStage.KEY_STAGE_3:
        return this.generateKS3Performance(basePerformance, student, random);
      case UKEducationKeyStage.KEY_STAGE_4:
        return this.generateKS4Performance(basePerformance, student, random);
      case UKEducationKeyStage.KEY_STAGE_5:
        return this.generateKS5Performance(basePerformance, student, random);
      default:
        return {};
    }
  }
  
  /**
   * Calculate base performance level influenced by demographic factors
   */
  /**
   * Calculate base academic performance level based on demographic factors
   * @param student Student record with demographic information
   * @param random Random number generator function
   * @returns Normalized performance score (-2 to +2 scale)
   */
  private calculateBasePerformance(
    student: StudentRecord,
    random: () => number
  ): number {
    // Start with normally distributed base performance
    let basePerformance = this.normalRandom(random, 0, 1);
    
    // Apply demographic factors
    if (student.hasSpecialEducationalNeeds) basePerformance -= 0.5;
    if (student.eligibleForFreeMeals) basePerformance -= 0.3;
    if (student.englishAsAdditionalLanguage) basePerformance -= 0.2;
    
    // Attendance correlation
    const attendanceFactor = (student.attendance - 90) / 10;
    basePerformance += attendanceFactor * 0.4;
    
    // Behaviour correlation
    const behaviourFactor = (student.behaviour - 70) / 30;
    basePerformance += behaviourFactor * 0.3;
    
    return basePerformance;
  }
  
  /**
   * Generate Early Years Foundation Stage Profile data
   */
  private generateEarlyYearsPerformance(
    basePerformance: number,
    _student: Record<string, any>,
    random: () => number
  ): Record<string, any> {
    // EYFS areas of learning
    const areas = [
      'communication_and_language',
      'physical_development',
      'personal_social_emotional',
      'literacy',
      'mathematics',
      'understanding_the_world',
      'expressive_arts'
    ];
    
    const result: Record<string, any> = {};
    
    // Generate scores for each area (1-3 scale)
    for (const area of areas) {
      // Add some variation per subject while maintaining correlation with base performance
      const variation = this.normalRandom(random, 0, 0.3);
      const areaPerformance = basePerformance + variation;
      
      // Convert to 1-3 scale (1=emerging, 2=expected, 3=exceeding)
      let score;
      if (areaPerformance < -0.5) {
        score = 1; // Emerging
      } else if (areaPerformance > 0.5) {
        score = 3; // Exceeding
      } else {
        score = 2; // Expected
      }
      
      result[area] = score;
    }
    
    // Overall "good level of development" assessment
    result.good_level_of_development = 
      result.communication_and_language >= 2 &&
      result.physical_development >= 2 &&
      result.personal_social_emotional >= 2 &&
      result.literacy >= 2 &&
      result.mathematics >= 2;
    
    return result;
  }
  
  /**
   * Generate Key Stage 1 performance data
   */
  private generateKS1Performance(
    basePerformance: number,
    student: Record<string, any>,
    random: () => number
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Phonics screening check (Year 1)
    if (student.yearGroup === 1) {
      const phonicsScore = Math.round(this.normalRandom(random, 32 + basePerformance * 8, 6));
      result.phonics_score = Math.max(0, Math.min(40, phonicsScore));
      result.phonics_passed = result.phonics_score >= 32; // Pass mark typically around 32
    }
    
    // KS1 subjects (Year 2)
    const subjects = ['reading', 'writing', 'mathematics', 'science'];
    
    // Generate scores for each subject
    for (const subject of subjects) {
      const variation = this.normalRandom(random, 0, 0.3);
      const subjectPerformance = basePerformance + variation;
      
      // KS1 levels: 'BLW' (below), 'PKF' (pre-key), 'WTS' (working towards), 
      // 'EXS' (expected standard), 'GDS' (greater depth)
      let level;
      if (subjectPerformance < -1.2) {
        level = 'BLW';
      } else if (subjectPerformance < -0.6) {
        level = 'PKF';
      } else if (subjectPerformance < 0) {
        level = 'WTS';
      } else if (subjectPerformance < 0.8) {
        level = 'EXS';
      } else {
        level = 'GDS';
      }
      
      result[`${subject}_level`] = level;
    }
    
    return result;
  }
  
  /**
   * Generate Key Stage 2 performance data
   */
  private generateKS2Performance(
    basePerformance: number,
    student: Record<string, any>,
    random: () => number
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Generate SATs results if Year 6
    if (student.yearGroup === 6) {
      const subjects = ['reading', 'mathematics', 'grammar_punctuation_spelling'];
      
      // Generate scaled scores (range 80-120, 100+ is pass)
      for (const subject of subjects) {
        const variation = this.normalRandom(random, 0, 0.3);
        const subjectPerformance = basePerformance + variation;
        
        // Convert to scaled score (100 is expected standard)
        const scaledScore = Math.round(100 + subjectPerformance * 10);
        result[`${subject}_scaled_score`] = Math.max(80, Math.min(120, scaledScore));
        result[`${subject}_met_standard`] = result[`${subject}_scaled_score`] >= 100;
      }
      
      // Writing is teacher assessed
      const writingVariation = this.normalRandom(random, 0, 0.3);
      const writingPerformance = basePerformance + writingVariation;
      
      let writingLevel;
      if (writingPerformance < -0.5) {
        writingLevel = 'WTS'; // Working towards standard
      } else if (writingPerformance < 0.7) {
        writingLevel = 'EXS'; // Expected standard
      } else {
        writingLevel = 'GDS'; // Greater depth
      }
      
      result.writing_level = writingLevel;
      result.writing_met_standard = writingLevel === 'EXS' || writingLevel === 'GDS';
      
      // Science is also teacher assessed (just met/not met)
      const scienceVariation = this.normalRandom(random, 0, 0.3);
      const sciencePerformance = basePerformance + scienceVariation;
      result.science_met_standard = sciencePerformance >= -0.2;
    } 
    // For years 3-5, generate teacher assessments
    else {
      const subjects = ['reading', 'writing', 'mathematics', 'science'];
      
      for (const subject of subjects) {
        const variation = this.normalRandom(random, 0, 0.4);
        const subjectPerformance = basePerformance + variation;
        
        let level;
        if (subjectPerformance < -0.8) {
          level = 'Below';
        } else if (subjectPerformance < 0) {
          level = 'Working Towards';
        } else if (subjectPerformance < 0.8) {
          level = 'Expected';
        } else {
          level = 'Greater Depth';
        }
        
        result[`${subject}_level`] = level;
      }
    }
    
    return result;
  }
  
  /**
   * Generate Key Stage 3 performance data
   */
  private generateKS3Performance(
    basePerformance: number,
    student: Record<string, any>,
    random: () => number
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    // KS3 subjects
    const subjects = [
      'english', 'mathematics', 'science', 'history', 'geography',
      'modern_foreign_languages', 'computing', 'art_and_design',
      'music', 'physical_education', 'citizenship'
    ];
    
    // Student's overall ability might vary by subject type
    const academicVariation = this.normalRandom(random, 0, 0.2);
    const creativeVariation = this.normalRandom(random, 0, 0.2);
    const physicalVariation = this.normalRandom(random, 0, 0.2);
    
    // Generate levels for each subject (many schools use 1-9 scale)
    for (const subject of subjects) {
      let subjectVariation = this.normalRandom(random, 0, 0.3);
      
      // Apply subject type variations
      if (['art_and_design', 'music'].includes(subject)) {
        subjectVariation += creativeVariation;
      } else if (['physical_education'].includes(subject)) {
        subjectVariation += physicalVariation;
      } else {
        subjectVariation += academicVariation;
      }
      
      const subjectPerformance = basePerformance + subjectVariation;
      
      // Convert to 1-9 scale (similar to GCSE scale)
      // Base expected progress is around level 5 for Year 9
      const yearFactor = student.yearGroup - 7; // 0 for Y7, 1 for Y8, 2 for Y9
      const expectedLevel = 3 + yearFactor;
      const level = Math.round(expectedLevel + subjectPerformance * 2);
      
      result[`${subject}_level`] = Math.max(1, Math.min(9, level));
    }
    
    // Calculate average level
    const levels = subjects.map(subject => result[`${subject}_level`]);
    result.average_level = parseFloat((levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1));
    
    // Progress measure compared to expected level
    const expectedAverage = 3 + (student.yearGroup - 7);
    result.progress = parseFloat((result.average_level - expectedAverage).toFixed(1));
    
    return result;
  }
  
  /**
   * Generate Key Stage 4 (GCSE) performance data
   */
  private generateKS4Performance(
    basePerformance: number,
    student: Record<string, any>,
    random: () => number
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    // KS4 subjects (GCSEs)
    const coreSubjects = [
      'english_language', 'english_literature', 'mathematics',
      'science_combined', 'geography_or_history', 'modern_foreign_language'
    ];
    
    // Optional subjects (pick 3-4)
    const optionalSubjects: string[] = [
      'art_and_design', 'business', 'computer_science', 'design_and_technology',
      'drama', 'food_preparation', 'media_studies', 'music', 'physical_education',
      'religious_studies', 'sociology', 'statistics'
    ];
    
    // Student's overall ability might vary by subject type
    const academicVariation = this.normalRandom(random, 0, 0.2);
    const creativeVariation = this.normalRandom(random, 0, 0.2);
    const technicalVariation = this.normalRandom(random, 0, 0.2);
    
    // Choose a few optional subjects
    const numOptionalSubjects = Math.floor(3 + random() * 2); // 3 or 4
    const selectedOptionalSubjects: string[] = [];
    const remainingOptionalSubjects: string[] = [...optionalSubjects];
    
    for (let i = 0; i < numOptionalSubjects && remainingOptionalSubjects.length > 0; i++) {
      const randomIndex = Math.floor(random() * remainingOptionalSubjects.length);
      selectedOptionalSubjects.push(remainingOptionalSubjects[randomIndex]);
      remainingOptionalSubjects.splice(randomIndex, 1);
    }
    
    // Generate GCSE grades for core subjects (all students take these)
    for (const subject of coreSubjects) {
      let subjectVariation = this.normalRandom(random, 0, 0.3);
      
      // Apply subject type variations
      if (['english_language', 'english_literature'].includes(subject)) {
        subjectVariation += academicVariation * 0.3 + creativeVariation * 0.7;
      } else if (['mathematics', 'science_combined'].includes(subject)) {
        subjectVariation += academicVariation * 0.7 + technicalVariation * 0.3;
      } else if (subject === 'modern_foreign_language') {
        subjectVariation += academicVariation * 0.5 + creativeVariation * 0.5;
      } else {
        subjectVariation += academicVariation;
      }
      
      const subjectPerformance = basePerformance + subjectVariation;
      
      // Convert to 1-9 GCSE grade
      // Grade 4 is a standard pass, Grade 5 is a strong pass
      const grade = Math.round(4.5 + subjectPerformance * 2.5);
      result[`${subject}_grade`] = Math.max(1, Math.min(9, grade));
    }
    
    // Generate grades for optional subjects
    for (const subject of selectedOptionalSubjects) {
      let subjectVariation = this.normalRandom(random, 0, 0.4);
      
      // Apply subject type variations
      if (['art_and_design', 'drama', 'music'].includes(subject)) {
        subjectVariation += creativeVariation;
      } else if (['computer_science', 'design_and_technology', 'statistics'].includes(subject)) {
        subjectVariation += technicalVariation;
      } else {
        subjectVariation += academicVariation;
      }
      
      const subjectPerformance = basePerformance + subjectVariation;
      
      // Convert to 1-9 GCSE grade
      const grade = Math.round(4.5 + subjectPerformance * 2.5);
      result[`${subject}_grade`] = Math.max(1, Math.min(9, grade));
    }
    
    // Calculate key metrics
    // Note: allGrades calculation removed as it was unused
    
    // Attainment 8 score (sum of best 8 grades including English and Maths)
    // Note: englishMathsGrades removed as unused
    
    const otherGrades = [
      ...coreSubjects.filter(s => !['english_language', 'english_literature', 'mathematics'].includes(s))
        .map(subject => result[`${subject}_grade`]),
      ...selectedOptionalSubjects.map(subject => result[`${subject}_grade`])
    ].sort((a, b) => b - a);
    
    // Double weight English and Maths
    const bestEnglishGrade = Math.max(result.english_language_grade, result.english_literature_grade);
    const attainment8 = (
      bestEnglishGrade * 2 + 
      result.mathematics_grade * 2 + 
      otherGrades.slice(0, 5).reduce((sum, grade) => sum + grade, 0)
    );
    
    result.attainment_8_score = attainment8;
    
    // Average grade
    result.average_grade = parseFloat((attainment8 / 8).toFixed(1));
    
    // English and Maths passes
    result.english_passed = bestEnglishGrade >= 4;
    result.mathematics_passed = result.mathematics_grade >= 4;
    result.english_and_maths_passed = result.english_passed && result.mathematics_passed;
    
    // EBacc achieved (Grade 5+ in English, Maths, Science, Humanities, Languages)
    result.ebacc_achieved = (
      bestEnglishGrade >= 5 &&
      result.mathematics_grade >= 5 &&
      result.science_combined_grade >= 5 &&
      result.geography_or_history_grade >= 5 &&
      result.modern_foreign_language_grade >= 5
    );
    
    // Progress 8 score (would normally be calculated against prior KS2 attainment)
    // For synthetic data, we'll estimate based on demographic factors
    let expectedAttainment = 40; // Base expectation
    
    if (student.hasSpecialEducationalNeeds) expectedAttainment -= 8;
    if (student.eligibleForFreeMeals) expectedAttainment -= 6;
    if (student.englishAsAdditionalLanguage) expectedAttainment -= 4;
    if (student.attendance < 90) expectedAttainment -= 5;
    
    result.progress_8_score = parseFloat(((attainment8 - expectedAttainment) / 10).toFixed(2));
    
    return result;
  }
  
  /**
   * Generate Key Stage 5 (A-Level) performance data
   */
  private generateKS5Performance(
    basePerformance: number,
    student: Record<string, any>,
    random: () => number
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    // A-Level subjects
    const allSubjects = [
      'mathematics', 'further_mathematics', 'english_literature', 'biology',
      'chemistry', 'physics', 'geography', 'history', 'economics', 'psychology',
      'sociology', 'business_studies', 'computer_science', 'art_and_design',
      'media_studies', 'politics', 'religious_studies', 'modern_foreign_language',
      'music', 'physical_education', 'design_and_technology'
    ];
    
    // Student's overall ability might vary by subject type
    const stemVariation = this.normalRandom(random, 0, 0.3);
    const humanitiesVariation = this.normalRandom(random, 0, 0.3);
    const creativeVariation = this.normalRandom(random, 0, 0.3);
    
    // Determine student's subject preferences
    const prefersStem = stemVariation > 0;
    const prefersHumanities = humanitiesVariation > 0;
    const prefersCreative = creativeVariation > 0;
    
    // Choose 3-4 subjects based on preferences
    const numSubjects = 3 + (random() < 0.3 ? 1 : 0); // 70% take 3, 30% take 4
    const selectedSubjects: string[] = [];
    
    // Group subjects by type
    const stemSubjects = ['mathematics', 'further_mathematics', 'biology', 'chemistry', 'physics', 'computer_science'];
    const humanitiesSubjects = ['english_literature', 'geography', 'history', 'economics', 'psychology', 'sociology', 'politics', 'religious_studies'];
    const creativeSubjects = ['art_and_design', 'media_studies', 'music', 'design_and_technology'];
    
    // Select subjects based on preferences
    let remainingSelections = numSubjects;
    
    // Helper function to pick random subject from array
    const pickRandomSubject = (subjects: string[]): string => {
      const index = Math.floor(random() * subjects.length);
      return subjects[index];
    };
    
    // Select subjects based on student preferences
    if (prefersStem && remainingSelections > 0) {
      const numStemSubjects = Math.min(remainingSelections, 1 + Math.floor(random() * 2));
      let availableStemSubjects = [...stemSubjects];
      
      for (let i = 0; i < numStemSubjects && availableStemSubjects.length > 0; i++) {
        const subject = pickRandomSubject(availableStemSubjects);
        selectedSubjects.push(subject);
        availableStemSubjects = availableStemSubjects.filter(s => s !== subject);
        remainingSelections--;
      }
    }
    
    if (prefersHumanities && remainingSelections > 0) {
      const numHumanitiesSubjects = Math.min(remainingSelections, 1 + Math.floor(random() * 2));
      let availableHumanitiesSubjects = [...humanitiesSubjects];
      
      for (let i = 0; i < numHumanitiesSubjects && availableHumanitiesSubjects.length > 0; i++) {
        const subject = pickRandomSubject(availableHumanitiesSubjects);
        selectedSubjects.push(subject);
        availableHumanitiesSubjects = availableHumanitiesSubjects.filter(s => s !== subject);
        remainingSelections--;
      }
    }
    
    if (prefersCreative && remainingSelections > 0) {
      const numCreativeSubjects = Math.min(remainingSelections, 1);
      let availableCreativeSubjects = [...creativeSubjects];
      
      for (let i = 0; i < numCreativeSubjects && availableCreativeSubjects.length > 0; i++) {
        const subject = pickRandomSubject(availableCreativeSubjects);
        selectedSubjects.push(subject);
        availableCreativeSubjects = availableCreativeSubjects.filter(s => s !== subject);
        remainingSelections--;
      }
    }
    
    // Fill remaining slots with random subjects
    while (remainingSelections > 0) {
      const remainingSubjects = allSubjects.filter(s => !selectedSubjects.includes(s));
      if (remainingSubjects.length === 0) break;
      
      const subject = pickRandomSubject(remainingSubjects);
      selectedSubjects.push(subject);
      remainingSelections--;
    }
    
    // Generate A-Level grades for selected subjects
    // A* = 6, A = 5, B = 4, C = 3, D = 2, E = 1, U = 0
    for (const subject of selectedSubjects) {
      let subjectVariation = this.normalRandom(random, 0, 0.3);
      
      // Apply subject type variations
      if (stemSubjects.includes(subject)) {
        subjectVariation += stemVariation;
      } else if (humanitiesSubjects.includes(subject)) {
        subjectVariation += humanitiesVariation;
      } else if (creativeSubjects.includes(subject)) {
        subjectVariation += creativeVariation;
      } else {
        subjectVariation += (stemVariation + humanitiesVariation + creativeVariation) / 3;
      }
      
      const subjectPerformance = basePerformance + subjectVariation;
      
      // Convert to A-Level grade (0-6 scale)
      const gradeValue = Math.round(3 + subjectPerformance * 1.5);
      const gradeValueCapped = Math.max(0, Math.min(6, gradeValue));
      
      // Convert numerical grade to letter grade
      const gradeLetters = ['U', 'E', 'D', 'C', 'B', 'A', 'A*'];
      result[`${subject}_grade`] = gradeLetters[gradeValueCapped];
      result[`${subject}_points`] = gradeValueCapped;
    }
    
    // Calculate key metrics
    const allPoints = selectedSubjects.map(subject => result[`${subject}_points`]);
    
    // Calculate average point score
    result.average_points = parseFloat((allPoints.reduce((sum, points) => sum + points, 0) / allPoints.length).toFixed(2));
    
    // Convert to UCAS points (A* = 56, A = 48, B = 40, C = 32, D = 24, E = 16)
    const ucasConversion = [0, 16, 24, 32, 40, 48, 56];
    const ucasPoints = allPoints.map(points => ucasConversion[points]);
    result.total_ucas_points = ucasPoints.reduce((sum, points) => sum + points, 0);
    
    // Best 3 A-levels
    const best3Points = [...allPoints].sort((a, b) => b - a).slice(0, 3);
    result.best_3_average_points = parseFloat((best3Points.reduce((sum, points) => sum + points, 0) / best3Points.length).toFixed(2));
    
    // AAB in facilitating subjects
    const facilitatingSubjects = ['mathematics', 'further_mathematics', 'english_literature', 'biology', 'chemistry', 'physics', 'geography', 'history', 'modern_foreign_language'];
    const facilitatingGrades = selectedSubjects
      .filter(subject => facilitatingSubjects.includes(subject))
      .map(subject => result[`${subject}_points`]);
    
    result.aab_in_facilitating = false;
    if (facilitatingGrades.length >= 3) {
      const best3FacilitatingPoints = [...facilitatingGrades].sort((a, b) => b - a).slice(0, 3);
      result.aab_in_facilitating = (
        best3FacilitatingPoints[0] >= 5 && 
        best3FacilitatingPoints[1] >= 5 && 
        best3FacilitatingPoints[2] >= 4
      );
    }
    
    // Value added score (estimated based on demographics)
    let expectedPoints = 3.5; // National average is around B/C grade (3.5)
    
    if (student.hasSpecialEducationalNeeds) expectedPoints -= 0.5;
    if (student.eligibleForFreeMeals) expectedPoints -= 0.3;
    if (student.attendance < 92) expectedPoints -= 0.4;
    
    result.value_added_score = parseFloat((result.average_points - expectedPoints).toFixed(2));
    
    return result;
  }
  
  /**
   * Get fields specific to a key stage
   * @returns Array of field definitions for the specified key stage
   */
  private getKeyStageFields(keyStage?: UKEducationKeyStage): any[] {
    const fields: any[] = [];
    
    switch (keyStage) {
      case UKEducationKeyStage.EARLY_YEARS:
        fields.push(
          {
            name: 'communication_and_language',
            type: 'number',
            description: 'Score for communication and language (1-3)'
          },
          {
            name: 'physical_development',
            type: 'number',
            description: 'Score for physical development (1-3)'
          },
          {
            name: 'personal_social_emotional',
            type: 'number',
            description: 'Score for personal, social and emotional development (1-3)'
          },
          {
            name: 'literacy',
            type: 'number',
            description: 'Score for literacy (1-3)'
          },
          {
            name: 'mathematics',
            type: 'number',
            description: 'Score for mathematics (1-3)'
          },
          {
            name: 'understanding_the_world',
            type: 'number',
            description: 'Score for understanding the world (1-3)'
          },
          {
            name: 'expressive_arts',
            type: 'number',
            description: 'Score for expressive arts and design (1-3)'
          },
          {
            name: 'good_level_of_development',
            type: 'boolean',
            description: 'Whether child has achieved a good level of development'
          }
        );
        break;
        
      case UKEducationKeyStage.KEY_STAGE_1:
        fields.push(
          {
            name: 'phonics_score',
            type: 'number',
            description: 'Phonics screening check score (0-40)'
          },
          {
            name: 'phonics_passed',
            type: 'boolean',
            description: 'Whether student passed phonics screening check'
          },
          {
            name: 'reading_level',
            type: 'string',
            description: 'Reading level (BLW, PKF, WTS, EXS, GDS)'
          },
          {
            name: 'writing_level',
            type: 'string',
            description: 'Writing level (BLW, PKF, WTS, EXS, GDS)'
          },
          {
            name: 'mathematics_level',
            type: 'string',
            description: 'Mathematics level (BLW, PKF, WTS, EXS, GDS)'
          },
          {
            name: 'science_level',
            type: 'string',
            description: 'Science level (BLW, PKF, WTS, EXS, GDS)'
          }
        );
        break;
        
      case UKEducationKeyStage.KEY_STAGE_2:
        // Different fields for Year 6 (SATs) vs Years 3-5
        fields.push(
          {
            name: 'reading_scaled_score',
            type: 'number',
            description: 'Reading SATs scaled score (80-120)'
          },
          {
            name: 'reading_met_standard',
            type: 'boolean',
            description: 'Whether student met expected standard in reading'
          },
          {
            name: 'mathematics_scaled_score',
            type: 'number',
            description: 'Mathematics SATs scaled score (80-120)'
          },
          {
            name: 'mathematics_met_standard',
            type: 'boolean',
            description: 'Whether student met expected standard in mathematics'
          },
          {
            name: 'grammar_punctuation_spelling_scaled_score',
            type: 'number',
            description: 'Grammar, punctuation and spelling SATs scaled score (80-120)'
          },
          {
            name: 'grammar_punctuation_spelling_met_standard',
            type: 'boolean',
            description: 'Whether student met expected standard in grammar, punctuation and spelling'
          },
          {
            name: 'writing_level',
            type: 'string',
            description: 'Writing level (WTS, EXS, GDS)'
          },
          {
            name: 'writing_met_standard',
            type: 'boolean',
            description: 'Whether student met expected standard in writing'
          },
          {
            name: 'science_met_standard',
            type: 'boolean',
            description: 'Whether student met expected standard in science'
          }
        );
        break;
        
      case UKEducationKeyStage.KEY_STAGE_3:
        // KS3 subjects
        const ks3Subjects = [
          'english', 'mathematics', 'science', 'history', 'geography',
          'modern_foreign_languages', 'computing', 'art_and_design',
          'music', 'physical_education', 'citizenship'
        ];
        
        // Add fields for each subject
        for (const subject of ks3Subjects) {
          fields.push({
            name: `${subject}_level`,
            type: 'number',
            description: `${subject.replace(/_/g, ' ')} level (1-9)`
          });
        }
        
        // Add summary fields
        fields.push(
          {
            name: 'average_level',
            type: 'number',
            description: 'Average level across all subjects'
          },
          {
            name: 'progress',
            type: 'number',
            description: 'Progress compared to expected level'
          }
        );
        break;
        
      case UKEducationKeyStage.KEY_STAGE_4:
        // Core GCSE subjects
        const coreSubjects = [
          'english_language', 'english_literature', 'mathematics',
          'science_combined', 'geography_or_history', 'modern_foreign_language'
        ];
        
        // Optional GCSE subjects
        const optionalSubjects = [
          'art_and_design', 'business', 'computer_science', 'design_and_technology',
          'drama', 'food_preparation', 'media_studies', 'music', 'physical_education',
          'religious_studies', 'sociology', 'statistics'
        ];
        
        // Add fields for each core subject
        for (const subject of coreSubjects) {
          fields.push({
            name: `${subject}_grade`,
            type: 'number',
            description: `${subject.replace(/_/g, ' ')} GCSE grade (1-9)`
          });
        }
        
        // Add fields for each optional subject
        for (const subject of optionalSubjects) {
          fields.push({
            name: `${subject}_grade`,
            type: 'number',
            description: `${subject.replace(/_/g, ' ')} GCSE grade (1-9)`,
            optional: true
          });
        }
        
        // Add summary fields
        fields.push(
          {
            name: 'attainment_8_score',
            type: 'number',
            description: 'Attainment 8 score'
          },
          {
            name: 'average_grade',
            type: 'number',
            description: 'Average GCSE grade'
          },
          {
            name: 'english_passed',
            type: 'boolean',
            description: 'Whether student passed English (grade 4+)'
          },
          {
            name: 'mathematics_passed',
            type: 'boolean',
            description: 'Whether student passed Mathematics (grade 4+)'
          },
          {
            name: 'english_and_maths_passed',
            type: 'boolean',
            description: 'Whether student passed both English and Mathematics'
          },
          {
            name: 'ebacc_achieved',
            type: 'boolean',
            description: 'Whether student achieved the English Baccalaureate'
          },
          {
            name: 'progress_8_score',
            type: 'number',
            description: 'Progress 8 score'
          }
        );
        break;
        
      case UKEducationKeyStage.KEY_STAGE_5:
        // A-Level subjects
        const aLevelSubjects = [
          'mathematics', 'further_mathematics', 'english_literature', 'biology',
          'chemistry', 'physics', 'geography', 'history', 'economics', 'psychology',
          'sociology', 'business_studies', 'computer_science', 'art_and_design',
          'media_studies', 'politics', 'religious_studies', 'modern_foreign_language',
          'music', 'physical_education', 'design_and_technology'
        ];
        
        // Add fields for each subject (grade and points)
        for (const subject of aLevelSubjects) {
          fields.push(
            {
              name: `${subject}_grade`,
              type: 'string',
              description: `${subject.replace(/_/g, ' ')} A-Level grade (A*-E, U)`,
              optional: true
            },
            {
              name: `${subject}_points`,
              type: 'number',
              description: `${subject.replace(/_/g, ' ')} A-Level points (0-6)`,
              optional: true
            }
          );
        }
        
        // Add summary fields
        fields.push(
          {
            name: 'average_points',
            type: 'number',
            description: 'Average points across all A-Levels'
          },
          {
            name: 'total_ucas_points',
            type: 'number',
            description: 'Total UCAS points'
          },
          {
            name: 'best_3_average_points',
            type: 'number',
            description: 'Average points for best 3 A-Levels'
          },
          {
            name: 'aab_in_facilitating',
            type: 'boolean',
            description: 'Whether student achieved AAB in facilitating subjects'
          },
          {
            name: 'value_added_score',
            type: 'number',
            description: 'Value added score'
          }
        );
        break;
        
      default:
        // Add fields for all key stages (to handle mixed datasets)
        fields.push(
          {
            name: 'key_stage',
            type: 'string',
            description: 'Educational key stage'
          }
        );
    }
    
    return fields;
  }
  
  /**
   * Calculate statistics for the generated dataset
   * Computes statistical measures for numerical fields and correlations
   */
  private calculateDatasetStatistics(dataset: SyntheticDataset): void {
    if (!dataset.records || dataset.records.length === 0) {
      return;
    }
    
    // Identify numeric fields to calculate statistics
    const record = dataset.records[0];
    const numericFields: string[] = [];
    
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'number') {
        numericFields.push(key);
      }
    }
    
    // Calculate statistics for each numeric field
    for (const field of numericFields) {
      const values = dataset.records
        .map(r => r[field])
        .filter(v => typeof v === 'number' && !isNaN(v));
      
      if (values.length > 0) {
        const stats = this.calculateStatistics(values);
        dataset.metadata.statistics.fieldStats[field] = stats;
      }
    }
    
    // Calculate correlations between fields
    this.calculateCorrelations(dataset, numericFields);
  }
  
  /**
   * Calculate correlations between numeric fields
   */
  private calculateCorrelations(dataset: SyntheticDataset, numericFields: string[]): void {
    if (numericFields.length < 2) {
      return;
    }
    
    const correlationMatrix: Record<string, Record<string, number>> = {};
    
    // Initialize correlation matrix
    for (const field of numericFields) {
      correlationMatrix[field] = {};
    }
    
    // Calculate pairwise correlations
    for (let i = 0; i < numericFields.length; i++) {
      const field1 = numericFields[i];
      correlationMatrix[field1][field1] = 1.0; // Self-correlation
      
      for (let j = i + 1; j < numericFields.length; j++) {
        const field2 = numericFields[j];
        
        // Get values for both fields
        const pairs: [number, number][] = [];
        
        for (const record of dataset.records) {
          const value1 = record[field1];
          const value2 = record[field2];
          
          if (typeof value1 === 'number' && !isNaN(value1) && 
              typeof value2 === 'number' && !isNaN(value2)) {
            pairs.push([value1, value2]);
          }
        }
        
        // Calculate correlation coefficient (Pearson)
        if (pairs.length > 1) {
          const correlation = this.calculateCorrelationCoefficient(pairs);
          correlationMatrix[field1][field2] = correlation;
          correlationMatrix[field2][field1] = correlation;
        }
      }
    }
    
    dataset.metadata.statistics.correlationMatrix = correlationMatrix;
  }
  
  /**
   * Calculate Pearson correlation coefficient between two variables
   */
  private calculateCorrelationCoefficient(pairs: [number, number][]): number {
    if (pairs.length < 2) {
      return 0;
    }
    
    const n = pairs.length;
    
    // Calculate sums
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;
    
    for (const [x, y] of pairs) {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    }
    
    // Calculate correlation coefficient
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    if (denominator === 0) {
      return 0;
    }
    
    const correlation = numerator / denominator;
    
    // Round to 3 decimal places
    return parseFloat(correlation.toFixed(3));
  }
  
  /**
   * Generate relationships between students for social network analysis
   * Creates friendship networks and class assignments based on realistic patterns
   * @param dataset The dataset to add relationship data to
   * @param config Configuration settings for the generation process
   * @param random Random number generator function
   */
  private generateRelationships(
    dataset: SyntheticDataset,
    _config: SyntheticDataConfig,
    random: () => number
  ): void {
    if (!dataset.records || dataset.records.length < 2) {
      return;
    }
    
    // Create student classes based on year groups
    const classesByYear: Record<number, string[]> = {};
    
    // Group students by year
    for (const student of dataset.records) {
      const yearGroup = student.yearGroup;
      
      if (!classesByYear[yearGroup]) {
        classesByYear[yearGroup] = [];
      }
      
      classesByYear[yearGroup].push(student.id);
    }
    
    // Create class assignments
    const classAssignments: Record<string, string> = {};
    const classes: Record<string, ClassInfo> = {};
    
    for (const [yearGroup, students] of Object.entries(classesByYear)) {
      // Create classes for this year (avg 25-30 students per class)
      const classSize = 25 + Math.floor(random() * 5);
      const numClasses = Math.max(1, Math.ceil(students.length / classSize));
      
      for (let i = 0; i < numClasses; i++) {
        const className = `${yearGroup}${String.fromCharCode(65 + i)}`; // e.g., 7A, 7B, etc.
        classes[className] = { name: className, students: [] };
      }
      
      // Randomly assign students to classes
      const classNames = Object.keys(classes).filter(name => name.startsWith(yearGroup));
      
      for (const studentId of students) {
        const classIndex = Math.floor(random() * classNames.length);
        const className = classNames[classIndex];
        
        classAssignments[studentId] = className;
        classes[className].students.push(studentId);
      }
    }
    
    // Add class assignments to student records
    for (const student of dataset.records) {
      student.class = classAssignments[student.id];
    }
    
    // Generate friendship relationships
    const friendships: StudentFriendship[] = [];
    
    for (const student of dataset.records) {
      // Students are more likely to be friends with others in the same class
      const classmates = classes[student.class].students.filter(id => id !== student.id);
      
      // Number of friends (follows a roughly normal distribution)
      const numFriends = Math.max(0, Math.floor(this.normalRandom(random, 5, 2)));
      
      // 80% of friends from same class, 20% from same year but different class
      const numClassmateFriends = Math.min(classmates.length, Math.floor(numFriends * 0.8));
      const numOtherFriends = Math.min(
        (classesByYear[student.yearGroup] || []).length - classmates.length - 1,
        numFriends - numClassmateFriends
      );
      
      // Select classmate friends
      const selectedClassmates: string[] = [];
      const remainingClassmates: string[] = [...classmates];
      
      for (let i = 0; i < numClassmateFriends && remainingClassmates.length > 0; i++) {
        const index = Math.floor(random() * remainingClassmates.length);
        selectedClassmates.push(remainingClassmates[index]);
        remainingClassmates.splice(index, 1);
      }
      
      // Select other friends from same year
      const selectedOthers: string[] = [];
      const othersInYear = (classesByYear[student.yearGroup] || [])
        .filter(id => id !== student.id && !classmates.includes(id));
      const remainingOthers: string[] = [...othersInYear];
      
      for (let i = 0; i < numOtherFriends && remainingOthers.length > 0; i++) {
        const index = Math.floor(random() * remainingOthers.length);
        selectedOthers.push(remainingOthers[index]);
        remainingOthers.splice(index, 1);
      }
      
      // Create friendship connections
      for (const friendId of [...selectedClassmates, ...selectedOthers]) {
        // Friendship strength (0.1-1.0)
        const isClassmate = classmates.includes(friendId);
        const baseStrength = isClassmate ? 0.7 : 0.5;
        const strengthVariation = random() * 0.3;
        const strength = parseFloat((baseStrength + strengthVariation).toFixed(2));
        
        friendships.push({
          studentId: student.id,
          friendId,
          strength
        });
      }
    }
    
    // Add friendship relationships to dataset
    if (!dataset.metadata.additionalData) {
      dataset.metadata.additionalData = {};
    }
    
    dataset.metadata.additionalData.relationships = {
      classes,
      friendships
    } as RelationshipData;
  }
}