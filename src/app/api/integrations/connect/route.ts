import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { IntegrationService } from '@/lib/integrations/service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenant_id;
    const body = await request.json();
    const { providerId, apiKey, url } = body;

    const service = IntegrationService.getInstance();
    
    // Map providerId to service type
    let type: 'wonde' | 'sims' | undefined;
    if (providerId === 'wonde') type = 'wonde';
    else if (providerId === 'sims-legacy') type = 'sims';
    
    if (!type) {
        // For other providers not yet fully implemented in the backend service
        // We simulate a success for the demo "wiring up"
        return NextResponse.json({ success: true, status: 'connected', message: 'Integration enabled (Simulation)' });
    }

    const provider = service.getProvider({ type, apiKey, url });
    const isConnected = await provider.isConnected();

    if (isConnected) {
        // Save credentials to database
        await service.saveConnection(tenantId, providerId, { apiKey, url });
        
        // Log the initial success
        await service.logSync(tenantId, providerId, 'success', 'Initial connection established');

        return NextResponse.json({ success: true, status: 'connected' });
    } else {
        return NextResponse.json({ success: false, error: 'Connection failed: Invalid credentials or unreachable host' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Integration connect error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
