import { logger } from "@/lib/logger";
/**
 * Notification Service Interface
 * 
 * This service handles sending notifications to users across different channels.
 * It provides a unified interface for sending notifications regardless of the 
 * underlying delivery mechanism (e.g., in-app, email, push).
 */
export interface NotificationService {
  /**
   * Send a notification to a user
   * @param id ID of the user to notify
   * @param type Type of notification (used for categorization and styling)
   * @param message Main notification message
   * @param data Optional additional data related to the notification
   * @param options Optional notification settings (e.g., priority, expiration)
   * @returns Promise resolving to notification ID if successfully sent
   */
  sendNotification(
    _id: string,
    _type: string,
    _message: string,
    _data?: Record<string, any>,
    _options?: NotificationOptions
  ): Promise<string>;

  /**
   * Send a notification to multiple users
   * @param userIds IDs of the users to notify
   * @param type Type of notification (used for categorization and styling)
   * @param message Main notification message
   * @param data Optional additional data related to the notification
   * @param options Optional notification settings (e.g., priority, expiration)
   * @returns Promise resolving to array of notification IDs for successfully sent notifications
   */
  sendBulkNotifications(
    _userIds: string[],
    _type: string,
    _message: string,
    _data?: Record<string, any>,
    _options?: NotificationOptions
  ): Promise<string[]>;

  /**
   * Mark a notification as read
   * @param notificationId ID of the notification to mark as read
   * @param id ID of the user marking the notification as read
   * @returns Promise resolving to true if successfully marked as read
   */
  markAsRead(_notificationId: string, _id: string): Promise<boolean>;

  /**
   * Retrieve notifications for a user
   * @param id ID of the user
   * @param options Optional filtering options
   * @returns Promise resolving to array of notifications
   */
  getNotifications(_id: string, _options?: { 
    unreadOnly?: boolean;
    types?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Notification[]>;
}

/**
 * Options for sending notifications
 */
export interface NotificationOptions {
  /**
   * Priority level of the notification
   */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  
  /**
   * Channels to send the notification through
   */
  channels?: ('in-app' | 'email' | 'push' | 'sms')[];
  
  /**
   * When the notification should expire and be removed
   */
  expiresAt?: Date;
  
  /**
   * Whether to allow duplicate notifications
   */
  allowDuplicates?: boolean;
  
  /**
   * Whether to require acknowledgment from the user
   */
  requireAcknowledgment?: boolean;
}

/**
 * Notification object
 */
export interface Notification {
  /**
   * Unique identifier for the notification
   */
  id: string;
  
  /**
   * ID of the user the notification is for
   */
  userId: string;
  
  /**
   * Type of notification
   */
  type: string;
  
  /**
   * Main notification message
   */
  message: string;
  
  /**
   * Additional data related to the notification
   */
  data?: Record<string, any>;
  
  /**
   * Whether the notification has been read
   */
  read: boolean;
  
  /**
   * When the notification was created
   */
  createdAt: Date;
  
  /**
   * When the notification was read (if applicable)
   */
  readAt?: Date;
  
  /**
   * When the notification expires
   */
  expiresAt?: Date;
}