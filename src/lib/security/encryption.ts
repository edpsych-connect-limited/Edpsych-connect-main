import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';

/**
 * ENTERPRISE-GRADE ENCRYPTION UTILITY
 * 
 * Implements AES-256-GCM (Galois/Counter Mode) for authenticated encryption.
 * This exceeds standard requirements by ensuring both confidentiality and integrity.
 * 
 * Features:
 * - AES-256-GCM (Authenticated Encryption)
 * - Unique IV per encryption
 * - Auth Tag verification to prevent tampering
 * - Key derivation using scrypt (if raw password used)
 * - Data masking for safe logging
 */

function getEncryptionKey(): string {
  // Support both legacy and newer naming to avoid config drift.
  // ENCRYPTION_KEY is used broadly across the codebase.
  // SECRETS_ENCRYPTION_KEY is used by the secrets manager implementation.
  const key = process.env.ENCRYPTION_KEY || process.env.SECRETS_ENCRYPTION_KEY;
  if (key) return key;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variable: ENCRYPTION_KEY');
  }

  // Dev-only fallback to keep local developer experience smooth.
  // Not suitable for production.
  return 'dev-only-insecure-encryption-key-change-me';
}

// Ensure key is 32 bytes for AES-256.
// NOTE: Keep this lazy so Next.js build-time module evaluation doesn't explode
// when secrets are not provided at compile time.
let _MASTER_KEY: Buffer | null = null;
function getMasterKey(): Buffer {
  if (_MASTER_KEY) return _MASTER_KEY;
  _MASTER_KEY = scryptSync(getEncryptionKey(), 'salt', 32);
  return _MASTER_KEY;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const _AUTH_TAG_LENGTH = 16; // Reserved for future tag validation

export interface EncryptedData {
  iv: string;
  content: string;
  tag: string;
}

/**
 * Encrypts sensitive text using AES-256-GCM
 * @param text The plaintext to encrypt
 * @returns EncryptedData object containing hex strings
 */
export function encrypt(text: string): EncryptedData {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getMasterKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: tag.toString('hex')
  };
}

/**
 * Decrypts data and verifies integrity using Auth Tag
 * @param encryptedData The object returned from encrypt()
 * @returns The original plaintext
 * @throws Error if authentication fails (tampering detected)
 */
export function decrypt(encryptedData: EncryptedData): string {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, getMasterKey(), iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Helper to encrypt a string into a single storage-friendly format
 * Format: iv:tag:content
 */
export function encryptToString(text: string): string {
  const { iv, tag, content } = encrypt(text);
  return `${iv}:${tag}:${content}`;
}

/**
 * Helper to decrypt from the single storage-friendly format
 */
export function decryptFromString(storedString: string): string {
  const [iv, tag, content] = storedString.split(':');
  if (!iv || !tag || !content) throw new Error('Invalid encrypted string format');
  return decrypt({ iv, tag, content });
}

/**
 * Masks sensitive data for logging purposes
 * Exceeds standard compliance by preserving format for debugging while hiding PII
 */
export function maskPII(text: string, type: 'email' | 'phone' | 'name' | 'generic' = 'generic'): string {
  if (!text) return '';
  
  switch (type) {
    case 'email':
      const [local, domain] = text.split('@');
      if (!domain) return '***@***.***';
      return `${local.charAt(0)}***@${domain}`;
    
    case 'phone':
      return text.replace(/.(?=.{4})/g, '*'); // Show last 4 digits
      
    case 'name':
      return text.charAt(0) + '***';
      
    default:
      if (text.length <= 4) return '****';
      return text.substring(0, 2) + '***' + text.substring(text.length - 2);
  }
}
