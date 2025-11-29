/**
 * Data Sovereignty & Integration Strategy
 * 
 * This document outlines the technical architecture for enabling:
 * 1. Local Authority / School Data Ownership (BYOD - Bring Your Own Database)
 * 2. Secure MIS/SIS Integrations (SIMS, Wonde, Arbor)
 * 3. Hybrid Cloud Deployment Models
 */

export interface DataSovereigntyConfig {
  mode: 'cloud' | 'hybrid' | 'on-premise';
  storage_location: 'eu-west-2' | 'local-gateway';
  encryption_key_management: 'platform' | 'customer-managed';
}

export interface IntegrationConfig {
  provider: 'wonde' | 'sims-primary' | 'arbor' | 'bromcom';
  sync_frequency: 'realtime' | 'daily' | 'manual';
  write_back_enabled: boolean;
}
