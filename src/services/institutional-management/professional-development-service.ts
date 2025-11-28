import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { prisma } from '../../lib/prisma';
import { UserActivity, UserInterest, ContentItem, ProfessionalDevelopmentRecommendation } from './types';

/**
 * Service for providing AI-powered professional development recommendations
 * based on user activity, interests, and institutional context
 */
export class ProfessionalDevelopmentService {
  /**
   * Get personalized professional development recommendations for a specific user
   * 
   * @param id - The ID of the user to get recommendations for
   * @param id - Optional institution ID to contextualize recommendations
   * @param limit - Maximum number of recommendations to return
   * @returns Array of professional development recommendations
   */
  async getRecommendationsForUser(userId: string, institutionId?: string,
    limit: number = 5
  ): Promise<ProfessionalDevelopmentRecommendation[]> {
    try {
      // Fetch user activity data from the database
      const userActivityQuery = `
        SELECT
          ua.id,
          ua."userId",
          ua.content_type as "contentType",
          ua.content_id as "contentId",
          ua.action_type as "actionType",
          ua.created_at as "createdAt",
          COALESCE(ua.duration, 0) as duration,
          COALESCE(ua.completion_percentage, 0) as "completionPercentage"
        FROM
          "UserActivity" ua
        WHERE
          ua."userId" = $1
        ORDER BY
          ua.created_at DESC
        LIMIT 50
      `;
      
      const userActivityResult = await prisma.$queryRaw`${userActivityQuery}::text, ${userId}`;
      const userActivity = userActivityResult as UserActivity[];
      
      // Fetch user interests from the database
      const userInterestsQuery = `
        SELECT
          ui.id,
          ui."userId",
          ui.category,
          ui.topic,
          ui.strength_score as "strengthScore",
          ui.last_updated as "lastUpdated"
        FROM
          "UserInterest" ui
        WHERE
          ui."userId" = $1
        ORDER BY
          ui.strength_score DESC
      `;
      
      const userInterestsResult = await prisma.$queryRaw`${userInterestsQuery}::text, ${userId}`;
      const userInterests = userInterestsResult as UserInterest[];
      
      // Fetch user profile from the database
      const userQuery = `
        SELECT
          u.id,
          u.name,
          u.email,
          u.role,
          ep.years_of_experience as "yearsOfExperience",
          ep.specializations,
          ep.qualifications,
          rp.years_of_experience as "researcherYearsOfExperience",
          rp.research_areas as "researchAreas",
          rp.academic_qualifications as "academicQualifications"
        FROM
          "User" u
        LEFT JOIN
          "EdPsychProfile" ep ON u.id = ep."userId"
        LEFT JOIN
          "ResearcherProfile" rp ON u.id = rp."userId"
        WHERE
          u.id = $1
      `;
      
      const userResult = await prisma.$queryRaw`${userQuery}::text, ${userId}`;
      const user = Array.isArray(userResult) && userResult.length > 0 ? userResult[0] : null;
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Fetch institution data if provided
      let institutionData = null;
      if (institutionId) {
        const institutionQuery = `
          SELECT
            i.id,
            i.name,
            i.type,
            COALESCE(i.focus_areas, '[]') as "focusAreas"
          FROM
            "${institutionId.includes('school') ? 'School' : 'Institution'}" i
          WHERE
            i.id = $1
        `;
        
        const institutionResult = await prisma.$queryRaw`${institutionQuery}::text, ${institutionId}`;
        
        if (Array.isArray(institutionResult) && institutionResult.length > 0) {
          const institution = institutionResult[0] as any;
          
          // Fetch departments for this institution
          const departmentsQuery = `
            SELECT
              d.id,
              d.name,
              d.description
            FROM
              "Department" d
            WHERE
              d."institutionId" = $1
            AND
              d.status = 'ACTIVE'
          `;
          
          const departmentsResult = await prisma.$queryRaw`${departmentsQuery}::text, ${institutionId}`;
          
          // Parse focus areas if they're stored as a JSON string
          let focusAreas = [];
          try {
            focusAreas = typeof institution.focusAreas === 'string'
              ? JSON.parse(institution.focusAreas)
              : (institution.focusAreas || []);
          } catch (e) {
            console.warn('Failed to parse focus areas', e);
            focusAreas = [];
          }
          
          institutionData = {
            id: institutionId,
            name: institution.name,
            type: institution.type,
            departments: departmentsResult as any[] || [],
            focusAreas: focusAreas
          };
        }
      }
      
      // Prepare input for the recommendation algorithm
      const activityData = this.preprocessUserActivity(userActivity);
      const interestData = this.preprocessUserInterests(userInterests);
      const userData = this.preprocessUserProfile(user);
      const institutionalContext = institutionData ? 
        this.preprocessInstitutionalContext(institutionData) : null;
      
      // Get recommendations using the AI model
      const recommendations = await this.generateRecommendations(
        userData,
        activityData,
        interestData,
        institutionalContext,
        limit
      );
      
      return recommendations;
    } catch (error) {
      console.error('Error getting professional development recommendations:', error);
      throw new Error('Failed to generate professional development recommendations');
    }
  }
  
  /**
   * Get trending professional development recommendations for an institution
   *
   * @param institutionId - The ID of the institution
   * @param limit - Maximum number of recommendations to return
   * @returns Array of trending recommendations
   */
  async getTrendingRecommendationsForInstitution(
    institutionId: string,
    limit: number = 5
  ): Promise<ProfessionalDevelopmentRecommendation[]> {
    try {
      // Fetch the institution from database
      const institutionQuery = `
        SELECT
          i.id,
          i.name,
          i.type
        FROM
          "${institutionId.includes('school') ? 'School' : 'Institution'}" i
        WHERE
          i.id = $1
      `;
      
      const institutionResult = await prisma.$queryRaw`${institutionQuery}::text, ${institutionId}`;
      
      if (!Array.isArray(institutionResult) || institutionResult.length === 0) {
        throw new Error('Institution not found');
      }
      
      // Fetch users associated with this institution
      const institutionUsersQuery = `
        SELECT
          iu.id,
          iu."userId",
          iu."institutionId",
          iu.role,
          u.id as "user_id",
          u.name as "user_name",
          u.email as "user_email"
        FROM
          "InstitutionUser" iu
        JOIN
          "User" u ON iu."userId" = u.id
        WHERE
          iu."institutionId" = $1
      `;
      
      const institutionUsersResult = await prisma.$queryRaw`${institutionUsersQuery}::text, ${institutionId}`;
      const institutionUserIds = (institutionUsersResult as any[]).map((user: any) => user.user_id);
      
      // Get popular content items with activity counts
      let trendingContentResult: any[] = [];
      
      if (institutionUserIds.length > 0) {
        // For simplicity, use a direct query with user IDs as a comma-separated string
        // This is a safer alternative when dealing with dynamic IN clauses
        const userIdsString = institutionUserIds.map((uid: string) => `'${uid}'`).join(',');
        
        const contentActivityQuery = `
          SELECT
            c.id,
            c.title,
            c.description,
            c.content_type as "contentType",
            COALESCE(c.tags, '[]') as tags,
            c.url,
            c.image_url as "imageUrl",
            c.created_at as "createdAt",
            COUNT(ua.id) as "activityCount"
          FROM
            "Content" c
          JOIN
            "UserActivity" ua ON c.id = ua.content_id
          WHERE
            ua."id" IN (${userIdsString})
            AND c.is_public = TRUE
            AND ua.created_at > NOW() - INTERVAL '90 days'
          GROUP BY
            c.id, c.title, c.description, c.content_type, c.tags, c.url, c.image_url, c.created_at
          ORDER BY
            "activityCount" DESC
          LIMIT
            ${limit * 2}
        `;
        
        // Execute the query
        const result = await prisma.$queryRaw`${contentActivityQuery}::text`;
        trendingContentResult = result as any[];
      }
      
      // If there's not enough popular content, fetch recent content as a fallback
      let trendingContent = trendingContentResult as any[];
      
      if (trendingContent.length < limit) {
        const recentContentQuery = `
          SELECT
            c.id,
            c.title,
            c.description,
            c.content_type as "contentType",
            COALESCE(c.tags, '[]') as tags,
            c.url,
            c.image_url as "imageUrl",
            c.created_at as "createdAt",
            0 as "activityCount"
          FROM
            "Content" c
          WHERE
            c.is_public = TRUE
            AND c.id NOT IN (${trendingContent.map(c => `'${c.id}'`).join(',')})
          ORDER BY
            c.created_at DESC
          LIMIT
            ${limit - trendingContent.length}
        `;
        
        const recentContentResult = await prisma.$queryRaw`${recentContentQuery}::text`;
        trendingContent = [...trendingContent, ...(recentContentResult as any[])];
      }
      
      // Handle empty content results
      if (trendingContent.length === 0) {
        return [];
      }
      
      // Transform to recommendations format
      const recommendations = trendingContent.map((content: any) => {
        // Parse tags if they're stored as a JSON string
        let tags: string[] = [];
        try {
          tags = typeof content.tags === 'string'
            ? JSON.parse(content.tags)
            : (content.tags || []);
        } catch (e) {
          console.warn('Failed to parse content tags', e);
          tags = [];
        }
        
        const activityCount = Number(content.activityCount || 0);
        
        return {
          id: content.id,
          title: content.title,
          description: content.description,
          contentType: content.contentType,
          relevanceScore: this.calculateRelevanceScore(activityCount, new Date(content.createdAt)),
          tags,
          url: content.url,
          imageUrl: content.imageUrl,
          source: 'institutional_trending'
        };
      });
      
      // Sort by relevance score and limit results
      return recommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trending recommendations:', error);
      throw new Error('Failed to generate trending recommendations');
    }
  }
  
  /**
   * Process user activity data for recommendation algorithm
   */
  private preprocessUserActivity(activities: UserActivity[]): any {
    // Extract relevant features from user activity
    // This would transform raw activity data into a format suitable for the AI model
    return activities.map(activity => ({
      contentType: activity.contentType,
      contentId: activity.contentId,
      action: activity.actionType,
      timestamp: activity.createdAt.getTime(),
      duration: activity.duration || 0,
      completionPercentage: activity.completionPercentage || 0
    }));
  }
  
  /**
   * Process user interest data for recommendation algorithm
   */
  private preprocessUserInterests(interests: UserInterest[]): any {
    // Transform user interest data for the AI model
    return interests.map(interest => ({
      category: interest.category,
      topic: interest.topic,
      strength: interest.strengthScore
    }));
  }
  
  /**
   * Process user profile data for recommendation algorithm
   */
  private preprocessUserProfile(user: any): any {
    return {
      id: user.id,
      role: user.role,
      experience: user.edPsychProfile?.yearsOfExperience || 
                 user.researcherProfile?.yearsOfExperience || 0,
      specializations: user.edPsychProfile?.specializations || 
                      user.researcherProfile?.researchAreas || [],
      qualifications: user.edPsychProfile?.qualifications || 
                     user.researcherProfile?.academicQualifications || []
    };
  }
  
  /**
   * Process institutional context for recommendation algorithm
   */
  private preprocessInstitutionalContext(institution: any): any {
    return {
      id: institution.id,
      name: institution.name,
      type: institution.type,
      departments: institution.departments.map((d: any) => d.name),
      focusAreas: institution.focusAreas || []
    };
  }
  
  /**
   * Generate recommendations using AI model
   * In a real implementation, this would call an AI service or model
   */
  private async generateRecommendations(
    userData: any,
    _activityData: any,
    interestData: any,
    institutionalContext: any | null,
    limit: number
  ): Promise<ProfessionalDevelopmentRecommendation[]> {
    // Fetch real content from the database
    // We'll filter in memory for now as the recommendation logic is complex
    // In a production system with vector search, this would be a vector similarity search
    
    const allContent = await prisma.content.findMany({
      where: {
        is_public: true
      },
      take: 100 // Limit to recent/relevant content
    });
    
    const userTopics = [...interestData.map((i: any) => i.topic), ...(userData.specializations || [])];
    
    // Filter to relevant content based on user interests and specializations
    const relevantContentItems = allContent.filter(item => {
      // Parse tags
      let tags: string[] = [];
      try {
        tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : [];
      } catch {
        // Fallback if tags are comma-separated
        tags = item.tags ? item.tags.split(',').map(t => t.trim()) : [];
      }
      
      // Check if any tags match user topics
      // Case insensitive matching
      return tags.some(tag => 
        userTopics.some(topic => topic.toLowerCase() === tag.toLowerCase())
      );
    });
    
    // If no relevant content found, fall back to most recent content
    const contentToRank = relevantContentItems.length > 0 
      ? relevantContentItems 
      : allContent.slice(0, 20);
    
    // Calculate relevance scores
    const recommendationsWithScores = contentToRank.map(item => {
      // Parse tags again for scoring
      let tags: string[] = [];
      try {
        tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : [];
      } catch {
        tags = item.tags ? item.tags.split(',').map(t => t.trim()) : [];
      }

      // Calculate a relevance score based on matching interests and specializations
      const interestMatch = interestData.filter((i: any) =>
        tags.some(t => t.toLowerCase() === i.topic.toLowerCase())
      ).reduce((sum: number, i: any) => sum + i.strength, 0);
      
      const specializationMatch = (userData.specializations || []).filter((s: string) =>
        tags.some(t => t.toLowerCase() === s.toLowerCase())
      ).length;
      
      // Factor in institutional context if available
      const contentItemForContext: ContentItem = {
        id: item.id,
        title: item.title,
        description: item.description || '',
        tags,
        url: item.url || '',
        imageUrl: item.image_url || undefined,
        contentType: item.content_type,
        authorId: item.authorId ?? undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isPublic: item.is_public,
        metadata: item.metadata ? JSON.parse(item.metadata as string) : {}
      };

      const institutionalRelevance = institutionalContext
        ? this.calculateInstitutionalRelevance(contentItemForContext, institutionalContext)
        : 0;
      
      // Calculate final relevance score (simplified)
      const relevanceScore = (
        (interestMatch * 0.4) + 
        (specializationMatch * 0.3) + 
        (institutionalRelevance * 0.3)
      );
      
      return {
        id: item.id,
        title: item.title,
        description: item.description || '',
        contentType: item.content_type,
        relevanceScore,
        tags,
        url: item.url || '',
        imageUrl: item.image_url || undefined,
        source: 'ai_recommendation'
      };
    });
    
    // Sort by relevance score and return top recommendations
    return recommendationsWithScores
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
  
  /**
   * Calculate institutional relevance of a content item
   */
  private calculateInstitutionalRelevance(contentItem: ContentItem, institutionalContext: any): number {
    // Check how relevant content is to the institutional context
    const departmentMatches = institutionalContext.departments.filter((dept: string) =>
      contentItem.tags?.includes(dept.toLowerCase())
    ).length;
    
    const focusAreaMatches = institutionalContext.focusAreas.filter((area: string) =>
      contentItem.tags?.includes(area.toLowerCase())
    ).length;
    
    // Calculate normalized score (0-1)
    const maxPossibleMatches = 
      institutionalContext.departments.length + 
      institutionalContext.focusAreas.length;
    
    return maxPossibleMatches > 0
      ? (departmentMatches + focusAreaMatches) / maxPossibleMatches
      : 0;
  }
  
  /**
   * Calculate a relevance score based on activity count and recency
   */
  private calculateRelevanceScore(activityCount: number, createdAt: Date): number {
    // Higher score for more activity and recent content
    const recencyFactor = Math.max(
      0,
      1 - (Date.now() - createdAt.getTime()) / (90 * 24 * 60 * 60 * 1000)
    );
    
    // Normalize activity count (assuming max ~100)
    const normalizedActivity = Math.min(activityCount / 100, 1);
    
    // Combine factors (70% activity, 30% recency)
    return (normalizedActivity * 0.7) + (recencyFactor * 0.3);
  }
}

const professionalDevelopmentService = new ProfessionalDevelopmentService();
export default professionalDevelopmentService;