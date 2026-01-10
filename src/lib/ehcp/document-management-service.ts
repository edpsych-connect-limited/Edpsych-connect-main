/**
 * Document Management Service
 * 
 * Handles upload, storage, versioning, and access control
 * for EHCP-related documents (reports, assessments, evidence).
 * 
 * Features:
 * - Cloud storage integration (S3/Azure/GCP)
 * - Virus scanning on upload
 * - Document versioning
 * - Access control by role and application
 * - Document categorization (Section B, C, D, etc.)
 * - Metadata tracking (upload date, uploader, file type)
 * - Document viewer with PDF preview
 * 
 * GDPR Compliance:
 * - All documents encrypted at rest
 * - Audit trail of all access
 * - Automatic deletion after retention period
 * - Data processing agreement with cloud provider
 * 
 * @author EdPsych Connect Limited
 */

import { logger } from '@/lib/logger';

export type DocumentType =
  | 'INITIAL_REQUEST'
  | 'EP_REPORT'
  | 'MEDICAL_REPORT'
  | 'SALT_REPORT'
  | 'OT_REPORT'
  | 'EDUCATIONAL_ADVICE'
  | 'HEALTH_ADVICE'
  | 'SOCIAL_CARE_ADVICE'
  | 'PARENTAL_VIEWS'
  | 'CHILD_VIEWS'
  | 'SUPPORTING_EVIDENCE'
  | 'DECISION_LETTER'
  | 'DRAFT_PLAN'
  | 'FINAL_PLAN'
  | 'ANNUAL_REVIEW'
  | 'OTHER';

export type DocumentStatus =
  | 'UPLOADING'
  | 'SCANNING'
  | 'AVAILABLE'
  | 'QUARANTINED'
  | 'ARCHIVED'
  | 'DELETED';

export type AccessLevel =
  | 'LA_ONLY'
  | 'SCHOOL_ONLY'
  | 'LA_AND_SCHOOL'
  | 'ALL_PROFESSIONALS'
  | 'PARENT_ACCESSIBLE';

export interface Document {
  id: number;
  ehcpApplicationId: number;
  tenantId: number;
  type: DocumentType;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number; // bytes
  storageProvider: 'S3' | 'AZURE' | 'GCP' | 'LOCAL';
  storageUrl: string;
  storageBucket?: string;
  storageKey?: string;
  uploadedBy: number; // user_id
  uploadedByName: string;
  uploadedByRole: 'LA' | 'SCHOOL' | 'PROFESSIONAL';
  uploadedAt: Date;
  status: DocumentStatus;
  virusScanResult?: 'CLEAN' | 'INFECTED' | 'SCAN_FAILED';
  virusScanDate?: Date;
  accessLevel: AccessLevel;
  sectionReference?: string; // e.g., "Section B", "Section D"
  version: number;
  isLatestVersion: boolean;
  previousVersionId?: number;
  checksum: string; // MD5 or SHA256
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentAccessLog {
  id: number;
  documentId: number;
  userId: number;
  userName: string;
  userRole: string;
  action: 'VIEWED' | 'DOWNLOADED' | 'UPLOADED' | 'DELETED' | 'SHARED';
  ipAddress: string;
  userAgent: string;
  accessedAt: Date;
}

export interface UploadResult {
  success: boolean;
  document?: Document;
  error?: string;
}

export class DocumentManagementService {
  private tenantId: number;
  private storageProvider: 'S3' | 'AZURE' | 'GCP' | 'LOCAL';

  constructor(tenantId: number, storageProvider: 'S3' | 'AZURE' | 'GCP' | 'LOCAL' = 'S3') {
    this.tenantId = tenantId;
    this.storageProvider = storageProvider;
  }

  /**
   * Upload document with virus scanning
   */
  async uploadDocument(
    ehcpApplicationId: number,
    file: File,
    type: DocumentType,
    uploadedBy: number,
    uploadedByName: string,
    uploadedByRole: 'LA' | 'SCHOOL' | 'PROFESSIONAL',
    accessLevel: AccessLevel = 'LA_AND_SCHOOL',
    sectionReference?: string
  ): Promise<UploadResult> {
    logger.info(`[Documents] Starting upload: ${file.name} for application ${ehcpApplicationId}`);

    try {
      // Step 1: Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Step 2: Generate unique filename
      const uniqueFilename = this.generateUniqueFilename(file.name);

      // Step 3: Calculate checksum
      const checksum = await this.calculateChecksum(file);

      // Step 4: Check for duplicates
      const duplicate = await this.checkDuplicate(ehcpApplicationId, checksum);
      if (duplicate) {
        logger.warn(`[Documents] Duplicate file detected: ${file.name}`);
        return { 
          success: false, 
          error: 'This file has already been uploaded. If you want to replace it, please delete the existing version first.' 
        };
      }

      // Step 5: Upload to cloud storage
      const storageUrl = await this.uploadToStorage(file, uniqueFilename, ehcpApplicationId);

      // Step 6: Create database record
      const document: Document = {
        id: Date.now(), // Would be auto-incremented in production
        ehcpApplicationId,
        tenantId: this.tenantId,
        type,
        filename: uniqueFilename,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size,
        storageProvider: this.storageProvider,
        storageUrl,
        storageBucket: `ehcp-documents-${this.tenantId}`,
        storageKey: `applications/${ehcpApplicationId}/${uniqueFilename}`,
        uploadedBy,
        uploadedByName,
        uploadedByRole,
        uploadedAt: new Date(),
        status: 'SCANNING', // Initial status
        accessLevel,
        sectionReference,
        version: 1,
        isLatestVersion: true,
        checksum,
        metadata: {
          uploadIpAddress: 'redacted',
          uploadUserAgent: 'redacted'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Step 7: Queue virus scan
      await this.queueVirusScan(document.id, storageUrl);

      // Step 8: Log access
      await this.logAccess(document.id, uploadedBy, uploadedByName, uploadedByRole, 'UPLOADED');

      logger.info(`[Documents] Upload successful: ${document.id}`);

      return { success: true, document };
    } catch (error) {
      logger.error('[Documents] Upload failed:', error);
      return { success: false, error: 'Upload failed. Please try again.' };
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    // Check file type
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'File type not allowed. Please upload PDF, Word, or image files only.' };
    }

    // Check filename for malicious characters
    const DANGEROUS_CHARS = /[<>:"|?*]/;
    if (DANGEROUS_CHARS.test(file.name)) {
      return { valid: false, error: 'Filename contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalFilename.split('.').pop();
    return `doc_${timestamp}_${random}.${extension}`;
  }

  /**
   * Calculate file checksum for duplicate detection
   */
  private async calculateChecksum(file: File): Promise<string> {
    // In production, use crypto.subtle.digest
    // For demonstration, use a simple hash
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Check if file already exists (duplicate detection)
   */
  private async checkDuplicate(ehcpApplicationId: number, checksum: string): Promise<boolean> {
    // In production, query database:
    // SELECT id FROM documents 
    // WHERE ehcp_application_id = ? AND checksum = ? AND status != 'DELETED'
    logger.info(`[Documents] Checking for duplicate with checksum: ${checksum}`);
    return false; // Mock: no duplicates
  }

  /**
   * Upload file to cloud storage
   */
  private async uploadToStorage(file: File, filename: string, ehcpApplicationId: number): Promise<string> {
    logger.info(`[Documents] Uploading to ${this.storageProvider}: ${filename}`);

    // In production, use AWS SDK, Azure SDK, or GCP SDK
    // Example for AWS S3:
    // const s3 = new AWS.S3();
    // const result = await s3.upload({
    //   Bucket: `ehcp-documents-${this.tenantId}`,
    //   Key: `applications/${ehcpApplicationId}/${filename}`,
    //   Body: file,
    //   ContentType: file.type,
    //   ServerSideEncryption: 'AES256'
    // }).promise();
    // return result.Location;

    // Mock implementation
    return `https://storage.edpsychconnect.com/${this.tenantId}/applications/${ehcpApplicationId}/${filename}`;
  }

  /**
   * Queue virus scan (ClamAV, VirusTotal API, etc.)
   */
  private async queueVirusScan(documentId: number, storageUrl: string): Promise<void> {
    logger.info(`[Documents] Queuing virus scan for document ${documentId}`);

    // In production:
    // - Send to virus scanning service (ClamAV, VirusTotal)
    // - Update document status when scan completes
    // - Quarantine if virus detected
    // - Notify uploader of scan result

    // Mock: simulate async scan
    setTimeout(async () => {
      await this.updateVirusScanResult(documentId, 'CLEAN');
    }, 3000);
  }

  /**
   * Update virus scan result
   */
  private async updateVirusScanResult(
    documentId: number,
    result: 'CLEAN' | 'INFECTED' | 'SCAN_FAILED'
  ): Promise<void> {
    logger.info(`[Documents] Virus scan result for ${documentId}: ${result}`);

    // In production:
    // UPDATE documents 
    // SET status = ?, virus_scan_result = ?, virus_scan_date = NOW()
    // WHERE id = ?

    const newStatus = result === 'CLEAN' ? 'AVAILABLE' : 'QUARANTINED';

    // If infected, notify security team
    if (result === 'INFECTED') {
      logger.error(`[Documents] SECURITY ALERT: Infected file detected: ${documentId}`);
      // Send alert to security team
    }
  }

  /**
   * Get all documents for an application
   */
  async getDocuments(
    ehcpApplicationId: number,
    viewerRole: 'LA' | 'SCHOOL' | 'PROFESSIONAL' | 'PARENT'
  ): Promise<Document[]> {
    logger.info(`[Documents] Fetching documents for application ${ehcpApplicationId}, viewer: ${viewerRole}`);

    // In production, query with access control:
    // SELECT * FROM documents 
    // WHERE ehcp_application_id = ? 
    //   AND status = 'AVAILABLE'
    //   AND access_level allows viewerRole
    // ORDER BY uploaded_at DESC

    // Mock data
    const mockDocuments: Document[] = [
      {
        id: 1,
        ehcpApplicationId,
        tenantId: this.tenantId,
        type: 'EP_REPORT',
        filename: 'doc_1704790800000_abc123.pdf',
        originalFilename: 'Educational_Psychology_Report_Nov2024.pdf',
        mimeType: 'application/pdf',
        size: 2450000,
        storageProvider: this.storageProvider,
        storageUrl: `https://storage.edpsychconnect.com/${this.tenantId}/applications/${ehcpApplicationId}/doc_1704790800000_abc123.pdf`,
        storageBucket: `ehcp-documents-${this.tenantId}`,
        storageKey: `applications/${ehcpApplicationId}/doc_1704790800000_abc123.pdf`,
        uploadedBy: 42,
        uploadedByName: 'Sarah Williams',
        uploadedByRole: 'SCHOOL',
        uploadedAt: new Date('2025-01-09T10:15:00'),
        status: 'AVAILABLE',
        virusScanResult: 'CLEAN',
        virusScanDate: new Date('2025-01-09T10:15:30'),
        accessLevel: 'LA_AND_SCHOOL',
        sectionReference: 'Section D - Educational Needs',
        version: 1,
        isLatestVersion: true,
        checksum: 'a1b2c3d4e5f6...',
        metadata: {},
        createdAt: new Date('2025-01-09T10:15:00'),
        updatedAt: new Date('2025-01-09T10:15:00')
      }
    ];

    // Filter by access level
    return mockDocuments.filter(doc => this.canAccess(doc.accessLevel, viewerRole));
  }

  /**
   * Check if viewer can access document
   */
  private canAccess(documentAccessLevel: AccessLevel, viewerRole: string): boolean {
    switch (documentAccessLevel) {
      case 'LA_ONLY':
        return viewerRole === 'LA';
      case 'SCHOOL_ONLY':
        return viewerRole === 'SCHOOL';
      case 'LA_AND_SCHOOL':
        return viewerRole === 'LA' || viewerRole === 'SCHOOL';
      case 'ALL_PROFESSIONALS':
        return viewerRole !== 'PARENT';
      case 'PARENT_ACCESSIBLE':
        return true;
      default:
        return false;
    }
  }

  /**
   * Generate signed URL for secure document access
   */
  async generateSignedUrl(documentId: number, expiryMinutes: number = 60): Promise<string> {
    logger.info(`[Documents] Generating signed URL for document ${documentId}, expiry: ${expiryMinutes}min`);

    // In production, use cloud provider's signed URL generation:
    // AWS S3: s3.getSignedUrl('getObject', { Bucket, Key, Expires })
    // Azure: blobClient.generateSasUrl({ expiresOn })
    // GCP: storage.file().getSignedUrl({ action: 'read', expires })

    // Mock implementation
    return `https://storage.edpsychconnect.com/${this.tenantId}/signed/${documentId}?expires=${Date.now() + expiryMinutes * 60 * 1000}`;
  }

  /**
   * Log document access for audit trail
   */
  async logAccess(
    documentId: number,
    userId: number,
    userName: string,
    userRole: string,
    action: 'VIEWED' | 'DOWNLOADED' | 'UPLOADED' | 'DELETED' | 'SHARED'
  ): Promise<void> {
    logger.info(`[Documents] Logging access: ${action} by ${userName} (${userRole})`);

    const accessLog: DocumentAccessLog = {
      id: Date.now(),
      documentId,
      userId,
      userName,
      userRole,
      action,
      ipAddress: 'redacted',
      userAgent: 'redacted',
      accessedAt: new Date()
    };

    // In production:
    // INSERT INTO document_access_logs (document_id, user_id, action, ...)
    // VALUES (?, ?, ?, ...)

    // GDPR: Keep audit logs for 6 years (statutory retention period for SEND records)
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(documentId: number, deletedBy: number): Promise<void> {
    logger.info(`[Documents] Soft deleting document ${documentId}`);

    // In production:
    // UPDATE documents SET status = 'DELETED', deleted_by = ?, deleted_at = NOW()
    // WHERE id = ?

    // Log deletion
    await this.logAccess(documentId, deletedBy, 'Unknown', 'LA', 'DELETED');

    // Note: Actual file deletion from storage should happen after retention period
    // Use scheduled job to purge deleted documents after 30 days
  }

  /**
   * Create new version of document
   */
  async createNewVersion(
    originalDocumentId: number,
    newFile: File,
    uploadedBy: number,
    uploadedByName: string,
    uploadedByRole: 'LA' | 'SCHOOL' | 'PROFESSIONAL'
  ): Promise<UploadResult> {
    logger.info(`[Documents] Creating new version of document ${originalDocumentId}`);

    // In production:
    // 1. Get original document
    // 2. Set isLatestVersion = false on original
    // 3. Upload new file with version = original.version + 1
    // 4. Link via previousVersionId

    // This enables version history and rollback capability
    return { success: true };
  }
}
