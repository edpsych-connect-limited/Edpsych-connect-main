/**
 * Resource Library API Routes
 * 
 * Endpoints for resource management, search, and recommendations
 * with AI-powered capabilities.
 * 
 * Supports video claims:
 * - Extensive resource library
 * - AI-powered search
 * - Curriculum alignment
 * - Quality assured materials
 * 
 * @route /api/resources/library
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createResourceLibraryService } from '@/lib/resources/resource-library.service';
import { logger } from '@/lib/logger';

// ============================================================================
// GET /api/resources/library
// Search, browse, and retrieve resources
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const userId = parseInt((session.user as { id?: string }).id || '0');
    const service = createResourceLibraryService(tenantId);
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';

    switch (action) {
      case 'get': {
        const resourceId = searchParams.get('id');
        if (!resourceId) {
          return NextResponse.json(
            { error: 'Resource ID is required' },
            { status: 400 }
          );
        }
        const resource = await service.getResource(resourceId);
        return NextResponse.json({ resource });
      }

      case 'search': {
        const query = searchParams.get('query') || undefined;
        const types = searchParams.get('types')?.split(',') as any[];
        const categories = searchParams.get('categories')?.split(',') as any[];
        const keyStages = searchParams.get('keyStages')?.split(',').map(Number);
        const yearGroups = searchParams.get('yearGroups')?.split(',').map(Number);
        const subjects = searchParams.get('subjects')?.split(',');
        const sendTypes = searchParams.get('sendTypes')?.split(',');
        const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
        const tags = searchParams.get('tags')?.split(',');
        
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');
        const sortBy = searchParams.get('sortBy') as any || 'relevance';
        
        const results = await service.search(
          { query, type: types, category: categories, keyStages, yearGroups, subjects, sendTypes, minRating, tags },
          { page, pageSize, sortBy }
        );
        return NextResponse.json(results);
      }

      case 'quick-search': {
        const query = searchParams.get('query');
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required' },
            { status: 400 }
          );
        }
        const results = await service.quickSearch(query);
        return NextResponse.json(results);
      }

      case 'curriculum-search': {
        const objective = searchParams.get('objective');
        const keyStage = parseInt(searchParams.get('keyStage') || '0');
        if (!objective || !keyStage) {
          return NextResponse.json(
            { error: 'Objective and key stage are required' },
            { status: 400 }
          );
        }
        const results = await service.searchByCurriculumObjective(objective, keyStage);
        return NextResponse.json({ results });
      }

      case 'send-search': {
        const sendType = searchParams.get('sendType');
        if (!sendType) {
          return NextResponse.json(
            { error: 'SEND type is required' },
            { status: 400 }
          );
        }
        const category = searchParams.get('category') as any;
        const keyStage = searchParams.get('keyStage') ? parseInt(searchParams.get('keyStage')!) : undefined;
        const results = await service.searchBySENDNeed(sendType, { category, keyStage });
        return NextResponse.json({ results });
      }

      case 'recommendations': {
        const recommendations = await service.getRecommendations(userId);
        return NextResponse.json({ recommendations });
      }

      case 'similar': {
        const resourceId = searchParams.get('resourceId');
        if (!resourceId) {
          return NextResponse.json(
            { error: 'Resource ID is required' },
            { status: 400 }
          );
        }
        const similar = await service.getSimilarResources(resourceId);
        return NextResponse.json({ similar });
      }

      case 'popular': {
        const category = searchParams.get('category') as any;
        const keyStage = searchParams.get('keyStage') ? parseInt(searchParams.get('keyStage')!) : undefined;
        const period = searchParams.get('period') as any || 'month';
        const popular = await service.getPopularResources({ category, keyStage, period });
        return NextResponse.json({ popular });
      }

      case 'collections': {
        const collections = await service.getUserCollections(userId);
        return NextResponse.json({ collections });
      }

      case 'public-collections': {
        const category = searchParams.get('category') as any;
        const collections = await service.getPublicCollections(category);
        return NextResponse.json({ collections });
      }

      case 'reviews': {
        const resourceId = searchParams.get('resourceId');
        if (!resourceId) {
          return NextResponse.json(
            { error: 'Resource ID is required' },
            { status: 400 }
          );
        }
        const page = parseInt(searchParams.get('page') || '1');
        const reviews = await service.getResourceReviews(resourceId, page);
        return NextResponse.json(reviews);
      }

      case 'download-history': {
        const history = await service.getDownloadHistory(userId);
        return NextResponse.json({ history });
      }

      case 'analytics': {
        const resourceId = searchParams.get('resourceId');
        if (!resourceId) {
          return NextResponse.json(
            { error: 'Resource ID is required' },
            { status: 400 }
          );
        }
        const analytics = await service.getResourceAnalytics(resourceId);
        return NextResponse.json({ analytics });
      }

      case 'statistics': {
        const stats = await service.getLibraryStatistics();
        return NextResponse.json({ statistics: stats });
      }

      case 'pending-verification': {
        const pending = await service.getPendingVerification();
        return NextResponse.json({ pending });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[ResourceLibraryAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve resource data' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/resources/library
// Create resources, collections, reviews
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const userId = parseInt((session.user as { id?: string }).id || '0');
    const service = createResourceLibraryService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create-resource': {
        const resourceId = await service.createResource(data.resource);
        return NextResponse.json({ 
          success: true,
          resourceId,
          message: 'Resource created successfully'
        });
      }

      case 'create-collection': {
        const collectionId = await service.createCollection(data.collection, userId);
        return NextResponse.json({ 
          success: true,
          collectionId,
          message: 'Collection created successfully'
        });
      }

      case 'add-to-collection': {
        const { collectionId, resourceId } = data;
        await service.addToCollection(collectionId, resourceId);
        return NextResponse.json({ 
          success: true,
          message: 'Resource added to collection'
        });
      }

      case 'rate': {
        const { resourceId, rating, review } = data;
        await service.rateResource(resourceId, userId, rating, review);
        return NextResponse.json({ 
          success: true,
          message: 'Rating submitted'
        });
      }

      case 'download': {
        const { resourceId } = data;
        const downloadInfo = await service.recordDownload(resourceId, userId);
        return NextResponse.json({ 
          success: true,
          ...downloadInfo
        });
      }

      case 'mark-helpful': {
        const { reviewId } = data;
        await service.markReviewHelpful(reviewId, userId);
        return NextResponse.json({ 
          success: true,
          message: 'Marked as helpful'
        });
      }

      case 'submit-verification': {
        const { resourceId } = data;
        await service.submitForVerification(resourceId);
        return NextResponse.json({ 
          success: true,
          message: 'Submitted for verification'
        });
      }

      case 'generate-summary': {
        const { resourceId } = data;
        const summary = await service.generateAISummary(resourceId);
        return NextResponse.json({ 
          success: true,
          summary
        });
      }

      case 'ask-question': {
        const { question } = data;
        const answer = await service.answerQuestion(question);
        return NextResponse.json({ 
          success: true,
          ...answer
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[ResourceLibraryAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process resource request' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/resources/library
// Update resources or verify
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const userId = parseInt((session.user as { id?: string }).id || '0');
    const service = createResourceLibraryService(tenantId);
    
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update-resource': {
        const { resourceId, updates } = data;
        await service.updateResource(resourceId, updates);
        return NextResponse.json({ 
          success: true,
          message: 'Resource updated successfully'
        });
      }

      case 'verify-resource': {
        const { resourceId, decision } = data;
        await service.verifyResource(resourceId, userId, decision);
        return NextResponse.json({ 
          success: true,
          message: 'Resource verification updated'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('[ResourceLibraryAPI] PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/resources/library
// Delete resources
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      );
    }

    const tenantId = (session.user as { tenantId?: number }).tenantId || 1;
    const service = createResourceLibraryService(tenantId);
    
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('id');

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    await service.deleteResource(resourceId);
    return NextResponse.json({ 
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    logger.error('[ResourceLibraryAPI] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
