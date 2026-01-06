import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export class RealInstitutionService {
  /**
   * Create a new institution
   */
  async createInstitution(data: any) {
    try {
      logger.info('Creating institution (real)', { name: data.name });
      
      const institution = await prisma.institution.create({
        data: {
          name: data.name,
          type: data.type || 'Organization',
          size: data.size || 'Medium',
          address: data.country || data.address, // Map country to address if address missing
          email: data.email || `contact@${data.name.toLowerCase().replace(/\s+/g, '-')}.com`, // Required field
        }
      });
      
      // Create departments if provided
      if (data.departments && Array.isArray(data.departments)) {
        for (const dept of data.departments) {
          await prisma.department.create({
            data: {
              institutionId: institution.id,
              name: dept.name,
              type: 'Academic', // Default type
              createdBy: 'System' // Required field
            }
          });
        }
      }

      // Create contacts if provided
      if (data.contacts && Array.isArray(data.contacts)) {
        for (const contact of data.contacts) {
          await prisma.institutionContact.create({
            data: {
              institutionId: institution.id,
              firstName: contact.name.split(' ')[0],
              lastName: contact.name.split(' ').slice(1).join(' ') || '',
              email: contact.email
            }
          });
        }
      }
      
      return this.getInstitution(institution.id);
    } catch (error: any) {
      logger.error('Failed to create institution', error);
      throw new Error(`Failed to create institution: ${error.message}`);
    }
  }

  /**
   * Get institution by ID
   */
  async getInstitution(id: string) {
    try {
      const institution = await prisma.institution.findUnique({
        where: { id },
        include: {
          departments: true,
          contacts: true,
          subscriptions: true
        }
      });
      
      if (!institution) return null;

      // Map to match the mock structure expected by frontend
      return {
        ...institution,
        country: institution.address, // Map address back to country
        activeUsers: 0, // Placeholder
      };
    } catch (error: any) {
      logger.error('Failed to get institution', error);
      throw error;
    }
  }

  /**
   * List all institutions
   */
  async listInstitutions() {
    try {
      const institutions = await prisma.institution.findMany({
        include: {
          departments: true,
          contacts: true,
          subscriptions: true
        }
      });
      
      return institutions.map(inst => ({
        ...inst,
        country: inst.address,
        activeUsers: 0
      }));
    } catch (error: any) {
      logger.error('Failed to list institutions', error);
      throw error;
    }
  }

  async getInstitutionsCount() {
    try {
      return await prisma.institution.count();
    } catch (error) {
      logger.error('Failed to count institutions', error);
      return 0;
    }
  }

  async getActiveUsersCount() {
    try {
      // Count users who are members of any institution (via DepartmentMember or InstitutionAdmin)
      // For simplicity, let's count all users for now as a proxy
      // Model name is 'users' in schema
      return await prisma.users.count();
    } catch (error) {
      logger.error('Failed to count active users', error);
      return 0;
    }
  }
}

export const institutionService = new RealInstitutionService();
