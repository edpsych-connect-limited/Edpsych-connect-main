/**
 * Institution Models
 * 
 * This file defines the data structures for institutions participating in
 * cross-institutional data sharing within the EdPsych Research Foundation.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Types of institutions that can participate in data sharing
 */
export enum InstitutionType {
  UNIVERSITY = 'university',
  RESEARCH_INSTITUTE = 'research_institute',
  GOVERNMENT_AGENCY = 'government_agency',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  SCHOOL_DISTRICT = 'school_district',
  EDUCATION_AUTHORITY = 'education_authority',
  NONPROFIT_ORGANIZATION = 'nonprofit_organization',
  COMMERCIAL_ENTITY = 'commercial_entity'
}

/**
 * Verification status for an institution
 */
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

/**
 * Compliance framework that an institution adheres to
 */
export enum ComplianceFramework {
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  HIPAA = 'hipaa',
  FERPA = 'ferpa',
  UK_DPA = 'uk_data_protection_act',
  PIPEDA = 'pipeda',
  ISO_27001 = 'iso_27001',
  NIST = 'nist_cybersecurity',
  INTERNAL_IRB = 'internal_irb',
  EXTERNAL_IRB = 'external_irb'
}

/**
 * Address information for an institution
 */
export interface InstitutionAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/**
 * Contact person for an institution
 */
export interface InstitutionContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
  isDPO: boolean; // Data Protection Officer under GDPR
}

/**
 * Compliance certification for an institution
 */
export interface ComplianceCertification {
  id: string;
  framework: ComplianceFramework;
  certificationId?: string;
  issuingAuthority?: string;
  issueDate: Date;
  expiryDate?: Date;
  documentationUrl?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationDate?: Date;
}

/**
 * Data governance policy for an institution
 */
export interface DataGovernancePolicy {
  id: string;
  title: string;
  description: string;
  documentUrl: string;
  version: string;
  effectiveDate: Date;
  approvedBy: string;
  lastReviewDate: Date;
  nextReviewDate: Date;
}

/**
 * Main institution record
 */
export interface Institution {
  id: string;
  name: string;
  shortName?: string;
  type: InstitutionType;
  description: string;
  website: string;
  registrationNumber?: string; // Official registration/business number
  taxId?: string;
  address: InstitutionAddress;
  contacts: InstitutionContact[];
  verificationStatus: VerificationStatus;
  verificationDate?: Date;
  verifiedBy?: string;
  registrationDate: Date;
  lastUpdated: Date;
  updatedBy: string;
  complianceCertifications: ComplianceCertification[];
  dataGovernancePolicies: DataGovernancePolicy[];
  supportedDataFormats: string[]; // MIME types or format identifiers
  apiEndpoint?: string; // For automated data exchange
  publicKey?: string; // For encrypted data exchange
  
  // Institutional capabilities
  hasEthicsCommittee: boolean;
  hasDataProtectionOfficer: boolean;
  hasTechnicalInfrastructure: boolean;
  
  // Additional metadata
  metadata: Record<string, any>;
  
  // Audit and administrative
  isActive: boolean;
  deactivationReason?: string;
  deactivationDate?: Date;
}

/**
 * Parameters to create a new institution
 */
export interface InstitutionCreationParams {
  name: string;
  shortName?: string;
  type: InstitutionType;
  description: string;
  website: string;
  registrationNumber?: string;
  taxId?: string;
  address: InstitutionAddress;
  primaryContact: Omit<InstitutionContact, 'id' | 'isPrimary'>;
  supportedDataFormats: string[];
  hasEthicsCommittee: boolean;
  hasDataProtectionOfficer: boolean;
  hasTechnicalInfrastructure: boolean;
  metadata?: Record<string, any>;
}

/**
 * Create a new institution entity
 */
export function createInstitution(params: InstitutionCreationParams, createdBy: string): Institution {
  const now = new Date();
  
  // Create primary contact
  const primaryContact: InstitutionContact = {
    id: uuidv4(),
    name: params.primaryContact.name,
    title: params.primaryContact.title,
    email: params.primaryContact.email,
    phone: params.primaryContact.phone,
    isPrimary: true,
    isDPO: params.primaryContact.isDPO
  };
  
  return {
    id: uuidv4(),
    name: params.name,
    shortName: params.shortName,
    type: params.type,
    description: params.description,
    website: params.website,
    registrationNumber: params.registrationNumber,
    taxId: params.taxId,
    address: params.address,
    contacts: [primaryContact],
    verificationStatus: VerificationStatus.PENDING,
    registrationDate: now,
    lastUpdated: now,
    updatedBy: createdBy,
    complianceCertifications: [],
    dataGovernancePolicies: [],
    supportedDataFormats: params.supportedDataFormats,
    hasEthicsCommittee: params.hasEthicsCommittee,
    hasDataProtectionOfficer: params.hasDataProtectionOfficer,
    hasTechnicalInfrastructure: params.hasTechnicalInfrastructure,
    metadata: params.metadata || {},
    isActive: true
  };
}