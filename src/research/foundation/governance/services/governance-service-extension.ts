/**
 * Governance Service Extensions for Data Sharing
 *
 * This file extends the GovernanceService with methods specifically for
 * the cross-institutional data sharing platform.
 */

import { GovernanceService } from './governance-service';

/**
 * Extensions to the GovernanceService for handling institution-related operations
 */
declare module './governance-service' {
  interface GovernanceService {
    // Organization operations
    registerOrganization(params: {
      id: string;
      name: string;
      type: string;
      registrationNumber?: string;
      country: string;
    }): Promise<void>;
    
    updateOrganizationStatus(
      organizationId: string, 
      status: 'verified' | 'rejected' | 'active' | 'inactive' | 'suspended',
      details?: Record<string, any>
    ): Promise<void>;
    
    // Permission operations
    checkUserPermission(
      id: string,
      permission: string,
      context?: Record<string, any>
    ): Promise<boolean>;
    
    getUsersWithPermission(permission: string): Promise<string[]>;
  }
}