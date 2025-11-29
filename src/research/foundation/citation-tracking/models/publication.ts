/**
 * Publication model for the citation tracking system
 * 
 * This module defines the data structures for tracking academic publications
 * including research papers, books, datasets, software, and other research artifacts.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Publication types supported by the system
 */
export enum PublicationType {
  JOURNAL_ARTICLE = 'journal_article',
  CONFERENCE_PAPER = 'conference_paper',
  BOOK = 'book',
  BOOK_CHAPTER = 'book_chapter',
  THESIS = 'thesis',
  PREPRINT = 'preprint',
  TECHNICAL_REPORT = 'technical_report',
  DATASET = 'dataset',
  SOFTWARE = 'software',
  PATENT = 'patent',
  EDUCATIONAL_RESOURCE = 'educational_resource',
  POLICY_DOCUMENT = 'policy_document',
  WEB_CONTENT = 'web_content',
  OTHER = 'other'
}

/**
 * Publication status in the publication lifecycle
 */
export enum PublicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  PUBLISHED = 'published',
  RETRACTED = 'retracted',
  WITHDRAWN = 'withdrawn'
}

/**
 * Access type for the publication
 */
export enum AccessType {
  OPEN_ACCESS = 'open_access',
  SUBSCRIPTION = 'subscription',
  HYBRID = 'hybrid',
  EMBARGOED = 'embargoed',
  RESTRICTED = 'restricted'
}

/**
 * Author contribution types
 */
export enum ContributionType {
  FIRST_AUTHOR = 'first_author',
  CORRESPONDING_AUTHOR = 'corresponding_author',
  CO_AUTHOR = 'co_author',
  SUPERVISOR = 'supervisor',
  CONTRIBUTOR = 'contributor',
  EDITOR = 'editor',
  REVIEWER = 'reviewer'
}

/**
 * Author information with contribution details
 */
export interface PublicationAuthor {
  authorId: string;
  name: string;
  email?: string;
  orcidId?: string;
  affiliations: string[];
  contributionType: ContributionType;
  contributionStatement?: string;
  order: number;
}

/**
 * Funding information for the publication
 */
export interface FundingInfo {
  grantId?: string;
  funderName: string;
  funderIdentifier?: string;
  grantNumber?: string;
  fundingStatement: string;
}

/**
 * Journal or conference information
 */
export interface VenueInfo {
  name: string;
  publisher?: string;
  issn?: string;
  isbn?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  conferenceName?: string;
  conferenceLocation?: string;
  conferenceDate?: Date;
}

/**
 * Identifier information for the publication
 */
export interface PublicationIdentifier {
  type: 'doi' | 'arxiv' | 'pmid' | 'pmcid' | 'isbn' | 'issn' | 'url' | 'other';
  value: string;
  url?: string;
}

/**
 * Interface representing a publication in the system
 */
export interface IPublication {
  id: string;
  title: string;
  abstract?: string;
  keywords: string[];
  publicationType: PublicationType;
  status: PublicationStatus;
  authors: PublicationAuthor[];
  publicationDate?: Date;
  publicationYear?: number;
  venue?: VenueInfo;
  identifiers: PublicationIdentifier[];
  language: string;
  accessType: AccessType;
  license?: string;
  funding?: FundingInfo[];
  relatedPublications?: string[];
  citations?: string[];
  citationCount: number;
  downloads: number;
  views: number;
  datasets?: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

/**
 * Class representing a publication in the citation tracking system
 */
export class Publication implements IPublication {
  id: string;
  title: string;
  abstract?: string;
  keywords: string[];
  publicationType: PublicationType;
  status: PublicationStatus;
  authors: PublicationAuthor[];
  publicationDate?: Date;
  publicationYear?: number;
  venue?: VenueInfo;
  identifiers: PublicationIdentifier[];
  language: string;
  accessType: AccessType;
  license?: string;
  funding?: FundingInfo[];
  relatedPublications?: string[];
  citations?: string[];
  citationCount: number;
  downloads: number;
  views: number;
  datasets?: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;

  /**
   * Create a new publication instance
   * 
   * @param publication Publication data
   */
  constructor(publication: Partial<IPublication>) {
    this.id = publication.id || uuidv4();
    this.title = publication.title || '';
    this.abstract = publication.abstract;
    this.keywords = publication.keywords || [];
    this.publicationType = publication.publicationType || PublicationType.JOURNAL_ARTICLE;
    this.status = publication.status || PublicationStatus.PUBLISHED;
    this.authors = publication.authors || [];
    this.publicationDate = publication.publicationDate;
    this.publicationYear = publication.publicationYear || 
      (publication.publicationDate ? publication.publicationDate.getFullYear() : undefined);
    this.venue = publication.venue;
    this.identifiers = publication.identifiers || [];
    this.language = publication.language || 'en';
    this.accessType = publication.accessType || AccessType.OPEN_ACCESS;
    this.license = publication.license;
    this.funding = publication.funding;
    this.relatedPublications = publication.relatedPublications || [];
    this.citations = publication.citations || [];
    this.citationCount = publication.citationCount || 0;
    this.downloads = publication.downloads || 0;
    this.views = publication.views || 0;
    this.datasets = publication.datasets;
    this.createdAt = publication.createdAt || new Date();
    this.updatedAt = publication.updatedAt || new Date();
    this.metadata = publication.metadata || {};
  }

  /**
   * Add a new citation to the publication
   * 
   * @param citationId ID of the citation
   */
  addCitation(citationId: string): void {
    if (!this.citations) {
      this.citations = [];
    }
    
    if (!this.citations.includes(citationId)) {
      this.citations.push(citationId);
      this.citationCount++;
      this.updatedAt = new Date();
    }
  }

  /**
   * Add a related publication
   * 
   * @param publicationId ID of the related publication
   */
  addRelatedPublication(publicationId: string): void {
    if (!this.relatedPublications) {
      this.relatedPublications = [];
    }
    
    if (!this.relatedPublications.includes(publicationId)) {
      this.relatedPublications.push(publicationId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Increment the download count
   */
  incrementDownloads(): void {
    this.downloads++;
    this.updatedAt = new Date();
  }

  /**
   * Increment the view count
   */
  incrementViews(): void {
    this.views++;
    this.updatedAt = new Date();
  }

  /**
   * Get the DOI of the publication, if available
   */
  getDoi(): string | undefined {
    const doiIdentifier = this.identifiers.find(id => id.type === 'doi');
    return doiIdentifier?.value;
  }

  /**
   * Get the URL of the publication, if available
   */
  getUrl(): string | undefined {
    // First try to get a URL identifier
    const urlIdentifier = this.identifiers.find(id => id.type === 'url');
    if (urlIdentifier) {
      return urlIdentifier.value;
    }
    
    // Then try to get a DOI URL
    const doiIdentifier = this.identifiers.find(id => id.type === 'doi');
    if (doiIdentifier && doiIdentifier.url) {
      return doiIdentifier.url;
    } else if (doiIdentifier) {
      return `https://doi.org/${doiIdentifier.value}`;
    }
    
    return undefined;
  }
}

/**
 * Type for creating a new publication
 */
export type CreatePublicationInput = Omit<IPublication, 'id' | 'createdAt' | 'updatedAt' | 'citationCount' | 'downloads' | 'views'> & {
  id?: string;
};

/**
 * Type for updating an existing publication
 */
export type UpdatePublicationInput = Partial<Omit<IPublication, 'id' | 'createdAt' | 'updatedAt'>>;