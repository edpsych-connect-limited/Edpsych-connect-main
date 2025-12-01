import { logger } from "@/lib/logger";
/**
 * FHIR Integration Service for EdPsych Connect
 * 
 * This service handles the integration with NHS Digital and other healthcare systems
 * using the FHIR standard. It provides methods for sending and receiving FHIR resources,
 * handling authentication, and managing the data flow between systems.
 */

import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as fhirResources from '../models/fhir-resources';
import {
  UK_CORE_PROFILE_BASE,
  EDU_EXTENSION_SYSTEM
} from '../constants/terminology';
import { FHIRServiceConfig } from '../models/fhir-config';

/**
 * FHIR Service class for handling FHIR API interactions
 */
export class FHIRService {
  private client: AxiosInstance;
  private config: FHIRServiceConfig;

  /**
   * Create a new FHIR service instance
   * @param config The configuration for the FHIR service
   */
  constructor(config: FHIRServiceConfig) {
    this.config = config;

    // Create HTTP client with default configuration
    this.client = axios.create({
      baseURL: config.serverUrl,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      timeout: config.timeout || 30000
    });

    // Add authentication interceptor if credentials provided
    if (config.authType === 'basic' && config.username && config.password) {
      this.setupBasicAuth(config.username, config.password);
    } else if (config.authType === 'bearer' && config.token) {
      this.setupBearerAuth(config.token);
    } else if (config.authType === 'oauth2' && config.clientId && config.clientSecret) {
      this.setupOAuth2Auth(config.clientId, config.clientSecret);
    }
  }

  /**
   * Setup Basic Authentication
   */
  private setupBasicAuth(username: string, password: string): void {
    this.client.interceptors.request.use(config => {
      config.auth = {
        username,
        password
      };
      return config;
    });
  }

  /**
   * Setup Bearer Token Authentication
   */
  private setupBearerAuth(token: string): void {
    this.client.interceptors.request.use(config => {
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  /**
   * Setup OAuth2 Authentication
   * This is a simplified implementation - in a real-world scenario,
   * you would need to handle token refresh and other OAuth2 flows
   */
  private setupOAuth2Auth(_clientId: string, _clientSecret: string): void {
    // Initial token request would go here
    // For now, we'll just log that it's not fully implemented
    console.warn('OAuth2 authentication is not fully implemented yet');
  }

  /**
   * Create a FHIR resource on the server
   * @param resource The FHIR resource to create
   * @returns The created resource with server-assigned ID
   */
  async createResource<T extends fhirResources.FHIRResource>(resource: T): Promise<T> {
    try {
      const response = await this.client.post<T>(
        `/${resource.resourceType}`,
        resource
      );

      return response.data;
    } catch (_error) {
      this.handleError(_error, `Error creating ${resource.resourceType}`);
      throw _error;
    }
  }

  /**
   * Read a FHIR resource from the server
   * @param resourceType The type of resource to read
   * @param id The ID of the resource
   * @returns The requested resource
   */
  async readResource<T extends fhirResources.FHIRResource>(
    resourceType: string,
    id: string
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(`/${resourceType}/${id}`);
      return response.data;
    } catch (_error) {
      this.handleError(_error, `Error reading ${resourceType}/${id}`);
      throw _error;
    }
  }

  /**
   * Update a FHIR resource on the server
   * @param resource The FHIR resource to update
   * @returns The updated resource
   */
  async updateResource<T extends fhirResources.FHIRResource>(resource: T): Promise<T> {
    if (!resource.id) {
      throw new Error(`Cannot update resource without ID: ${resource.resourceType}`);
    }

    try {
      const response = await this.client.put<T>(
        `/${resource.resourceType}/${resource.id}`,
        resource
      );

      return response.data;
    } catch (_error) {
      this.handleError(_error, `Error updating ${resource.resourceType}/${resource.id}`);
      throw _error;
    }
  }

  /**
   * Delete a FHIR resource from the server
   * @param resourceType The type of resource to delete
   * @param id The ID of the resource
   * @returns True if successful
   */
  async deleteResource(resourceType: string, id: string): Promise<boolean> {
    try {
      await this.client.delete(`/${resourceType}/${id}`);
      return true;
    } catch (_error) {
      this.handleError(_error, `Error deleting ${resourceType}/${id}`);
      throw _error;
    }
  }

  /**
   * Search for FHIR resources
   * @param resourceType The type of resource to search for
   * @param params The search parameters
   * @returns Bundle containing search results
   */
  async searchResources<T extends fhirResources.FHIRResource>(
    resourceType: string,
    params: Record<string, string>
  ): Promise<{ total: number; entry: { resource: T }[] }> {
    try {
      const response = await this.client.get(`/${resourceType}`, {
        params
      });

      return {
        total: response.data.total || 0,
        entry: response.data.entry || []
      };
    } catch (_error) {
      this.handleError(_error, `Error searching ${resourceType}`);
      throw _error;
    }
  }

  /**
   * Handle errors from FHIR server
   */
  private handleError(error: any, context: string): void {
    // Log the error for debugging
    console.error(`${context}:`, error);

    // If the error has a response, extract the FHIR OperationOutcome if present
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.resourceType === 'OperationOutcome') {
        const issues = data.issue || [];
        issues.forEach((issue: any) => {
          console.error(`[${issue.severity}] ${issue.diagnostics || issue.details?.text || 'Unknown error'}`);
        });
      }
    }
  }

  /**
   * NHS Digital specific integration methods
   */

  /**
   * Get patient demographics from NHS Digital
   * @param nhsNumber The NHS Number to lookup
   * @returns Patient resource
   */
  async getNHSPatientDemographics(nhsNumber: string): Promise<fhirResources.Patient> {
    if (!this.config.nhsDigitalEnabled) {
      throw new Error('NHS Digital integration is not enabled');
    }

    try {
      const params = {
        identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}`
      };

      const searchResult = await this.searchResources<fhirResources.Patient>('Patient', params);
      
      if (searchResult.total === 0 || !searchResult.entry.length) {
        throw new Error(`Patient with NHS Number ${nhsNumber} not found`);
      }

      return searchResult.entry[0].resource;
    } catch (_error) {
      this.handleError(_error, `Error fetching NHS patient demographics for ${nhsNumber}`);
      throw _error;
    }
  }

  /**
   * Get a patient's mental health records
   * @param nhsNumber The NHS Number to lookup
   * @returns Array of Observation resources
   */
  async getPatientMentalHealthRecords(nhsNumber: string): Promise<fhirResources.Observation[]> {
    if (!this.config.nhsDigitalEnabled) {
      throw new Error('NHS Digital integration is not enabled');
    }

    try {
      // First get the patient
      const params = {
        identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}`
      };

      const patientSearch = await this.searchResources<fhirResources.Patient>('Patient', params);
      
      if (patientSearch.total === 0 || !patientSearch.entry.length) {
        throw new Error(`Patient with NHS Number ${nhsNumber} not found`);
      }

      const patientId = patientSearch.entry[0].resource.id;

      // Then search for mental health observations
      const observationParams = {
        subject: `Patient/${patientId}`,
        category: 'mental-health'
      };

      const observationsSearch = await this.searchResources<fhirResources.Observation>(
        'Observation', 
        observationParams
      );

      return observationsSearch.entry.map(entry => entry.resource);
    } catch (_error) {
      this.handleError(_error, `Error fetching mental health records for ${nhsNumber}`);
      throw _error;
    }
  }

  /**
   * Create a new mental health assessment record
   * @param assessment The mental health assessment
   * @returns The created Observation resource
   */
  async createMentalHealthAssessment(
    assessment: fhirResources.Observation
  ): Promise<fhirResources.Observation> {
    // Ensure it has the mental health category
    if (!assessment.category) {
      assessment.category = [];
    }

    // Add mental health category if not present
    const hasMentalHealthCategory = assessment.category.some(cat => 
      cat.coding?.some(coding => coding.code === 'mental-health')
    );

    if (!hasMentalHealthCategory) {
      assessment.category.push({
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'mental-health',
          display: 'Mental Health'
        }]
      });
    }

    // Add profile
    if (!assessment.meta) {
      assessment.meta = {};
    }
    if (!assessment.meta.profile) {
      assessment.meta.profile = [];
    }
    assessment.meta.profile.push(`${UK_CORE_PROFILE_BASE}/Observation-MentalHealth`);

    // Create the resource
    return this.createResource<fhirResources.Observation>(assessment);
  }

  /**
   * Create a new care plan for a student
   * @param carePlan The care plan
   * @returns The created CarePlan resource
   */
  async createCarePlan(carePlan: fhirResources.CarePlan): Promise<fhirResources.CarePlan> {
    // Add profile
    if (!carePlan.meta) {
      carePlan.meta = {};
    }
    if (!carePlan.meta.profile) {
      carePlan.meta.profile = [];
    }
    carePlan.meta.profile.push(`${UK_CORE_PROFILE_BASE}/CarePlan`);

    // Add educational tag
    if (!carePlan.meta.tag) {
      carePlan.meta.tag = [];
    }
    carePlan.meta.tag.push({
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/tags`,
        code: 'educational',
        display: 'Educational'
      }]
    });

    // Create the resource
    return this.createResource<fhirResources.CarePlan>(carePlan);
  }

  /**
   * Get care plans for a patient
   * @param nhsNumber The NHS Number to lookup
   * @returns Array of CarePlan resources
   */
  async getPatientCarePlans(nhsNumber: string): Promise<fhirResources.CarePlan[]> {
    if (!this.config.nhsDigitalEnabled) {
      throw new Error('NHS Digital integration is not enabled');
    }

    try {
      // First get the patient
      const params = {
        identifier: `https://fhir.nhs.uk/Id/nhs-number|${nhsNumber}`
      };

      const patientSearch = await this.searchResources<fhirResources.Patient>('Patient', params);
      
      if (patientSearch.total === 0 || !patientSearch.entry.length) {
        throw new Error(`Patient with NHS Number ${nhsNumber} not found`);
      }

      const patientId = patientSearch.entry[0].resource.id;

      // Then search for care plans
      const carePlanParams = {
        subject: `Patient/${patientId}`,
        category: 'education'
      };

      const carePlansSearch = await this.searchResources<fhirResources.CarePlan>(
        'CarePlan', 
        carePlanParams
      );

      return carePlansSearch.entry.map(entry => entry.resource);
    } catch (_error) {
      this.handleError(_error, `Error fetching care plans for ${nhsNumber}`);
      throw _error;
    }
  }

  /**
   * Map EdPsych student to NHS patient record
   * @param studentId The EdPsych student ID
   * @param nhsNumber The NHS Number to link with
   * @returns Updated Patient resource
   */
  async mapStudentToNHSPatient(studentId: string, nhsNumber: string): Promise<fhirResources.Patient> {
    // This would be implemented by fetching the student from our system,
    // then the patient from NHS Digital, and creating/updating a mapping
    
    // For now, this is a stub implementation
    logger.debug(`Mapping student ${studentId} to NHS patient ${nhsNumber}`);
    
    // Return a mock patient
    return {
      resourceType: 'Patient',
      id: `edu-patient-${uuidv4()}`,
      meta: {
        profile: [`${UK_CORE_PROFILE_BASE}/Patient`]
      },
      identifier: [{
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: nhsNumber
      }],
      active: true,
      name: [{
        use: 'official',
        family: 'Smith',
        given: ['John']
      }]
    };
  }
}