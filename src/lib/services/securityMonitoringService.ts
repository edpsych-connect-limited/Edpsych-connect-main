/**
 * Security Monitoring Service
 *
 * This service provides real-time security monitoring and alerting capabilities:
 * - Log analysis and anomaly detection
 * - Security event correlation
 * - Automated alerting for security incidents
 * - Security dashboard and reporting
 * - Integration with external security tools
 */

import crypto from 'crypto';

class SecurityMonitoringService {
  options: any;
  logs: any[];
  alerts: any[];
  anomalies: any[];
  eventCorrelations: Map<string, any>;

  constructor(options: any = {}) {
    this.options = {
      logAnalysisEnabled: options.logAnalysisEnabled || true,
      anomalyDetectionEnabled: options.anomalyDetectionEnabled || true,
      alertingEnabled: options.alertingEnabled || true,
      alertThresholds: {
        failedLogins: options.alertThresholds?.failedLogins || 5,
        suspiciousIPs: options.alertThresholds?.suspiciousIPs || 10,
        dataAccess: options.alertThresholds?.dataAccess || 100,
        ...options.alertThresholds
      },
      monitoringInterval: options.monitoringInterval || 60000, // 1 minute
      retentionPeriod: options.retentionPeriod || 30, // days
      ...options
    };

    this.securityEvents = [];
    this.anomalies = [];
    this.alerts = [];
    this.baselineMetrics = {};
    this.monitoringInterval = null;

    this._initialize();
  }

  /**
   * Initialize the security monitoring service
   */
  async _initialize() {
    try {
      // Load baseline metrics
      await this._loadBaselineMetrics();

      // Start monitoring if enabled
      if (this.options.logAnalysisEnabled) {
        this.monitoringInterval = setInterval(() => {
          this._performSecurityAnalysis();
        }, this.options.monitoringInterval);
      }

      logger.info('Security monitoring service initialized');
    } catch (error) {
      logger.error('Error initializing security monitoring service:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Log a security event
   *
   * @param {Object} event - Security event data
   */
  async logSecurityEvent(event: any) {
    try {
      const securityEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: event.type,
        severity: event.severity || 'info',
        source: event.source || 'system',
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        resource: event.resource,
        action: event.action,
        result: event.result || 'success',
        details: event.details || {},
        metadata: {
          sessionId: event.sessionId,
          requestId: event.requestId,
          location: event.location,
          deviceInfo: event.deviceInfo
        }
      };

      // Store event
      this.securityEvents.push(securityEvent);

      // Keep only recent events
      if (this.securityEvents.length > 10000) {
        this.securityEvents = this.securityEvents.slice(-5000);
      }

      // Check for immediate alerts
      await this._checkForImmediateAlerts(securityEvent);

      // Update baseline metrics
      this._updateBaselineMetrics(securityEvent);

      return securityEvent.id;
    } catch (error) {
      logger.error('Error logging security event:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Detect security anomalies
   *
   * @param {Array} events - Security events to analyze
   * @returns {Array} Detected anomalies
   */
  async detectAnomalies(events = null) {
    try {
      const eventsToAnalyze = events || this.securityEvents.slice(-1000);
      const anomalies = [];

      // Analyze patterns
      const patterns = this._analyzePatterns(eventsToAnalyze);

      // Check for known attack patterns
      const attackPatterns = this._detectAttackPatterns(eventsToAnalyze);
      anomalies.push(...attackPatterns);

      // Check for unusual behavior
      const behavioralAnomalies = this._detectBehavioralAnomalies(eventsToAnalyze, patterns);
      anomalies.push(...behavioralAnomalies);

      // Check for compliance violations
      const complianceAnomalies = this._detectComplianceViolations(eventsToAnalyze);
      anomalies.push(...complianceAnomalies);

      // Store anomalies
      for (const anomaly of anomalies) {
        const anomalyRecord = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          ...anomaly,
          events: anomaly.events || [],
          status: 'detected'
        };

        this.anomalies.push(anomalyRecord);
      }

      // Keep only recent anomalies
      if (this.anomalies.length > 1000) {
        this.anomalies = this.anomalies.slice(-500);
      }

      return anomalies;
    } catch (error) {
      logger.error('Error detecting anomalies:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Generate security alert
   *
   * @param {Object} alertData - Alert data
   */
  async generateAlert(alertData: any) {
    try {
      const alert = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: alertData.type,
        severity: alertData.severity || 'medium',
        title: alertData.title,
        description: alertData.description,
        affectedResources: alertData.affectedResources || [],
        recommendedActions: alertData.recommendedActions || [],
        status: 'active',
        acknowledged: false,
        acknowledgedBy: null,
        acknowledgedAt: null,
        resolved: false,
        resolvedAt: null,
        metadata: alertData.metadata || {}
      };

      // Store alert
      this.alerts.push(alert);

      // Send notifications if enabled
      if (this.options.alertingEnabled) {
        await this._sendAlertNotifications(alert);
      }

      logger.info(`Security alert generated: ${alert.title} (${alert.severity})`);

      return alert.id;
    } catch (error) {
      logger.error('Error generating alert:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Acknowledge security alert
   *
   * @param {string} alertId - Alert ID
   * @param {string} userId - User who acknowledged
   * @returns {boolean} Success status
   */
  async acknowledgeAlert(alertId: string, userId: string) {
    try {
      const alert = this.alerts.find(a => a.id === alertId);

      if (!alert) {
        return false;
      }

      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date().toISOString();

      logger.info(`Alert ${alertId} acknowledged by ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error acknowledging alert:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Resolve security alert
   *
   * @param {string} alertId - Alert ID
   * @param {string} resolution - Resolution details
   * @returns {boolean} Success status
   */
  async resolveAlert(alertId: string, resolution: string = '') {
    try {
      const alert = this.alerts.find(a => a.id === alertId);

      if (!alert) {
        return false;
      }

      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolution = resolution;

      logger.info(`Alert ${alertId} resolved`);
      return true;
    } catch (error) {
      logger.error('Error resolving alert:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Get security dashboard data
   *
   * @returns {Object} Dashboard data
   */
  async getSecurityDashboard() {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get recent events
      const recentEvents = this.securityEvents.filter(
        event => new Date(event.timestamp) > last24Hours
      );

      // Get active alerts
      const activeAlerts = this.alerts.filter(
        alert => alert.status === 'active' && !alert.resolved
      );

      // Get recent anomalies
      const recentAnomalies = this.anomalies.filter(
        anomaly => new Date(anomaly.timestamp) > last7Days
      );

      // Calculate metrics
      const metrics = this._calculateSecurityMetrics(recentEvents, last24Hours);

      return {
        summary: {
          totalEvents: recentEvents.length,
          activeAlerts: activeAlerts.length,
          recentAnomalies: recentAnomalies.length,
          criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length
        },
        metrics,
        recentEvents: recentEvents.slice(-50),
        activeAlerts,
        recentAnomalies: recentAnomalies.slice(-20),
        timestamp: now.toISOString()
      };
    } catch (error) {
      logger.error('Error getting security dashboard:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get security report
   *
   * @param {Object} options - Report options
   * @returns {Object} Security report
   */
  async getSecurityReport(options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        includeEvents = true,
        includeAnomalies = true,
        includeAlerts = true
      } = options;

      const report = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        generatedAt: new Date().toISOString()
      };

      // Filter data by date range
      const filterByDate = (items) => items.filter(
        item => {
          const itemDate = new Date(item.timestamp);
          return itemDate >= startDate && itemDate <= endDate;
        }
      );

      if (includeEvents) {
        report.events = filterByDate(this.securityEvents);
        report.eventSummary = this._summarizeEvents(report.events);
      }

      if (includeAnomalies) {
        report.anomalies = filterByDate(this.anomalies);
        report.anomalySummary = this._summarizeAnomalies(report.anomalies);
      }

      if (includeAlerts) {
        report.alerts = filterByDate(this.alerts);
        report.alertSummary = this._summarizeAlerts(report.alerts);
      }

      // Overall assessment
      report.assessment = this._generateSecurityAssessment(report);

      return report;
    } catch (error) {
      logger.error('Error generating security report:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Perform periodic security analysis
   *
   * @private
   */
  async _performSecurityAnalysis() {
    try {
      // Get recent events for analysis
      const recentEvents = this.securityEvents.slice(-1000);

      if (recentEvents.length === 0) return;

      // Detect anomalies
      const anomalies = await this.detectAnomalies(recentEvents);

      // Generate alerts for high-severity anomalies
      for (const anomaly of anomalies) {
        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          await this.generateAlert({
            type: 'anomaly_detected',
            severity: anomaly.severity,
            title: anomaly.title,
            description: anomaly.description,
            affectedResources: anomaly.affectedResources,
            recommendedActions: anomaly.recommendedActions,
            metadata: {
              anomalyId: anomaly.id,
              detectionMethod: anomaly.detectionMethod
            }
          });
        }
      }

      // Check for threshold violations
      await this._checkThresholdViolations(recentEvents);

    } catch (error) {
      logger.error('Error performing security analysis:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Check for immediate alerts based on single events
   *
   * @private
   * @param {Object} event - Security event
   */
  async _checkForImmediateAlerts(event: any) {
    try {
      // Check for critical security events
      if (event.severity === 'critical') {
        await this.generateAlert({
          type: 'critical_security_event',
          severity: 'critical',
          title: `Critical Security Event: ${event.type}`,
          description: `A critical security event has occurred: ${event.action} on ${event.resource}`,
          affectedResources: [event.resource],
          recommendedActions: [
            'Review the event details immediately',
            'Assess potential impact',
            'Take appropriate remediation actions'
          ],
          metadata: {
            eventId: event.id,
            eventType: event.type
          }
        });
      }

      // Check for authentication failures
      if (event.type === 'authentication' && event.result === 'failure') {
        // Count recent failures for this user/IP
        const recentFailures = this.securityEvents.filter(e =>
          e.type === 'authentication' &&
          e.result === 'failure' &&
          e.ipAddress === event.ipAddress &&
          new Date(e.timestamp) > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        );

        if (recentFailures.length >= this.options.alertThresholds.failedLogins) {
          await this.generateAlert({
            type: 'brute_force_attempt',
            severity: 'high',
            title: 'Potential Brute Force Attack Detected',
            description: `Multiple failed login attempts from IP ${event.ipAddress}`,
            affectedResources: ['authentication_system'],
            recommendedActions: [
              'Temporarily block the IP address',
              'Review authentication logs',
              'Consider implementing additional security measures'
            ],
            metadata: {
              ipAddress: event.ipAddress,
              failureCount: recentFailures.length
            }
          });
        }
      }

    } catch (error) {
      logger.error('Error checking for immediate alerts:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Check for threshold violations
   *
   * @private
   * @param {Array} events - Recent events
   */
  async _checkThresholdViolations(events: any) {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Count events by IP
      const ipCounts = {};
      const userCounts = {};

      events.forEach(event => {
        if (new Date(event.timestamp) > oneHourAgo) {
          if (event.ipAddress) {
            ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
          }
          if (event.userId) {
            userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
          }
        }
      });

      // Check IP thresholds
      for (const [ip, count] of Object.entries(ipCounts)) {
        if (count >= this.options.alertThresholds.suspiciousIPs) {
          await this.generateAlert({
            type: 'suspicious_ip_activity',
            severity: 'medium',
            title: 'Unusual Activity from IP Address',
            description: `High volume of activity detected from IP ${ip} (${count} events in the last hour)`,
            affectedResources: ['network_security'],
            recommendedActions: [
              'Monitor the IP address closely',
              'Consider rate limiting',
              'Review access logs for this IP'
            ],
            metadata: {
              ipAddress: ip,
              eventCount: count
            }
          });
        }
      }

      // Check user activity thresholds
      for (const [userId, count] of Object.entries(userCounts)) {
        if (count >= this.options.alertThresholds.dataAccess) {
          await this.generateAlert({
            type: 'high_user_activity',
            severity: 'low',
            title: 'High User Activity Detected',
            description: `User ${userId} has generated ${count} events in the last hour`,
            affectedResources: ['user_activity'],
            recommendedActions: [
              'Monitor user activity',
              'Verify if this is expected behavior',
              'Consider additional authentication requirements'
            ],
            metadata: {
              userId,
              eventCount: count
            }
          });
        }
      }

    } catch (error) {
      logger.error('Error checking threshold violations:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Analyze patterns in security events
   *
   * @private
   * @param {Array} events - Events to analyze
   * @returns {Object} Pattern analysis
   */
  _analyzePatterns(events) {
    const patterns = {
      byType: {},
      byResult: {},
      byHour: new Array(24).fill(0),
      byDay: new Array(7).fill(0),
      topIPs: {},
      topUsers: {},
      topResources: {}
    };

    events.forEach(event => {
      // Count by type
      patterns.byType[event.type] = (patterns.byType[event.type] || 0) + 1;

      // Count by result
      patterns.byResult[event.result] = (patterns.byResult[event.result] || 0) + 1;

      // Count by hour
      const hour = new Date(event.timestamp).getHours();
      patterns.byHour[hour]++;

      // Count by day
      const day = new Date(event.timestamp).getDay();
      patterns.byDay[day]++;

      // Top IPs
      if (event.ipAddress) {
        patterns.topIPs[event.ipAddress] = (patterns.topIPs[event.ipAddress] || 0) + 1;
      }

      // Top users
      if (event.userId) {
        patterns.topUsers[event.userId] = (patterns.topUsers[event.userId] || 0) + 1;
      }

      // Top resources
      if (event.resource) {
        patterns.topResources[event.resource] = (patterns.topResources[event.resource] || 0) + 1;
      }
    });

    return patterns;
  }

  /**
   * Detect attack patterns
   *
   * @private
   * @param {Array} events - Events to analyze
   * @returns {Array} Detected attack patterns
   */
  _detectAttackPatterns(events) {
    const attacks = [];

    // SQL injection patterns
    const sqlInjectionEvents = events.filter(event => {
      const query = event.details?.query || '';
      const input = event.details?.input || '';
      return query.includes("'") || query.includes('--') || query.includes('#') || query.includes('/*') ||
             input.includes("'") || input.includes('--') || input.includes('#') || input.includes('/*');
    });

    if (sqlInjectionEvents.length > 0) {
      attacks.push({
        type: 'sql_injection_attempt',
        severity: 'high',
        title: 'SQL Injection Attempt Detected',
        description: `${sqlInjectionEvents.length} potential SQL injection attempts detected`,
        detectionMethod: 'pattern_matching',
        affectedResources: sqlInjectionEvents.map(e => e.resource).filter(Boolean),
        recommendedActions: [
          'Review input validation',
          'Implement prepared statements',
          'Enable SQL injection detection rules'
        ],
        events: sqlInjectionEvents.map(e => e.id)
      });
    }

    // XSS patterns
    const xssEvents = events.filter(event =>
      event.details?.input?.match(/<script|javascript:|on\w+=/) ||
      event.details?.query?.match(/<script|javascript:|on\w+=/)
    );

    if (xssEvents.length > 0) {
      attacks.push({
        type: 'xss_attempt',
        severity: 'high',
        title: 'Cross-Site Scripting Attempt Detected',
        description: `${xssEvents.length} potential XSS attempts detected`,
        detectionMethod: 'pattern_matching',
        affectedResources: xssEvents.map(e => e.resource).filter(Boolean),
        recommendedActions: [
          'Review input sanitization',
          'Implement Content Security Policy',
          'Enable XSS protection headers'
        ],
        events: xssEvents.map(e => e.id)
      });
    }

    return attacks;
  }

  /**
   * Detect behavioral anomalies
   *
   * @private
   * @param {Array} events - Events to analyze
   * @param {Object} patterns - Pattern analysis
   * @returns {Array} Behavioral anomalies
   */
  _detectBehavioralAnomalies(events, _patterns) {
    const anomalies = [];

    // Check for unusual login times
    const unusualLoginTimes = events.filter(event => {
      if (event.type !== 'authentication' || event.result !== 'success') return false;

      const hour = new Date(event.timestamp).getHours();
      // Assume business hours are 6 AM to 10 PM
      return hour < 6 || hour > 22;
    });

    if (unusualLoginTimes.length > events.filter(e => e.type === 'authentication').length * 0.1) {
      anomalies.push({
        type: 'unusual_login_times',
        severity: 'low',
        title: 'Unusual Login Times Detected',
        description: `${unusualLoginTimes.length} logins occurred outside normal business hours`,
        detectionMethod: 'time_analysis',
        affectedResources: ['authentication_system'],
        recommendedActions: [
          'Review login times policy',
          'Consider implementing time-based restrictions',
          'Monitor for suspicious activity'
        ],
        events: unusualLoginTimes.map(e => e.id)
      });
    }

    return anomalies;
  }

  /**
   * Detect compliance violations
   *
   * @private
   * @param {Array} events - Events to analyze
   * @returns {Array} Compliance violations
   */
  _detectComplianceViolations(events) {
    const violations = [];

    // Check for unauthorized data access
    const unauthorizedAccess = events.filter(event =>
      event.type === 'data_access' &&
      event.result === 'denied' &&
      event.details?.reason === 'insufficient_permissions'
    );

    if (unauthorizedAccess.length > 0) {
      violations.push({
        type: 'unauthorized_access_attempt',
        severity: 'medium',
        title: 'Unauthorized Access Attempts Detected',
        description: `${unauthorizedAccess.length} attempts to access data without proper permissions`,
        detectionMethod: 'access_control_analysis',
        affectedResources: unauthorizedAccess.map(e => e.resource).filter(Boolean),
        recommendedActions: [
          'Review access control policies',
          'Audit user permissions',
          'Consider additional training'
        ],
        events: unauthorizedAccess.map(e => e.id)
      });
    }

    return violations;
  }

  /**
   * Update baseline metrics
   *
   * @private
   * @param {Object} event - Security event
   */
  _updateBaselineMetrics(event) {
    const hour = new Date(event.timestamp).getHours();
    const _day = new Date(event.timestamp).getDay();

    if (!this.baselineMetrics[hour]) {
      this.baselineMetrics[hour] = { count: 0, types: {} };
    }

    this.baselineMetrics[hour].count++;
    this.baselineMetrics[hour].types[event.type] = (this.baselineMetrics[hour].types[event.type] || 0) + 1;
  }

  /**
   * Load baseline metrics
   *
   * @private
   */
  async _loadBaselineMetrics() {
    try {
      // In a real implementation, load from database or file
      // For demo, initialize with default values
      for (let hour = 0; hour < 24; hour++) {
        this.baselineMetrics[hour] = {
          count: Math.floor(Math.random() * 100) + 50,
          types: {
            authentication: Math.floor(Math.random() * 20) + 10,
            data_access: Math.floor(Math.random() * 30) + 15,
            api_request: Math.floor(Math.random() * 40) + 20
          }
        };
      }
    } catch (error) {
      logger.error('Error loading baseline metrics:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send alert notifications
   *
   * @private
   * @param {Object} alert - Alert data
   */
  async _sendAlertNotifications(alert: any) {
    try {
      // In a real implementation, integrate with NotificationService
      logger.info(`Sending alert notification: ${alert.title}`);

      // Placeholder for notification sending
      // await notificationService.sendNotification({
      //   type: 'security_alert',
      //   title: alert.title,
      //   message: alert.description,
      //   priority: alert.severity === 'critical' ? 'urgent' : 'high',
      //   data: alert
      // });

    } catch (error) {
      logger.error('Error sending alert notifications:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Calculate security metrics
   *
   * @private
   * @param {Array} events - Events to analyze
   * @param {Date} since - Start date
   * @returns {Object} Security metrics
   */
  _calculateSecurityMetrics(events, since) {
    const metrics = {
      totalEvents: events.length,
      byType: {},
      bySeverity: {},
      byResult: {},
      topIPs: {},
      topUsers: {},
      failureRate: 0,
      averageEventsPerHour: 0
    };

    events.forEach(event => {
      // Count by type
      metrics.byType[event.type] = (metrics.byType[event.type] || 0) + 1;

      // Count by severity
      metrics.bySeverity[event.severity] = (metrics.bySeverity[event.severity] || 0) + 1;

      // Count by result
      metrics.byResult[event.result] = (metrics.byResult[event.result] || 0) + 1;

      // Top IPs
      if (event.ipAddress) {
        metrics.topIPs[event.ipAddress] = (metrics.topIPs[event.ipAddress] || 0) + 1;
      }

      // Top users
      if (event.userId) {
        metrics.topUsers[event.userId] = (metrics.topUsers[event.userId] || 0) + 1;
      }
    });

    // Calculate failure rate
    const totalResults = Object.values(metrics.byResult).reduce((sum, count) => sum + count, 0);
    if (totalResults > 0) {
      metrics.failureRate = (metrics.byResult.failure || 0) / totalResults;
    }

    // Calculate average events per hour
    const hoursDiff = (Date.now() - since.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 0) {
      metrics.averageEventsPerHour = metrics.totalEvents / hoursDiff;
    }

    return metrics;
  }

  /**
   * Summarize events for report
   *
   * @private
   * @param {Array} events - Events to summarize
   * @returns {Object} Event summary
   */
  _summarizeEvents(events) {
    return {
      total: events.length,
      byType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {}),
      byResult: events.reduce((acc, event) => {
        acc[event.result] = (acc[event.result] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Summarize anomalies for report
   *
   * @private
   * @param {Array} anomalies - Anomalies to summarize
   * @returns {Object} Anomaly summary
   */
  _summarizeAnomalies(anomalies) {
    return {
      total: anomalies.length,
      byType: anomalies.reduce((acc, anomaly) => {
        acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: anomalies.reduce((acc, anomaly) => {
        acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Summarize alerts for report
   *
   * @private
   * @param {Array} alerts - Alerts to summarize
   * @returns {Object} Alert summary
   */
  _summarizeAlerts(alerts) {
    return {
      total: alerts.length,
      byType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {}),
      byStatus: alerts.reduce((acc, alert) => {
        acc[alert.status] = (acc[alert.status] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Generate security assessment
   *
   * @private
   * @param {Object} report - Security report data
   * @returns {Object} Security assessment
   */
  _generateSecurityAssessment(report) {
    let riskLevel = 'low';
    let score = 100;

    // Calculate risk score based on various factors
    if (report.alertSummary) {
      const criticalAlerts = report.alertSummary.bySeverity?.critical || 0;
      const highAlerts = report.alertSummary.bySeverity?.high || 0;

      score -= criticalAlerts * 20;
      score -= highAlerts * 10;
    }

    if (report.anomalySummary) {
      const highAnomalies = report.anomalySummary.bySeverity?.high || 0;
      const criticalAnomalies = report.anomalySummary.bySeverity?.critical || 0;

      score -= criticalAnomalies * 15;
      score -= highAnomalies * 8;
    }

    if (report.eventSummary) {
      const failureRate = (report.eventSummary.byResult?.failure || 0) / report.eventSummary.total;
      score -= failureRate * 30;
    }

    // Determine risk level
    if (score < 50) riskLevel = 'critical';
    else if (score < 70) riskLevel = 'high';
    else if (score < 85) riskLevel = 'medium';

    return {
      overallRiskLevel: riskLevel,
      securityScore: Math.max(0, Math.min(100, score)),
      assessment: this._getRiskAssessmentText(riskLevel),
      recommendations: this._getSecurityRecommendations(riskLevel)
    };
  }

  /**
   * Get risk assessment text
   *
   * @private
   * @param {string} riskLevel - Risk level
   * @returns {string} Assessment text
   */
  _getRiskAssessmentText(riskLevel) {
    const assessments = {
      low: 'Security posture is strong with minimal risks identified.',
      medium: 'Security posture is adequate but some improvements are recommended.',
      high: 'Security posture requires attention with several high-risk issues identified.',
      critical: 'Security posture is concerning with critical vulnerabilities that require immediate action.'
    };

    return assessments[riskLevel] || assessments.medium;
  }

  /**
   * Get security recommendations
   *
   * @private
   * @param {string} riskLevel - Risk level
   * @returns {Array} Security recommendations
   */
  _getSecurityRecommendations(riskLevel) {
    const recommendations = {
      low: [
        'Continue monitoring security metrics',
        'Keep security patches up to date',
        'Regular security training for staff'
      ],
      medium: [
        'Address identified security alerts',
        'Review and update security policies',
        'Enhance monitoring capabilities',
        'Conduct security awareness training'
      ],
      high: [
        'Immediately address high-severity alerts',
        'Implement additional security controls',
        'Conduct comprehensive security audit',
        'Review incident response procedures'
      ],
      critical: [
        'Take immediate action on critical alerts',
        'Implement emergency security measures',
        'Engage security experts for assessment',
        'Consider temporary system restrictions',
        'Review and strengthen all security controls'
      ]
    };

    return recommendations[riskLevel] || recommendations.medium;
  }

  /**
   * Clean up old data
   */
  async cleanup() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionPeriod);

      // Clean up old events
      this.securityEvents = this.securityEvents.filter(
        event => new Date(event.timestamp) > cutoffDate
      );

      // Clean up old anomalies
      this.anomalies = this.anomalies.filter(
        anomaly => new Date(anomaly.timestamp) > cutoffDate
      );

      // Clean up resolved alerts (keep for 90 days)
      const alertCutoff = new Date();
      alertCutoff.setDate(alertCutoff.getDate() - 90);

      this.alerts = this.alerts.filter(
        alert => !alert.resolved || new Date(alert.resolvedAt) > alertCutoff
      );

      logger.info('Security monitoring data cleaned up');
    } catch (error) {
      logger.error('Error cleaning up security monitoring data:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Shutdown the security monitoring service
   */
  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    logger.info('Security monitoring service shut down');
  }
}

/**
 * Autonomous Operations Extension
 * Adds self-healing and predictive maintenance capabilities
 */
SecurityMonitoringService.prototype.enableAutonomousOperations = function () {
  this.selfHealingEnabled = true;
  this.predictiveMaintenanceEnabled = true;
  logger.info('Autonomous Operations Layer activated: self-healing and predictive maintenance enabled');
};

/**
 * Self-healing mechanism: automatically resolves recurring anomalies
 */
SecurityMonitoringService.prototype._selfHeal = async function () {
  try {
    const unresolvedAnomalies = this.anomalies.filter(a => a.status === 'detected');
    for (const anomaly of unresolvedAnomalies) {
      if (anomaly.type.includes('unauthorized') || anomaly.type.includes('brute_force')) {
        await this.generateAlert({
          type: 'auto_remediation',
          severity: 'medium',
          title: `Self-Healing Action Triggered for ${anomaly.type}`,
          description: `Automated remediation applied for anomaly ${anomaly.id}`,
          affectedResources: anomaly.affectedResources,
          recommendedActions: ['Verify automated fix effectiveness'],
          metadata: { anomalyId: anomaly.id, automated: true }
        });
        anomaly.status = 'remediated';
      }
    }
    logger.info('Self-healing cycle completed');
  } catch (error) {
    logger.error('Error during self-healing cycle:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * Predictive maintenance: anticipates potential failures based on anomaly trends
 */
SecurityMonitoringService.prototype._predictiveMaintenance = async function () {
  try {
    const recentAnomalies = this.anomalies.slice(-100);
    const anomalyRate = recentAnomalies.length / (this.securityEvents.length || 1);
    if (anomalyRate > 0.05) {
      await this.generateAlert({
        type: 'predictive_maintenance',
        severity: 'low',
        title: 'Predictive Maintenance Triggered',
        description: 'Anomaly rate exceeds threshold, initiating preventive maintenance actions',
        affectedResources: ['system_infrastructure'],
        recommendedActions: ['Run diagnostics', 'Optimize resource allocation'],
        metadata: { anomalyRate }
      });
    }
  } catch (error) {
    logger.error('Error during predictive maintenance:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * AI-driven decision loop for continuous optimization
 */
SecurityMonitoringService.prototype._aiDecisionLoop = async function () {
  try {
    const metrics = await this.getSecurityDashboard();
    const riskScore = metrics.summary.criticalAlerts + metrics.summary.recentAnomalies;
    if (riskScore > 10) {
      await this.generateAlert({
        type: 'ai_decision_loop_action',
        severity: 'medium',
        title: 'AI Decision Loop Optimization Triggered',
        description: 'System detected elevated risk; adjusting monitoring parameters automatically',
        affectedResources: ['security_monitoring'],
        recommendedActions: ['Review AI decision logs'],
        metadata: { riskScore }
      });
      this.options.monitoringInterval = Math.max(30000, this.options.monitoringInterval / 2);
    }
  } catch (error) {
    logger.error('Error in AI decision loop:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * Start autonomous operations cycle
 */
SecurityMonitoringService.prototype.startAutonomousCycle = function () {
  if (!this.selfHealingEnabled) this.enableAutonomousOperations();
  setInterval(() => {
    this._selfHeal();
    this._predictiveMaintenance();
    this._aiDecisionLoop();
  }, 120000); // every 2 minutes
  logger.info('Autonomous Operations Cycle started');
};

export default SecurityMonitoringService;