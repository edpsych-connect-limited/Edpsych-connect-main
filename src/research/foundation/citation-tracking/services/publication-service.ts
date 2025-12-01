/**
 * Publication Service
 * 
 * This service provides functionality for managing academic publications
 * including creating, updating, searching, and analyzing publications.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  Publication, 
  CreatePublicationInput,
  UpdatePublicationInput,
  PublicationType,
  PublicationStatus,
  AccessType,
  PublicationIdentifier
} from '../models/publication';

/**
 * Service response type for publication operations
 */
export interface PublicationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Publication search parameters
 */
export interface PublicationSearchParams {
  title?: string;
  authors?: string[];
  keywords?: string[];
  publicationType?: PublicationType;
  status?: PublicationStatus;
  publishedAfter?: Date;
  publishedBefore?: Date;
  accessType?: AccessType;
  minCitations?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Publication impact metrics
 */
export interface PublicationImpactMetrics {
  citationCount: number;
  downloadCount: number;
  viewCount: number;
  altmetricScore?: number;
  fieldWeightedCitationImpact?: number;
  percentileInField?: number;
  socialMediaMentions?: number;
  newsMediaMentions?: number;
}

/**
 * Service for managing academic publications
 */
export class PublicationService {
  private publications: Map<string, Publication>;
  private publicationsByIdentifier: Map<string, string>; // identifier value -> publication ID
  private authorPublications: Map<string, Set<string>>; // author ID -> publication IDs
  
  /**
   * Create a new Publication Service instance
   */
  constructor() {
    this.publications = new Map<string, Publication>();
    this.publicationsByIdentifier = new Map<string, string>();
    this.authorPublications = new Map<string, Set<string>>();
  }

  /**
   * Create a new publication
   * 
   * @param publicationData Publication data
   * @returns Response with the created publication
   */
  async createPublication(publicationData: CreatePublicationInput): Promise<PublicationResponse<Publication>> {
    try {
      // Generate ID if not provided
      const id = publicationData.id || uuidv4();
      
      // Check if publication already exists
      if (this.publications.has(id)) {
        return {
          success: false,
          error: 'Publication with this ID already exists',
          code: 'DUPLICATE_PUBLICATION'
        };
      }
      
      // Check for duplicate DOI or other identifiers
      if (publicationData.identifiers) {
        for (const identifier of publicationData.identifiers) {
          const existingId = this.publicationsByIdentifier.get(identifier.value);
          if (existingId) {
            return {
              success: false,
              error: `Publication with ${identifier.type} ${identifier.value} already exists`,
              code: 'DUPLICATE_IDENTIFIER'
            };
          }
        }
      }
      
      // Create new publication
      const publication = new Publication({
        ...publicationData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Store publication
      this.publications.set(publication.id, publication);
      
      // Index by identifiers
      if (publication.identifiers) {
        for (const identifier of publication.identifiers) {
          this.publicationsByIdentifier.set(identifier.value, publication.id);
        }
      }
      
      // Index by authors
      if (publication.authors) {
        for (const author of publication.authors) {
          this.addAuthorPublication(author.authorId, publication.id);
        }
      }
      
      return {
        success: true,
        data: publication
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'PUBLICATION_CREATION_FAILED'
      };
    }
  }

  /**
   * Get a publication by ID
   * 
   * @param id Publication ID
   * @returns Response with the publication if found
   */
  async getPublication(id: string): Promise<PublicationResponse<Publication>> {
    const publication = this.publications.get(id);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    return {
      success: true,
      data: publication
    };
  }

  /**
   * Get a publication by identifier (DOI, PMID, etc.)
   * 
   * @param type Identifier type
   * @param value Identifier value
   * @returns Response with the publication if found
   */
  async getPublicationByIdentifier(
    type: string,
    value: string
  ): Promise<PublicationResponse<Publication>> {
    const publicationId = this.publicationsByIdentifier.get(value);
    
    if (!publicationId) {
      return {
        success: false,
        error: `Publication with ${type} ${value} not found`,
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    return this.getPublication(publicationId);
  }

  /**
   * Update an existing publication
   * 
   * @param id Publication ID
   * @param updateData Update data
   * @returns Response with the updated publication
   */
  async updatePublication(id: string, updateData: UpdatePublicationInput): Promise<PublicationResponse<Publication>> {
    const publication = this.publications.get(id);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    try {
      // Remove old identifier indexes
      if (publication.identifiers) {
        for (const identifier of publication.identifiers) {
          this.publicationsByIdentifier.delete(identifier.value);
        }
      }
      
      // Remove old author indexes
      if (publication.authors) {
        for (const author of publication.authors) {
          this.removeAuthorPublication(author.authorId, publication.id);
        }
      }
      
      // Update fields
      Object.assign(publication, {
        ...updateData,
        updatedAt: new Date()
      });
      
      // Store updated publication
      this.publications.set(id, publication);
      
      // Update identifier indexes
      if (publication.identifiers) {
        for (const identifier of publication.identifiers) {
          this.publicationsByIdentifier.set(identifier.value, publication.id);
        }
      }
      
      // Update author indexes
      if (publication.authors) {
        for (const author of publication.authors) {
          this.addAuthorPublication(author.authorId, publication.id);
        }
      }
      
      return {
        success: true,
        data: publication
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'PUBLICATION_UPDATE_FAILED'
      };
    }
  }

  /**
   * Delete a publication
   * 
   * @param id Publication ID
   * @returns Response indicating success or failure
   */
  async deletePublication(id: string): Promise<PublicationResponse> {
    const publication = this.publications.get(id);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    try {
      // Remove identifier indexes
      if (publication.identifiers) {
        for (const identifier of publication.identifiers) {
          this.publicationsByIdentifier.delete(identifier.value);
        }
      }
      
      // Remove author indexes
      if (publication.authors) {
        for (const author of publication.authors) {
          this.removeAuthorPublication(author.authorId, publication.id);
        }
      }
      
      // Remove publication
      this.publications.delete(id);
      
      return {
        success: true
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'PUBLICATION_DELETION_FAILED'
      };
    }
  }

  /**
   * Search for publications based on criteria
   * 
   * @param params Search parameters
   * @returns Response with matching publications
   */
  async searchPublications(params: PublicationSearchParams): Promise<PublicationResponse<{
    publications: Publication[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      // Default values
      const page = params.page || 1;
      const limit = params.limit || 50;
      const sortBy = params.sortBy || 'publicationDate';
      const sortDirection = params.sortDirection || 'desc';
      
      // Filter publications
      let filteredPublications = Array.from(this.publications.values()).filter(publication => {
        // Title search
        if (params.title && !publication.title.toLowerCase().includes(params.title.toLowerCase())) {
          return false;
        }
        
        // Authors search
        if (params.authors && params.authors.length > 0) {
          const publicationAuthorIds = publication.authors.map(author => author.authorId);
          if (!params.authors.some(authorId => publicationAuthorIds.includes(authorId))) {
            return false;
          }
        }
        
        // Keywords search
        if (params.keywords && params.keywords.length > 0) {
          if (!params.keywords.some(keyword => 
            publication.keywords.map(k => k.toLowerCase()).includes(keyword.toLowerCase()))) {
            return false;
          }
        }
        
        // Publication type
        if (params.publicationType && publication.publicationType !== params.publicationType) {
          return false;
        }
        
        // Status
        if (params.status && publication.status !== params.status) {
          return false;
        }
        
        // Publication date range
        if (params.publishedAfter && publication.publicationDate && 
            publication.publicationDate < params.publishedAfter) {
          return false;
        }
        
        if (params.publishedBefore && publication.publicationDate && 
            publication.publicationDate > params.publishedBefore) {
          return false;
        }
        
        // Access type
        if (params.accessType && publication.accessType !== params.accessType) {
          return false;
        }
        
        // Citation count
        if (params.minCitations !== undefined && publication.citationCount < params.minCitations) {
          return false;
        }
        
        return true;
      });
      
      // Sort publications
      filteredPublications.sort((a, b) => {
        let aValue: any = (a as any)[sortBy];
        let bValue: any = (b as any)[sortBy];
        
        // Handle special cases
        if (sortBy === 'publicationDate') {
          aValue = aValue || new Date(0); // Handle undefined dates
          bValue = bValue || new Date(0);
        } else if (sortBy === 'publicationYear') {
          aValue = aValue || 0; // Handle undefined years
          bValue = bValue || 0;
        }
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Paginate
      const total = filteredPublications.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      filteredPublications = filteredPublications.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          publications: filteredPublications,
          total,
          page,
          limit
        }
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'PUBLICATION_SEARCH_FAILED'
      };
    }
  }

  /**
   * Get publications by author
   * 
   * @param authorId Author ID
   * @returns Response with author's publications
   */
  async getAuthorPublications(authorId: string): Promise<PublicationResponse<Publication[]>> {
    try {
      const publicationIds = this.authorPublications.get(authorId) || new Set<string>();
      const publications = Array.from(publicationIds)
        .map(id => this.publications.get(id))
        .filter(Boolean) as Publication[];
      
      return {
        success: true,
        data: publications
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'AUTHOR_PUBLICATIONS_FAILED'
      };
    }
  }

  /**
   * Add a new identifier to a publication
   * 
   * @param publicationId Publication ID
   * @param identifier Identifier to add
   * @returns Response with the updated publication
   */
  async addPublicationIdentifier(
    publicationId: string,
    identifier: PublicationIdentifier
  ): Promise<PublicationResponse<Publication>> {
    const publication = this.publications.get(publicationId);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    try {
      // Check if identifier already exists
      const existingId = this.publicationsByIdentifier.get(identifier.value);
      if (existingId && existingId !== publicationId) {
        return {
          success: false,
          error: `Publication with ${identifier.type} ${identifier.value} already exists`,
          code: 'DUPLICATE_IDENTIFIER'
        };
      }
      
      // Add identifier
      if (!publication.identifiers) {
        publication.identifiers = [];
      }
      
      // Remove existing identifier of the same type if requested
      const existingIndex = publication.identifiers.findIndex(id => id.type === identifier.type);
      if (existingIndex >= 0) {
        // Remove old identifier from index
        this.publicationsByIdentifier.delete(publication.identifiers[existingIndex].value);
        // Replace with new identifier
        publication.identifiers[existingIndex] = identifier;
      } else {
        // Add new identifier
        publication.identifiers.push(identifier);
      }
      
      // Update index
      this.publicationsByIdentifier.set(identifier.value, publicationId);
      
      // Update publication
      publication.updatedAt = new Date();
      this.publications.set(publicationId, publication);
      
      return {
        success: true,
        data: publication
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'IDENTIFIER_ADDITION_FAILED'
      };
    }
  }

  /**
   * Increment publication citation count
   * 
   * @param publicationId Publication ID
   * @returns Response with updated citation count
   */
  async incrementCitationCount(publicationId: string): Promise<PublicationResponse<number>> {
    const publication = this.publications.get(publicationId);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    try {
      // Increment citation count
      publication.citationCount++;
      publication.updatedAt = new Date();
      
      // Update publication
      this.publications.set(publicationId, publication);
      
      return {
        success: true,
        data: publication.citationCount
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'CITATION_INCREMENT_FAILED'
      };
    }
  }

  /**
   * Track a publication download
   * 
   * @param publicationId Publication ID
   * @returns Response with updated download count
   */
  async trackDownload(publicationId: string): Promise<PublicationResponse<number>> {
    const publication = this.publications.get(publicationId);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    try {
      // Increment download count
      publication.incrementDownloads();
      
      // Update publication
      this.publications.set(publicationId, publication);
      
      return {
        success: true,
        data: publication.downloads
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'DOWNLOAD_TRACKING_FAILED'
      };
    }
  }

  /**
   * Track a publication view
   * 
   * @param publicationId Publication ID
   * @returns Response with updated view count
   */
  async trackView(publicationId: string): Promise<PublicationResponse<number>> {
    const publication = this.publications.get(publicationId);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    try {
      // Increment view count
      publication.incrementViews();
      
      // Update publication
      this.publications.set(publicationId, publication);
      
      return {
        success: true,
        data: publication.views
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'VIEW_TRACKING_FAILED'
      };
    }
  }

  /**
   * Get impact metrics for a publication
   * 
   * @param publicationId Publication ID
   * @returns Response with publication impact metrics
   */
  async getPublicationImpactMetrics(publicationId: string): Promise<PublicationResponse<PublicationImpactMetrics>> {
    const publication = this.publications.get(publicationId);
    
    if (!publication) {
      return {
        success: false,
        error: 'Publication not found',
        code: 'PUBLICATION_NOT_FOUND'
      };
    }
    
    try {
      // Basic metrics from publication
      const metrics: PublicationImpactMetrics = {
        citationCount: publication.citationCount,
        downloadCount: publication.downloads,
        viewCount: publication.views,
        
        // Mock advanced metrics
        altmetricScore: Math.floor(Math.random() * 100),
        fieldWeightedCitationImpact: 1.2 + Math.random(),
        percentileInField: Math.floor(Math.random() * 100),
        socialMediaMentions: Math.floor(Math.random() * 200),
        newsMediaMentions: Math.floor(Math.random() * 10)
      };
      
      return {
        success: true,
        data: metrics
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'METRICS_RETRIEVAL_FAILED'
      };
    }
  }

  /**
   * Get publication statistics
   * 
   * @returns Response with publication statistics
   */
  async getPublicationStatistics(): Promise<PublicationResponse<{
    totalPublications: number;
    publicationsByType: Record<PublicationType, number>;
    publicationsByStatus: Record<PublicationStatus, number>;
    publicationsByAccessType: Record<AccessType, number>;
    publicationsByYear: Record<number, number>;
  }>> {
    try {
      const publicationsList = Array.from(this.publications.values());
      
      // Count total publications
      const totalPublications = publicationsList.length;
      
      // Count publications by type
      const publicationsByType = publicationsList.reduce((counts, publication) => {
        counts[publication.publicationType] = (counts[publication.publicationType] || 0) + 1;
        return counts;
      }, {} as Record<PublicationType, number>);
      
      // Count publications by status
      const publicationsByStatus = publicationsList.reduce((counts, publication) => {
        counts[publication.status] = (counts[publication.status] || 0) + 1;
        return counts;
      }, {} as Record<PublicationStatus, number>);
      
      // Count publications by access type
      const publicationsByAccessType = publicationsList.reduce((counts, publication) => {
        counts[publication.accessType] = (counts[publication.accessType] || 0) + 1;
        return counts;
      }, {} as Record<AccessType, number>);
      
      // Count publications by year
      const publicationsByYear = publicationsList.reduce((counts, publication) => {
        if (publication.publicationYear) {
          counts[publication.publicationYear] = (counts[publication.publicationYear] || 0) + 1;
        }
        return counts;
      }, {} as Record<number, number>);
      
      return {
        success: true,
        data: {
          totalPublications,
          publicationsByType,
          publicationsByStatus,
          publicationsByAccessType,
          publicationsByYear
        }
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'PUBLICATION_STATISTICS_FAILED'
      };
    }
  }

  /**
   * Export publications to a specified format
   * 
   * @param publicationIds Array of publication IDs to export
   * @param format Export format
   * @returns Response with exported data
   */
  async exportPublications(
    publicationIds: string[],
    format: 'json' | 'bibtex' | 'csv' | 'ris'
  ): Promise<PublicationResponse<{
    format: string;
    data: string;
  }>> {
    try {
      const publications = publicationIds
        .map(id => this.publications.get(id))
        .filter(Boolean) as Publication[];
      
      let data = '';
      
      switch (format) {
        case 'json':
          data = JSON.stringify(publications, null, 2);
          break;
        case 'bibtex':
          // Generate BibTeX format
          data = publications.map(publication => {
            const doi = publication.getDoi();
            const pubYear = publication.publicationYear || 
              (publication.publicationDate ? publication.publicationDate.getFullYear() : undefined);
            
            const authors = publication.authors
              .map(author => author.name)
              .join(' and ');
            
            return `@${this.getBibTeXEntryType(publication.publicationType)}{${doi || publication.id},\n` +
              `  title = {${publication.title}},\n` +
              `  author = {${authors}},\n` +
              (pubYear ? `  year = {${pubYear}},\n` : '') +
              (publication.venue?.name ? `  journal = {${publication.venue.name}},\n` : '') +
              (publication.venue?.volume ? `  volume = {${publication.venue.volume}},\n` : '') +
              (publication.venue?.issue ? `  number = {${publication.venue.issue}},\n` : '') +
              (publication.venue?.pages ? `  pages = {${publication.venue.pages}},\n` : '') +
              (doi ? `  doi = {${doi}},\n` : '') +
              `}`;
          }).join('\n\n');
          break;
        case 'csv':
          // Generate CSV format
          data = 'id,title,authors,year,venue,doi\n' +
            publications.map(publication => {
              const doi = publication.getDoi() || '';
              const authors = publication.authors
                .map(author => author.name)
                .join('; ');
              const year = publication.publicationYear || '';
              const venue = publication.venue?.name || '';
              
              return `"${publication.id}","${publication.title.replace(/"/g, '""')}","${authors.replace(/"/g, '""')}","${year}","${venue.replace(/"/g, '""')}","${doi}"`;
            }).join('\n');
          break;
        case 'ris':
          // Generate RIS format
          data = publications.map(publication => {
            const doi = publication.getDoi();
            const pubYear = publication.publicationYear || 
              (publication.publicationDate ? publication.publicationDate.getFullYear() : undefined);
            
            let risType = 'JOUR'; // Default to journal article
            switch (publication.publicationType) {
              case PublicationType.BOOK:
                risType = 'BOOK';
                break;
              case PublicationType.BOOK_CHAPTER:
                risType = 'CHAP';
                break;
              case PublicationType.CONFERENCE_PAPER:
                risType = 'CONF';
                break;
              case PublicationType.THESIS:
                risType = 'THES';
                break;
              case PublicationType.PATENT:
                risType = 'PAT';
                break;
            }
            
            let ris = `TY  - ${risType}\n`;
            ris += `ID  - ${publication.id}\n`;
            ris += `T1  - ${publication.title}\n`;
            
            // Add authors
            for (const author of publication.authors) {
              ris += `AU  - ${author.name}\n`;
            }
            
            if (pubYear) {
              ris += `PY  - ${pubYear}\n`;
            }
            
            if (publication.venue?.name) {
              ris += `JO  - ${publication.venue.name}\n`;
            }
            
            if (publication.venue?.volume) {
              ris += `VL  - ${publication.venue.volume}\n`;
            }
            
            if (publication.venue?.issue) {
              ris += `IS  - ${publication.venue.issue}\n`;
            }
            
            if (publication.venue?.pages) {
              ris += `SP  - ${publication.venue.pages.split('-')[0]}\n`;
              const endPage = publication.venue.pages.split('-')[1];
              if (endPage) {
                ris += `EP  - ${endPage}\n`;
              }
            }
            
            if (doi) {
              ris += `DO  - ${doi}\n`;
            }
            
            ris += `ER  - \n`;
            return ris;
          }).join('\n');
          break;
        default:
          return {
            success: false,
            error: `Unsupported export format: ${format}`,
            code: 'UNSUPPORTED_EXPORT_FORMAT'
          };
      }
      
      return {
        success: true,
        data: {
          format,
          data
        }
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown _error occurred',
        code: 'PUBLICATION_EXPORT_FAILED'
      };
    }
  }

  // Private helper methods

  /**
   * Add publication ID to an author's publication set
   * 
   * @param authorId Author ID
   * @param publicationId Publication ID
   */
  private addAuthorPublication(authorId: string, publicationId: string): void {
    let publicationSet = this.authorPublications.get(authorId);
    
    if (!publicationSet) {
      publicationSet = new Set<string>();
      this.authorPublications.set(authorId, publicationSet);
    }
    
    publicationSet.add(publicationId);
  }

  /**
   * Remove publication ID from an author's publication set
   * 
   * @param authorId Author ID
   * @param publicationId Publication ID
   */
  private removeAuthorPublication(authorId: string, publicationId: string): void {
    const publicationSet = this.authorPublications.get(authorId);
    
    if (publicationSet) {
      publicationSet.delete(publicationId);
      
      if (publicationSet.size === 0) {
        this.authorPublications.delete(authorId);
      }
    }
  }

  /**
   * Get BibTeX entry type for publication type
   * 
   * @param publicationType Publication type
   * @returns BibTeX entry type
   */
  private getBibTeXEntryType(publicationType: PublicationType): string {
    switch (publicationType) {
      case PublicationType.JOURNAL_ARTICLE:
        return 'article';
      case PublicationType.BOOK:
        return 'book';
      case PublicationType.BOOK_CHAPTER:
        return 'inbook';
      case PublicationType.CONFERENCE_PAPER:
        return 'inproceedings';
      case PublicationType.THESIS:
        return 'phdthesis';
      case PublicationType.TECHNICAL_REPORT:
        return 'techreport';
      case PublicationType.PREPRINT:
        return 'unpublished';
      default:
        return 'misc';
    }
  }
}
