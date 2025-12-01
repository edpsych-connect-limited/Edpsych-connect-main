/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { Document, Schema, model } from 'mongoose';

// Define academic term types
export enum AcademicTermType {
  TERM = 'term',
  HALF_TERM = 'half_term',
  TRIMESTER = 'trimester',
  ANNUAL = 'annual',
  CUSTOM = 'custom'
}

// Define global regions for different academic calendars
export enum AcademicRegion {
  UK = 'uk',
  EUROPE = 'europe',
  INTERNATIONAL = 'international',
  CUSTOM = 'custom'
}

// Interface for the academic year configuration
export interface IAcademicYear {
  name: string;            // e.g. "2025-2026 Academic Year"
  startDate: Date;         // e.g. August 1, 2025
  endDate: Date;           // e.g. July 31, 2026
  region: AcademicRegion;  // Regional calendar this follows
  terms: IAcademicTerm[];  // The terms within this academic year
}

// Interface for academic terms (semesters/quarters)
export interface IAcademicTerm {
  name: string;            // e.g. "Fall 2025"
  startDate: Date;         // e.g. August 1, 2025
  endDate: Date;           // e.g. December 15, 2025
  type: AcademicTermType;  // Semester, quarter, etc.
}

// Interface for academic billing cycle
export interface IAcademicBillingCycle {
  name: string;                // e.g. "Annual", "Per Semester", "Quarterly"
  description: string;         // User-friendly description
  termCount: number;           // How many terms this covers (1, 2, 3, 4)
  discountPercentage: number;  // Discount for longer commitments
  isDefault: boolean;          // Is this the default option
}

// Interface for institutional tier
export interface IInstitutionalTier {
  name: string;                // e.g. "Primary Small", "University Standard"
  description: string;         // User-friendly description
  institutionType: string[];   // Primary, Secondary, Further Ed, Higher Ed, etc.
  minEnrollment?: number;      // Minimum student/user count
  maxEnrollment?: number;      // Maximum student/user count
  basePrice: number;           // Base price per academic year in GBP
  features: string[];          // Features included in this tier
  isCustom: boolean;           // Is this a custom pricing tier
}

// Interface for algorithm license tier
export interface IAlgorithmLicenseTier {
  name: string;                // e.g. "Institutional", "Department", "Researcher"
  description: string;         // User-friendly description
  basePrice: number;           // Base price for license
  usageLimit?: number;         // Usage limit if applicable
  revenueSharePercentage: number; // Creator revenue share
  applicableFeatures: string[]; // What features this tier includes
}

// Academic Year Document Interface
export interface IAcademicYearDocument extends IAcademicYear, Document {}

// Academic Year Schema
const AcademicTermSchema = new Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { 
    type: String, 
    enum: Object.values(AcademicTermType),
    required: true 
  }
});

const AcademicYearSchema = new Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  region: { 
    type: String, 
    enum: Object.values(AcademicRegion),
    required: true 
  },
  terms: [AcademicTermSchema]
}, {
  timestamps: true
});

// Institutional Tier Schema
const InstitutionalTierSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  institutionType: [{ type: String }],
  minEnrollment: { type: Number },
  maxEnrollment: { type: Number },
  basePrice: { type: Number, required: true },
  features: [{ type: String }],
  isCustom: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Algorithm License Tier Schema
const AlgorithmLicenseTierSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  usageLimit: { type: Number },
  revenueSharePercentage: { type: Number, required: true },
  applicableFeatures: [{ type: String }]
}, {
  timestamps: true
});

// Academic Billing Cycle Schema
const AcademicBillingCycleSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  termCount: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Export models
export const AcademicYear = model<IAcademicYearDocument>('AcademicYear', AcademicYearSchema);
export const InstitutionalTier = model('InstitutionalTier', InstitutionalTierSchema);
export const AlgorithmLicenseTier = model('AlgorithmLicenseTier', AlgorithmLicenseTierSchema);
export const AcademicBillingCycle = model('AcademicBillingCycle', AcademicBillingCycleSchema);
