/**
 * FHIR Service Configuration Models
 * 
 * This file defines configuration interfaces for the FHIR integration service.
 */

/**
 * Authentication type for FHIR servers
 */
export type FHIRAuthType = 'none' | 'basic' | 'bearer' | 'oauth2';

/**
 * Configuration for the FHIR service
 */
export interface FHIRServiceConfig {
  /**
   * URL of the FHIR server
   */
  serverUrl: string;
  
  /**
   * Type of authentication to use
   */
  authType: FHIRAuthType;
  
  /**
   * Username for basic auth
   */
  username?: string;
  
  /**
   * Password for basic auth
   */
  password?: string;
  
  /**
   * Bearer token for token auth
   */
  token?: string;
  
  /**
   * Client ID for OAuth2
   */
  clientId?: string;
  
  /**
   * Client secret for OAuth2
   */
  clientSecret?: string;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Whether NHS Digital integration is enabled
   */
  nhsDigitalEnabled?: boolean;
  
  /**
   * NHS Digital API key (if required)
   */
  nhsDigitalApiKey?: string;
  
  /**
   * Whether to use secure connections
   */
  secure?: boolean;
  
  /**
   * Additional headers to send with requests
   */
  headers?: Record<string, string>;
  
  /**
   * Whether to validate resources before sending
   */
  validateResources?: boolean;
}