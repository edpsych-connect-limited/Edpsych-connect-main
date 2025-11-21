import { Pool, QueryResult } from 'pg';

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Database adapter for recommendation engine models
 * This adapter provides a transitional approach until Prisma models are fully integrated
 */
export class RecommendationDatabaseAdapter {
  /**
   * Execute a raw SQL query
   */
  async executeQuery(text: string, params?: any[]): Promise<QueryResult> {
    return pool.query(text, params);
  }

  /**
   * User Preferences
   */
  async createUserPreference(data: any) {
    const query = `
      INSERT INTO "UserPreference" ("id", "id", "categoryId", "tagId", "contentType", "weight", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      data.id || crypto.randomUUID(),
      data.id,
      data.categoryId || null,
      data.tagId || null,
      data.contentType || null,
      data.weight || 1.0,
      new Date(),
      new Date()
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async getUserPreferences(id: string) {
    const query = `
      SELECT up.*, c.name as "categoryName", t.name as "tagName"
      FROM "UserPreference" up
      LEFT JOIN "Category" c ON up."categoryId" = c.id
      LEFT JOIN "Tag" t ON up."tagId" = t.id
      WHERE up."id" = $1
      ORDER BY up."updatedAt" DESC;
    `;
    const result = await this.executeQuery(query, [id]);
    return result.rows;
  }

  async updateUserPreference(id: string, data: any) {
    const query = `
      UPDATE "UserPreference"
      SET "categoryId" = $1, "tagId" = $2, "contentType" = $3, "weight" = $4, "updatedAt" = $5
      WHERE "id" = $6
      RETURNING *;
    `;
    const values = [
      data.categoryId || null,
      data.tagId || null,
      data.contentType || null,
      data.weight,
      new Date(),
      id
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async deleteUserPreference(id: string) {
    const query = `
      DELETE FROM "UserPreference"
      WHERE "id" = $1
      RETURNING *;
    `;
    const result = await this.executeQuery(query, [id]);
    return result.rows[0];
  }

  /**
   * Content Interactions
   */
  async createContentInteraction(data: any) {
    const query = `
      INSERT INTO "ContentInteraction" ("id", "id", "contentId", "interactionType", "durationSeconds", "completionPercentage", "rating", "bookmarked", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      data.id || crypto.randomUUID(),
      data.id,
      data.contentId,
      data.interactionType,
      data.durationSeconds || null,
      data.completionPercentage || null,
      data.rating || null,
      data.bookmarked || false,
      new Date()
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async getContentInteractions(contentId: string) {
    const query = `
      SELECT ci.*, u.name as "userName", u.email as "userEmail"
      FROM "ContentInteraction" ci
      JOIN "User" u ON ci."id" = u.id
      WHERE ci."contentId" = $1
      ORDER BY ci."createdAt" DESC;
    `;
    const result = await this.executeQuery(query, [contentId]);
    return result.rows;
  }

  async getUserInteractions(id: string) {
    const query = `
      SELECT ci.*, c.title as "contentTitle", c.type as "contentType"
      FROM "ContentInteraction" ci
      JOIN "Content" c ON ci."contentId" = c.id
      WHERE ci."id" = $1
      ORDER BY ci."createdAt" DESC;
    `;
    const result = await this.executeQuery(query, [id]);
    return result.rows;
  }

  async updateContentInteraction(id: string, data: any) {
    const query = `
      UPDATE "ContentInteraction"
      SET "interactionType" = $1, "durationSeconds" = $2, "completionPercentage" = $3, "rating" = $4, "bookmarked" = $5
      WHERE "id" = $6
      RETURNING *;
    `;
    const values = [
      data.interactionType,
      data.durationSeconds || null,
      data.completionPercentage || null,
      data.rating || null,
      data.bookmarked || false,
      id
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async deleteContentInteraction(id: string) {
    const query = `
      DELETE FROM "ContentInteraction"
      WHERE "id" = $1
      RETURNING *;
    `;
    const result = await this.executeQuery(query, [id]);
    return result.rows[0];
  }

  /**
   * Content Similarity
   */
  async createContentSimilarity(data: any) {
    const query = `
      INSERT INTO "ContentSimilarity" ("id", "contentIdA", "contentIdB", "similarityScore", "similarityType", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      data.id || crypto.randomUUID(),
      data.contentIdA,
      data.contentIdB,
      data.similarityScore,
      data.similarityType,
      new Date(),
      new Date()
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async getContentSimilarities(contentId: string) {
    const query = `
      SELECT cs.*, 
        CASE 
          WHEN cs."contentIdA" = $1 THEN cs."contentIdB" 
          ELSE cs."contentIdA" 
        END as "relatedContentId",
        c.title as "relatedContentTitle",
        c.type as "relatedContentType"
      FROM "ContentSimilarity" cs
      JOIN "Content" c ON c.id = 
        CASE 
          WHEN cs."contentIdA" = $1 THEN cs."contentIdB" 
          ELSE cs."contentIdA" 
        END
      WHERE cs."contentIdA" = $1 OR cs."contentIdB" = $1
      ORDER BY cs."similarityScore" DESC;
    `;
    const result = await this.executeQuery(query, [contentId]);
    return result.rows;
  }

  /**
   * Recommendations
   */
  async createRecommendation(data: any) {
    const query = `
      INSERT INTO "Recommendation" ("id", "id", "contentId", "score", "reason", "status", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      data.id || crypto.randomUUID(),
      data.id,
      data.contentId,
      data.score,
      data.reason,
      data.status || 'ACTIVE',
      new Date(),
      new Date()
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async getUserRecommendations(id: string, status?: string) {
    let query = `
      SELECT r.*, c.title as "contentTitle", c.type as "contentType", c.description as "contentDescription"
      FROM "Recommendation" r
      JOIN "Content" c ON r."contentId" = c.id
      WHERE r."id" = $1
    `;
    
    const params: any[] = [id];
    
    if (status) {
      query += ` AND r.status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY r.score DESC, r."createdAt" DESC`;
    
    const result = await this.executeQuery(query, params);
    return result.rows;
  }

  async updateRecommendationStatus(id: string, status: string) {
    let query = `
      UPDATE "Recommendation"
      SET "status" = $1, "updatedAt" = $2
    `;
    
    const params: any[] = [status, new Date()];
    
    if (status === 'CLICKED') {
      query += `, "clickedAt" = $3`;
      params.push(new Date());
    } else if (status === 'DISMISSED') {
      query += `, "dismissedAt" = $3`;
      params.push(new Date());
    }
    
    query += ` WHERE "id" = $${params.length + 1} RETURNING *`;
    params.push(id);
    
    const result = await this.executeQuery(query, params);
    return result.rows[0];
  }

  /**
   * User Interests
   */
  async createUserInterest(data: any) {
    const query = `
      INSERT INTO "UserInterest" ("id", "id", "interestArea", "confidence", "source", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      data.id || crypto.randomUUID(),
      data.id,
      data.interestArea,
      data.confidence,
      data.source,
      new Date(),
      new Date()
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async getUserInterests(id: string) {
    const query = `
      SELECT *
      FROM "UserInterest"
      WHERE "id" = $1
      ORDER BY "confidence" DESC;
    `;
    const result = await this.executeQuery(query, [id]);
    return result.rows;
  }
  
  /**
   * Assessment Content Links
   */
  async createAssessmentContentLink(data: any) {
    const query = `
      INSERT INTO "AssessmentContentLink" ("id", "assessmentResultId", "contentId", "relevanceScore", "linkType", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      data.id || crypto.randomUUID(),
      data.assessmentResultId,
      data.contentId,
      data.relevanceScore,
      data.linkType,
      new Date()
    ];
    
    const result = await this.executeQuery(query, values);
    return result.rows[0];
  }

  async getContentForAssessmentResult(assessmentResultId: string) {
    const query = `
      SELECT acl.*, c.title as "contentTitle", c.description as "contentDescription", c.type as "contentType"
      FROM "AssessmentContentLink" acl
      JOIN "Content" c ON acl."contentId" = c.id
      WHERE acl."assessmentResultId" = $1
      ORDER BY acl."relevanceScore" DESC;
    `;
    const result = await this.executeQuery(query, [assessmentResultId]);
    return result.rows;
  }
}

export default new RecommendationDatabaseAdapter();