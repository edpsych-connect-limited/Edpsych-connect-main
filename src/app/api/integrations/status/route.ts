import authService from '@/lib/auth/auth-service';
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
    const session = await authService.getSessionFromRequest(request);
    
    if (!session?.tenant_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.tenant_id;

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
    } catch (_error) {
        console.error('Failed to fetch integration status:', _error);
        return NextResponse.json({ providers: {} }, { status: 500 });
    }
}
