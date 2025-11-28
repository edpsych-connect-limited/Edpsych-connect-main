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

import { getPostgresClient } from '../../database/postgres';
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
      const postgres = getPostgresClient();
      const result = await postgres.query(`
        SELECT id, name, description, required, version
        FROM consent_types
        WHERE active = true
        ORDER BY name ASC
      `);

      return result.rows.map((type: any) => ({
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
      const postgres = getPostgresClient();
      const result = await postgres.query(`
        SELECT id, user_id, consent_type_id, consented, consent_text,
               consent_timestamp, withdrawal_timestamp, valid_until, consent_version
        FROM consent_records
        WHERE user_id = $1
        ORDER BY consent_timestamp DESC
      `, [id]);

      return result.rows.map((record: any) => ({
        id: record.id,
        userId: record.user_id,
        consentTypeId: record.consent_type_id,
        consented: record.consented,
        consentText: record.consent_text,
        consentTimestamp: record.consent_timestamp,
        withdrawalTimestamp: record.withdrawal_timestamp,
        validUntil: record.valid_until,
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
      const postgres = getPostgresClient();
      
      // Get consent type details
      const consentTypeResult = await postgres.query(`
        SELECT id, version FROM consent_types WHERE id = $1
      `, [consentTypeId]);
      
      if (consentTypeResult.rows.length === 0)
        throw new Error('Consent type not found');
        
      const consentType = consentTypeResult.rows[0];

      // Check if consent already exists
      const existingConsentResult = await postgres.query(`
        SELECT id FROM consent_records
        WHERE user_id = $1 AND consent_type_id = $2 AND withdrawal_timestamp IS NULL
      `, [id, consentTypeId]);
      
      const existingConsent = existingConsentResult.rows.length > 0 ?
        existingConsentResult.rows[0] : null;

      if (existingConsent) {
        // Update existing consent
        const validUntil = consented ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
        const updateResult = await postgres.query(`
          UPDATE consent_records
          SET consented = $1, consent_text = $2, consent_version = $3,
              valid_until = $4, updated_at = NOW()
          WHERE id = $5
          RETURNING *
        `, [consented, consentText, consentType.version, validUntil, existingConsent.id]);
        
        const data = updateResult.rows[0];

        // Log the consent change
        await this.logConsentChange(data.id, 'updated', existingConsent, data, id);

        return {
          id: data.id,
          userId: data.user_id,
          consentTypeId: data.consent_type_id,
          consented: data.consented,
          consentText: data.consent_text,
          consentTimestamp: data.consent_timestamp,
          validUntil: data.valid_until,
          consentVersion: data.consent_version
        };
      } else {
        // Create new consent record
        const validUntil = consented ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
        const insertResult = await postgres.query(`
          INSERT INTO consent_records (
            user_id, consent_type_id, consented, consent_text, consent_version,
            valid_until, ip_address, user_agent, consent_method, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING *
        `, [
          id, consentTypeId, consented, consentText, consentType.version,
          validUntil, ipAddress, userAgent, 'web'
        ]);
        
        const data = insertResult.rows[0];

        // Log the consent grant
        await this.logConsentChange(data.id, 'granted', null, data, id);

        return {
          id: data.id,
          userId: data.user_id,
          consentTypeId: data.consent_type_id,
          consented: data.consented,
          consentText: data.consent_text,
          consentTimestamp: data.consent_timestamp,
          validUntil: data.valid_until,
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
      const postgres = getPostgresClient();
      
      // Find existing active consent
      const existingConsentResult = await postgres.query(`
        SELECT * FROM consent_records
        WHERE user_id = $1 AND consent_type_id = $2 AND withdrawal_timestamp IS NULL
      `, [id, consentTypeId]);
      
      if (existingConsentResult.rows.length === 0)
        throw new Error('No active consent found');
        
      const existingConsent = existingConsentResult.rows[0];
      
      // Update the withdrawal timestamp
      await postgres.query(`
        UPDATE consent_records
        SET withdrawal_timestamp = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [existingConsent.id]);
      
      // Create a modified record for logging
      const modifiedConsent = {
        ...existingConsent,
        withdrawal_timestamp: new Date().toISOString()
      };
      
      // Log the consent withdrawal
      await this.logConsentChange(
        existingConsent.id,
        'withdrawn',
        existingConsent,
        modifiedConsent,
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
      const postgres = getPostgresClient();
      
      await postgres.query(`
        INSERT INTO consent_audit_logs (
          consent_record_id, action, old_values, new_values, performed_by, reason, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        consentRecordId,
        action,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        performedBy,
        reason || null
      ]);
    } catch (error) {
      logger.error('Failed to log consent change', error as Error);
    }
  }

  /**
   * Get current privacy policy
   */
  async getCurrentPrivacyPolicy(): Promise<PrivacyPolicy | null> {
    try {
      const postgres = getPostgresClient();
      const result = await postgres.query(`
        SELECT id, version, title, content, effective_date, published_at, requires_reconsent
        FROM privacy_policies
        WHERE active = true
        ORDER BY version DESC
        LIMIT 1
      `);

      if (result.rows.length === 0) return null;
      
      const data = result.rows[0];
      return {
        id: data.id,
        version: data.version,
        title: data.title,
        content: data.content,
        effectiveDate: data.effective_date,
        publishedAt: data.published_at,
        requiresReconsent: data.requires_reconsent
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
      // Get current privacy policy
      const currentPolicy = await this.getCurrentPrivacyPolicy();
      if (!currentPolicy || !currentPolicy.requiresReconsent) {
        return false;
      }

      // Get user's latest consent for privacy policy
      const postgres = getPostgresClient();
      const latestConsentResult = await postgres.query(`
        SELECT consent_version FROM consent_records
        WHERE user_id = $1 AND consent_type_id = 'privacy_policy'
        ORDER BY consent_timestamp DESC
        LIMIT 1
      `, [id]);
      
      const latestConsent = latestConsentResult.rows.length > 0 ? latestConsentResult.rows[0] : null;

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
      const postgres = getPostgresClient();
      
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
      const userDataResult = await postgres.query(`
        SELECT * FROM users WHERE id = $1
      `, [id]);

      if (userDataResult.rows.length > 0) {
        const userData = userDataResult.rows[0];
        // Remove sensitive fields like passwords
        const { password, password_hash, ...sanitizedData } = userData;
        exportData.personalData = sanitizedData;
      }

      // Get user consents
      exportData.consents = await this.getUserConsents(id);

      // Get data subject requests
      const requestsResult = await postgres.query(`
        SELECT * FROM data_subject_requests
        WHERE user_id = $1
        ORDER BY submitted_at DESC
      `, [id]);

      if (requestsResult.rows.length > 0) {
        exportData.dataSubjectRequests = requestsResult.rows;
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
      const postgres = getPostgresClient();
      
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // Requests expire after 1 month
      
      // Insert the data subject request
      const insertResult = await postgres.query(`
        INSERT INTO data_subject_requests (
          user_id, request_type, status, request_details,
          submitted_at, expires_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), $5, NOW(), NOW())
        RETURNING id, user_id, request_type, status, request_details, submitted_at, expires_at
      `, [
        id,
        requestType,
        'pending',
        JSON.stringify(requestDetails),
        expiresAt
      ]);
      
      const data = insertResult.rows[0];
      
      // Log the request
      await postgres.query(`
        INSERT INTO request_audit_logs (
          request_id, action, performed_by, details, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        data.id,
        'submitted',
        id,
        JSON.stringify(requestDetails)
      ]);

      return {
        id: data.id,
        userId: data.user_id,
        requestType: data.request_type,
        status: data.status,
        requestDetails: data.request_details,
        submittedAt: data.submitted_at,
        expiresAt: data.expires_at
      };
    } catch (error) {
      logger.error('Failed to submit data subject request', error as Error);
      throw new Error('Failed to submit data subject request');
    }
  }
}

// Export singleton instance
export const gdprCompliance = GDPRComplianceService.getInstance();
