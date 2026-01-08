'use server';

import { ProfessionalInquiryService } from '@/services/professional-inquiry-service';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getProfessionalInquiries(professionalId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Server misconfiguration: missing JWT secret');
    }

    const payload = jwt.verify(token.value, secret) as any;
    
    // Verify the user accessing the inquiries is the professional themselves
    // professionalId is the userId of the professional
    if (parseInt(payload.id) !== professionalId) {
       console.error(`Access denied: User ${payload.id} attempted to access inquiries for ${professionalId}`);
       throw new Error('Forbidden: You can only view your own inquiries');
    }

  } catch (error) {
    console.error('Auth verification failed:', error);
    throw new Error('Unauthorized');
  }

  return await ProfessionalInquiryService.getInquiriesForProfessional(professionalId);
}
