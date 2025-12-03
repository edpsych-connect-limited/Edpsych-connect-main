/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorised copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaSafe';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/marketplace/dashboard
 * Returns marketplace dashboard data including:
 * - Service listings overview
 * - Contract statistics
 * - Professional profiles
 * - Platform metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id');
    const userId = searchParams.get('user_id');

    // Get service listings statistics
    const totalListings = await prisma.serviceListing.count({
      where: { isActive: true },
    });

    const activeListings = await prisma.serviceListing.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get contract statistics
    const contractStats = await prisma.serviceContract.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { totalAmount: true, platformFee: true },
    });

    const totalContracts = await prisma.serviceContract.count();
    const completedContracts = await prisma.serviceContract.count({
      where: { status: 'completed' },
    });
    const activeContracts = await prisma.serviceContract.count({
      where: { status: { in: ['in_progress', 'accepted'] } },
    });

    // Calculate revenue metrics
    const revenueData = await prisma.serviceContract.aggregate({
      where: { status: 'completed' },
      _sum: {
        totalAmount: true,
        platformFee: true,
        epPayout: true,
      },
    });

    // Get verified professional count (approved on LA panel)
    const verifiedProfessionals = await prisma.marketplaceProfessional.count({
      where: { la_panel_status: 'APPROVED' },
    });

    // Get recent reviews
    const recentReviews = await prisma.marketplaceReview.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate average rating
    const ratingStats = await prisma.marketplaceReview.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    });

    // Get service type distribution
    const serviceTypeDistribution = await prisma.serviceListing.groupBy({
      by: ['serviceType'],
      where: { isActive: true },
      _count: { id: true },
      _avg: { price: true },
    });

    // User-specific data if user_id provided
    let userListings = null;
    let userContracts = null;
    if (userId) {
      userListings = await prisma.serviceListing.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' },
      });

      userContracts = await prisma.serviceContract.findMany({
        where: {
          OR: [
            { epId: parseInt(userId) },
            { tenant: { users: { some: { id: parseInt(userId) } } } },
          ],
        },
        include: {
          listing: {
            select: {
              title: true,
              serviceType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    // Tenant-specific data if tenant_id provided
    let tenantContracts = null;
    if (tenantId) {
      tenantContracts = await prisma.serviceContract.findMany({
        where: { tenantId: parseInt(tenantId) },
        include: {
          listing: {
            select: {
              title: true,
              serviceType: true,
              price: true,
            },
          },
          ep: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const dashboardData = {
      success: true,
      data: {
        overview: {
          total_listings: totalListings,
          total_contracts: totalContracts,
          completed_contracts: completedContracts,
          active_contracts: activeContracts,
          verified_professionals: verifiedProfessionals,
          average_rating: ratingStats._avg.rating?.toFixed(1) || 'N/A',
          total_reviews: ratingStats._count.id,
        },
        revenue: {
          total_transaction_value: revenueData._sum.totalAmount || 0,
          total_platform_fees: revenueData._sum.platformFee || 0,
          total_ep_payouts: revenueData._sum.epPayout || 0,
          currency: 'GBP',
        },
        contract_breakdown: contractStats.map(stat => ({
          status: stat.status,
          count: stat._count.id,
          total_value: stat._sum.totalAmount || 0,
        })),
        service_types: serviceTypeDistribution.map(type => ({
          type: type.serviceType,
          count: type._count.id,
          average_price: type._avg.price?.toFixed(2) || 0,
        })),
        recent_listings: activeListings.map(listing => ({
          id: listing.id,
          title: listing.title,
          description: listing.description.substring(0, 150) + '...',
          price: listing.price,
          service_type: listing.serviceType,
          duration_minutes: listing.durationMinutes,
          professional_name: listing.user.firstName 
            ? `${listing.user.firstName} ${listing.user.lastName}`
            : listing.user.name,
          created_at: listing.createdAt,
        })),
        recent_reviews: recentReviews.map(review => ({
          rating: review.rating,
          comment: review.comment,
          author: review.author.firstName 
            ? `${review.author.firstName} ${review.author.lastName}`
            : review.author.name,
          created_at: review.createdAt,
        })),
        // User-specific data
        ...(userListings && { user_listings: userListings }),
        ...(userContracts && { user_contracts: userContracts }),
        // Tenant-specific data
        ...(tenantContracts && { tenant_contracts: tenantContracts }),
      },
      generated_at: new Date().toISOString(),
    };

    logger.debug('[Marketplace Dashboard] Data retrieved successfully');
    return NextResponse.json(dashboardData);

  } catch (error) {
    logger.error('[Marketplace Dashboard] Error retrieving dashboard data:', error as Error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve marketplace dashboard data',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}
