import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/settings/integrations
 * Fetch current integration settings for the user's tenant
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For demo purposes, return mock data
    // In production, fetch from IntegrationSettings table
    const providers = [
      {
        id: 'wonde',
        name: 'Wonde',
        description: 'UK\'s leading school data API',
        status: 'disconnected',
        apiKeyConfigured: false,
      },
      {
        id: 'sims',
        name: 'SIMS Direct',
        description: 'Direct SIMS connection',
        status: 'disconnected',
        apiKeyConfigured: false,
      },
      {
        id: 'arbor',
        name: 'Arbor Education',
        description: 'Arbor MIS integration',
        status: 'disconnected',
        apiKeyConfigured: false,
      },
    ];

    return NextResponse.json({
      providers,
      syncLogs: [],
      autoSync: true,
    });
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
