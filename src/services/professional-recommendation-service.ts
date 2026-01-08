import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';

export type CreateRecommendationDTO = {
  receiver_id: number;
  author_id: number;
  relationship: string;
  comment: string;
};

export class ProfessionalRecommendationService {
  /**
   * Create a new recommendation
   */
  static async createRecommendation(data: CreateRecommendationDTO) {
    return await prisma.professionalRecommendation.create({
      data: {
        receiver_id: data.receiver_id,
        author_id: data.author_id,
        relationship: data.relationship,
        comment: data.comment,
        is_visible: true // Default to visible
      }
    });
  }

  /**
   * Get all visible recommendations for a professional
   */
  static async getRecommendationsForProfessional(professionalId: number) {
    return await prisma.professionalRecommendation.findMany({
      where: {
        receiver_id: professionalId,
        is_visible: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            // Assuming users table doesn't have avatar_url in the main table, 
            // but ProfessionalProfileService suggested user.avatar_url exists in the type data.
            // Let's check user model structure later if needed, for now name/role is key.
            // Wait, looking at server-auth user interface, it has profile: { avatar ... }.
            // But Prisma User model is what matters. 
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}
