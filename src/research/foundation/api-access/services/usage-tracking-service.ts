/**
 * Usage Tracking Service
 * 
 * This service tracks API usage for billing and quota management purposes.
 * It records API calls, calculates costs, and provides usage analytics.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ApiUsageEvent,
  ApiUsageSummary,
  ApiQuotaConsumption,
  ApiKey
} from '../models/api-usage';
import { ApiResourceType } from '../models/api-pricing';
import { API_PRICING_PLANS } from '../models/api-pricing';
import { LicenseService } from '../../licensing/services/license-service';
import { ApiKeyService } from './api-key-service';

/**
 * Service for tracking API usage
 */
export class UsageTrackingService {
  private licenseService: LicenseService;
  private apiKeyService: ApiKeyService;
  
  /**
   * Creates a new instance of the UsageTrackingService
   */
  constructor() {
    this.licenseService = new LicenseService();
    this.apiKeyService = new ApiKeyService();
  }
  
  /**
   * Record an API usage event
   * 
   * @param apiKeyId The API key ID
   * @param endpoint The endpoint accessed
   * @param method The HTTP method used
   * @param statusCode The response status code
   * @param requestSizeBytes The request size in bytes
   * @param responseSizeBytes The response size in bytes
   * @param responseTimeMs The response time in milliseconds
   * @param clientIp The client IP address
   * @param userAgent The client user agent
   * @param additionalDetails Additional resource-specific details
   * @returns The recorded usage event
   */
  public async recordApiUsage(
    apiKeyId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    statusCode: number,
    requestSizeBytes: number,
    responseSizeBytes: number,
    responseTimeMs: number,
    clientIp: string,
    userAgent: string,
    additionalDetails: Record<string, any> = {}
  ): Promise<ApiUsageEvent> {
    // Retrieve the API key to get the license ID
    const apiKey = await this.apiKeyService.getApiKey(apiKeyId);
    
    if (!apiKey) {
      throw new Error(`API key not found: ${apiKeyId}`);
    }
    
    const licenseId = apiKey.licenseId;
    
    // Determine the resource type based on the endpoint and additional details
    const resourceType = this.determineResourceType(endpoint, additionalDetails);
    
    // Calculate the quantity of resource consumed
    const quantity = this.calculateResourceQuantity(resourceType, requestSizeBytes, responseSizeBytes, responseTimeMs, additionalDetails);
    
    // Calculate the cost of this usage
    const cost = await this.calculateCost(apiKey, resourceType, quantity);
    
    // Create the usage event
    const usageEvent: ApiUsageEvent = {
      id: uuidv4(),
      licenseId,
      apiKeyId,
      timestamp: new Date(),
      endpoint,
      method,
      resourceType,
      quantity,
      details: {
        statusCode,
        responseTimeMs,
        requestSizeBytes,
        responseSizeBytes,
        clientIp,
        userAgent,
        ...additionalDetails
      },
      cost,
      billed: false
    };
    
    // In a real implementation, we would save the usage event to the database
    
    // Update the API key's usage statistics
    await this.updateApiKeyUsageStats(apiKeyId, usageEvent);
    
    // Update quota consumption
    await this.updateQuotaConsumption(licenseId, apiKeyId, resourceType, quantity);
    
    return usageEvent;
  }
  
  /**
   * Get usage summary for a license
   *
   * @param licenseId The license ID
   * @param startDate The start date for the summary
   * @param endDate The end date for the summary
   * @returns The usage summary
   */
  public async getUsageSummary(
    _licenseId: string,
    _startDate: Date,
    _endDate: Date
  ): Promise<ApiUsageSummary | null> {
    void(_licenseId);
    void(_startDate);
    void(_endDate);
    // In a real implementation, we would retrieve usage data from the database
    // and generate a summary

    // For now, we'll return null to simulate no usage data
    return null;
  }
  
  /**
   * Get current quota consumption for a license
   *
   * @param licenseId The license ID
   * @param resourceType The resource type
   * @returns The quota consumption
   */
  public async getQuotaConsumption(
    _licenseId: string,
    _resourceType: ApiResourceType
  ): Promise<ApiQuotaConsumption | null> {
    void(_licenseId);
    void(_resourceType);
    // In a real implementation, we would retrieve quota consumption from the database

    // For now, we'll return null to simulate no quota data
    return null;
  }
  
  /**
   * Check if a license has quota available for a specific resource
   *
   * @param licenseId The license ID
   * @param apiKeyId The API key ID
   * @param resourceType The resource type
   * @param quantity The quantity to check
   * @returns True if quota is available, false otherwise
   */
  public async hasQuotaAvailable(
    _licenseId: string,
    _apiKeyId: string,
    _resourceType: ApiResourceType,
    _quantity: number
  ): Promise<boolean> {
    void(_apiKeyId);
    // In a real implementation, we would check if the license has quota available

    // For now, we'll check with the license service
    return await this.licenseService.hasQuotaAvailable(
      _licenseId,
      this.mapResourceTypeToQuotaType(_resourceType),
      _quantity
    );
  }
  
  /**
   * Get API usage alerts for a license
   *
   * @param licenseId The license ID
   * @returns The API usage alerts
   */
  public async getApiUsageAlerts(_licenseId: string): Promise<any[]> {
    void(_licenseId);
    // In a real implementation, we would retrieve alerts from the database

    // For now, we'll return an empty array to simulate no alerts
    return [];
  }
  
  /**
   * Generate an invoice for a license based on usage
   *
   * @param licenseId The license ID
   * @param billingPeriodStart The billing period start date
   * @param billingPeriodEnd The billing period end date
   * @returns The generated invoice
   */
  public async generateInvoice(
    _licenseId: string,
    _billingPeriodStart: Date,
    _billingPeriodEnd: Date
  ): Promise<any> {
    void(_licenseId);
    void(_billingPeriodStart);
    void(_billingPeriodEnd);
    // In a real implementation, we would generate an invoice based on usage

    // For now, we'll return an empty object to simulate no invoice
    return {};
  }
  
  /**
   * Check if a request would exceed the rate limit
   * 
   * @param apiKeyId The API key ID
   * @returns Information about the rate limit check
   */
  public async checkRateLimit(apiKeyId: string): Promise<{
    exceeded: boolean;
    resetAt: Date;
    currentCount: number;
    limit: number;
  }> {
    // We'll delegate to the API key service
    return await this.apiKeyService.checkRateLimit(apiKeyId);
  }
  
  /**
   * Generate usage report for a license
   *
   * @param licenseId The license ID
   * @param startDate The start date for the report
   * @param endDate The end date for the report
   * @param groupBy How to group the data ('day', 'week', 'month', 'endpoint', 'resource')
   * @returns The generated report
   */
  public async generateUsageReport(
    _licenseId: string,
    _startDate: Date,
    _endDate: Date,
    _groupBy: 'day' | 'week' | 'month' | 'endpoint' | 'resource' = 'day'
  ): Promise<any> {
    void(_licenseId);
    void(_startDate);
    void(_endDate);
    void(_groupBy);
    // In a real implementation, we would generate a report based on usage

    // For now, we'll return an empty object to simulate no report
    return {};
  }
  
  /**
   * Determine the resource type based on the endpoint and additional details
   * 
   * @param endpoint The endpoint accessed
   * @param additionalDetails Additional resource-specific details
   * @returns The resource type
   */
  private determineResourceType(
    endpoint: string,
    additionalDetails: Record<string, any>
  ): ApiResourceType {
    // In a real implementation, we would determine the resource type based on the endpoint
    // and additional details
    
    // For example, machine learning endpoints would be ML_TRAINING_HOUR
    if (endpoint.includes('/ml/') || endpoint.includes('/ai/')) {
      return ApiResourceType.ML_TRAINING_HOUR;
    }
    
    // Data transfer endpoints
    if (endpoint.includes('/data/export') || endpoint.includes('/data/import')) {
      return ApiResourceType.DATA_TRANSFER_GB;
    }
    
    // Database query endpoints
    if (endpoint.includes('/query') || endpoint.includes('/search')) {
      return ApiResourceType.DATABASE_QUERY;
    }
    
    // Storage endpoints
    if (endpoint.includes('/storage/') || endpoint.includes('/files/')) {
      return ApiResourceType.STORAGE_GB;
    }
    
    // Compute-intensive endpoints
    if (additionalDetails.computeIntensive || additionalDetails.longRunning) {
      return ApiResourceType.COMPUTE_HOUR;
    }
    
    // Default to API call
    return ApiResourceType.API_CALL;
  }
  
  /**
   * Calculate the quantity of resource consumed
   * 
   * @param resourceType The resource type
   * @param requestSizeBytes The request size in bytes
   * @param responseSizeBytes The response size in bytes
   * @param responseTimeMs The response time in milliseconds
   * @param additionalDetails Additional resource-specific details
   * @returns The quantity consumed
   */
  private calculateResourceQuantity(
    resourceType: ApiResourceType,
    requestSizeBytes: number,
    responseSizeBytes: number,
    responseTimeMs: number,
    additionalDetails: Record<string, any>
  ): number {
    switch (resourceType) {
      case ApiResourceType.API_CALL:
        // One API call = 1 unit
        return 1;
        
      case ApiResourceType.DATA_TRANSFER_GB:
        // Convert bytes to GB
        const totalBytes = requestSizeBytes + responseSizeBytes;
        return totalBytes / (1024 * 1024 * 1024);
        
      case ApiResourceType.STORAGE_GB:
        // Get storage amount from additional details
        return additionalDetails.storageGB || 0;
        
      case ApiResourceType.COMPUTE_HOUR:
        // Convert milliseconds to hours
        return responseTimeMs / (1000 * 60 * 60);
        
      case ApiResourceType.ML_TRAINING_HOUR:
        // Get training time from additional details
        return additionalDetails.trainingTimeHours || 0;
        
      case ApiResourceType.DATABASE_QUERY:
        // One database query = 1 unit
        return 1;
        
      default:
        return 1;
    }
  }
  
  /**
   * Calculate the cost of a usage event
   * 
   * @param apiKey The API key
   * @param resourceType The resource type
   * @param quantity The quantity consumed
   * @returns The cost in GBP
   */
  private async calculateCost(
    apiKey: ApiKey,
    resourceType: ApiResourceType,
    quantity: number
  ): Promise<number> {
    // Get the license
    const license = await this.licenseService.getLicense(apiKey.licenseId);
    
    if (!license) {
      throw new Error(`License not found: ${apiKey.licenseId}`);
    }
    
    // Get the pricing plan from the license
    // In a real implementation, we would have a mapping from license tier to pricing plan
    const pricingPlanId = this.determinePricingPlanFromLicense(license);
    const pricingPlan = API_PRICING_PLANS[pricingPlanId];
    
    if (!pricingPlan) {
      throw new Error(`Pricing plan not found for license: ${apiKey.licenseId}`);
    }
    
    // Find the resource pricing
    const resourcePricing = pricingPlan.resourcePricing.find(
      rp => rp.resourceType === resourceType
    );
    
    if (!resourcePricing) {
      // Default to API call pricing if resource pricing not found
      const defaultPricing = pricingPlan.resourcePricing.find(
        rp => rp.resourceType === ApiResourceType.API_CALL
      );
      
      if (!defaultPricing) {
        throw new Error(`Resource pricing not found for resource type: ${resourceType}`);
      }
      
      return this.calculateResourceCost(defaultPricing, quantity);
    }
    
    return this.calculateResourceCost(resourcePricing, quantity);
  }
  
  /**
   * Calculate the cost for a specific resource
   * 
   * @param resourcePricing The resource pricing
   * @param quantity The quantity consumed
   * @returns The cost in GBP
   */
  private calculateResourceCost(
    resourcePricing: any,
    quantity: number
  ): number {
    // Check if quantity is included in the base price
    if (quantity <= resourcePricing.includedUnits) {
      return 0;
    }
    
    // Calculate the billable quantity
    const billableQuantity = quantity - resourcePricing.includedUnits;
    
    // Check for volume discounts
    if (resourcePricing.volumeDiscounts && resourcePricing.volumeDiscounts.length > 0) {
      // Sort discounts by minimum units in descending order
      const sortedDiscounts = [...resourcePricing.volumeDiscounts].sort(
        (a, b) => b.minUnits - a.minUnits
      );
      
      // Find the applicable discount
      for (const discount of sortedDiscounts) {
        if (billableQuantity >= discount.minUnits) {
          return billableQuantity * discount.discountedPrice;
        }
      }
    }
    
    // No applicable discount, use base price
    return billableQuantity * resourcePricing.pricePerUnit;
  }
  
  /**
   * Map resource type to quota type
   * 
   * @param resourceType The resource type
   * @returns The quota type
   */
  private mapResourceTypeToQuotaType(
    resourceType: ApiResourceType
  ): 'users' | 'subjects' | 'storage' | 'apiRequests' {
    switch (resourceType) {
      case ApiResourceType.STORAGE_GB:
        return 'storage';
        
      case ApiResourceType.API_CALL:
      case ApiResourceType.DATABASE_QUERY:
        return 'apiRequests';
        
      default:
        return 'apiRequests';
    }
  }
  
  /**
   * Determine pricing plan from license
   * 
   * @param license The license
   * @returns The pricing plan ID
   */
  private determinePricingPlanFromLicense(license: any): string {
    // In a real implementation, we would have a mapping from license tier to pricing plan
    
    // For now, we'll use a simple mapping
    switch (license.definition.tier) {
      case 'educational_basic':
        return 'basic';
        
      case 'educational_premium':
      case 'academic':
        return 'standard';
        
      case 'research_standard':
      case 'research_premium':
      case 'non_profit':
        return 'premium';
        
      case 'commercial':
      case 'government':
      case 'healthcare':
        return 'enterprise';
        
      case 'api_access':
        return 'pay_as_you_go';
        
      default:
        return 'basic';
    }
  }
  
  /**
   * Update API key usage statistics
   *
   * @param apiKeyId The API key ID
   * @param usageEvent The usage event
   */
  private async updateApiKeyUsageStats(
    _apiKeyId: string,
    _usageEvent: ApiUsageEvent
  ): Promise<void> {
    void(_apiKeyId);
    void(_usageEvent);
    // In a real implementation, we would update the API key usage statistics in the database
  }
  
  /**
   * Update quota consumption
   *
   * @param licenseId The license ID
   * @param apiKeyId The API key ID
   * @param resourceType The resource type
   * @param quantity The quantity consumed
   */
  private async updateQuotaConsumption(
    _licenseId: string,
    _apiKeyId: string,
    _resourceType: ApiResourceType,
    _quantity: number
  ): Promise<void> {
    void(_apiKeyId);
    // In a real implementation, we would update the quota consumption in the database

    // Update the license usage statistics
    if (_resourceType === ApiResourceType.API_CALL) {
      await this.licenseService.updateLicenseUsage(_licenseId, {
        apiRequestsToday: _quantity
      });
    }
  }
}