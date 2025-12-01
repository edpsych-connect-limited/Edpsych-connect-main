/**
 * Citation Tracking Controller
 * 
 * This controller provides RESTful API endpoints for the citation tracking system,
 * allowing clients to manage citations, publications, researchers, and impact metrics.
 */

import express, { Request, Response, Router } from 'express';
import { CitationTrackingService } from '../services/citation-tracking-service';
import { PublicationService } from '../services/publication-service';
import { ImpactMetricsService } from '../services/impact-metrics-service';
import { CreateCitationInput, UpdateCitationInput, CitationType } from '../models/citation';
import { CreatePublicationInput, UpdatePublicationInput } from '../models/publication';
import { MetricType, MetricSource, MetricTimePeriod, ResearchField } from '../models/impact-metrics';

// Initialize services
const citationService = new CitationTrackingService();
const publicationService = new PublicationService();
const impactMetricsService = new ImpactMetricsService();

// Create router
const router: Router = express.Router();

/**
 * Helper function to handle errors
 */
const handleError = (res: Response, error: any) => {
  console.error('Error:', error);
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  res.status(500).json({ success: false, error: message });
};

// Citation endpoints

/**
 * Create a new citation
 * POST /citations
 */
router.post('/citations', async (req: Request, res: Response) => {
  try {
    const citationData: CreateCitationInput = req.body;
    const result = await citationService.trackCitation(citationData);
    
    if (result.success) {
      res.status(201).json(result);
      
      // Update publication citation counts
      await publicationService.incrementCitationCount(citationData.targetPublicationId);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get a citation by ID
 * GET /citations/:id
 */
router.get('/citations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await citationService.getCitation(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Update a citation
 * PUT /citations/:id
 */
router.put('/citations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateCitationInput = req.body;
    const result = await citationService.updateCitation(id, updateData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.code === 'CITATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Delete a citation
 * DELETE /citations/:id
 */
router.delete('/citations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await citationService.deleteCitation(id);
    
    if (result.success) {
      res.status(204).send();
    } else {
      res.status(result.code === 'CITATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Search citations
 * GET /citations/search
 */
router.get('/citations/search', async (req: Request, res: Response) => {
  try {
    const {
      sourcePublicationId,
      targetPublicationId,
      citationType,
      verified,
      detectedBy,
      detectedAfter,
      detectedBefore,
      page,
      limit,
      sortBy,
      sortDirection
    } = req.query;
    
    const result = await citationService.searchCitations({
      sourcePublicationId: sourcePublicationId as string,
      targetPublicationId: targetPublicationId as string,
      citationType: citationType as CitationType,
      verified: verified === 'true',
      detectedBy: detectedBy as 'manual' | 'automated' | 'api' | 'imported',
      detectedAfter: detectedAfter ? new Date(detectedAfter as string) : undefined,
      detectedBefore: detectedBefore ? new Date(detectedBefore as string) : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sortBy: sortBy as string,
      sortDirection: sortDirection as 'asc' | 'desc'
    });
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get publication citations
 * GET /citations/publication/:id
 */
router.get('/citations/publication/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await citationService.getPublicationCitations(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Verify a citation
 * POST /citations/:id/verify
 */
router.post('/citations/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verifiedBy } = req.body;
    
    if (!verifiedBy) {
      res.status(400).json({
        success: false,
        error: 'verifiedBy is required',
        code: 'MISSING_VERIFIED_BY'
      });
      return;
    }
    
    const result = await citationService.verifyCitation(id, verifiedBy);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.code === 'CITATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Extract citations from text
 * POST /citations/extract
 */
router.post('/citations/extract', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      res.status(400).json({
        success: false,
        error: 'text is required',
        code: 'MISSING_TEXT'
      });
      return;
    }
    
    const result = await citationService.extractCitationsFromText(text);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Import citations
 * POST /citations/import
 */
router.post('/citations/import', async (req: Request, res: Response) => {
  try {
    const { citations } = req.body;
    
    if (!citations || !Array.isArray(citations)) {
      res.status(400).json({
        success: false,
        error: 'citations array is required',
        code: 'MISSING_CITATIONS'
      });
      return;
    }
    
    const result = await citationService.importCitations(citations);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Export citations
 * POST /citations/export
 */
router.post('/citations/export', async (req: Request, res: Response) => {
  try {
    const { citationIds, format } = req.body;
    
    if (!citationIds || !Array.isArray(citationIds)) {
      res.status(400).json({
        success: false,
        error: 'citationIds array is required',
        code: 'MISSING_CITATION_IDS'
      });
      return;
    }
    
    if (!format || !['json', 'bibtex', 'csv', 'ris'].includes(format)) {
      res.status(400).json({
        success: false,
        error: 'valid format is required (json, bibtex, csv, ris)',
        code: 'INVALID_FORMAT'
      });
      return;
    }
    
    const result = await citationService.exportCitations(citationIds, format as 'json' | 'bibtex' | 'csv' | 'ris');
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get citation statistics
 * GET /citations/statistics
 */
router.get('/citations/statistics', async (_req: Request, res: Response) => {
  void(_req);
  try {
    const result = await citationService.getCitationStatistics();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

// Publication endpoints

/**
 * Create a new publication
 * POST /publications
 */
router.post('/publications', async (req: Request, res: Response) => {
  try {
    const publicationData: CreatePublicationInput = req.body;
    const result = await publicationService.createPublication(publicationData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get a publication by ID
 * GET /publications/:id
 */
router.get('/publications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await publicationService.getPublication(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Update a publication
 * PUT /publications/:id
 */
router.put('/publications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdatePublicationInput = req.body;
    const result = await publicationService.updatePublication(id, updateData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.code === 'PUBLICATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Delete a publication
 * DELETE /publications/:id
 */
router.delete('/publications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await publicationService.deletePublication(id);
    
    if (result.success) {
      res.status(204).send();
    } else {
      res.status(result.code === 'PUBLICATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Search publications
 * GET /publications/search
 */
router.get('/publications/search', async (req: Request, res: Response) => {
  try {
    const {
      title,
      authors,
      keywords,
      publicationType,
      status,
      publishedAfter,
      publishedBefore,
      accessType,
      minCitations,
      page,
      limit,
      sortBy,
      sortDirection
    } = req.query;
    
    // Parse arrays from query parameters
    const parsedAuthors = authors ? 
      (Array.isArray(authors) ? authors : [authors]) as string[] : 
      undefined;
    
    const parsedKeywords = keywords ? 
      (Array.isArray(keywords) ? keywords : [keywords]) as string[] : 
      undefined;
    
    const result = await publicationService.searchPublications({
      title: title as string,
      authors: parsedAuthors,
      keywords: parsedKeywords,
      publicationType: publicationType as any,
      status: status as any,
      publishedAfter: publishedAfter ? new Date(publishedAfter as string) : undefined,
      publishedBefore: publishedBefore ? new Date(publishedBefore as string) : undefined,
      accessType: accessType as any,
      minCitations: minCitations ? parseInt(minCitations as string, 10) : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sortBy: sortBy as string,
      sortDirection: sortDirection as 'asc' | 'desc'
    });
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get publications by author
 * GET /publications/author/:id
 */
router.get('/publications/author/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await publicationService.getAuthorPublications(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get publication by identifier
 * GET /publications/identifier/:type/:value
 */
router.get('/publications/identifier/:type/:value', async (req: Request, res: Response) => {
  try {
    const { type, value } = req.params;
    const result = await publicationService.getPublicationByIdentifier(type, value);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Track publication download
 * POST /publications/:id/download
 */
router.post('/publications/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await publicationService.trackDownload(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.code === 'PUBLICATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Track publication view
 * POST /publications/:id/view
 */
router.post('/publications/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await publicationService.trackView(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.code === 'PUBLICATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get publication impact metrics
 * GET /publications/:id/metrics
 */
router.get('/publications/:id/metrics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await publicationService.getPublicationImpactMetrics(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.code === 'PUBLICATION_NOT_FOUND' ? 404 : 400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get publication statistics
 * GET /publications/statistics
 */
router.get('/publications/statistics', async (_req: Request, res: Response) => {
  void(_req);
  try {
    const result = await publicationService.getPublicationStatistics();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Export publications
 * POST /publications/export
 */
router.post('/publications/export', async (req: Request, res: Response) => {
  try {
    const { publicationIds, format } = req.body;
    
    if (!publicationIds || !Array.isArray(publicationIds)) {
      res.status(400).json({
        success: false,
        error: 'publicationIds array is required',
        code: 'MISSING_PUBLICATION_IDS'
      });
      return;
    }
    
    if (!format || !['json', 'bibtex', 'csv', 'ris'].includes(format)) {
      res.status(400).json({
        success: false,
        error: 'valid format is required (json, bibtex, csv, ris)',
        code: 'INVALID_FORMAT'
      });
      return;
    }
    
    const result = await publicationService.exportPublications(
      publicationIds, 
      format as 'json' | 'bibtex' | 'csv' | 'ris'
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

// Impact metrics endpoints

/**
 * Calculate researcher metrics
 * GET /metrics/researcher/:id
 */
router.get('/metrics/researcher/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      timePeriod,
      customStartDate,
      customEndDate,
      includeFieldNormalized,
      includeAltmetrics,
      includeAdvancedMetrics,
      source
    } = req.query;
    
    const result = await impactMetricsService.calculateResearcherMetrics(id, {
      timePeriod: timePeriod as MetricTimePeriod,
      customStartDate: customStartDate ? new Date(customStartDate as string) : undefined,
      customEndDate: customEndDate ? new Date(customEndDate as string) : undefined,
      includeFieldNormalized: includeFieldNormalized === 'true',
      includeAltmetrics: includeAltmetrics === 'true',
      includeAdvancedMetrics: includeAdvancedMetrics === 'true',
      source: source as MetricSource
    });
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Compare researchers
 * POST /metrics/researchers/compare
 */
router.post('/metrics/researchers/compare', async (req: Request, res: Response) => {
  try {
    const { researcherIds, params } = req.body;
    
    if (!researcherIds || !Array.isArray(researcherIds)) {
      res.status(400).json({
        success: false,
        error: 'researcherIds array is required',
        code: 'MISSING_RESEARCHER_IDS'
      });
      return;
    }
    
    const result = await impactMetricsService.compareResearchers(researcherIds, params);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get metric history
 * GET /metrics/history/:entityType/:entityId/:metricType
 */
router.get('/metrics/history/:entityType/:entityId/:metricType', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, metricType } = req.params;
    
    if (!['researcher', 'publication', 'journal', 'institution'].includes(entityType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid entity type',
        code: 'INVALID_ENTITY_TYPE'
      });
      return;
    }
    
    const result = await impactMetricsService.getMetricHistory(
      entityId,
      entityType as any,
      metricType as MetricType
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Calculate field-normalized impact
 * GET /metrics/researcher/:id/field-normalized/:field
 */
router.get('/metrics/researcher/:id/field-normalized/:field', async (req: Request, res: Response) => {
  try {
    const { id, field } = req.params;
    
    if (!Object.values(ResearchField).includes(field as ResearchField)) {
      res.status(400).json({
        success: false,
        error: 'Invalid research field',
        code: 'INVALID_RESEARCH_FIELD'
      });
      return;
    }
    
    const result = await impactMetricsService.calculateFieldNormalizedImpact(
      id,
      field as ResearchField
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Calculate publication altmetrics
 * GET /metrics/publication/:id/altmetrics
 */
router.get('/metrics/publication/:id/altmetrics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await impactMetricsService.calculatePublicationAltmetrics(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get citation network metrics
 * GET /metrics/researcher/:id/network
 */
router.get('/metrics/researcher/:id/network', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await impactMetricsService.getCitationNetworkMetrics(id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Get visualization data
 * POST /metrics/visualization
 */
router.post('/metrics/visualization', async (req: Request, res: Response) => {
  try {
    const { entityId, entityType, metricTypes } = req.body;
    
    if (!entityId) {
      res.status(400).json({
        success: false,
        error: 'entityId is required',
        code: 'MISSING_ENTITY_ID'
      });
      return;
    }
    
    if (!entityType || !['researcher', 'publication', 'journal', 'institution'].includes(entityType)) {
      res.status(400).json({
        success: false,
        error: 'Valid entityType is required',
        code: 'INVALID_ENTITY_TYPE'
      });
      return;
    }
    
    if (!metricTypes || !Array.isArray(metricTypes) || metricTypes.length === 0) {
      res.status(400).json({
        success: false,
        error: 'metricTypes array is required',
        code: 'MISSING_METRIC_TYPES'
      });
      return;
    }
    
    const result = await impactMetricsService.getVisualizationData(
      entityId,
      entityType as any,
      metricTypes as MetricType[]
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

/**
 * Import metrics
 * POST /metrics/import
 */
router.post('/metrics/import', async (req: Request, res: Response) => {
  try {
    const { source, data } = req.body;
    
    if (!source || !Object.values(MetricSource).includes(source)) {
      res.status(400).json({
        success: false,
        error: 'Valid metric source is required',
        code: 'INVALID_METRIC_SOURCE'
      });
      return;
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        success: false,
        error: 'metrics data array is required',
        code: 'MISSING_METRICS_DATA'
      });
      return;
    }
    
    const result = await impactMetricsService.importMetrics(source as MetricSource, data);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (_error) {
    handleError(res, _error);
  }
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  void(_req);
  res.status(200).json({
    status: 'healthy',
    services: {
      citationService: 'available',
      publicationService: 'available',
      impactMetricsService: 'available'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;