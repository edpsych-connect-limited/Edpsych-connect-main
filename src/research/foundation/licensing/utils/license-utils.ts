/**
 * License Utilities
 * 
 * This module provides utility functions for license management, including
 * license key generation, validation, and formatting.
 */

import * as crypto from 'crypto';

/**
 * Generate a license key with the specified format
 * 
 * @param id Organization ID
 * @param licenseId License ID
 * @returns A formatted license key
 */
export function generateLicenseKey(id: string, licenseId: string): string {
  // Create a hash of the license ID and organization ID
  const hash = crypto.createHash('sha256')
    .update(`${id}:${licenseId}:${Date.now()}`)
    .digest('hex');
  
  // Format the license key: PREFIX-LICID-HASH-SUFFIX
  const prefix = id.substring(0, 6);
  const licenseIdPart = licenseId.substring(0, 8);
  const hashPart = hash.substring(0, 16);
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return `EDU-${prefix}-${licenseIdPart}-${hashPart}-${suffix}`;
}

/**
 * Validate a license key format
 * 
 * @param licenseKey The license key to validate
 * @returns True if the license key format is valid, false otherwise
 */
export function validateLicenseKeyFormat(licenseKey: string): boolean {
  // Check if the license key matches the expected format
  const regex = /^EDU-[A-Za-z0-9]{6}-[A-Za-z0-9]{8}-[A-Za-z0-9]{16}-\d{6}$/;
  return regex.test(licenseKey);
}

/**
 * Extract organization ID prefix from a license key
 * 
 * @param licenseKey The license key
 * @returns The organization ID prefix, or null if invalid
 */
export function extractOrgPrefix(licenseKey: string): string | null {
  if (!validateLicenseKeyFormat(licenseKey)) {
    return null;
  }
  
  // Extract the organization prefix (second part after splitting by '-')
  const parts = licenseKey.split('-');
  return parts[1];
}

/**
 * Extract license ID part from a license key
 * 
 * @param licenseKey The license key
 * @returns The license ID part, or null if invalid
 */
export function extractLicenseIdPart(licenseKey: string): string | null {
  if (!validateLicenseKeyFormat(licenseKey)) {
    return null;
  }
  
  // Extract the license ID part (third part after splitting by '-')
  const parts = licenseKey.split('-');
  return parts[2];
}

/**
 * Format expiration date for license display
 * 
 * @param expirationDate The expiration date
 * @returns Formatted expiration date string
 */
export function formatExpirationDate(expirationDate: Date): string {
  return expirationDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calculate days until license expiration
 * 
 * @param expirationDate The expiration date
 * @returns Number of days until expiration (negative if expired)
 */
export function daysUntilExpiration(expirationDate: Date): number {
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a license is about to expire
 * 
 * @param expirationDate The expiration date
 * @param warningDays Days before expiration to start warning (default: 30)
 * @returns True if the license is about to expire, false otherwise
 */
export function isLicenseAboutToExpire(
  expirationDate: Date,
  warningDays: number = 30
): boolean {
  const daysLeft = daysUntilExpiration(expirationDate);
  return daysLeft >= 0 && daysLeft <= warningDays;
}

/**
 * Check if a license has expired
 * 
 * @param expirationDate The expiration date
 * @returns True if the license has expired, false otherwise
 */
export function isLicenseExpired(expirationDate: Date): boolean {
  return daysUntilExpiration(expirationDate) < 0;
}

/**
 * Generate a printable license certificate
 * 
 * @param license The license object
 * @returns HTML string for a printable license certificate
 */
export function generateLicenseCertificate(license: any): string {
  // In a real implementation, this would generate HTML for a printable certificate
  return `
    <div class="license-certificate">
      <h1>EdPsych Connect Platform License</h1>
      <h2>${license.definition.metadata.name}</h2>
      <p>License ID: ${license.id}</p>
      <p>Organization: ${license.organizationId}</p>
      <p>Issued: ${license.issuedAt.toLocaleDateString()}</p>
      <p>Expires: ${license.expiresAt.toLocaleDateString()}</p>
      <p>License Key: ${license.licenseKey}</p>
    </div>
  `;
}