/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { AgreementTypes, LegalDocument } from '../types/legal';
import { logger } from "@/lib/logger";

/**
 * Service for handling legal documents and agreements
 * Provides functions for fetching, caching, and managing legal content
 */
export class LegalService {
  // Cache for legal documents to reduce database queries
  private static documentCache: Map<string, {
    document: LegalDocument;
    timestamp: number;
  }> = new Map();

  // Cache expiration time (30 minutes)
  private static CACHE_EXPIRATION_MS = 30 * 60 * 1000;

  /**
   * Fetch a legal document by type, optionally with a specific version
   * 
   * @param type - Type of legal document to fetch
   * @param version - Optional specific version to fetch (fetches latest active version if not specified)
   * @returns The legal document
   */
  public static async fetchDocument(
    type: AgreementTypes, 
    version?: string
  ): Promise<LegalDocument> {
    try {
      // Create cache key
      const cacheKey = `${type}:${version || 'latest'}`;
      
      // Check cache first
      const cachedDocument = this.documentCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedDocument && (now - cachedDocument.timestamp) < this.CACHE_EXPIRATION_MS) {
        return cachedDocument.document;
      }
      
      // Fetch from API
      let url = `/api/legal/documents?type=${encodeURIComponent(type)}`;
      
      if (version) {
        url += `&version=${encodeURIComponent(version)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch legal document: ${response.statusText}`);
      }
      
      const document = await response.json();
      
      // Update cache
      this.documentCache.set(cacheKey, {
        document,
        timestamp: now
      });
      
      return document;
    } catch (_error) {
      logger.error(`Error fetching legal document`, {
        type,
        version,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to fetch legal document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Fetch a legal document by type
 * 
 * @param type - Type of legal document to fetch
 * @param version - Optional specific version to fetch
 * @returns The legal document
 */
export async function fetchLegalDocument(
  type: AgreementTypes,
  version?: string
): Promise<LegalDocument> {
  return LegalService.fetchDocument(type, version);
}

/**
 * Verify if a user has signed a specific agreement
 * 
 * @param agreementType - The type of agreement to verify
 * @param version - Optional specific version to verify
 * @returns Whether the user has signed the agreement
 */
export async function verifyUserSignature(
  agreementType: AgreementTypes,
  version?: string
): Promise<{
  hasSigned: boolean;
  signature?: {
    id: string;
    version: string;
    signedAt: Date;
  }
}> {
  try {
    let url = `/api/legal/verify?type=${encodeURIComponent(agreementType)}`;
    
    if (version) {
      url += `&version=${encodeURIComponent(version)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to verify signature: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (_error) {
    logger.error(`Error verifying signature`, {
      agreementType,
      version,
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`Failed to verify signature: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get user signatures for all agreements
 * 
 * @returns List of user signatures
 */
export async function getUserSignatures(): Promise<any[]> {
  try {
    const response = await fetch('/api/legal/signatures');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch signatures: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (_error) {
    logger.error(`Error fetching user signatures`, {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`Failed to fetch signatures: ${error instanceof Error ? error.message : String(error)}`);
  }
}