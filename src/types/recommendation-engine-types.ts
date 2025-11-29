/**
 * Types for the Recommendation Engine
 * These types represent the data models for the recommendation engine, including
 * user preferences, content interactions, recommendations, and more.
 */

// Base types from Prisma models (simplified interfaces that match Prisma models)
export interface User {
  id: string;
  name?: string;
  email?: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  completedAt: Date;
}

// Interaction Types
export enum InteractionType {
  VIEW = 'VIEW',
  READ = 'READ',
  DOWNLOAD = 'DOWNLOAD',
  SHARE = 'SHARE',
  PRINT = 'PRINT',
  RATE = 'RATE',
  COMMENT = 'COMMENT',
  BOOKMARK = 'BOOKMARK'
}

// Similarity Types
export enum SimilarityType {
  CONTENT_BASED = 'CONTENT_BASED',
  COLLABORATIVE = 'COLLABORATIVE',
  SEMANTIC = 'SEMANTIC',
  KEYWORD = 'KEYWORD',
  TAG_BASED = 'TAG_BASED'
}

// Recommendation Reasons
export enum RecommendationReason {
  SIMILAR_CONTENT = 'SIMILAR_CONTENT',
  USER_INTEREST = 'USER_INTEREST',
  POPULAR = 'POPULAR',
  TRENDING = 'TRENDING',
  ASSESSMENT_BASED = 'ASSESSMENT_BASED',
  COLLEAGUE_USED = 'COLLEAGUE_USED'
}

// Recommendation Status
export enum RecommendationStatus {
  ACTIVE = 'ACTIVE',
  CLICKED = 'CLICKED',
  DISMISSED = 'DISMISSED',
  EXPIRED = 'EXPIRED'
}

// Interest Source
export enum InterestSource {
  EXPLICIT = 'EXPLICIT',
  INFERRED = 'INFERRED',
  ASSESSMENT = 'ASSESSMENT',
  BROWSING_HISTORY = 'BROWSING_HISTORY'
}

// User Preference
export interface UserPreference {
  id: string;
  userId: string;
  categoryId?: string;
  tagId?: string;
  contentType?: string;
  weight: number; // 0.0 to 2.0
  createdAt: Date;
  updatedAt: Date;
  user: User;
  category?: Category;
  tag?: Tag;
}

export interface CreateUserPreferenceInput {
  id: string;
  categoryId?: string;
  tagId?: string;
  contentType?: string;
  weight?: number;
}

export interface UpdateUserPreferenceInput {
  id: string;
  weight?: number;
  categoryId?: string;
  tagId?: string;
  contentType?: string;
}

// Content Interaction
export interface ContentInteraction {
  id: string;
  userId: string;
  contentId: string;
  interactionType: InteractionType;
  durationSeconds?: number;
  completionPercentage?: number;
  rating?: number; // 1-5 stars
  bookmarked: boolean;
  createdAt: Date;
  user: User;
  content: Content;
}

export interface CreateContentInteractionInput {
  id: string;
  contentId: string;
  interactionType: InteractionType;
  durationSeconds?: number;
  completionPercentage?: number;
  rating?: number;
  bookmarked?: boolean;
}

export interface UpdateContentInteractionInput {
  id: string;
  interactionType?: InteractionType;
  durationSeconds?: number;
  completionPercentage?: number;
  rating?: number;
  bookmarked?: boolean;
}

// Content Similarity
export interface ContentSimilarity {
  id: string;
  contentIdA: string;
  contentIdB: string;
  similarityScore: number; // 0.0 to 1.0
  similarityType: SimilarityType;
  createdAt: Date;
  updatedAt: Date;
  contentA: Content;
  contentB: Content;
}

export interface CreateContentSimilarityInput {
  contentIdA: string;
  contentIdB: string;
  similarityScore: number;
  similarityType: SimilarityType;
}

export interface UpdateContentSimilarityInput {
  id: string;
  similarityScore?: number;
  similarityType?: SimilarityType;
}

// Recommendation
export interface Recommendation {
  id: string;
  userId: string;
  contentId: string;
  score: number; // Relevance score
  reason: RecommendationReason;
  status: RecommendationStatus;
  clickedAt?: Date;
  dismissedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  content: Content;
}

export interface CreateRecommendationInput {
  id: string;
  contentId: string;
  score: number;
  reason: RecommendationReason;
  status?: RecommendationStatus;
}

export interface UpdateRecommendationInput {
  id: string;
  score?: number;
  reason?: RecommendationReason;
  status?: RecommendationStatus;
  clickedAt?: Date;
  dismissedAt?: Date;
}

// User Interest
export interface UserInterest {
  id: string;
  userId: string;
  interestArea: string;
  confidence: number; // 0.0 to 1.0
  source: InterestSource;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface CreateUserInterestInput {
  id: string;
  interestArea: string;
  confidence: number;
  source: InterestSource;
}

export interface UpdateUserInterestInput {
  id: string;
  interestArea?: string;
  confidence?: number;
  source?: InterestSource;
}

// Recommendation Feedback
export interface RecommendationFeedback {
  id: string;
  userId: string;
  recommendationId: string;
  isRelevant?: boolean;
  feedbackText?: string;
  createdAt: Date;
  user: User;
  recommendation: Recommendation;
}

export interface CreateRecommendationFeedbackInput {
  id: string;
  recommendationId: string;
  isRelevant?: boolean;
  feedbackText?: string;
}

// Assessment Content Link
export interface AssessmentContentLink {
  id: string;
  assessmentResultId: string;
  contentId: string;
  relevanceScore: number; // 0.0 to 1.0
  linkType: string;
  createdAt: Date;
  assessmentResult: AssessmentResult;
  content: Content;
}

export interface CreateAssessmentContentLinkInput {
  assessmentResultId: string;
  contentId: string;
  relevanceScore: number;
  linkType: string;
}

export interface UpdateAssessmentContentLinkInput {
  id: string;
  relevanceScore?: number;
  linkType?: string;
}

// Recommendation Response with count
export interface RecommendationsResponse {
  recommendations: Recommendation[];
  count: number;
}

// Filter types for fetching recommendations
export interface RecommendationFilter {
  id?: string;
  status?: RecommendationStatus;
  reason?: RecommendationReason;
  minScore?: number;
  contentType?: string;
  categoryId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
}

// Aggregated analytics types
export interface UserInteractionStats {
  id: string;
  totalInteractions: number;
  contentTypeDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  averageRating: number;
  mostCommonInteraction: InteractionType;
}

export interface ContentPopularityStats {
  contentId: string;
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  bookmarkCount: number;
  shareCount: number;
  totalInteractions: number;
}

export interface RecommendationEffectivenessStats {
  reason: RecommendationReason;
  totalRecommendations: number;
  clickRate: number;
  dismissRate: number;
  averageRelevanceFeedback: number;
}