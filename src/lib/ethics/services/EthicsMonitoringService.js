/**
 * @fileoverview Ethics Monitoring Service
 * 
 * Service responsible for continuous monitoring of ethical metrics,
 * detecting anomalies, and generating incidents when thresholds are exceeded.
 */
import { logger } from '@/lib/logger';

import EthicsMonitor from '../models/EthicsMonitor';
import EthicsIncident from '../models/EthicsIncident';

class EthicsMonitoringService {
  constructor({
    notificationService = null,
    dataAccessService = null,
    metricCollectionService = null,
    schedulerService = null,
    logger = console
  }) {
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
  async initialize() {
    try {
      this.logger.info('Initializing Ethics Monitoring Service');
      
      // Load all enabled monitors from the data store
      const monitors = await this.dataAccessService.getEnabledMonitors();
      
      // Schedule each monitor based on its frequency
      for (const monitor of monitors) {
        await this.scheduleMonitor(monitor);
      }
      
      this.logger.info(`Initialized ${monitors.length} ethics monitors`);
    } catch (_error) {
      this.logger.error('Failed to initialize Ethics Monitoring Service', error);
      throw error;
    }
  }

  /**
   * Schedule a monitor to run based on its frequency
   * @param {EthicsMonitor} monitor - The monitor to schedule
   * @returns {Promise<boolean>} True if scheduling was successful
   */
  async scheduleMonitor(monitor) {
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
        job: async () => this.runMonitor(monitor.id)
      });
      
      // Cache the active monitor
      this.activeMonitors.set(monitor.id, {
        monitor,
        jobId
      });
      
      this.logger.info(`Scheduled monitor ${monitor.id} with frequency ${monitor.frequency}`);
      return true;
    } catch (_error) {
      this.logger.error(`Failed to schedule monitor ${monitor.id}`, error);
      return false;
    }
  }

  /**
   * Run a specific monitor
   * @param {string} monitorId - ID of the monitor to run
   * @returns {Promise<Array>} Array of incidents created during this run
   */
  async runMonitor(monitorId) {
    try {
      this.logger.info(`Running ethics monitor ${monitorId}`);
      
      // Get the monitor from cache or data store
      let monitor;
      if (this.activeMonitors.has(monitorId)) {
        monitor = this.activeMonitors.get(monitorId).monitor;
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
      const incidents = [];
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
    } catch (_error) {
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
  async createIncident(monitor, metric, value) {
    try {
      const threshold = monitor.thresholds[metric.id];
      
      const incident = new EthicsIncident({
        title: `${monitor.name}: ${metric.name} threshold exceeded`,
        description: `The metric ${metric.name} has exceeded the defined threshold. Current value: ${value}, Threshold: ${threshold.value}`,
        monitorId: monitor.id,
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
    } catch (_error) {
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
  async notifyIncident(incident, monitor) {
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
    } catch (_error) {
      this.logger.error(`Failed to send notifications for incident ${incident.id}`, error);
      // Don't throw here, as we don't want the monitor run to fail if notifications fail
    }
  }

  /**
   * Add a new monitor to the system
   * @param {EthicsMonitor} monitor - The monitor to add
   * @returns {Promise<EthicsMonitor>} The saved monitor
   */
  async addMonitor(monitor) {
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
    } catch (_error) {
      this.logger.error('Failed to add ethics monitor', error);
      throw error;
    }
  }

  /**
   * Update an existing monitor
   * @param {EthicsMonitor} monitor - The updated monitor
   * @returns {Promise<EthicsMonitor>} The updated monitor
   */
  async updateMonitor(monitor) {
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
      if (this.activeMonitors.has(monitor.id)) {
        const { jobId } = this.activeMonitors.get(monitor.id);
        await this.schedulerService.cancel(jobId);
        this.activeMonitors.delete(monitor.id);
      }
      
      // If the monitor is enabled, schedule it
      if (updatedMonitor.enabled) {
        await this.scheduleMonitor(updatedMonitor);
      }
      
      this.logger.info(`Updated ethics monitor ${updatedMonitor.id}`);
      return updatedMonitor;
    } catch (_error) {
      this.logger.error(`Failed to update ethics monitor ${monitor.id}`, error);
      throw error;
    }
  }

  /**
   * Delete a monitor
   * @param {string} monitorId - ID of the monitor to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteMonitor(monitorId) {
    try {
      // If the monitor is in the active cache, cancel its job
      if (this.activeMonitors.has(monitorId)) {
        const { jobId } = this.activeMonitors.get(monitorId);
        await this.schedulerService.cancel(jobId);
        this.activeMonitors.delete(monitorId);
      }
      
      // Delete the monitor from the data store
      await this.dataAccessService.deleteMonitor(monitorId);
      
      this.logger.info(`Deleted ethics monitor ${monitorId}`);
      return true;
    } catch (_error) {
      this.logger.error(`Failed to delete ethics monitor ${monitorId}`, error);
      throw error;
    }
  }

  /**
   * Enable a monitor
   * @param {string} monitorId - ID of the monitor to enable
   * @returns {Promise<EthicsMonitor>} The enabled monitor
   */
  async enableMonitor(monitorId) {
    try {
      // Get the monitor
      const monitor = await this.dataAccessService.getMonitorById(monitorId);
      if (!monitor) {
        throw new Error(`Monitor ${monitorId} not found`);
      }
      
      // Update the enabled flag
      monitor.enabled = true;
      
      // Save the updated monitor
      const updatedMonitor = await this.dataAccessService.updateMonitor(monitor);
      
      // Schedule the monitor
      await this.scheduleMonitor(updatedMonitor);
      
      this.logger.info(`Enabled ethics monitor ${monitorId}`);
      return updatedMonitor;
    } catch (_error) {
      this.logger.error(`Failed to enable ethics monitor ${monitorId}`, error);
      throw error;
    }
  }

  /**
   * Disable a monitor
   * @param {string} monitorId - ID of the monitor to disable
   * @returns {Promise<EthicsMonitor>} The disabled monitor
   */
  async disableMonitor(monitorId) {
    try {
      // Get the monitor
      const monitor = await this.dataAccessService.getMonitorById(monitorId);
      if (!monitor) {
        throw new Error(`Monitor ${monitorId} not found`);
      }
      
      // Update the enabled flag
      monitor.enabled = false;
      
      // Save the updated monitor
      const updatedMonitor = await this.dataAccessService.updateMonitor(monitor);
      
      // If the monitor is in the active cache, cancel its job
      if (this.activeMonitors.has(monitorId)) {
        const { jobId } = this.activeMonitors.get(monitorId);
        await this.schedulerService.cancel(jobId);
        this.activeMonitors.delete(monitorId);
      }
      
      this.logger.info(`Disabled ethics monitor ${monitorId}`);
      return updatedMonitor;
    } catch (_error) {
      this.logger.error(`Failed to disable ethics monitor ${monitorId}`, error);
      throw error;
    }
  }

  /**
   * Run a monitor immediately, regardless of its schedule
   * @param {string} monitorId - ID of the monitor to run
   * @returns {Promise<Array>} Array of incidents created during this run
   */
  async runMonitorNow(monitorId) {
    try {
      return await this.runMonitor(monitorId);
    } catch (_error) {
      this.logger.error(`Failed to run ethics monitor ${monitorId} immediately`, error);
      throw error;
    }
  }

  /**
   * Get active incidents
   * @param {Object} filters - Optional filters for the incidents
   * @returns {Promise<Array>} Array of active incidents
   */
  async getActiveIncidents(filters = {}) {
    try {
      return await this.dataAccessService.getActiveIncidents(filters);
    } catch (_error) {
      this.logger.error('Failed to get active incidents', error);
      throw error;
    }
  }

  /**
   * Get incidents by monitor
   * @param {string} monitorId - ID of the monitor
   * @returns {Promise<Array>} Array of incidents for the monitor
   */
  async getIncidentsByMonitor(monitorId) {
    try {
      return await this.dataAccessService.getIncidentsByMonitor(monitorId);
    } catch (_error) {
      this.logger.error(`Failed to get incidents for monitor ${monitorId}`, error);
      throw error;
    }
  }

  /**
   * Convert a frequency string to a scheduler configuration
   * @param {string} frequency - Frequency string ('hourly', 'daily', 'weekly', 'monthly')
   * @returns {Object} Scheduler configuration
   * @private
   */
  getScheduleFromFrequency(frequency) {
    switch (frequency) {
      case 'hourly':
        return { type: 'cron', value: '0 * * * *' }; // Every hour at minute 0
      case 'daily':
        return { type: 'cron', value: '0 0 * * *' }; // Every day at midnight
      case 'weekly':
        return { type: 'cron', value: '0 0 * * 0' }; // Every Sunday at midnight
      case 'monthly':
        return { type: 'cron', value: '0 0 1 * *' }; // 1st of every month at midnight
      default:
        return { type: 'interval', value: 86400000 }; // Default to daily (24 hours in ms)
    }
  }
}

export default EthicsMonitoringService;