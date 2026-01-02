/**
 * @fileoverview Ethics Monitoring Service
 * 
 * Service responsible for continuous monitoring of ethical metrics,
 * detecting anomalies, and generating incidents when thresholds are exceeded.
 */

import { EthicsMonitor } from '../models/EthicsMonitor';
import { EthicsIncident } from '../models/EthicsIncident';

export interface EthicsMonitoringServiceOptions {
  notificationService?: any;
  dataAccessService?: any;
  metricCollectionService?: any;
  schedulerService?: any;
  logger?: any;
}

export class EthicsMonitoringService {
  notificationService: any;
  dataAccessService: any;
  metricCollectionService: any;
  schedulerService: any;
  logger: any;
  activeMonitors: Map<string, { monitor: EthicsMonitor; jobId: string }>;

  constructor({
    notificationService = null,
    dataAccessService = null,
    metricCollectionService = null,
    schedulerService = null,
    logger = console
  }: EthicsMonitoringServiceOptions = {}) {
    this.notificationService = notificationService;
    this.dataAccessService = dataAccessService;
    this.metricCollectionService = metricCollectionService;
    this.schedulerService = schedulerService;
    this.logger = logger;
    
    // In-memory cache of active monitors
    this.activeMonitors = new Map();
  }

  /**
   * Initialize the monitoring service
   * Loads all enabled monitors and schedules them
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Ethics Monitoring Service');
      
      // Load all enabled monitors from the data store
      const monitors = await this.dataAccessService.getEnabledMonitors();
      
      // Schedule each monitor based on its frequency
      for (const monitor of monitors) {
        await this.scheduleMonitor(monitor);
      }
      
      this.logger.info(`Initialized ${monitors.length} ethics monitors`);
    } catch (error) {
      this.logger.error('Failed to initialize Ethics Monitoring Service', error);
      throw error;
    }
  }

  /**
   * Schedule a monitor to run based on its frequency
   * @param {EthicsMonitor} monitor - The monitor to schedule
   * @returns {Promise<boolean>} True if scheduling was successful
   */
  async scheduleMonitor(monitor: EthicsMonitor): Promise<boolean> {
    if (!monitor.isValid()) {
      this.logger.warn(`Monitor ${monitor.id} is invalid and will not be scheduled`);
      return false;
    }
    
    try {
      // Convert monitor frequency to scheduler format
      const frequency = this.getScheduleFromFrequency(monitor.frequency);
      
      // Schedule the monitor
      const jobId = await this.schedulerService.schedule({
        name: `ethics-monitor-${monitor.id}`,
        frequency,
        job: async () => this.runMonitor(monitor.id!)
      });
      
      // Cache the active monitor
      this.activeMonitors.set(monitor.id!, {
        monitor,
        jobId
      });
      
      this.logger.info(`Scheduled monitor ${monitor.id} with frequency ${monitor.frequency}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to schedule monitor ${monitor.id}`, error);
      return false;
    }
  }

  /**
   * Run a specific monitor
   * @param {string} monitorId - ID of the monitor to run
   * @returns {Promise<Array<EthicsIncident>>} Array of incidents created during this run
   */
  async runMonitor(monitorId: string): Promise<EthicsIncident[]> {
    try {
      this.logger.info(`Running ethics monitor ${monitorId}`);
      
      // Get the monitor from cache or data store
      let monitor: EthicsMonitor;
      if (this.activeMonitors.has(monitorId)) {
        monitor = this.activeMonitors.get(monitorId)!.monitor;
      } else {
        monitor = await this.dataAccessService.getMonitorById(monitorId);
        if (!monitor) {
          throw new Error(`Monitor ${monitorId} not found`);
        }
      }
      
      // Update last run timestamp
      monitor.lastRunAt = new Date();
      await this.dataAccessService.updateMonitor(monitor);
      
      // Collect metrics for each metric defined in the monitor
      const incidents: EthicsIncident[] = [];
      for (const metric of monitor.metrics) {
        const metricId = metric.id;
        
        // Collect the current value for this metric
        const value = await this.metricCollectionService.collectMetric(metricId, metric.parameters);
        
        // Check if the threshold is exceeded
        if (monitor.isThresholdExceeded(metricId, value)) {
          // Create an incident
          const incident = await this.createIncident(monitor, metric, value);
          incidents.push(incident);
          
          // Send notifications
          await this.notifyIncident(incident, monitor);
        }
      }
      
      this.logger.info(`Completed ethics monitor ${monitorId}, created ${incidents.length} incidents`);
      return incidents;
    } catch (error) {
      this.logger.error(`Error running ethics monitor ${monitorId}`, error);
      throw error;
    }
  }

  /**
   * Create a new ethics incident
   * @param {EthicsMonitor} monitor - The monitor that detected the incident
   * @param {Object} metric - The metric that triggered the incident
   * @param {*} value - The current value of the metric
   * @returns {Promise<EthicsIncident>} The created incident
   */
  async createIncident(monitor: EthicsMonitor, metric: any, value: any): Promise<EthicsIncident> {
    try {
      const threshold = monitor.thresholds[metric.id];
      
      const incident = new EthicsIncident({
        title: `${monitor.name}: ${metric.name} threshold exceeded`,
        description: `The metric ${metric.name} has exceeded the defined threshold. Current value: ${value}, Threshold: ${threshold.value}`,
        monitorId: monitor.id!,
        metricId: metric.id,
        metricValue: value,
        thresholdValue: threshold.value,
        severity: monitor.severity,
        tags: [...monitor.tags, metric.category]
      });
      
      // Save the incident to the data store
      const savedIncident = await this.dataAccessService.createIncident(incident);
      
      this.logger.info(`Created ethics incident ${savedIncident.id} for monitor ${monitor.id}`);
      return savedIncident;
    } catch (error) {
      this.logger.error('Failed to create ethics incident', error);
      throw error;
    }
  }

  /**
   * Send notifications for a new incident
   * @param {EthicsIncident} incident - The incident to notify about
   * @param {EthicsMonitor} monitor - The monitor that created the incident
   * @returns {Promise<void>}
   */
  async notifyIncident(incident: EthicsIncident, monitor: EthicsMonitor): Promise<void> {
    if (!this.notificationService) {
      this.logger.warn('Notification service not available, skipping incident notification');
      return;
    }
    
    try {
      // For each notification target defined in the monitor
      for (const target of monitor.notificationTargets) {
        await this.notificationService.sendNotification({
          channel: target.channel,
          recipient: target.recipient,
          subject: `Ethics Incident: ${incident.title}`,
          message: `
Ethics incident detected:
ID: ${incident.id}
Title: ${incident.title}
Description: ${incident.description}
Severity: ${incident.severity}
Detected at: ${incident.detectedAt.toISOString()}

Please review this incident in the ethics dashboard.
          `,
          data: {
            incidentId: incident.id,
            monitorId: monitor.id,
            severity: incident.severity,
            metricId: incident.metricId,
            metricValue: incident.metricValue,
            thresholdValue: incident.thresholdValue
          }
        });
      }
      
      this.logger.info(`Sent notifications for incident ${incident.id}`);
    } catch (error) {
      this.logger.error(`Failed to send notifications for incident ${incident.id}`, error);
      // Don't throw here, as we don't want the monitor run to fail if notifications fail
    }
  }

  /**
   * Add a new monitor to the system
   * @param {EthicsMonitor} monitor - The monitor to add
   * @returns {Promise<EthicsMonitor>} The saved monitor
   */
  async addMonitor(monitor: EthicsMonitor): Promise<EthicsMonitor> {
    try {
      // Validate the monitor
      if (!monitor.isValid()) {
        throw new Error('Invalid monitor configuration');
      }
      
      // Save the monitor to the data store
      const savedMonitor = await this.dataAccessService.createMonitor(monitor);
      
      // If the monitor is enabled, schedule it
      if (savedMonitor.enabled) {
        await this.scheduleMonitor(savedMonitor);
      }
      
      this.logger.info(`Added ethics monitor ${savedMonitor.id}`);
      return savedMonitor;
    } catch (error) {
      this.logger.error('Failed to add ethics monitor', error);
      throw error;
    }
  }

  /**
   * Update an existing monitor
   * @param {EthicsMonitor} monitor - The updated monitor
   * @returns {Promise<EthicsMonitor>} The updated monitor
   */
  async updateMonitor(monitor: EthicsMonitor): Promise<EthicsMonitor> {
    try {
      // Validate the monitor
      if (!monitor.isValid()) {
        throw new Error('Invalid monitor configuration');
      }
      
      // Get the existing monitor
      const existingMonitor = await this.dataAccessService.getMonitorById(monitor.id);
      if (!existingMonitor) {
        throw new Error(`Monitor ${monitor.id} not found`);
      }
      
      // Save the updated monitor
      const updatedMonitor = await this.dataAccessService.updateMonitor(monitor);
      
      // If the monitor is in the active cache, remove it
      if (this.activeMonitors.has(monitor.id!)) {
        const { jobId } = this.activeMonitors.get(monitor.id!)!;
        await this.schedulerService.cancel(jobId);
        this.activeMonitors.delete(monitor.id!);
      }
      
      // If the monitor is enabled, schedule it
      if (updatedMonitor.enabled) {
        await this.scheduleMonitor(updatedMonitor);
      }
      
      this.logger.info(`Updated ethics monitor ${updatedMonitor.id}`);
      return updatedMonitor;
    } catch (error) {
      this.logger.error(`Failed to update ethics monitor ${monitor.id}`, error);
      throw error;
    }
  }

  /**
   * Delete a monitor
   * @param {string} monitorId - ID of the monitor to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteMonitor(monitorId: string): Promise<boolean> {
    try {
      // If the monitor is in the active cache, cancel its job
      if (this.activeMonitors.has(monitorId)) {
        const { jobId } = this.activeMonitors.get(monitorId)!;
        await this.schedulerService.cancel(jobId);
        this.activeMonitors.delete(monitorId);
      }
      
      // Delete from data store
      await this.dataAccessService.deleteMonitor(monitorId);
      
      this.logger.info(`Deleted ethics monitor ${monitorId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete ethics monitor ${monitorId}`, error);
      throw error;
    }
  }

  /**
   * Helper to convert frequency string to scheduler format
   * @private
   */
  private getScheduleFromFrequency(frequency: string): string {
    // Implementation depends on scheduler service format
    // This is a placeholder
    return frequency;
  }
}
