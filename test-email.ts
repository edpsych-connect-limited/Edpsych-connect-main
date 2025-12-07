
import { EmailService } from './src/lib/email/email-service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmail() {
  console.log('--- 📧 Email Service Diagnostic ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SENDGRID_API_KEY Present:', !!process.env.SENDGRID_API_KEY);
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'smtp.sendgrid.net (default)');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Default');

  const emailService = EmailService.getInstance();
  
  console.log('\nAttempting to send test email to scott.ipatrick@edpsychconnect.com...');
  
  try {
    const result = await emailService.sendEmail({
      to: 'scott.ipatrick@edpsychconnect.com',
      subject: 'EdPsych Connect - Diagnostic Test',
      html: '<h1>Diagnostic Test</h1><p>This is a test email to verify SendGrid configuration.</p>',
      text: 'Diagnostic Test - This is a test email to verify SendGrid configuration.'
    });

    if (result) {
      console.log('✅ Email sent successfully (or fallback triggered).');
    } else {
      console.log('❌ Email sending failed (returned false).');
    }
  } catch (error) {
    console.error('❌ Exception during email send:', error);
  }
}

testEmail();
