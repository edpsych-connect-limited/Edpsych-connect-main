'use server';

import { ProfessionalNetworkService } from '@/lib/network/professional-network.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path if needed
import { revalidatePath } from 'next/cache';

export async function sendConnectionRequest(receiverId: string, message?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const requesterId = session.user.id;

  if (requesterId === receiverId) {
    return { success: false, error: 'Cannot connect with yourself' };
  }

  try {
    const networkService = new ProfessionalNetworkService();
    await networkService.sendConnectionRequest(
      requesterId,
      receiverId,
      'PEER', // Default type
      message
    );
    
    revalidatePath(`/professional/${receiverId}`);
    return { success: true };
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
        return { success: false, error: 'Connection request already sent' };
    }
    console.error('Connection Error:', error);
    return { success: false, error: 'Failed to send connection request' };
  }
}
