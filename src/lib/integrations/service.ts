/**
 * Integration Service
 * The central manager that decides which provider to use.
 */

import { WondeIntegration } from './wonde';
import { SIMSIntegration } from './sims';
import { MISProvider } from './types';

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
   * Trigger a nightly sync for a tenant
   */
  async runNightlySync(tenantId: string, config: any) {
    console.log(`Starting nightly sync for tenant ${tenantId}...`);
    
    try {
      const provider = this.getProvider(config);
      
      // 1. Sync Staff (so teachers exist)
      await provider.syncStaff(tenantId);
      
      // 2. Sync Students
      await provider.syncStudents(tenantId);
      
      console.log(`Sync completed for tenant ${tenantId}`);
      return { success: true };
    } catch (error) {
      console.error(`Sync failed for tenant ${tenantId}:`, error);
      return { success: false, error };
    }
  }
}
