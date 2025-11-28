import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { 
  CreateContentSimilarityInput, 
  UpdateContentSimilarityInput,
  SimilarityType
} from "../../types/recommendation-engine-types";
import { prisma } from '@/lib/prisma';

/**
 * Service for managing content similarity relationships
 */
export class ContentSimilarityService {
  /**
   * Create a new content similarity record
   */
  async createSimilarity(data: CreateContentSimilarityInput) {
    return prisma.contentSimilarity.create({
      data: {
        contentIdA: data.contentIdA,
        contentIdB: data.contentIdB,
        similarityScore: data.similarityScore,
        similarityType: data.similarityType
      }
    });
  }
  
  /**
   * Get similar content for a specific content item
   */
  async getSimilarContent(contentId: string) {
    const similarities = await prisma.contentSimilarity.findMany({
      where: {
        OR: [
          { contentIdA: contentId },
          { contentIdB: contentId }
        ]
      },
      include: {
        contentA: true,
        contentB: true
      },
      orderBy: {
        similarityScore: 'desc'
      }
    });

    // Map to a friendlier format
    return similarities.map(sim => {
      const isA = sim.contentIdA === contentId;
      const relatedContent = isA ? sim.contentB : sim.contentA;
      return {
        ...sim,
        relatedContentId: relatedContent.id,
        relatedContentTitle: relatedContent.title,
        relatedContentType: relatedContent.content_type
      };
    });
  }

  /**
   * Get similar content by similarity type
   */
  async getSimilarContentByType(contentId: string, similarityType: SimilarityType) {
    const similarities = await prisma.contentSimilarity.findMany({
      where: {
        AND: [
          {
            OR: [
              { contentIdA: contentId },
              { contentIdB: contentId }
            ]
          },
          { similarityType: similarityType }
        ]
      },
      include: {
        contentA: true,
        contentB: true
      },
      orderBy: {
        similarityScore: 'desc'
      }
    });

    return similarities.map(sim => {
      const isA = sim.contentIdA === contentId;
      const relatedContent = isA ? sim.contentB : sim.contentA;
      return {
        ...sim,
        relatedContentId: relatedContent.id,
        relatedContentTitle: relatedContent.title,
        relatedContentType: relatedContent.content_type
      };
    });
  }
  
  /**
   * Update a similarity record
   */
  async updateSimilarity(id: string, data: UpdateContentSimilarityInput) {
    return prisma.contentSimilarity.update({
      where: { id },
      data: {
        similarityScore: data.similarityScore,
        similarityType: data.similarityType,
        updatedAt: new Date()
      }
    });
  }
  
  /**
   * Delete a similarity record
   */
  async deleteSimilarity(id: string) {
    return prisma.contentSimilarity.delete({
      where: { id }
    });
  }
  
  /**
   * Calculate content-based similarity using TF-IDF on titles and descriptions
   * This is a simplified implementation that could be enhanced with NLP libraries
   */
  async calculateContentBasedSimilarity(contentId: string) {
    // First, get the target content
    const targetContent = await prisma.content.findUnique({
      where: { id: contentId }
    });
    
    if (!targetContent) {
      throw new Error(`Content with ID ${contentId} not found`);
    }
    
    // Get other content of the same type to compare
    const otherContentList = await prisma.content.findMany({
      where: {
        id: { not: contentId },
        content_type: targetContent.content_type
      },
      take: 100
    });
    
    const similarityRecords = [];
    
    // Simple text similarity calculation based on word overlap
    for (const otherContent of otherContentList) {
      const targetText = `${targetContent.title} ${targetContent.description || ''}`.toLowerCase();
      const otherText = `${otherContent.title} ${otherContent.description || ''}`.toLowerCase();
      
      const targetWords = targetText.split(/\W+/).filter((w: string) => w.length > 3);
      const otherWords = otherText.split(/\W+/).filter((w: string) => w.length > 3);
      
      // Calculate Jaccard similarity
      const targetSet = new Set(targetWords);
      const otherSet = new Set(otherWords);
      
      // Use Array.from instead of spread operator for better compatibility
      const intersection = new Set(Array.from(targetSet).filter((x: string) => otherSet.has(x)));
      const union = new Set();
      targetWords.forEach((word: string) => union.add(word));
      otherWords.forEach((word: string) => union.add(word));
      
      const similarityScore = union.size > 0 ? intersection.size / union.size : 0;
      
      if (similarityScore > 0.1) { // Only store if similarity is above threshold
        similarityRecords.push({
          contentIdA: targetContent.id,
          contentIdB: otherContent.id,
          similarityScore,
          similarityType: SimilarityType.CONTENT_BASED
        });
      }
    }
    
    // Store the similarity records
    for (const record of similarityRecords) {
      // Check if a record already exists
      const existingRecord = await prisma.contentSimilarity.findFirst({
        where: {
          OR: [
            { contentIdA: record.contentIdA, contentIdB: record.contentIdB },
            { contentIdA: record.contentIdB, contentIdB: record.contentIdA }
          ],
          similarityType: SimilarityType.CONTENT_BASED
        }
      });
      
      if (existingRecord) {
        // Update existing record
        await this.updateSimilarity(existingRecord.id, {
          id: existingRecord.id,
          similarityScore: record.similarityScore
        });
      } else {
        // Create new record
        await this.createSimilarity(record);
      }
    }
    
    return similarityRecords;
  }
  
  /**
   * Calculate tag-based similarity between content items
   */
  async calculateTagBasedSimilarity(contentId: string) {
    // First get the tags for this content
    const targetContent = await prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true, tags: true }
    });
    
    if (!targetContent || !targetContent.tags) {
      return []; // No tags to compare
    }
    
    let targetTags: string[] = [];
    try {
      // Try parsing as JSON
      targetTags = JSON.parse(targetContent.tags);
    } catch (e) {
      // Fallback to comma separated
      targetTags = targetContent.tags.split(',').map(t => t.trim());
    }

    if (!Array.isArray(targetTags) || targetTags.length === 0) {
      return [];
    }
    
    // Find other content
    // Since tags are stored as string/json, we can't easily query "contains tag X" in Prisma without raw query or fetching all.
    // For efficiency, we'll fetch content that might be relevant (e.g. same type or just recent) and filter in memory,
    // or use a raw query if performance is critical. Here we'll fetch a batch.
    const otherContentList = await prisma.content.findMany({
      where: { id: { not: contentId } },
      select: { id: true, title: true, tags: true },
      take: 200 // Limit to avoid memory issues
    });
    
    const similarityRecords = [];
    
    for (const otherContent of otherContentList) {
      if (!otherContent.tags) continue;

      let otherTags: string[] = [];
      try {
        otherTags = JSON.parse(otherContent.tags);
      } catch (e) {
        otherTags = otherContent.tags.split(',').map(t => t.trim());
      }

      if (!Array.isArray(otherTags) || otherTags.length === 0) continue;

      // Calculate intersection
      const intersection = targetTags.filter(t => otherTags.includes(t));
      
      if (intersection.length > 0) {
        // Calculate similarity score based on tag overlap
        const similarityScore = intersection.length / Math.max(targetTags.length, otherTags.length);
        
        similarityRecords.push({
          contentIdA: contentId,
          contentIdB: otherContent.id,
          similarityScore,
          similarityType: SimilarityType.TAG_BASED
        });
      }
    }
    
    // Sort by score and take top 50
    similarityRecords.sort((a, b) => b.similarityScore - a.similarityScore);
    const topRecords = similarityRecords.slice(0, 50);

    // Store the similarity records
    for (const record of topRecords) {
      // Check if a record already exists
      const existingRecord = await prisma.contentSimilarity.findFirst({
        where: {
          OR: [
            { contentIdA: record.contentIdA, contentIdB: record.contentIdB },
            { contentIdA: record.contentIdB, contentIdB: record.contentIdA }
          ],
          similarityType: SimilarityType.TAG_BASED
        }
      });
      
      if (existingRecord) {
        // Update existing record
        await this.updateSimilarity(existingRecord.id, {
          id: existingRecord.id,
          similarityScore: record.similarityScore
        });
      } else {
        // Create new record
        await this.createSimilarity(record);
      }
    }
    
    return topRecords;
  }
  
  /**
   * Calculate collaborative filtering similarity based on user interactions
   */
  async calculateCollaborativeSimilarity(contentId: string) {
    // Get users who interacted with this content
    const interactions = await prisma.contentInteraction.findMany({
      where: { contentId },
      select: { userId: true },
      distinct: ['userId']
    });
    
    if (interactions.length === 0) {
      return []; // No user interactions to use
    }
    
    const userIds = interactions.map(i => i.userId);
    
    // Find other content that these users interacted with
    // We need to group by contentId and count users
    const otherInteractions = await prisma.contentInteraction.groupBy({
      by: ['contentId'],
      where: {
        userId: { in: userIds },
        contentId: { not: contentId }
      },
      _count: {
        userId: true
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 50
    });
    
    const similarityRecords = [];
    
    for (const otherContent of otherInteractions) {
      // Calculate similarity score based on user overlap
      // Jaccard index would be better but simple overlap ratio is okay for now
      const similarityScore = otherContent._count.userId / userIds.length;
      
      similarityRecords.push({
        contentIdA: contentId,
        contentIdB: otherContent.contentId,
        similarityScore,
        similarityType: SimilarityType.COLLABORATIVE
      });
    }
    
    // Store the similarity records
    for (const record of similarityRecords) {
      // Check if a record already exists
      const existingRecord = await prisma.contentSimilarity.findFirst({
        where: {
          OR: [
            { contentIdA: record.contentIdA, contentIdB: record.contentIdB },
            { contentIdA: record.contentIdB, contentIdB: record.contentIdA }
          ],
          similarityType: SimilarityType.COLLABORATIVE
        }
      });
      
      if (existingRecord) {
        // Update existing record
        await this.updateSimilarity(existingRecord.id, {
          id: existingRecord.id,
          similarityScore: record.similarityScore
        });
      } else {
        // Create new record
        await this.createSimilarity(record);
      }
    }
    
    return similarityRecords;
  }
  
  /**
   * Run all similarity algorithms for a piece of content
   */
  async analyzeContentSimilarity(contentId: string) {
    const results = {
      contentBased: await this.calculateContentBasedSimilarity(contentId),
      tagBased: await this.calculateTagBasedSimilarity(contentId),
      collaborative: await this.calculateCollaborativeSimilarity(contentId)
    };
    
    return results;
  }
}

const contentSimilarityService = new ContentSimilarityService();
export default contentSimilarityService;