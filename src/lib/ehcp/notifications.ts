/**
 * EHCP Notification Service
 * Handles notifications for EHCP updates, version tracking, and stakeholder alerts
 */

import { prisma } from '@/lib/prisma';

// ============================================================================
// TYPES
// ============================================================================

export interface EHCPNotificationPayload {
  ehcp_id: string;
  tenant_id: number;
  action: 'created' | 'updated' | 'deleted' | 'exported' | 'reviewed';
  changed_sections?: string[];
  change_summary?: string;
  actor_id?: number;
  actor_name?: string;
  recipients?: number[]; // User IDs to notify
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  in_app: boolean;
}

// ============================================================================
// NOTIFICATION CREATION
// ============================================================================

/**
 * Create a version history record for EHCP updates
 */
export async function createEHCPVersion(payload: {
  ehcp_id: string;
  tenant_id: number;
  created_by_id?: number;
  status: string;
  plan_details: any;
  change_summary?: string;
}): Promise<void> {
  try {
    await prisma.ehcp_versions.create({
      data: {
        ehcp_id: payload.ehcp_id,
        tenant_id: payload.tenant_id,
        created_by_id: payload.created_by_id,
        status: payload.status,
        plan_details: payload.plan_details,
        change_summary: payload.change_summary || 'EHCP updated',
        created_at: new Date(),
      },
    });

    console.log(`[EHCP Notifications] Version created for EHCP ${payload.ehcp_id}`);
  } catch (error) {
    console.error('[EHCP Notifications] Failed to create version:', error);
    throw error;
  }
}

/**
 * Send notifications to stakeholders about EHCP changes
 */
export async function sendEHCPNotification(
  payload: EHCPNotificationPayload
): Promise<void> {
  try {
    // Create audit log entry
    await logEHCPAction(payload);

    // Determine recipients if not specified
    const recipients = payload.recipients || await getDefaultRecipients(payload.ehcp_id, payload.tenant_id);

    // Send notifications via configured channels
    await Promise.all([
      sendInAppNotifications(payload, recipients),
      sendEmailNotifications(payload, recipients),
      // Future: sendPushNotifications(payload, recipients),
    ]);

    console.log(`[EHCP Notifications] Sent ${payload.action} notifications for EHCP ${payload.ehcp_id} to ${recipients.length} users`);
  } catch (error) {
    console.error('[EHCP Notifications] Failed to send notifications:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Log EHCP action to audit trail
 */
async function logEHCPAction(payload: EHCPNotificationPayload): Promise<void> {
  try {
    // Create audit log using AuditLog model
    await prisma.auditLog.create({
      data: {
        userId: String(payload.actor_id || 0),
        user_id_int: payload.actor_id || 0,
        tenant_id: payload.tenant_id,
        action: `ehcp_${payload.action}`,
        resource: 'ehcp',
        details: {
          entityType: 'ehcp',
          entityId: payload.ehcp_id,
          description: payload.change_summary || `EHCP ${payload.action}`,
          changed_sections: payload.changed_sections,
          actor_name: payload.actor_name,
        },
      },
    });
  } catch (error) {
    console.error('[EHCP Notifications] Failed to create audit log:', error);
  }
}

/**
 * Get default notification recipients for an EHCP
 */
async function getDefaultRecipients(ehcp_id: string, tenant_id: number): Promise<number[]> {
  try {
    // Get all users in the tenant with EHCP access
    // In a real system, this would filter by role and permissions
    const users = await prisma.users.findMany({
      where: {
        tenant_id: tenant_id,
        // Add role filtering here (e.g., educators, SENCO, LA officers)
      },
      select: {
        id: true,
      },
    });

    return users.map(u => u.id);
  } catch (error) {
    console.error('[EHCP Notifications] Failed to get recipients:', error);
    return [];
  }
}

/**
 * Send in-app notifications
 */
async function sendInAppNotifications(
  payload: EHCPNotificationPayload,
  recipients: number[]
): Promise<void> {
  try {
    const notificationMessage = formatNotificationMessage(payload);

    // Store notification in user preferences (as JSON)
    // Note: In a full implementation, you'd have a dedicated notifications table
    // For now, we'll just log the notification intent
    console.log(`[EHCP Notifications] In-app notification for ${recipients.length} users:`, {
      type: 'ehcp_update',
      title: `EHCP ${payload.action.toUpperCase()}`,
      message: notificationMessage,
      recipients,
    });

    // TODO: Implement dedicated notifications table or use third-party service
    // await prisma.notifications.createMany({ ... });

  } catch (error) {
    console.error('[EHCP Notifications] Failed to send in-app notifications:', error);
  }
}

/**
 * Send email notifications (stubbed for now)
 */
async function sendEmailNotifications(
  payload: EHCPNotificationPayload,
  recipients: number[]
): Promise<void> {
  try {
    // Fetch user emails
    const users = await prisma.users.findMany({
      where: {
        id: { in: recipients },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const message = formatNotificationMessage(payload);

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log
    console.log(`[EHCP Notifications] Would send email to ${users.length} users:`, {
      subject: `EHCP ${payload.action.toUpperCase()}: ${payload.ehcp_id}`,
      message,
      recipients: users.map(u => u.email),
    });

    // Future implementation:
    // await emailService.sendBulk({
    //   to: users.map(u => u.email),
    //   subject: `EHCP ${payload.action.toUpperCase()}: ${payload.ehcp_id}`,
    //   body: message,
    //   template: 'ehcp-notification',
    // });
  } catch (error) {
    console.error('[EHCP Notifications] Failed to send email notifications:', error);
  }
}

/**
 * Format notification message based on action
 */
function formatNotificationMessage(payload: EHCPNotificationPayload): string {
  const actorName = payload.actor_name || 'A team member';

  switch (payload.action) {
    case 'created':
      return `${actorName} created a new EHCP (${payload.ehcp_id}).`;
    case 'updated':
      const sections = payload.changed_sections?.length
        ? ` Sections updated: ${payload.changed_sections.join(', ')}.`
        : '';
      return `${actorName} updated EHCP ${payload.ehcp_id}.${sections} ${payload.change_summary || ''}`;
    case 'deleted':
      return `${actorName} deleted EHCP ${payload.ehcp_id}. A version has been archived.`;
    case 'exported':
      return `${actorName} exported EHCP ${payload.ehcp_id} as PDF.`;
    case 'reviewed':
      return `${actorName} completed a review of EHCP ${payload.ehcp_id}.`;
    default:
      return `EHCP ${payload.ehcp_id} was ${payload.action}.`;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect changed sections between old and new EHCP data
 */
export function detectChangedSections(
  oldData: any,
  newData: any
): string[] {
  const sections: string[] = [];
  const sectionKeys = ['section_a', 'section_b', 'section_e', 'section_f', 'section_i'];

  for (const key of sectionKeys) {
    if (JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key])) {
      sections.push(key.replace('section_', 'Section ').toUpperCase());
    }
  }

  // Check student info changes
  if (oldData?.student_name !== newData?.student_name ||
      oldData?.date_of_birth !== newData?.date_of_birth) {
    sections.push('Student Information');
  }

  // Check status changes
  if (oldData?.status !== newData?.status) {
    sections.push('Status');
  }

  return sections;
}

/**
 * Generate a human-readable change summary
 */
export function generateChangeSummary(
  oldData: any,
  newData: any,
  changedSections: string[]
): string {
  if (changedSections.length === 0) {
    return 'Minor updates';
  }

  const parts: string[] = [];

  // Status change
  if (oldData?.status !== newData?.status) {
    parts.push(`Status changed from "${oldData?.status || 'unknown'}" to "${newData?.status || 'unknown'}"`);
  }

  // Section changes
  if (changedSections.length > 0) {
    parts.push(`Updated sections: ${changedSections.join(', ')}`);
  }

  return parts.join('. ');
}
