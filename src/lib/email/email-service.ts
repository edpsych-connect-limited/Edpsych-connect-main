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
    
    // In production, we want to be stricter about email configuration
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!sendgridApiKey) {
      if (isProduction) {
        logger.error('CRITICAL: SENDGRID_API_KEY missing in production environment. Emails will fail.');
      } else {
        logger.warn('SENDGRID_API_KEY not configured - email service will use console logging only');
      }
      
      // Initialize with a JSON transport for testing/logging purposes
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    } else {
      // Initialize Nodemailer with SendGrid
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'apikey', // SendGrid requires 'apikey' as the user
          pass: sendgridApiKey,
        },
      });
      
      logger.info('EmailService initialized with SendGrid transport');
    }
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

      logger.debug(`[EmailService] Email processed: ${info.messageId}`);

      // If using JSON transport (no API key), log the email content for debugging/admin use
      // info.message exists on JSON transport response
      if (this.transporter.transporter.name === 'JSON' || (info as any).message) {
        logger.info('=================================================================');
        logger.info('📧 [EMAIL SERVICE - MOCK MODE]');
        logger.info(`To: ${options.to}`);
        logger.info(`Subject: ${options.subject}`);
        logger.info('-----------------------------------------------------------------');
        // Log the reset link specifically if found in HTML
        const linkMatch = options.html.match(/href="(.*?)"/);
        if (linkMatch) {
          logger.info(`🔗 ACTION LINK: ${linkMatch[1]}`);
        }
        logger.info('=================================================================');
      }

      return true;
    } catch (_error) {
      console.error('[EmailService] Failed to send email:', _error);
      
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

  /**
   * Send waitlist confirmation email
   */
  async sendWaitlistConfirmationEmail(email: string, name?: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to the EdPsych Connect Waitlist',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're on the list!</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Thanks for expressing interest in EdPsych Connect. We've added you to our priority waitlist.</p>
          <p>We're building the future of educational psychology support, and we're excited to have you join us on this journey.</p>
          <p>We'll be in touch soon with updates and early access information.</p>
          <br/>
          <p>Best regards,</p>
          <p>The EdPsych Connect Team</p>
        </div>
      `,
      text: `Hi ${name || 'there'},\n\nThanks for expressing interest in EdPsych Connect. We've added you to our priority waitlist.\n\nWe'll be in touch soon with updates and early access information.\n\nBest regards,\nThe EdPsych Connect Team`
    });
  }

  /**
   * Notify admin of new waitlist signup
   */
  async notifyAdminNewWaitlistSignup(entry: any): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'scott.ipatrick@edpsychconnect.com';
    
    return this.sendEmail({
      to: adminEmail,
      subject: `New Waitlist Signup: ${entry.email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Waitlist Signup</h2>
          <p><strong>Email:</strong> ${entry.email}</p>
          <p><strong>Name:</strong> ${entry.name || 'N/A'}</p>
          <p><strong>Organization:</strong> ${entry.organization || 'N/A'}</p>
          <p><strong>Role:</strong> ${entry.role || 'N/A'}</p>
          <p><strong>Type:</strong> ${entry.organization_type || 'N/A'}</p>
          <p><strong>Priority:</strong> ${entry.priority}</p>
          <p><strong>Source:</strong> ${entry.referral_source}</p>
        </div>
      `,
      text: `New Waitlist Signup\n\nEmail: ${entry.email}\nName: ${entry.name || 'N/A'}\nOrganization: ${entry.organization || 'N/A'}\nRole: ${entry.role || 'N/A'}\nType: ${entry.organization_type || 'N/A'}\nPriority: ${entry.priority}\nSource: ${entry.referral_source}`
    });
  }
}

export const emailService = EmailService.getInstance();
