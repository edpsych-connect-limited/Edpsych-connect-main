/**
 * Communication Thread Service
 * 
 * Bidirectional messaging between LA and School
 * for EHCP application clarifications and evidence requests.
 * 
 * Features:
 * - Structured message types (evidence request, query, update)
 * - Full audit trail with timestamps
 * - Read receipts and response tracking
 * - Attachment support
 * - Email notifications
 * 
 * Replaces unstructured email communication with
 * centralized, auditable thread linked to application.
 * 
 * @author EdPsych Connect Limited
 */

import { logger } from '@/lib/logger';

export type MessageType = 
  | 'EVIDENCE_REQUEST'
  | 'QUERY'
  | 'UPDATE'
  | 'RESPONSE'
  | 'DECISION_NOTIFICATION';

export type MessageSender = 'LA' | 'SCHOOL';

export interface CommunicationMessage {
  id: number;
  ehcpApplicationId: number;
  sender: MessageSender;
  senderName: string;
  senderEmail: string;
  type: MessageType;
  subject: string;
  body: string;
  attachments: MessageAttachment[];
  sentAt: Date;
  readAt?: Date;
  responseRequired: boolean;
  responseDueDate?: Date;
  parentMessageId?: number; // For threading replies
  createdAt: Date;
}

export interface MessageAttachment {
  id: number;
  messageId: number;
  filename: string;
  mimeType: string;
  size: number; // bytes
  storageUrl: string;
  uploadedAt: Date;
}

export interface CommunicationThread {
  ehcpApplicationId: number;
  messages: CommunicationMessage[];
  unreadCount: {
    school: number;
    la: number;
  };
  lastActivity: Date;
}

export class CommunicationThreadService {
  private tenantId: number;

  constructor(tenantId: number) {
    this.tenantId = tenantId;
  }

  /**
   * Get full communication thread for an application
   */
  async getThread(ehcpApplicationId: number, viewerType: MessageSender): Promise<CommunicationThread> {
    logger.info(`[Communication] Fetching thread for application ${ehcpApplicationId}`);

    // In production, query from database:
    // SELECT * FROM communication_messages 
    // WHERE ehcp_application_id = ? AND tenant_id = ?
    // ORDER BY sent_at ASC

    // Mock data for demonstration
    const mockMessages: CommunicationMessage[] = [
      {
        id: 1,
        ehcpApplicationId,
        sender: 'LA',
        senderName: 'Emma Thompson',
        senderEmail: 'e.thompson@somerset.gov.uk',
        type: 'EVIDENCE_REQUEST',
        subject: 'Request for Additional Evidence - Educational Psychology Report',
        body: `Dear SENCo,

Thank you for submitting the EHCP request for [Child Name].

We have reviewed the application and require the following additional evidence to proceed:

1. **Educational Psychology Report** (dated within last 12 months)
   - Cognitive assessment (WISC-V or equivalent)
   - Analysis of learning profile
   - Recommendations for support

2. **Speech & Language Therapy Report** (if applicable)
   - Assessment of communication needs
   - Recommendations for support strategies

Please provide these documents within 14 days to avoid delays in the assessment process.

If you have any questions, please reply to this message.

Best regards,
Emma Thompson
SEND Case Officer`,
        attachments: [],
        sentAt: new Date('2025-01-08T09:30:00'),
        readAt: new Date('2025-01-08T14:20:00'),
        responseRequired: true,
        responseDueDate: new Date('2025-01-22T17:00:00'),
        createdAt: new Date('2025-01-08T09:30:00')
      },
      {
        id: 2,
        ehcpApplicationId,
        sender: 'SCHOOL',
        senderName: 'Sarah Williams',
        senderEmail: 's.williams@oak-primary.sch.uk',
        type: 'RESPONSE',
        subject: 'Re: Request for Additional Evidence',
        body: `Dear Emma,

Thank you for your message.

We have the Educational Psychology report from November 2024 which we will upload shortly.

Regarding the Speech & Language Therapy report: the child has not been seen by SALT as there are no identified communication concerns. The primary need is in literacy (dyslexia profile).

Could you please confirm whether the SALT report is still required given this context?

Best regards,
Sarah Williams
SENCo, Oak Primary School`,
        attachments: [
          {
            id: 1,
            messageId: 2,
            filename: 'EP_Report_Nov2024.pdf',
            mimeType: 'application/pdf',
            size: 2450000,
            storageUrl: '/storage/ehcp/123/ep-report-nov2024.pdf',
            uploadedAt: new Date('2025-01-09T10:15:00')
          }
        ],
        sentAt: new Date('2025-01-09T10:15:00'),
        readAt: new Date('2025-01-09T11:05:00'),
        responseRequired: false,
        parentMessageId: 1,
        createdAt: new Date('2025-01-09T10:15:00')
      },
      {
        id: 3,
        ehcpApplicationId,
        sender: 'LA',
        senderName: 'Emma Thompson',
        senderEmail: 'e.thompson@somerset.gov.uk',
        type: 'UPDATE',
        subject: 'Re: Request for Additional Evidence',
        body: `Dear Sarah,

Thank you for clarifying.

The SALT report is not required if there are no communication concerns. The EP report you've uploaded is sufficient.

The application will now proceed to the advice-gathering stage. You will be contacted by our Educational Psychologist within 2 weeks to arrange a school visit.

Best regards,
Emma`,
        attachments: [],
        sentAt: new Date('2025-01-09T14:30:00'),
        readAt: undefined, // Unread by school
        responseRequired: false,
        parentMessageId: 2,
        createdAt: new Date('2025-01-09T14:30:00')
      }
    ];

    // Calculate unread counts
    const unreadCount = {
      school: mockMessages.filter(m => m.sender === 'LA' && !m.readAt).length,
      la: mockMessages.filter(m => m.sender === 'SCHOOL' && !m.readAt).length
    };

    const lastActivity = mockMessages.reduce((latest, msg) => 
      msg.sentAt > latest ? msg.sentAt : latest, 
      mockMessages[0].sentAt
    );

    return {
      ehcpApplicationId,
      messages: mockMessages,
      unreadCount,
      lastActivity
    };
  }

  /**
   * Send message in thread
   */
  async sendMessage(
    ehcpApplicationId: number,
    sender: MessageSender,
    senderName: string,
    senderEmail: string,
    type: MessageType,
    subject: string,
    body: string,
    responseRequired: boolean = false,
    responseDueDate?: Date,
    parentMessageId?: number
  ): Promise<CommunicationMessage> {
    logger.info(`[Communication] Sending ${type} message for application ${ehcpApplicationId}`);

    // In production:
    // - Insert into communication_messages table
    // - Send email notification to recipient
    // - Update EHCPApplication.last_communication_at
    // - Create notification for recipient's dashboard

    const message: CommunicationMessage = {
      id: Date.now(), // Would be auto-incremented ID from database
      ehcpApplicationId,
      sender,
      senderName,
      senderEmail,
      type,
      subject,
      body,
      attachments: [],
      sentAt: new Date(),
      responseRequired,
      responseDueDate,
      parentMessageId,
      createdAt: new Date()
    };

    logger.info(`[Communication] Message sent successfully: ${message.id}`);

    // Send email notification
    await this.sendEmailNotification(message, ehcpApplicationId);

    return message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: number, viewerType: MessageSender): Promise<void> {
    logger.info(`[Communication] Marking message ${messageId} as read by ${viewerType}`);

    // In production:
    // UPDATE communication_messages 
    // SET read_at = NOW()
    // WHERE id = ? AND tenant_id = ?

    // Also update notification status
  }

  /**
   * Upload attachment to message
   */
  async uploadAttachment(
    messageId: number,
    file: File
  ): Promise<MessageAttachment> {
    logger.info(`[Communication] Uploading attachment to message ${messageId}: ${file.name}`);

    // In production:
    // - Scan file for viruses
    // - Validate file type and size
    // - Upload to cloud storage (S3/Azure)
    // - Insert record in message_attachments table

    const attachment: MessageAttachment = {
      id: Date.now(),
      messageId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      storageUrl: `/storage/attachments/${messageId}/${file.name}`,
      uploadedAt: new Date()
    };

    logger.info(`[Communication] Attachment uploaded: ${attachment.id}`);

    return attachment;
  }

  /**
   * Generate evidence request template
   */
  generateEvidenceRequestTemplate(
    requestedEvidence: string[],
    dueDate: Date
  ): { subject: string; body: string } {
    return {
      subject: 'Request for Additional Evidence',
      body: `Dear SENCo,

Thank you for submitting the EHCP request.

We have reviewed the application and require the following additional evidence to proceed:

${requestedEvidence.map((item, index) => `${index + 1}. ${item}`).join('\n\n')}

Please provide these documents by ${dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.

If you have any questions, please reply to this message.

Best regards,
[LA SEND Team]`
    };
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    message: CommunicationMessage,
    ehcpApplicationId: number
  ): Promise<void> {
    logger.info(`[Communication] Sending email notification for message ${message.id}`);

    // In production:
    // - Use email service (SendGrid, AWS SES)
    // - Include link to application thread
    // - Handle bounces and delivery failures

    const recipientEmail = message.sender === 'LA' 
      ? 'school-recipient@example.com'
      : 'la-recipient@example.com';

    logger.info(`[Communication] Email notification would be sent to: ${recipientEmail}`);

    // Mock implementation
    // await emailService.send({
    //   to: recipientEmail,
    //   subject: `[EHCP Application #${ehcpApplicationId}] ${message.subject}`,
    //   body: message.body,
    //   replyTo: message.senderEmail
    // });
  }

  /**
   * Get overdue responses
   * Returns messages awaiting response past due date
   */
  async getOverdueResponses(ehcpApplicationId: number): Promise<CommunicationMessage[]> {
    logger.info(`[Communication] Checking for overdue responses on application ${ehcpApplicationId}`);

    const thread = await this.getThread(ehcpApplicationId, 'LA');
    const now = new Date();

    const overdue = thread.messages.filter(msg => 
      msg.responseRequired && 
      msg.responseDueDate && 
      msg.responseDueDate < now &&
      !thread.messages.some(reply => reply.parentMessageId === msg.id)
    );

    if (overdue.length > 0) {
      logger.warn(`[Communication] ${overdue.length} overdue responses found for application ${ehcpApplicationId}`);
    }

    return overdue;
  }
}
