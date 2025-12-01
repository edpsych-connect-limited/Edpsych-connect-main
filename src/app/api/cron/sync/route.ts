import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IntegrationService } from '@/lib/integrations/service';

export async function GET(request: Request) {
  // Security check: Ensure this is called by Vercel Cron or an authorized admin
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow local development bypass if needed, or strict check
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // 1. Find all active integrations
    const activeIntegrations = await prisma.integrationSettings.findMany({
      where: { status: 'connected' }
    });

    logger.debug(`[Cron] Found ${activeIntegrations.length} active integrations to sync.`);

    const service = IntegrationService.getInstance();
    const results = [];

    // 2. Run sync for each
    for (const integration of activeIntegrations) {
      const result = await service.runNightlySync(integration.tenant_id.toString(), {
        type: integration.provider as 'wonde' | 'sims',
        apiKey: integration.api_key || undefined,
        url: integration.gateway_url || undefined
      });
      
      results.push({ tenantId: integration.tenant_id, result });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    logger.error('[Cron] Sync job failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
