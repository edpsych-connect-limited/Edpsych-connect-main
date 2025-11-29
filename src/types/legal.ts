/**
 * Types for legal documents and signatures
 */

/**
 * Types of legal agreements in the system
 */
export enum AgreementTypes {
  BETA_CONFIDENTIALITY = 'beta-confidentiality',
  TERMS_OF_SERVICE = 'terms-of-service',
  PRIVACY_POLICY = 'privacy-policy',
  DATA_PROCESSING = 'data-processing',
  RESEARCH_CONSENT = 'research-consent'
}

/**
 * Status of a signature
 */
export type SignatureStatus = 'pending' | 'active' | 'revoked' | 'expired';

/**
 * Legal signature record
 */
export interface LegalSignature {
  id: string;
  userId: string;
  agreementType: AgreementTypes;
  agreementVersion: string;
  signedAt: Date;
  ipAddress: string;
  userAgent: string;
  contentHash: string;
  status: SignatureStatus;
  metadata: Record<string, any>;
}

/**
 * Legal document record
 */
export interface LegalDocument {
  id: string;
  type: AgreementTypes;
  version: string;
  content: string;
  effectiveDate: Date;
  expirationDate?: Date;
  status: 'draft' | 'active' | 'deprecated';
  metadata: Record<string, any>;
}

/**
 * Digital signature verification result
 */
export interface SignatureVerificationResult {
  hasSigned: boolean;
  signature?: {
    id: string;
    version: string;
    signedAt: Date;
  };
}

/**
 * Signature creation request
 */
export interface SignatureRequest {
  id: string;
  agreementType: AgreementTypes;
  agreementVersion: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Signature creation response
 */
export interface SignatureResponse {
  signatureId: string;
  timestamp: Date;
  success: boolean;
}

/**
 * Audit log for legal actions
 */
export interface LegalAuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}