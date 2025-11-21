import { 
  RecommendationReason, 
  RecommendationStatus,
  RecommendationFilter,
  RecommendationsResponse,
  CreateRecommendationInput,
  UpdateRecommendationInput,
  InteractionType
} from "../../types/recommendation-engine-types";
import db from "./database-adapter";
import contentSimilarityService from "./content-similarity";

/**
 * Service for generating and managing content recommendations
 */
export class RecommendationService {
  /**
   * Create a new recommendation
   */
  async createRecommendation(data: CreateRecommendationInput) {
    return db.createRecommendation({
      id: data.id,
      contentId: data.contentId,
      score: data.score,
      reason: data.reason,
      status: data.status || RecommendationStatus.ACTIVE
    });
  }

  /**
   * Get recommendations for a user with optional filters
   */
  async getUserRecommendations(id: string, filter?: RecommendationFilter): Promise<RecommendationsResponse> {
    // Build the query string and parameters
    let queryStr = `
      SELECT r.*, c.title as "contentTitle", c.type as "contentType", c.description as "contentDescription"
      FROM "Recommendation" r
      JOIN "Content" c ON r."contentId" = c.id
      WHERE r."id" = $1
    `;
    
    const params: any[] = [id];
    let paramIndex = 2;
    
    // Apply filters
    if (filter?.status) {
      queryStr += ` AND r.status = $${paramIndex++}`;
      params.push(filter.status);
    }
    
    if (filter?.reason) {
      queryStr += ` AND r.reason = $${paramIndex++}`;
      params.push(filter.reason);
    }
    
    if (filter?.minScore) {
      queryStr += ` AND r.score >= $${paramIndex++}`;
      params.push(filter.minScore);
    }
    
    if (filter?.contentType) {
      queryStr += ` AND c.type = $${paramIndex++}`;
      params.push(filter.contentType);
    }
    
    if (filter?.categoryId) {
      queryStr += ` AND EXISTS (
        SELECT 1 FROM "ContentCategory" cc 
        WHERE cc."contentId" = r."contentId" AND cc."categoryId" = $${paramIndex++}
      )`;
      params.push(filter.categoryId);
    }
    
    if (filter?.tagId) {
      queryStr += ` AND EXISTS (
        SELECT 1 FROM "ContentTag" ct 
        WHERE ct."contentId" = r."contentId" AND ct."tagId" = $${paramIndex++}
      )`;
      params.push(filter.tagId);
    }
    
    // Count the total before applying limit/offset for pagination
    const countQuery = `SELECT COUNT(*) as count FROM (${queryStr}) as countQuery`;
    const countResult = await db.executeQuery(countQuery, params);
    const count = parseInt(countResult.rows[0].count);
    
    // Apply sorting and pagination
    queryStr += ` ORDER BY r.score DESC, r."createdAt" DESC`;
    
    if (filter?.limit) {
      queryStr += ` LIMIT $${paramIndex++}`;
      params.push(filter.limit);
    }
    
    if (filter?.offset) {
      queryStr += ` OFFSET $${paramIndex++}`;
      params.push(filter.offset);
    }
    
    const result = await db.executeQuery(queryStr, params);
    
    return {
      recommendations: result.rows,
      count
    };
  }

  /**
   * Update a recommendation
   */
  async updateRecommendation(id: string, data: UpdateRecommendationInput) {
    const query = `
      UPDATE "Recommendation"
      SET "score" = COALESCE($1, "score"), 
          "reason" = COALESCE($2, "reason"),
          "status" = COALESCE($3, "status"),
          "clickedAt" = COALESCE($4, "clickedAt"),
          "dismissedAt" = COALESCE($5, "dismissedAt"),
          "updatedAt" = $6
      WHERE "id" = $7
      RETURNING *;
    `;
    const values = [
      data.score,
      data.reason,
      data.status,
      data.clickedAt,
      data.dismissedAt,
      new Date(),
      id
    ];
    
    const result = await db.executeQuery(query, values);
    return result.rows[0];
  }

  /**
   * Get a specific recommendation by ID and ensure it belongs to the user
   */
  async getRecommendationById(userId: string, recommendationId: string) {
    const query = `
      SELECT r.*, c.title as "contentTitle", c.type as "contentType", c.description as "contentDescription"
      FROM "Recommendation" r
      JOIN "Content" c ON r."contentId" = c.id
      WHERE r.id = $1 AND r."userId" = $2
    `;
    const result = await db.executeQuery(query, [recommendationId, userId]);
    return result.rows[0] || null;
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(userId: string, recommendationId: string, status: RecommendationStatus, notes?: string) {
    const query = `
      UPDATE "Recommendation"
      SET "status" = $1,
          "notes" = COALESCE($2, "notes"),
          "updatedAt" = $3
      WHERE "id" = $4 AND "userId" = $5
      RETURNING *;
    `;
    const values = [
      status,
      notes,
      new Date(),
      recommendationId,
      userId
    ];
    
    const result = await db.executeQuery(query, values);
    return result.rows[0];
  }

  /**
   * Delete a recommendation
   */
  async deleteRecommendation(userId: string, recommendationId: string) {
    const query = `
      DELETE FROM "Recommendation"
      WHERE "id" = $1 AND "userId" = $2
      RETURNING *;
    `;
    const result = await db.executeQuery(query, [recommendationId, userId]);
    return result.rows[0];
  }
  
  /**
   * Mark a recommendation as clicked
   */
  async markRecommendationClicked(userId: string, recommendationId: string) {
    return this.updateRecommendationStatus(userId, recommendationId, RecommendationStatus.CLICKED);
  }

  /**
   * Mark a recommendation as dismissed
   */
  async markRecommendationDismissed(userId: string, recommendationId: string) {
    return this.updateRecommendationStatus(userId, recommendationId, RecommendationStatus.DISMISSED);
  }

  /**
   * Generate content-based recommendations
   * This uses content similarity to recommend content
   */
  async generateContentBasedRecommendations(id: string, contentId: string, limit: number = 5) {
    // Get the content the user has interacted with
    const similarContent = await contentSimilarityService.getSimilarContent(contentId);
    
    // Convert to recommendations
    const recommendations = [];
    for (const item of similarContent) {
      // Use the similarity score as the recommendation score
      const relatedContentId = item.contentIdA === contentId ? item.contentIdB : item.contentIdA;
      
      // Check if this content is already recommended to the user
      const existingRec = await db.executeQuery(
        `SELECT * FROM "Recommendation" WHERE "id" = $1 AND "contentId" = $2`,
        [id, relatedContentId]
      );
      
      // If it's not already recommended, create a new recommendation
      if (existingRec.rows.length === 0) {
        const rec = await this.createRecommendation({
          id,
          contentId: relatedContentId,
          score: item.similarityScore,
          reason: RecommendationReason.SIMILAR_CONTENT
        });
        recommendations.push(rec);
      }
      
      if (recommendations.length >= limit) {
        break;
      }
    }
    
    return recommendations;
  }

  /**
   * Generate interest-based recommendations
   * This uses user interests to recommend content
   */
  async generateInterestBasedRecommendations(id: string, limit: number = 5) {
    // Get user interests
    const interests = await db.getUserInterests(id);
    
    if (interests.length === 0) {
      return [];
    }
    
    // Find content related to these interests
    const recommendations = [];
    
    for (const interest of interests) {
      // Find content related to this interest area
      // For simplicity, we'll search for the interest area in content titles/descriptions
      const contentQuery = `
        SELECT c.* 
        FROM "Content" c
        WHERE c.title ILIKE $1 OR c.description ILIKE $1
        AND NOT EXISTS (
          SELECT 1 FROM "Recommendation" 
          WHERE "id" = $2 AND "contentId" = c.id
        )
        LIMIT $3
      `;
      
      const contentResult = await db.executeQuery(
        contentQuery,
        [`%${interest.interestArea}%`, id, limit]
      );
      
      // Create recommendations for these content items
      for (const content of contentResult.rows) {
        const rec = await this.createRecommendation({
          id,
          contentId: content.id,
          score: interest.confidence, // Use the confidence in the interest as the score
          reason: RecommendationReason.USER_INTEREST
        });
        recommendations.push(rec);
        
        if (recommendations.length >= limit) {
          break;
        }
      }
      
      if (recommendations.length >= limit) {
        break;
      }
    }
    
    return recommendations;
  }

  /**
   * Generate popularity-based recommendations
   * This recommends popular content that the user hasn't interacted with
   */
  async generatePopularityRecommendations(id: string, limit: number = 5) {
    // Get most popular content based on view counts
    const popularContentQuery = `
      SELECT c.id, COUNT(ci.id) as view_count
      FROM "Content" c
      JOIN "ContentInteraction" ci ON c.id = ci."contentId"
      WHERE ci."interactionType" = $1
      AND NOT EXISTS (
        SELECT 1 FROM "ContentInteraction" 
        WHERE "id" = $2 AND "contentId" = c.id
      )
      GROUP BY c.id
      ORDER BY view_count DESC
      LIMIT $3
    `;
    
    const popularContent = await db.executeQuery(
      popularContentQuery,
      [InteractionType.VIEW, id, limit]
    );
    
    // Create recommendations for these popular items
    const recommendations = [];
    
    for (const content of popularContent.rows) {
      // Check if this content is already recommended to the user
      const existingRec = await db.executeQuery(
        `SELECT * FROM "Recommendation" WHERE "id" = $1 AND "contentId" = $2`,
        [id, content.id]
      );
      
      // If it's not already recommended, create a new recommendation
      if (existingRec.rows.length === 0) {
        const rec = await this.createRecommendation({
          id,
          contentId: content.id,
          score: content.view_count / 100, // Normalize the score
          reason: RecommendationReason.POPULAR
        });
        recommendations.push(rec);
      }
    }
    
    return recommendations;
  }

  /**
   * Generate trending recommendations
   * This recommends content that has recent engagement
   */
  async generateTrendingRecommendations(id: string, limit: number = 5, dayRange: number = 7) {
    const trendingContentQuery = `
      SELECT c.id, COUNT(ci.id) as recent_interactions
      FROM "Content" c
      JOIN "ContentInteraction" ci ON c.id = ci."contentId"
      WHERE ci."createdAt" > NOW() - INTERVAL '${dayRange} days'
      AND NOT EXISTS (
        SELECT 1 FROM "ContentInteraction" 
        WHERE "id" = $1 AND "contentId" = c.id
      )
      GROUP BY c.id
      ORDER BY recent_interactions DESC
      LIMIT $2
    `;
    
    const trendingContent = await db.executeQuery(
      trendingContentQuery,
      [id, limit]
    );
    
    // Create recommendations for these trending items
    const recommendations = [];
    
    for (const content of trendingContent.rows) {
      // Check if this content is already recommended to the user
      const existingRec = await db.executeQuery(
        `SELECT * FROM "Recommendation" WHERE "id" = $1 AND "contentId" = $2`,
        [id, content.id]
      );
      
      // If it's not already recommended, create a new recommendation
      if (existingRec.rows.length === 0) {
        const rec = await this.createRecommendation({
          id,
          contentId: content.id,
          score: content.recent_interactions / 50, // Normalize the score
          reason: RecommendationReason.TRENDING
        });
        recommendations.push(rec);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Generate assessment-based recommendations
   * This recommends content based on recent assessment results
   */
  async generateAssessmentBasedRecommendations(id: string, limit: number = 5) {
    // Get the user's recent assessment results
    const assessmentResultsQuery = `
      SELECT ar.* 
      FROM "AssessmentResult" ar
      WHERE ar."id" = $1
      ORDER BY ar."completedAt" DESC
      LIMIT 5
    `;
    
    const assessmentResults = await db.executeQuery(assessmentResultsQuery, [id]);
    
    if (assessmentResults.rows.length === 0) {
      return [];
    }
    
    const recommendations = [];
    
    // For each assessment result, find linked content
    for (const result of assessmentResults.rows) {
      const linkedContent = await db.getContentForAssessmentResult(result.id);
      
      for (const content of linkedContent) {
        // Check if this content is already recommended to the user
        const existingRec = await db.executeQuery(
          `SELECT * FROM "Recommendation" WHERE "id" = $1 AND "contentId" = $2`,
          [id, content.contentId]
        );
        
        // If it's not already recommended, create a new recommendation
        if (existingRec.rows.length === 0) {
          const rec = await this.createRecommendation({
            id,
            contentId: content.contentId,
            score: content.relevanceScore,
            reason: RecommendationReason.ASSESSMENT_BASED
          });
          recommendations.push(rec);
          
          if (recommendations.length >= limit) {
            break;
          }
        }
      }
      
      if (recommendations.length >= limit) {
        break;
      }
    }
    
    return recommendations;
  }
  
  /**
   * Generate colleague-based recommendations
   * This recommends content that colleagues in the same organization have engaged with
   */
  async generateColleagueBasedRecommendations(userId: string, limit: number = 5) {
    // Get the user's organization
    const userOrgQuery = `
      SELECT o.id 
      FROM "Organization" o
      JOIN "User" u ON u."organizationId" = o.id
      WHERE u.id = $1
    `;
    
    const userOrgResult = await db.executeQuery(userOrgQuery, [userId]);
    
    if (userOrgResult.rows.length === 0) {
      return []; // User doesn't belong to an organization
    }
    
    const organizationId = userOrgResult.rows[0].id;
    
    // Get content that colleagues have interacted with
    const colleagueContentQuery = `
      SELECT ci."contentId", COUNT(ci.id) as colleague_interactions
      FROM "ContentInteraction" ci
      JOIN "User" u ON ci."id" = u.id
      WHERE u."organizationId" = $1
      AND u.id != $2
      AND ci."interactionType" IN ($3, $4, $5)
      AND NOT EXISTS (
        SELECT 1 FROM "ContentInteraction" 
        WHERE "id" = $2 AND "contentId" = ci."contentId"
      )
      GROUP BY ci."contentId"
      ORDER BY colleague_interactions DESC
      LIMIT $6
    `;
    
    const colleagueContent = await db.executeQuery(
      colleagueContentQuery,
      [organizationId, userId, InteractionType.VIEW, InteractionType.BOOKMARK, InteractionType.RATE, limit]
    );
    
    // Create recommendations for these colleague-used items
    const recommendations = [];
    
    for (const content of colleagueContent.rows) {
      // Check if this content is already recommended to the user
      const existingRec = await db.executeQuery(
        `SELECT * FROM "Recommendation" WHERE "userId" = $1 AND "contentId" = $2`,
        [userId, content.contentId]
      );
      
      // If it's not already recommended, create a new recommendation
      if (existingRec.rows.length === 0) {
        const rec = await this.createRecommendation({
          id: userId,
          contentId: content.contentId,
          score: content.colleague_interactions / 10, // Normalize the score
          reason: RecommendationReason.COLLEAGUE_USED
        });
        recommendations.push(rec);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Generate comprehensive recommendations for a user
   * This combines various recommendation strategies
   */
  async generateRecommendations(id: string, limit: number = 20) {
    // Expire old recommendations
    await db.executeQuery(
      `UPDATE "Recommendation" 
       SET "status" = $1, "updatedAt" = NOW() 
       WHERE "id" = $2 AND "status" = $3 AND "createdAt" < NOW() - INTERVAL '30 days'`,
      [RecommendationStatus.EXPIRED, id, RecommendationStatus.ACTIVE]
    );
    
    // Get active recommendations count
    const activeRecQuery = `
      SELECT COUNT(*) as count 
      FROM "Recommendation" 
      WHERE "id" = $1 AND "status" = $2
    `;
    
    const activeRecResult = await db.executeQuery(
      activeRecQuery, 
      [id, RecommendationStatus.ACTIVE]
    );
    
    const activeCount = parseInt(activeRecResult.rows[0].count);
    
    // If we already have enough active recommendations, return them
    if (activeCount >= limit) {
      return this.getUserRecommendations(id, { 
        status: RecommendationStatus.ACTIVE,
        limit
      });
    }
    
    // Calculate how many more recommendations we need
    const neededCount = limit - activeCount;
    
    // Get the user's recent interactions to find content for similarity-based recommendations
    const recentInteractionsQuery = `
      SELECT DISTINCT "contentId"
      FROM "ContentInteraction"
      WHERE "id" = $1
      ORDER BY "createdAt" DESC
      LIMIT 5
    `;
    
    const recentInteractions = await db.executeQuery(recentInteractionsQuery, [id]);
    
    // Generate recommendations using multiple strategies
    let generatedRecs: any[] = [];
    
    // Content-based recommendations from recent interactions
    for (const interaction of recentInteractions.rows) {
      const contentBasedRecs = await this.generateContentBasedRecommendations(
        id, 
        interaction.contentId,
        Math.ceil(neededCount * 0.2) // Allocate ~20% to content-based recommendations
      );
      generatedRecs = generatedRecs.concat(contentBasedRecs);
    }
    
    // Interest-based recommendations
    const interestBasedRecs = await this.generateInterestBasedRecommendations(
      id,
      Math.ceil(neededCount * 0.2) // Allocate ~20% to interest-based recommendations
    );
    generatedRecs = generatedRecs.concat(interestBasedRecs);
    
    // Assessment-based recommendations
    const assessmentBasedRecs = await this.generateAssessmentBasedRecommendations(
      id,
      Math.ceil(neededCount * 0.2) // Allocate ~20% to assessment-based recommendations
    );
    generatedRecs = generatedRecs.concat(assessmentBasedRecs);
    
    // Popularity and trending recommendations
    const popularityRecs = await this.generatePopularityRecommendations(
      id,
      Math.ceil(neededCount * 0.15) // Allocate ~15% to popularity-based recommendations
    );
    generatedRecs = generatedRecs.concat(popularityRecs);
    
    const trendingRecs = await this.generateTrendingRecommendations(
      id,
      Math.ceil(neededCount * 0.15) // Allocate ~15% to trending recommendations
    );
    generatedRecs = generatedRecs.concat(trendingRecs);
    
    // Colleague-based recommendations
    const colleagueRecs = await this.generateColleagueBasedRecommendations(
      id,
      Math.ceil(neededCount * 0.1) // Allocate ~10% to colleague-based recommendations
    );
    generatedRecs = generatedRecs.concat(colleagueRecs);
    
    // Get the new set of recommendations
    return this.getUserRecommendations(id, { 
      status: RecommendationStatus.ACTIVE,
      limit
    });
  }
  
  /**
   * Process recommendation feedback
   */
  async processRecommendationFeedback(id: string, recommendationId: string, isRelevant: boolean, feedbackText?: string) {
    // Record the feedback
    const query = `
      INSERT INTO "RecommendationFeedback" (
        "id", "id", "recommendationId", "isRelevant", "feedbackText", "createdAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const values = [
      crypto.randomUUID(),
      id,
      recommendationId,
      isRelevant,
      feedbackText,
      new Date()
    ];
    
    const result = await db.executeQuery(query, values);
    
    // If feedback is negative, update the recommendation status
    if (!isRelevant) {
      await this.markRecommendationDismissed(id, recommendationId);
    }
    
    return result.rows[0];
  }
}

export default new RecommendationService();