/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '../lib/prisma';
import { createHash } from 'crypto';
import { getCurrentTimestamp, generateUUID } from '../utils/general';
import { uploadToSecureStorage, getFromSecureStorage } from '../lib/secure-storage';
import { AgreementTypes } from '../types/legal';
import { logger } from "@/lib/logger";

/**
 * Service for handling digital signatures for legal documents
 * Provides secure signature creation, verification, and storage
 */
export class DigitalSignatureService {
  /**
   * Creates a digital signature for a legal agreement
   * 
   * @param userId - The ID of the user signing the agreement
   * @param agreementType - The type of agreement being signed (e.g., 'beta-confidentiality')
   * @param agreementVersion - The version of the agreement being signed
   * @param ipAddress - The IP address of the user at time of signing
   * @param userAgent - The user agent of the browser used for signing
   * @returns The signature record including the signature ID
   */
  public static async createSignature(
    userId: string,
    agreementType: AgreementTypes,
    agreementVersion: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{signatureId: string, timestamp: Date}> {
    try {
      // Create a signature record
      const signatureId = generateUUID();
      const timestamp = getCurrentTimestamp();
      
      // Create a hash of the agreement content for verification
      const agreementContent = await this.getAgreementContent(agreementType, agreementVersion);
      const contentHash = this.createContentHash(agreementContent);
      
      // Create the signature record
      // Extract browser information
      const browser = userAgent.split(' ')[0];
      const platform = this.extractPlatformFromUserAgent(userAgent);
      
      // Create the content hash for signature data
      const contentHashString = this.createContentHash(agreementContent);
      
      // Create signature data JSON string with all relevant verification info
      const signatureData = JSON.stringify({
        browser,
        platform,
        contentHash: contentHashString,
        timestamp: timestamp.toISOString()
      });

      // Create the signature record with required signatureData field
      const signatureRecord = await prisma.legalSignature.create({
        data: {
          id: signatureId,
          userId: userId,
          user_id_int: parseInt(userId),
          agreementType,
          agreementVersion,
          signedAt: timestamp,
          ipAddress,
          userAgent,
          status: 'active',
          signatureData, // Add the required signatureData field
          updatedAt: new Date()
        }
      });
      
      // Create an audit log entry
      await prisma.auditLog.create({
        data: {
          id: generateUUID(),
          action: 'signature_created',
          resource: 'LegalSignature',
          userId: userId,
          user_id_int: parseInt(userId),
          details: {
            entityId: signatureId,
            description: `Digital signature created for agreement ${agreementType}`,
            agreementType,
            agreementVersion,
            timestamp: timestamp.toISOString()
          },
          createdAt: timestamp
        }
      });
      
      // Store the full signed agreement in secure storage
      const signedDocument = {
        signatureId,
        userId,
        agreementType,
        agreementVersion,
        timestamp: timestamp.toISOString(),
        ipAddress,
        userAgent,
        signatureData: JSON.parse(signatureData), // Include the same signature data
        agreementContent
      };
      
      await uploadToSecureStorage(
        `signatures/${agreementType}/${signatureId}.json`,
        JSON.stringify(signedDocument),
        {
          encryption: 'AES-256',
          contentType: 'application/json',
          metadata: {
            agreementType,
            agreementVersion,
            userId,
            signedAt: timestamp.toISOString()
          }
        }
      );
      
      logger.info(`Digital signature created for user ${userId} on agreement ${agreementType}`, {
        signatureId,
        agreementType,
        agreementVersion
      });
      
      return {
        signatureId,
        timestamp
      };
    } catch (error) {
      logger.error(`Error creating digital signature for user ${userId}`, {
        error,
        agreementType,
        agreementVersion
      });
      throw new Error(`Failed to create digital signature: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Verifies if a user has signed a specific agreement
   * 
   * @param userId - The ID of the user to check
   * @param agreementType - The type of agreement to verify
   * @param agreementVersion - Optional specific version to check (if not provided, checks any version)
   * @returns Verification result with signature details if found
   */
  public static async verifyUserSignature(
    userId: string,
    agreementType: AgreementTypes,
    agreementVersion?: string
  ): Promise<{
    hasSigned: boolean;
    signature?: {
      id: string;
      version: string;
      signedAt: Date;
    }
  }> {
    try {
      // Query for active signature
      const signatureQuery: any = {
        userId: userId,
        agreementType,
        status: 'active'
      };
      
      // Add version constraint if specified
      if (agreementVersion) {
        signatureQuery.agreementVersion = agreementVersion;
      }
      
      const signature = await prisma.legalSignature.findFirst({
        where: signatureQuery,
        orderBy: {
          signedAt: 'desc'
        }
      });
      
      if (!signature) {
        return { hasSigned: false };
      }
      
      // Create an audit log entry for the verification
      await prisma.auditLog.create({
        data: {
          id: generateUUID(),
          action: 'signature_verified',
          resource: 'LegalSignature',
          userId: userId,
          user_id_int: parseInt(userId),
          details: {
            entityId: signature.id,
            description: `Signature verified for agreement ${agreementType}`,
            agreementType,
            agreementVersion: signature.agreementVersion,
            result: 'success'
          },
          createdAt: getCurrentTimestamp()
        }
      });
      
      return {
        hasSigned: true,
        signature: {
          id: signature.id,
          version: signature.agreementVersion,
          signedAt: signature.signedAt
        }
      };
    } catch (error) {
      logger.error(`Error verifying signature for user ${userId}`, {
        error,
        agreementType
      });
      throw new Error(`Failed to verify signature: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Retrieves the complete signed agreement record
   * 
   * @param signatureId - The ID of the signature to retrieve
   * @returns The complete signed agreement record
   */
  public static async getSignedAgreement(signatureId: string): Promise<any> {
    try {
      // First, get the basic signature record to determine the path
      const signature = await prisma.legalSignature.findUnique({
        where: { id: signatureId }
      });
      
      if (!signature) {
        throw new Error(`Signature with ID ${signatureId} not found`);
      }
      
      // Get the full document from secure storage
      const storagePath = `signatures/${signature.agreementType}/${signatureId}.json`;
      const signedDocument = await getFromSecureStorage(storagePath);
      
      // Create an audit log entry
      await prisma.auditLog.create({
        data: {
          id: generateUUID(),
          action: 'agreement_retrieved',
          resource: 'LegalSignature',
          userId: signature.userId,
          details: {
            entityId: signatureId,
            description: `Signed agreement retrieved`,
            agreementType: signature.agreementType,
            agreementVersion: signature.agreementVersion
          },
          createdAt: getCurrentTimestamp()
        }
      });
      
      return JSON.parse(signedDocument);
    } catch (error) {
      logger.error(`Error retrieving signed agreement ${signatureId}`, { error });
      throw new Error(`Failed to retrieve signed agreement: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Revokes a signature (e.g., when a user requests data deletion)
   * 
   * @param signatureId - The ID of the signature to revoke
   * @param reason - The reason for revocation
   * @returns Success status
   */
  public static async revokeSignature(
    signatureId: string,
    reason: string
  ): Promise<{success: boolean}> {
    try {
      const signature = await prisma.legalSignature.findUnique({
        where: { id: signatureId }
      });
      
      if (!signature) {
        throw new Error(`Signature with ID ${signatureId} not found`);
      }
      
      // Create revocation signature data
      const revocationData = JSON.stringify({
        revocationReason: reason,
        revokedAt: getCurrentTimestamp().toISOString(),
        originalSignatureData: signature.signatureData
      });
      
      // Update the signature status
      await prisma.legalSignature.update({
        where: { id: signatureId },
        data: {
          status: 'revoked',
          signatureData: revocationData // Update signature data with revocation info
        }
      });
      
      // Create an audit log entry
      await prisma.auditLog.create({
        data: {
          id: generateUUID(),
          action: 'signature_revoked',
          resource: 'LegalSignature',
          userId: signature.userId,
          details: {
            entityId: signatureId,
            description: `Signature revoked: ${reason}`,
            agreementType: signature.agreementType,
            agreementVersion: signature.agreementVersion,
            reason,
            revokedAt: getCurrentTimestamp().toISOString()
          },
          createdAt: getCurrentTimestamp()
        }
      });
      
      logger.info(`Signature ${signatureId} revoked`, {
        userId: signature.userId,
        reason
      });
      
      return { success: true };
    } catch (error) {
      logger.error(`Error revoking signature ${signatureId}`, { error });
      throw new Error(`Failed to revoke signature: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Gets all signatures for a specific user
   * 
   * @param userId - The ID of the user
   * @returns List of all signatures for the user
   */
  public static async getUserSignatures(userId: string): Promise<any[]> {
    try {
      const signatures = await prisma.legalSignature.findMany({
        where: { userId: userId },
        orderBy: { signedAt: 'desc' }
      });
      
      // Create an audit log entry
      await prisma.auditLog.create({
        data: {
          id: generateUUID(),
          action: 'signatures_listed',
          resource: 'LegalSignature',
          userId: userId,
          user_id_int: parseInt(userId),
          details: {
            entityId: userId,
            description: `User signatures listed (${signatures.length} signatures)`,
            count: signatures.length
          },
          createdAt: getCurrentTimestamp()
        }
      });
      
      return signatures.map(sig => ({
        id: sig.id,
        agreementType: sig.agreementType,
        agreementVersion: sig.agreementVersion,
        signedAt: sig.signedAt,
        status: sig.status
      }));
    } catch (error) {
      logger.error(`Error getting signatures for user ${userId}`, { error });
      throw new Error(`Failed to get user signatures: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Retrieves the content of a specific agreement
   * 
   * @param agreementType - The type of agreement
   * @param agreementVersion - The version of the agreement
   * @returns The agreement content
   */
  private static async getAgreementContent(
    agreementType: AgreementTypes,
    agreementVersion: string
  ): Promise<string> {
    // In a production environment, this would retrieve the specific version
    // of the agreement from a content management system or database
    // For this implementation, we'll retrieve from our static legal content
    try {
      const agreementContent = await prisma.legalDocument.findFirst({
        where: {
          type: agreementType,
          version: agreementVersion,
          status: 'active'
        }
      });
      
      if (!agreementContent) {
        throw new Error(`Agreement ${agreementType} version ${agreementVersion} not found`);
      }
      
      return agreementContent.content;
    } catch (error) {
      logger.error(`Error retrieving agreement content`, {
        error,
        agreementType,
        agreementVersion
      });
      throw new Error(`Failed to retrieve agreement content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Creates a hash of the agreement content for verification
   * 
   * @param content - The agreement content to hash
   * @returns The content hash
   */
  private static createContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }
  
  /**
   * Extracts the platform information from a user agent string
   * 
   * @param userAgent - The user agent string
   * @returns The platform name
   */
  private static extractPlatformFromUserAgent(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }
  
}