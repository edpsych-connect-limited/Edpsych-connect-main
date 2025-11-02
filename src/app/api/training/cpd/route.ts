import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    if (!(prisma as any).cPDEntry || typeof (prisma as any).cPDEntry.findMany !== 'function') {
      console.warn('⚠️ Prisma client missing or misconfigured. Returning mock CPD data.');
      return NextResponse.json({
        entries: [],
        totalHours: 0,
        totalsByCategory: {}
      });
    }

    const cpdEntries = await (prisma as any).cPDEntry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    // Calculate totals by category
    const totalsByCategory = cpdEntries.reduce((acc: any, entry: any) => {
      const category = entry.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += entry.hours;
      return acc;
    }, {} as Record<string, number>);

    const totalHours = cpdEntries.reduce((sum: number, entry: any) => sum + entry.hours, 0);

    return NextResponse.json({
      entries: cpdEntries,
      totalHours,
      totalsByCategory
    });
  } catch (error) {
    console.error('Error fetching CPD entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CPD entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, activity, category, hours, provider, certificate, notes } = body;

    if (!userId || !date || !activity || !category || !hours || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cpdEntry = await (prisma as any).cPDEntry.create({
      data: {
        id: `cpd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        date: new Date(date),
        activity,
        category,
        hours: parseFloat(hours),
        provider,
        certificate: certificate || false,
        notes: notes || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(cpdEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating CPD entry:', error);
    return NextResponse.json(
      { error: 'Failed to create CPD entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    await (prisma as any).cPDEntry.delete({
      where: { id: entryId }
    });

    return NextResponse.json({ message: 'CPD entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting CPD entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete CPD entry' },
      { status: 500 }
    );
  }
}