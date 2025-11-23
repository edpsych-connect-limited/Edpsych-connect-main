import { NextResponse } from 'next/server';

export async function GET() {
    // In a real app, fetch from DB
    // const integrations = await prisma.integration.findMany({ where: { tenantId } });
    
    // Returning mock status for the dashboard to show "wired up" state
    // This would be dynamic based on the DB in production
    return NextResponse.json({
        providers: {
            'wonde': { status: 'connected', lastSync: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
            'sims-legacy': { status: 'disconnected' },
            'arbor': { status: 'pending' },
            'cpoms': { status: 'disconnected' },
            'azure-ad': { status: 'connected', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
        }
    });
}
