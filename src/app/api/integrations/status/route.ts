import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenant_id;

    try {
        const settings = await prisma.integrationSettings.findUnique({
            where: { tenant_id: tenantId }
        });

        const providers: Record<string, any> = {
            'wonde': { status: 'disconnected' },
            'sims-legacy': { status: 'disconnected' },
            'arbor': { status: 'disconnected' },
            'cpoms': { status: 'disconnected' },
            'azure-ad': { status: 'disconnected' }
        };

        if (settings) {
            providers[settings.provider] = {
                status: settings.status,
                lastSync: settings.last_sync?.toISOString()
            };
        }

        return NextResponse.json({ providers });
    } catch (error) {
        console.error('Failed to fetch integration status:', error);
        return NextResponse.json({ providers: {} }, { status: 500 });
    }
}
