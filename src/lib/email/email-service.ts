import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // Validate required environment variable
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
      logger.warn('SENDGRID_API_KEY not configured - email service will not function');
    }
    
    // Initialize Nodemailer with SendGrid
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'apikey', // SendGrid requires 'apikey' as the user
        pass: sendgridApiKey || '',
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send an email using SendGrid
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"EdPsych Connect" <noreply@edpsychconnect.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.debug(`[EmailService] Email sent: ${info.messageId}`);
      return true;
    } catch (_error) {
      console._error('[EmailService] Failed to send email:', _error);
      
      // Fallback to console log in development if sending fails
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('=================================================================');
        logger.debug('📧 [EMAIL SERVICE - FALLBACK LOG]');
        logger.debug(`To: ${options.to}`);
        logger.debug(`Subject: ${options.subject}`);
        logger.debug('-----------------------------------------------------------------');
        logger.debug(options.text || options.html.replace(/<[^>]*>/g, ''));
        logger.debug('=================================================================');
        return true; // Return true so the UI shows success
      }
      
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset your EdPsych Connect password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password for EdPsych Connect.</p>
          <p>Click the button below to reset it:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Link expires in 1 hour.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Or copy this link: ${resetLink}</p>
        </div>
      `,
      text: `Reset your password here: ${resetLink}`
    });
  }
}

export const emailService = EmailService.getInstance();
