'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email/email-service';
import { logger } from '@/lib/logger';

const inquirySchema = z.object({
  professionalId: z.coerce.number().int(),
  senderName: z.string().min(2, "Name must be at least 2 characters"),
  senderEmail: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InquiryState = {
  success?: boolean;
  errors?: {
    [key: string]: string[];
  };
  message?: string;
};

export async function submitInquiry(prevState: InquiryState | null, formData: FormData): Promise<InquiryState> {
  // Extract data
  const rawData = {
    professionalId: formData.get('professionalId'),
    senderName: formData.get('senderName'),
    senderEmail: formData.get('senderEmail'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  // Validate
  const validatedFields = inquirySchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please check the form for errors.',
    };
  }

  const { professionalId, senderName, senderEmail, subject, message } = validatedFields.data;

  try {
    // 1. Verify Professional Exists
    // Note: We access the user model directly here.
    const professional = await prisma.users.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return { success: false, message: 'Professional not found.' };
    }

    // 2. Save Inquiry to Database
    await prisma.professionalInquiry.create({
      data: {
        professional_id: professionalId,
        sender_name: senderName,
        sender_email: senderEmail,
        subject: subject,
        message: message,
        status: 'PENDING',
      },
    });

    // 3. Send Email Notification
    try {
        const emailService = EmailService.getInstance();
        // In a real app, you might queue this or run it without awaiting to speed up response.
        // For now, we await to ensure it works, but catch errors.
        await emailService.sendEmail({
            to: professional.email, 
            subject: `New Inquiry: ${subject}`,
            html: `
                <h2>You have received a new inquiry on EdPsych Connect</h2>
                <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <p>${message.replace(/\n/g, '<br/>')}</p>
                <hr />
                <p>You can view and reply to this message in your dashboard.</p>
            `,
            text: `New Inquiry from ${senderName} (${senderEmail}):\n\nSubject: ${subject}\n\n${message}`
        });
    } catch (emailError) {
        logger.error('Failed to send inquiry notification email', emailError);
        // Continue, as DB record is saved
    }

    return { success: true, message: 'Your inquiry has been sent successfully!' };

  } catch (error) {
    logger.error('Failed to submit professional inquiry', error);
    return { success: false, message: 'An unexpected error occurred. Please try again later.' };
  }
}
