'use server';

import { gdprCompliance, ConsentRecord, ConsentType, DataSubjectRequest, PrivacyPolicy } from '@/lib/gdpr-compliance';
import { getSession } from '@/lib/auth/auth-service';

async function assertSelfOrAdmin(userId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const isSelf = session.id === userId;
  const normalizedRole = session.role?.toLowerCase?.() || '';
  const isAdmin = session.permissions?.includes('VIEW_ALL_DATA') || normalizedRole === 'admin' || normalizedRole === 'super_admin';

  if (!isSelf && !isAdmin) {
    throw new Error('Forbidden');
  }
}

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
  await assertSelfOrAdmin(id);
  return gdprCompliance.exportUserData(id);
}

export async function submitDataSubjectRequest(
    id: string,
    requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal',
    requestDetails: any
): Promise<DataSubjectRequest> {
    await assertSelfOrAdmin(id);
    return gdprCompliance.submitDataSubjectRequest(id, requestType, requestDetails);
}

export async function requestErasureAndExecute(
  id: string,
  reason?: string
): Promise<DataSubjectRequest> {
  await assertSelfOrAdmin(id);
  return gdprCompliance.requestErasureAndExecute(id, reason);
}
