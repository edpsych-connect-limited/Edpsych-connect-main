/**
 * Integration Service
 * The central manager that decides which provider to use.
 */

import { WondeIntegration } from './wonde';
import { SIMSIntegration } from './sims';
import { MISProvider } from './types';
import { prisma } from '@/lib/prisma';

export class IntegrationService {
  private static instance: IntegrationService;

  private constructor() {}

  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  /**
   * Factory method to get the correct provider for a tenant
   */
  getProvider(config: { type: 'wonde' | 'sims'; apiKey?: string; url?: string }): MISProvider {
    if (config.type === 'wonde' && config.apiKey) {
      return new WondeIntegration(config.apiKey);
    }
    
    if (config.type === 'sims' && config.url) {
      return new SIMSIntegration(config.url);
    }

    throw new Error('Invalid integration configuration');
  }

  /**
   * Save connection settings to the database
   */
  async saveConnection(tenantId: number, provider: string, settings: { apiKey?: string; url?: string }) {
    return await prisma.integrationSettings.upsert({
      where: { tenant_id: tenantId },
      update: {
        provider,
        api_key: settings.apiKey,
        gateway_url: settings.url,
        status: 'connected',
        updated_at: new Date()
      },
      create: {
        tenant_id: tenantId,
        provider,
        api_key: settings.apiKey,
        gateway_url: settings.url,
        status: 'connected'
      }
    });
  }

  /**
   * Log a sync event
   */
  async logSync(tenantId: number, provider: string, status: 'success' | 'failed', details: string, records: number = 0) {
    return await prisma.syncLog.create({
      data: {
        tenant_id: tenantId,
        provider,
        status,
        details,
        records_processed: records
      }
    });
  }

  /**
   * Trigger a nightly sync for a tenant
   */
  async runNightlySync(tenantId: string, config: any) {
    console.log(`Starting nightly sync for tenant ${tenantId}...`);
    // Convert string tenantId to number for DB operations if needed, 
    // but for now we assume the caller handles ID types correctly or we parse it.
    const dbTenantId = parseInt(tenantId); 
    
    try {
      const provider = this.getProvider(config);
      
      // 1. Sync Staff (so teachers exist)
      await provider.syncStaff(tenantId);
      
      // 2. Sync Students
      const studentResult = await provider.syncStudents(tenantId);
      
      console.log(`Sync completed for tenant ${tenantId}`);
      
      if (!isNaN(dbTenantId)) {
        await this.logSync(
            dbTenantId, 
            config.type, 
            studentResult.success ? 'success' : 'failed', 
            studentResult.success ? 'Nightly sync completed successfully' : `Errors: ${studentResult.errors.join(', ')}`, 
            studentResult.recordsProcessed
        );
        
        // Update last sync time
        if (studentResult.success) {
            await prisma.integrationSettings.update({
            where: { tenant_id: dbTenantId },
            data: { last_sync: new Date() }
            });
        }
      }

      return { success: studentResult.success, result: studentResult };
    } catch (error: any) {
      console.error(`Sync failed for tenant ${tenantId}:`, error);
      
      if (!isNaN(dbTenantId)) {
        await this.logSync(dbTenantId, config.type, 'failed', error.message || 'Unknown error');
      }
      
      return { success: false, error };
    }
  }
}
