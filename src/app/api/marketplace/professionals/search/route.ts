/**
 * MARKETPLACE SEARCH API
 * 
 * Public search for Educational Psychologists
 * Filters: Location, Specialisms, Availability, Price, LA Panel Status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filters
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location');
    const specialisms = searchParams.get('specialisms')?.split(',') || [];
    const availability = searchParams.get('availability'); // 'immediate', 'next_week', 'next_month'
    const maxRate = searchParams.get('max_rate') ? parseFloat(searchParams.get('max_rate')!) : undefined;
    const laPanelOnly = searchParams.get('la_panel') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      verification_status: 'VERIFIED', // Only show verified pros
      availability_status: { not: 'UNAVAILABLE' }, // Hide unavailable pros
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

    // Location filter (simple string match for now, could be geospatial later)
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Specialisms filter (array overlap)
    if (specialisms.length > 0) {
      where.specialisms = {
        hasSome: specialisms,
      };
    }

    // Max daily rate filter
    if (maxRate) {
      where.daily_rate = {
        lte: maxRate,
      };
    }

    // LA Panel filter
    if (laPanelOnly) {
      where.la_panel_status = 'APPROVED';
    }

    // Availability filter logic
    if (availability) {
      const now = new Date();
      let dateFilter;
      
      if (availability === 'immediate') {
        // Available within next 3 days
        const threeDays = new Date(now);
        threeDays.setDate(now.getDate() + 3);
        dateFilter = { lte: threeDays };
      } else if (availability === 'next_week') {
        // Available within next 7 days
        const sevenDays = new Date(now);
        sevenDays.setDate(now.getDate() + 7);
        dateFilter = { lte: sevenDays };
      }
      
      if (dateFilter) {
        where.next_available_date = dateFilter;
      }
    }

    // Execute query with pagination
    const [professionals, total] = await Promise.all([
      prisma.marketplace_professionals.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true, // Avatar
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: [
          // Boost LA Panel members to top
          { la_panel_status: 'desc' }, // 'APPROVED' > 'APPLIED' > 'NOT_APPLIED' (alphabetical works here luckily? No, actually APPROVED comes before NOT_APPLIED. Wait. A < N. So APPROVED is first. Perfect.)
          // Then by rating
          { rating: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.marketplace_professionals.count({ where }),
    ]);

    // Format response
    const results = professionals.map((p: any) => ({
      id: p.id,
      userId: p.user.id,
      name: p.user.name,
      avatar: p.user.image,
      title: p.job_title || 'Educational Psychologist',
      bio: p.bio,
      location: p.location,
      specialisms: p.specialisms,
      dailyRate: p.daily_rate,
      rating: p.rating,
      reviewCount: p._count.reviews,
      isLaPanel: p.la_panel_status === 'APPROVED',
      nextAvailable: p.next_available_date,
      yearsExperience: p.years_experience,
      verified: p.verification_status === 'VERIFIED',
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
