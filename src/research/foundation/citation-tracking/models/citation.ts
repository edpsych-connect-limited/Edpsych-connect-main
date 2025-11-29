/**
 * Citation model for the citation tracking system
 * 
 * This module defines the data structures for tracking citations between
 * academic publications and other research artifacts.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Types of citations in academic works
 */
export enum CitationType {
  IN_TEXT = 'in_text',
  BIBLIOGRAPHY = 'bibliography',
  FOOTNOTE = 'footnote',
  ENDNOTE = 'endnote',
  DATA_CITATION = 'data_citation',
  CODE_CITATION = 'code_citation',
  METHODOLOGY_CITATION = 'methodology_citation',
  SELF_CITATION = 'self_citation',
  REVIEW_CITATION = 'review_citation'
}

/**
 * Citation contexts categorized by semantic purpose
 */
export enum CitationContext {
  BACKGROUND = 'background',
  METHODOLOGY = 'methodology',
  RESULTS = 'results',
  DISCUSSION = 'discussion',
  CRITIQUE = 'critique',
  SUPPORT = 'support',
  EXTENSION = 'extension',
  COMPARISON = 'comparison',
  APPLICATION = 'application',
  FUTURE_WORK = 'future_work'
}

/**
 * Sentiment of the citation towards the cited work
 */
export enum CitationSentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  MIXED = 'mixed'
}

/**
 * Position of the citation within the source publication
 */
export interface CitationPosition {
  section?: string;
  page?: number;
  paragraph?: number;
  sentence?: number;
  characterStart?: number;
  characterEnd?: number;
}

/**
 * Semantic information about the citation
 */
export interface CitationSemantics {
  context: CitationContext;
  sentiment: CitationSentiment;
  importance: number; // 1-10 scale of citation importance
  explicitness: number; // 1-10 scale of how explicitly the citation discusses the source
  centrality: number; // 1-10 scale of how central the citation is to the argument
}

/**
 * Interface representing a citation in the system
 */
export interface ICitation {
  id: string;
  sourcePublicationId: string;
  targetPublicationId: string;
  citationType: CitationType;
  citationText: string;
  position: CitationPosition;
  semantics?: CitationSemantics;
  verified: boolean;
  detectedBy: 'manual' | 'automated' | 'api' | 'imported';
  detectedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

/**
 * Class representing a citation in the citation tracking system
 */
export class Citation implements ICitation {
  id: string;
  sourcePublicationId: string;
  targetPublicationId: string;
  citationType: CitationType;
  citationText: string;
  position: CitationPosition;
  semantics?: CitationSemantics;
  verified: boolean;
  detectedBy: 'manual' | 'automated' | 'api' | 'imported';
  detectedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;

  /**
   * Create a new citation instance
   * 
   * @param citation Citation data
   */
  constructor(citation: Partial<ICitation>) {
    this.id = citation.id || uuidv4();
    
    // Required fields
    if (!citation.sourcePublicationId) {
      throw new Error('Source publication ID is required');
    }
    this.sourcePublicationId = citation.sourcePublicationId;
    
    if (!citation.targetPublicationId) {
      throw new Error('Target publication ID is required');
    }
    this.targetPublicationId = citation.targetPublicationId;
    
    this.citationType = citation.citationType || CitationType.IN_TEXT;
    this.citationText = citation.citationText || '';
    this.position = citation.position || {};
    this.semantics = citation.semantics;
    this.verified = citation.verified !== undefined ? citation.verified : false;
    this.detectedBy = citation.detectedBy || 'manual';
    this.detectedAt = citation.detectedAt || new Date();
    this.verifiedAt = citation.verifiedAt;
    this.verifiedBy = citation.verifiedBy;
    this.createdAt = citation.createdAt || new Date();
    this.updatedAt = citation.updatedAt || new Date();
    this.metadata = citation.metadata || {};
  }

  /**
   * Mark the citation as verified
   * 
   * @param verifiedBy ID of the user or system that verified the citation
   */
  verify(verifiedBy: string): void {
    this.verified = true;
    this.verifiedAt = new Date();
    this.verifiedBy = verifiedBy;
    this.updatedAt = new Date();
  }

  /**
   * Update the semantic information for this citation
   * 
   * @param semantics Updated semantic information
   */
  updateSemantics(semantics: CitationSemantics): void {
    this.semantics = semantics;
    this.updatedAt = new Date();
  }

  /**
   * Check if this is a self-citation (same author in source and target)
   * 
   * @param authorId Author ID to check
   */
  isSelfCitation(authorId: string): boolean {
    return this.citationType === CitationType.SELF_CITATION || 
      (this.metadata?.sourceAuthors?.includes(authorId) && 
       this.metadata?.targetAuthors?.includes(authorId));
  }

  /**
   * Calculate the semantic significance of this citation based on context and metrics
   */
  calculateSignificance(): number {
    if (!this.semantics) {
      return 0;
    }

    // Weight factors for different aspects of significance
    const weights = {
      importance: 0.4,
      explicitness: 0.3,
      centrality: 0.3
    };

    // Calculate weighted score
    const score = 
      (this.semantics.importance * weights.importance) +
      (this.semantics.explicitness * weights.explicitness) +
      (this.semantics.centrality * weights.centrality);

    // Normalize to 0-10 scale
    return Math.min(10, Math.max(0, score));
  }
}

/**
 * Type for creating a new citation
 */
export type CreateCitationInput = Omit<ICitation, 'id' | 'verified' | 'detectedAt' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  verified?: boolean;
};

/**
 * Type for updating an existing citation
 */
export type UpdateCitationInput = Partial<Omit<ICitation, 'id' | 'createdAt' | 'updatedAt'>>;