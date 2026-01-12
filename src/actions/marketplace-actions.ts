'use server'

import { getSession } from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitBookingEnquiry(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const userId = parseInt(session.id);
  const professionalId = parseInt(formData.get('professionalId') as string);
  const subject = formData.get('subject') as string;
  const dateStr = formData.get('preferredDate') as string;
  const timeSlot = formData.get('preferredTime') as string;
  const message = formData.get('message') as string;

  if (!professionalId || !subject || !dateStr || !message) {
    throw new Error('Missing required fields');
  }

  // Fetch the user's tenant (School or LA context)
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { tenant_id: true }
  });

  if (!user) throw new Error('User not found');

  // Create the booking record
  const booking = await prisma.ePBooking.create({
    data: {
      professional_id: professionalId,
      school_tenant_id: user.tenant_id, // Associates booking with the requester's tenant
      booking_type: 'Consultation', // Default for open enquiries
      booking_status: 'pending',
      requested_date: new Date(dateStr),
      location_type: 'virtual', // Default for initial enquiry
      created_by_id: userId,
      messages: [
        {
          senderId: userId,
          content: message,
          timestamp: new Date().toISOString(),
          subject: subject,
          preferredTime: timeSlot
        }
      ]
    }
  });

  revalidatePath('/marketplace');
  return { success: true, bookingId: booking.id };
}
