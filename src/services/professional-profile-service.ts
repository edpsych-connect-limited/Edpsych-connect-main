import { prisma } from '@/lib/prisma/client';
import { 
  ProfessionalExperience, 
  ProfessionalEducation, 
  ProfessionalSkill, 
  ProfessionalRecommendation 
} from '@prisma/client';

export type ProfessionalProfileData = {
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
    email: string;
  };
  experiences: ProfessionalExperience[];
  education: ProfessionalEducation[];
  skills: (ProfessionalSkill & {
    endorsements: { endorser: { id: number, name: string, avatar_url: string | null } }[]
  })[];
  recommendations: (ProfessionalRecommendation & {
    author: { id: number, name: string, avatar_url: string | null, role: string }
  })[];
};

export class ProfessionalProfileService {
  
  /**
   * Retrieves the full professional profile for a user
   */
  static async getProfile(userId: number): Promise<ProfessionalProfileData | null> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        experiences: {
          orderBy: { start_date: 'desc' }
        },
        education: {
          orderBy: { start_date: 'desc' }
        },
        skills: {
          include: {
            endorsements: {
              include: {
                endorser: {
                  select: { id: true, name: true, avatar_url: true }
                }
              }
            }
          },
          orderBy: { endorsements: { _count: 'desc' } }
        },
        recommendations_received: {
          where: { is_visible: true },
          include: {
            author: {
              select: { id: true, name: true, avatar_url: true, role: true }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!user) return null;

    return {
      user: {
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
        email: user.email
      },
      experiences: user.experiences,
      education: user.education,
      skills: user.skills,
      recommendations: user.recommendations_received
    };
  }

  /**
   * Adds or updates an experience record
   */
  static async upsertExperience(
    userId: number, 
    data: Omit<ProfessionalExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }
  ) {
    if (data.id) {
      return prisma.professionalExperience.update({
        where: { id: data.id },
        data
      });
    }
    return prisma.professionalExperience.create({
      data: {
        ...data,
        user_id: userId
      }
    });
  }

  /**
   * Adds or updates an education record
   */
  static async upsertEducation(
    userId: number, 
    data: Omit<ProfessionalEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }
  ) {
    if (data.id) {
      return prisma.professionalEducation.update({
        where: { id: data.id },
        data
      });
    }
    return prisma.professionalEducation.create({
      data: {
        ...data,
        user_id: userId
      }
    });
  }

  /**
   * Adds a skill to the user's profile
   */
  static async addSkill(userId: number, name: string) {
    // Check if skill exists
    const existing = await prisma.professionalSkill.findUnique({
      where: {
        user_id_name: {
          user_id: userId,
          name: name
        }
      }
    });

    if (existing) return existing;

    return prisma.professionalSkill.create({
      data: {
        user_id: userId,
        name: name,
        is_verified: false // Default to unverified
      }
    });
  }

  /**
   * Endorses a skill for a user
   */
  static async endorseSkill(endorserId: number, skillId: string) {
    // Prevent self-endorsement?
    const skill = await prisma.professionalSkill.findUnique({ where: { id: skillId } });
    if (!skill || skill.user_id === endorserId) {
      throw new Error("Cannot endorse own skill or skill not found");
    }

    return prisma.skillEndorsement.upsert({
      where: {
        skill_id_endorser_id: {
          skill_id: skillId,
          endorser_id: endorserId
        }
      },
      update: {}, // Already endorsed
      create: {
        skill_id: skillId,
        endorser_id: endorserId
      }
    });
  }

  /**
   * verify a skill (Admin/System only)
   */
  static async verifySkill(skillId: string) {
    return prisma.professionalSkill.update({
      where: { id: skillId },
      data: { is_verified: true }
    });
  }

  /**
   * Searches for professional profiles
   */
  static async searchProfiles(query?: string) {
    const where: any = {};
    
    if (query && query.trim().length > 0) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { 
          experiences: {
            some: {
              OR: [
                 { title: { contains: query, mode: 'insensitive' } },
                 { company: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        },
        {
          skills: {
            some: {
              name: { contains: query, mode: 'insensitive' }
            }
          }
        }
      ];
    } else {
        // If no query, maybe filter to only those with a profile?
        // For now, return all (limited by take)
    }

    // Only return users who have at least set up some basics? 
    // Usually we want active profiles. 
    // Assuming existence of an experience or skill implies 'active' enough for beta.
    // Or just all users. Let's keep it simple.

    return prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar_url: true,
        experiences: {
          where: { is_current: true },
          take: 1,
          select: { title: true, company: true, location: true }
        },
        skills: {
          take: 5,
          orderBy: { endorsements: { _count: 'desc' } },
          select: { name: true }
        }
      },
      take: 20,
      orderBy: { created_at: 'desc' } // show newest first
    });
  }
}
