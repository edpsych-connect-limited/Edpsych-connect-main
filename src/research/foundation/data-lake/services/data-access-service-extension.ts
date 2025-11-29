/**
 * Data Access Service Extensions for Data Sharing
 * 
 * This file extends the DataAccessService with methods specifically for
 * the cross-institutional data sharing platform.
 */

import { Institution } from '../../data-sharing/models/institution';
import { SharedDataset, DataSharingAgreement, DataSharingRequest, DataAccessGrant } from '../../data-sharing/models/data-sharing';

/**
 * Extensions to the DataAccessService for handling institution-related operations
 */
declare module './data-access-service' {
  interface DataAccessService {
    // Institution operations
    getInstitutionById(id: string): Promise<Institution | null>;
    getInstitutionByName(name: string): Promise<Institution | null>;
    saveInstitution(institution: Institution): Promise<void>;
    updateInstitution(institution: Institution): Promise<void>;
    searchInstitutions(params: {
      name?: string;
      type?: string;
      country?: string;
      verificationStatus?: string;
      hasEthicsCommittee?: boolean;
      hasDataProtectionOfficer?: boolean;
      complianceFramework?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<{
      institutions: Institution[];
      total: number;
    }>;
    
    // Dataset operations
    getDatasetById(datasetId: string): Promise<SharedDataset | null>;
    saveDataset(dataset: SharedDataset): Promise<void>;
    updateDataset(dataset: SharedDataset): Promise<void>;
    searchDatasets(params: {
      name?: string;
      ownerId?: string;
      type?: string;
      accessLevel?: string;
      containsSensitiveData?: boolean;
      tags?: string[];
      limit?: number;
      offset?: number;
    }): Promise<{
      datasets: SharedDataset[];
      total: number;
    }>;
    
    // Agreement operations
    getAgreementById(agreementId: string): Promise<DataSharingAgreement | null>;
    saveAgreement(agreement: DataSharingAgreement): Promise<void>;
    updateAgreement(agreement: DataSharingAgreement): Promise<void>;
    searchAgreements(params: {
      providerInstitutionId?: string;
      recipientInstitutionId?: string;
      status?: string;
      datasetId?: string;
      limit?: number;
      offset?: number;
    }): Promise<{
      agreements: DataSharingAgreement[];
      total: number;
    }>;
    
    // Request operations
    getRequestById(requestId: string): Promise<DataSharingRequest | null>;
    saveRequest(request: DataSharingRequest): Promise<void>;
    updateRequest(request: DataSharingRequest): Promise<void>;
    searchRequests(params: {
      requestingInstitutionId?: string;
      dataProviderInstitutionId?: string;
      status?: string;
      datasetId?: string;
      limit?: number;
      offset?: number;
    }): Promise<{
      requests: DataSharingRequest[];
      total: number;
    }>;
    
    // Access grant operations
    getAccessGrantById(grantId: string): Promise<DataAccessGrant | null>;
    saveAccessGrant(grant: DataAccessGrant): Promise<void>;
    updateAccessGrant(grant: DataAccessGrant): Promise<void>;
    searchAccessGrants(params: {
      accessGrantId?: string;
      institutionId?: string;
      datasetId?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<{
      grants: DataAccessGrant[];
      total: number;
    }>;
  }
}