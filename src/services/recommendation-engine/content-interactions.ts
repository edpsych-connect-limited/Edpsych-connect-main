import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import {
  CreateContentInteractionInput,
  UpdateContentInteractionInput,
  InteractionType,
  ContentPopularityStats
} from "../../types/recommendation-engine-types";
import { prisma } from '@/lib/prisma';

/**
 * Service for tracking and managing content interactions
 */
export class ContentInteractionService {
  /**
   * Record a new content interaction
   */
  async createInteraction(data: CreateContentInteractionInput) {
    return prisma.contentInteraction.create({
      data: {
        userId: parseInt(data.id), // Assuming data.id is userId
        contentId: data.contentId,
        interactionType: data.interactionType,
        durationSeconds: data.durationSeconds,
        completionPercentage: data.completionPercentage,
        rating: data.rating,
        bookmarked: data.bookmarked || false
      }
    });
  }

  /**
   * Get interactions by user
   */
  async getUserInteractions(id: string) {
    return prisma.contentInteraction.findMany({
      where: { userId: parseInt(id) },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get interactions for a specific content item
   */
  async getContentInteractions(contentId: string) {
    return prisma.contentInteraction.findMany({
      where: { contentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get interactions by type for a user
   */
  async getUserInteractionsByType(id: string, interactionType: InteractionType) {
    const interactions = await prisma.contentInteraction.findMany({
      where: { 
        userId: parseInt(id),
        interactionType 
      },
      include: {
        content: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return interactions.map(i => ({
      ...i,
      contentTitle: i.content.title,
      contentType: i.content.content_type
    }));
  }

  /**
   * Get interactions by type for a content item
   */
  async getContentInteractionsByType(contentId: string, interactionType: InteractionType) {
    const interactions = await prisma.contentInteraction.findMany({
      where: { 
        contentId,
        interactionType 
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return interactions.map(i => ({
      ...i,
      userName: i.user.name,
      userEmail: i.user.email
    }));
  }

  /**
   * Update an interaction
   */
  async updateInteraction(id: string, data: UpdateContentInteractionInput) {
    return prisma.contentInteraction.update({
      where: { id },
      data: {
        interactionType: data.interactionType,
        durationSeconds: data.durationSeconds,
        completionPercentage: data.completionPercentage,
        rating: data.rating,
        bookmarked: data.bookmarked
      }
    });
  }

  /**
   * Delete an interaction
   */
  async deleteInteraction(id: string) {
    return prisma.contentInteraction.delete({
      where: { id }
    });
  }

  /**
   * Toggle a bookmark for a content item
   */
  async toggleBookmark(id: string, contentId: string) {
    const userId = parseInt(id);
    const existingBookmark = await prisma.contentInteraction.findFirst({
      where: {
        userId,
        contentId,
        interactionType: InteractionType.BOOKMARK
      }
    });

    if (existingBookmark) {
      // Toggle off by deleting the bookmark
      return prisma.contentInteraction.delete({
        where: { id: existingBookmark.id }
      });
    } else {
      // Toggle on by creating a bookmark
      return prisma.contentInteraction.create({
        data: {
          userId,
          contentId,
          interactionType: InteractionType.BOOKMARK,
          bookmarked: true
        }
      });
    }
  }

  /**
   * Rate a content item
   */
  async rateContent(id: string, contentId: string, rating: number) {
    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const userId = parseInt(id);
    const existingRating = await prisma.contentInteraction.findFirst({
      where: {
        userId,
        contentId,
        interactionType: InteractionType.RATE
      }
    });

    if (existingRating) {
      // Update the existing rating
      return prisma.contentInteraction.update({
        where: { id: existingRating.id },
        data: { rating }
      });
    } else {
      // Create a new rating
      return prisma.contentInteraction.create({
        data: {
          userId,
          contentId,
          interactionType: InteractionType.RATE,
          rating
        }
      });
    }
  }

  /**
   * Record a content view
   */
  async recordView(id: string, contentId: string) {
    return prisma.contentInteraction.create({
      data: {
        userId: parseInt(id),
        contentId,
        interactionType: InteractionType.VIEW
      }
    });
  }

  /**
   * Record content read with duration
   */
  async recordRead(id: string, contentId: string, durationSeconds: number, completionPercentage?: number) {
    return prisma.contentInteraction.create({
      data: {
        userId: parseInt(id),
        contentId,
        interactionType: InteractionType.READ,
        durationSeconds,
        completionPercentage
      }
    });
  }

  /**
   * Record content download
   */
  async recordDownload(id: string, contentId: string) {
    return prisma.contentInteraction.create({
      data: {
        userId: parseInt(id),
        contentId,
        interactionType: InteractionType.DOWNLOAD
      }
    });
  }

  /**
   * Record content share
   */
  async recordShare(id: string, contentId: string) {
    return prisma.contentInteraction.create({
      data: {
        userId: parseInt(id),
        contentId,
        interactionType: InteractionType.SHARE
      }
    });
  }

  /**
   * Get content popularity statistics
   */
  async getContentPopularityStats(contentId: string): Promise<ContentPopularityStats> {
    const [views, downloads, bookmarks, shares, ratings, total] = await Promise.all([
      prisma.contentInteraction.count({ where: { contentId, interactionType: InteractionType.VIEW } }),
      prisma.contentInteraction.count({ where: { contentId, interactionType: InteractionType.DOWNLOAD } }),
      prisma.contentInteraction.count({ where: { contentId, interactionType: InteractionType.BOOKMARK } }),
      prisma.contentInteraction.count({ where: { contentId, interactionType: InteractionType.SHARE } }),
      prisma.contentInteraction.findMany({ 
        where: { contentId, interactionType: InteractionType.RATE, rating: { not: null } },
        select: { rating: true }
      }),
      prisma.contentInteraction.count({ where: { contentId } })
    ]);

    const totalRating = ratings.reduce((sum, record) => sum + (record.rating || 0), 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    return {
      contentId,
      viewCount: views,
      downloadCount: downloads,
      bookmarkCount: bookmarks,
      shareCount: shares,
      averageRating,
      totalInteractions: total
    };
  }

  /**
   * Get most popular content based on interaction counts
   */
  async getMostPopularContent(limit: number = 10) {
    const popularContent = await prisma.contentInteraction.groupBy({
      by: ['contentId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });
    
    const contentIds = popularContent.map(p => p.contentId);
    
    if (contentIds.length === 0) {
      return [];
    }
    
    return prisma.content.findMany({
      where: { id: { in: contentIds } }
    });
  }
}

const contentInteractionService = new ContentInteractionService();
export default contentInteractionService;