'use server';

import { ProfessionalRecommendationService } from '@/services/professional-recommendation-service';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';

export async function submitRecommendation(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    throw new Error('Unauthorized: You must be logged in to submit a review');
  }

  let userId: number;

  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('Server limit');
    
    // Validate token
    const payload = jwt.verify(token.value, secret) as any;
    userId = parseInt(payload.id);

  } catch (error) {
    throw new Error('Unauthorized');
  }

  const receiver_id = parseInt(formData.get('receiver_id') as string);
  const relationship = formData.get('relationship') as string;
  const comment = formData.get('comment') as string;

  if (!receiver_id || !comment) {
    throw new Error('Missing required fields');
  }

  if (userId === receiver_id) {
    throw new Error('You cannot review yourself');
  }

  await ProfessionalRecommendationService.createRecommendation({
    author_id: userId,
    receiver_id,
    relationship,
    comment
  });

  // Revalidate the profile page to show the new review
  revalidatePath(`/professional/${receiver_id}`);
  
  return { success: true };
}

export async function getRecommendations(professionalId: number) {
  return await ProfessionalRecommendationService.getRecommendationsForProfessional(professionalId);
}
