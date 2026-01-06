'use server';

import { gdprCompliance, ConsentRecord, ConsentType, DataSubjectRequest, PrivacyPolicy } from '@/lib/gdpr-compliance';

export async function getConsentTypes(): Promise<ConsentType[]> {
  return gdprCompliance.getConsentTypes();
}

export async function getUserConsents(id: string): Promise<ConsentRecord[]> {
  return gdprCompliance.getUserConsents(id);
}

export async function grantConsent(
  id: string,
  consentTypeId: string,
  consented: boolean,
  consentText: string
): Promise<ConsentRecord> {
  return gdprCompliance.grantConsent(id, consentTypeId, consented, consentText);
}

export async function withdrawConsent(
  id: string,
  consentTypeId: string,
  reason?: string
): Promise<void> {
  return gdprCompliance.withdrawConsent(id, consentTypeId, reason);
}

export async function getCurrentPrivacyPolicy(): Promise<PrivacyPolicy | null> {
  return gdprCompliance.getCurrentPrivacyPolicy();
}

export async function checkReconsentRequired(id: string): Promise<boolean> {
  return gdprCompliance.checkReconsentRequired(id);
}

export async function exportUserData(id: string): Promise<any> {
  return gdprCompliance.exportUserData(id);
}

export async function submitDataSubjectRequest(
    id: string,
    requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal',
    requestDetails: any
): Promise<DataSubjectRequest> {
    return gdprCompliance.submitDataSubjectRequest(id, requestType, requestDetails);
}
