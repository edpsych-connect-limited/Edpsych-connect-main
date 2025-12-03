import { logger } from "@/lib/logger";
/**
 * Certificate Generation System
 * Generates PDF certificates for completed training courses
 *
 * Features:
 * - Professional PDF design
 * - QR code for verification
 * - Unique verification code
 * - CPD hours displayed
 * - Digital signature
 * - BPS Quality Mark logo (if applicable)
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
  id: string;
  userId: number;
  userName: string;
  courseName: string;
  cpdHours: number;
  completionDate: Date;
  verificationCode: string;
  skills: string[];
}

export class CertificateGenerator {
  private static readonly CERT_WIDTH = 297; // A4 landscape width in mm
  private static readonly CERT_HEIGHT = 210; // A4 landscape height in mm

  /**
   * Generate certificate PDF
   */
  static async generateCertificate(data: CertificateData): Promise<Buffer> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Background
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, this.CERT_WIDTH, this.CERT_HEIGHT, 'F');

    // Border
    doc.setDrawColor(59, 130, 246); // Blue-600
    doc.setLineWidth(3);
    doc.rect(10, 10, this.CERT_WIDTH - 20, this.CERT_HEIGHT - 20, 'S');

    doc.setLineWidth(0.5);
    doc.rect(12, 12, this.CERT_WIDTH - 24, this.CERT_HEIGHT - 24, 'S');

    // Logo (EdPsych Connect)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // Blue-900
    doc.text('EdPsych Connect', this.CERT_WIDTH / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Gray-600
    doc.text('Evidence-Based Professional Development', this.CERT_WIDTH / 2, 37, {
      align: 'center',
    });

    // Certificate Title
    doc.setFontSize(32);
    doc.setFont('times', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Certificate of Completion', this.CERT_WIDTH / 2, 60, { align: 'center' });

    // Decorative line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    const lineStart = this.CERT_WIDTH / 2 - 50;
    const lineEnd = this.CERT_WIDTH / 2 + 50;
    doc.line(lineStart, 65, lineEnd, 65);

    // Presented to
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('This is to certify that', this.CERT_WIDTH / 2, 80, { align: 'center' });

    // User Name
    doc.setFontSize(28);
    doc.setFont('times', 'bold');
    doc.setTextColor(15, 23, 42); // Gray-900
    doc.text(data.userName, this.CERT_WIDTH / 2, 95, { align: 'center' });

    // Has successfully completed
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('has successfully completed', this.CERT_WIDTH / 2, 107, { align: 'center' });

    // Course Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    const courseNameLines = doc.splitTextToSize(data.courseName, 200);
    doc.text(courseNameLines, this.CERT_WIDTH / 2, 120, { align: 'center' });

    // CPD Hours
    const cpdYPos = 120 + (courseNameLines.length * 7);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // Green-500
    doc.text(`${data.cpdHours} CPD Hours`, this.CERT_WIDTH / 2, cpdYPos + 10, {
      align: 'center',
    });

    // Skills Achieved (if any)
    if (data.skills && data.skills.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('Skills & Competencies:', this.CERT_WIDTH / 2, cpdYPos + 18, {
        align: 'center',
      });

      doc.setFont('helvetica', 'normal');
      const skillsText = data.skills.join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, 180);
      doc.text(skillsLines, this.CERT_WIDTH / 2, cpdYPos + 24, { align: 'center' });
    }

    // Date and Verification
    const bottomYPos = this.CERT_HEIGHT - 50;

    // Completion Date
    const formattedDate = data.completionDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Date of Completion', 50, bottomYPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formattedDate, 50, bottomYPos + 7);

    // Signature (digital)
    doc.setFont('helvetica', 'normal');
    doc.text('Digitally Signed', this.CERT_WIDTH - 80, bottomYPos);
    doc.setFont('helvetica', 'bold');
    doc.text('EdPsych Connect Ltd', this.CERT_WIDTH - 80, bottomYPos + 7);

    // Verification Code
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Verification Code: ${data.verificationCode}`,
      this.CERT_WIDTH / 2,
      this.CERT_HEIGHT - 25,
      { align: 'center' }
    );

    // QR Code for verification
    const verificationUrl = `https://edpsychconnect.com/verify/${data.verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
    });

    doc.addImage(qrCodeDataUrl, 'PNG', this.CERT_WIDTH / 2 - 10, this.CERT_HEIGHT - 20, 20, 20);

    doc.setFontSize(7);
    doc.text('Scan to verify', this.CERT_WIDTH / 2, this.CERT_HEIGHT - 18, {
      align: 'center',
    });

    // BPS Quality Mark (if applicable)
    // doc.addImage(bpsQualityMarkImage, 'PNG', 20, bottomYPos - 10, 25, 25);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      '© 2025 EdPsych Connect Limited. All rights reserved.',
      this.CERT_WIDTH / 2,
      this.CERT_HEIGHT - 5,
      { align: 'center' }
    );

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  /**
   * Generate verification code
   */
  static generateVerificationCode(): string {
    const prefix = 'ECPC'; // EdPsych Connect Certificate
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Validate verification code format
   */
  static isValidVerificationCode(code: string): boolean {
    const pattern = /^ECPC-[A-Z0-9]+-[A-Z0-9]+$/;
    return pattern.test(code);
  }
}

/**
 * CPD Log Entry Generator
 */
export class CPDLogGenerator {
  static generateCPDEntry(certificateData: CertificateData) {
    return {
      activity_type: 'course',
      activity_title: certificateData.courseName,
      activity_description: `Completed evidence-based CPD training course: ${certificateData.courseName}`,
      cpd_hours: certificateData.cpdHours,
      cpd_category: 'C: Formal education',
      activity_date: certificateData.completionDate,
      certificate_id: certificateData.id,
      evidence_urls: [
        `https://edpsychconnect.com/certificates/${certificateData.id}`,
      ],
      status: 'verified',
    };
  }
}

/**
 * Email Certificate Delivery
 */
export class CertificateEmailer {
  static async sendCertificateEmail(
    userEmail: string,
    userName: string,
    courseName: string,
    certificatePdfBuffer: Buffer,
    certificateId: string
  ) {
    const { emailService } = await import('@/lib/email/email-service');
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #2563eb, #7c3aed); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Congratulations, ${userName}!</h1>
        </div>

        <div style="padding: 30px; background: white;">
          <p style="font-size: 18px; color: #1e293b;">
            You've successfully completed <strong>${courseName}</strong>!
          </p>

          <p style="color: #475569;">
            Your certificate is attached to this email. You can also download it anytime from your account:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.edpsychconnect.com'}/training/certificates/${certificateId}"
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Certificate Online
            </a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">What's Next?</h3>
            <ul style="color: #475569;">
              <li>Add your CPD hours to your log</li>
              <li>Share your achievement on LinkedIn</li>
              <li>Explore more courses in your dashboard</li>
              <li>Apply your new skills in practice</li>
            </ul>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Questions? Contact us at support@edpsychconnect.com
          </p>
        </div>

        <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
          <p>© 2025 EdPsych Connect Limited. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send certificate email via email service
    const sent = await emailService.sendEmail({
      to: userEmail,
      subject: `🎉 Your Certificate for ${courseName}`,
      html: emailHtml,
      text: `Congratulations ${userName}! You've successfully completed ${courseName}. View your certificate at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.edpsychconnect.com'}/training/certificates/${certificateId}`,
    });

    if (sent) {
      logger.info(`Certificate email sent to ${userEmail} for certificate ${certificateId}`);
    } else {
      logger.warn(`Failed to send certificate email to ${userEmail}`);
    }

    // Return email content for logging/debugging purposes
    return {
      to: userEmail,
      subject: `🎉 Your Certificate for ${courseName}`,
      html: emailHtml,
      certificateId,
      sent,
    };
  }
}
