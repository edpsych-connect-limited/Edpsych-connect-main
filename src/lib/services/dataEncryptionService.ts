/**
 * Data Encryption Service
 *
 * This service provides comprehensive data encryption and privacy control capabilities:
 * - Field-level encryption for sensitive data
 * - Key management and rotation
 * - Encryption at rest and in transit
 * - Privacy-preserving data processing
 * - Compliance with data protection regulations
 */

import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';

class DataEncryptionService {
  options: any;
  masterKey: any;
  keyVersions: Map<string, any>;
  encryptedFields: Set<string>;
  encryptionKeys: Map<string, any>;
  keyMetadata: Map<string, any>;

  constructor(options: any = {}) {
    this.options = {
      algorithm: options.algorithm || 'aes-256-gcm',
      keyLength: options.keyLength || 32,
      ivLength: options.ivLength || 16,
      keyRotationDays: options.keyRotationDays || 90,
      encryptionEnabled: options.encryptionEnabled !== false,
      ...options
    };

    this.masterKey = null;
    this.keyVersions = new Map();
    this.encryptionKeys = new Map();
    this.keyMetadata = new Map();
    this.encryptedFields = new Set([
      'password',
      'ssn',
      'creditCard',
      'bankAccount',
      'healthInfo',
      'personalData.ssn',
      'personalData.healthInfo',
      'financialData.accountNumber',
      'financialData.routingNumber'
    ]);

    this._initialize();
  }

  /**
   * Initialize the data encryption service
   */
  async _initialize() {
    try {
      // Load or generate master key
      await this._loadMasterKey();

      // Load encryption keys
      await this._loadEncryptionKeys();

      // Set up key rotation schedule
      this._scheduleKeyRotation();

      logger.info('Data encryption service initialized');
    } catch (error) {
      logger.error('Error initializing data encryption service:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Encrypt sensitive data
   *
   * @param {any} data - Data to encrypt
   * @param {Object} options - Encryption options
   * @returns {string} Encrypted data
   */
  async encrypt(data: any, options: any = {}) {
    try {
      if (!this.options.encryptionEnabled) {
        return data;
      }

      const {
        keyId = 'default',
        purpose = 'general',
        expiresAt = null
      } = options;

      // Get or create encryption key
      const key = await this._getEncryptionKey(keyId);

      // Generate IV
      const iv = crypto.randomBytes(this.options.ivLength);

      // Create cipher
      const cipher = crypto.createCipher(this.options.algorithm, key);

      // Encrypt data
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag for GCM mode
      let authTag = '';
      if (this.options.algorithm.includes('gcm')) {
        authTag = cipher.getAuthTag().toString('hex');
      }

      // Create encrypted data package
      const encryptedPackage = {
        data: encrypted,
        iv: iv.toString('hex'),
        keyId,
        algorithm: this.options.algorithm,
        authTag,
        purpose,
        encryptedAt: new Date().toISOString(),
        expiresAt
      };

      return JSON.stringify(encryptedPackage);
    } catch (error) {
      logger.error('Error encrypting data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   *
   * @param {string} encryptedData - Encrypted data package
   * @returns {any} Decrypted data
   */
  async decrypt(encryptedData: any) {
    try {
      if (!this.options.encryptionEnabled) {
        return encryptedData;
      }

      // Parse encrypted data package
      const encryptedPackage = JSON.parse(encryptedData);

      // Get decryption key
      const key = await this._getEncryptionKey(encryptedPackage.keyId);

      // Create decipher
      const decipher = crypto.createDecipher(this.options.algorithm, key);

      // Set IV
      const iv = Buffer.from(encryptedPackage.iv, 'hex');
      decipher.setIV(iv);

      // Set auth tag for GCM mode
      if (encryptedPackage.authTag && this.options.algorithm.includes('gcm')) {
        decipher.setAuthTag(Buffer.from(encryptedPackage.authTag, 'hex'));
      }

      // Decrypt data
      let decrypted = decipher.update(encryptedPackage.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Parse and return original data
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Error decrypting data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Encrypt object fields
   *
   * @param {Object} obj - Object to encrypt fields in
   * @param {Array} fields - Fields to encrypt (optional)
   * @returns {Object} Object with encrypted fields
   */
  async encryptFields(obj: any, fields: string[] | null = null) {
    try {
      const fieldsToEncrypt = fields || Array.from(this.encryptedFields);
      const encryptedObj = { ...obj };

      for (const field of fieldsToEncrypt) {
        if (this._hasNestedProperty(obj, field)) {
          const value = this._getNestedProperty(obj, field);

          if (value !== undefined && value !== null) {
            const encryptedValue = await this.encrypt(value, {
              purpose: `field_encryption_${field}`,
              keyId: `field_${field.replace(/\./g, '_')}`
            });

            this._setNestedProperty(encryptedObj, field, encryptedValue);
          }
        }
      }

      return encryptedObj;
    } catch (error) {
      logger.error('Error encrypting object fields:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Decrypt object fields
   *
   * @param {Object} obj - Object to decrypt fields in
   * @param {Array} fields - Fields to decrypt (optional)
   * @returns {Object} Object with decrypted fields
   */
  async decryptFields(obj: any, fields: string[] | null = null) {
    try {
      const fieldsToDecrypt = fields || Array.from(this.encryptedFields);
      const decryptedObj = { ...obj };

      for (const field of fieldsToDecrypt) {
        if (this._hasNestedProperty(obj, field)) {
          const value = this._getNestedProperty(obj, field);

          if (value && typeof value === 'string' && this._isEncryptedData(value)) {
            try {
              const decryptedValue = await this.decrypt(value);
              this._setNestedProperty(decryptedObj, field, decryptedValue);
            } catch (decryptError) {
              logger.warn(`Failed to decrypt field ${field}:`, decryptError.message);
              // Keep encrypted value if decryption fails
            }
          }
        }
      }

      return decryptedObj;
    } catch (error) {
      logger.error('Error decrypting object fields:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Generate a new encryption key
   *
   * @param {string} keyId - Key identifier
   * @param {Object} options - Key options
   * @returns {string} Key ID
   */
  async generateKey(keyId: string, options: any = {}) {
    try {
      const {
        purpose = 'general',
        expiresIn = this.options.keyRotationDays * 24 * 60 * 60 * 1000 // Default expiration
      } = options;

      // Generate new key
      const key = crypto.randomBytes(this.options.keyLength);
      const keyHash = crypto.createHash('sha256').update(key).digest('hex');

      // Store key
      this.encryptionKeys.set(keyId, key);

      // Store key metadata
      const metadata = {
        id: keyId,
        hash: keyHash,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiresIn).toISOString(),
        purpose,
        algorithm: this.options.algorithm,
        status: 'active'
      };

      this.keyMetadata.set(keyId, metadata);

      // Persist key (encrypted)
      await this._persistKey(keyId, key, metadata);

      logger.info(`Generated new encryption key: ${keyId}`);
      return keyId;
    } catch (error) {
      logger.error('Error generating encryption key:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Rotate encryption keys
   *
   * @param {string} keyId - Key to rotate
   * @returns {string} New key ID
   */
  async rotateKey(keyId: string) {
    try {
      // Mark old key as rotated
      if (this.keyMetadata.has(keyId)) {
        const metadata = this.keyMetadata.get(keyId);
        metadata.status = 'rotated';
        metadata.rotatedAt = new Date().toISOString();
        await this._persistKeyMetadata(keyId, metadata);
      }

      // Generate new key
      const newKeyId = `${keyId}_v${Date.now()}`;
      await this.generateKey(newKeyId, {
        purpose: this.keyMetadata.get(keyId)?.purpose || 'general'
      });

      logger.info(`Rotated encryption key: ${keyId} -> ${newKeyId}`);
      return newKeyId;
    } catch (error) {
      logger.error('Error rotating encryption key:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get key rotation status
   *
   * @returns {Object} Key rotation status
   */
  async getKeyRotationStatus() {
    try {
      const status = {
        totalKeys: this.keyMetadata.size,
        activeKeys: 0,
        expiredKeys: 0,
        rotatedKeys: 0,
        keysNeedingRotation: []
      };

      const now = new Date();

      for (const [keyId, metadata] of this.keyMetadata) {
        switch (metadata.status) {
          case 'active':
            status.activeKeys++;
            // Check if key needs rotation
            const createdAt = new Date(metadata.createdAt);
            const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);

            if (daysSinceCreation >= this.options.keyRotationDays) {
              status.keysNeedingRotation.push({
                keyId,
                daysSinceCreation: Math.floor(daysSinceCreation),
                createdAt: metadata.createdAt
              });
            }
            break;
          case 'expired':
            status.expiredKeys++;
            break;
          case 'rotated':
            status.rotatedKeys++;
            break;
        }
      }

      return status;
    } catch (error) {
      logger.error('Error getting key rotation status:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Hash sensitive data for privacy-preserving operations
   *
   * @param {string} data - Data to hash
   * @param {string} salt - Salt for hashing
   * @returns {string} Hashed data
   */
  hashForPrivacy(data, salt = '') {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(data + salt);
      return hash.digest('hex');
    } catch (error) {
      logger.error('Error hashing data for privacy:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Anonymize data for research purposes
   *
   * @param {Object} data - Data to anonymize
   * @param {Object} options - Anonymization options
   * @returns {Object} Anonymized data
   */
  anonymizeData(data, options = {}) {
    try {
      const {
        removeFields = ['name', 'email', 'phone', 'address'],
        hashFields = ['id', 'userId'],
        generalizeFields = {},
        noiseFields = {}
      } = options;

      const anonymized = { ...data };

      // Remove sensitive fields
      removeFields.forEach(field => {
        if (this._hasNestedProperty(anonymized, field)) {
          this._deleteNestedProperty(anonymized, field);
        }
      });

      // Hash identifier fields
      hashFields.forEach(field => {
        if (this._hasNestedProperty(anonymized, field)) {
          const value = this._getNestedProperty(anonymized, field);
          if (value) {
            const hashed = this.hashForPrivacy(value, options.salt || 'anonymization');
            this._setNestedProperty(anonymized, field, hashed);
          }
        }
      });

      // Generalize fields (e.g., age groups instead of exact ages)
      Object.entries(generalizeFields).forEach(([field, generalizer]) => {
        if (this._hasNestedProperty(anonymized, field)) {
          const value = this._getNestedProperty(anonymized, field);
          if (value && typeof generalizer === 'function') {
            const generalized = generalizer(value);
            this._setNestedProperty(anonymized, field, generalized);
          }
        }
      });

      // Add noise to fields
      Object.entries(noiseFields).forEach(([field, noiseLevel]) => {
        if (this._hasNestedProperty(anonymized, field)) {
          const value = this._getNestedProperty(anonymized, field);
          if (typeof value === 'number') {
            const noise = (Math.random() - 0.5) * 2 * noiseLevel;
            this._setNestedProperty(anonymized, field, value + noise);
          }
        }
      });

      return anonymized;
    } catch (error) {
      logger.error('Error anonymizing data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Check data residency compliance
   *
   * @param {Object} data - Data to check
   * @param {string} requiredLocation - Required data location
   * @returns {Object} Compliance check result
   */
  checkDataResidencyCompliance(data, requiredLocation) {
    try {
      // This is a simplified implementation
      // In a real system, this would check data classification and storage location

      const result = {
        compliant: true,
        violations: [],
        recommendations: []
      };

      // Check if data contains sensitive information that requires specific residency
      const sensitiveFields = ['healthInfo', 'financialData', 'personalData.ssn'];

      for (const field of sensitiveFields) {
        if (this._hasNestedProperty(data, field)) {
          const value = this._getNestedProperty(data, field);

          if (value) {
            // Assume sensitive data must be stored in specific locations
            // This would be more sophisticated in a real implementation
            result.violations.push({
              field,
              issue: `Sensitive data in ${field} may not comply with ${requiredLocation} residency requirements`,
              severity: 'high'
            });
            result.compliant = false;
          }
        }
      }

      if (!result.compliant) {
        result.recommendations.push(
          `Ensure data containing sensitive information is stored in ${requiredLocation}`,
          'Review data classification policies',
          'Implement data residency controls'
        );
      }

      return result;
    } catch (error) {
      logger.error('Error checking data residency compliance:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Generate data encryption report
   *
   * @returns {Object} Encryption status report
   */
  async generateEncryptionReport() {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        encryptionEnabled: this.options.encryptionEnabled,
        algorithm: this.options.algorithm,
        keyStatus: {
          totalKeys: this.keyMetadata.size,
          activeKeys: 0,
          expiredKeys: 0,
          rotatedKeys: 0
        },
        encryptedFields: Array.from(this.encryptedFields),
        keyRotationStatus: await this.getKeyRotationStatus(),
        recommendations: []
      };

      // Count key statuses
      for (const metadata of this.keyMetadata.values()) {
        switch (metadata.status) {
          case 'active':
            report.keyStatus.activeKeys++;
            break;
          case 'expired':
            report.keyStatus.expiredKeys++;
            break;
          case 'rotated':
            report.keyStatus.rotatedKeys++;
            break;
        }
      }

      // Generate recommendations
      if (report.keyRotationStatus.keysNeedingRotation.length > 0) {
        report.recommendations.push(
          `${report.keyRotationStatus.keysNeedingRotation.length} encryption keys need rotation`
        );
      }

      if (report.keyStatus.expiredKeys > 0) {
        report.recommendations.push(
          `${report.keyStatus.expiredKeys} encryption keys have expired and should be replaced`
        );
      }

      return report;
    } catch (error) {
      logger.error('Error generating encryption report:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Load master key
   *
   * @private
   */
  async _loadMasterKey() {
    try {
      // In a real implementation, load from secure key store
      // For demo, generate or load from environment
      const masterKeyPath = path.join(process.cwd(), 'keys', 'master.key');

      try {
        this.masterKey = await fs.readFile(masterKeyPath);
      } catch (error) {
        // Generate new master key
        this.masterKey = crypto.randomBytes(32);
        await fs.mkdir(path.dirname(masterKeyPath), { recursive: true });
        await fs.writeFile(masterKeyPath, this.masterKey);
        logger.info('Generated new master key');
      }
    } catch (error) {
      logger.error('Error loading master key:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Load encryption keys
   *
   * @private
   */
  async _loadEncryptionKeys() {
    try {
      const keysDir = path.join(process.cwd(), 'keys', 'encryption');

      try {
        const files = await fs.readdir(keysDir);

        for (const file of files) {
          if (file.endsWith('.key')) {
            const keyId = file.replace('.key', '');
            const keyPath = path.join(keysDir, file);
            const encryptedKey = await fs.readFile(keyPath);

            // Decrypt the key using master key
            const key = this._decryptWithMasterKey(encryptedKey);
            this.encryptionKeys.set(keyId, key);

            // Load metadata
            const metadataPath = path.join(keysDir, `${keyId}.meta`);
            try {
              const metadataContent = await fs.readFile(metadataPath, 'utf8');
              const metadata = JSON.parse(metadataContent);
              this.keyMetadata.set(keyId, metadata);
            } catch (metadataError) {
              logger.warn(`Could not load metadata for key ${keyId}:`, metadataError.message);
            }
          }
        }
      } catch (error) {
        // Keys directory doesn't exist, create default key
        await this.generateKey('default');
      }

      logger.info(`Loaded ${this.encryptionKeys.size} encryption keys`);
    } catch (error) {
      logger.error('Error loading encryption keys:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get encryption key
   *
   * @private
   * @param {string} keyId - Key identifier
   * @returns {Buffer} Encryption key
   */
  async _getEncryptionKey(keyId: string) {
    if (this.encryptionKeys.has(keyId)) {
      const metadata = this.keyMetadata.get(keyId);

      // Check if key is expired
      if (metadata && metadata.expiresAt) {
        const expiresAt = new Date(metadata.expiresAt);
        if (expiresAt < new Date()) {
          logger.warn(`Encryption key ${keyId} has expired`);
          // In a real implementation, you might want to handle expired keys differently
        }
      }

      return this.encryptionKeys.get(keyId);
    }

    // Generate new key if it doesn't exist
    await this.generateKey(keyId);
    return this.encryptionKeys.get(keyId);
  }

  /**
   * Persist encryption key
   *
   * @private
   * @param {string} keyId - Key identifier
   * @param {Buffer} key - Encryption key
   * @param {Object} metadata - Key metadata
   */
  async _persistKey(keyId: string, key: any, metadata: any) {
    try {
      const keysDir = path.join(process.cwd(), 'keys', 'encryption');
      await fs.mkdir(keysDir, { recursive: true });

      // Encrypt key with master key
      const encryptedKey = this._encryptWithMasterKey(key);

      // Save encrypted key
      const keyPath = path.join(keysDir, `${keyId}.key`);
      await fs.writeFile(keyPath, encryptedKey);

      // Save metadata
      const metadataPath = path.join(keysDir, `${keyId}.meta`);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      logger.error('Error persisting encryption key:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Persist key metadata
   *
   * @private
   * @param {string} keyId - Key identifier
   * @param {Object} metadata - Key metadata
   */
  async _persistKeyMetadata(keyId: string, metadata: any) {
    try {
      const keysDir = path.join(process.cwd(), 'keys', 'encryption');
      const metadataPath = path.join(keysDir, `${keyId}.meta`);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      logger.error('Error persisting key metadata:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Encrypt with master key
   *
   * @private
   * @param {Buffer} data - Data to encrypt
   * @returns {Buffer} Encrypted data
   */
  _encryptWithMasterKey(data) {
    const cipher = crypto.createCipher('aes-256-cbc', this.masterKey);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted;
  }

  /**
   * Decrypt with master key
   *
   * @private
   * @param {Buffer} encryptedData - Data to decrypt
   * @returns {Buffer} Decrypted data
   */
  _decryptWithMasterKey(encryptedData) {
    const decipher = crypto.createDecipher('aes-256-cbc', this.masterKey);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  }

  /**
   * Schedule key rotation
   *
   * @private
   */
  _scheduleKeyRotation() {
    // Check for key rotation daily
    setInterval(async () => {
      try {
        const status = await this.getKeyRotationStatus();

        for (const keyInfo of status.keysNeedingRotation) {
          logger.info(`Rotating encryption key: ${keyInfo.keyId}`);
          await this.rotateKey(keyInfo.keyId);
        }
      } catch (error) {
        logger.error('Error during key rotation:', error instanceof Error ? error.message : String(error));
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  /**
   * Check if data is encrypted
   *
   * @private
   * @param {string} data - Data to check
   * @returns {boolean} Whether data is encrypted
   */
  _isEncryptedData(data) {
    try {
      const parsed = JSON.parse(data);
      return parsed.data && parsed.iv && parsed.keyId && parsed.algorithm;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if object has nested property
   *
   * @private
   * @param {Object} obj - Object to check
   * @param {string} path - Property path
   * @returns {boolean} Whether property exists
   */
  _hasNestedProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      current = current[key];
    }

    return true;
  }

  /**
   * Get nested property value
   *
   * @private
   * @param {Object} obj - Object to get from
   * @param {string} path - Property path
   * @returns {any} Property value
   */
  _getNestedProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!current || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Set nested property value
   *
   * @private
   * @param {Object} obj - Object to modify
   * @param {string} path - Property path
   * @param {any} value - Value to set
   */
  _setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Delete nested property
   *
   * @private
   * @param {Object} obj - Object to modify
   * @param {string} path - Property path
   */
  _deleteNestedProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current || typeof current !== 'object' || !(key in current)) {
        return;
      }
      current = current[key];
    }

    delete current[keys[keys.length - 1]];
  }

  /**
   * Shutdown the data encryption service
   */
  async shutdown() {
    logger.info('Data encryption service shut down');
  }
}

export default DataEncryptionService;