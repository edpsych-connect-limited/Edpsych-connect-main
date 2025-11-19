/**
 * Researcher model for the citation tracking system
 * 
 * This module defines the data structures for tracking researchers, 
 * their publications, and academic impact metrics.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Researcher role in the academic ecosystem
 */
export enum ResearcherRole {
  FACULTY = 'faculty',
  POSTDOC = 'postdoc',
  GRADUATE_STUDENT = 'graduate_student',
  UNDERGRADUATE_STUDENT = 'undergraduate_student',
  RESEARCH_SCIENTIST = 'research_scientist',
  INDEPENDENT_RESEARCHER = 'independent_researcher',
  INDUSTRY_RESEARCHER = 'industry_researcher',
  EMERITUS = 'emeritus',
  VISITING_SCHOLAR = 'visiting_scholar',
  ADMINISTRATOR = 'administrator',
  LIBRARIAN = 'librarian',
  OTHER = 'other'
}

/**
 * Academic rank for faculty members
 */
export enum AcademicRank {
  PROFESSOR = 'professor',
  ASSOCIATE_PROFESSOR = 'associate_professor',
  ASSISTANT_PROFESSOR = 'assistant_professor',
  DISTINGUISHED_PROFESSOR = 'distinguished_professor',
  ADJUNCT_PROFESSOR = 'adjunct_professor',
  LECTURER = 'lecturer',
  INSTRUCTOR = 'instructor',
  TEACHING_ASSISTANT = 'teaching_assistant',
  RESEARCH_ASSISTANT = 'research_assistant',
  RESEARCH_ASSOCIATE = 'research_associate'
}

/**
 * Researcher identifier in various systems
 */
export interface ResearcherIdentifier {
  type: 'orcid' | 'scopus' | 'researcher_id' | 'google_scholar' | 'edpsych_id' | 'other';
  value: string;
  url?: string;
}

/**
 * Institutional affiliation information
 */
export interface AffiliationInfo {
  id?: string;
  institutionName: string;
  departmentName?: string;
  role?: ResearcherRole;
  rank?: AcademicRank;
  startDate?: Date;
  endDate?: Date;
  isCurrent: boolean;
}

/**
 * Academic impact metrics for a researcher
 */
export interface ImpactMetrics {
  // Basic citation metrics
  publicationCount: number;
  citationCount: number;
  hIndex: number;
  i10Index: number;
  gIndex?: number;
  
  // Advanced metrics
  mIndex?: number; // h-index divided by years since first publication
  contemporaryHIndex?: number; // h-index weighted toward recent citations
  eigenfactor?: number; // weighted by importance of citing sources
  
  // Field-normalized metrics
  fieldNormalizedCitationImpact?: number;
  percentilesByField?: Record<string, number>;
  
  // Altmetrics
  altmetricScore?: number;
  socialMediaMentions?: number;
  newsMediaMentions?: number;
  policyDocumentCitations?: number;
  
  // Collaboration metrics
  collaborationIndex?: number;
  internationalCollaborationRatio?: number;
  
  // Last updated timestamp
  lastUpdated: Date;
}

/**
 * Interface representing a researcher in the system
 */
export interface IResearcher {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  profileUrl?: string;
  biography?: string;
  identifiers: ResearcherIdentifier[];
  affiliations: AffiliationInfo[];
  researchInterests: string[];
  publicationIds: string[];
  impactMetrics: ImpactMetrics;
  academicAge?: number; // Years since first publication
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

/**
 * Class representing a researcher in the citation tracking system
 */
export class Researcher implements IResearcher {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  profileUrl?: string;
  biography?: string;
  identifiers: ResearcherIdentifier[];
  affiliations: AffiliationInfo[];
  researchInterests: string[];
  publicationIds: string[];
  impactMetrics: ImpactMetrics;
  academicAge?: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;

  /**
   * Create a new researcher instance
   * 
   * @param researcher Researcher data
   */
  constructor(researcher: Partial<IResearcher>) {
    this.id = researcher.id || uuidv4();
    
    // Required fields
    if (!researcher.firstName || !researcher.lastName) {
      throw new Error('First name and last name are required');
    }
    this.firstName = researcher.firstName;
    this.lastName = researcher.lastName;
    this.name = researcher.name || `${this.firstName} ${this.lastName}`;
    
    // Optional fields
    this.middleName = researcher.middleName;
    this.email = researcher.email;
    this.profileUrl = researcher.profileUrl;
    this.biography = researcher.biography;
    this.identifiers = researcher.identifiers || [];
    this.affiliations = researcher.affiliations || [];
    this.researchInterests = researcher.researchInterests || [];
    this.publicationIds = researcher.publicationIds || [];
    this.academicAge = researcher.academicAge;
    
    // Impact metrics with defaults
    this.impactMetrics = researcher.impactMetrics || {
      publicationCount: 0,
      citationCount: 0,
      hIndex: 0,
      i10Index: 0,
      lastUpdated: new Date()
    };
    
    this.createdAt = researcher.createdAt || new Date();
    this.updatedAt = researcher.updatedAt || new Date();
    this.metadata = researcher.metadata || {};
  }

  /**
   * Get the researcher's primary ORCID identifier, if available
   */
  getOrcid(): string | undefined {
    const orcidIdentifier = this.identifiers.find(id => id.type === 'orcid');
    return orcidIdentifier?.value;
  }

  /**
   * Get the researcher's current affiliations
   */
  getCurrentAffiliations(): AffiliationInfo[] {
    return this.affiliations.filter(affiliation => affiliation.isCurrent);
  }

  /**
   * Add a new publication to the researcher's profile
   * 
   * @param publicationId ID of the publication
   */
  addPublication(publicationId: string): void {
    if (!this.publicationIds.includes(publicationId)) {
      this.publicationIds.push(publicationId);
      this.impactMetrics.publicationCount = this.publicationIds.length;
      this.impactMetrics.lastUpdated = new Date();
      this.updatedAt = new Date();
    }
  }

  /**
   * Update the researcher's impact metrics
   * 
   * @param metrics Updated impact metrics
   */
  updateImpactMetrics(metrics: Partial<ImpactMetrics>): void {
    this.impactMetrics = {
      ...this.impactMetrics,
      ...metrics,
      lastUpdated: new Date()
    };
    this.updatedAt = new Date();
  }

  /**
   * Calculate the h-index for the researcher based on citation counts
   * 
   * @param publicationCitationCounts Array of citation counts for each publication
   */
  calculateHIndex(publicationCitationCounts: number[]): number {
    // Sort citation counts in descending order
    const sortedCounts = [...publicationCitationCounts].sort((a, b) => b - a);
    
    // Find the largest value of h where h publications have at least h citations
    let hIndex = 0;
    for (let i = 0; i < sortedCounts.length; i++) {
      if (sortedCounts[i] >= i + 1) {
        hIndex = i + 1;
      } else {
        break;
      }
    }
    
    // Update the h-index in the metrics
    this.impactMetrics.hIndex = hIndex;
    this.impactMetrics.lastUpdated = new Date();
    this.updatedAt = new Date();
    
    return hIndex;
  }

  /**
   * Calculate the i10-index for the researcher based on citation counts
   * 
   * @param publicationCitationCounts Array of citation counts for each publication
   */
  calculateI10Index(publicationCitationCounts: number[]): number {
    // Count publications with at least 10 citations
    const i10Count = publicationCitationCounts.filter(count => count >= 10).length;
    
    // Update the i10-index in the metrics
    this.impactMetrics.i10Index = i10Count;
    this.impactMetrics.lastUpdated = new Date();
    this.updatedAt = new Date();
    
    return i10Count;
  }

  /**
   * Calculate the g-index for the researcher based on citation counts
   * 
   * @param publicationCitationCounts Array of citation counts for each publication
   */
  calculateGIndex(publicationCitationCounts: number[]): number {
    // Sort citation counts in descending order
    const sortedCounts = [...publicationCitationCounts].sort((a, b) => b - a);
    
    let sumCitations = 0;
    let gIndex = 0;
    
    for (let i = 0; i < sortedCounts.length; i++) {
      sumCitations += sortedCounts[i];
      // g-index is the largest number where the top g articles have at least g² citations
      if (sumCitations >= Math.pow(i + 1, 2)) {
        gIndex = i + 1;
      } else {
        break;
      }
    }
    
    // Update the g-index in the metrics
    this.impactMetrics.gIndex = gIndex;
    this.impactMetrics.lastUpdated = new Date();
    this.updatedAt = new Date();
    
    return gIndex;
  }

  /**
   * Calculate field-normalized citation impact
   * 
   * @param fieldAverageCitations Average citations for the researcher's field
   * @param researcherCitations Total citations for the researcher
   */
  calculateFieldNormalizedImpact(fieldAverageCitations: number, researcherCitations: number): number {
    if (fieldAverageCitations === 0) {
      return 0;
    }
    
    const impact = researcherCitations / fieldAverageCitations;
    
    // Update the field-normalized impact in the metrics
    this.impactMetrics.fieldNormalizedCitationImpact = impact;
    this.impactMetrics.lastUpdated = new Date();
    this.updatedAt = new Date();
    
    return impact;
  }
}

/**
 * Type for creating a new researcher
 */
export type CreateResearcherInput = Omit<IResearcher, 'id' | 'name' | 'createdAt' | 'updatedAt' | 'impactMetrics'> & {
  id?: string;
  name?: string;
  impactMetrics?: Partial<ImpactMetrics>;
};

/**
 * Type for updating an existing researcher
 */
export type UpdateResearcherInput = Partial<Omit<IResearcher, 'id' | 'createdAt' | 'updatedAt'>>;