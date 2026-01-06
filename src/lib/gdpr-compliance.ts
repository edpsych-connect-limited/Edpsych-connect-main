/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// EdPsych Connect World - GDPR Compliance Service
// Generated: August 29, 2025
// Environment: PRODUCTION
// Compliance: GDPR, ISO 27001, SOC 2

import { prisma } from '@/lib/prisma';
import { logger } from "@/lib/logger";

export interface ConsentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  version: number;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentTypeId: string;
  consented: boolean;
  consentText: string;
  consentTimestamp: string;
  withdrawalTimestamp?: string;
  validUntil?: string;
  consentVersion: number;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal';
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'expired';
  requestDetails: any;
  submittedAt: string;
  processedAt?: string;
  completedAt?: string;
  expiresAt: string;
  responseData?: any;
  rejectionReason?: string;
}

export interface PrivacyPolicy {
  id: string;
  version: number;
  title: string;
  content: string;
  effectiveDate: string;
  publishedAt: string;
  requiresReconsent: boolean;
}

export class GDPRComplianceService {
  private static instance: GDPRComplianceService;

  public static getInstance(): GDPRComplianceService {
    if (!GDPRComplianceService.instance) {
      GDPRComplianceService.instance = new GDPRComplianceService();
    }
    return GDPRComplianceService.instance;
  }

  // =================================================================
  // CONSENT MANAGEMENT
  // =================================================================

  /**
   * Get all available consent types
   */
  async getConsentTypes(): Promise<ConsentType[]> {
    try {
      const types = await prisma.consentType.findMany({
        where: { active: true },
        orderBy: { name: 'asc' }
      });

      return types.map((type) => ({
        id: type.id,
        name: type.name,
        description: type.description,
        required: type.required,
        version: type.version
      }));
    } catch (error) {
      logger.error('Failed to get consent types', error as Error);
      throw new Error('Failed to retrieve consent types');
    }
  }

  /**
   * Get user consent records
   */
  async getUserConsents(id: string): Promise<ConsentRecord[]> {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) throw new Error('Invalid user ID');

      const records = await prisma.consentRecord.findMany({
        where: { user_id: userId },
        orderBy: { consent_timestamp: 'desc' }
      });

      return records.map((record) => ({
        id: record.id,
        userId: record.user_id.toString(),
        consentTypeId: record.consent_type_id,
        consented: record.consented,
        consentText: record.consent_text,
        consentTimestamp: record.consent_timestamp.toISOString(),
        withdrawalTimestamp: record.withdrawal_timestamp?.toISOString(),
        validUntil: record.valid_until?.toISOString(),
        consentVersion: record.consent_version
      }));
    } catch (error) {
      logger.error('Failed to get user consents', error as Error);
      throw new Error('Failed to retrieve user consents');
    }
  }

  /**
   * Grant or update user consent
   */
  async grantConsent(
    id: string,
    consentTypeId: string,
    consented: boolean,
    consentText: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ConsentRecord> {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) throw new Error('Invalid user ID');

      // Get consent type details
      const consentType = await prisma.consentType.findUnique({
        where: { id: consentTypeId }
      });
      
      if (!consentType)
        throw new Error('Consent type not found');

      // Check if consent already exists
      const existingConsent = await prisma.consentRecord.findFirst({
        where: {
          user_id: userId,
          consent_type_id: consentTypeId,
          withdrawal_timestamp: null
        }
      });

      if (existingConsent) {
        // Update existing consent
        const validUntil = consented ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
        
        const data = await prisma.consentRecord.update({
          where: { id: existingConsent.id },
          data: {
            consented,
            consent_text: consentText,
            consent_version: consentType.version,
            valid_until: validUntil,
          }
        });

        // Log the consent change
        await this.logConsentChange(data.id, 'updated', existingConsent, data, id);

        return {
          id: data.id,
          userId: data.user_id.toString(),
          consentTypeId: data.consent_type_id,
          consented: data.consented,
          consentText: data.consent_text,
          consentTimestamp: data.consent_timestamp.toISOString(),
          validUntil: data.valid_until?.toISOString(),
          consentVersion: data.consent_version
        };
      } else {
        // Create new consent record
        const validUntil = consented ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
        
        const data = await prisma.consentRecord.create({
          data: {
            user_id: userId,
            consent_type_id: consentTypeId,
            consented,
            consent_text: consentText,
            consent_version: consentType.version,
            valid_until: validUntil,
          }
        });

        // Log the consent grant
        await this.logConsentChange(data.id, 'granted', null, data, id);

        return {
          id: data.id,
          userId: data.user_id.toString(),
          consentTypeId: data.consent_type_id,
          consented: data.consented,
          consentText: data.consent_text,
          consentTimestamp: data.consent_timestamp.toISOString(),
          validUntil: data.valid_until?.toISOString(),
          consentVersion: data.consent_version
        };
      }
    } catch (error) {
      logger.error('Failed to grant consent', error as Error);
      throw new Error('Failed to process consent');
    }
  }

  /**
   * Withdraw user consent
   */
  async withdrawConsent(
    id: string,
    consentTypeId: string,
    reason?: string
  ): Promise<void> {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) throw new Error('Invalid user ID');

      // Find existing active consent
      const existingConsent = await prisma.consentRecord.findFirst({
        where: {
          user_id: userId,
          consent_type_id: consentTypeId,
          withdrawal_timestamp: null
        }
      });
      
      if (!existingConsent)
        throw new Error('No active consent found');
      
      // Update the withdrawal timestamp
      const updatedConsent = await prisma.consentRecord.update({
        where: { id: existingConsent.id },
        data: {
          withdrawal_timestamp: new Date()
        }
      });
      
      // Log the consent withdrawal
      await this.logConsentChange(
        existingConsent.id,
        'withdrawn',
        existingConsent,
        updatedConsent,
        id,
        reason
      );

    } catch (error) {
      logger.error('Failed to withdraw consent', error as Error);
      throw new Error('Failed to withdraw consent');
    }
  }

  /**
   * Log consent changes for audit trail
   */
  private async logConsentChange(
    consentRecordId: string,
    action: string,
    oldValues: any,
    newValues: any,
    performedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: action,
          resource: 'consent_record',
          entityId: consentRecordId,
          performedById: performedBy,
          details: {
            reason,
            oldValues,
            newValues
          },
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to log consent change', error as Error);
    }
  }

  /**
   * Get current privacy policy
   */
  async getCurrentPrivacyPolicy(): Promise<PrivacyPolicy | null> {
    try {
      const policy = await prisma.privacyPolicy.findFirst({
        orderBy: { version: 'desc' }
      });

      if (!policy) return null;
      
      return {
        id: policy.id,
        version: policy.version,
        title: policy.title,
        content: policy.content,
        effectiveDate: policy.effective_date.toISOString(),
        publishedAt: policy.published_at.toISOString(),
        requiresReconsent: policy.requires_reconsent
      };
    } catch (error) {
      logger.error('Failed to get current privacy policy', error as Error);
      throw new Error('Failed to retrieve privacy policy');
    }
  }

  /**
   * Check if user needs to reconsent to updated privacy policy
   */
  async checkReconsentRequired(id: string): Promise<boolean> {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) return true;

      // Get current privacy policy
      const currentPolicy = await this.getCurrentPrivacyPolicy();
      if (!currentPolicy || !currentPolicy.requiresReconsent) {
        return false;
      }

      // Get user's latest consent for privacy policy
      const latestConsent = await prisma.consentRecord.findFirst({
        where: {
          user_id: userId,
          consent_type_id: 'privacy_policy'
        },
        orderBy: { consent_timestamp: 'desc' }
      });

      if (!latestConsent) return true;

      // Check if user's consent version is older than current policy version
      return latestConsent.consent_version < currentPolicy.version;
    } catch (error) {
      logger.error('Failed to check reconsent requirement', error as Error);
      return true; // Default to requiring reconsent on error
    }
  }

  /**
   * Export user data for GDPR Article 20 compliance
   */
  async exportUserData(id: string): Promise<any> {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) throw new Error('Invalid user ID');

      const exportData: {
        id: string;
        exportTimestamp: string;
        personalData: any;
        consents: ConsentRecord[];
        dataSubjectRequests: any[];
      } = {
        id,
        exportTimestamp: new Date().toISOString(),
        personalData: {},
        consents: [],
        dataSubjectRequests: []
      };

      // Get user personal data
      const userData = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (userData) {
        // Remove sensitive fields like passwords
        const { password_hash: _password_hash, ...sanitizedData } = userData;
        exportData.personalData = sanitizedData;
      }

      // Get user consents
      exportData.consents = await this.getUserConsents(id);

      // Get data subject requests
      const requests = await prisma.dataSubjectRequest.findMany({
        where: { user_id: userId },
        orderBy: { submitted_at: 'desc' }
      });

      if (requests.length > 0) {
        exportData.dataSubjectRequests = requests;
      }

      return exportData;
    } catch (error) {
      logger.error('Failed to export user data', error as Error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * Submit data subject request for GDPR compliance
   */
  async submitDataSubjectRequest(
    id: string,
    requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal',
    requestDetails: any
  ): Promise<DataSubjectRequest> {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) throw new Error('Invalid user ID');

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // Requests expire after 1 month
      
      // Insert the data subject request
      const data = await prisma.dataSubjectRequest.create({
        data: {
          user_id: userId,
          request_type: requestType,
          status: 'pending',
          request_details: requestDetails,
          expires_at: expiresAt
        }
      });
      
      // Log the request
      await prisma.auditLog.create({
        data: {
          action: 'gdpr_request.submitted',
          resource: 'data_subject_request',
          entityId: data.id,
          performedById: id,
          details: {
            requestType,
            requestDetails
          },
          timestamp: new Date()
        }
      });

      return {
        id: data.id,
        userId: data.user_id.toString(),
        requestType: data.request_type as any,
        status: data.status as any,
        requestDetails: data.request_details,
        submittedAt: data.submitted_at.toISOString(),
        expiresAt: data.expires_at.toISOString()
      };
    } catch (error) {
      logger.error('Failed to submit data subject request', error as Error);
      throw new Error('Failed to submit data subject request');
    }
  }
}

// Export singleton instance
export const gdprCompliance = GDPRComplianceService.getInstance();
