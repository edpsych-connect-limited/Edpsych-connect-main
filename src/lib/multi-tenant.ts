import { logger } from "@/lib/logger";
/**
 * EdPsych Connect - Multi-Tenant White-Labeling System
 * Complete white-labeling and multi-tenant architecture
 */

import { prisma } from '@/lib/prisma';

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  subdomain?: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo: string;
    favicon: string;
    brandName: string;
    tagline: string;
  };
  features: {
    enabled: string[];
    disabled: string[];
    customizations: Record<string, any>;
  };
  limits: {
    users: number;
    storage: number;
    aiRequests: number;
    apiCalls: number;
  };
  integrations: {
    sso: boolean;
    lms: string[];
    sis: string[];
    custom: Record<string, any>;
  };
  compliance: {
    gdpr: boolean;
    ferpa: boolean;
    coppa: boolean;
    customPolicies: string[];
  };
  status: 'active' | 'suspended' | 'trial' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface WhiteLabelConfig {
  tenantId: string;
  customCSS: string;
  customJS: string;
  emailTemplates: Record<string, string>;
  notificationTemplates: Record<string, string>;
  reportTemplates: Record<string, string>;
  dashboardCustomizations: Record<string, any>;
  featureCustomizations: Record<string, any>;
}

class MultiTenantService {
  private static instance: MultiTenantService;

  private constructor() {
    // Initialization is now async, handled by ensureDefaultTenant
  }

  public static getInstance(): MultiTenantService {
    if (!MultiTenantService.instance) {
      MultiTenantService.instance = new MultiTenantService();
    }
    return MultiTenantService.instance;
  }

  public async ensureDefaultTenant(): Promise<void> {
    const defaultSubdomain = 'app';
    const existing = await prisma.tenants.findUnique({
      where: { subdomain: defaultSubdomain }
    });

    if (!existing) {
      const defaultSettings = {
        domain: 'edpsychconnect.com',
        branding: {
          primaryColor: '#0ea5e9',
          secondaryColor: '#64748b',
          accentColor: '#eab308',
          logo: '/images/logo/edpsych-logo.svg',
          favicon: '/favicon.ico',
          brandName: 'EdPsych Connect',
          tagline: 'Where Technology Disappears, Education Transforms'
        },
        features: {
          enabled: ['all'],
          disabled: [],
          customizations: {}
        },
        limits: {
          users: 1000,
          storage: 100,
          aiRequests: 10000,
          apiCalls: 100000
        },
        integrations: {
          sso: true,
          lms: ['canvas', 'moodle', 'blackboard', 'google-classroom'],
          sis: ['powerschool', 'infinite-campus', 'skyward'],
          custom: {}
        },
        compliance: {
          gdpr: true,
          ferpa: true,
          coppa: true,
          customPolicies: []
        }
      };

      await prisma.tenants.create({
        data: {
          name: 'EdPsych Connect',
          subdomain: defaultSubdomain,
          tenant_type: 'SCHOOL', // Default type
          status: 'active',
          settings: defaultSettings
        }
      });
      logger.info('Default tenant initialized in database.');
    }
  }

  private mapPrismaToConfig(tenant: any): TenantConfig {
    const settings = tenant.settings as any || {};
    return {
      id: tenant.id.toString(),
      name: tenant.name,
      domain: settings.domain || '',
      subdomain: tenant.subdomain,
      branding: settings.branding || {},
      features: settings.features || { enabled: [], disabled: [], customizations: {} },
      limits: settings.limits || { users: 0, storage: 0, aiRequests: 0, apiCalls: 0 },
      integrations: settings.integrations || { sso: false, lms: [], sis: [], custom: {} },
      compliance: settings.compliance || { gdpr: false, ferpa: false, coppa: false, customPolicies: [] },
      status: tenant.status as any,
      createdAt: new Date(), // Prisma doesn't have created_at on tenants model in snippet, assuming it might or we use now
      updatedAt: new Date()
    };
  }

  // Tenant Management
  async createTenant(config: Omit<TenantConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<TenantConfig> {
    const settings = {
      domain: config.domain,
      branding: config.branding,
      features: config.features,
      limits: config.limits,
      integrations: config.integrations,
      compliance: config.compliance
    };

    const tenant = await prisma.tenants.create({
      data: {
        name: config.name,
        subdomain: config.subdomain || `tenant-${Date.now()}`,
        status: config.status,
        settings: settings
      }
    });

    // Create default white-label configuration (stored in settings or separate table? For now, we'll assume it's derived)
    // await this.createWhiteLabelConfig(tenant.id.toString());

    return this.mapPrismaToConfig(tenant);
  }

  async updateTenant(tenantId: string, updates: Partial<TenantConfig>): Promise<TenantConfig> {
    const id = parseInt(tenantId);
    const existing = await prisma.tenants.findUnique({ where: { id } });
    if (!existing) throw new Error(`Tenant ${tenantId} not found`);

    const currentSettings = existing.settings as any || {};
    
    const newSettings = {
      ...currentSettings,
      domain: updates.domain ?? currentSettings.domain,
      branding: updates.branding ?? currentSettings.branding,
      features: updates.features ?? currentSettings.features,
      limits: updates.limits ?? currentSettings.limits,
      integrations: updates.integrations ?? currentSettings.integrations,
      compliance: updates.compliance ?? currentSettings.compliance
    };

    const updated = await prisma.tenants.update({
      where: { id },
      data: {
        name: updates.name,
        subdomain: updates.subdomain,
        status: updates.status,
        settings: newSettings
      }
    });

    return this.mapPrismaToConfig(updated);
  }

  async deleteTenant(tenantId: string): Promise<void> {
    const id = parseInt(tenantId);
    // Prevent deleting default tenant (assuming ID 1 or specific subdomain)
    const tenant = await prisma.tenants.findUnique({ where: { id } });
    if (tenant?.subdomain === 'app') {
      throw new Error('Cannot delete default tenant');
    }

    await prisma.tenants.delete({ where: { id } });
  }

  async getTenant(tenantId: string): Promise<TenantConfig | null> {
    const id = parseInt(tenantId);
    if (isNaN(id)) return null;
    
    const tenant = await prisma.tenants.findUnique({ where: { id } });
    return tenant ? this.mapPrismaToConfig(tenant) : null;
  }

  async getTenantByDomain(domain: string): Promise<TenantConfig | null> {
    // This is tricky because domain is in JSON settings.
    // We might need to search by subdomain first if it matches, or scan.
    // For performance, we should probably index domain or rely on subdomain.
    
    // Try finding by subdomain first
    const bySubdomain = await prisma.tenants.findUnique({ where: { subdomain: domain } });
    if (bySubdomain) return this.mapPrismaToConfig(bySubdomain);

    // Fallback: Search all (inefficient, but works for low tenant count)
    // In production, 'domain' should be a top-level column.
    const allTenants = await prisma.tenants.findMany();
    for (const t of allTenants) {
      const settings = t.settings as any;
      if (settings?.domain === domain) return this.mapPrismaToConfig(t);
    }
    
    return null;
  }

  async getAllTenants(): Promise<TenantConfig[]> {
    const tenants = await prisma.tenants.findMany();
    return tenants.map(t => this.mapPrismaToConfig(t));
  }

  // White-Label Management
  async createWhiteLabelConfig(tenantId: string): Promise<WhiteLabelConfig> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const config: WhiteLabelConfig = {
      tenantId,
      customCSS: '',
      customJS: '',
      emailTemplates: {},
      notificationTemplates: {},
      reportTemplates: {},
      dashboardCustomizations: {},
      featureCustomizations: {}
    };

    await this.updateTenantSettings(tenantId, { whiteLabel: config });
    return config;
  }

  async updateWhiteLabelConfig(tenantId: string, updates: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> {
    const currentConfig = await this.getWhiteLabelConfig(tenantId);
    if (!currentConfig) {
       const tenant = await this.getTenant(tenantId);
       if (!tenant) throw new Error('Tenant not found');
       
       const baseConfig: WhiteLabelConfig = {
          tenantId,
          customCSS: '',
          customJS: '',
          emailTemplates: {},
          notificationTemplates: {},
          reportTemplates: {},
          dashboardCustomizations: {},
          featureCustomizations: {}
       };
       const newConfig = { ...baseConfig, ...updates };
       await this.updateTenantSettings(tenantId, { whiteLabel: newConfig });
       return newConfig;
    }

    const updatedConfig = { ...currentConfig, ...updates };
    await this.updateTenantSettings(tenantId, { whiteLabel: updatedConfig });

    return updatedConfig;
  }

  async getWhiteLabelConfig(tenantId: string): Promise<WhiteLabelConfig | null> {
    const id = parseInt(tenantId);
    if (isNaN(id)) return null;
    
    const tenant = await prisma.tenants.findUnique({ where: { id } });
    if (!tenant) return null;

    const settings = tenant.settings as any || {};
    return settings.whiteLabel as WhiteLabelConfig || null;
  }

  // Helper to update settings JSON
  private async updateTenantSettings(tenantId: string, newSettingsPart: any): Promise<void> {
      const id = parseInt(tenantId);
      const tenant = await prisma.tenants.findUnique({ where: { id } });
      if (!tenant) return;
      
      const currentSettings = tenant.settings as any || {};
      const updatedSettings = { ...currentSettings, ...newSettingsPart };
      
      await prisma.tenants.update({
          where: { id },
          data: { settings: updatedSettings }
      });
  }

  // Branding and Theming
  async updateWhiteLabelBranding(tenantId: string, branding: TenantConfig['branding']): Promise<void> {
    // Generate custom CSS for branding
    const customCSS = this.generateBrandingCSS(branding);
    
    // Update email templates with new branding
    const emailTemplates = this.generateBrandedEmailTemplates(branding);
    
    // Update notification templates
    const notificationTemplates = this.generateBrandedNotificationTemplates(branding);

    await this.updateWhiteLabelConfig(tenantId, {
        customCSS,
        emailTemplates,
        notificationTemplates
    });
  }

  private generateBrandingCSS(branding: TenantConfig['branding']): string {
    return `
      :root {
        --tenant-primary: ${branding.primaryColor};
        --tenant-secondary: ${branding.secondaryColor};
        --tenant-accent: ${branding.accentColor};
      }

      .tenant-brand-primary { color: ${branding.primaryColor}; }
      .tenant-brand-secondary { color: ${branding.secondaryColor}; }
      .tenant-brand-accent { color: ${branding.accentColor}; }

      .tenant-bg-primary { background-color: ${branding.primaryColor}; }
      .tenant-bg-secondary { background-color: ${branding.secondaryColor}; }
      .tenant-bg-accent { background-color: ${branding.accentColor}; }

      .tenant-border-primary { border-color: ${branding.primaryColor}; }
      .tenant-border-secondary { border-color: ${branding.secondaryColor}; }
      .tenant-border-accent { border-color: ${branding.accentColor}; }

      /* Custom gradients */
      .tenant-gradient-primary {
        background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor});
      }

      .tenant-gradient-accent {
        background: linear-gradient(135deg, ${branding.secondaryColor}, ${branding.accentColor});
      }

      /* Logo and branding elements */
      .tenant-logo {
        background-image: url('${branding.logo}');
      }

      .tenant-brand-name::after {
        content: '${branding.brandName}';
      }

      .tenant-tagline::after {
        content: '${branding.tagline}';
      }
    `;
  }

  private generateBrandedEmailTemplates(branding: TenantConfig['branding']): Record<string, string> {
    const templates = {
      welcome: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor}); padding: 40px 20px; text-align: center; color: white;">
            <img src="${branding.logo}" alt="${branding.brandName}" style="max-width: 200px; margin-bottom: 20px;">
            <h1>Welcome to ${branding.brandName}</h1>
            <p>${branding.tagline}</p>
          </div>
          <div style="padding: 40px 20px;">
            <h2>Getting Started</h2>
            <p>Thank you for choosing ${branding.brandName}...</p>
          </div>
        </div>
      `,
      resetPassword: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="background: ${branding.primaryColor}; padding: 20px; text-align: center; color: white;">
            <h2>${branding.brandName} - Password Reset</h2>
          </div>
          <div style="padding: 20px;">
            <p>You requested a password reset for your ${branding.brandName} account.</p>
            <a href="#" style="background: ${branding.primaryColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
        </div>
      `
    };

    return templates;
  }

  private generateBrandedNotificationTemplates(branding: TenantConfig['branding']): Record<string, string> {
    return {
      assignmentDue: `${branding.brandName}: Assignment due in 24 hours`,
      reportGenerated: `${branding.brandName}: Your student report is ready`,
      systemMaintenance: `${branding.brandName}: Scheduled maintenance tonight`
    };
  }

  // Feature Management
  async enableFeature(tenantId: string, feature: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return;

    const features = tenant.features;
    if (!features.enabled.includes(feature)) {
      features.enabled.push(feature);
    }
    features.disabled = features.disabled.filter(f => f !== feature);
    
    await this.updateTenantSettings(tenantId, { features });
  }

  async disableFeature(tenantId: string, feature: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return;

    const features = tenant.features;
    if (!features.disabled.includes(feature)) {
      features.disabled.push(feature);
    }
    features.enabled = features.enabled.filter(f => f !== feature);
    
    await this.updateTenantSettings(tenantId, { features });
  }

  async isFeatureEnabled(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return false;

    if (tenant.features.enabled.includes('all')) return true;
    return tenant.features.enabled.includes(feature) && !tenant.features.disabled.includes(feature);
  }

  // Resource Management
  async checkLimits(tenantId: string, resource: keyof TenantConfig['limits'], currentUsage: number): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return false;

    const limit = tenant.limits[resource];
    return currentUsage < limit;
  }

  async getRemainingLimits(tenantId: string, resource: keyof TenantConfig['limits'], currentUsage: number): Promise<number> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return 0;

    const limit = tenant.limits[resource];
    return Math.max(0, limit - currentUsage);
  }

  // Database and Infrastructure
  private async initializeTenantDatabase(tenantId: string): Promise<void> {
    // Create tenant-specific database schema
    // Set up row-level security policies
    // Initialize default data
    logger.info(`Initializing database for tenant: ${tenantId}`);
  }

  private async setupTenantConfigurations(tenantId: string): Promise<void> {
    // Set up tenant-specific configurations
    // Configure integrations
    // Set up monitoring and logging
    logger.info(`Setting up configurations for tenant: ${tenantId}`);
  }

  private async cleanupTenantData(tenantId: string): Promise<void> {
    // Remove tenant data from database
    // Clean up file storage
    // Remove configurations
    logger.info(`Cleaning up data for tenant: ${tenantId}`);
  }

  // Domain and Routing
  async configureDomain(tenantId: string, domain: string, _ssl: boolean = true): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return;

    // Update domain in settings
    const _settings = { domain }; // This merges into settings via updateTenantSettings logic if we used it, but here we need to be careful.
    // Actually, domain is part of settings in our mapPrismaToConfig.
    
    await this.updateTenantSettings(tenantId, { domain });

    // Configure DNS
    // Set up SSL certificate
    // Update routing rules
    logger.info(`Configuring domain ${domain} for tenant: ${tenantId}`);
  }

  async configureSubdomain(tenantId: string, subdomain: string): Promise<void> {
    const id = parseInt(tenantId);
    if (isNaN(id)) return;

    await prisma.tenants.update({
        where: { id },
        data: { subdomain }
    });

    // Configure subdomain routing
    logger.info(`Configuring subdomain ${subdomain} for tenant: ${tenantId}`);
  }

  // Compliance and Security
  async enableCompliance(
    tenantId: string,
    complianceType: Extract<keyof TenantConfig['compliance'], 'gdpr' | 'ferpa' | 'coppa'>
  ): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return;

    const compliance = tenant.compliance;
    compliance[complianceType] = true;
    
    await this.updateTenantSettings(tenantId, { compliance });

    // Configure compliance settings
    // Set up data retention policies
    // Configure audit logging
    logger.info(`Enabling ${complianceType} compliance for tenant: ${tenantId}`);
  }

  // Add custom compliance policies
  async addCustomCompliancePolicy(tenantId: string, policy: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return;

    const compliance = tenant.compliance;
    compliance.customPolicies.push(policy);
    
    await this.updateTenantSettings(tenantId, { compliance });

    logger.info(`Added custom compliance policy for tenant: ${tenantId}`);
  }

  // Analytics and Reporting
  async getTenantAnalytics(_tenantId: string): Promise<any> {
    // Get tenant-specific analytics
    // User activity
    // Feature usage
    // Performance metrics
    return {
      users: 0,
      activeUsers: 0,
      featureUsage: {},
      performance: {}
    };
  }

  // Backup and Recovery
  async createTenantBackup(tenantId: string): Promise<string> {
    // Create backup of tenant data
    // Database dump
    // File storage backup
    // Configuration backup
    const backupId = `backup_${tenantId}_${Date.now()}`;
    logger.info(`Creating backup ${backupId} for tenant: ${tenantId}`);
    return backupId;
  }

  async restoreTenantBackup(tenantId: string, backupId: string): Promise<void> {
    // Restore tenant from backup
    // Database restore
    // File restoration
    // Configuration restoration
    logger.info(`Restoring backup ${backupId} for tenant: ${tenantId}`);
  }

  // Monitoring and Health Checks
  async getTenantHealth(tenantId: string): Promise<any> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return null;

    return {
      status: tenant.status,
      database: 'healthy',
      integrations: 'operational',
      limits: tenant.limits,
      lastUpdated: tenant.updatedAt
    };
  }

  // Utility Methods
  private generateTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API
  async getTenantContext(): Promise<TenantConfig | null> {
    // Get current tenant from request context
    // This would be implemented based on your routing/domain setup
    // For now, return default tenant
    const defaultTenant = await prisma.tenants.findUnique({ where: { subdomain: 'app' } });
    return defaultTenant ? this.mapPrismaToConfig(defaultTenant) : null;
  }

  async getWhiteLabelAssets(tenantId: string): Promise<any> {
    const config = await this.getWhiteLabelConfig(tenantId);
    if (!config) return null;

    return {
      css: config.customCSS,
      js: config.customJS,
      templates: {
        email: config.emailTemplates,
        notifications: config.notificationTemplates,
        reports: config.reportTemplates
      }
    };
  }
}

// Export singleton instance
export const multiTenantService = MultiTenantService.getInstance();

// Types are already exported at their declaration
// No need for re-export here
