'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          </div>
          <p className="text-slate-600 mt-2">Last updated: November 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-slate max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the EdPsych Connect platform ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you ("User", "you", "your") and EdPsych Connect Limited ("Company", "we", "us", "our").
            </p>

            <h2>2. Eligibility and Account Registration</h2>

            <h3>2.1 Eligible Users</h3>
            <p>The Service is intended for use by:</p>
            <ul>
              <li>Educational psychologists and trainee educational psychologists</li>
              <li>SENCOs and SEN coordinators</li>
              <li>Teachers and educational professionals</li>
              <li>Local authority staff</li>
              <li>Researchers in educational psychology</li>
              <li>Other qualified education professionals working with SEND students</li>
            </ul>

            <h3>2.2 Account Requirements</h3>
            <p>To create an account, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Hold appropriate professional qualifications for your role</li>
            </ul>

            <h3>2.3 Account Responsibility</h3>
            <p>
              You are responsible for all activities that occur under your account. You must not share your account credentials or allow others to access
              your account. Professional subscribers must comply with HCPC/BPS standards regarding data handling and confidentiality.
            </p>

            <h2>3. Subscription Plans and Billing</h2>

            <h3>3.1 Subscription Tiers</h3>
            <ul>
              <li><strong>Individual Educational Psychologist:</strong> £30/month or £300/year</li>
              <li><strong>School:</strong> £99/month or £990/year</li>
              <li><strong>Local Authority:</strong> Custom pricing</li>
              <li><strong>Research:</strong> Custom pricing</li>
            </ul>

            <h3>3.2 Free Trial</h3>
            <p>
              New users may be eligible for a 14-day free trial. Payment information is required to start a trial. You will be charged
              automatically after the trial ends unless you cancel before the trial expiration date.
            </p>

            <h3>3.3 Billing and Payment</h3>
            <ul>
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>Payment is processed securely through Stripe</li>
              <li>Prices are in GBP and exclude VAT (VAT will be added as applicable)</li>
              <li>We reserve the right to change pricing with 30 days' notice</li>
            </ul>

            <h3>3.4 Cancellation and Refunds</h3>
            <ul>
              <li>You may cancel your subscription at any time from your account settings</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No refunds for partial months or unused portions of annual subscriptions</li>
              <li>Refunds may be granted at our discretion for exceptional circumstances</li>
            </ul>

            <h2>4. Use of the Service</h2>

            <h3>4.1 License Grant</h3>
            <p>
              Subject to compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access
              and use the Service for your professional educational psychology work.
            </p>

            <h3>4.2 Permitted Uses</h3>
            <ul>
              <li>Conducting cognitive assessments using the ECCA framework</li>
              <li>Creating and managing EHCP documents</li>
              <li>Accessing and implementing evidence-based interventions</li>
              <li>Tracking student progress and outcomes</li>
              <li>Completing professional development training</li>
              <li>Managing cases and generating professional reports</li>
            </ul>

            <h3>4.3 Prohibited Uses</h3>
            <p>You agree NOT to:</p>
            <ul>
              <li>Violate any applicable laws, regulations, or professional codes of conduct</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use the Service for purposes other than legitimate educational psychology work</li>
              <li>Share account credentials or allow unauthorized access</li>
              <li>Scrape, copy, or download content in bulk</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>

            <h2>5. Content and Intellectual Property</h2>

            <h3>5.1 Our Content</h3>
            <p>
              All content provided through the Service, including the ECCA framework, assessment tools, intervention library,
              training courses, and software, are owned by or licensed to EdPsych Connect Limited and protected by copyright,
              trademark, and other intellectual property laws.
            </p>

            <h3>5.2 Your Content</h3>
            <p>
              You retain ownership of assessment data, case notes, reports, and other content you create using the Service ("Your Content").
              By using the Service, you grant us a limited license to host, store, and process Your Content solely to provide the Service.
            </p>

            <h3>5.3 Professional Reports</h3>
            <p>
              Reports generated using our platform may be used for your professional practice. You must not remove attribution
              to the ECCA framework or misrepresent the source of assessment tools.
            </p>

            <h2>6. Professional Standards and Compliance</h2>

            <h3>6.1 HCPC/BPS Compliance</h3>
            <p>
              Registered educational psychologists must use the Service in accordance with HCPC Standards of Conduct, Performance and Ethics,
              and BPS Code of Ethics and Conduct, including:
            </p>
            <ul>
              <li>Maintaining confidentiality and data security</li>
              <li>Obtaining appropriate consent for assessments</li>
              <li>Ensuring competence in use of assessment tools</li>
              <li>Acting in the best interests of children and young people</li>
            </ul>

            <h3>6.2 UK GDPR and Data Protection</h3>
            <p>
              Users processing personal data through the Service must comply with UK GDPR, Data Protection Act 2018, and relevant
              education sector guidance. See our Privacy Policy for details on how we handle data.
            </p>

            <h3>6.3 Safeguarding</h3>
            <p>
              Users must follow local safeguarding policies and procedures. If assessment or intervention work reveals safeguarding
              concerns, appropriate action must be taken in accordance with statutory guidance.
            </p>

            <h2>7. Training and CPD</h2>

            <h3>7.1 Course Access</h3>
            <ul>
              <li>Purchased courses are accessible for the duration of your active subscription</li>
              <li>Course content may be updated periodically to reflect current evidence base</li>
              <li>Certificates are issued upon successful course completion</li>
            </ul>

            <h3>7.2 CPD Hours</h3>
            <p>
              CPD hours recorded on the platform are self-reported. It remains your responsibility to ensure CPD activities
              meet the requirements of your professional body (BPS, HCPC, etc.).
            </p>

            <h3>7.3 Certificate Verification</h3>
            <p>
              Certificates include QR codes for third-party verification. Falsification of certificates or CPD records
              constitutes professional misconduct and grounds for account termination.
            </p>

            <h2>8. Data Security and Service Availability</h2>

            <h3>8.1 Security Measures</h3>
            <p>
              We implement industry-standard security measures including encryption, access controls, and regular security audits.
              However, no system is completely secure, and you use the Service at your own risk.
            </p>

            <h3>8.2 Service Availability</h3>
            <p>
              We aim for 99.9% uptime but do not guarantee uninterrupted access. The Service may be unavailable during:
            </p>
            <ul>
              <li>Scheduled maintenance (communicated in advance)</li>
              <li>Emergency maintenance</li>
              <li>Force majeure events</li>
              <li>Third-party service outages</li>
            </ul>

            <h3>8.3 Data Backup</h3>
            <p>
              We perform regular automated backups of all platform data. However, you are responsible for maintaining your own backups
              of critical assessment reports and case notes.
            </p>

            <h2>9. Limitation of Liability</h2>

            <h3>9.1 Disclaimer of Warranties</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
            </p>

            <h3>9.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
            </p>
            <ul>
              <li>Indirect, incidental, consequential, or punitive damages</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Professional liability arising from your use of assessment tools</li>
              <li>Decisions made based on platform-generated recommendations</li>
            </ul>
            <p>
              Our total liability to you for any claims shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>

            <h3>9.3 Professional Responsibility</h3>
            <p>
              The Service provides tools and information to support your professional practice. Ultimate responsibility for clinical
              decisions, assessment interpretation, and intervention selection rests with you as the qualified professional.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless EdPsych Connect Limited from any claims, damages, or expenses arising from:
            </p>
            <ul>
              <li>Your violation of these Terms</li>
              <li>Your violation of applicable laws or professional standards</li>
              <li>Your use or misuse of the Service</li>
              <li>Infringement of third-party rights</li>
            </ul>

            <h2>11. Termination</h2>

            <h3>11.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by canceling your subscription. Upon termination, you may export your data
              within 30 days before it is permanently deleted.
            </p>

            <h3>11.2 Termination by Us</h3>
            <p>
              We may suspend or terminate your account immediately if you:
            </p>
            <ul>
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Fail to pay subscription fees</li>
              <li>Pose a security risk to the Service or other users</li>
              <li>Act in a manner inconsistent with professional standards</li>
            </ul>

            <h2>12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will provide notice of significant changes via email and platform notification.
              Continued use of the Service after changes take effect constitutes acceptance of the new Terms.
            </p>

            <h2>13. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes shall be resolved through:
            </p>
            <ul>
              <li>Good faith negotiation between parties</li>
              <li>Mediation (if negotiation fails)</li>
              <li>Exclusive jurisdiction of the courts of England and Wales</li>
            </ul>

            <h2>14. Miscellaneous</h2>

            <h3>14.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and EdPsych Connect Limited
              regarding use of the Service.
            </p>

            <h3>14.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
            </p>

            <h3>14.3 No Waiver</h3>
            <p>
              Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
            </p>

            <h3>14.4 Assignment</h3>
            <p>
              You may not assign or transfer your rights under these Terms. We may assign our rights and obligations without restriction.
            </p>

            <h2>15. Contact Information</h2>
            <p>For questions about these Terms:</p>
            <ul>
              <li><strong>Email:</strong> support@edpsychconnect.com</li>
              <li><strong>Address:</strong> EdPsych Connect Limited, [Address]</li>
              <li><strong>HCPC Registration:</strong> PYL042340 (Dr. Scott Ighavongbe-Patrick)</li>
            </ul>

            <div className="mt-12 p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
              <p className="text-sm text-slate-700">
                <strong>Important Notice:</strong> This platform is a professional tool designed to support evidence-based practice in educational psychology.
                Users must exercise professional judgment, maintain appropriate supervision arrangements, and ensure compliance with all relevant
                statutory frameworks including the SEND Code of Practice, Children Act 1989, and Equality Act 2010.
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Privacy Policy →
          </Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
