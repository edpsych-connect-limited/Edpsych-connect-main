import { prisma } from '@/lib/prisma/client';
import { ProfessionalInquiry } from '@prisma/client';

export class ProfessionalInquiryService {
  /**
   * Retrieves all inquiries received by a specific professional
   */
  static async getInquiriesForProfessional(professionalId: number) {
    return prisma.professionalInquiry.findMany({
      where: {
        professional_id: professionalId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Retrieves a specific inquiry by ID
   */
  static async getInquiryById(inquiryId: string) {
    return prisma.professionalInquiry.findUnique({
      where: { id: inquiryId },
    });
  }

  /**
   * Marks an inquiry as read (if we add this field later)
   * currently just a placeholder for future state management
   */
  static async markAsRead(inquiryId: string) {
    // Implementation pending schema update for 'is_read' or 'status'
    return true; 
  }
}
