import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { CreateUserPreferenceInput, UpdateUserPreferenceInput } from "../../types/recommendation-engine-types";
import { prisma } from '@/lib/prisma';

/**
 * Service for managing user preferences for the recommendation engine
 * Maps to UserInterest model in Prisma
 */
export class UserPreferenceService {
  /**
   * Create a new user preference (interest)
   */
  async createPreference(data: CreateUserPreferenceInput) {
    return prisma.userInterest.create({
      data: {
        userId: parseInt(data.id), // Assuming data.id is userId
        category: data.categoryId || 'General',
        topic: data.tagId || data.contentType || 'General',
        strength_score: data.weight || 1.0,
        last_updated: new Date()
      }
    });
  }

  /**
   * Get all preferences for a user
   */
  async getUserPreferences(id: string) {
    const interests = await prisma.userInterest.findMany({
      where: { userId: parseInt(id) }
    });
    
    // Map back to preference structure
    return interests.map(interest => ({
      id: interest.id,
      userId: interest.userId.toString(),
      categoryId: interest.category,
      tagId: interest.topic,
      weight: interest.strength_score,
      createdAt: interest.last_updated
    }));
  }

  /**
   * Get preferences by category for a user
   */
  async getUserCategoryPreferences(id: string, categoryId: string) {
    const interests = await prisma.userInterest.findMany({
      where: { 
        userId: parseInt(id),
        category: categoryId
      }
    });
    
    return interests.map(interest => ({
      id: interest.id,
      userId: interest.userId.toString(),
      categoryId: interest.category,
      tagId: interest.topic,
      weight: interest.strength_score,
      createdAt: interest.last_updated
    }));
  }

  /**
   * Get preferences by tag for a user
   */
  async getUserTagPreferences(id: string, tagId: string) {
    const interests = await prisma.userInterest.findMany({
      where: { 
        userId: parseInt(id),
        topic: tagId
      }
    });
    
    return interests.map(interest => ({
      id: interest.id,
      userId: interest.userId.toString(),
      categoryId: interest.category,
      tagId: interest.topic,
      weight: interest.strength_score,
      createdAt: interest.last_updated
    }));
  }

  /**
   * Get preferences by content type for a user
   * Note: Content type is not directly supported in UserInterest, checking category or topic
   */
  async getUserContentTypePreferences(id: string, contentType: string) {
    const interests = await prisma.userInterest.findMany({
      where: { 
        userId: parseInt(id),
        OR: [
          { category: contentType },
          { topic: contentType }
        ]
      }
    });
    
    return interests.map(interest => ({
      id: interest.id,
      userId: interest.userId.toString(),
      categoryId: interest.category,
      tagId: interest.topic,
      weight: interest.strength_score,
      createdAt: interest.last_updated
    }));
  }

  /**
   * Update a user preference
   */
  async updatePreference(id: string, data: UpdateUserPreferenceInput) {
    return prisma.userInterest.update({
      where: { id },
      data: {
        category: data.categoryId,
        topic: data.tagId || data.contentType,
        strength_score: data.weight,
        last_updated: new Date()
      }
    });
  }

  /**
   * Delete a user preference
   */
  async deletePreference(id: string) {
    return prisma.userInterest.delete({
      where: { id }
    });
  }

  /**
   * Get user preference analytics
   */
  async getUserPreferenceAnalytics(id: string) {
    const interests = await prisma.userInterest.findMany({
      where: { userId: parseInt(id) }
    });
    
    return {
      categoryPreferences: interests.map(i => ({ category: i.category, score: i.strength_score })),
      typePreferences: [], // Not explicitly tracked
      total: interests.length,
    };
  }

  /**
   * Bulk update user preferences
   */
  async bulkUpdatePreferences(preferences: UpdateUserPreferenceInput[]) {
    const results = [];
    for (const pref of preferences) {
      if (pref.id) {
        results.push(await this.updatePreference(pref.id, pref));
      }
    }
    return results;
  }

  /**
   * Increment preference weight
   */
  async incrementPreferenceWeight(id: string, incrementBy: number = 0.1) {
    const interest = await prisma.userInterest.findUnique({
      where: { id }
    });
    
    if (!interest) return null;
    
    return prisma.userInterest.update({
      where: { id },
      data: {
        strength_score: interest.strength_score + incrementBy,
        last_updated: new Date()
      }
    });
  }
}

const userPreferenceService = new UserPreferenceService();
export default userPreferenceService;