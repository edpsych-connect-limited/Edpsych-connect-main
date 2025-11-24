import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger';
import crypto from 'crypto';

/**
 * Service for managing beta access codes and validation
 */
export class BetaAccessService {
  private static prisma: PrismaClient;

  /**
   * Initialize the service with Prisma client
   */
  public static init(prismaClient: PrismaClient): void {
    this.prisma = prismaClient;
  }

  /**
   * Generate a new beta access code
   * 
   * @param options Configuration options for code generation
   * @returns The generated access code
   */
  public static async generateAccessCode(options: {
    expiresAt?: Date;
    maxUses?: number;
    role?: string;
    features?: string[];
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      // Generate a random code (12 alphanumeric characters)
      const code = crypto.randomBytes(6).toString('hex').toUpperCase();
      
      // Store the code in the database
      await this.prisma.betaAccessCode.create({
        data: {
          id: crypto.randomUUID(),
          code,
          expiresAt: options.expiresAt,
          maxUses: options.maxUses || 1,
          currentUses: 0,
          role: options.role || 'BETA_TESTER',
          features: options.features || [],
          metadata: options.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return code;
    } catch (error) {
      logger.error('Error generating beta access code');
      throw new Error(`Failed to generate beta access code: ${String(error)}`);
    }
  }

  /**
   * Validate a beta access code
   * 
   * @param code The access code to validate
   * @returns Validation result including code details if valid
   */
  public static async validateAccessCode(code: string): Promise<{
    valid: boolean;
    code?: {
      id: string;
      code: string;
      expiresAt?: Date;
      remainingUses: number;
      role: string;
      features: string[];
      metadata: Record<string, any>;
    };
    error?: string;
  }> {
    try {
      if (!code) {
        return { valid: false, error: 'No access code provided' };
      }
      
      // Find the code in the database
      const accessCode = await this.prisma.betaAccessCode.findUnique({
        where: { code: code.toUpperCase() }
      });
      
      if (!accessCode) {
        return { valid: false, error: 'Invalid access code' };
      }
      
      // Check if the code has expired
      if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
        return { valid: false, error: 'Access code has expired' };
      }
      
      // Check if the code has any uses remaining
      const remainingUses = accessCode.maxUses - accessCode.currentUses;
      if (remainingUses <= 0) {
        return { valid: false, error: 'Access code has no remaining uses' };
      }
      
      return {
        valid: true,
        code: {
          id: accessCode.id,
          code: accessCode.code,
          expiresAt: accessCode.expiresAt ?? undefined, // Convert null to undefined to match type
          remainingUses: remainingUses,
          role: accessCode.role ?? 'BETA_TESTER', // Default role if null
          features: accessCode.features,
          metadata: accessCode.metadata as Record<string, any>
        }
      };
    } catch (error) {
      logger.error('Error validating beta access code', {
        code,
        error: error instanceof Error ? error.message : String(error)
      });
      return { valid: false, error: `Failed to validate access code: ${String(error)}` };
    }
  }

  /**
   * Redeem a beta access code (decrements remaining uses)
   * 
   * @param code The access code to use
   * @returns Success status and updated code details
   */
  public static async redeemAccessCode(code: string): Promise<{
    success: boolean;
    code?: {
      id: string;
      remainingUses: number;
    };
    error?: string;
  }> {
    try {
      // Validate the code first
      const validation = await this.validateAccessCode(code);
      
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // Update the code to increment used count
      const updatedCode = await this.prisma.betaAccessCode.update({
        where: { code: code.toUpperCase() },
        data: {
          currentUses: {
            increment: 1
          },
          updatedAt: new Date()
        }
      });
      
      return {
        success: true,
        code: {
          id: updatedCode.id,
          remainingUses: updatedCode.maxUses - updatedCode.currentUses
        }
      };
    } catch (error) {
      logger.error('Error using beta access code', {
        code,
        error: error instanceof Error ? error.message : String(error)
      });
      return { success: false, error: `Failed to use access code: ${String(error)}` };
    }
  }

  /**
   * Record usage of an access code by a user
   *
   * @param code The access code that was used
   * @param id The ID of the user who used the code
   * @returns Success status
   */
  public static async recordAccessCodeUsage(
    code: string,
    id: string
  ): Promise<{success: boolean}> {
    try {
      // First use the access code (decrements remaining uses)
      const useResult = await this.redeemAccessCode(code);
      
      if (!useResult.success || !useResult.code) {
        throw new Error(useResult.error || 'Failed to use access code');
      }
      
      // Record the usage with user ID for tracking
      await this.prisma.betaAccessCodeUsage.create({
        data: {
          id: crypto.randomUUID(),
          accessCodeId: useResult.code.id,
          user_id_int: parseInt(id), // Parse string ID to Int
          userId: id,
          usedAt: new Date()
        }
      });
      
      logger.info(`Access code usage recorded`, {
        code,
        id,
        accessCodeId: useResult.code.id
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error recording access code usage', {
        code,
        id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to record access code usage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all active beta access codes
   *
   * @returns List of active beta access codes
   */
  public static async getActiveAccessCodes(): Promise<any[]> {
    try {
      const now = new Date();
      
      // Find all active codes (not expired and have remaining uses)
      // Note: Prisma doesn't support field comparison in where clause directly for maxUses > currentUses
      // So we fetch active/non-expired codes and filter in memory
      const potentialCodes = await this.prisma.betaAccessCode.findMany({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      });
      
      const activeCodes = potentialCodes.filter(code => code.maxUses > code.currentUses);
      
      return activeCodes;
    } catch (error) {
      logger.error('Error fetching active beta access codes', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to fetch active beta access codes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Validate a beta access code
 * 
 * @param code The access code to validate
 * @returns Validation result
 */
export async function validateBetaAccessCode(code: string): Promise<{
  valid: boolean;
  code?: any;
  error?: string;
}> {
  return BetaAccessService.validateAccessCode(code);
}

/**
 * Use a beta access code (decrements remaining uses)
 *
 * @param code The access code to use
 * @returns Success status
 */
export function redeemBetaAccessCode(code: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return BetaAccessService.redeemAccessCode(code);
}