import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from './prisma';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

/**
 * Secure storage service for sensitive legal documents
 * Provides encrypted storage with audit trail and secure access controls
 * Implemented using database storage (Postgres)
 */

// Environment configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '32_CHAR_STRONG_KEY_FOR_LOCAL_DEV'; // Use proper secret management in production
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/**
 * Interface for storage options
 */
interface StorageOptions {
  encryption?: 'none' | 'AES-256';
  contentType?: string;
  metadata?: Record<string, string>;
  expiresIn?: number; // URL expiration in seconds
}

/**
 * Upload a file to secure storage
 *
 * @param path - The storage path for the file
 * @param content - The content to store
 * @param options - Storage options
 * @returns The path identifier of the stored file
 */
export async function uploadToSecureStorage(
  path: string,
  content: string | Buffer,
  options: StorageOptions = {}
): Promise<string> {
  try {
    // Default options
    const opts = {
      encryption: options.encryption || 'AES-256',
      contentType: options.contentType || 'application/json',
      metadata: options.metadata || {}
    };

    // Add timestamp metadata
    const timestamp = new Date().toISOString();
    const metadata = {
      ...opts.metadata,
      uploadTimestamp: timestamp,
      securityClassification: 'confidential',
      contentType: opts.contentType
    };

    // Encrypt content if needed
    let processedContent: string;
    let encryptionMetadata = {};

    if (opts.encryption === 'AES-256') {
      const iv = randomBytes(16);
      const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content;
      const encryptedContent = encryptContent(contentBuffer, iv);

      processedContent = encryptedContent.toString('base64');
      encryptionMetadata = {
        encryptionAlgorithm: ENCRYPTION_ALGORITHM,
        iv: iv.toString('hex'),
        contentHash: createHash('sha256')
          .update(typeof content === 'string' ? content : content.toString())
          .digest('hex')
      };
    } else {
      processedContent = typeof content === 'string' ? content : content.toString();
    }

    // Format metadata properly (all values must be strings)
    const formattedMetadata = {
      ...metadata,
      ...encryptionMetadata
    };

    // Store document in database
    await prisma.secureDocument.upsert({
      where: { path },
      update: {
        content: processedContent,
        metadata: formattedMetadata,
        updatedAt: new Date()
      },
      create: {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        path,
        content: processedContent,
        metadata: formattedMetadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    logger.info(`Securely stored document at ${path}`, {
      path,
      contentType: opts.contentType,
      encryptionType: opts.encryption
    });

    // Return the path as the identifier
    return path;
  } catch (_error) {
    const storageError = _error as Error;
    logger._error(`Error storing document securely: ${storageError.message}`, {
      path
    });
    throw new Error(`Failed to store document securely: ${storageError.message}`);
  }
}

/**
 * Retrieve a file from secure storage
 *
 * @param path - The storage path of the file
 * @returns The decrypted content
 */
export async function getFromSecureStorage(path: string): Promise<string> {
  try {
    // Get the document from database
    const document = await prisma.secureDocument.findUnique({
      where: { path }
    });

    if (!document) {
      throw new Error(`Document not found at path: ${path}`);
    }

    // Get the metadata
    const metadata = document.metadata as Record<string, any> || {};

    // Check if encrypted
    if (metadata.encryptionAlgorithm === ENCRYPTION_ALGORITHM) {
      if (!document.content) {
        throw new Error('Document content is empty');
      }
      // Decrypt the content
      const iv = Buffer.from(metadata.iv, 'hex');
      const encryptedContent = Buffer.from(document.content, 'base64');
      const decryptedContent = decryptContent(encryptedContent, iv);
      return decryptedContent.toString('utf-8');
    }

    // Return unencrypted content
    return document.content || '';
  } catch (_error) {
    const retrieveError = _error as Error;
    logger._error(`Error retrieving document from secure storage: ${retrieveError.message}`, {
      path
    });
    throw new Error(`Failed to retrieve document from secure storage: ${retrieveError.message}`);
  }
}

/**
 * Get a temporary access URL for a document
 *
 * @param path - The storage path of the file
 * @param expiresIn - URL expiration in seconds (default: 3600)
 * @returns Signed URL for temporary access
 */
export async function getSignedStorageUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    // Generate a temporary token for this access
    const token = generateTemporaryToken(path, expiresIn);
    
    // Return an API URL with the token
    const apiUrl = `/api/secure-documents/${encodeURIComponent(path)}?token=${token}`;
    
    logger.info(`Generated access URL for ${path}`, {
      path,
      expiresIn
    });
    
    return apiUrl;
  } catch (_error) {
    const urlError = _error as Error;
    logger._error(`Error generating access URL: ${urlError.message}`, {
      path
    });
    throw new Error(`Failed to generate access URL: ${urlError.message}`);
  }
}

/**
 * Delete a file from secure storage
 *
 * @param path - The storage path of the file
 * @returns Success status
 */
export async function deleteFromSecureStorage(path: string): Promise<boolean> {
  try {
    await prisma.secureDocument.delete({
      where: { path }
    });

    logger.info(`Deleted document from secure storage: ${path}`);
    return true;
  } catch (_error) {
    const deleteError = _error as Error;
    logger._error(`Error deleting document from secure storage: ${deleteError.message}`, {
      path
    });
    throw new Error(`Failed to delete document from secure storage: ${deleteError.message}`);
  }
}

/**
 * Encrypt content using AES-256-CBC
 *
 * @param content - Content to encrypt
 * @param iv - Initialization vector
 * @returns Encrypted content
 */
function encryptContent(content: Buffer, iv: Buffer): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  return Buffer.concat([cipher.update(content), cipher.final()]);
}

/**
 * Decrypt content using AES-256-CBC
 *
 * @param encryptedContent - Encrypted content
 * @param iv - Initialization vector
 * @returns Decrypted content
 */
function decryptContent(encryptedContent: Buffer, iv: Buffer): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY);
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
}

/**
 * Generate a temporary access token
 * 
 * @param path - The document path
 * @param expiresIn - Expiration time in seconds
 * @returns Temporary access token
 */
function generateTemporaryToken(path: string, expiresIn: number): string {
  const expiry = Math.floor(Date.now() / 1000) + expiresIn;
  const data = `${path}|${expiry}`;
  const signature = createHash('sha256')
    .update(data + ENCRYPTION_KEY)
    .digest('hex');
  
  return Buffer.from(`${data}|${signature}`).toString('base64');
}