import { logger } from "@/lib/logger";
/**
 * MARKETPLACE SEARCH API
 * 
 * Public search for Educational Psychologists
 * Filters: Location, Specialisms, Availability, Price, LA Panel Status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filters
    const query = searchParams.get('q') || '';
    const _location = searchParams.get('location');
    const specialisms = searchParams.get('specialisms')?.split(',') || [];
    const _availability = searchParams.get('availability'); // 'immediate', 'next_week', 'next_month'
    const maxRate = searchParams.get('max_rate') ? parseFloat(searchParams.get('max_rate')!) : undefined;
    const _laPanelOnly = searchParams.get('la_panel') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      // Check verification status via the relation to users -> ProfessionalCompliance
      user: {
        compliance: {
          verificationStatus: 'VERIFIED'
        }
      }
    };

    // Text search (name or bio)
    if (query) {
      where.OR = [
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          bio: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Location filter (using la_panel_regions as proxy)
    if (_location) {
      // Note: Prisma array filtering is exact match. For partial match we'd need raw query.
      // For now, we'll check if the region list contains the search term.
      where.la_panel_regions = {
        has: _location
      };
    }
    
    // Specialisms filter (array overlap)
    if (specialisms.length > 0) {
      where.specialties = {
        hasSome: specialisms,
      };
    }

    // Max daily rate filter -> Convert to Hourly Rate (assuming 7 hour day)
    if (maxRate) {
      where.hourlyRate = {
        lte: maxRate / 7,
      };
    }

    // LA Panel filter
    if (_laPanelOnly) {
      where.la_panel_status = 'APPROVED';
    }

    // Availability filter logic
    // Schema has 'availability' as Json. Complex querying of Json is DB-specific.
    // For now, we will skip the date filtering to ensure stability.
    
    // Execute query with pagination
    const [professionals, total] = await Promise.all([
      prisma.marketplaceProfessional.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.marketplaceProfessional.count({ where }),
    ]);

    // Format response
    const results = professionals.map((p: any) => ({
      id: p.id,
      userId: p.user.id,
      name: p.user.name,
      avatar: null, // p.user.image,
      title: 'Educational Psychologist', // Default title
      bio: p.bio,
      location: p.la_panel_regions?.[0] || 'United Kingdom', // Use first region or default
      specialisms: p.specialties,
      dailyRate: (p.hourlyRate || 0) * 7, // Convert back to daily for frontend
      rating: p.rating,
      reviewCount: p._count.reviews,
      isLaPanel: p.la_panel_status === 'APPROVED',
      nextAvailable: null, // p.availability,
      yearsExperience: 5, // Default until added to schema
      verified: p.user.compliance?.verificationStatus === 'VERIFIED',
    }));

    return NextResponse.json({
      results,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Marketplace search error:', error);
    return NextResponse.json(
      { error: 'Failed to search professionals' },
      { status: 500 }
    );
  }
}
